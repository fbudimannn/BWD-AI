# BWD AI - Design System & UI/UX Guidelines

Dokumen ini berisi panduan rancangan visual (Design System) untuk aplikasi PWA **BWD AI**. Gunakan panduan ini sebagai referensi jika ada penambahan fitur atau modifikasi UI di masa depan agar aplikasi tetap konsisten, rapi, dan mudah digunakan oleh petani.

---

## 1. Filosofi Desain (Design Philosophy)
- **Natural & Fresh:** Menggunakan elemen warna alam (hijau daun, kuning padi) yang menyatu dengan lingkungan kerja petani.
- **Modern & Clean:** Menghindari tampilan yang terlalu kaku atau "terlalu pemerintahan". Kita menggunakan desain bergaya *Glassmorphism* ringan, sudut melengkung besar (curvy), dan bayangan lembut.
- **Finger-Friendly:** Karena pengguna utama adalah petani di lapangan (seringkali dengan layar HP yang terang dan jari yang kotor), semua area sentuh (tombol, tab, kartu) dibuat **besar dan kontras**.

---

## 2. Palet Warna (Color Palette)

Aplikasi ini menggunakan sistem warna yang berbasis alam (Environment-inspired).

### 🟢 Warna Utama (Primary & Accent)
- **Primary (Leaf Green):** `#0d631b` — Digunakan untuk aksi utama, tombol utama, dan indikator status *excellent*.
- **Secondary Accent:** `#2e7d32` — Digunakan untuk teks header dan aksen pendukung.
- **Tertiary Accent (Sun Yellow):** `#fec330` — Digunakan untuk *warning*, BWD skor rendah, atau status *pending*.

### ⚪ Warna Dasar (Background & Surface)
- **App Background:** `#f7f9fb` — Abu-abu sangat terang (hampir putih), memberikan kesan bersih dan tidak menyilaukan mata di bawah terik matahari.
- **Card Background:** `#ffffff` — Putih solid untuk membedakan elemen dari *background* utama.
- **Input Background:** `#f1f5f9` — Abu-abu kebiruan lembut untuk area input form agar terlihat *clickable*.

### ⚫ Warna Teks (Typography Colors)
- **Text Primary:** `#191c1e` — Hitam gelap (bukan hitam murni) untuk judul dan teks utama. Mengurangi *eye-strain*.
- **Text Secondary:** `#40493d` — Hijau sangat gelap untuk teks paragraf.
- **Text Muted:** `#707a6c` — Hijau keabu-abuan untuk *placeholder* atau label pendukung.

### 🎨 Warna Skor BWD (Indikator Analisis)
- **BWD 2 (Kurang):** `#fec330` (Kuning)
- **BWD 3 (Cukup):** `#88d982` (Hijau Muda)
- **BWD 4 (Optimal):** `#2e7d32` (Hijau Standar)
- **BWD 5 (Sangat Baik):** `#0d631b` (Hijau Tua Pekat)

---

## 3. Tipografi (Typography)

Aplikasi menggunakan kombinasi *Google Fonts* untuk kesan modern dan *legibility* tinggi.

- **Heading & Title:** `Manrope` (Kesan kokoh, membulat, dan modern).
- **Body & Paragraf:** `Inter` (Sangat mudah dibaca di layar kecil).
- **Ukuran Standar:**
  - Page Title: `24px` (Extrabold)
  - Card Title: `16px` (Bold)
  - Body Text: `14px` (Regular)
  - Small Label / Tab: `11px - 12px` (Semibold)

---

## 4. Komponen UI (UI Components)

### Bentuk & Sudut (Shape & Radius)
- **Radius Sangat Lengkung (Curvy):** `24px` untuk kotak besar (Card, Modal). Memberikan kesan ramah (*friendly*).
- **Radius Medium:** `14px - 16px` untuk Tombol (Button) dan Input Box.

### Bayangan & Dimensi (Shadows)
- **Card Shadow:** `0 8px 24px rgba(46, 125, 50, 0.08)` — Bayangan yang sedikit kehijauan, bukan abu-abu murni, agar lebih menyatu dengan tema alam.
- **Glow Effect:** Tombol utama menggunakan bayangan (*glow*) berwarna hijau saat ditekan.

### Ikonografi (Iconography)
Aplikasi ini secara eksklusif menggunakan **Phosphor Icons** (varian `ph-fill` untuk solid). Ikon harus selalu memiliki sudut melengkung dan bentuk yang solid untuk kemudahan pembacaan.

### Modal (Pop-up)
- **Overlay:** `rgba(0, 0, 0, 0.6)` dengan efek `backdrop-filter: blur(6px)` untuk memisahkan fokus secara elegan dari layar utama.
- **Positioning:** Di tengah layar (Centered) di Desktop, dan sedikit di-pad agar mudah disentuh di Mobile.
- **Z-Index:** Minimal `9999` untuk memastikan modal selalu berada di atas Navbar dan elemen melayang lainnya.

---

## 5. Panduan UX (User Experience)

1. **Satu Klik Lebih Baik:** Kurangi jumlah klik (*taps*). Misalnya, penggunaan fitur pemilih kamera bawaan OS (`<input type="file" capture="environment">`) jauh lebih baik daripada membuat UI kamera custom yang rawan *bug*.
2. **Animasi Halus:** Semua transisi (klik tombol, perpindahan halaman) menggunakan CSS transition `0.3s cubic-bezier(0.4, 0, 0.2, 1)`. 
3. **Pemaaf Kesalahan (Forgiving UI):** Gunakan `img.onerror` dan *Leaf Detection* untuk menangani format gambar yang salah tanpa membuat layar *stuck*. Berikan pesan *error* yang ramah bagi petani.
4. **Sentuhan Interaktif:** Semua tombol dan *card* yang bisa di-klik harus memiliki efek *scale* membesar atau mengecil saat di-*hover* atau di-tap (Micro-interactions).

---

*Dokumen ini dapat diperbarui seiring dengan pertumbuhan fitur aplikasi BWD AI.*
