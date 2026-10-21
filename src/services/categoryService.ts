/**
 * categoryService.ts
 * ---------------------------------------------------------------
 * Lapisan CRUD untuk tabel `categories`.
 *
 * Prinsip:
 *   - Semua query SQL memakai parameter (prepared statement) -> aman dari SQL Injection.
 *   - Validasi duplikat dilakukan di lapisan aplikasi (case-insensitive) dan
 *     diperkuat oleh constraint UNIQUE di level database.
 *   - Kategori yang masih dipakai menu tidak boleh dihapus.
 */

import { execute, queryAll, queryFirst } from '../database/database';
import { CHECK_CATEGORY_USED_SQL } from '../database/schema';
import type { Category, CategoryFormData } from '../types';

/**
 * Mengambil seluruh kategori beserta jumlah menu di dalamnya.
 * Query ini memakai JOIN (LEFT JOIN) agar kategori tanpa menu tetap tampil.
 */
export const getCategories = async (): Promise<Category[]> => {
  return queryAll<Category>(
    `SELECT
        c.id,
        c.name,
        c.icon,
        c.description,
        c.created_at,
        COUNT(m.id) AS menuCount
     FROM categories c
     LEFT JOIN menus m ON m.category_id = c.id AND m.is_active = 1
     GROUP BY c.id
     ORDER BY c.name COLLATE NOCASE ASC`,
  );
};

/** Mengambil satu kategori berdasarkan id */
export const getCategoryById = async (id: number): Promise<Category | null> => {
  return queryFirst<Category>(
    'SELECT id, name, icon, description, created_at FROM categories WHERE id = ?',
    [id],
  );
};

/** Mengambil nama seluruh kategori (untuk pengecekan duplikat) */
export const getCategoryNames = async (): Promise<string[]> => {
  const rows = await queryAll<{ name: string }>('SELECT name FROM categories');
  return rows.map((row) => row.name);
};

/** Menghitung jumlah menu yang memakai sebuah kategori */
export const getCategoryMenuCount = async (categoryId: number): Promise<number> => {
  const row = await queryFirst<{ used_count: number }>(CHECK_CATEGORY_USED_SQL, [categoryId]);
  return row?.used_count ?? 0;
};

/**
 * Menambah kategori baru.
 * @throws Error apabila nama kategori kosong atau duplikat.
 */
export const createCategory = async (data: CategoryFormData): Promise<number> => {
  const name = data.name.trim();
  if (!name) {
    throw new Error('Nama kategori wajib diisi');
  }

  const existing = await queryFirst<{ id: number }>(
    'SELECT id FROM categories WHERE name = ? COLLATE NOCASE',
    [name],
  );
  if (existing) {
    throw new Error(`Kategori "${name}" sudah ada, gunakan nama lain`);
  }

  const result = await execute(
    'INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)',
    [name, data.icon, data.description.trim() ? data.description.trim() : null],
  );

  return result.lastInsertRowId;
};

/**
 * Mengubah data kategori.
 * @throws Error apabila nama kategori kosong atau duplikat dengan kategori lain.
 */
export const updateCategory = async (id: number, data: CategoryFormData): Promise<void> => {
  const name = data.name.trim();
  if (!name) {
    throw new Error('Nama kategori wajib diisi');
  }

  const duplicated = await queryFirst<{ id: number }>(
    'SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND id <> ?',
    [name, id],
  );
  if (duplicated) {
    throw new Error(`Kategori "${name}" sudah ada, gunakan nama lain`);
  }

  await execute('UPDATE categories SET name = ?, icon = ?, description = ? WHERE id = ?', [
    name,
    data.icon,
    data.description.trim() ? data.description.trim() : null,
    id,
  ]);
};

/**
 * Menghapus kategori.
 * Kategori yang masih dipakai menu akan ditolak (relasi dijaga oleh database).
 */
export const deleteCategory = async (id: number): Promise<void> => {
  const menuCount = await getCategoryMenuCount(id);
  if (menuCount > 0) {
    throw new Error(
      `Kategori masih digunakan oleh ${menuCount} menu. Pindahkan atau hapus menu tersebut terlebih dahulu.`,
    );
  }

  const result = await execute('DELETE FROM categories WHERE id = ?', [id]);
  if (result.changes === 0) {
    throw new Error('Kategori tidak ditemukan');
  }
};

/** Menghitung total kategori */
export const countCategories = async (): Promise<number> => {
  const row = await queryFirst<{ count: number }>('SELECT COUNT(*) AS count FROM categories');
  return row?.count ?? 0;
};
