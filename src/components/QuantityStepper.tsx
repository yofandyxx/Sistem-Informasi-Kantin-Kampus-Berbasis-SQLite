/**
 * QuantityStepper.tsx
 * ---------------------------------------------------------------
 * Kontrol jumlah pembelian: tombol kurang, nilai jumlah, tombol tambah.
 * Dipakai pada halaman transaksi (keranjang & pemilihan menu).
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../constants/theme';

interface QuantityStepperProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  /** Mencegah tombol tambah ketika jumlah sudah mencapai stok */
  maxReached?: boolean;
  /** Mencegah tombol kurang pada jumlah 1 */
  minReached?: boolean;
  size?: 'small' | 'medium';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onDecrease,
  onIncrease,
  maxReached = false,
  minReached = false,
  size = 'medium',
}) => {
  const isSmall = size === 'small';
  const buttonSize = isSmall ? 30 : 36;
  const iconSize = isSmall ? 15 : 18;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrease}
        disabled={minReached}
        style={({ pressed }) => [
          styles.button,
          { width: buttonSize, height: buttonSize },
          pressed && styles.pressed,
          minReached && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Kurangi jumlah"
      >
        <Ionicons name="remove" size={iconSize} color={COLORS.primary} />
      </Pressable>

      <Text style={[styles.value, isSmall && styles.valueSmall]}>{value}</Text>

      <Pressable
        onPress={onIncrease}
        disabled={maxReached}
        style={({ pressed }) => [
          styles.button,
          { width: buttonSize, height: buttonSize },
          pressed && styles.pressed,
          maxReached && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Tambah jumlah"
      >
        <Ionicons name="add" size={iconSize} color={COLORS.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 34,
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  valueSmall: {
    minWidth: 28,
    fontSize: FONT_SIZE.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
