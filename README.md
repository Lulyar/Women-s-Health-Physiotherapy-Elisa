# Women's Health Physiotherapy

Aplikasi Manajemen Klinik Fisioterapis Mandiri Terintegrasi dengan Google Sheets sebagai Database Utama dan dideploy secara online menggunakan Google Apps Script.

## 🔗 Link Tautan Penting

*   **Aplikasi Live (Web App):** [Women's Health Physiotherapy Portal](https://script.google.com/macros/s/AKfycbxNkX3PBOKTptW9l482gzkUf8B7uTn7tAYH0s_njbwlYW61_Tldn-5InJOBDddlSgfR/exec)
*   **Database Spreadsheet:** [Google Sheets Database](https://docs.google.com/spreadsheets/d/1GdbIcDAW-heVaUiKSpBndP1fRMXjAH5Jy_QQfHmWra8/edit?usp=sharing)

---

## 🛠️ Fitur Utama Aplikasi

1.  **Halaman Publik (Landing Page):**
    *   Informasi latar belakang klinik dan tim fisioterapis.
    *   Circular Frame Flat Vector Portrait untuk Fisioterapis Utama.
    *   Integrasi peta lokasi Google Maps.
    *   Tombol Chat WhatsApp dengan ikon Iconify.
    *   Tabel katalog layanan terapi unggulan tanpa menampilkan harga.
2.  **Portal Autentikasi Tanpa Password untuk Pasien:**
    *   Pasien dapat masuk menggunakan Nomor Rekam Medis (ID Pasien) tanpa password.
    *   Pencarian rekam medis mandiri secara otomatis setelah login.
3.  **Portal Admin & Fisioterapis:**
    *   Manajemen pendaftaran antrean (Waiting List).
    *   Pengaturan jadwal kerja harian fisioterapis.
    *   Pengisian rekam medis SOAP (Subjective, Objective, Assessment, Plan).
    *   Ekspor cetak berkas SOAP rekam medis.
    *   Laporan statistik & grafik frekuensi penanganan pasien.
4.  **Desain Responsif Penuh (Mobile-Ready):**
    *   Menggunakan media query breakpoint `1024px` untuk menutup menu navigasi atas ke dalam menu hamburger.
    *   Optimalisasi container viewport (`min-width: 0`) agar tabel data tidak memicu layout overflow pada ponsel.
    *   Bilah header mobile yang bersih dengan tombol burger garis 3 selalu terlihat kokoh di kanan atas.

---

## 📂 Struktur Berkas Project

*   `index.html` — Kerangka struktur HTML, styling CSS (Publik & Dashboard), dan logika interaksi Javascript.
*   `kode.gs` — Handler API server Google Apps Script untuk operasi sinkronisasi dan manipulasi data di Google Sheets.
*   `therapist_illustration.png` — Flat-vector ilustrasi fisioterapis utama berhijab dengan tema hijau/mint.

---

## 🚀 Jalankan Secara Lokal (Offline / Development)
1. Buka file `index.html` menggunakan extension browser **Live Server** di VS Code.
2. Aplikasi akan otomatis mendeteksi lingkungan offline dan menggunakan **LocalStorage (`ceri_fisio_db`)** sebagai database cadangan dengan fitur *Self-Healing* jika data kosong.
