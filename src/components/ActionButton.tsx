/**
 * ActionButton.tsx
 * ---------------------------------------------------------------
 * Tombol aksi yang konsisten (utama, sekunder, hapus) dengan dukungan
 * status loading (untuk mencegah penekanan tombol berulang).
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { BUTTON_VARIANTS, COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import type { ButtonVariant } from '../constants/theme';
import type { IconName } from '../types';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  small?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  fullWidth = true,
  small = false,
}) => {
  const variantStyle = BUTTON_VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variant === 'outline' ? COLORS.primary : variantStyle.backgroundColor,
        },
        fullWidth ? styles.fullWidth : null,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.textColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={variantStyle.textColor} /> : null}
          <Text
            style={[
              styles.label,
              small && styles.labelSmall,
              { color: variantStyle.textColor, marginLeft: icon ? 6 : 0 },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: SPACING.lg,
  },
  buttonSmall: {
    height: 38,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  labelSmall: {
    fontSize: FONT_SIZE.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
