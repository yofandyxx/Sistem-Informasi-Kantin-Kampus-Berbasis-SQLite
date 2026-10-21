/**
 * calculation.ts
 * ---------------------------------------------------------------
 * Berisi rumus-rumus perhitungan aplikasi PPNP Canteen.
 *
 * Rumus utama:
 *   Subtotal item   = Harga Satuan x Jumlah
 *   Total Pembayaran = jumlah seluruh subtotal item
 *
 * Semua perhitungan memakai bilangan bulat (integer) agar tidak terjadi
 * kesalahan pembulatan floating point.
 */

import { LOW_STOCK_THRESHOLD } from '../constants/appConstants';
import type { CartItem, StockStatus } from '../types';

/**
 * Menghitung subtotal satu item: harga satuan x jumlah.
 */
export const calculateSubtotal = (unitPrice: number, quantity: number): number => {
  const price = Number.isFinite(unitPrice) ? Math.round(unitPrice) : 0;
  const qty = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
  return price * qty;
};

/**
 * Menghitung total pembayaran dari seluruh item keranjang.
 */
export const calculateCartTotal = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.subtotal, 0);

/**
 * Menghitung total jumlah item yang dibeli (dihitung dari quantity).
 */
export const calculateTotalQuantity = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0);

/**
 * Menghitung total item terjual dari daftar item transaksi.
 */
export const calculateItemsSold = (
  items: { quantity: number }[] | { quantity: number | null }[],
): number =>
  items.reduce((total, item) => total + (item.quantity ?? 0), 0);

/**
 * Menentukan status stok sebuah menu:
 *  - 0 / kurang dari 0 => HABIS
 *  - <= LOW_STOCK_THRESHOLD => MENIPIS
 *  - selebihnya => TERSEDIA
 */
export const getStockStatus = (
  stock: number,
  threshold: number = LOW_STOCK_THRESHOLD,
): StockStatus => {
  if (!Number.isFinite(stock) || stock <= 0) return 'HABIS';
  if (stock <= threshold) return 'MENIPIS';
  return 'TERSEDIA';
};

/**
 * Menghitung persentase stok terpakai (untuk indikator visual).
 */
export const getStockPercentage = (stock: number, maximum = 50): number => {
  if (maximum <= 0) return 0;
  const percentage = (stock / maximum) * 100;
  return Math.max(0, Math.min(100, Math.round(percentage)));
};

/**
 * Menghitung rata-rata nilai per transaksi.
 */
export const calculateAverage = (total: number, count: number): number => {
  if (count <= 0) return 0;
  return Math.round(total / count);
};
