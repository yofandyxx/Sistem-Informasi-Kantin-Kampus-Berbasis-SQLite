/**
 * MenuScreen.tsx
 * ---------------------------------------------------------------
 * Halaman daftar menu (Output 3.2):
 *   - Pencarian berdasarkan nama menu
 *   - Filter berdasarkan kategori
 *   - Kartu menu lengkap dengan tombol edit & hapus
 *   - Tombol tambah menu baru
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner, LoadingState } from '../components/Feedback';
import { MenuCard } from '../components/MenuCard';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { getCategories } from '../services/categoryService';
import { deleteMenu, getMenus } from '../services/menuService';
import type { Category, Menu, TabScreenProps } from '../types';

export const MenuScreen: React.FC<TabScreenProps<'Menu'>> = ({ navigation }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** Memuat daftar menu (dengan filter pencarian & kategori) dan daftar kategori */
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [menuList, categoryList] = await Promise.all([
        getMenus({ search, categoryId: selectedCategory }),
        getCategories(),
      ]);
      setMenus(menuList);
      setCategories(categoryList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar menu');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /** Konfirmasi hapus menu */
  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    Alert.alert(
      'Hapus Menu',
      `Hapus "${deleteTarget.name}" dari daftar menu?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => handleDelete(deleteTarget) },
      ],
    );
  }, [deleteTarget]);

  /** Proses hapus menu (dengan FDI: menu yang pernah terjual dinonaktifkan) */
  const handleDelete = async (menu: Menu) => {
    try {
      setDeleting(true);
      const result = await deleteMenu(menu.id);
      setDeleteTarget(null);
      await loadData();
      Alert.alert(
        'Berhasil',
        result === 'soft'
          ? `"${menu.name}" pernah digunakan pada transaksi, sehingga dinonaktifkan (bukan dihapus) agar riwayat penjualan tetap akurat.`
          : `Menu "${menu.name}" berhasil dihapus.`,
      );
    } catch (err) {
      Alert.alert('Gagal Hapus', err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setDeleting(false);
    }
  };

  /** Chip filter kategori */
  const categoryChips = useMemo(
    () => [{ id: null, name: 'Semua', icon: 'apps-outline' as const }, ...categories],
    [categories],
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Kelola Menu"
        subtitle="Data menu, harga, dan stok"
        rightIcon="add"
        rightLabel="Tambah"
        onRightPress={() => navigation.navigate('MenuForm')}
      />

      {/* Area pencarian & filter */}
      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari nama menu..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} accessibilityRole="button">
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={() => navigation.navigate('CategoryList')}
            style={({ pressed }) => [styles.categoryButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Kelola kategori"
          >
            <Ionicons name="options-outline" size={20} color={COLORS.white} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {categoryChips.map((chip) => {
            const isActive = chip.id === selectedCategory;
            return (
              <Pressable
                key={chip.id === null ? 'all' : `cat-${chip.id}`}
                onPress={() => setSelectedCategory(chip.id)}
                style={({ pressed }) => [
                  styles.chip,
                  isActive && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <ErrorBanner message={error} onRetry={loadData} />
        </View>
      ) : null}

      {loading ? (
        <LoadingState message="Memuat daftar menu..." />
      ) : (
        <FlatList
          data={menus}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="fast-food-outline"
              title={search || selectedCategory ? 'Menu tidak ditemukan' : 'Belum ada menu'}
              message={
                search || selectedCategory
                  ? 'Coba ubah kata kunci pencarian atau pilih kategori lain.'
                  : 'Tambahkan menu pertama untuk mulai mencatat penjualan.'
              }
              actionLabel={search || selectedCategory ? undefined : 'Tambah Menu'}
              onAction={search || selectedCategory ? undefined : () => navigation.navigate('MenuForm')}
            />
          }
          renderItem={({ item }) => (
            <MenuCard
              menu={item}
              onEdit={() => navigation.navigate('MenuForm', { menuId: item.id })}
              onDelete={() => setDeleteTarget(item)}
              disabled={deleting}
            />
          )}
        />
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Hapus Menu?"
        message={`Menu "${deleteTarget?.name ?? ''}" akan dihapus. Jika menu pernah dipakai pada transaksi, menu akan dinonaktifkan agar riwayat tetap akurat.`}
        confirmLabel="Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
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
    paddingBottom: SPACING.sm,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    ...SHADOWS.card,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  categoryButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  chipContainer: {
    paddingVertical: SPACING.md,
    paddingRight: SPACING.lg,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  errorWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
