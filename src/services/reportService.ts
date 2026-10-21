/**
 * reportService.ts
 * ---------------------------------------------------------------
 * Lapisan rekap & laporan. Semua perhitungan agregat dilakukan langsung
 * oleh SQL (SUM, COUNT, GROUP BY, JOIN) agar data akurat dan cepat.
 *
 * Laporan yang tersedia:
 *   - Statistik dashboard (jumlah menu, kategori, transaksi, pendapatan, stok menipis)
 *   - Rekap penjualan (per tanggal / per bulan): jumlah transaksi, pendapatan,
 *     total item terjual, menu terlaris, grafik penjualan
 *   - Laporan stok (stok tiap menu + indikator stok menipis/habis)
 */

import { LOW_STOCK_THRESHOLD } from '../constants/appConstants';
import { execute, queryAll, queryFirst } from '../database/database';
import {
  DAILY_SALES_SQL,
  MONTHLY_SALES_SQL,
  TOP_MENUS_SQL,
  TOTAL_ITEMS_SOLD_SQL,
} from '../database/schema';
import { calculateAverage } from '../utils/calculation';
import { getLastDays, getMonthLabel, getTodayISO } from '../utils/dateUtils';
import type {
  ChartData,
  DashboardStats,
  SalesReport,
  StockReportItem,
  StockStatus,
  TopMenu,
  Transaction,
} from '../types';

/** Rentang tanggal (waktu lokal) untuk filter laporan */
export interface DateRange {
  start: string;
  end: string;
  label: string;
}

/**
 * Menghitung rentang waktu (start & end) berdasarkan filter laporan.
 * - filter tanggal  -> satu hari penuh
 * - filter bulan    -> satu bulan penuh
 * - tanpa filter    -> 30 hari terakhir
 */
export const getDateRange = (filter: { date?: string | null; month?: string | null } = {}): DateRange => {
  if (filter.date) {
    return {
      start: `${filter.date} 00:00:00`,
      end: `${filter.date} 23:59:59`,
      label: filter.date,
    };
  }

  if (filter.month) {
    const [year, month] = filter.month.split('-').map((part) => parseInt(part, 10));
    const lastDay = new Date(year, month, 0).getDate();
    return {
      start: `${filter.month}-01 00:00:00`,
      end: `${filter.month}-${`${lastDay}`.padStart(2, '0')} 23:59:59`,
      label: getMonthLabel(filter.month),
    };
  }

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
  const startText = `${start.getFullYear()}-${`${start.getMonth() + 1}`.padStart(2, '0')}-${`${start.getDate()}`.padStart(2, '0')}`;
  return {
    start: `${startText} 00:00:00`,
    end: `${getTodayISO()} 23:59:59`,
    label: '30 Hari Terakhir',
  };
};

/**
 * Statistik untuk dashboard.
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const menuRow = await queryFirst<{ count: number }>(
    'SELECT COUNT(*) AS count FROM menus WHERE is_active = 1',
  );

  const categoryRow = await queryFirst<{ count: number }>(
    'SELECT COUNT(*) AS count FROM categories',
  );

  const transactionRow = await queryFirst<{ count: number }>(
    'SELECT COUNT(*) AS count FROM transactions',
  );

  const revenueRow = await queryFirst<{ total: number }>(
    'SELECT COALESCE(SUM(total_amount), 0) AS total FROM transactions',
  );

  const lowStockRow = await queryFirst<{ count: number }>(
    'SELECT COUNT(*) AS count FROM menus WHERE is_active = 1 AND stock > 0 AND stock <= ?',
    [LOW_STOCK_THRESHOLD],
  );

  const outOfStockRow = await queryFirst<{ count: number }>(
    'SELECT COUNT(*) AS count FROM menus WHERE is_active = 1 AND stock <= 0',
  );

  const today = getTodayISO();
  const todayRow = await queryFirst<{ count: number; total: number }>(
    `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS total
       FROM transactions
      WHERE transaction_date LIKE ?`,
    [`${today}%`],
  );

  const itemsRow = await queryFirst<{ total: number }>(
    'SELECT COALESCE(SUM(quantity), 0) AS total FROM transaction_details',
  );

  return {
    totalMenus: menuRow?.count ?? 0,
    totalCategories: categoryRow?.count ?? 0,
    totalTransactions: transactionRow?.count ?? 0,
    totalRevenue: revenueRow?.total ?? 0,
    lowStockCount: lowStockRow?.count ?? 0,
    outOfStockCount: outOfStockRow?.count ?? 0,
    todayTransactions: todayRow?.count ?? 0,
    todayRevenue: todayRow?.total ?? 0,
    totalItemsSold: itemsRow?.total ?? 0,
  };
};

/**
 * Grafik penjualan 7 hari terakhir (pendapatan per hari).
 */
export const getDailySalesChart = async (days = 7): Promise<ChartData[]> => {
  const list = getLastDays(days);
  const start = `${list[0]?.value ?? getTodayISO()} 00:00:00`;
  const end = `${list[list.length - 1]?.value ?? getTodayISO()} 23:59:59`;

  const rows = await queryAll<{ sale_date: string; total_amount: number }>(
    DAILY_SALES_SQL,
    [start, end],
  );

  const total = rows.reduce((sum, row) => sum + (row.total_amount ?? 0), 0);

  return list.map((item) => {
    const found = rows.find((row) => row.sale_date === item.value);
    return {
      label: item.label,
      value: found?.total_amount ?? 0,
      total,
    };
  });
};

/**
 * Grafik penjualan 6 bulan terakhir (pendapatan per bulan).
 */
export const getMonthlySalesChart = async (months = 6): Promise<ChartData[]> => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const start = `${first.getFullYear()}-${`${first.getMonth() + 1}`.padStart(2, '0')}-01 00:00:00`;
  const end = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-31 23:59:59`;

  const rows = await queryAll<{ sale_month: string; total_amount: number }>(
    MONTHLY_SALES_SQL,
    [start, end],
  );

  const list: ChartData[] = [];
  for (let i = 0; i < months; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
    const value = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    const found = rows.find((row) => row.sale_month === value);
    list.push({
      label: getMonthLabel(value).split(' ')[0].slice(0, 3),
      value: found?.total_amount ?? 0,
      total: 0,
    });
  }

  const total = list.reduce((sum, item) => sum + item.value, 0);
  return list.map((item) => ({ ...item, total }));
};

/**
 * Rekap penjualan lengkap (dipakai oleh halaman Laporan).
 */
export const getSalesReport = async (
  filter: { date?: string | null; month?: string | null } = {},
): Promise<SalesReport> => {
  const range = getDateRange(filter);

  // Jumlah transaksi & total pendapatan pada periode tersebut
  const summaryRow = await queryFirst<{ count: number; total: number }>(
    `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS total
       FROM transactions
      WHERE transaction_date >= ? AND transaction_date <= ?`,
    [range.start, range.end],
  );

  // Total item terjual (SUM quantity dari detail transaksi)
  const itemsRow = await queryFirst<{ total_items: number }>(TOTAL_ITEMS_SOLD_SQL, [
    range.start,
    range.end,
  ]);

  // Menu terlaris (GROUP BY + ORDER BY)
  const topMenus = await queryAll<TopMenu>(TOP_MENUS_SQL, [range.start, range.end, 5]);

  // Daftar transaksi pada periode tersebut
  const transactions = await queryAll<Transaction>(
    `SELECT id, transaction_number, transaction_date, total_amount, payment_method
       FROM transactions
      WHERE transaction_date >= ? AND transaction_date <= ?
      ORDER BY transaction_date DESC, id DESC`,
    [range.start, range.end],
  );

  // Grafik: bila memilih satu tanggal -> grafik per menu, bila memilih bulan -> grafik per hari
  let chartData: ChartData[] = [];
  if (filter.date) {
    const menuChart = await queryAll<{ menu_name: string; total_quantity: number }>(
      `SELECT td.menu_name AS menu_name, SUM(td.quantity) AS total_quantity
         FROM transaction_details td
         INNER JOIN transactions t ON t.id = td.transaction_id
        WHERE t.transaction_date >= ? AND t.transaction_date <= ?
        GROUP BY td.menu_name
        ORDER BY total_quantity DESC
        LIMIT 7`,
      [range.start, range.end],
    );
    const total = menuChart.reduce((sum, row) => sum + row.total_quantity, 0);
    chartData = menuChart.map((row) => ({
      label: row.menu_name.length > 8 ? `${row.menu_name.slice(0, 8)}..` : row.menu_name,
      value: row.total_quantity,
      total,
    }));
  } else {
    const dailyRows = await queryAll<{ sale_date: string; total_amount: number }>(
      DAILY_SALES_SQL,
      [range.start, range.end],
    );
    const total = dailyRows.reduce((sum, row) => sum + (row.total_amount ?? 0), 0);
    chartData = dailyRows.map((row) => ({
      label: row.sale_date.slice(8, 10),
      value: row.total_amount ?? 0,
      total,
    }));
  }

  const transactionCount = summaryRow?.count ?? 0;
  const totalRevenue = summaryRow?.total ?? 0;

  return {
    transactionCount,
    totalRevenue,
    totalItemsSold: itemsRow?.total_items ?? 0,
    averageTransaction: calculateAverage(totalRevenue, transactionCount),
    topMenus,
    chartData,
    transactions,
  };
};

/**
 * Laporan stok: seluruh menu beserta kategori, harga, stok, dan statusnya.
 */
export const getStockReport = async (): Promise<StockReportItem[]> => {
  const rows = await queryAll<{
    id: number;
    name: string;
    category_name: string;
    price: number;
    stock: number;
    is_active: number;
    sold_quantity: number;
  }>(
    `SELECT
        m.id,
        m.name,
        c.name AS category_name,
        m.price,
        m.stock,
        m.is_active,
        COALESCE(SUM(td.quantity), 0) AS sold_quantity
     FROM menus m
     INNER JOIN categories c ON c.id = m.category_id
     LEFT JOIN transaction_details td ON td.menu_id = m.id
     GROUP BY m.id
     ORDER BY c.name COLLATE NOCASE ASC, m.name COLLATE NOCASE ASC`,
  );

  return rows.map((row) => {
    let status: StockStatus = 'TERSEDIA';
    if (row.stock <= 0) {
      status = 'HABIS';
    } else if (row.stock <= LOW_STOCK_THRESHOLD) {
      status = 'MENIPIS';
    }

    return {
      id: row.id,
      name: row.name,
      category_name: row.category_name,
      price: row.price,
      stock: row.stock,
      is_active: row.is_active,
      status,
      soldQuantity: row.sold_quantity ?? 0,
    };
  });
};

/**
 * Menu terlaris (untuk dashboard).
 */
export const getTopSellingMenus = async (limit = 3): Promise<TopMenu[]> => {
  const range = getDateRange({});
  return queryAll<TopMenu>(TOP_MENUS_SQL, [range.start, range.end, limit]);
};

/**
 * Menghapus satu transaksi beserta detailnya (dipakai untuk uji transaksi gagal).
 */
export const deleteTransaction = async (id: number): Promise<void> => {
  await execute('DELETE FROM transactions WHERE id = ?', [id]);
};
