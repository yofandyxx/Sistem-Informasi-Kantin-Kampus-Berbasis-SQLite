/**
 * menuService.ts
 * ---------------------------------------------------------------
 * Lapisan CRUD untuk tabel `menus` (data menu, harga, dan stok).
 *
 * Catatan penting:
 *   - Nama menu harus unik di dalam kategori yang sama (dicek di sini dan
 *     dijamin oleh unique index `idx_menus_category_name`).
 *   - Menu yang sudah pernah dipakai di transaksi TIDAK dihapus fisik,
 *     melainkan dinonaktifkan (is_active = 0) agar riwayat penjualan tetap utuh.
 */

import { execute, queryAll, queryFirst } from '../database/database';
import { CHECK_MENU_USED_SQL } from '../database/schema';
import { LOW_STOCK_THRESHOLD } from '../constants/appConstants';
import type { Menu, MenuFilter, MenuFormData } from '../types';

/** Mengescape karakter khusus SQL LIKE agar pencarian tidak salahWildcard */
const escapeLike = (value: string): string =>
  value.replace(/[\\%_]/g, (character) => `\\${character}`);

/**
 * Mengambil daftar menu dengan filter pencarian & kategori.
 * Query ini memakai INNER JOIN categories untuk menampilkan nama kategori.
 */
export const getMenus = async (filter: MenuFilter = {}): Promise<Menu[]> => {
  const conditions: string[] = [];
  const params: (string | number | null)[] = [];

  if (!filter.includeInactive) {
    conditions.push('m.is_active = 1');
  }

  const search = filter.search?.trim();
  if (search) {
    conditions.push("(m.name LIKE ? ESCAPE '\\' OR c.name LIKE ? ESCAPE '\\')");
    const keyword = `%${escapeLike(search)}%`;
    params.push(keyword, keyword);
  }

  if (filter.categoryId !== undefined && filter.categoryId !== null) {
    conditions.push('m.category_id = ?');
    params.push(filter.categoryId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return queryAll<Menu>(
    `SELECT
        m.id,
        m.category_id,
        m.name,
        m.price,
        m.stock,
        m.icon,
        m.is_active,
        m.created_at,
        c.name  AS category_name,
        c.icon  AS category_icon
     FROM menus m
     INNER JOIN categories c ON c.id = m.category_id
     ${whereClause}
     ORDER BY c.name COLLATE NOCASE ASC, m.name COLLATE NOCASE ASC`,
    params,
  );
};

/** Mengambil satu menu berdasarkan id */
export const getMenuById = async (id: number): Promise<Menu | null> => {
  return queryFirst<Menu>(
    `SELECT
        m.id,
        m.category_id,
        m.name,
        m.price,
        m.stock,
        m.icon,
        m.is_active,
        m.created_at,
        c.name AS category_name,
        c.icon AS category_icon
     FROM menus m
     INNER JOIN categories c ON c.id = m.category_id
     WHERE m.id = ?`,
    [id],
  );
};

/**
 * Menu yang boleh dibeli pada halaman transaksi:
 * hanya menu aktif dan stoknya lebih dari 0.
 */
export const getPurchasableMenus = async (): Promise<Menu[]> => {
  return queryAll<Menu>(
    `SELECT
        m.id,
        m.category_id,
        m.name,
        m.price,
        m.stock,
        m.icon,
        m.is_active,
        m.created_at,
        c.name AS category_name,
        c.icon AS category_icon
     FROM menus m
     INNER JOIN categories c ON c.id = m.category_id
     WHERE m.is_active = 1 AND m.stock > 0
     ORDER BY c.name COLLATE NOCASE ASC, m.name COLLATE NOCASE ASC`,
  );
};

/** Mengambil nama menu pada sebuah kategori (cek duplikat) */
export const getMenuNamesByCategory = async (categoryId: number): Promise<string[]> => {
  const rows = await queryAll<{ name: string }>(
    'SELECT name FROM menus WHERE category_id = ? AND is_active = 1',
    [categoryId],
  );
  return rows.map((row) => row.name);
};

/**
 * Menambah menu baru.
 * @throws Error apabila data tidak valid / nama duplikat dalam kategori yang sama.
 */
export const createMenu = async (data: MenuFormData): Promise<number> => {
  const name = data.name.trim();
  const categoryId = data.category_id;
  const price = parseInt(data.price.replace(/[^0-9]/g, ''), 10);
  const stock = parseInt(data.stock.replace(/[^0-9]/g, ''), 10) || 0;

  if (!name) throw new Error('Nama menu wajib diisi');
  if (!categoryId) throw new Error('Kategori wajib dipilih');
  if (!Number.isFinite(price) || price <= 0) throw new Error('Harga harus lebih besar dari nol');
  if (!Number.isFinite(stock) || stock < 0) throw new Error('Stok tidak boleh negatif');

  const duplicated = await queryFirst<{ id: number }>(
    'SELECT id FROM menus WHERE category_id = ? AND name = ? COLLATE NOCASE AND is_active = 1',
    [categoryId, name],
  );
  if (duplicated) {
    throw new Error(`Menu "${name}" sudah ada pada kategori ini`);
  }

  const result = await execute(
    'INSERT INTO menus (category_id, name, price, stock, icon, is_active) VALUES (?, ?, ?, ?, ?, 1)',
    [categoryId, name, price, stock, data.icon],
  );

  return result.lastInsertRowId;
};

/**
 * Mengubah data menu (nama, kategori, harga, stok, ikon).
 */
export const updateMenu = async (id: number, data: MenuFormData): Promise<void> => {
  const name = data.name.trim();
  const categoryId = data.category_id;
  const price = parseInt(data.price.replace(/[^0-9]/g, ''), 10);
  const stock = parseInt(data.stock.replace(/[^0-9]/g, ''), 10) || 0;

  if (!name) throw new Error('Nama menu wajib diisi');
  if (!categoryId) throw new Error('Kategori wajib dipilih');
  if (!Number.isFinite(price) || price <= 0) throw new Error('Harga harus lebih besar dari nol');
  if (!Number.isFinite(stock) || stock < 0) throw new Error('Stok tidak boleh negatif');

  const duplicated = await queryFirst<{ id: number }>(
    `SELECT id FROM menus
      WHERE category_id = ? AND name = ? COLLATE NOCASE AND is_active = 1 AND id <> ?`,
    [categoryId, name, id],
  );
  if (duplicated) {
    throw new Error(`Menu "${name}" sudah ada pada kategori ini`);
  }

  await execute(
    'UPDATE menus SET category_id = ?, name = ?, price = ?, stock = ?, icon = ? WHERE id = ?',
    [categoryId, name, price, stock, data.icon, id],
  );
};

/**
 * Menghapus menu.
 * @returns 'hard' bila menu dihapus fisik, 'soft' bila menu dinonaktifkan.
 */
export const deleteMenu = async (id: number): Promise<'hard' | 'soft'> => {
  const used = await queryFirst<{ used_count: number }>(CHECK_MENU_USED_SQL, [id]);
  const usedCount = used?.used_count ?? 0;

  if (usedCount > 0) {
    // Menu sudah pernah terjual -> nonaktifkan agar riwayat transaksi tetap valid
    await execute('UPDATE menus SET is_active = 0 WHERE id = ?', [id]);
    return 'soft';
  }

  const result = await execute('DELETE FROM menus WHERE id = ?', [id]);
  if (result.changes === 0) {
    throw new Error('Menu tidak ditemukan');
  }
  return 'hard';
};

/** Mengaktifkan kembali menu yang sebelumnya dinonaktifkan */
export const restoreMenu = async (id: number): Promise<void> => {
  await execute('UPDATE menus SET is_active = 1 WHERE id = ?', [id]);
};

/** Menghitung total menu aktif */
export const countMenus = async (): Promise<number> => {
  const row = await queryFirst<{ count: number }>(
    'SELECT COUNT(*) AS count FROM menus WHERE is_active = 1',
  );
  return row?.count ?? 0;
};

/** Menghitung menu dengan stok menipis (aktif) */
export const countLowStockMenus = async (): Promise<number> => {
  const row = await queryFirst<{ count: number }>(
    'SELECT COUNT(*) AS count FROM menus WHERE is_active = 1 AND stock > 0 AND stock <= ?',
    [LOW_STOCK_THRESHOLD],
  );
  return row?.count ?? 0;
};

/** Menghitung menu dengan stok habis (aktif) */
export const countOutOfStockMenus = async (): Promise<number> => {
  const row = await queryFirst<{ count: number }>(
    'SELECT COUNT(*) AS count FROM menus WHERE is_active = 1 AND stock <= 0',
  );
  return row?.count ?? 0;
};
