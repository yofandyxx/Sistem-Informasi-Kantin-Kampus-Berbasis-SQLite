# TAHAP 6 — TROUBLESHOOTING

Kumpulan solusi atas masalah yang paling sering terjadi saat mengerjakan
**PPNP Canteen**. Setiap bagian memuat: **Gejala → Penyebab → Solusi → Pencegahan**.

---

## 1. Dependency tidak ditemukan (`Cannot find module 'expo-sqlite'`)

* **Gejala:** aplikasi crash saat start, terminal menampilkan
  `Error: Unable to resolve module ./expo-sqlite` atau di VS Code muncul
  `Cannot find module 'expo-sqlite'`.
* **Penyebab:** `node_modules` belum terinstal, atau terinstal tidak lengkap.
* **Solusi:**
  ```bash
  cd PPNPCanteen
  npm install
  npx expo install expo-sqlite @expo/vector-icons react-native-screens react-native-safe-area-context
  ```
  Setelah selesai, restart bundler: tekan `r` di terminal Expo atau jalankan ulang
  `npx expo start --clear`.
* **Pencegahan:** gunakan `npx expo install` (bukan `npm install <paket>`) agar versi
  selalu cocok dengan SDK Expo.

---

## 2. TypeScript error (`npx tsc --noEmit`reporting error)

* **Gejala:** `npx tsc --noEmit` menampilkan daftar error, contoh:
  `Property 'icon' does not exist on type 'Category'` atau
  `Argument of type 'string' is not assignable to parameter of type ...`.
* **Penyebab:** nama file/folder typo, lupa `export`, atau tipe data tidak sesuai.
* **Solusi:**
  1. Baca file & nomor baris yang disebut terminal.
  2. Perbaiki di file tersebut (bukan di `node_modules`).
  3. Jalankan ulang `npx tsc --noEmit` sampai **0 error**.
  * Contoh umum pada project ini:
    * `Cannot find module '../types'` → periksa ejaan path (folder: `types`, file: `index.ts`).
    * `Object is possibly 'null'` → hasil `getFirstAsync()` bisa `null`; gunakan
      optional chaining `row?.count ?? 0` (sudah diterapkan di project ini).
    * `Type '"qrcode-outline"' is not assignable` → nama ikon Ionicons salah,
      yang benar `"qr-code-outline"`.
* **Pencegahan:** jalankan `npx tsc --noEmit` setiap selesai mengubah file.

---

## 3. SQLite gagal dibuat (`Database gagal disiapkan`)

* **Gejala:** aplikasi berhenti di layar splash dan menampilkan
  "Database Gagal Dipersiapkan".
* **Penyebab:**
  * `PRAGMA foreign_keys = ON` gagal (biasanya karena `execAsync` dipanggil sebelum
    koneksi siap).
  * Permission storage pada Android.
  * Database lama dengan skema berbeda (setelah mengubah struktur tabel).
* **Solusi:**
  1. Ketuk "Ketuk untuk mencoba lagi" di layar error.
  2. Hapus cache bundler: `npx expo start --clear`.
  3. Hapus data contoh & mulai ulang: aplikasi → **Profil → Reset Data Aplikasi**.
  4. Untuk bersih total, hapus app dari Expo Go / uninstall lalu install ulang
     (file `.db` berada di storage internal aplikasi).
* **Pencegahan:** gunakan `IF NOT EXISTS` pada semua `CREATE TABLE`/`CREATE INDEX`
  (sudah diterapkan di `src/database/schema.ts`).

---

## 4. Foreign key bermasalah (kategori yang dipakai menu tetap bisa dihapus)

* **Gejala:** kategori yang masih dipakai menu berhasil dihapus, atau muncul error
  `FOREIGN KEY constraint failed`.
* **Penyebab:** `PRAGMA foreign_keys = ON` tidak dijalankan pada koneksi tersebut.
* **Solusi:** pastikan `await db.execAsync(PRAGMA_FOREIGN_KEYS);` dijalankan **tepat
  setelah** `openDatabaseAsync` di `src/database/database.ts` (sudah diterapkan).
  Selain itu, `deleteCategory()` juga memeriksa jumlah menu sebelum menghapus
  (cek ganda di layer aplikasi).
* **Catatan:** SQLite **tidak** mengaktifkan foreign key secara default —
  inilah sebabnya PRAGMA wajib dipanggil.

---

## 5. Data kategori atau menu tidak tersimpan

* **Gejala:** Alert "Berhasil" muncul tetapi daftar tidak berubah / data hilang saat
  aplikasi dibuka ulang.
* **Penyebab:**
  1. Validasi gagal diam-diam (mis. nama duplikat) — cek pesan error.
  2. `INSERT` dibatalkan karena constraint database (`UNIQUE`, `CHECK`).
  3. Data disimpan di memori saja (tidak ada `INSERT` ke database).
* **Solusi:**
  * Lihat `try/catch` pada service: setiap error dilempar dengan pesan Indonesia
    yang jelas (buka log Metro dengan tekan `j` di terminal).
  * Pastikan tidak ada `await` yang hilang pada fungsi service.
  * Uji dengan app yang sama setelah menutup & membuka ulang (data harus tetap ada).
* **Pencegahan:** selalu gunakan `queryAll/queryFirst/execute` dari
  `src/database/database.ts` agar parameterized query & error handling konsisten.

---

## 6. Stok tidak berkurang setelah transaksi

* **Gejala:** transaksi tersimpan, struk muncul, tetapi stok menu tetap.
* **Penyebab:**
  1. `UPDATE menus SET stock = stock - ?` tidak pernah dieksekusi.
  2. Transaksi di-rollback (error di tengah) sehingga semua perubahan dibatalkan.
  3. Melihat menu yang salah (menu dengan `is_active = 0` tidak tampil di daftar).
* **Solusi:**
  * Buka `src/services/transactionService.ts` → pastikan blok
    `await db.withTransactionAsync(async () => { ... })` memuat ketiga langkah:
    insert transaksi, insert detail, update stok.
  * Cek log Metro untuk melihat pesan error SQL.
  * Refresh halaman Menu (tab kembali aktif → `useFocusEffect` memuat ulang data).
* **Pencegahan:** letakkan seluruh langkah dalam **satu** transaksi SQL
  (sudah diterapkan di project ini).

---

## 7. Total pembayaran salah

* **Gejala:** total tidak sama dengan jumlah subtotal, atau muncul pembulatan aneh
  (mis. Rp24.999).
* **Penyebab:**
  1. Harga disimpan sebagai `float` (bukan bilangan bulat).
  2. Subtotal tidak dihitung ulang ketika jumlah item berubah.
  3. Harga dihitung dari data UI yang sudah usang.
* **Solusi:**
  * Semua harga & total menggunakan `INTEGER` (Rupiah penuh, tanpa titik desimal).
  * `calculateSubtotal()` dipanggil setiap kali `quantity` berubah.
  * Saat menyimpan, total **dihitung ulang dari harga database**
    (`createTransaction()` membaca `menus.price`).
* **Pencegahan:** jangan pernah memakai `parseFloat`/`toFixed` untuk nilai uang;
  gunakan `parseInt` + `Math.round`.

---

## 8. Transaksi tersimpan ganda (double submit)

* **Gejala:** menekan "Simpan Transaksi" dua kali menghasilkan dua transaksi.
* **Penyebab:** tombol belum dinonaktifkan saat proses berjalan.
* **Solusi (sudah diterapkan):**
  ```ts
  const [saving, setSaving] = useState(false);
  if (saving) return;           // guard
  ...
  <ActionButton loading={saving} disabled={cart.length === 0} />
  ```
  `ActionButton` otomatis men-disable tombol ketika `loading` = `true`.
* **Pencegahan:** gunakan *guard* + status `loading` pada setiap tombol yang
  menulis ke database.

---

## 9. Riwayat transaksi tidak tampil

* **Gejala:** halaman "Riwayat Transaksi" kosong padahal ada transaksi.
* **Penyebab:**
  1. Filter bulan tidak sesuai dengan bulan transaksi.
  2. Format tanggal transaksi berbeda dari filter (`YYYY-MM-DD HH:MM:SS`).
  3. Transaksi tersimpan pada periode lain.
* **Solusi:**
  * Buka filter bulan dan pilih "Semua Bulan".
  * Pastikan data dibuat dengan `nowSqlDateTime()` (waktu lokal perangkat).
* **Catatan:** `getTransactions()` memakai `LIKE 'YYYY-MM%'` untuk filter bulan dan
  `LIKE 'YYYY-MM-DD%'` untuk filter tanggal.

---

## 10. Dashboard tidak memperbarui statistik

* **Gejala:** angka di Dashboard tetap sama setelah menambah menu/transaksi.
* **Penyebab:** data dimuat sekali saat komponen dibuat (tidak ada reload).
* **Solusi (sudah diterapkan):** `useFocusEffect(() => { loadData(); }, [loadData])`
  → data dimuat ulang setiap kali tab Dashboard kembali aktif. Di Dashboard juga
  tersedia *pull to refresh*.
* **Pencegahan:** selalu muat ulang data pada `useFocusEffect`, bukan hanya
  `useEffect` pertama.

---

## 11. Navigasi gagal / halaman tidak terbuka

* **Gejala:** ketuk tombol tidak berpindah halaman, atau muncul
  `The action 'NAVIGATE' with payload ... was not handled by any navigator`.
* **Penyebab:**
  1. Screen belum terdaftar di `AppNavigator.tsx`.
  2. Nama screen salah (case-sensitive) atau parameter tidak sesuai tipe.
* **Solusi:**
  * Pastikan screen terdaftar pada `Stack.Navigator` (atau `Tab.Navigator`).
  * Gunakan tipe `TabScreenProps<'Dashboard'>` / `StackScreenProps<'Receipt'>`
    agar `navigate()` otomatis dicek TypeScript.
  * Untuk halaman di luar tab (mis. `Receipt`), gunakan
    `navigation.navigate('Receipt', { transactionId: item.id })`.
* **Pencegahan:** biasakan memakai `navigation.navigate('NamaScreen', param)` dengan
  nama yang sama persis dengan yang didaftarkan.

---

## 12. Expo Go tidak terhubung / aplikasi tidak termuat di HP

* **Gejala:** QR code tidak bereaksi, atau "Could not connect to Metro".
* **Penyebab & solusi:**

  | Penyebab | Solusi |
  |---|---|
  | HP & komputer berbeda jaringan | Gunakan Wi-Fi yang sama, atau `npx expo start --tunnel` |
  | Firewall / antivirus memblokir port 8081 | Izinkan Node.js melalui firewall Windows |
  | Expo Go versi lama (hanya支持 SDK tertentu) | Update Expo Go ke versi **terbaru** di Play Store |
  | Cache bundler rusak | `npx expo start --clear` |
  | Port 8081 dipakai aplikasi lain | `npx expo start --port 8082` lalu scan ulang QR |
  | Mode airplane / data seluler aktif | Matikan airplane mode |
* **Fallback:** bila Expo Go versi terbaru tidak mendukung SDK 58, jalankan
  `npx expo install expo@^57 --fix` (atau `npx create-expo-app` ulang dengan template
  SDK 57) agar SDK cocok dengan Expo Go yang terpasang.

---

## 13. Aplikasi tidak menampilkan data terbaru

* **Gejala:** setelah menambah menu, halaman masih menampilkan data lama.
* **Penyebab:** state lokal tidak dimuat ulang (screen tidak di-*focus* ulang) atau
  data belum di-*refresh*.
* **Solusi:** pastikan setiap screen memakai `useFocusEffect` + `loadData()`;
  di halaman Menu tersedia ikon filter untuk membuka daftar kategori; di Dashboard
  tersedia *pull to refresh*.
* **Pencegahan:** sumber kebenaran tunggal = database. Setelah menulis data,
  selalu panggil fungsi `loadData()`.

---

## 14. (Tambahan) `npm install` gagal / versi dependency bentrok

* **Gejala:** `ERESOLVE unable to resolve dependency tree`.
* **Solusi:**
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npx expo install --check
  npx expo-doctor
  ```
  Jangan mengedit versi secara manual di `package.json`; gunakan `npx expo install`.

---

## 15. (Tambahan) Aplikasi lambat / crash saat banyak data

* **Solusi:**
  * Pastikan daftar panjang memakai `FlatList` (bukan `ScrollView` + `map`).
  * Batasi `LIMIT` pada query riwayat (default 200 transaksi).
  * Gunakan `useCallback` pada fungsi yang dipakai `useFocusEffect` agar tidak
    memicu render berulang.
  * Hapus data contoh lama melalui **Profil → Reset Data Aplikasi** bila perlu.
