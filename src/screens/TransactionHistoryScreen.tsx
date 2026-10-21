/**
 * TransactionHistoryScreen.tsx
 * ---------------------------------------------------------------
 * Riwayat transaksi penjualan:
 *   - Daftar seluruh transaksi (dengan filter bulan)
 *   - Detail transaksi (struk) ketika transaksi dipilih
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner, LoadingState } from '../components/Feedback';
import { FormDropdown } from '../components/FormDropdown';
import { PAYMENT_METHOD_LABELS } from '../constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import { getTransactions } from '../services/transactionService';
import type { StackScreenProps, Transaction } from '../types';
import { formatRupiah } from '../utils/currency';
import { formatDateTime, getMonthLabel, getMonthOptions } from '../utils/dateUtils';

export const TransactionHistoryScreen: React.FC<StackScreenProps<'TransactionHistory'>> = ({
  navigation,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Memuat riwayat transaksi (dengan filter bulan) */
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await getTransactions({ month: selectedMonth || null });
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /** Opsi filter bulan (12 bulan terakhir + semua) */
  const monthOptions = useMemo(
    () => [
      { label: 'Semua Bulan', value: '' },
      ...getMonthOptions(12).map((item) => ({ label: item.label, value: item.value })),
    ],
    [],
  );

  /** Total pendapatan dari transaksi yang tampil */
  const totalVisible = useMemo(
    () => transactions.reduce((sum, item) => sum + item.total_amount, 0),
    [transactions],
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Riwayat Transaksi"
        subtitle={selectedMonth ? getMonthLabel(selectedMonth) : 'Seluruh transaksi'}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.filterArea}>
        <FormDropdown
          label="Filter Bulan"
          icon="calendar-outline"
          value={selectedMonth ? getMonthLabel(selectedMonth) : 'Semua Bulan'}
          options={monthOptions}
          onSelect={(option) => setSelectedMonth(option.value)}
        />

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Jumlah Transaksi</Text>
            <Text style={styles.summaryValue}>{transactions.length}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>Total Pendapatan</Text>
            <Text style={styles.summaryTotal}>{formatRupiah(totalVisible)}</Text>
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <ErrorBanner message={error} onRetry={loadData} />
        </View>
      ) : null}

      {loading ? (
        <LoadingState message="Memuat riwayat transaksi..." />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="Belum ada transaksi"
              message="Riwayat transaksi akan tampil setelah ada penjualan yang disimpan."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Receipt', { transactionId: item.id })}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
              </View>

              <View style={styles.info}>
                <Text style={styles.number}>{item.transaction_number}</Text>
                <Text style={styles.date}>{formatDateTime(item.transaction_date)}</Text>
                <View style={styles.methodRow}>
                  <Ionicons
                    name={item.payment_method === 'TUNAI' ? 'cash-outline' : 'qr-code-outline'}
                    size={12}
                    color={COLORS.textMuted}
                  />
                  <Text style={styles.method}>
                    {PAYMENT_METHOD_LABELS[item.payment_method] ?? item.payment_method}
                  </Text>
                </View>
              </View>

              <View style={styles.right}>
                <Text style={styles.amount}>{formatRupiah(item.total_amount)}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </View>
            </Pressable>
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
  filterArea: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: SPACING.md,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  summaryTotal: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  errorWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  number: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  method: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
  },
  pressed: {
    opacity: 0.8,
  },
});
