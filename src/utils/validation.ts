/**
 * validation.ts
 * ---------------------------------------------------------------
 * Berisi validasi input formulir dan validasi keranjang transaksi.
 * Validasi dilakukan sebelum data dikirim ke database (lapisan aplikasi)
 * dan sebelum query INSERT/UPDATE dijalankan.
 */

import type { CartItem, CategoryFormData, MenuFormData, ValidationResult } from '../types';

/**
 * Validasi formulir kategori.
 * - Nama wajib diisi
 * - Nama tidak boleh duplikat (diperiksa case-insensitive)
 */
export const validateCategoryForm = (
  data: CategoryFormData,
  existingNames: string[] = [],
  currentId?: number,
): ValidationResult => {
  const errors: Record<string, string> = {};
  const name = data.name.trim();

  if (!name) {
    errors.name = 'Nama kategori wajib diisi';
  } else if (name.length < 3) {
    errors.name = 'Nama kategori minimal 3 karakter';
  } else if (name.length > 50) {
    errors.name = 'Nama kategori maksimal 50 karakter';
  } else {
    const isDuplicate = existingNames.some(
      (item) => item.trim().toLowerCase() === name.toLowerCase(),
    );
    if (isDuplicate) {
      errors.name = `Kategori "${name}" sudah ada, gunakan nama lain`;
    }
  }

  if (data.description && data.description.length > 200) {
    errors.description = 'Deskripsi maksimal 200 karakter';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validasi formulir menu.
 * - Nama wajib diisi
 * - Kategori wajib dipilih
 * - Harga harus lebih besar dari nol
 * - Stok tidak boleh negatif
 */
export const validateMenuForm = (data: MenuFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  const name = data.name.trim();
  const price = parseInt(data.price.replace(/[^0-9]/g, ''), 10);
  const stock = parseInt(data.stock.replace(/[^0-9]/g, ''), 10);

  if (!name) {
    errors.name = 'Nama menu wajib diisi';
  } else if (name.length < 2) {
    errors.name = 'Nama menu minimal 2 karakter';
  } else if (name.length > 60) {
    errors.name = 'Nama menu maksimal 60 karakter';
  }

  if (data.category_id === null || data.category_id === undefined) {
    errors.category_id = 'Kategori wajib dipilih';
  }

  if (!data.price.trim() || Number.isNaN(price)) {
    errors.price = 'Harga wajib diisi';
  } else if (price <= 0) {
    errors.price = 'Harga harus lebih besar dari nol';
  } else if (price > 100000000) {
    errors.price = 'Harga terlalu besar';
  }

  if (!data.stock.trim() && data.stock !== '0') {
    errors.stock = 'Stok wajib diisi';
  } else if (Number.isNaN(stock)) {
    errors.stock = 'Stok harus berupa angka';
  } else if (stock < 0) {
    errors.stock = 'Stok tidak boleh negatif';
  } else if (stock > 100000) {
    errors.stock = 'Stok terlalu banyak';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validasi keranjang transaksi.
 * - Keranjang tidak boleh kosong
 * - Jumlah pembelian minimal 1
 * - Jumlah tidak boleh melebihi stok tersedia
 * - Menu dengan stok 0 tidak boleh dibeli
 */
export const validateCart = (items: CartItem[]): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!items || items.length === 0) {
    errors.cart = 'Keranjang belanja masih kosong';
    return { isValid: false, errors };
  }

  let hasInvalidItem = false;
  let hasStockIssue = false;
  const problemItems: string[] = [];

  items.forEach((item) => {
    if (item.quantity < 1) {
      hasInvalidItem = true;
      problemItems.push(`${item.name}: jumlah minimal 1`);
    } else if (item.stock <= 0) {
      hasStockIssue = true;
      problemItems.push(`${item.name}: stok habis`);
    } else if (item.quantity > item.stock) {
      hasStockIssue = true;
      problemItems.push(`${item.name}: stok hanya ${item.stock}`);
    }
  });

  if (hasInvalidItem) {
    errors.cart = `Jumlah pembelian tidak valid - ${problemItems.join(', ')}`;
  } else if (hasStockIssue) {
    errors.cart = `Stok tidak mencukupi - ${problemItems.join(', ')}`;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Memastikan kategori tidak dipakai oleh menu lain (untuk hapus kategori).
 */
export const validateCategoryDeletion = (menuCount: number): ValidationResult => {
  if (menuCount > 0) {
    return {
      isValid: false,
      errors: {
        category: `Kategori masih digunakan oleh ${menuCount} menu. Pindahkan atau hapus menu tersebut terlebih dahulu.`,
      },
    };
  }
  return { isValid: true, errors: {} };
};

/**
 * Mengubah hasil validasi menjadi pesan tunggal (untuk Alert).
 */
export const getFirstError = (result: ValidationResult): string => {
  const keys = Object.keys(result.errors);
  if (keys.length === 0) return '';
  return result.errors[keys[0]];
};
