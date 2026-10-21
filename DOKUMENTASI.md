# TAHAP 4 — PENJELASAN PROGRAM (Per File)

Dokumen ini menjelaskan **setiap file** yang dibuat: fungsi utama, bagian penting,
alur kerja kode, hubungan dengan file lain, serta konsep React Native / TypeScript /
SQLite yang bisa dipelajari dari file tersebut.

---

## 1. KONFIGURASI PROJECT

### [`app.json`](app.json)
* **Fungsi utama:** konfigurasi aplikasi Expo (nama, slug, ikon, splash, package Android, plugin).
* **Bagian penting:** `"name": "PPNP Canteen"` (nama yang muncul di Expo Go),
  `"plugins": [["expo-sqlite", { "enableFTS": false }]]` (plugin resmi SQLite),
  `android.package` (identifier unik saat membuat build).
* **Alur kerja:** Expo CLI membaca file ini saat menjalankan bundler → informsiprofile
  perangkat (nama, ikon, warna splash) dan memuat plugin native.
* **Hubungan dengan file lain:** dibaca otomatis oleh `expo`, tidak di-import manual.
* **Konsep:** *Expo config* bersifat deklaratif (JSON), plugin原生 = cara Expo
  menghubungkan modul native tanpa menulis kode Android/iOS manual.

### [`tsconfig.json`](tsconfig.json)
* **Fungsi utama:** pengaturan compiler TypeScript.
* **Bagian penting:** `"extends": "expo/tsconfig.base"` (aturan dasar Expo) dan
  `"strict": true` (men aktifkan pemeriksaan ketat: no implicit any, null safety, dll).
* **Konsep:** *strict mode*/group法令 membantu menangkap bug sejak awal, misalnya
  lupa handling `null` dari `getFirstAsync()`.

### [`package.json`](package.json)
* **Fungsi utama:** daftar dependency + script (`start`, `android`, `ios`, `web`).
* **Konsep:** *semantic versioning* — `~58.0.16` berarti patch minor bebas,
  `^7.5.1` berarti minor bebas; kedua bentuk dipakai Expo agar versi selalu kompatibel.

---

## 2. ENTRY POINT

### [`App.tsx`](App.tsx)
* **Fungsi utama:** satu-satunya file "root" — menjalankan inisialisasi database lalu
  menampilkan aplikasi.
* **Bagian penting:**
  * `prepareDatabase()` — memanggil `initializeDatabase()` dari `src/database/database.ts`.
  * State `AppState = 'LOADING' | 'READY' | 'ERROR'` — mengatur layar splash, layar
    error, atau aplikasi.
  * `<SafeAreaProvider>` — pembungkus agar `useSafeAreaInsets()` berfungsi.
* **Alur kerja:**
  1. `useEffect` → `prepareDatabase()`.
  2. Selama proses: tampilkan splash "Menyiapkan database SQLite...".
  3. Berhasil → `setState('READY')` → render `<AppNavigator />`.
  4. Gagal → tampilkan pesan error + tombol "coba lagi".
* **Hubungan dengan file lain:** `src/database/database.ts` (inisialisasi),
  `src/navigation/AppNavigator.tsx` (tampilan aplikasi), `src/constants/*` (tema & identitas).
* **Konsep:** *Entry point* sebagai *composition root*; pemisahan inisialisasi
  asynchronous dari render; graceful error handling.

---

## 3. CONSTANTS

### [`src/constants/theme.ts`](src/constants/theme.ts)
* **Fungsi utama:** design token aplikasi (warna, spasi, radius, ukuran font, shadow).
* **Bagian penting:** `COLORS` (biru tua `#0B3C8C` sebagai warna utama, oranye
  `#F97316` sebagai aksen, hijau/kuning/merah untuk status stok), `SPACING`,
  `RADIUS`, `FONT_SIZE`, `FONT_WEIGHT`, `BUTTON_VARIANTS`.
* **Alur kerja:** komponen mengimpor konstanta, tidak menulis hex warna manual →
  mengubah tema cukup di satu tempat.
* **Konsep:** *Design token* & *design system* sederhana.

### [`src/constants/appConstants.ts`](src/constants/appConstants.ts)
* **Fungsi utama:** konstanta bisnis (identitas aplikasi, metode pembayaran, daftar
  ikon bawaan, ambang stok menipis, data contoh).
* **Bagian penting:** `PAYMENT_METHODS` (Tunai & QRIS), `MENU_ICON_OPTIONS` /
  `CATEGORY_ICON_OPTIONS` (ikon Ionicons → aplikasi tetap offline, tanpa kamera),
  `LOW_STOCK_THRESHOLD = 5`, `SEED_CATEGORIES` & `SEED_MENUS` (data contoh awal).
* **Konsep:** *separation of concerns*; data konfigurasi yang diubahzpengajar cukup
  di satu file.

### [`src/constants/index.ts`](src/constants/index.ts)
* **Fungsi utama:** re-export (`export *`) agar cukup satu import:
  `import { COLORS, APP_INFO } from '../constants'`.

---

## 4. TYPES

### [`src/types/index.ts`](src/types/index.ts)
* **Fungsi utama:** semua tipe data TypeScript dalam satu tempat (dokumentasi
  "bentuk data" aplikasi).
* **Bagian penting:**
  * Entitas DB: `Category`, `Menu`, `Transaction`, `TransactionDetail`,
    `TransactionWithDetails`.
  * Tipe aplikasi: `PaymentMethod`, `StockStatus`, `CartItem`, `CategoryFormData`,
    `MenuFormData`, `ValidationResult`, `MenuFilter`, `DashboardStats`, `ChartData`,
    `TopMenu`, `SalesReport`, `StockReportItem`.
  * Navigasi: `MainTabParamList`, `RootStackParamList`, `TabScreenProps<T>`,
    `StackScreenProps<T>`.
* **Konsep:** *TypeScript interface* & *type alias*, *discriminated/union type*
  (`PaymentMethod`), *generic helper* (`TabScreenProps<'Dashboard'>`) agar
  `navigation.navigate()` knows target screen & param-nya.

---

## 5. UTILS (fungsi murni, tanpa akses database)

### [`src/utils/currency.ts`](src/utils/currency.ts)
* **Fungsi utama:** format & parsing Rupiah.
* **Bagian penting:** `formatRupiah(15000) → "Rp15.000"`, `formatRupiahSpaced()`,
  `parseRupiahInput("15.000") → 15000`, `formatNumberInput()`, `formatCompactRupiah()`
  (untuk label grafik: "1,5jt").
* **Alur kerja:** regex `/\B(?=(\d{3})+(?!\d))/g` menyisipkan titik ribuan;
  `parseRupiahInput` membuang semua karakter non-angka.
* **Konsep:** *pure function* (tidak mengubah state, selalu mengembalikan nilai baru),
  regular expression, risiko *floating point* sehingga harga disimpan integer.

### [`src/utils/dateUtils.ts`](src/utils/dateUtils.ts)
* **Fungsi utama:** format tanggal/bulan + rentang periode.
* **Bagian penting:** `toISODate()` ("2026-10-21"), `toISOMonth()` ("2026-10"),
  `parseSqlDate()` (mengubah "2026-10-21 17:14:08" → `Date`),
  `formatDate()`, `formatLongDate()`, `formatTime()`, `nowSqlDateTime()`,
  `getMonthLabel()`, `getMonthOptions(12)`, `getLastDays(7)`.
* **Alur kerja:** tanggal disimpan sebagai teks "YYYY-MM-DD HH:MM:SS" (waktu lokal) →
  pengurutan `ORDER BY transaction_date` selalu benar, dan `substr()` di SQL mudah
  memfilter per tanggal/bulan.
* **Konsep:** manipulasi `Date`, padding angka (`padStart`), why *string* date SQLite
  aman untuk sorting.

### [`src/utils/calculation.ts`](src/utils/calculation.ts)
* **Fungsi utama:** seluruh rumus perhitungan.
* **Bagian penting:**
  * `calculateSubtotal(unitPrice, quantity)` → `Harga Satuan × Jumlah`.
  * `calculateCartTotal(items)` → jumlah seluruh subtotal (**Total Pembayaran**).
  * `calculateTotalQuantity(items)`, `getStockStatus(stock)` (Tersedia/Menipis/Habis),
    `calculateAverage()`.
* **Alur kerja:** memakai `reduce` atas array keranjang; semua nilai dibulatkan
  (`Math.round`) agar tidak ada selisih pembulatan.
* **Konsep:** *higher-order function* `reduce`, immutable update.

### [`src/utils/validation.ts`](src/utils/validation.ts)
* **Fungsi utama:** validasi input form & keranjang (lapisan aplikasi).
* **Bagian penting:** `validateCategoryForm()` (wajib + duplikat), `validateMenuForm()`
  (nama, kategori, harga > 0, stok ≥ 0), `validateCart()` (keranjang tidak kosong,
  jumlah ≥ 1, jumlah ≤ stok), `getFirstError()`.
* **Alur kerja:** fungsi mengembalikan `ValidationResult` (`isValid` + `errors`),
  screen menampilkan pesan per-field dan Alert ringkas.
* **Konsep:** *defensive programming* — validasi berlapis: aplikasi (friendly message)
  + database (`CHECK` constraint) sebagai jaring pengaman terakhir.

---

## 6. DATABASE

### [`src/database/schema.ts`](src/database/schema.ts)
* **Fungsi utama:** definisi skema (DDL) + query agregat.
* **Bagian penting — 4 tabel utama:**

  ```sql
  categories (id PK, name UNIQUE COLLATE NOCASE, icon, description, created_at)
  menus (id PK, category_id FK -> categories(id) ON DELETE RESTRICT,
         name, price INTEGER CHECK(price > 0), stock INTEGER CHECK(stock >= 0),
         icon, is_active, created_at)
  transactions (id PK, transaction_number UNIQUE, transaction_date,
                total_amount INTEGER, payment_method CHECK IN ('TUNAI','QRIS'))
  transaction_details (id PK, transaction_id FK -> transactions(id) ON DELETE CASCADE,
                        menu_id FK -> menus(id) ON DELETE RESTRICT,
                        menu_name, quantity CHECK(quantity > 0),
                        unit_price, subtotal)
  ```

* **Relasi antar tabel (diagram):**

  ```
  categories 1 ────< N menus
       │                    │
       │                    │ (menu_id)
       │                    ▼
       │            transaction_details >────┐
       │                    ▲                │ (transaction_id)
       └─────────────── N  │                ▼
                    transactions 1 ─────────┘
  ```

  * `categories → menus` : satu kategori memiliki banyak menu (1:N).
  * `transactions → transaction_details` : satu transaksi memiliki banyak detail item (1:N).
  * `menus → transaction_details` : satu menu bisa terjual berkali-kali (1:N).

* **Kebijakan penghapusan (FDI):**
  * `menus.category_id ... ON DELETE RESTRICT` → kategori yang masih dipakai menu
    **dilarang** dihapus oleh database (tidak hanya dicek di aplikasi).
  * `transaction_details.menu_id ... ON DELETE RESTRICT` + kolom `is_active` →
    menu yang pernah terjual tidak dihapus fisik, melainkan di-nonaktifkan
    (`is_active = 0`) supaya riwayat penjualan tetap akurat.
  * `transaction_details.transaction_id ... ON DELETE CASCADE` → hapus transaksi = hapus detailnya.
* **Snapshot:** `menu_name` & `unit_price` disimpan di `transaction_details`, sehingga
  quando harga/nama menu berubah, struk & laporan lama tetap benar.
* **Index:** `idx_menus_category_name` (unik per kategori, hanya menu aktif),
  `idx_menus_category`, `idx_transactions_date`, `idx_details_transaction`,
  `idx_details_menu` → mempercepat query JOIN/filter/rekap.
* **Query agregat yang dipakai:** `TOP_MENUS_SQL` (GROUP BY + ORDER BY + LIMIT),
  `DAILY_SALES_SQL`, `MONTHLY_SALES_SQL`, `TOTAL_ITEMS_SOLD_SQL` (SUM + JOIN).
* **Konsep:** DDL, PK/FK, CHECK, UNIQUE, partial unique index, ON DELETE CASCADE/RESTRICT.

### [`src/database/database.ts`](src/database/database.ts)
* **Fungsi utama:** membuka koneksi, menyiapkan database, seeding, dan menyediakan
  helper query untuk seluruh service.
* **Bagian penting:**
  * `initializeDatabase()` — 5 tahap: buka koneksi (`openDatabaseAsync`) → aktifkan
    foreign key (`PRAGMA foreign_keys = ON`) → buat tabel & index → cek kesiapan
    (query `sqlite_master`) → isi data contoh bila kosong. Dilindungi `initializationPromise`
    agar tidak terjadi inisialisasi ganda.
  * `getDatabase()` — mengembalikan koneksi; melempar error bila belum siap.
  * `queryAll()`, `queryFirst()`, `execute()` — pembungkus `getAllAsync`, `getFirstAsync`,
    `runAsync` (parameterized query).
  * `resetAllData()` — menghapus semua data & membuat ulang data contoh.
* **Konsep:** *singleton* koneksi database, *prepared statement* (aman dari SQL
  Injection), `PRAGMA`, transaksi SQL.

---

## 7. SERVICES (lapisan bisnis)

### [`src/services/categoryService.ts`](src/services/categoryService.ts)
* **Fungsi utama:** CRUD tabel `categories`.
* **Fungsi penting:** `getCategories()` (LEFT JOIN + COUNT menu), `getCategoryById()`,
  `getCategoryNames()` (cek duplikat), `getCategoryMenuCount()`,
  `createCategory()`, `updateCategory()`, `deleteCategory()`, `countCategories()`.
* **Alur kerja (create):** validasi nama → cek duplikat (case-insensitive) →
  `INSERT` parameterized → kembalikan id.
* **Alur kerja (delete):** hitung jumlah menu yang memakai kategori → bila > 0 lempar
  `Error` (pesan untuk Alert) → bila 0 jalankan `DELETE` (database juga akan menolak
  bila ada pelanggaran FK).
* **Konsep:** CRUD, JOIN, foreign key enforcement, case-insensitive uniqueness.

### [`src/services/menuService.ts`](src/services/menuService.ts)
* **Fungsi utama:** CRUD tabel `menus` + pencarian & filter.
* **Fungsi penting:** `getMenus(filter)` (INNER JOIN categories, pencarian LIKE
  dengan `ESCAPE`, filter kategori), `getPurchasableMenus()` (aktif & stok > 0),
  `getMenuById()`, `getMenuNamesByCategory()`, `createMenu()`, `updateMenu()`,
  `deleteMenu()` (soft/hard delete), `restoreMenu()`, `countMenus()`,
  `countLowStockMenus()`, `countOutOfStockMenus()`.
* **Alur kerja (delete):** cek `transaction_details` → bila pernah terjual →
  `UPDATE menus SET is_active = 0` (soft delete) → bila belum pernah → `DELETE`.
* **Konsep:** CRUD, soft delete, escaping LIKE, agregasi `COUNT`.

### [`src/services/transactionService.ts`](src/services/transactionService.ts)
* **Fungsi utama:** inti transaksi penjualan (penyimpanan atomik + pengurangan stok).
* **Fungsi penting:** `createTransaction(input)`, `generateTransactionNumber()`,
  `getTransactions(filter)`, `getTransactionDetails(id)`,
  `getTransactionWithDetails(id)`, `getRecentTransactions()`, `countTransactions()`,
  `getTotalRevenue()`.
* **Alur kerja `createTransaction()` (WAJIB atomik):**

  ```
  1. Validasi keranjang (tidak kosong, jumlah ≥ 1, jumlah ≤ stok)
  2. BEGIN TRANSACTION  (withTransactionAsync)
  3. SELECT menu terbaru dari database (harga & stok authoritative)
  4. Validasi: menu ada? aktif? stok > 0? jumlah ≤ stok?
  5. Hitung ulang subtotal & total memakai harga dari database
  6. Buat nomor transaksi unik (TRX-YYYYMMDD-0001)
  7. INSERT transactions
  8. INSERT transaction_details (snapshot nama & harga)
  9. UPDATE menus SET stock = stock - qty
  10. COMMIT  (bila salah satu langkah error → ROLLBACK otomatis)
  ```
* **Hubungan dengan file lain:** `database.ts` (koneksi), `utils/calculation.ts`
  (subtotal), `utils/validation.ts` (validasi keranjang), `utils/dateUtils.ts`
  (nomor transaksi & waktu), `types` (payload).
* **Konsep:** **transaksi SQL atomik** (`withTransactionAsync` → COMMIT/ROLLBACK),
  *derived data* (total dihitung ulang dari database, bukan dari UI),
  *single source of truth* untuk harga.

### [`src/services/reportService.ts`](src/services/reportService.ts)
* **Fungsi utama:** rekap & laporan (agregasi SQL).
* **Fungsi penting:** `getDashboardStats()`, `getDailySalesChart(7)`,
  `getMonthlySalesChart(6)`, `getSalesReport(filter)`, `getStockReport()`,
  `getTopSellingMenus(3)`, `getDateRange(filter)`.
* **Alur kerja `getSalesReport()`:**
  * `getDateRange()` mengubah filter (tanggal / bulan) menjadi rentang
    `"YYYY-MM-DD 00:00:00"` s.d. `"YYYY-MM-DD 23:59:59"`.
  * `COUNT(*)` + `SUM(total_amount)` → jumlah transaksi & pendapatan.
  * `SUM(td.quantity)` dengan JOIN → total item terjual.
  * `GROUP BY td.menu_id, td.menu_name ORDER BY SUM(quantity) DESC LIMIT 5` → menu terlaris.
  * Grafik: harian (per tanggal) atau per-menu (bila memilih satu tanggal).
* **Konsep:** **SQL JOIN**, **SUM/COUNT/GROUP BY/HAVING/ORDER BY**, agregasi di DB
  (bukan di JavaScript) → laporan akurat & hemat memori.

---

## 8. COMPONENTS

> Semua komponen bersifat *presentational* (menerima `props`, tidak memanggil
> service). State &副作用 ada di `screens/`.

| File | Fungsi utama | Props penting |
|---|---|---|
| [`AppHeader.tsx`](src/components/AppHeader.tsx) | Header biru tua untuk semua halaman | `title`, `subtitle`, `onBack`, `rightIcon`, `onRightPress` |
| [`StatCard.tsx`](src/components/StatCard.tsx) | Kartu statistik berwarna (Dashboard) | `icon`, `label`, `value`, `color`, `hint` |
| [`MenuCard.tsx`](src/components/MenuCard.tsx) | Kartu menu (ikon, nama, kategori, harga, badge stok) | `menu`, `onEdit`, `onDelete`, `onAction` |
| [`CategoryCard.tsx`](src/components/CategoryCard.tsx) | Kartu kategori + jumlah menu | `category`, `onEdit`, `onDelete` |
| [`CartItem.tsx`](src/components/CartItem.tsx) | Baris keranjang + stepper jumlah + hapus | `item`, `onIncrease`, `onDecrease`, `onRemove` |
| [`QuantityStepper.tsx`](src/components/QuantityStepper.tsx) | Kontrol jumlah (+/−) | `value`, `onIncrease`, `onDecrease`, `maxReached`, `minReached` |
| [`EmptyState.tsx`](src/components/EmptyState.tsx) | Tampilan saat data kosong | `icon`, `title`, `message`, `actionLabel`, `onAction` |
| [`ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx) | Dialog konfirmasi hapus (Modal) | `visible`, `title`, `message`, `onConfirm`, `onCancel` |
| [`FormInput.tsx`](src/components/FormInput.tsx) | Input teks + label + error + prefix/suffix | `label`, `value`, `onChangeText`, `error` |
| [`FormDropdown.tsx`](src/components/FormDropdown.tsx) | Dropdown pilihan (Modal + FlatList) | `label`, `value`, `options`, `onSelect` |
| [`ActionButton.tsx`](src/components/ActionButton.tsx) | Tombol dengan varian & status loading | `label`, `onPress`, `variant`, `loading`, `disabled` |
| [`BarChart.tsx`](src/components/BarChart.tsx) | Grafik batang sederhana (View) | `data`, `height`, `color`, `formatValue` |
| [`StockBadge.tsx`](src/components/StockBadge.tsx) | Indikator status stok (hijau/kuning/merah) | `status`, `stock` |
| [`Feedback.tsx`](src/components/Feedback.tsx) | `LoadingState`, `ErrorBanner`, `SuccessBanner`, `SectionTitle` | lihat file |

* **Konsep:** *component-based architecture*, *props & drilling satu level*,
  *composition* (`<MenuCard menu={...} onEdit={...} />`), `StyleSheet.create`
  (objek style di luar fungsi = performa lebih baik), `useSafeAreaInsets()`.

---

## 9. SCREENS

### [`DashboardScreen.tsx`](src/screens/DashboardScreen.tsx)
* **Fungsi utama:** Output 3.1 — ringkasan kantin.
* **Alur kerja:** `useFocusEffect` → `getDashboardStats()`, `getDailySalesChart(7)`,
  `getTopSellingMenus(3)`, `getRecentTransactions(5)` → tampilkan kartu statistik,
  grafik, menu terlaris, aksi cepat, transaksi terakhir. `RefreshControl` untuk
  tarik-torefresh.
* **Hubungan dengan file lain:** `reportService`, `transactionService`, `StatCard`,
  `BarChart`, `EmptyState`, `AppHeader`.
* **Konsep:** *effect* + *cleanup* (reload saat tab aktif), *parallel async*
  (`Promise.all`), *derived state*.

### [`MenuScreen.tsx`](src/screens/MenuScreen.tsx)
* **Fungsi utama:** Output 3.2 — daftar menu + pencarian + filter kategori.
* **Alur kerja:** state `search` & `selectedCategory` → `getMenus({ search, categoryId })`
  → `FlatList` berisi `MenuCard` (edit → `MenuForm`, hapus → `ConfirmDialog`).
* **Konsep:** *controlled component*, *filtering & searching*, `FlatList` ( virtualization
  → performa baik untuk data banyak).

### [`MenuFormScreen.tsx`](src/screens/MenuFormScreen.tsx)
* **Fungsi utama:** Input 1.2 — tambah/edit menu.
* **Alur kerja:** `route.params?.menuId` menentukan mode (tambah/edit) → muat kategori
  & data menu → validasi `validateMenuForm()` → `createMenu()` / `updateMenu()` → `goBack()`.
* **Konsep:** *route params* typed, `KeyboardAvoidingView` (keyboard tidak menutupi form),
  *derived state* (error per field dihapus saat user mengetik).

### [`CategoryScreen.tsx`](src/screens/CategoryScreen.tsx) & [`CategoryFormScreen.tsx`](src/screens/CategoryFormScreen.tsx)
* **Fungsi utama:** Input 1.1 — CRUD kategori.
* **Konsep:** sama dengan menu; menambah *proteksi hapus* (relasi FK) dan
  *validasi duplikat* berbasis daftar nama kategori.

### [`TransactionScreen.tsx`](src/screens/TransactionScreen.tsx)
* **Fungsi utama:** Output 3.3 — transaksi penjualan.
* **Alur kerja:**
  1. Muat menu yang dapat dibeli (`getPurchasableMenus()`).
  2. Tambah menu → `setCart` (jumlah existing +1, subtotal dihitung ulang).
  3. Ubah jumlah → subtotal & total berubah **otomatis** (setiap perubahan state
     menghitung ulang `calculateSubtotal` & `calculateCartTotal`).
  4. Hapus item dari keranjang.
  5. Pilih metode pembayaran (Tunai / QRIS).
  6. Tekan "Simpan Transaksi" → `createTransaction()` → Alert sukses → navigasi ke struk.
* **Pencegahan transaksi ganda:** state `saving` dipakai sebagai *guard*
  (`if (saving) return;`) + tombol dinonaktifkan saat `loading` → menekan dua kali
  tidak menyimpan dua transaksi.
* **Konsep:** *state lifting*, *immutable update* pada array, *guard* double-submit,
  *layout responsif* (panel total di bawah, daftar dapat digulir).

### [`ReceiptScreen.tsx`](src/screens/ReceiptScreen.tsx)
* **Fungsi utama:** Output 3.4 — struk digital.
* **Alur kerja:** `route.params.transactionId` → `getTransactionWithDetails()` →
  tampilkan kepala struk (nama kantin), nomor transaksi, tanggal/waktu, item,
  subtotal, total, metode pembayaran.
* **Konsep:** *master-detail navigation*, snapshot data historis.

### [`TransactionHistoryScreen.tsx`](src/screens/TransactionHistoryScreen.tsx)
* **Fungsi utama:** Output 3.5 (bagian riwayat) — daftar transaksi + filter bulan.
* **Konsep:** filter periode, `FlatList` dengan `renderItem`, navigasi ke struk.

### [`ReportScreen.tsx`](src/screens/ReportScreen.tsx)
* **Fungsi utama:** Output 3.5 — laporan penjualan (per bulan / per tanggal).
* **Alur kerja:** mode filter (BULAN/TANGGAL) → `getSalesReport(filter)` → kartu
  statistik + `BarChart` + menu terlaris + riwayat transaksi pada periode itu.
* **Konsep:** agregasi database, chart tanpa library, filter tanggal dengan format
  `YYYY-MM-DD`.

### [`StockReportScreen.tsx`](src/screens/StockReportScreen.tsx)
* **Fungsi utama:** Output 3.6 — tabel stok + indikator status.
* **Alur kerja:** `getStockReport()` (JOIN kategori + LEFT JOIN detail transaksi untuk
  jumlah terjual) → `StockBadge` per baris + ringkasan (total menu, total porsi,
  stok menipis, stok habis).
* **Konsep:** `LEFT JOIN` + `COALESCE` untuk data yang boleh null.

### [`ProfileScreen.tsx`](src/screens/ProfileScreen.tsx)
* **Fungsi utama:** halaman informasi aplikasi + pengaturan (reset data).
* **Konsep:** `useEffect` untuk memuat ringkasan, `ConfirmDialog` untuk aksi merusak.

---

## 10. NAVIGATION

### [`src/navigation/AppNavigator.tsx`](src/navigation/AppNavigator.tsx)
* **Fungsi utama:** menghubungkan seluruh screen.
* **Struktur:**
  * `Stack` (native-stack): `MainTabs`, `MenuForm`, `CategoryForm`, `CategoryList`,
    `Receipt`, `TransactionHistory`, `StockReport`.
  * `Tab` (bottom-tabs, 5 menu): `Dashboard`, `Menu`, `Transaction`, `Report`, `Profile`.
* **Konsep:** nested navigator (tab di dalam stack), `screenOptions`, ikon tab
  berubah saat aktif/tidak aktif, `headerShown: false` karena memakai `AppHeader`.

---

## 11. POIN-POIN PENTING UNTUK PEMBELAJARAN

### a) Relasi database & foreign key
`PRAGMA foreign_keys = ON` **wajib** diaktifkan di setiap koneksi, kalau tidak SQLite
tidak akan menolak penghapusan kategori yang masih dipakai menu.
`ON DELETE RESTRICT` = relationship dijaga; `ON DELETE CASCADE` = anak ikut terhapus.

### b) Operasi CRUD
* **Create:** `INSERT INTO ... VALUES (?, ?)` + `lastInsertRowId`.
* **Read:** `SELECT ... FROM ... WHERE ...` (+ `JOIN`, `GROUP BY`).
* **Update:** `UPDATE ... SET ... WHERE id = ?`.
* **Delete:** `DELETE FROM ... WHERE id = ?` atau soft delete (`is_active = 0`).

### c) SQL JOIN
* `INNER JOIN` → menu + kategori (hanya yang punya kategori valid).
* `LEFT JOIN` → kategori tanpa menu tetap tampil, jumlah item terjual 0.
* JOIN tabel `transaction_details` → laporan penjualan & menu terlaris.

### d) Perhitungan subtotal & total
```
Subtotal item   = Harga Satuan × Jumlah          (calculateSubtotal)
Total Pembayaran = Σ Subtotal seluruh item        (calculateCartTotal)
```
Semua dihitung ulang dari state keranjang, sehingga **otomatis** berubah saat
jumlah item berubah, dan **dihitung ulang lagi** dari harga database saat disimpan
(anti manipulasi harga dari sisi UI).

### e) Transaksi SQLite
`db.withTransactionAsync(async () => { ... })` → `BEGIN` … `COMMIT`, dan otomatis
`ROLLBACK` bila terjadi error di dalam. Inilah yang membuat
**"transaksi gagal tidak boleh mengurangi stok"** terpenuhi: bila `INSERT detail`
gagal, seluruh perubahan (termasuk `UPDATE stock`) dibatalkan.

### f) Pengurangan stok
`UPDATE menus SET stock = stock - ? WHERE id = ?` di dalam transaksi yang sama,
sehingga stok **konsisten** dengan transaksi. Validasi stok terbaru diambil ulang
dari database (bukan dari nilai di keranjang).

### g) Perhitungan rekap penjualan
`COUNT(*)` untuk jumlah transaksi, `SUM(total_amount)` untuk pendapatan,
`SUM(td.quantity)` untuk item terjual, `GROUP BY` + `ORDER BY ... DESC` + `LIMIT`
untuk menu terlaris, `substr(transaction_date, 1, 7)` untuk rekap per bulan.
