/**
 * currency.ts
 * ---------------------------------------------------------------
 * Utilitas format mata uang Rupiah.
 * Semua harga di database disimpan sebagai bilangan bulat (integer)
 * dalam satuan Rupiah agar tidak terkena kesalahan pembulatan
 * floating point (contoh: 0.1 + 0.2 !== 0.3).
 */

/**
 * Format angka menjadi Rupiah, contoh: 15000 -> "Rp15.000"
 * @param value nilai rupiah (integer)
 * @param withPrefix apakah menampilkan awalan "Rp" (default true)
 */
export const formatRupiah = (value: number, withPrefix = true): string => {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  const numberText = safeValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withPrefix ? `Rp${numberText}` : numberText;
};

/**
 * Format angka menjadi Rupiah dengan pemisah spasi, contoh: "Rp 15.000"
 * Dipakai pada struk transaksi agar lebih mudah dibaca.
 */
export const formatRupiahSpaced = (value: number): string => {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  const numberText = safeText(safeValue);
  return `Rp ${numberText}`;
};

/** Memisahkan ribuan dengan titik (tanpa awalan Rp) */
const safeText = (value: number): string =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Mengubah input teks user (misal "15.000" atau "Rp 15.000") menjadi angka.
 * Dipakai saat user mengetik harga pada form menu.
 */
export const parseRupiahInput = (text: string): number => {
  if (!text) return 0;
  const digitsOnly = text.replace(/[^0-9]/g, '');
  if (!digitsOnly) return 0;
  const parsed = parseInt(digitsOnly, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Mengubah angka menjadi format ribuan tanpa simbol mata uang,
 * berguna untuk ditampilkan di dalam kolom TextInput.
 */
export const formatNumberInput = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return '';
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/** Format angka ringkas untuk chart, contoh: 1500000 -> "1,5jt" */
export const formatCompactRupiah = (value: number): string => {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  if (Math.abs(safeValue) >= 1000000) {
    return `${(safeValue / 1000000).toFixed(1).replace('.', ',')}jt`;
  }
  if (Math.abs(safeValue) >= 1000) {
    return `${(safeValue / 1000).toFixed(0)}rb`;
  }
  return safeValue.toString();
};
