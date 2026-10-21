/**
 * StockBadge.tsx
 * ---------------------------------------------------------------
 * Indikator status stok:
 *   - Hijau  : stok tersedia
 *   - Kuning : stok menipis
 *   - Merah  : stok habis
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { STOCK_STATUS_LABEL } from '../constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../constants/theme';
import type { IconName, StockStatus } from '../types';

interface StockBadgeProps {
  status: StockStatus;
  /** Menampilkan jumlah stok di samping label */
  stock?: number;
}

const STATUS_STYLE: Record<StockStatus, { color: string; background: string; icon: IconName }> = {
  TERSEDIA: { color: COLORS.success, background: COLORS.successLight, icon: 'checkmark-circle' },
  MENIPIS: { color: COLORS.warning, background: COLORS.warningLight, icon: 'alert-circle' },
  HABIS: { color: COLORS.danger, background: COLORS.dangerLight, icon: 'close-circle' },
};

export const StockBadge: React.FC<StockBadgeProps> = ({ status, stock }) => {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.TERSEDIA;

  return (
    <View style={[styles.badge, { backgroundColor: style.background }]}>
      <Ionicons name={style.icon} size={13} color={style.color} />
      <Text style={[styles.text, { color: style.color }]}>
        {STOCK_STATUS_LABEL[status]}
        {stock !== undefined ? ` • ${stock}` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  text: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: 4,
  },
});
