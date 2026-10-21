/**
 * AppHeader.tsx
 * ---------------------------------------------------------------
 * Header yang dipakai seluruh halaman: judul, sub judul, tombol kembali,
 * dan tombol aksi di sisi kanan. Warna header biru tua sesuai identitas app.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import type { IconName } from '../types';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Tombol kembali (biasanya diisi navigation.goBack) */
  onBack?: () => void;
  /** Aksi di kanan, contoh: tombol tambah menu */
  rightIcon?: IconName;
  onRightPress?: () => void;
  rightLabel?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  rightLabel,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </Pressable>
        ) : (
          <View style={styles.brandMark}>
            <Ionicons name="restaurant" size={22} color={COLORS.white} />
          </View>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightIcon && onRightPress ? (
          <Pressable
            onPress={onRightPress}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={rightLabel ?? 'Aksi'}
          >
            <Ionicons name={rightIcon} size={20} color={COLORS.white} />
            {rightLabel ? <Text style={styles.actionLabel}>{rightLabel}</Text> : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    height: 38,
    borderRadius: RADIUS.pill,
  },
  actionLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.75,
  },
});
