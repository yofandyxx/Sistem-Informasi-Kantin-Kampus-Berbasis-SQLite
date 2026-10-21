/**
 * CategoryScreen.tsx
 * ---------------------------------------------------------------
 * Halaman pengelolaan kategori (Input 1.1):
 *   - Menampilkan daftar kategori
 *   - Tambah, edit, dan hapus kategori
 *   - Kategori yang masih dipakai menu tidak dapat dihapus
 */

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { CategoryCard } from '../components/CategoryCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner, LoadingState } from '../components/Feedback';
import { COLORS, SPACING } from '../constants/theme';
import { deleteCategory, getCategories } from '../services/categoryService';
import type { Category, StackScreenProps } from '../types';

export const CategoryScreen: React.FC<StackScreenProps<'CategoryList'>> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  /** Memuat daftar kategori dari database */
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar kategori');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /** Menghapus kategori (divalidasi oleh service & foreign key) */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
      Alert.alert('Berhasil', `Kategori "${deleteTarget.name}" berhasil dihapus.`);
    } catch (err) {
      setDeleteTarget(null);
      Alert.alert(
        'Gagal Hapus',
        err instanceof Error ? err.message : 'Kategori tidak dapat dihapus',
      );
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Kategori"
        subtitle="Kelola kategori makanan & minuman"
        onBack={() => navigation.goBack()}
        rightIcon="add"
        rightLabel="Tambah"
        onRightPress={() => navigation.navigate('CategoryForm')}
      />

      {error ? (
        <View style={styles.errorWrap}>
          <ErrorBanner message={error} onRetry={loadData} />
        </View>
      ) : null}

      {loading ? (
        <LoadingState message="Memuat kategori..." />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="pricetags-outline"
              title="Belum ada kategori"
              message="Tambahkan kategori seperti Makanan Berat, Makanan Ringan, atau Minuman."
              actionLabel="Tambah Kategori"
              onAction={() => navigation.navigate('CategoryForm')}
            />
          }
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onEdit={() => navigation.navigate('CategoryForm', { categoryId: item.id })}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
        />
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Hapus Kategori?"
        message={`Kategori "${deleteTarget?.name ?? ''}" akan dihapus. Kategori yang masih digunakan menu tidak dapat dihapus.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
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
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  errorWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
});
