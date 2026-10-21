/**
 * ReportScreen.tsx
 * ---------------------------------------------------------------
 * Laporan penjualan (Output 3.5):
 *   - Filter berdasarkan bulan atau tanggal
 *   - Jumlah transaksi, total pendapatan, total item terjual, rata-rata
 *   - Grafik penjualan
 *   - Menu terlaris
 *   - Daftar riwayat transaksi pada periode tersebut
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { BarChart } from '../components/BarChart';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner, LoadingState, SectionTitle } from '../components/Feedback';
import { FormDropdown } from '../components/FormDropdown';
import { FormInput } from '../components/FormInput';
import { StatCard } from '../components/StatCard';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { getSalesReport } from '../services/reportService';
import type { SalesReport, TabScreenProps } from '../types';
import { formatRupiah } from '../utils/currency';
import { formatDateTime, getCurrentMonth, getMonthLabel, getMonthOptions } from '../utils/dateUtils';

type FilterMode = 'BULAN' | 'TANGGAL';

export const ReportScreen: React.FC<TabScreenProps<'Report'>> = ({ navigation }) => {
  const [mode, setMode] = useState<FilterMode>('BULAN');
  const [month, setMonth] = useState<string>(getCurrentMonth());
  const [dateInput, setDateInput] = useState<string>('');
  const [appliedDate, setAppliedDate] = useState<string | null>(null);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Memuat rekap penjualan sesuai filter aktif */
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const filter =
        mode === 'TANGGAL' && appliedDate
          ? { date: appliedDate }
          : { month: month || null };
      const data = await getSalesReport(filter);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  }, [mode, appliedDate, month]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const monthOptions = useMemo(() => getMonthOptions(12), []);

  /** Menerapkan filter tanggal (format YYYY-MM-DD) */
  const applyDate = () => {
    const value = dateInput.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      Alert.alert('Format Tanggal Salah', 'Gunakan format YYYY-MM-DD, contoh: 2026-10-21');
      return;
    }
    setAppliedDate(value);
  };

  const periodLabel =
    mode === 'TANGGAL' && appliedDate
      ? appliedDate
      : month
        ? getMonthLabel(month)
        : '30 Hari Terakhir';

  return (
    <View style={styles.container}>
      <AppHeader
        title="Laporan Penjualan"
        subtitle={periodLabel}
        rightIcon="cube-outline"
        rightLabel="Stok"
        onRightPress={() => navigation.navigate('StockReport')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter periode */}
        <View style={styles.card}>
          <SectionTitle title="Filter Periode" icon="filter-outline" />

          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setMode('BULAN')}
              style={[styles.modeChip, mode === 'BULAN' && styles.modeChipActive]}
            >
              <Text style={[styles.modeText, mode === 'BULAN' && styles.modeTextActive]}>
                Per Bulan
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('TANGGAL')}
              style={[styles.modeChip, mode === 'TANGGAL' && styles.modeChipActive]}
            >
              <Text style={[styles.modeText, mode === 'TANGGAL' && styles.modeTextActive]}>
                Per Tanggal
              </Text>
            </Pressable>
          </View>

          {mode === 'BULAN' ? (
            <FormDropdown
              label="Pilih Bulan"
              icon="calendar-outline"
              value={getMonthLabel(month)}
              options={monthOptions.map((item) => ({ label: item.label, value: item.value }))}
              onSelect={(option) => setMonth(option.value)}
            />
          ) : (
            <View>
              <FormInput
                label="Tanggal"
                icon="calendar-outline"
                placeholder="2026-10-21"
                keyboardType="numbers-and-punctuation"
                value={dateInput}
                onChangeText={setDateInput}
              />
              <Pressable onPress={applyDate} style={styles.applyButton}>
                <Ionicons name="filter" size={16} color={COLORS.white} />
                <Text style={styles.applyText}>Terapkan Tanggal</Text>
              </Pressable>
            </View>
          )}
        </View>

        {error ? <ErrorBanner message={error} onRetry={loadData} /> : null}

        {loading ? (
          <LoadingState message="Menghitung laporan..." />
        ) : (
          <>
            {/* Statistik periode */}
            <View style={styles.statGrid}>
              <StatCard
                icon="receipt-outline"
                label="Jumlah Transaksi"
                value={`${report?.transactionCount ?? 0}`}
                color={COLORS.primary}
              />
              <StatCard
                icon="wallet-outline"
                label="Total Pendapatan"
                value={formatRupiah(report?.totalRevenue ?? 0)}
                color={COLORS.success}
              />
              <StatCard
                icon="bag-handle-outline"
                label="Total Item Terjual"
                value={`${report?.totalItemsSold ?? 0}`}
                color={COLORS.accent}
              />
              <StatCard
                icon="calculator-outline"
                label="Rata-rata Transaksi"
                value={formatRupiah(report?.averageTransaction ?? 0)}
                color={COLORS.purple}
              />
            </View>

            {/* Grafik penjualan */}
            <View style={styles.card}>
              <SectionTitle title="Grafik Penjualan" icon="bar-chart-outline" />
              <Text style={styles.cardSubtitle}>
                {mode === 'TANGGAL' ? 'Item terjual per menu' : 'Pendapatan per hari'}
              </Text>
              <BarChart
                data={report?.chartData ?? []}
                height={160}
                color={COLORS.accent}
                formatValue={
                  mode === 'TANGGAL'
                    ? (value) => `${value} item`
                    : (value) => formatRupiah(value)
                }
              />
            </View>

            {/* Menu terlaris */}
            <View style={styles.card}>
              <SectionTitle title="Menu Terlaris" icon="trophy-outline" />
              {(report?.topMenus.length ?? 0) === 0 ? (
                <EmptyState
                  icon="trophy-outline"
                  title="Belum ada data"
                  message="Tidak ada penjualan pada periode ini."
                />
              ) : (
                report?.topMenus.map((item, index) => (
                  <View key={item.menu_id} style={styles.topRow}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.topInfo}>
                      <Text style={styles.topName}>{item.menu_name}</Text>
                      <Text style={styles.topMeta}>{item.total_quantity} item terjual</Text>
                    </View>
                    <Text style={styles.topValue}>{formatRupiah(item.total_subtotal)}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Riwayat transaksi periode ini */}
            <View style={styles.card}>
              <SectionTitle
                title="Riwayat Transaksi"
                icon="time-outline"
                action="Lihat semua"
              />
              {(report?.transactions.length ?? 0) === 0 ? (
                <EmptyState
                  icon="receipt-outline"
                  title="Belum ada transaksi"
                  message="Tidak ada transaksi pada periode yang dipilih."
                />
              ) : (
                report?.transactions.slice(0, 10).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => navigation.navigate('Receipt', { transactionId: item.id })}
                    style={({ pressed }) => [styles.trxRow, pressed && styles.pressed]}
                  >
                    <View style={styles.trxIcon}>
                      <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
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
          </>
        )}
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  cardSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: SPACING.md,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  modeChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  modeTextActive: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    marginTop: -SPACING.sm,
  },
  applyText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: 6,
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
  trxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trxIcon: {
    width: 34,
    height: 34,
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
