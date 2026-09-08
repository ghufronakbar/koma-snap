Role: Senior Frontend Creative Technologist & Next.js Specialist
Project: KomaSnap (Open-Source Aesthetic Photobooth Web App)

### Context & Purpose
KomaSnap adalah aplikasi photobooth web open-source berbasis Next.js yang dirancang khusus untuk audiens media sosial (Instagram Stories, TikTok, X, Pinterest). Nilai jual utamanya bukan filter pastel biasa, melainkan estetika subkultur yang unik: manga/anime klasik (speedlines, screentone), underground punk/fanzine, risograph, dan retro lo-fi tech. 

Aplikasi ini harus berjalan 100% di browser pengguna (zero backend, zero database, privasi total) dan fokus pada kemudahan ekspor serta sharing instan ke media sosial dalam format 9:16 (Story format) maupun photostrip vertikal klasik.

---

### Core Technical Directives
1. Gunakan Next.js (App Router, Client Components untuk interaktivitas kamera dan canvas).
2. Semua pemrosesan citra, rendering filter, dan ekspor dilakukan sepenuhnya di browser menggunakan HTML5 `<video>`, WebGL/Canvas API 2D. Jangan gunakan backend API atau external storage.
3. Struktur folder dan best practice Next.js sudah dipahami; fokuslah langsung pada logika fungsional, state management, shader pipeline, dan UX sharing.

---

### Key Modules & Requirements

#### 1. Camera & Capture Pipeline
* Hubungkan webcam via `navigator.mediaDevices.getUserMedia` dengan aspect ratio adaptif (desktop & mobile front-camera friendly).
* Fitur Shutter Countdown: Timer visual 3 detik dengan audio feedback (suara shutter mekanik/klik analog via Web Audio API synthesizer sederhana, tanpa perlu file audio eksternal).
* Multi-shot Capture: Ambil 4 frame berurutan dengan jeda 2 detik antar foto.
* Simpan raw image frame sebagai `ImageData` atau `Blob` di state lokal browser.

#### 2. Visual Filter & Shader Engine
Sediakan real-time preview (atau post-capture processing) menggunakan Canvas 2D / WebGL fragment logic untuk filter-filter subkultur berikut:
* **Manga Shonen (Koma Impact):** 1-bit high-contrast black & white (thresholding), procedural radial speedlines yang memusat, dan tekstur tinta kasar.
* **Shojo Kira-Kira:** Soft glow/bloom, halftone screentone titik-titik halus, palet lavender/monokrom lembut, dan partikel kelopak bunga/sparkle.
* **Punk Xerox / Fanzine:** Efek fotokopi monokrom kontras brutal, noise kertas robek, dan tekstur staples/lakban di tepi frame.
* **Risograph 2-Tone:** Simulasi tabrakan 2 warna (misal Fluorescent Pink & Teal Blue) dengan efek misregistration (lapisan warna sengaja bergeser 2-3px dari garis outline).
* **Game Boy 1998:** Downscale resolusi ke grid piksel kasar dengan algoritma 4-level Bayer Dithering (palet hijau matriks klasik).
* **Midnight 90s VHS:** Chromatic aberration (RGB shift), scanlines horizontal tipis, dan timestamp oranye digital (`'98 08 24`).

#### 3. Layouts & Interactive Sandbox
* **Pilihan Layout Strip:**
  * *Yonkoma (Classic 4-Cut):* 4 frame vertikal berjejer.
  * *Dramatic Splash:* 1 frame besar di atas, 2 frame kecil di bawah.
  * *Cassette J-Card:* Layout horizontal menyerupai sampul pita kaset.
* **Sticker & Text Customization:**
  * User dapat menambahkan stiker SVG (kanji onomatopoeia seperti `ドドド`, `バーン`, stiker Parental Advisory, barcode, dan tanggal).
  * Balon dialog komik (Speech Bubble) dengan teks yang bisa diedit langsung oleh pengguna.
  * Objek di kanvas bisa digeser (drag), diatur ukuran (scale), dan dirotasi.

#### 4. Social-First Sharing & Export Pipeline
Buat alur ekspor semulus mungkin untuk pengguna media sosial:
* **Preset Rasio Format:**
  * **9:16 (IG Story / TikTok):** Frame photostrip diletakkan di tengah dengan background berpola/solid estetis, siap di-upload ke Story tanpa terpotong.
  * **Photostrip Murni (1:3 / 1:4):** Format strip ramping tradisional siap cetak.
  * **1:1 Square:** Format kotak untuk feed grid.
* **Frictionless Social Sharing:**
  * Implementasikan **Web Share API** (`navigator.share` dengan payload `files`). Di perangkat mobile, tombol "Share to Story" harus langsung membuka native share sheet (Instagram, WhatsApp, X, dll.).
  * **Copy to Clipboard:** Tombol untuk menyalin image blob langsung ke clipboard (`navigator.clipboard.write([new ClipboardItem(...)])`) agar pengguna desktop bisa langsung `Ctrl+V` di chat atau media sosial.
  * **High-Res Download:** Opsi simpan PNG resolusi tinggi (300 DPI target rendering).

---

### Expected Code Delivery
1. Bangun komponen utama kamera dan capture hook (`useCamera`).
2. Implementasikan algoritma manipulasi pixel/canvas untuk filter (minimal buatkan implementasi penuh untuk *Manga Impact* dengan thresholding + speedlines dan *Game Boy Bayer Dithering*).
3. Bangun engine penggabung strip final (`renderFinalStrip`) ke canvas offscreen lengkap dengan stiker dan frame.
4. Implementasikan modul Social Share & Download handler dengan fallback jika Web Share API tidak didukung browser.