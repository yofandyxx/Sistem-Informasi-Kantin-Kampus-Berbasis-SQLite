/**
 * schema.ts
 * ---------------------------------------------------------------
 * Berisi definisi skema database SQLite untuk PPNP Canteen.
 *
 * Batasan desain: maksimal 4 tabel utama
 *   1. categories           -> master kategori makanan & minuman
 *   2. menus                -> master menu (harga, stok, kategori)
 *   3. transactions         -> header transaksi penjualan
 *   4. transaction_details  -> detail item tiap transaksi (snapshot)
 *
 * Relasi:
 *   categories (1) --- (N) menus            lewat menus.category_id
 *   transactions (1) --- (N) transaction_details lewat transaction_details.transaction_id
 *   menus (1) --- (N) transaction_details  lewat transaction_details.menu_id
 *
 * Kebijakan penghapusan:
 *   - Kategori yang masih dipakai menu  -> ON DELETE RESTRICT (dilarang dihapus)
 *   - Menu yang sudah pernah terjual    -> tidak dihapus fisik,Instead di-nonaktifkan (is_active = 0)
 *   - Detail transaksi                  -> ON DELETE CASCADE (hapus transaksi = hapus detail)
 */

/** Nama file database (disimpan di storage internal aplikasi) */
export const DATABASE_NAME = 'ppnp_canteen.db';

/** Mengaktifkan foreign key agar relasi antar tabel dijaga oleh SQLite */
export const PRAGMA_FOREIGN_KEYS = 'PRAGMA foreign_keys = ON;';

/**
 * Perintah DDL (Data Definition Language).
 * "IF NOT EXISTS" membuat perintah ini aman dijalankan berulang kali.
 */
export const CREATE_TABLES_SQL = `
-- 1. Tabel kategori
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL COLLATE NOCASE UNIQUE,
  icon        TEXT NOT NULL DEFAULT 'restaurant-outline',
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 2. Tabel menu (harga & stok disimpan sebagai bilangan bulat Rupiah)
CREATE TABLE IF NOT EXISTS menus (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name        TEXT NOT NULL COLLATE NOCASE,
  price       INTEGER NOT NULL CHECK (price > 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  icon        TEXT NOT NULL DEFAULT 'restaurant-outline',
  is_active   INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- 3. Tabel transaksi (header)
CREATE TABLE IF NOT EXISTS transactions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_number TEXT NOT NULL UNIQUE,
  transaction_date  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  total_amount      INTEGER NOT NULL CHECK (total_amount >= 0),
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('TUNAI', 'QRIS'))
);

-- 4. Tabel detail transaksi (snapshot nama & harga saat transaksi dibuat)
CREATE TABLE IF NOT EXISTS transaction_details (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL,
  menu_id        INTEGER NOT NULL,
  menu_name      TEXT NOT NULL,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  unit_price     INTEGER NOT NULL CHECK (unit_price >= 0),
  subtotal       INTEGER NOT NULL CHECK (subtotal >= 0),
  FOREIGN KEY (transaction_id) REFERENCES transactions (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);
`;

/** Query/index pendukung untuk mempercepat query JOIN, filter, dan rekap */
export const CREATE_INDEXES_SQL = `
-- Nama menu unik per kategori (hanya untuk menu yang masih aktif)
CREATE UNIQUE INDEX IF NOT EXISTS idx_menus_category_name
  ON menus (category_id, name COLLATE NOCASE)
  WHERE is_active = 1;

CREATE INDEX IF NOT EXISTS idx_menus_category ON menus (category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_details_transaction ON transaction_details (transaction_id);
CREATE INDEX IF NOT EXISTS idx_details_menu ON transaction_details (menu_id);
`;

/** Query untuk memeriksa apakah sebuah menu pernah dipakai pada transaksi */
export const CHECK_MENU_USED_SQL = `
  SELECT COUNT(*) AS used_count
  FROM transaction_details
  WHERE menu_id = ?
`;

/** Query untuk memeriksa apakah sebuah kategori masih dipakai menu */
export const CHECK_CATEGORY_USED_SQL = `
  SELECT COUNT(*) AS used_count
  FROM menus
  WHERE category_id = ?
`;

/** Query rekap penjualan per menu terlaris */
export const TOP_MENUS_SQL = `
  SELECT
    td.menu_id        AS menu_id,
    td.menu_name      AS menu_name,
    SUM(td.quantity)  AS total_quantity,
    SUM(td.subtotal)  AS total_subtotal
  FROM transaction_details td
  INNER JOIN transactions t ON t.id = td.transaction_id
  WHERE t.transaction_date >= ? AND t.transaction_date <= ?
  GROUP BY td.menu_id, td.menu_name
  ORDER BY total_quantity DESC, total_subtotal DESC
  LIMIT ?
`;

/** Query rekap penjualan harian (untuk grafik batang) */
export const DAILY_SALES_SQL = `
  SELECT
    substr(t.transaction_date, 1, 10) AS sale_date,
    COUNT(t.id)                      AS transaction_count,
    COALESCE(SUM(t.total_amount), 0) AS total_amount
  FROM transactions t
  WHERE t.transaction_date >= ? AND t.transaction_date <= ?
  GROUP BY sale_date
  ORDER BY sale_date ASC
`;

/** Query total item terjual pada periode tertentu */
export const TOTAL_ITEMS_SOLD_SQL = `
  SELECT COALESCE(SUM(td.quantity), 0) AS total_items
  FROM transaction_details td
  INNER JOIN transactions t ON t.id = td.transaction_id
  WHERE t.transaction_date >= ? AND t.transaction_date <= ?
`;

/** Query rekap penjualan per bulan (12 bulan terakhir) */
export const MONTHLY_SALES_SQL = `
  SELECT
    substr(t.transaction_date, 1, 7) AS sale_month,
    COUNT(t.id)                       AS transaction_count,
    COALESCE(SUM(t.total_amount), 0)  AS total_amount
  FROM transactions t
  WHERE t.transaction_date >= ? AND t.transaction_date <= ?
  GROUP BY sale_month
  ORDER BY sale_month ASC
`;
