/**
 * MenuCard.tsx
 * ---------------------------------------------------------------
 * Kartu untuk menampilkan satu menu: ikon, nama, kategori, harga, dan stok.
 * Bisa dipakai sebagai daftar (dengan tombol edit/hapus) maupun sebagai
 * tombol pemilihan menu pada halaman transaksi.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { getStockStatus } from '../utils/calculation';
import { formatRupiah } from '../utils/currency';
import type { IconName, Menu } from '../types';
import { StockBadge } from './StockBadge';

interface MenuCardProps {
  menu: Menu;
  /** Dipakai pada halaman transaksi: seluruh kartu bisa diklik */
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Tombol aksi khusus, contoh: "Tambah" pada halaman transaksi */
  actionIcon?: 'add' | 'cart';
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  onPress,
  onEdit,
  onDelete,
  actionIcon = 'add',
  actionLabel,
  onAction,
  disabled = false,
}) => {
  const status = getStockStatus(menu.stock);
  const isInactive = menu.is_active === 0;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.pressed : null,
        disabled ? styles.disabled : null,
        isInactive ? styles.inactive : null,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={(menu.icon || 'restaurant-outline') as IconName}
          size={26}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {menu.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="pricetag-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.category} numberOfLines={1}>
            {menu.category_name ?? 'Tanpa Kategori'}
          </Text>
        </View>

        <Text style={styles.price}>{formatRupiah(menu.price)}</Text>

        <View style={styles.badgeRow}>
          <StockBadge status={status} stock={menu.stock} />
          {isInactive ? (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Nonaktif</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        {onEdit ? (
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${menu.name}`}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </Pressable>
        ) : null}

        {onDelete ? (
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Hapus ${menu.name}`}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </Pressable>
        ) : null}

        {onAction ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel ?? 'Tambah ke keranjang'}
          >
            <Ionicons name={actionIcon} size={18} color={COLORS.white} />
            {actionLabel ? <Text style={styles.addText}>{actionLabel}</Text> : null}
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  inactive: {
    backgroundColor: '#F3F4F6',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  category: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginLeft: 4,
    flex: 1,
  },
  price: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  inactiveBadge: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
  },
  inactiveText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    height: 36,
    borderRadius: RADIUS.pill,
  },
  addText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: 4,
  },
});
