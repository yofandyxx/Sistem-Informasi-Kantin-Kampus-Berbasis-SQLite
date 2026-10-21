/**
 * dateUtils.ts
 * ---------------------------------------------------------------
 * Utilitas tanggal & waktu untuk laporan, struk, dan riwayat transaksi.
 * Tanggal disimpan di SQLite dengan format "YYYY-MM-DD HH:MM:SS"
 * (waktu lokal perangkat) sehingga pengurutan berdasarkan tanggal selalu benar.
 */

const BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Mengubah objek Date menjadi format "YYYY-MM-DD" (format kunci tanggal).
 */
export const toISODate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Mengubah objek Date menjadi format "YYYY-MM" (format kunci bulan).
 */
export const toISOMonth = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Mengubah string waktu SQLite ("YYYY-MM-DD HH:MM:SS") menjadi objek Date.
 * Karena format SQLite memakai spasi, diubah menjadi "T" agar aman di semua perangkat.
 */
export const parseSqlDate = (value: string): Date => {
  if (!value) return new Date();
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

/** Format tanggal ringkas: "21 Okt 2026" */
export const formatDate = (value: string | Date): string => {
  const date = typeof value === 'string' ? parseSqlDate(value) : value;
  return `${date.getDate()} ${BULAN_PENDEK[date.getMonth()]} ${date.getFullYear()}`;
};

/** Format tanggal panjang: "Rabu, 21 Oktober 2026" */
export const formatLongDate = (value: string | Date): string => {
  const date = typeof value === 'string' ? parseSqlDate(value) : value;
  return `${HARI[date.getDay()]}, ${date.getDate()} ${BULAN_PANJANG[date.getMonth()]} ${date.getFullYear()}`;
};

/** Format jam: "17:14" */
export const formatTime = (value: string | Date): string => {
  const date = typeof value === 'string' ? parseSqlDate(value) : value;
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}.${minute}`;
};

/** Format tanggal + jam: "21 Okt 2026, 17.14" */
export const formatDateTime = (value: string | Date): string => {
  const date = typeof value === 'string' ? parseSqlDate(value) : value;
  return `${formatDate(date)}, ${formatTime(date)}`;
};

/** Jam berapa ini (format SQLite: "YYYY-MM-DD HH:MM:SS") */
export const nowSqlDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  const hour = `${now.getHours()}`.padStart(2, '0');
  const minute = `${now.getMinutes()}`.padStart(2, '0');
  const second = `${now.getSeconds()}`.padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/** Tanggal hari ini (YYYY-MM-DD) */
export const getTodayISO = (): string => toISODate(new Date());

/** Bulan ini (YYYY-MM) */
export const getCurrentMonth = (): string => toISOMonth(new Date());

/** Label bulan dari format "YYYY-MM", contoh: "Oktober 2026" */
export const getMonthLabel = (month: string): string => {
  if (!month) return 'Semua Bulan';
  const [year, monthIndex] = month.split('-');
  const index = parseInt(monthIndex, 10) - 1;
  if (Number.isNaN(index) || index < 0 || index > 11) return month;
  return `${BULAN_PANJANG[index]} ${year}`;
};

/** Label tanggal pendek dari format "YYYY-MM-DD", contoh: "Sen 21" */
export const getDayLabel = (date: string): string => {
  const parsed = parseSqlDate(`${date} 00:00:00`);
  const dayShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][parsed.getDay()];
  return `${dayShort} ${parsed.getDate()}`;
};

/**
 * Daftar opsi bulan (untuk filter laporan), default 12 bulan terakhir.
 */
export const getMonthOptions = (count = 12): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = toISOMonth(date);
    options.push({ value, label: getMonthLabel(value) });
  }
  return options;
};

/**
 * Daftar N hari terakhir (untuk grafik dashboard), contoh: "Sen 21".
 */
export const getLastDays = (count = 7): { value: string; label: string }[] => {
  const result: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const value = toISODate(date);
    result.push({ value, label: getDayLabel(value) });
  }
  return result;
};

/** Mengecek apakah dua tanggal (YYYY-MM-DD) sama */
export const isSameDate = (a: string, b: string): boolean => a === b;
