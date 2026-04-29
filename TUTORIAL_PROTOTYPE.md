# 🌾 Panduan Visual Uji Coba BWD AI

Selamat datang di panduan interaktif **BWD AI Web Prototype**. Dokumen ini telah diperbarui khusus untuk mendemonstrasikan pengalaman UI terbaru kita (*Harvest Modern Design System*) serta fitur interaktif **Kalender Pemupukan** dan **Micro-Thumbnails**.

**🔗 Link Akses Prototype:** [https://fbudimannn.github.io/BWD-AI/](https://fbudimannn.github.io/BWD-AI/)

Silakan ikuti langkah-langkah di bawah ini untuk merasakan pengalaman aplikasi secara utuh (End-to-End).

---

## 🎯 Skenario 1: Onboarding & Home
*Sebagai petani, Anda akan mendarat di halaman beranda yang menampilkan metrik kunci secara instan.*

1. **Buka Aplikasi** melalui *smartphone* atau laptop.
2. Anda akan langsung melihat halaman **🏠 Home**.
3. Halaman ini dirancang sangat bersih dengan sapaan personalisasi ("Halo, Petani!").
4. Di bagian bawah terdapat **Menu Cepat** dan **Jadwal Mendatang** yang memberikan akses kilat tanpa navigasi yang membingungkan.

![Tampilan Home BWD AI](file:///C:/Users/Fakhri/.gemini/antigravity/brain/bb8c9516-1334-4b8f-a139-6d9b18d67bc4/home_tab_1777402947906.png)

---

## 📅 Skenario 2: Mengatur Jadwal & Mencatat Pupuk (Fitur Baru)
*Petani harus memasukkan tanggal tanam agar sistem bisa mengingatkan kapan harus memupuk, dan mencatat eksekusinya di lapangan.*

1. Pindah ke menu **📅 Kalender**.
2. Pilih tanggal tanam dari *datepicker*. (Coba pilih tanggal sekitar **25 hari yang lalu** agar jadwal pemupukan hari ini aktif).
3. Klik tombol **Set Jadwal**.
4. Sistem akan membuatkan jadwal "Scan BWD" dan "Pemupukan".
5. **Simulasi Aksi:** Jika hari ini adalah jadwal memupuk (atau sudah lewat), Anda akan melihat tombol biru **"Tandai Dipupuk"**.
6. Klik tombol tersebut! Sebuah kotak dialog akan muncul menanyakan *"Berapa kg Urea/ha yang Anda tabur?"*. Angka rekomendasi dari scan sebelumnya otomatis terisi.
7. Klik **OK**. Lencana akan berubah seketika menjadi **✅ Selesai**, dan jumlah pupuk ini akan langsung tercatat ke Dashboard.
8. **Laporan Historis:** Coba klik lencana **✅ Selesai** tersebut! Anda akan melihat jendela *pop-up* keren (*History Modal*) yang menampilkan laporan lengkap pemupukan hari itu beserta dosis aktualnya.

![Kalender Interaktif & Tombol Pemupukan](file:///C:/Users/Fakhri/.gemini/antigravity/brain/bb8c9516-1334-4b8f-a139-6d9b18d67bc4/calendar_1777403031674.png)

---

## 📸 Skenario 3: Simulasi Scan Daun
*Mengecek apakah padi Anda kekurangan Nitrogen dengan teknologi kamera HP.*

1. Buka menu **📸 Scan**.
2. Klik tombol besar **Ambil Foto** untuk membuka kamera HP Anda.
3. Arahkan ke daun padi yang sehat/terbuka sempurna.
4. Pilih **Target Hasil Panen** (Misal: *7 ton/ha*). Target panen ini akan mempengaruhi seberapa banyak sistem menyarankan pemberian dosis urea!
5. Klik **🧠 Analisis Sekarang**.
6. Dalam 1 detik, hasil akan keluar lengkap dengan **Dosis Urea** yang disarankan dan **Analisa RGB** secara mendetail.
7. **Pintasan Cerdas (Fitur Baru):** Di bagian bawah hasil rekomendasi, Anda akan melihat tombol **"Catat Pemupukan Hari Ini"**. Klik tombol ini untuk memotong jalur dan langsung memasukkan data pemupukan ke memori kalender tanpa perlu repot pindah layar!

![Halaman Scan Daun Padi](file:///C:/Users/Fakhri/.gemini/antigravity/brain/bb8c9516-1334-4b8f-a139-6d9b18d67bc4/scan_1777403061272.png)

---

## 📊 Skenario 4: Membaca Dashboard & Thumbnail (Fitur Baru)
*Memantau seluruh sawah Anda, melihat uang yang dihemat, dan mengecek foto hasil scan masa lalu.*

1. Pindah ke menu **📊 Dashboard**.
2. Anda bisa melihat **Rangkuman Total**. Di sinilah metrik *"Actionable"* bekerja. Panah (↗️/↘️) akan menunjukkan apakah jumlah urea Anda naik atau turun dibanding masa lalu.
3. Coba **Filter Sawah**: Jika Anda punya lebih dari 1 sawah (yang bisa ditambah di menu Profil), *dropdown* di atas akan memfilter seluruh data khusus untuk lahan tersebut.
4. **Micro-Thumbnails:** Gulir ke bawah ke bagian **📋 Riwayat Scan**. Perhatikan bahwa alih-alih cuma angka, kini sistem menyimpan **FOTO ASLI** yang Anda ambil saat scan dalam bentuk *thumbnail* kecil. Memori HP Anda tidak akan penuh karena teknologi kompresi pintar kami.
5. **Detail Laporan:** Coba klik salah satu riwayat scan tersebut! Sama seperti di Kalender, layar akan menampilkan *pop-up* laporan lengkap berisi foto resolusi tinggi, skor BWD, dan rekomendasi target panen.

![Dashboard Analitik BWD AI](file:///C:/Users/Fakhri/.gemini/antigravity/brain/bb8c9516-1334-4b8f-a139-6d9b18d67bc4/dashboard_1777403082997.png)

---

## 👤 Skenario 5: Personalisasi Profil & Lahan
*Mengelola identitas dan aset.*

1. Buka menu **👤 Profil**.
2. Di sini Anda bisa mengubah nama Anda kapan saja.
3. Di bagian "Sawah Saya", klik **+ Tambah Sawah** untuk menambahkan petak sawah baru. Sawah ini nantinya bisa dipilih saat Anda melakukan Scan atau membuat Jadwal Kalender.
4. **Gamifikasi Cerdas:** Perhatikan lencana penghargaan di bagian bawah. Setiap kali Anda mendapatkan pencapaian baru (misal: Scan pertama kali), sistem akan memunculkan **Notifikasi Melayang (*Toast*)** berwarna hijau secara otomatis layaknya bermain *game*!

![Halaman Profil dan Lahan](file:///C:/Users/Fakhri/.gemini/antigravity/brain/bb8c9516-1334-4b8f-a139-6d9b18d67bc4/profile_1777403097989.png)

---
> **Catatan Teknis untuk Penguji:** Prototype saat ini berjalan **100% Offline (Client-side)** di HP Anda tanpa server *database*. Hal ini membuktikan kecepatan aplikasi di daerah susah sinyal. Semua data Anda (jadwal, log pemupukan, foto daun terkompresi) aman tersimpan di *browser* HP Anda masing-masing.
