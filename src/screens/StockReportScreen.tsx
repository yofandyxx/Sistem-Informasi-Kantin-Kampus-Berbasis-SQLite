/**
 * StockReportScreen.tsx
 * ---------------------------------------------------------------
 * Laporan stok (Output 3.6):
 *   Tabel berisi nama menu, kategori, harga, stok tersedia, dan
 *   indikator stok menipis / habis.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner, LoadingState, SectionTitle } from '../components/Feedback';
import { StatCard } from '../components/StatCard';
import { StockBadge } from '../components/StockBadge';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { getStockReport } from '../services/reportService';
import type { StackScreenProps, StockReportItem } from '../types';
import { formatRupiah } from '../utils/currency';

export const StockReportScreen: React.FC<StackScreenProps<'StockReport'>> = ({ navigation }) => {
  const [items, setItems] = useState<StockReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Memuat data laporan stok */
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await getStockReport();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan stok');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /** Ringkasan jumlah stok */
  const summary = useMemo(() => {
    const total = items.length;
    const low = items.filter((item) => item.status === 'MENIPIS').length;
    const empty = items.filter((item) => item.status === 'HABIS').length;
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    return { total, low, empty, totalStock };
  }, [items]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Laporan Stok"
        subtitle="Stok tersedia setiap menu"
        onBack={() => navigation.goBack()}
      />

      {error ? (
        <View style={styles.errorWrap}>
          <ErrorBanner message={error} onRetry={loadData} />
        </View>
      ) : null}

      {loading ? (
        <LoadingState message="Menghitung laporan stok..." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.statGrid}>
                <StatCard
                  icon="cube-outline"
                  label="Total Menu"
                  value={`${summary.total}`}
                  color={COLORS.primary}
                />
                <StatCard
                  icon="layers-outline"
                  label="Total Porsi Stok"
                  value={`${summary.totalStock}`}
                  color={COLORS.teal}
                />
                <StatCard
                  icon="alert-circle-outline"
                  label="Stok Menipis"
                  value={`${summary.low}`}
                  color={COLORS.warning}
                />
                <StatCard
                  icon="close-circle-outline"
                  label="Stok Habis"
                  value={`${summary.empty}`}
                  color={COLORS.danger}
                />
              </View>

              <View style={styles.tableHeader}>
                <SectionTitle title="Daftar Stok Menu" icon="list-outline" />
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="Belum ada data stok"
              message="Tambahkan menu beserta stoknya pada halaman Kelola Menu."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowHeader}>
                <View style={styles.nameWrap}>
                  <Ionicons name="fast-food-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <StockBadge status={item.status} stock={item.stock} />
              </View>

              <View style={styles.rowDetail}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Kategori</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {item.category_name}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Harga</Text>
                  <Text style={styles.detailValue}>{formatRupiah(item.price)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Terjual</Text>
                  <Text style={styles.detailValue}>{item.soldQuantity} item</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Stok</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      item.stock <= 0 ? { color: COLORS.danger } : null,
                    ]}
                  >
                    {item.stock}
                  </Text>
                </View>
              </View>

              {item.is_active === 0 ? (
                <Text style={styles.inactiveNote}>Menu ini berstatus nonaktif (pernah terjual)</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  errorWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tableHeader: {
    marginTop: SPACING.lg,
  },
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  rowDetail: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  inactiveNote: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});
