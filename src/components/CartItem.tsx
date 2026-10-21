/**
 * CartItem.tsx
 * ---------------------------------------------------------------
 * Baris item pada keranjang belanja: nama menu, harga satuan, kontrol
 * jumlah pembelian, subtotal, dan tombol hapus dari keranjang.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import { formatRupiah } from '../utils/currency';
import type { CartItem as CartItemType, IconName } from '../types';
import { QuantityStepper } from './QuantityStepper';

interface CartItemProps {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const maxReached = item.quantity >= item.stock;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={(item.icon || 'restaurant-outline') as IconName} size={20} color={COLORS.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>{formatRupiah(item.price)} / item</Text>
        <Text style={styles.stock}>Stok: {item.stock}</Text>
      </View>

      <View style={styles.right}>
        <QuantityStepper
          value={item.quantity}
          onDecrease={onDecrease}
          onIncrease={onIncrease}
          maxReached={maxReached}
          minReached={item.quantity <= 1}
          size="small"
        />
        <Text style={styles.subtotal}>{formatRupiah(item.subtotal)}</Text>
      </View>

      <Pressable
        onPress={onRemove}
        style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Hapus ${item.name} dari keranjang`}
      >
        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  price: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  stock: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  right: {
    alignItems: 'flex-end',
    marginHorizontal: SPACING.sm,
  },
  subtotal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
    marginTop: 4,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
