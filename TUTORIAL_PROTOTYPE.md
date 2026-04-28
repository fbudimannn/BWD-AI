# 🌾 Panduan Uji Coba Prototype BWD AI

Dokumen ini adalah panduan interaktif (User Journey) untuk mencoba semua fitur yang ada di **BWD AI Web Prototype** (Fase MVP). Silakan ikuti langkah-langkah di bawah ini secara berurutan untuk merasakan pengalaman *end-to-end* sebagai seorang petani.

**🔗 Link Akses Prototype:** [https://fbudimannn.github.io/BWD-AI/](https://fbudimannn.github.io/BWD-AI/)

---

## 🎯 Skenario 1: Onboarding (Persiapan Awal)
*Sebagai petani baru, Anda harus mengatur profil dan mendaftarkan lahan sawah Anda.*

1. **Buka Aplikasi** melalui browser HP atau Laptop.
2. Buka menu **👤 Profil** (di Navigasi Bawah).
3. **Ubah Nama:** Klik pada tulisan "Petani" di bawah avatar, dan ketikkan nama Anda (Misal: *Pak Budi*).
4. **Tambah Sawah:** 
   - Klik tombol **+ Tambah Sawah**.
   - Masukkan nama sawah (Misal: *Sawah Lor*) dan luasnya (Misal: *1.5* ha).
   - *Perhatikan bahwa sawah baru Anda sekarang muncul di daftar "Sawah Saya".*

## 📅 Skenario 2: Mengatur Jadwal Tanam
*Agar AI bisa mengingatkan kapan harus memupuk, Anda harus memasukkan tanggal tanam.*

1. Buka menu **📅 Kalender**.
2. Pada bagian **Tanggal Tanam**, pilih tanggal **1 bulan yang lalu** (Tujuannya agar kita bisa memicu simulasi notifikasi "Waktunya Pupuk" hari ini).
3. Pilih sawah Anda dari *dropdown* (Misal: *Sawah Lor*).
4. Klik tombol biru **Set Jadwal**.
5. *Lihat hasilnya:* 
   - Muncul **Timeline Pertumbuhan** yang menunjukkan fase padi saat ini (Misal: *Anakan Aktif / Primordia*).
   - Muncul daftar **Jadwal Scan & Pemupukan** di bawahnya.

## 🔔 Skenario 3: Mengecek Notifikasi Pintar
*Aplikasi akan mengingatkan Anda jika ada jadwal penting.*

1. Pindah ke menu **🏠 Home**.
2. Coba perhatikan **Ikon Lonceng 🔔** di pojok kanan atas. Akan ada titik merah kecil yang menandakan notifikasi baru!
3. Klik ikon lonceng tersebut.
4. Anda akan melihat pesan dari AI: *"📸 Waktunya scan BWD di Sawah Lor!"* 
5. Di menu Home, Anda juga bisa melihat rangkuman jadwal mendatang di bagian **🔔 Jadwal Mendatang**.

## 📸 Skenario 4: Simulasi Scan Daun (Fitur Utama)
*Saatnya mengecek apakah padi Anda kekurangan Nitrogen atau tidak.*

1. Buka menu **📸 Scan**.
2. Di bagian Langkah 1, klik **Ambil Foto** (atau tap pada area kotak putus-putus).
3. Jika di HP, kamera Anda akan terbuka. Jika di Laptop, Anda akan diminta memilih file gambar.
   - *Tips: Coba foto sembarang daun hijau di sekitar Anda, atau gunakan gambar daun dari Google.*
4. Di bagian Langkah 2, pilih **Target Hasil Panen** yang Anda inginkan (Misal: *7 ton/ha*).
5. Pilih lokasi sawah di bagian **📍 Sawah**.
6. Klik tombol hijau besar **🧠 Analisis Sekarang**.
7. *Tunggu 1-2 detik (animasi loading), dan lihat Hasil Analisisnya!*
   - Anda akan mendapatkan **Skor BWD** (Skala 2 sampai 5).
   - **Status Nitrogen** (Apakah kurang, pas, atau berlebih).
   - **Rekomendasi Dosis Urea** (Berapa kg/ha yang harus disebar).

## 📊 Skenario 5: Analitik & Evaluasi Bisnis
*Melihat riwayat scan dan menghitung penghematan biaya pupuk.*

1. Buka menu **📊 Dashboard**.
2. Di sini Anda bisa melihat **Trend Skor BWD** dalam bentuk grafik.
3. Di bagian bawah, ada **Kalkulasi Biaya Pupuk**:
   - Anda bisa mengubah harga Urea per kg (Misal: Rp 3.500).
   - Ubah Luas Sawah Anda (Misal: 1.5 ha).
   - Sistem akan otomatis menghitung: *Berapa biaya pupuk kalau pakai BWD AI* VS *Kalau pakai cara tradisional/menebak*.
   - Lihat bagian paling bawah (warna oranye) untuk melihat **Estimasi Penghematan Uang Anda!**

## 🏆 Skenario 6: Gamifikasi (Achievements)
*Sistem akan memberikan reward berupa badge kepada petani yang rajin.*

1. Kembali ke menu **👤 Profil**.
2. Perhatikan deretan *badge* (lencana) di bawah nama Anda.
3. Karena Anda baru saja melakukan 1x Scan, **Badge Kamera 📸 (Scan Pertama)** sekarang menyala dan terbuka kuncinya! Badge lain masih terkunci sampai Anda mencapai target tertentu.

---
> **Catatan Teknis untuk Penguji:** Prototype saat ini menggunakan algoritma Color Extraction (Heuristik RGB) sementara sebagai pengganti model AI Deep Learning. Pemrosesan terjadi 100% di perangkat Anda (Offline/Client-side). Fase berikutnya akan menggantikan algoritma ini dengan model *Convolutional Neural Network (CNN)* terlatih.
