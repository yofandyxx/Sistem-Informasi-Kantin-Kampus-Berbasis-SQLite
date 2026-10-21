/**
 * types/index.ts
 * ---------------------------------------------------------------
 * Berisi seluruh definisi tipe data (TypeScript) yang dipakai aplikasi.
 * Dengan memisahkan tipe ke satu file,mahasiswa lebih mudah memahami
 * "bentuk data" pada setiap tabel dan pada setiap layar aplikasi.
 */

import type { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Nama ikon yang valid dari @expo/vector-icons (Ionicons) */
export type IconName = keyof typeof Ionicons.glyphMap;

/* ==========================================================
 * 1. ENTITAS DATABASE (mirror tabel SQLite)
 * ========================================================== */

/** Tabel: categories */
export interface Category {
  id: number;
  name: string;
  icon: string;
  description: string | null;
  created_at: string;
  /** Tambahan hasil JOIN: jumlah menu pada kategori ini */
  menuCount?: number;
}

/** Tabel: menus */
export interface Menu {
  id: number;
  category_id: number;
  name: string;
  price: number;
  stock: number;
  icon: string;
  /** 1 = aktif (bisa dijual), 0 = nonaktif (sudah pernah terjual) */
  is_active: number;
  created_at: string;
  /** Tambahan hasil JOIN: nama kategori */
  category_name?: string;
  /** Tambahan hasil JOIN: ikon kategori */
  category_icon?: string;
}

/** Tabel: transactions */
export interface Transaction {
  id: number;
  transaction_number: string;
  transaction_date: string;
  total_amount: number;
  payment_method: string;
}

/** Tabel: transaction_details */
export interface TransactionDetail {
  id: number;
  transaction_id: number;
  menu_id: number;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

/** Transaksi lengkap dengan detail itemnya (untuk struk) */
export interface TransactionWithDetails extends Transaction {
  details: TransactionDetail[];
}

/* ==========================================================
 * 2. TIPE APLIKASI (bukan dari database)
 * ========================================================== */

/** Metode pembayaran yang tersedia */
export type PaymentMethod = 'TUNAI' | 'QRIS';

/** Status stok sebuah menu */
export type StockStatus = 'TERSEDIA' | 'MENIPIS' | 'HABIS';

/** Item pada keranjang belanja */
export interface CartItem {
  menuId: number;
  name: string;
  price: number;
  stock: number;
  icon: string;
  quantity: number;
  subtotal: number;
}

/** Data formulir kategori */
export interface CategoryFormData {
  name: string;
  icon: string;
  description: string;
}

/** Data formulir menu */
export interface MenuFormData {
  name: string;
  category_id: number | null;
  price: string;
  stock: string;
  icon: string;
}

/** Hasil validasi formulir */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/** Opsi filter menu */
export interface MenuFilter {
  search?: string;
  categoryId?: number | null;
  includeInactive?: boolean;
}

/** Opsi filter transaksi/laporan */
export interface TransactionFilter {
  /** Format YYYY-MM-DD */
  date?: string | null;
  /** Format YYYY-MM */
  month?: string | null;
  limit?: number;
}

/** Statistik dashboard */
export interface DashboardStats {
  totalMenus: number;
  totalCategories: number;
  totalTransactions: number;
  totalRevenue: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayTransactions: number;
  todayRevenue: number;
  totalItemsSold: number;
}

/** Baris data rekap penjualan (grafik batang) */
export interface ChartData {
  label: string;
  value: number;
  total: number;
}

/** Menu terlaris */
export interface TopMenu {
  menu_id: number;
  menu_name: string;
  total_quantity: number;
  total_subtotal: number;
}

/** Rekap penjualan untuk laporan */
export interface SalesReport {
  transactionCount: number;
  totalRevenue: number;
  totalItemsSold: number;
  averageTransaction: number;
  topMenus: TopMenu[];
  chartData: ChartData[];
  transactions: Transaction[];
}

/** Baris laporan stok */
export interface StockReportItem {
  id: number;
  name: string;
  category_name: string;
  price: number;
  stock: number;
  is_active: number;
  status: StockStatus;
  soldQuantity: number;
}

/* ==========================================================
 * 3. TIPE NAVIGASI (React Navigation)
 * ========================================================== */

/** Navigasi tab bawah */
export type MainTabParamList = {
  Dashboard: undefined;
  Menu: undefined;
  Transaction: undefined;
  Report: undefined;
  Profile: undefined;
};

/** Navigasi stack utama */
export type RootStackParamList = {
  MainTabs: undefined;
  MenuForm: { menuId?: number } | undefined;
  CategoryForm: { categoryId?: number } | undefined;
  CategoryList: undefined;
  Receipt: { transactionId: number };
  TransactionHistory: undefined;
  StockReport: undefined;
};

/**
 * Helper tipe untuk props pada halaman tab.
 * Screen tab bisa melakukan navigasi ke halaman stack (misal: MenuForm)
 * maupun berpindah tab.
 */
export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

/** Helper tipe untuk props pada halaman stack */
export type StackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
