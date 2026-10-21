/**
 * DashboardScreen.tsx
 * ---------------------------------------------------------------
 * Halaman ringkasan (Output 3.1):
 *   - Kartu statistik: jumlah menu, kategori, transaksi, pendapatan, stok menipis
 *   - Grafik ringkasan penjualan 7 hari terakhir
 *   - Menu terlaris
 *   - Transaksi terakhir
 *   - Aksi cepat
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { BarChart } from '../components/BarChart';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner, LoadingState, SectionTitle } from '../components/Feedback';
import { StatCard } from '../components/StatCard';
import { APP_INFO } from '../constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { getDashboardStats, getDailySalesChart, getTopSellingMenus } from '../services/reportService';
import { getRecentTransactions } from '../services/transactionService';
import type { ChartData, DashboardStats, TabScreenProps, TopMenu, Transaction } from '../types';
import { formatRupiah } from '../utils/currency';
import { formatDateTime } from '../utils/dateUtils';

export const DashboardScreen: React.FC<TabScreenProps<'Dashboard'>> = ({ navigation }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topMenus, setTopMenus] = useState<TopMenu[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Memuat seluruh data dashboard dari database */
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError(null);

      const [dashboardStats, chart, top, recent] = await Promise.all([
        getDashboardStats(),
        getDailySalesChart(7),
        getTopSellingMenus(3),
        getRecentTransactions(5),
      ]);

      setStats(dashboardStats);
      setChartData(chart);
      setTopMenus(top);
      setTransactions(recent);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data dashboard';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Data dimuat ulang setiap kali halaman kembali menjadi aktif
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title={APP_INFO.appName} subtitle="Ringkasan kantin kampus" />
        <LoadingState message="Menyiapkan dashboard..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={APP_INFO.appName}
        subtitle={APP_INFO.description}
        rightIcon="cart"
        onRightPress={() => navigation.navigate('Transaction')}
        rightLabel="Transaksi"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        {error ? <ErrorBanner message={error} onRetry={() => loadData()} /> : null}

        {/* Kartu statistik */}
        <View style={styles.statGrid}>
          <StatCard
            icon="fast-food"
            label="Jumlah Menu"
            value={`${stats?.totalMenus ?? 0}`}
            hint={`${stats?.totalCategories ?? 0} kategori`}
            color={COLORS.primary}
          />
          <StatCard
            icon="receipt"
            label="Total Transaksi"
            value={`${stats?.totalTransactions ?? 0}`}
            hint={`${stats?.totalItemsSold ?? 0} item terjual`}
            color={COLORS.accent}
          />
          <StatCard
            icon="wallet"
            label="Total Pendapatan"
            value={formatRupiah(stats?.totalRevenue ?? 0)}
            hint={`Hari ini ${formatRupiah(stats?.todayRevenue ?? 0)}`}
            color={COLORS.success}
          />
          <StatCard
            icon="alert-circle"
            label="Stok Menipis"
            value={`${stats?.lowStockCount ?? 0}`}
            hint={`${stats?.outOfStockCount ?? 0} stok habis`}
            color={COLORS.warning}
          />
        </View>

        {/* Grafik penjualan 7 hari */}
        <View style={styles.card}>
          <SectionTitle title="Grafik Penjualan" icon="bar-chart" />
          <Text style={styles.cardSubtitle}>Pendapatan 7 hari terakhir</Text>
          <BarChart data={chartData} height={150} color={COLORS.primary} />
        </View>

        {/* Menu terlaris */}
        <View style={styles.card}>
          <SectionTitle
            title="Menu Terlaris"
            icon="trophy"
            action="Lihat semua"
          />
          {topMenus.length === 0 ? (
            <EmptyState
              icon="trophy-outline"
              title="Belum ada menu terlaris"
              message="Lakukan transaksi penjualan terlebih dahulu."
            />
          ) : (
            topMenus.map((item, index) => (
              <View key={item.menu_id} style={styles.topRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.topInfo}>
                  <Text style={styles.topName} numberOfLines={1}>
                    {item.menu_name}
                  </Text>
                  <Text style={styles.topMeta}>{item.total_quantity} item terjual</Text>
                </View>
                <Text style={styles.topValue}>{formatRupiah(item.total_subtotal)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Aksi cepat */}
        <View style={styles.card}>
          <SectionTitle title="Aksi Cepat" icon="flash" />
          <View style={styles.quickRow}>
            <Pressable
              style={({ pressed }) => [styles.quickItem, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Transaction')}
            >
              <Ionicons name="cart" size={22} color={COLORS.accent} />
              <Text style={styles.quickText}>Transaksi{`\n`}Baru</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickItem, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Menu')}
            >
              <Ionicons name="fast-food" size={22} color={COLORS.primary} />
              <Text style={styles.quickText}>Kelola{`\n`}Menu</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickItem, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Report')}
            >
              <Ionicons name="bar-chart" size={22} color={COLORS.purple} />
              <Text style={styles.quickText}>Lihat{`\n`}Laporan</Text>
            </Pressable>
          </View>
        </View>

        {/* Transaksi terakhir */}
        <View style={styles.card}>
          <SectionTitle title="Transaksi Terakhir" icon="time" />
          {transactions.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="Belum ada transaksi"
              message="Transaksi yang disimpan akan tampil di sini."
            />
          ) : (
            transactions.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.trxRow, pressed && styles.pressed]}
                onPress={() => navigation.navigate('Receipt', { transactionId: item.id })}
              >
                <View style={styles.trxIcon}>
                  <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.trxInfo}>
                  <Text style={styles.trxNumber}>{item.transaction_number}</Text>
                  <Text style={styles.trxDate}>{formatDateTime(item.transaction_date)}</Text>
                </View>
                <Text style={styles.trxAmount}>{formatRupiah(item.total_amount)}</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.card,
  },
  cardSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
  },
  topInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  topName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  topMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  topValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginHorizontal: 4,
  },
  quickText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: FONT_WEIGHT.medium,
  },
  trxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trxIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trxInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  trxNumber: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  trxDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  trxAmount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
