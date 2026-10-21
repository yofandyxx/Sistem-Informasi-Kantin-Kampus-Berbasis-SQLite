/**
 * Feedback.tsx
 * ---------------------------------------------------------------
 * Komponen umpan balik pengguna:
 *   - LoadingState : tampilan saat data sedang dimuat
 *   - ErrorBanner  : tampilan pesan error
 *   - SuccessBanner: tampilan pesan berhasil
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import type { IconName } from '../types';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Memuat data...',
}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

interface BannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<BannerProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.banner}>
      <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
      <View style={styles.bannerTextWrap}>
        <Text style={styles.bannerText}>{message}</Text>
        {onRetry ? (
          <Text style={styles.retryText} onPress={onRetry}>
            Ketuk untuk mencoba lagi
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export const SuccessBanner: React.FC<BannerProps> = ({ message }) => {
  return (
    <View style={[styles.banner, styles.successBanner]}>
      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      <View style={styles.bannerTextWrap}>
        <Text style={[styles.bannerText, { color: COLORS.success }]}>{message}</Text>
      </View>
    </View>
  );
};

/** Judul bagian dengan ikon (dipakai di beberapa halaman) */
export const SectionTitle: React.FC<{ title: string; icon?: IconName; action?: string }> = ({
  title,
  icon,
  action,
}) => {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleLeft}>
        {icon ? <Ionicons name={icon} size={18} color={COLORS.primary} /> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  successBanner: {
    backgroundColor: COLORS.successLight,
  },
  bannerTextWrap: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  bannerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.danger,
    lineHeight: 19,
  },
  retryText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  sectionAction: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
