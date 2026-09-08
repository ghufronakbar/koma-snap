# Produk dan Scope Final

## Produk

KomaSnap mengubah empat foto menjadi cerita visual bergaya manga dan cetakan alternatif. Ditujukan untuk orang yang ingin membuat hasil personal dengan cepat, sendiri maupun bersama teman. Tidak mengubah wajah menjadi gambar anime dengan AI; foto diberi perlakuan tinta, tone, pixel, frame, dan dekorasi.

Bahasa UI v1: English singkat untuk audiens global; dokumentasi perencanaan Bahasa Indonesia. Caption pengguna mendukung teks Unicode selama glyph font tersedia. Stiker Jepang yang dikurasi berupa vector, bukan ketergantungan pada font Jepang untuk semua kontrol. Lokalisasi antarmuka ditunda.

## Default sesi

| Pengaturan | Default |
| --- | --- |
| Koleksi | Koma Impact |
| Layout | Four-Panel Strip |
| Jumlah foto | Empat; semua slot wajib terisi sebelum Studio |
| Countdown | Tiga detik pada setiap shot; alternatif lima |
| Shutter sound | Off, opt-in |
| Pose prompts | On, dapat dimatikan |
| Mirror | On untuk kamera depan, off untuk belakang; eksplisit dan tersimpan per foto |
| Tanggal output | Off; jika diaktifkan memakai tanggal lokal sesi, dapat diedit |
| Branding output | Credit kecil KomaSnap, dapat dimatikan gratis |
| Format Result | Story |
| Penyimpanan | Memori tab selama sesi; tidak ada autosave ke disk |

## Fitur wajib v1

| Area | Fitur dan batas |
| --- | --- |
| Entry | Contoh strip, pilih empat koleksi, kamera atau upload, penjelasan privasi |
| Capture | Depan/belakang jika tersedia, mirror, countdown 3/5, mute, empat shot, cancel, resume slot kosong |
| Input | JPG/JPEG, PNG, WebP; validasi decode; maksimum 20 MB/file dan 32 megapixel setelah decode |
| Review | Retake/ganti per foto, preview besar, urutan melalui tombol; drag reorder opsional bukan syarat |
| Foto | Crop/pan/zoom per foto dan layout, mirror per foto, reset crop |
| Koleksi | Empat perlakuan visual lengkap, intensitas global 0–100; exposure per foto −1 hingga +1 |
| Layout | Strip, Manga Page, Cover Shot dari salah satu empat foto |
| Personalize | Judul 40 karakter, subcaption 60, tanggal opsional, palet terkurasi, branding toggle |
| Dekorasi | 24 SVG original (enam/koleksi), dua tipe balon, tambah/geser/resize/rotate/duplicate/delete/layer |
| History | Undo/redo maksimum 30 perintah edit metadata; tombol selalu terlihat di Studio |
| Remix | Tiga preset dekorasi per pasangan koleksi-layout, seeded; tidak mengubah objek pengguna |
| Export | PNG standard atau 2×, preview persis file, download, share/copy bila tersedia |
| Recovery | Inline error, retry, kembali edit, reset dengan konfirmasi, jalur upload tanpa kamera |

Batas editor: maksimum 12 objek tambahan pengguna, termasuk bubble. Setiap bubble maksimum 60 karakter/empat baris; input menampilkan hitungan dan pesan overflow. Unicode dihitung per grapheme, bukan unit UTF-16. Caption tidak boleh dipotong diam-diam. Font/ukuran teks dari pilihan terkurasi, bukan font uploader.

Upload menambahkan sampai slot kosong terisi. Jika terlalu banyak file, tidak menimpa foto; beri tahu kapasitas tersisa dan minta pemilihan ulang. Satu file tidak otomatis diduplikasi empat kali. HEIC/RAW/SVG/GIF tidak dijanjikan didukung; tampilkan panduan menggunakan JPG/PNG/WebP.

## Koleksi

| Koleksi | Karakter | Perlakuan | Pose prompt empat shot |
| --- | --- | --- | --- |
| Koma Impact | Manga aksi editorial | Threshold tinta, screentone selektif, speedlines di pinggir | Meet the hero / Something's off / Plot twist / Final move |
| Soft Shoujo | Diary lembut | Desaturasi, lavender tint, glow ringan, titik halus | A little smile / Look away / Secret crush / Happy ending |
| Copy Club | Zine fotokopian | Kontras kasar, grain, tepi kertas dan tape | Straight face / Side eye / Make some noise / No rules |
| Pocket ’98 | Handheld original | Grid pixel, empat warna hijau, ordered dithering | Player ready / New challenger / Power up / You win |

Semua efek bekerja pada foto, bukan placeholder CSS. Pocket ’98 tidak memakai logo Nintendo, nama Game Boy pada produk, atau replika casing perangkat tertentu. Copy Club memakai cap original seperti “COPY CLUB”, bukan mengandalkan logo Parental Advisory.

## Layout dan format

| Layout | Foto | Rasio artwork native | Format tersedia |
| --- | --- | --- | --- |
| Four-Panel Strip | Empat berurutan dari atas | 1:3 | Strip, Story, Square |
| Manga Page | Satu panel besar, dua tengah, satu bawah | 3:4 | Story, Square |
| Cover Shot | Satu foto yang dipilih; tiga lainnya tetap ada | 3:4 | Story, Square |

Strip hanya muncul untuk layout Four-Panel Strip. Jika beralih layout saat format Strip terpilih, ubah format menjadi Story dengan pesan singkat. Jangan memaksa halaman manga ke frame strip sempit.

Story/Square adalah panggung di luar artwork; pergantian format tidak mengubah crop foto. Contain artwork, jangan crop hasil. Editor tidak menyediakan dekorasi bebas di panggung ekspor pada v1; dekorasi melekat ke artwork supaya perubahan rasio konsisten.

## Tidak masuk v1

- Akun, pembayaran, galeri publik, social feed, leaderboard, analytics atau iklan.
- Backend/cloud processing, generative AI runtime, face recognition, face beautification, background removal.
- Draft permanen, IndexedDB foto, sinkronisasi, PWA/offline guarantee.
- Video/GIF, animasi pada file hasil, QR transfer, direct social publishing.
- Risograph, VHS, Cassette J-Card, layout builder bebas, unggah stiker/font/URL.
- Test case, test suite, framework testing, atau laporan benchmark formal.

Roadmap opsional setelah v1: risograph → VHS → opt-in draft lokal → animasi. Tidak memasang tombol “coming soon” yang memenuhi editor pertama.
