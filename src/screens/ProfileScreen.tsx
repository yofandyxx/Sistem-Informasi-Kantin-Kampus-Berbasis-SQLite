/**
 * ProfileScreen.tsx
 * ---------------------------------------------------------------
 * Halaman Profil / Informasi aplikasi:
 *   - Identitas aplikasi
 *   - Fitur yang tersedia
 *   - Informasi database lokal
 *   - Menu pengaturan (reset data untuk pengujian ulang)
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SectionTitle } from '../components/Feedback';
import { APP_INFO } from '../constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { resetAllData } from '../database/database';
import { getDatabase } from '../database/database';
import { getDashboardStats } from '../services/reportService';
import type { DashboardStats, IconName, TabScreenProps } from '../types';
import { formatRupiah } from '../utils/currency';

interface FeatureItem {
  icon: IconName;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: 'pricetags-outline',
    title: 'Kelola Kategori',
    description: 'Tambah, edit, dan hapus kategori makanan & minuman.',
  },
  {
    icon: 'fast-food-outline',
    title: 'Kelola Menu',
    description: 'Data menu, harga, stok, pencarian, dan filter kategori.',
  },
  {
    icon: 'cart-outline',
    title: 'Transaksi Penjualan',
    description: 'Keranjang belanja, subtotal, total, dan struk digital.',
  },
  {
    icon: 'cube-outline',
    title: 'Manajemen Stok',
    description: 'Stok berkurang otomatis setiap transaksi berhasil disimpan.',
  },
  {
    icon: 'bar-chart-outline',
    title: 'Laporan',
    description: 'Rekap penjualan harian/bulanan dan laporan stok.',
  },
  {
    icon: 'hardware-chip-outline',
    title: 'SQLite Offline',
    description: 'Seluruh data disimpan lokal di perangkat, tanpa server.',
  },
];

export const ProfileScreen: React.FC<TabScreenProps<'Profile'>> = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [resetVisible, setResetVisible] = useState(false);
  const [resetting, setResetting] = useState(false);

  /** Memuat statistik singkat untuk ditampilkan di halaman profil */
  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      // Abaikan error pada halaman profil (tidak kritikal)
    }
  }, []);

  React.useEffect(() => {
    loadStats();
  }, [loadStats]);

  /** Menghapus seluruh data & membuat ulang data contoh (untuk pengujian ulang) */
  const handleReset = async () => {
    try {
      setResetting(true);
      await resetAllData();
      setResetVisible(false);
      await loadStats();
      Alert.alert('Berhasil', 'Seluruh data telah dihapus dan data contoh dibuat ulang.');
    } catch (err) {
      Alert.alert('Gagal', err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Profil & Informasi" subtitle={APP_INFO.description} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kartu identitas */}
        <View style={styles.profileCard}>
          <View style={styles.logo}>
            <Ionicons name="restaurant" size={34} color={COLORS.white} />
          </View>
          <Text style={styles.appName}>{APP_INFO.appName}</Text>
          <Text style={styles.appDesc}>{APP_INFO.description}</Text>
          <Text style={styles.appMeta}>
            {APP_INFO.campusName} • Versi {APP_INFO.version}
          </Text>
        </View>

        {/* Ringkasan data */}
        <View style={styles.card}>
          <SectionTitle title="Ringkasan Data" icon="stats-chart-outline" />
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.totalMenus ?? 0}</Text>
              <Text style={styles.statLabel}>Menu</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.totalCategories ?? 0}</Text>
              <Text style={styles.statLabel}>Kategori</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.totalTransactions ?? 0}</Text>
              <Text style={styles.statLabel}>Transaksi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatRupiah(stats?.totalRevenue ?? 0)}</Text>
              <Text style={styles.statLabel}>Pendapatan</Text>
            </View>
          </View>
        </View>

        {/* Fitur aplikasi */}
        <View style={styles.card}>
          <SectionTitle title="Fitur Aplikasi" icon="apps-outline" />
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={18} color={COLORS.primary} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Informasi database */}
        <View style={styles.card}>
          <SectionTitle title="Database Lokal" icon="server-outline" />
          <View style={styles.dbRow}>
            <Text style={styles.dbLabel}>Nama Database</Text>
            <Text style={styles.dbValue}>ppnp_canteen.db</Text>
          </View>
          <View style={styles.dbRow}>
            <Text style={styles.dbLabel}>Lokasi</Text>
            <Text style={styles.dbValue}>Penyimpanan Internal Perangkat</Text>
          </View>
          <View style={styles.dbRow}>
            <Text style={styles.dbLabel}>Tabel</Text>
            <Text style={styles.dbValue}>categories, menus, transactions, transaction_details</Text>
          </View>
          <View style={styles.dbRow}>
            <Text style={styles.dbLabel}>Mode</Text>
            <Text style={styles.dbValue}>Offline (tanpa internet)</Text>
          </View>
        </View>

        {/* Pengaturan */}
        <View style={styles.card}>
          <SectionTitle title="Pengaturan" icon="settings-outline" />
          <Text style={styles.settingDesc}>
            Hapus seluruh transaksi, menu, dan kategori, lalu buat ulang data contoh.
            Berguna saat mengulang pengujian aplikasi.
          </Text>
          <Text
            onPress={() => setResetVisible(true)}
            style={[styles.settingButton, resetting && styles.settingButtonDisabled]}
          >
            <Ionicons name="refresh-outline" size={18} color={COLORS.danger} />
            <Text style={styles.settingButtonText}>Reset Data Aplikasi</Text>
          </Text>
        </View>

        {/* Tentang */}
        <View style={styles.card}>
          <SectionTitle title="Tentang Aplikasi" icon="information-circle-outline" />
          <Text style={styles.aboutText}>{APP_INFO.tagline}</Text>
          <Text style={styles.aboutText}>
            Dibuat untuk materialize mata kuliah {APP_INFO.course} - {APP_INFO.author}.
          </Text>
          <Text style={styles.aboutText}>
            Dibuat dengan React Native, TypeScript, Expo, dan SQLite lokal.
          </Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={resetVisible}
        title="Reset Data?"
        message="Seluruh transaksi, menu, dan kategori akan dihapus dan diganti dengan data contoh. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Reset"
        onConfirm={handleReset}
        onCancel={() => setResetVisible(false)}
      />
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
  profileCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  appDesc: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  appMeta: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.card,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  featureDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  dbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dbLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  dbValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  settingDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  settingButtonDisabled: {
    opacity: 0.5,
  },
  settingButtonText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: 6,
  },
  aboutText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
});
