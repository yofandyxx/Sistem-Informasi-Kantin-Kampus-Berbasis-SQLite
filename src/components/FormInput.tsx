/**
 * FormInput.tsx
 * ---------------------------------------------------------------
 * Komponen input yang konsisten untuk seluruh formulir.
 * Menyediakan label, pesan error, ikon, serta prefix/suffix (misal "Rp").
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import type { IconName } from '../types';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: IconName;
  /** Teks di depan input, contoh: "Rp" */
  prefix?: string;
  /** Teks di belakang input, contoh: "porsi" */
  suffix?: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  icon,
  prefix,
  suffix,
  required,
  style,
  ...inputProps
}) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        {icon ? <Ionicons name={icon} size={18} color={COLORS.textMuted} style={styles.icon} /> : null}

        {prefix ? <Text style={styles.affix}>{prefix}</Text> : null}

        <TextInput
          {...inputProps}
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textMuted}
        />

        {suffix ? <Text style={styles.affix}>{suffix}</Text> : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: 6,
  },
  required: {
    color: COLORS.danger,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  inputRowError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerLight,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  affix: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    marginLeft: 4,
  },
});
