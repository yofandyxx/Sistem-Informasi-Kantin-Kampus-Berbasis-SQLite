/**
 * database.ts
 * ---------------------------------------------------------------
 * Mengatur koneksi database SQLite untuk PPNP Canteen.
 *
 * Tahapan inisialisasi (dipanggil sekali saat aplikasi dibuka):
 *   1. Membuka koneksi ke file database (openDatabaseAsync)
 *   2. Mengaktifkan foreign key (PRAGMA foreign_keys = ON)
 *   3. Membuat tabel & index apabila belum tersedia
 *   4. Memeriksa kesiapan database
 *   5. Mengisi data contoh awal (hanya pada database yang baru dibuat)
 */

import * as SQLite from 'expo-sqlite';

import { SEED_CATEGORIES, SEED_MENUS } from '../constants/appConstants';
import {
  CREATE_INDEXES_SQL,
  CREATE_TABLES_SQL,
  DATABASE_NAME,
  PRAGMA_FOREIGN_KEYS,
} from './schema';

/** Objek koneksi database (disimpan global agar hanya ada 1 koneksi) */
let database: SQLite.SQLiteDatabase | null = null;

/** Menandai bahwa proses inisialisasi sedang berjalan (mencegah dobel inisialisasi) */
let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Inisialisasi database.
 * Aman dipanggil berkali-kali: jika sudah ada koneksi, koneksi tersebut dikembalikan.
 */
export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // 1. Kalau koneksi sudah siap, langsung pakai (cegah inisialisasi ganda)
  if (database) return database;

  // 2. Kalau sedang diinisialisasi, tunggu proses yang sama (tidak membuka koneksi ganda)
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    // Langkah 1: membuka koneksi ke file database
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    // Langkah 2: mengaktifkan foreign key
    await db.execAsync(PRAGMA_FOREIGN_KEYS);

    // Langkah 3: membuat tabel dan index (aman dijalankan berulang kali)
    await db.execAsync(CREATE_TABLES_SQL);
    await db.execAsync(CREATE_INDEXES_SQL);

    // Langkah 4: memeriksa kesiapan database
    const ready = await checkDatabaseReady(db);
    if (!ready) {
      throw new Error('Database gagal disiapkan: tabel utama tidak ditemukan');
    }

    // Langkah 5: mengisi data contoh awal (hanya jika tabel masih kosong)
    await seedInitialData(db);

    database = db;
    return db;
  })();

  try {
    return await initializationPromise;
  } catch (error) {
    // Bila gagal, izinkan percobaan inisialisasi berikutnya
    initializationPromise = null;
    throw error;
  }
};

/**
 * Memeriksa apakah tabel-tabel utama sudah tersedia di database.
 */
const checkDatabaseReady = async (db: SQLite.SQLiteDatabase): Promise<boolean> => {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count
       FROM sqlite_master
      WHERE type = 'table'
        AND name IN ('categories', 'menus', 'transactions', 'transaction_details')`,
  );
  return (row?.count ?? 0) === 4;
};

/**
 * Mengisi data contoh awal (kategori + menu) bila database masih kosong.
 * Data contoh membantu mahasiswa langsung mencoba transaksi penjualan.
 */
const seedInitialData = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  const categoryRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM categories',
  );

  if ((categoryRow?.count ?? 0) > 0) {
    // Database sudah berisi data -> tidak perlu diisi lagi
    return;
  }

  await db.withTransactionAsync(async () => {
    // Simpan kategori terlebih dahulu (menus membutuhkan category_id)
    for (const category of SEED_CATEGORIES) {
      await db.runAsync(
        'INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)',
        [category.name, category.icon, category.description],
      );
    }

    // Ambil id setiap kategori untuk وعلkan menu ke kategorinya
    const categories = await db.getAllAsync<{ id: number; name: string }>(
      'SELECT id, name FROM categories',
    );

    for (const menu of SEED_MENUS) {
      const parent = categories.find((item) => item.name === menu.categoryName);
      if (!parent) continue;
      await db.runAsync(
        'INSERT INTO menus (category_id, name, price, stock, icon, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [parent.id, menu.name, menu.price, menu.stock, menu.icon],
      );
    }
  });
};

/**
 * Mengambil objek koneksi database.
 * Melempar error apabila database belum diinisialisasi.
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!database) {
    throw new Error('Database belum diinisialisasi. Panggil initializeDatabase() terlebih dahulu.');
  }
  return database;
};

/** Cek apakah koneksi database sudah siap */
export const isDatabaseReady = (): boolean => database !== null;

/** Menutup koneksi database (dipakai saat aplikasi akan ditutup / reset) */
export const closeDatabase = async (): Promise<void> => {
  if (database) {
    await database.closeAsync();
    database = null;
    initializationPromise = null;
  }
};

/* ==========================================================
 * Helper query (dipakai oleh seluruh service)
 * ========================================================== */

/** Menjalankan query yang mengembalikan banyak baris */
export const queryAll = async <T>(sql: string, params: (string | number | null)[] = []): Promise<T[]> => {
  const db = getDatabase();
  return db.getAllAsync<T>(sql, params);
};

/** Menjalankan query yang mengembalikan satu baris (atau null) */
export const queryFirst = async <T>(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<T | null> => {
  const db = getDatabase();
  return db.getFirstAsync<T>(sql, params);
};

/** Menjalankan query INSERT / UPDATE / DELETE */
export const execute = async (
  sql: string,
  params: (string | number | null)[] = [],
): Promise<{ lastInsertRowId: number; changes: number }> => {
  const db = getDatabase();
  const result = await db.runAsync(sql, params);
  return {
    lastInsertRowId: result.lastInsertRowId,
    changes: result.changes,
  };
};

/**
 * Menghapus seluruh data (dipakai dari halaman Profil untuk pengujian ulang).
 * Data contoh akan dibuat ulang setelah data dihapus.
 */
export const resetAllData = async (): Promise<void> => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM transaction_details;');
    await db.execAsync('DELETE FROM transactions;');
    await db.execAsync('DELETE FROM menus;');
    await db.execAsync('DELETE FROM categories;');
  });
  await seedInitialData(db);
};
