/**
 * theme.ts
 * ---------------------------------------------------------------
 * Berisi definisi tampilan (design token) aplikasi PPNP Canteen:
 * warna, spasi, radius, ukuran huruf, dan shadow.
 *
 * Semua komponen dan screen cukup meng-import konstanta dari file ini
 * sehingga tampilan aplikasi konsisten dan mudah diubah (satu titik ubah).
 */

/** Warna utama aplikasi (biru tua) */
export const COLORS = {
  primary: '#0B3C8C', // biru tua - warna identitas kantin kampus
  primaryDark: '#082A63', // biru tua lebih gelap untuk header
  primaryLight: '#E3ECFB', // biru muda untuk background kartu
  accent: '#F97316', // oranye - aksen utama (tombol aksi)
  accentLight: '#FFF1E6', // oranye muda
  success: '#16A34A', // hijau - stok tersedia / berhasil
  successLight: '#DCFCE7',
  warning: '#F59E0B', // kuning - stok menipis
  warningLight: '#FEF3C7',
  danger: '#DC2626', // merah - stok habis / hapus
  dangerLight: '#FEE2E2',
  purple: '#7C3AED', // ungu - kategori laporan
  purpleLight: '#EDE9FE',
  teal: '#0D9488', // tosca - info tambahan
  tealLight: '#CCFBF1',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F4F6FB', // background layar
  surface: '#FFFFFF', // background kartu
  textPrimary: '#1F2937', // teks utama
  textSecondary: '#6B7280', // teks sekunder
  textMuted: '#9CA3AF', // teks lemah / placeholder
  border: '#E5E7EB', // garis pembatas
  overlay: 'rgba(15, 23, 42, 0.55)', // background modal
} as const;

/** Daftar warna yang dipakai untuk kartu statistik pada Dashboard */
export const STAT_COLORS = [
  COLORS.primary,
  COLORS.accent,
  COLORS.success,
  COLORS.purple,
  COLORS.teal,
  COLORS.danger,
] as const;

/** Ukuran spasi (padding & margin) dalam satuan piksel */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Radius sudut untuk membuat tampilan modern (rounded) */
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Pilihan ukuran teks */
export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  huge: 34,
} as const;

/** Berat huruf (font weight) */
export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

/** Konfigurasi shadow yang konsisten antar platform */
export const SHADOWS = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;

/** Gaya tombol utama (misal: "Simpan Transaksi") */
export const BUTTON_VARIANTS = {
  primary: {
    backgroundColor: COLORS.primary,
    textColor: COLORS.white,
  },
  accent: {
    backgroundColor: COLORS.accent,
    textColor: COLORS.white,
  },
  success: {
    backgroundColor: COLORS.success,
    textColor: COLORS.white,
  },
  danger: {
    backgroundColor: COLORS.danger,
    textColor: COLORS.white,
  },
  outline: {
    backgroundColor: COLORS.white,
    textColor: COLORS.primary,
  },
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
