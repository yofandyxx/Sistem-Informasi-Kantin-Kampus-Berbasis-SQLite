# TAHAP 5 — TABEL PENGUJIAN APLIKASI

**Aplikasi:** PPNP Canteen (PPNPCanteen) · **Platform:** Android + Expo Go
**Tanggal Pengujian:** ................................................
**Penguji:** ................................................
**Versi Aplikasi:** 1.0.0 · **Expo SDK:** 58

> **Status awal seluruh pengujian adalah `BELUM DIUJI`.**
> Pengujian dilakukan langsung pada perangkat Android menggunakan Expo Go.
> Silakan ubah kolom **Status** menjadi `PASS` / `FAIL` dan catat catatan pada
> kolom **Catatan**. Setiap `FAIL` disertai perbaikan kode (dib시면/dosen).

**Cara menjalankan sebelum pengujian:**

```bash
npm install
npx expo start        # pindai QR code dengan Expo Go
npx tsc --noEmit     # pastikan 0 error TypeScript
```

---

## A. PENGUJIAN APLIKASI

| No. | Fitur | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 1 | Aplikasi berhasil dibuka | Install Expo Go → jalankan `npx expo start` → scan QR code | Aplikasi terbuka ke layar splash lalu Dashboard tanpa error/merah | BELUM DIUJI |
| 2 | Database SQLite berhasil dibuat | Buka aplikasi → cek halaman Profil bagian "Database Lokal" | Database `ppnp_canteen.db` dibuat, 4 tabel terbentuk, data contoh (3 kategori + 8 menu) muncul di halaman Menu | BELUM DIUJI |
| 3 | Tambah kategori | Menu → ikon ⚙ (Kelola Kategori) → "Tambah" → isi nama "Makanan Tradisional", pilih ikon, deskripsi opsional → Simpan | Alert "Berhasil", kategori baru tampil di daftar, jumlah menu = 0 | BELUM DIUJI |
| 4 | Edit kategori | Daftar kategori → ikon pensil pada "Makanan Tradisional" → ubah nama menjadi "Makanan TradisionalANDEDAS" (atau nama valid lain) → Simpan | Alert "Berhasil", nama terbaru tampil di daftar kategori | BELUM DIUJI |
| 5 | Hapus kategori | Daftar kategori → ikon tong sampah pada kategori yang **tidak dipakai menu** → konfirmasi "Hapus" | Alert "Berhasil", kategori hilang dari daftar | BELUM DIUJI |
| 6 | Validasi kategori duplikat | Tambah kategori dengan nama yang sama persis (case berbeda juga: "makanan berat") | Muncul pesan error "sudah ada, gunakan nama lain"; kategori tidak tersimpan | BELUM DIUJI |
| 7 | Tambah menu | Tab Menu → "Tambah" → nama "Nasi Uduk", kategori "Makanan Berat", harga 14000, stok 25, pilih ikon → Simpan | Alert "Berhasil", kartu menu baru tampil dengan harga Rp14.000 dan badge stok hijau | BELUM DIUJI |
| 8 | Edit menu | Tab Menu → ikon pensil pada "Nasi Uduk" → ubah harga menjadi 13500 dan stok 30 → Simpan | Alert "Berhasil", harga & stok terbaru tampil di kartu menu | BELUM DIUJI |
| 9 | Hapus menu | Tab Menu → ikon tong sampah pada menu yang belum pernah terjual → konfirmasi | Alert "Berhasil", menu hilang dari daftar | BELUM DIUJI |
| 10 | Validasi harga dan stok | Tambah menu dengan harga `0` → Simpan; lalu stok `-5` → Simpan | Harga: pesan "Harga harus lebih besar dari nol"; Stok: pesan "Stok tidak boleh negatif"; menu tidak tersimpan | BELUM DIUJI |
| 11 | Validasi menu duplikat | Tambah menu dengan nama yang sama pada **kategori yang sama** | Pesan "Menu ... sudah ada pada kategori ini"; menu tidak tersimpan | BELUM DIUJI |
| 12 | Pencarian menu | Tab Menu → ketik "goren" pada kolom pencarian | Hanya menu yang namanya mengandung "goren" (Nasi Goreng) yang tampil | BELUM DIUJI |
| 13 | Filter kategori | Tab Menu → ketuk chip "Minuman" | Hanya menu kategori Minuman yang tampil; chip aktif berwarna biru | BELUM DIUJI |
| 14 | Tambah item ke keranjang | Tab Transaksi → ketuk "Tambah" pada Es Teh | Es Teh masuk ke keranjang dengan jumlah 1, subtotal Rp5.000 | BELUM DIUJI |
| 15 | Ubah jumlah item | Keranjang → tekan "+" pada Es Teh dua kali | Jumlah menjadi 3, subtotal menjadi Rp15.000, total ikut berubah | BELUM DIUJI |
| 16 | Hapus item dari keranjang | Keranjang → tekan ikon tong sampah pada satu item | Item hilang dari keranjang, subtotal & total dihitung ulang | BELUM DIUJI |
| 17 | Perhitungan subtotal | Keranjang berisi Nasi Goreng 1 dan Es Teh 2 | Subtotal Nasi Goreng = Rp15.000; subtotal Es Teh = Rp10.000 | BELUM DIUJI |
| 18 | Perhitungan total pembayaran | Lihat panel bawah keranjang | Total Pembayaran = jumlah seluruh subtotal (contoh Rp25.000) dan sama dengan nilai pada struk | BELUM DIUJI |
| 19 | Validasi stok tidak mencukupi | Menu dengan stok 2 → masukkan jumlah 5 di keranjang (coba lewat服务 atau edit stok menu menjadi 0 lalu transaksi) | Transaksi ditolak dengan pesan "Stok ... tidak mencukupi"; stok tidak berubah | BELUM DIUJI |
| 20 | Simpan transaksi | Keranjang terisi → pilih metode "Tunai" → tekan "Simpan Transaksi" | Alert "Transaksi Berhasil", keranjang dikosongkan, nomor transaksi terbentuk (TRX-YYYYMMDD-0001) | BELUM DIUJI |
| 21 | Pengurangan stok otomatis | Catat stok Es Teh sebelum transaksi (mis. 50) → lakukan transaksi 3 Es Teh → buka Tab Menu | Stok Es Teh menjadi 47 | BELUM DIUJI |
| 22 | Pencegahan transaksi ganda | Tekan tombol "Simpan Transaksi" beberapa kali cepat (double tap) | Hanya **1** transaksi tersimpan (tombol nonaktif saat proses & guard `saving`) | BELUM DIUJI |
| 23 | Struk transaksi | Setelah transaksi berhasil → ketuk "Lihat Struk" | Struk menampilkan nama kantin, nomor transaksi, tanggal & waktu, item, jumlah, harga satuan, subtotal, total, metode pembayaran | BELUM DIUJI |
| 24 | Riwayat transaksi | Tab Transaksi → tombol "Riwayat" di header | Daftar seluruh transaksi tampil (terbaru di atas) beserta totalnya | BELUM DIUJI |
| 25 | Detail transaksi | Dari riwayat / dashboard → ketuk salah satu transaksi | Halaman struk terbuka dengan detail item transaksi yang dipilih | BELUM DIUJI |
| 26 | Laporan penjualan | Tab Laporan → mode "Per Bulan" → pilih bulan berjalan | Jumlah transaksi, total pendapatan, total item terjual, rata-rata, grafik, dan menu terlaris sesuai data bulan itu | BELUM DIUJI |
| 27 | Filter laporan berdasarkan tanggal | Tab Laporan → mode "Per Tanggal" → isi `YYYY-MM-DD` (tanggal transaksi) → "Terapkan Tanggal" | Hanya transaksi pada tanggal tersebut yang dihitung; grafik menampilkan item per menu | BELUM DIUJI |
| 28 | Laporan stok | Tab Laporan → tombol "Stok" di header | Tabel stok menampilkan nama menu, kategori, harga, stok, dan badge status (hijau/kuning/merah) | BELUM DIUJI |
| 29 | Grafik dashboard | Buka Tab Dashboard | Grafik batang 7 hari tampil, kartu statistik sesuai jumlah menu/kategori/transaksi/pendapatan, jumlah menu stok menipis | BELUM DIUJI |
| 30 | Data tetap tersimpan | Tutup aplikasi (swipe / back) lalu buka lagi dari Expo Go | Kategori, menu, transaksi, dan stok tetap ada (tersimpan di SQLite perangkat) | BELUM DIUJI |
| 31 | Transaksi gagal → stok tidak berubah | Ubah stok menu menjadi 0 (edit menu) → coba transaksi menu tersebut / atau buat kondisi stok tidak cukup → Simpan | Alert "Transaksi Gagal" dan stok **tetap sama** (tidak berkurang), tidak ada transaksi tersimpan | BELUM DIUJI |
| 32 | Pengujian TypeScript | Jalankan `npx tsc --noEmit` di terminal project | **0 error** TypeScript (keluar tanpa pesan error, exit code 0) | BELUM DIUJI |

---

## B. PENGUJIAN TAMBAHAN (REKOMENDASI PEMBIMBING)

| No. | Fitur | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 33 | Proteksi hapus kategori | Hapus kategori "Makanan Berat" yang masih dipakai menu | Muncul pesan "Kategori masih digunakan oleh N menu..."; kategori tidak terhapus | BELUM DIUJI |
| 34 | Soft delete menu | Hapus menu yang sudah pernah terjual | Pesan "dinonaktifkan (bukan dihapus)"; menu hilang dari daftar aktif, riwayat transaksi tetap utuh | BELUM DIUJI |
| 35 | Hapus transaksi berantai | (Tidak ada tombol hapus transaksi di UI — uji lewat SQL) | Detail transaksi ikut terhapus (ON DELETE CASCADE) | BELUM DIUJI |
| 36 | Reset data | Tab Profil → "Reset Data Aplikasi" → konfirmasi | Semua data terhapus, data contoh dibuat ulang, dashboard ter-update | BELUM DIUJI |
| 37 | Validasi tanggal laporan | Mode "Per Tanggal" → isi `21-10-2026` (format salah) | Alert "Format Tanggal Salah" | BELUM DIUJI |
| 38 | Tampilan responsif | Putar HP (portrait/landscape) dan coba pada layar kecil | Layout tetap rapi, tidak ada elemen terpotong | BELUM DIUJI |
| 39 | Keyboard tidak menutupi form | Tambah/Edit menu → ketuk field harga/stok | Field yang sedang diketik tetap terlihat di atas keyboard | BELUM DIUJI |
| 40 | Offline | Matikan Wi-Fi & data → buka ulang aplikasi | Aplikasi tetap berfungsi penuh (semua data lokal) | BELUM DIUJI |

---

## C. REKAP PENILAIAN

| Kategori | Jumlah Skenario | Lulus | Tidak Lulus | Belum Diuji |
|---|---|---|---|---|
| Ke functionalities (No. 1–32) | 32 | 0 | 0 | 32 |
| Tambahan (No. 33–40) | 8 | 0 | 0 | 8 |
| **Total** | **40** | **0** | **0** | **40** |

**Catatan pembimbing / dosen:** ................................................
 ................................................................................
 ................................................................................
