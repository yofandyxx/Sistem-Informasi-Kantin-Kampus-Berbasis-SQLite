/**
 * appConstants.ts
 * ---------------------------------------------------------------
 * Berisi konstanta bisnis aplikasi PPNP Canteen:
 * identitas aplikasi, metode pembayaran, daftar ikon bawaan (offline),
 * ambang batas stok menipis, dan data contoh awal.
 */

import { COLORS } from './theme';

/** Identitas aplikasi (dipakai di header, struk, dan halaman profil) */
export const APP_INFO = {
  projectName: 'PPNPCanteen',
  appName: 'PPNP Canteen',
  description: 'Sistem Informasi Kantin Kampus',
  canteenName: 'Kantin PPNP',
  campusName: 'Kampus PPNP',
  tagline: 'Kelola menu, transaksi, dan stok kantin kampus dalam satu aplikasi.',
  version: '1.0.0',
  author: 'Program Studi Teknologi Rekayasa Komputer',
  course: 'Workshop Pemrograman Mobile',
} as const;

/** Metode pembayaran yang didukung (simulasi pencatatan, tanpa payment gateway) */
export const PAYMENT_METHODS = [
  { key: 'TUNAI', label: 'Tunai', icon: 'cash-outline' as const, color: COLORS.success },
  { key: 'QRIS', label: 'QRIS / E-Wallet', icon: 'qr-code-outline' as const, color: COLORS.purple },
] as const;

/** Label metode pembayaran (untuk ditampilkan pada struk & riwayat) */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  TUNAI: 'Tunai',
  QRIS: 'QRIS / E-Wallet',
};

/** Ikon bawaan (Ionicons) untuk kategori - seluruhnya offline */
export const CATEGORY_ICON_OPTIONS: { name: string; icon: string }[] = [
  { name: 'fast-food', icon: 'fast-food-outline' },
  { name: 'pizza', icon: 'pizza-outline' },
  { name: 'fish', icon: 'fish-outline' },
  { name: 'cafe', icon: 'cafe-outline' },
  { name: 'beer', icon: 'beer-outline' },
  { name: 'nutrition', icon: 'nutrition-outline' },
  { name: 'ice-cream', icon: 'ice-cream-outline' },
  { name: 'restaurant', icon: 'restaurant-outline' },
];

/** Ikon bawaan (Ionicons) untuk menu - seluruhnya offline */
export const MENU_ICON_OPTIONS: { name: string; icon: string }[] = [
  { name: 'restaurant', icon: 'restaurant-outline' },
  { name: 'fast-food', icon: 'fast-food-outline' },
  { name: 'pizza', icon: 'pizza-outline' },
  { name: 'cafe', icon: 'cafe-outline' },
  { name: 'beer', icon: 'beer-outline' },
  { name: 'wine', icon: 'wine-outline' },
  { name: 'ice-cream', icon: 'ice-cream-outline' },
  { name: 'nutrition', icon: 'nutrition-outline' },
  { name: 'fish', icon: 'fish-outline' },
  { name: 'water', icon: 'water-outline' },
];

/** Batas minimal agar sebuah menu dianggap "Tersedia" */
export const STOCK_AVAILABLE = 'TERSEDIA';

/** Batas stok <= nilai ini dianggap "Menipis" */
export const LOW_STOCK_THRESHOLD = 5;

/** Label status stok */
export const STOCK_STATUS_LABEL = {
  TERSEDIA: 'Tersedia',
  MENIPIS: 'Menipis',
  HABIS: 'Habis',
} as const;

/** Data contoh awal (dipanggil satu kali saat database pertama dibuat) */
export const SEED_CATEGORIES = [
  { name: 'Makanan Berat', icon: 'restaurant-outline', description: 'Menu utama dengan nasi atau mie' },
  { name: 'Makanan Ringan', icon: 'fast-food-outline', description: 'Camilan ringan dan gorengan' },
  { name: 'Minuman', icon: 'cafe-outline', description: 'Minuman dingin dan panas' },
];

export const SEED_MENUS = [
  { categoryName: 'Makanan Berat', name: 'Nasi Goreng', price: 15000, stock: 20, icon: 'restaurant-outline' },
  { categoryName: 'Makanan Berat', name: 'Mie Ayam', price: 12000, stock: 15, icon: 'fast-food-outline' },
  { categoryName: 'Makanan Berat', name: 'Ayam Geprek', price: 18000, stock: 10, icon: 'nutrition-outline' },
  { categoryName: 'Makanan Ringan', name: 'Kentang Goreng', price: 10000, stock: 12, icon: 'pizza-outline' },
  { categoryName: 'Makanan Ringan', name: 'Risoles Mayo', price: 8000, stock: 8, icon: 'ice-cream-outline' },
  { categoryName: 'Minuman', name: 'Es Teh', price: 5000, stock: 50, icon: 'cafe-outline' },
  { categoryName: 'Minuman', name: 'Es Jeruk', price: 6000, stock: 30, icon: 'wine-outline' },
  { categoryName: 'Minuman', name: 'Kopi Susu', price: 7000, stock: 25, icon: 'beer-outline' },
];
