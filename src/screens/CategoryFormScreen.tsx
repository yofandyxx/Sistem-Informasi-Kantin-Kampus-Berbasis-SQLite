/**
 * CategoryFormScreen.tsx
 * ---------------------------------------------------------------
 * Formulir tambah / edit kategori (Input 1.1).
 * Field: Nama kategori (wajib & unik), Ikon, Deskripsi (opsional).
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ActionButton } from '../components/ActionButton';
import { AppHeader } from '../components/AppHeader';
import { FormInput } from '../components/FormInput';
import { LoadingState } from '../components/Feedback';
import { CATEGORY_ICON_OPTIONS } from '../constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import {
  createCategory,
  getCategoryById,
  getCategoryNames,
  updateCategory,
} from '../services/categoryService';
import type { CategoryFormData, IconName, StackScreenProps } from '../types';
import { getFirstError, validateCategoryForm } from '../utils/validation';

export const CategoryFormScreen: React.FC<StackScreenProps<'CategoryForm'>> = ({
  navigation,
  route,
}) => {
  const categoryId = route.params?.categoryId;
  const isEdit = typeof categoryId === 'number';

  const [form, setForm] = useState<CategoryFormData>({
    name: '',
    icon: 'restaurant-outline',
    description: '',
  });
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  /** Mengambil data kategori (mode edit) & daftar nama kategori (cek duplikat) */
  const loadData = useCallback(async () => {
    try {
      const names = await getCategoryNames();
      setExistingNames(names);

      if (isEdit && categoryId !== undefined) {
        const category = await getCategoryById(categoryId);
        if (category) {
          setForm({
            name: category.name,
            icon: category.icon,
            description: category.description ?? '',
          });
        }
      }
    } catch (err) {
      Alert.alert('Gagal Memuat', err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [isEdit, categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Mengubah nilai field formulir */
  const updateField = <K extends keyof CategoryFormData>(
    key: K,
    value: CategoryFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => ({ ...prev, [key as string]: '' }));
    }
  };

  /** Menyimpan kategori (tambah / edit) */
  const handleSave = async () => {
    const validation = validateCategoryForm(form, existingNames, categoryId);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Data Belum Lengkap', getFirstError(validation));
      return;
    }

    try {
      setSaving(true);
      if (isEdit && categoryId !== undefined) {
        await updateCategory(categoryId, form);
        Alert.alert('Berhasil', `Kategori "${form.name.trim()}" berhasil diperbarui.`);
      } else {
        await createCategory(form);
        Alert.alert('Berhasil', `Kategori "${form.name.trim()}" berhasil ditambahkan.`);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal Menyimpan', err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Kategori" onBack={() => navigation.goBack()} />
        <LoadingState message="Memuat data kategori..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader
        title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
        subtitle={isEdit ? 'Perbarui data kategori' : 'Buat kategori baru'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <FormInput
            label="Nama Kategori"
            required
            icon="pricetags-outline"
            placeholder="Contoh: Makanan Berat"
            value={form.name}
            onChangeText={(text) => updateField('name', text)}
            error={errors.name}
          />

          <FormInput
            label="Deskripsi"
            icon="document-text-outline"
            placeholder="Keterangan singkat kategori (opsional)"
            multiline
            numberOfLines={3}
            value={form.description}
            onChangeText={(text) => updateField('description', text)}
            error={errors.description}
          />

          <Text style={styles.label}>Ikon Kategori</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.iconRow}
          >
            {CATEGORY_ICON_OPTIONS.map((option) => {
              const isActive = form.icon === option.icon;
              return (
                <Pressable
                  key={option.icon}
                  onPress={() => updateField('icon', option.icon)}
                  style={({ pressed }) => [
                    styles.iconOption,
                    isActive && styles.iconOptionActive,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Pilih ikon ${option.name}`}
                >
                  <Ionicons
                    name={option.icon as IconName}
                    size={22}
                    color={isActive ? COLORS.white : COLORS.primary}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          <ActionButton
            label={isEdit ? 'Simpan Perubahan' : 'Simpan Kategori'}
            icon="save-outline"
            onPress={handleSave}
            loading={saving}
          />
        </View>

        <Text style={styles.hint}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />{' '}
          Nama kategori tidak boleh sama dengan kategori yang sudah ada (dicek otomatis).
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: 6,
  },
  iconRow: {
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  iconOptionActive: {
    backgroundColor: COLORS.primary,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.75,
  },
});
