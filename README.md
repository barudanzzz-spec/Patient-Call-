# Patient Call

Aplikasi komunikasi sederhana antara pasien dan orang yang menjaganya.

## Fitur prototipe
- Mode Pasien dan Penjaga.
- Tombol kategori kebutuhan.
- Kode pairing demo.
- Riwayat panggilan lokal.
- Pengaturan Quick Call Volume.

## Status penting
Versi ini adalah prototipe antarmuka lokal. Tombol panggilan belum mengirim
notifikasi ke perangkat lain. Kode pairing masih berupa demo lokal.

Agar dua HP benar-benar terhubung, perlu integrasi backend Supabase,
autentikasi/pairing aman, realtime, serta notifikasi push.

Quick Call Volume belum menangkap tombol volume fisik. Fitur itu memerlukan
modul native Android khusus dan pengujian pada perangkat nyata. iOS tidak
menyediakan pintasan volume global yang setara.

Jangan gunakan prototipe ini sebagai pengganti bel rumah sakit atau layanan
darurat. Untuk kebutuhan medis mendesak, panggil petugas rumah sakit secara
langsung.

## Persiapan
1. Instal Node.js dan npm.
2. Jalankan `npm install`.
3. Jalankan `npx expo start`.

## Build Android
Setelah konfigurasi EAS dan akun Expo siap:
`eas build --platform android --profile preview`
