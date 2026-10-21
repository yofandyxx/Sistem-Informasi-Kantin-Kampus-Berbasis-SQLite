/**
 * transactionService.ts
 * ---------------------------------------------------------------
 * Lapisan transaksi penjualan.
 *
 * Alur penyimpanan transaksi (SEMUA berjalan dalam satu transaksi SQLite
 * sehingga bersifat atomik: berhasil bersama-sama atau dibatalkan seluruhnya):
 *   1. Periksa keranjang tidak kosong
 *   2. Validasi stok terbaru dari database
 *   3. Hitung ulang total memakai harga yang valid dari database
 *   4. Buat nomor transaksi unik
 *   5. Simpan transaksi utama (tabel transactions)
 *   6. Simpan detail item (tabel transaction_details)
 *   7. Kurangi stok menu yang dibeli (tabel menus)
 */

import { getDatabase, queryAll, queryFirst } from '../database/database';
import { calculateSubtotal } from '../utils/calculation';
import { nowSqlDateTime } from '../utils/dateUtils';
import { validateCart } from '../utils/validation';
import type { CartItem, PaymentMethod, Transaction, TransactionDetail, TransactionWithDetails } from '../types';

/** Data yang dibutuhkan untuk membuat transaksi baru */
export interface CreateTransactionInput {
  items: CartItem[];
  paymentMethod: PaymentMethod;
}

/**
 * Membuat nomor transaksi unik, contoh: TRX-20261021-0001
 * Menghitung jumlah transaksi pada hari yang sama lalu menambah 1.
 */
export const generateTransactionNumber = async (): Promise<string> => {
  const db = getDatabase();
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  const prefix = `TRX-${year}${month}${day}-`;

  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM transactions WHERE transaction_number LIKE ?',
    [`${prefix}%`],
  );

  const nextNumber = (row?.count ?? 0) + 1;
  return `${prefix}${`${nextNumber}`.padStart(4, '0')}`;
};

/**
 * Menyimpan transaksi penjualan + detail item + pengurangan stok.
 * Seluruhnya dibungkus `withTransactionAsync` (transaksi atomik).
 *
 * @returns id transaksi yang baru dibuat
 */
export const createTransaction = async (input: CreateTransactionInput): Promise<number> => {
  const db = getDatabase();
  const items = input.items ?? [];

  // Langkah 1: validasi keranjang (tidak boleh kosong, jumlah >= 1, stok cukup)
  if (items.length === 0) {
    throw new Error('Keranjang belanja masih kosong');
  }

  // Satu menu hanya boleh diproses satu kali. Selain mencegah detail ganda,
  // ini memastikan stok divalidasi terhadap total jumlah yang dibeli ketika
  // event UI menghasilkan item duplikat secara bersamaan.
  const mergedItems = Array.from(
    items.reduce((merged, item) => {
      const existing = merged.get(item.menuId);
      merged.set(item.menuId, existing
        ? { ...existing, quantity: existing.quantity + item.quantity }
        : { ...item });
      return merged;
    }, new Map<number, CartItem>()),
  ).map(([, item]) => item);

  const validation = validateCart(mergedItems);
  if (!validation.isValid) {
    throw new Error(validation.errors.cart ?? 'Data transaksi tidak valid');
  }

  let newTransactionId = 0;

  await db.withTransactionAsync(async () => {
    // Langkah 2: ambil data menu terbaru langsung dari database
    const menuIds = mergedItems.map((item) => item.menuId);
    const placeholders = menuIds.map(() => '?').join(', ');
    const menuRows = await db.getAllAsync<{
      id: number;
      name: string;
      price: number;
      stock: number;
      is_active: number;
    }>(
      `SELECT id, name, price, stock, is_active FROM menus WHERE id IN (${placeholders})`,
      menuIds,
    );

    // Langkah 3: validasi stok & hitung ulang subtotal memakai harga dari database
    let totalAmount = 0;
    const details: {
      menuId: number;
      menuName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of mergedItems) {
      const menu = menuRows.find((row) => row.id === item.menuId);

      if (!menu) {
        throw new Error(`Menu "${item.name}" tidak ditemukan`);
      }
      if (!menu.is_active) {
        throw new Error(`Menu "${menu.name}" sudah dinonaktifkan`);
      }
      if (menu.stock <= 0) {
        throw new Error(`Stok menu "${menu.name}" habis, tidak dapat dibeli`);
      }
      if (item.quantity < 1) {
        throw new Error(`Jumlah pembelian "${menu.name}" minimal 1`);
      }
      if (item.quantity > menu.stock) {
        throw new Error(
          `Stok menu "${menu.name}" tidak mencukupi (sisa ${menu.stock}, diminta ${item.quantity})`,
        );
      }

      // Harga satuan diambil dari database (bukan dari keranjang) agar akurat
      const unitPrice = menu.price;
      const subtotal = calculateSubtotal(unitPrice, item.quantity);
      totalAmount += subtotal;

      details.push({
        menuId: menu.id,
        menuName: menu.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    // Langkah 4: membuat nomor transaksi unik
    const transactionNumber = await generateTransactionNumber();

    // Langkah 5: menyimpan transaksi utama
    const transactionResult = await db.runAsync(
      `INSERT INTO transactions (transaction_number, transaction_date, total_amount, payment_method)
       VALUES (?, ?, ?, ?)`,
      [transactionNumber, nowSqlDateTime(), totalAmount, input.paymentMethod],
    );
    newTransactionId = transactionResult.lastInsertRowId;

    // Langkah 6: menyimpan detail item transaksi (snapshot nama & harga)
    for (const detail of details) {
      await db.runAsync(
        `INSERT INTO transaction_details
           (transaction_id, menu_id, menu_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          newTransactionId,
          detail.menuId,
          detail.menuName,
          detail.quantity,
          detail.unitPrice,
          detail.subtotal,
        ],
      );
    }

    // Langkah 7: mengurangi stok menu yang dibeli
    for (const detail of details) {
      await db.runAsync('UPDATE menus SET stock = stock - ? WHERE id = ?', [
        detail.quantity,
        detail.menuId,
      ]);
    }
  });

  return newTransactionId;
};

/**
 * Mengambil daftar transaksi (riwayat) dengan filter tanggal / bulan.
 */
export const getTransactions = async (
  filter: { date?: string | null; month?: string | null; limit?: number } = {},
): Promise<Transaction[]> => {
  const conditions: string[] = [];
  const params: (string | number | null)[] = [];

  if (filter.date) {
    conditions.push('transaction_date LIKE ?');
    params.push(`${filter.date}%`);
  } else if (filter.month) {
    conditions.push('transaction_date LIKE ?');
    params.push(`${filter.month}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filter.limit && filter.limit > 0 ? filter.limit : 200;

  return queryAll<Transaction>(
    `SELECT id, transaction_number, transaction_date, total_amount, payment_method
     FROM transactions
     ${whereClause}
     ORDER BY transaction_date DESC, id DESC
     LIMIT ?`,
    [...params, limit],
  );
};

/** Mengambil detail item sebuah transaksi */
export const getTransactionDetails = async (transactionId: number): Promise<TransactionDetail[]> => {
  return queryAll<TransactionDetail>(
    `SELECT id, transaction_id, menu_id, menu_name, quantity, unit_price, subtotal
     FROM transaction_details
     WHERE transaction_id = ?
     ORDER BY id ASC`,
    [transactionId],
  );
};

/** Mengambil satu transaksi beserta seluruh detail itemnya (untuk struk) */
export const getTransactionWithDetails = async (
  transactionId: number,
): Promise<TransactionWithDetails | null> => {
  const transaction = await queryFirst<Transaction>(
    `SELECT id, transaction_number, transaction_date, total_amount, payment_method
     FROM transactions
     WHERE id = ?`,
    [transactionId],
  );

  if (!transaction) return null;

  const details = await getTransactionDetails(transactionId);
  return { ...transaction, details };
};

/** Mengambil transaksi terbaru (untuk dashboard) */
export const getRecentTransactions = async (limit = 5): Promise<Transaction[]> => {
  return queryAll<Transaction>(
    `SELECT id, transaction_number, transaction_date, total_amount, payment_method
     FROM transactions
     ORDER BY transaction_date DESC, id DESC
     LIMIT ?`,
    [limit],
  );
};

/** Menghitung total transaksi */
export const countTransactions = async (): Promise<number> => {
  const row = await queryFirst<{ count: number }>('SELECT COUNT(*) AS count FROM transactions');
  return row?.count ?? 0;
};

/** Menghitung total pendapatan seluruh transaksi */
export const getTotalRevenue = async (): Promise<number> => {
  const row = await queryFirst<{ total: number }>(
    'SELECT COALESCE(SUM(total_amount), 0) AS total FROM transactions',
  );
  return row?.total ?? 0;
};
