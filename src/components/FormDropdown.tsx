/**
 * FormDropdown.tsx
 * ---------------------------------------------------------------
 * Komponen pilihan (dropdown) sederhana yang dibuat sendiri memakai Modal.
 * Dipakai untuk memilih kategori menu, metode pembayaran, dan filter laporan.
 * Tidak membutuhkan library tambahan sehingga tetap ringan & offline.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants/theme';
import type { IconName } from '../types';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: IconName;
}

interface FormDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  placeholder?: string;
  error?: string;
  icon?: IconName;
  required?: boolean;
  /** Menampilkan tombol "Semua" di atas daftar (dipakai untuk filter) */
  allowClear?: boolean;
}

export const FormDropdown: React.FC<FormDropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Pilih salah satu',
  error,
  icon,
  required,
  allowClear,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.inputRow,
          error ? styles.inputRowError : null,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {icon ? <Ionicons name={icon} size={18} color={COLORS.textMuted} style={styles.icon} /> : null}
        <Text style={[styles.value, !value ? styles.placeholder : null]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
      </Pressable>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} accessibilityRole="button">
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.list}
              ListHeaderComponent={
                allowClear ? (
                  <Pressable
                    onPress={() => {
                      onSelect({ label: '', value: '' });
                      setOpen(false);
                    }}
                    style={styles.option}
                  >
                    <Ionicons name="remove-circle-outline" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.optionText}>Semua</Text>
                  </Pressable>
                ) : undefined
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  {item.icon ? (
                    <Ionicons name={item.icon} size={18} color={COLORS.primary} style={styles.icon} />
                  ) : null}
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value ? (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  ) : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  value: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  placeholder: {
    color: COLORS.textMuted,
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
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
