# PPNP Canteen — Sistem Informasi Kantin Kampus (SQLite)

**Project:** PPNPCanteen
**Nama Aplikasi:** PPNP Canteen
**Deskripsi:** Sistem Informasi Kantin Kampus
**Mata Kuliah:** Workshop Pemrograman Mobile
**Program Studi:** Teknologi Rekayasa Komputer

Aplikasi mobile Point-of-Sale (POS) sederhana untuk mengelola kantin kampus.
Seluruh data (kategori, menu, transaksi, detail transaksi) disimpan **offline** di
perangkat Android menggunakan **SQLite** (`expo-sqlite`) — tanpa server, REST API,
Firebase, GPS, kamera, maupun autentikasi online.

---

## DAFTAR ISI

1. [TAHAP 1 — Persiapan Project](#tahap-1--persiapan-project)
2. [TAHAP 2 — Struktur Folder](#tahap-2--struktur-folder)
3. [TAHAP 3 — Ringkasan Pembuatan Kode](#tahap-3--ringkasan-pembuatan-kode)
4. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
5. [Ringkasan Fitur](#ringkasan-fitur)
6. [Dokumentasi Lain](#dokumentasi-lain)

---

## TAHAP 1 — PERSIAPANAN PROJECT

### 1.1 Persyaratan (Prasyarat)

| Kebutuhan | Versi Minimum | Versi yang Dipakai saat Pembuatan | Keterangan |
|---|---|---|---|
| Node.js | 18.x LTS (disarankan 20/22/24) | v24.11.1 | Runtime JavaScript yang menjalankan Metro Bundler & TypeScript |
| npm | 9.x (ikut versi Node) | 11.6.2 | Package manager untuk memasang dependency |
| Android | Android 8.0 (API 26) ke atas | - | Target perangkat yang menjalankan Expo Go |
| Expo Go | Versi **terbaru** di Google Play | - | Expo Go selalu mendukung SDK terbaru |
| VS Code | Versi terbaru | - | Editor kode + ekstensi React Native Tools |
| Koneksi internet | Diperlukan saat `npm install` | - | Setelah terpasang, aplikasi berjalan **offline** |

> **Penting:** Expo Go **hanya** mendukung satu versi SDK terbaru.
> Jika aplikasi gagal dimuat di perangkat, perbarui Expo Go di Play Store.

### 1.2 Cara Membuat Project Expo TypeScript

```bash
# 1. Membuat folder project (nama folder = PPNPCanteen)
npx create-expo-app@latest PPNPCanteen --template blank-typescript

# 2. Masuk ke folder project
cd PPNPCanteen

# 3. Memasang dependency dasar (expo, react, react-native, typescript)
npm install
```

**Fungsi perintah:** membuat scaffold project Expo dengan template TypeScript minimal
(bukan template "tabs" agar struktur folder tetap bersih dan mudah dimodifikasi).
**Indikator keberhasilan:** muncul folder `PPNPCanteen` berisi `App.tsx`,
`package.json`, `app.json`, `tsconfig.json`, dan folder `assets/`.

### 1.3 Cara Membuka Project Menggunakan VS Code

```bash
code PPNPCanteen
```

Atau melalui GUI VS Code: **File → Open Folder... → pilih folder `PPNPCanteen`**.

Ekstensi VS Code yang disarankan (opsional):
* **ES7+ React/Redux/React-Native Snippets** — percepat penulisan kode.
* **Prettier** — format kode otomatis (`Shift+Alt+F`).
* **Error Lens** — menampilkan error TypeScript langsung di baris kode.

### 1.4 Daftar Dependency & Fungsi

| No. | Dependency | Versi | Fungsi | Perintah Instalasi |
|---|---|---|---|---|
| 1 | `expo` | `~58.0.16` | Framework inti Expo (bundler Metro, konfigurasi app, CLI `expo`) |included dalam `create-expo-app` |
| 2 | `react` | `19.3.0` | Library UI React (JSX, hooks, state) |included dalam `create-expo-app` |
| 3 | `react-native` | `0.88.0` | Komponen native Android (View, Text, FlatList, Modal, dll) | included dalam `create-expo-app` |
| 4 | `typescript` | `~6.0.3` | Type checking statis (dicek dengan `npx tsc --noEmit`) | included dalam `create-expo-app` |
| 5 | `expo-sqlite` | `~58.0.13` | **Database lokal SQLite** (CREATE TABLE, query terparameterisasi, transaksi atomik) | `npx expo install expo-sqlite` |
| 6 | `@expo/vector-icons` | `^15.0.2` | Ikon food/drink/cart/report bawaan aplikasi (offline) | `npx expo install @expo/vector-icons` |
| 7 | `@react-navigation/native` | `^7.5.1` | Inti navigasi (NavigationContainer, useFocusEffect) | `npx expo install @react-navigation/native` |
| 8 | `@react-navigation/native-stack` | `^7.21.0` | Navigasi stack (form, struk, riwayat) | `npx expo install @react-navigation/native-stack` |
| 9 | `@react-navigation/bottom-tabs` | `^7.21.0` | Bottom navigation 5 menu utama | `npx expo install @react-navigation/bottom-tabs` |
| 10 | `react-native-screens` | `~4.30.0` | Performa navigasi native (wajib untuk native-stack) | `npx expo install react-native-screens` |
| 11 | `react-native-safe-area-context` | `~5.10.1` | Handling notch/status bar Android | `npx expo install react-native-safe-area-context` |
| 12 | `expo-status-bar` | `~58.0.3` | Kontrol warna status bar | included dalam `create-expo-app` |

> Tidak ada library chart berat. Grafik batang dibuat sendiri dengan `View`
> (lihat [`src/components/BarChart.tsx`](src/components/BarChart.tsx)).

### 1.5 Perintah Instalasi Menurut Urutan

```bash
# Tahap 1 - dependency dasar (dari template)
npm install

# Tahap 2 - native module yang harus cocok dengan SDK Expo
npx expo install expo-sqlite @expo/vector-icons react-native-screens react-native-safe-area-context

# Tahap 3 - library navigasi (versi murni JS, boleh versi terbaru)
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
```

**Fungsi perintah:** `npx expo install` memilih versi yang **sudah diuji kompatibel**
dengan SDK Expo yang sedang dipakai (dibaca dari `expo install --check`).
**Kapan dijalankan:** sekali setelah membuat project.
**Indikator keberhasilan:** semua paket tampil di `package.json` tanpa error peer dependency.

### 1.6 Cara Memeriksa Kompatibilitas Dependency

```bash
npx expo-doctor          # memeriksa versi SDK, native module, dan konfigurasi app
npx expo install --check # memastikan semua dependency sudah versi yang benar
```

Jika `expo-doctor` melaporkan versi tidak cocok, jalankan:

```bash
npx expo install --fix
```

### 1.7 Cara Menjalankan Expo Go (Android)

1. Instal **Expo Go** dari Google Play Store (pastikan versi **terbaru**).
2. Hubungkan HP dan komputer ke **Wi-Fi yang sama**.
3. Jalankan server bundler di komputer:

   ```bash
   npx expo start
   ```

4. Pilih **`a`** (Android) atau pindai **QR code** yang tampil di terminal
   menggunakan aplikasi **Expo Go** di HP.
5.otekan **"s"** untuk membuka QR code langsung di HP.
6. Alternatif tanpa kabel USB (Android): aktifkan *Developer options → USB debugging* lalu
   jalankan `npx expo start --android` (Expo Go akan terpasang otomatis dari Play Store).
7. Untukygudang dengan HP dan laptop pada jaringan berbeda: `npx expo start --tunnel`.

### 1.8 Cara Memeriksa TypeScript

```bash
npx tsc --noEmit
```

**Target hasil pemeriksaan: 0 error TypeScript.**
Jika masih ada error, perbaiki pada file yang disebutkan di terminal, lalu ulangi perintah.

---

## TAHAP 2 — STRUKTUR FOLDER

```
PPNPCanteen/
├── App.tsx                      # Entry point: inisialisasi database + render navigasi
├── index.ts                     # registerRootComponent (dibuat otomatis Expo)
├── package.json                 # Daftar dependency & script
├── app.json                     # Konfigurasi Expo (nama, ikon, splash, plugin)
├── tsconfig.json                # Konfigurasi TypeScript (strict)
├── assets/                      # Ikon aplikasi & splash screen
├── .gitignore
└── src/
    ├── components/              # Komponen UI reusable
    │   ├── ActionButton.tsx     # Tombol dengan varian & status loading
    │   ├── AppHeader.tsx        # Header halaman (judul, tombol kembali, aksi)
    │   ├── BarChart.tsx         # Grafik batang sederhana (tanpa library)
    │   ├── CartItem.tsx         # Baris item keranjang
    │   ├── CategoryCard.tsx     # Kartu kategori
    │   ├── ConfirmDialog.tsx    # Dialog konfirmasi hapus
    │   ├── EmptyState.tsx       # Tampilan data kosong
    │   ├── Feedback.tsx         # LoadingState, ErrorBanner, SuccessBanner, SectionTitle
    │   ├── FormDropdown.tsx     # Dropdown (modal) untuk pilihan
    │   ├── FormInput.tsx        # Input form + label + pesan error
    │   ├── MenuCard.tsx         # Kartu menu
    │   ├── QuantityStepper.tsx  # Kontrol jumlah (+/-)
    │   ├── StatCard.tsx         # Kartu statistik dashboard
    │   └── StockBadge.tsx       # Indikator status stok
    ├── screens/                 # Halaman aplikasi
    │   ├── DashboardScreen.tsx
    │   ├── MenuScreen.tsx
    │   ├── MenuFormScreen.tsx
    │   ├── CategoryScreen.tsx
    │   ├── CategoryFormScreen.tsx
    │   ├── TransactionScreen.tsx
    │   ├── ReceiptScreen.tsx
    │   ├── TransactionHistoryScreen.tsx
    │   ├── ReportScreen.tsx
    │   ├── StockReportScreen.tsx
    │   └── ProfileScreen.tsx
    ├── navigation/
    │   └── AppNavigator.tsx     # Stack + bottom tabs
    ├── database/
    │   ├── database.ts          # Koneksi, inisialisasi, seeding, helper query
    │   └── schema.ts            # DDL tabel, index, query agregat
    ├── services/                # Logika bisnis / CRUD per tabel
    │   ├── categoryService.ts
    │   ├── menuService.ts
    │   ├── transactionService.ts
    │   └── reportService.ts
    ├── types/
    │   └── index.ts             # Semua tipe data TypeScript
    ├── utils/
    │   ├── validation.ts        # Validasi form & keranjang
    │   ├── currency.ts          # Format Rupiah
    │   ├── dateUtils.ts         # Format tanggal/bulan
    │   └── calculation.ts       # Rumus subtotal, total, status stok
    └── constants/
        ├── theme.ts             # Warna, spasi, radius, typography
        ├── appConstants.ts      # Identitas app, metode bayar, ikon, data contoh
        └── index.ts             # Re-export
```

**Pembagian tanggung jawab:**

| Folder | Tanggung jawab | Contoh |
|---|---|---|
| `components/` | Komponen UI presentasi, tanpa akses database | `MenuCard`, `StatCard` |
| `screens/` | Menggabungkan komponen + service (logic flow halaman) | `TransactionScreen` |
| `services/` | Seluruh operasi CRUD & query SQL | `createTransaction()` |
| `database/` | Koneksi, skema, transaksi SQL | `withTransactionAsync()` |
| `types/` | Kontrak data antar layer | `interface Menu` |
| `utils/` | Fungsi murni (tanpa state & tanpa DB) | `formatRupiah()` |
| `constants/` | Nilai tetap aplikasi | `COLORS`, `PAYMENT_METHODS` |

---

## TAHAP 3 — RINGKASAN PEMBUATAN KODE

Urutan pembuatan kode (disiplin, dari bawah ke atas):

1. **Konfigurasi project** — `package.json`, `app.json`, `tsconfig.json`.
2. **Types & constants** — `src/types/index.ts`, `src/constants/*`.
3. **Database & schema** — `src/database/schema.ts`, `src/database/database.ts`.
4. **Services** — `categoryService`, `menuService`, `transactionService`, `reportService`.
5. **Utils** — `currency`, `dateUtils`, `calculation`, `validation`.
6. **Components** — 15 komponen UI reusable.
7. **Screens** — 11 halaman yang terhubung penuh dengan navigasi.
8. **Navigation** — `src/navigation/AppNavigator.tsx` (stack + 5 tab).
9. **App.tsx** — inisialisasi database lalu render navigator.

Penjelasan lengkap setiap file (alur kerja, hubungan antar file, konsep yang dipelajari)
terdapat pada **[DOKUMENTASI.md](DOKUMENTASI.md)**.

---

## CARA MENJALANKAN APLIKASI

```bash
# 1. Install dependency
npm install

# 2. Jalankan bundler
npx expo start

# 3. Scan QR code dengan Expo Go (HP Android)

# 4. Periksa TypeScript (harus 0 error)
npx tsc --noEmit
```

> **Catatan penting:** aplikasi **belum diuji pada perangkat fisik** olehosionID
> proyek ini. Pengujian perangkat dilakukan oleh mahasiswa/pembimbing menggunakan
> tabel pengujian pada **[PENGUJIAN.md](PENGUJIAN.md)**.

---

## RINGKASAN FITUR

| Modul | Fitur |
|---|---|
| Dashboard | 5 kartu statistik berwarna, grafik penjualan 7 hari, menu terlaris, transaksi terakhir, aksi cepat |
| Kategori | Tambah, edit, hapus, validasi nama wajib & duplikat, proteksi hapus bila masih dipakai menu |
| Menu | Tambah, edit, hapus (soft delete bila pernah terjual), pencarian nama, filter kategori, validasi harga > 0 & stok ≥ 0, nama unik per kategori |
| Transaksi | Keranjang, ubah jumlah, hapus item, subtotal & total otomatis, metode pembayaran (Tunai / QRIS), simpan atomik, stok berkurang otomatis, cegah simpan ganda |
| Struk | Nomor transaksi, tanggal & waktu, item, jumlah, harga satuan, subtotal, total, metode pembayaran |
| Laporan Penjualan | Filter per bulan / per tanggal, jumlah transaksi, pendapatan, item terjual, rata-rata, grafik, menu terlaris, riwayat transaksi |
| Laporan Stok | Tabel stok per menu + indikator Tersedia / Menipis / Habis, total porsi stok |
| Profil | Identitas aplikasi, ringkasan data, daftar fitur, info database, reset data untuk pengujian ulang |

---

## DOKUMENTASI LAIN

* **[DOKUMENTASI.md](DOKUMENTASI.md)** — TAHAP 4: penjelasan tiap file (fungsi, alur, relasi data, konsep SQLite/React Native).
* **[PENGUJIAN.md](PENGUJIAN.md)** — TAHAP 5: tabel 32 skenario pengujian (status awal **BELUM DIUJI**).
* **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — TAHAP 6: solusi atas 12 masalah umum.
