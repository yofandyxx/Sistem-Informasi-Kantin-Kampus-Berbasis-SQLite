/**
 * BarChart.tsx
 * ---------------------------------------------------------------
 * Grafik batang sederhana yang dibuat menggunakan View (tanpa library chart).
 * Dipakai pada Dashboard (penjualan 7 hari) dan Laporan (penjualan per periode).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import { formatCompactRupiah } from '../utils/currency';
import type { ChartData } from '../types';

interface BarChartProps {
  data: ChartData[];
  /** Tinggi area grafik dalam piksel */
  height?: number;
  color?: string;
  /** Format nilai di atas batang */
  formatValue?: (value: number) => string;
  emptyText?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 160,
  color = COLORS.primary,
  formatValue = formatCompactRupiah,
  emptyText = 'Belum ada data penjualan',
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  // Nilai tertinggi menjadi acuan tinggi batang
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height }]}>
        {data.map((item, index) => {
          const ratio = item.value / maxValue;
          const barHeight = Math.max(item.value > 0 ? 8 : 2, Math.round(ratio * (height - 30)));
          const isLast = index === data.length - 1;

          return (
            <View key={`${item.label}-${index}`} style={styles.column}>
              <Text style={styles.valueText}>{item.value > 0 ? formatValue(item.value) : '-'}</Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: item.value > 0 ? color : COLORS.border,
                    borderTopRightRadius: isLast ? RADIUS.sm : 0,
                    borderTopLeftRadius: isLast ? RADIUS.sm : 0,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        {data.map((item, index) => (
          <Text key={`label-${item.label}-${index}`} style={styles.labelText} numberOfLines={1}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  valueText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: FONT_WEIGHT.medium,
  },
  bar: {
    width: '55%',
    minWidth: 14,
    borderRadius: RADIUS.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  labelText: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});
