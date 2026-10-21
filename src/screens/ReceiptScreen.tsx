/**
 * ReceiptScreen.tsx
 * ---------------------------------------------------------------
 * Struk transaksi digital (Output 3.4).
 * Menampilkan nama kantin, nomor transaksi, tanggal & waktu, daftar item,
 * subtotal, total pembayaran, dan metode pembayaran.
 * Tidak ada printer / PDF, struk hanya ditampilkan di dalam aplikasi.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '../components/ActionButton';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner, LoadingState } from '../components/Feedback';
import { APP_INFO, PAYMENT_METHOD_LABELS } from '../constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { getTransactionWithDetails } from '../services/transactionService';
import type { StackScreenProps, TransactionWithDetails } from '../types';
import { formatRupiah, formatRupiahSpaced } from '../utils/currency';
import { formatLongDate, formatTime } from '../utils/dateUtils';

export const ReceiptScreen: React.FC<StackScreenProps<'Receipt'>> = ({ navigation, route }) => {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<TransactionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Memuat data transaksi beserta detail itemnya */
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await getTransactionWithDetails(transactionId);
      setTransaction(data);
      if (!data) {
        setError('Data transaksi tidak ditemukan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat struk transaksi');
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Struk Transaksi" onBack={() => navigation.goBack()} />
        <LoadingState message="Memuat struk..." />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <AppHeader title="Struk Transaksi" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="document-text-outline"
          title="Struk tidak ditemukan"
          message="Transaksi yang dicari tidak tersedia di database."
        />
      </View>
    );
  }

  const itemCount = transaction.details.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Struk Transaksi"
        subtitle={transaction.transaction_number}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? <ErrorBanner message={error} onRetry={loadData} /> : null}

        <View style={styles.receipt}>
          {/* Kepala struk */}
          <View style={styles.receiptHeader}>
            <View style={styles.logo}>
              <Ionicons name="restaurant" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.canteenName}>{APP_INFO.canteenName}</Text>
            <Text style={styles.canteenSub}>{APP_INFO.description}</Text>
            <Text style={styles.canteenSub}>{APP_INFO.campusName}</Text>
          </View>

          <View style={styles.divider} />

          {/* Info transaksi */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>No. Transaksi</Text>
            <Text style={styles.infoValue}>{transaction.transaction_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{formatLongDate(transaction.transaction_date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waktu</Text>
            <Text style={styles.infoValue}>{formatTime(transaction.transaction_date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Item</Text>
            <Text style={styles.infoValue}>{itemCount} item</Text>
          </View>

          <View style={styles.divider} />

          {/* Detail item */}
          {transaction.details.map((detail) => (
            <View key={detail.id} style={styles.itemBlock}>
              <View style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {detail.menu_name}
                </Text>
                <Text style={styles.itemSubtotal}>{formatRupiahSpaced(detail.subtotal)}</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemMeta}>
                  {detail.quantity} x {formatRupiah(detail.unit_price)}
                </Text>
                <Text style={styles.itemMeta} />
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatRupiahSpaced(transaction.total_amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandLabel}>TOTAL PEMBAYARAN</Text>
            <Text style={styles.grandValue}>{formatRupiahSpaced(transaction.total_amount)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Metode pembayaran */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Metode Pembayaran</Text>
            <Text style={styles.infoValue}>
              {PAYMENT_METHOD_LABELS[transaction.payment_method] ?? transaction.payment_method}
            </Text>
          </View>

          <Text style={styles.footer}>Terima kasih telah berbelanja di {APP_INFO.canteenName}!</Text>
        </View>

        <ActionButton
          label="Kembali ke Transaksi"
          icon="cart-outline"
          variant="outline"
          onPress={() => {
            navigation.navigate('MainTabs');
            Alert.alert('Selesai', 'Transaksi tersimpan dan stok telah diperbarui.');
          }}
        />
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
  receipt: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  receiptHeader: {
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  canteenName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  canteenSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  itemBlock: {
    marginBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  itemSubtotal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  itemMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  grandLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  grandValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
  },
  footer: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
});
