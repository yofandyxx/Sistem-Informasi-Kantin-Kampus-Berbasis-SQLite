/**
 * MenuFormScreen.tsx
 * ---------------------------------------------------------------
 * Formulir tambah / edit menu (Input 1.2).
 * Field: Nama menu, Kategori (dropdown), Harga, Stok, Ikon.
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
import { FormDropdown } from '../components/FormDropdown';
import { FormInput } from '../components/FormInput';
import { LoadingState } from '../components/Feedback';
import { MENU_ICON_OPTIONS } from '../constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import { getCategories } from '../services/categoryService';
import { createMenu, getMenuById, updateMenu } from '../services/menuService';
import type { Category, IconName, MenuFormData, StackScreenProps } from '../types';
import { formatNumberInput, parseRupiahInput } from '../utils/currency';
import { getFirstError, validateMenuForm } from '../utils/validation';

export const MenuFormScreen: React.FC<StackScreenProps<'MenuForm'>> = ({ navigation, route }) => {
  const menuId = route.params?.menuId;
  const isEdit = typeof menuId === 'number';

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<MenuFormData>({
    name: '',
    category_id: null,
    price: '',
    stock: '',
    icon: 'restaurant-outline',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  /** Mengambil kategori & data menu (bila mode edit) */
  const loadData = useCallback(async () => {
    try {
      const categoryList = await getCategories();
      setCategories(categoryList);

      if (isEdit && menuId !== undefined) {
        const menu = await getMenuById(menuId);
        if (menu) {
          setForm({
            name: menu.name,
            category_id: menu.category_id,
            price: formatNumberInput(menu.price),
            stock: formatNumberInput(menu.stock),
            icon: menu.icon,
          });
        }
      } else if (categoryList.length > 0) {
        // Default kategori pertama agar lebih cepat diisi
        setForm((prev) => ({ ...prev, category_id: prev.category_id ?? categoryList[0].id }));
      }
    } catch (err) {
      Alert.alert('Gagal Memuat', err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [isEdit, menuId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Mengubah nilai field formulir */
  const updateField = <K extends keyof MenuFormData>(key: K, value: MenuFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => ({ ...prev, [key as string]: '' }));
    }
  };

  /** Menyimpan data menu (tambah atau edit) */
  const handleSave = async () => {
    const validation = validateMenuForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Data Belum Lengkap', getFirstError(validation));
      return;
    }

    try {
      setSaving(true);
      if (isEdit && menuId !== undefined) {
        await updateMenu(menuId, form);
        Alert.alert('Berhasil', `Menu "${form.name.trim()}" berhasil diperbarui.`);
      } else {
        await createMenu(form);
        Alert.alert('Berhasil', `Menu "${form.name.trim()}" berhasil ditambahkan.`);
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
        <AppHeader title="Menu" onBack={() => navigation.goBack()} />
        <LoadingState message="Memuat data menu..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader
        title={isEdit ? 'Edit Menu' : 'Tambah Menu'}
        subtitle={isEdit ? 'Perbarui data menu' : 'Lengkapi data menu baru'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <FormInput
            label="Nama Menu"
            required
            icon="restaurant-outline"
            placeholder="Contoh: Nasi Goreng"
            value={form.name}
            onChangeText={(text) => updateField('name', text)}
            error={errors.name}
          />

          <FormDropdown
            label="Kategori"
            required
            icon="pricetags-outline"
            placeholder="Pilih kategori"
            value={
              categories.find((item) => item.id === form.category_id)?.name ?? ''
            }
            options={categories.map((item) => ({ label: item.name, value: item.id.toString() }))}
            onSelect={(option) => updateField('category_id', Number(option.value))}
            error={errors.category_id}
          />

          <FormInput
            label="Harga"
            required
            icon="pricetag-outline"
            placeholder="15000"
            keyboardType="numeric"
            prefix="Rp"
            value={form.price}
            onChangeText={(text) => updateField('price', parseRupiahInput(text).toString())}
            error={errors.price}
          />

          <FormInput
            label="Stok"
            required
            icon="cube-outline"
            placeholder="20"
            keyboardType="numeric"
            suffix="porsi"
            value={form.stock}
            onChangeText={(text) => updateField('stock', parseRupiahInput(text).toString())}
            error={errors.stock}
          />

          {/* Pemilih ikon bawaan aplikasi (offline, tanpa kamera/upload) */}
          <Text style={styles.label}>Ikon Menu</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.iconRow}
          >
            {MENU_ICON_OPTIONS.map((option) => {
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
            label={isEdit ? 'Simpan Perubahan' : 'Simpan Menu'}
            icon="save-outline"
            onPress={handleSave}
            loading={saving}
          />
        </View>

        <Text style={styles.hint}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />{' '}
          Harga disimpan dalam satuan Rupiah bilangan bulat agar tidak terjadi kesalahan
          pembulatan.
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
