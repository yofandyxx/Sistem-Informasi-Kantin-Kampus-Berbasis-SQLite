/**
 * CategoryCard.tsx
 * ---------------------------------------------------------------
 * Kartu untuk menampilkan satu kategori: ikon, nama, deskripsi, dan
 * jumlah menu di dalamnya. Dilengkapi tombol edit & hapus.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import type { Category, IconName } from '../types';

interface CategoryCardProps {
  category: Category;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={(category.icon || 'restaurant-outline') as IconName}
          size={24}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>

        {category.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {category.description}
          </Text>
        ) : (
          <Text style={styles.description}>Tanpa deskripsi</Text>
        )}

        <View style={styles.badge}>
          <Ionicons name="fast-food-outline" size={12} color={COLORS.purple} />
          <Text style={styles.badgeText}>{category.menuCount ?? 0} menu</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onEdit ? (
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${category.name}`}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </Pressable>
        ) : null}

        {onDelete ? (
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Hapus ${category.name}`}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
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
  iconWrap: {
    width: 52,
    height: 52,
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
  description: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginTop: 6,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.purple,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: 4,
  },
  actions: {
    alignItems: 'center',
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
});
