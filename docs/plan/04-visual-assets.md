# Visual Specification & Asset Direction

## Design read

Reading this as: a mobile-first creative photobooth for social expression, with an editorial manga-print language and a calm, tool-like studio.

Creative direction: **The Four-Panel Print Club**. Variance 7 pada pembuka, 4 pada editor; motion 3; density 3. Identitas datang dari komposisi cetak, bukan animasi yang memenuhi layar. Referensi dan batas penggunaannya ada di `01-research.md` R1–R4.

## Identitas

Wordmark “KomaSnap” padat, sedikit condensed, hitam. Simbol original: empat bidang panel dengan satu sudut shutter terpotong. Hindari logo lensa generik dan karakter maskot anime sebagai identitas utama. Simbol harus terbaca pada ukuran favicon; buat SVG, bukan raster generated.

Nada: ringan dan percaya diri. Label proses tetap literal. Caption bisa playful, error tidak bercanda. Tidak memakai kanji acak sebagai pengisi ruang.

## Token dasar

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| Paper | `#F5F1E8` | Latar utama hangat |
| Surface | `#FFFCF5` | Inspector dan bidang terang |
| Ink | `#20201E` | Teks, border utama, CTA gelap |
| Muted ink | `#66635C` | Teks pendukung di paper |
| Rule | `#D6D0C3` | Pemisah sekunder, bukan teks |
| Vermilion | `#B83B25` | Aksen utama dan CTA terpilih dengan teks terang |
| Lavender | `#D9CFE9` | Aksen Soft Shoujo, bukan teks kecil |
| Pocket | `#CBD5A0` | Latar koleksi retro |

Warna adalah pilihan rancangan; cek kontras pasangan nyata saat implementasi. Error menggunakan label/icon dan teks gelap selain warna. Tidak menambahkan theme switch/dark mode di v1.

Typography:
- Display: Barlow Condensed 700; headline desktop 64–88 px, mobile 42–54 px; line-height 0.95–1.05.
- UI: Geist Sans 400/500/600; body 16 px, label 14 px, heading ruang 24–32 px.
- Metadata: Geist Mono 12–13 px; tidak dipakai untuk paragraf atau tombol primer.
- Caption artwork: pilihan sans atau condensed, maksimal dua keluarga per output. Sistem fallback Unicode eksplisit; jangan menganggap semua font mendukung seluruh bahasa.
- Semua font dibundel lokal dan menunggu font-ready sebelum render. Tidak bergantung CDN runtime.

Spacing: 4/8/12/16/24/32/48/64 px. Desktop gutter 32–48 px, mobile 16 px. Header 56–64 px. Content max-width 1280 px. Inspector 320 px. Radius kontrol 8 px; canvas panel 0–2 px; tidak semua komponen berbentuk pill. Border utama 1.5–2 px. Shadow hanya pada preview “kertas”, tipis dan pendek; tidak pada semua panel.

Tekstur: grain tipis hanya di pinggir pembuka dan artwork. Area input polos. Tidak ada noise overlay full-screen yang memengaruhi keterbacaan kamera. Decoration berfungsi sebagai hierarki, bukan pengisi whitespace.

## Komposisi layar

### Intro

Desktop: header kecil di atas. Headline dan aksi pada sekitar 45% lebar, strip asli/demo sekitar 55%. Strip miring maksimal 4°, ditemani label issue kecil dan satu swatch koleksi. CTA di area bawah headline, bukan floating di atas gambar. Headline maksimal tiga baris. Tidak memakai mockup browser/phone di dalam halaman aplikasi.

Mobile: wordmark → headline → contoh strip ringkas + hint empat panel → tombol penuh. Elemen artwork boleh lebih pendek agar CTA terlihat tanpa scroll panjang. Tidak memaksa strip penuh setinggi 3× lebar layar pada intro; contoh dapat disajikan miring pada area ilustrasi dengan label yang tetap terbaca.

### Booth

Kamera menjadi bidang paling luas. Frame number besar tetapi tidak menutupi wajah. Control bar polos; empat koleksi adalah thumbnail dengan nama, bukan empat kartu marketing. Thumbnail shot bertambah satu per satu dengan transisi 180 ms.

### Studio

Workspace netral, inspector terstruktur dengan garis pemisah. Artwork tidak dimasukkan dalam kartu yang berada di dalam kartu lain. Pada laptop 1280×720, header, preview fit, dan Finish strip harus dapat dijangkau tanpa scroll seluruh workspace; inspector boleh scroll sendiri. Pada mobile pendek, utamakan scroll alami daripada menyembunyikan kontrol.

### Result

Satu karya dominan di tengah; kontrol format/ukuran dan distribusi dikelompokkan dekat karya. Reveal seperti kertas keluar dari mesin selama sekitar 400 ms, hanya sekali. Tidak ada confetti, autoplay musik, upsell, atau tombol share yang menutupi karya.

## Artwork geometry

Semua angka berikut adalah unit desain, bukan pixel output yang selalu tetap. Renderer menskalakan ke format ekspor.

### Four-Panel Strip — 400 × 1200

- Margin kiri/kanan 24, header 40, footer mulai sekitar 1090.
- Empat panel lebar 352, tinggi 246; y = 52, 310, 568, 826; gap 12.
- Footer memuat judul/caption/tanggal/credit dengan hierarki, bukan empat baris besar yang berebut ruang.
- Panel berbentuk persegi panjang, bukan sudut membulat pastel. Border variasi koleksi tidak mengubah bounds foto.

### Manga Page — 600 × 800

- Margin 28, header 56; gutter 12.
- Panel 1: x28/y64/w544/h224.
- Panel 2: x28/y300/w266/h170; panel 3: x306/y300/w266/h170.
- Panel 4: x28/y482/w544/h220.
- Footer y718 sampai 776. Urutan 1 → 2 → 3 → 4; foto terakhir menjadi payoff.

### Cover Shot — 600 × 800

- Margin 28; foto x28/y100/w544/h568.
- Judul pada header; caption/tanggal di footer. Satu bubble dapat menembus tepi frame secara terkontrol, bukan menutupi pusat wajah.
- Pilihan foto 1–4 terlihat; tiga foto lain tetap tersimpan ketika berpindah layout.

## Koleksi dan perlindungan subjek

| Koleksi | Foto | Dekorasi default | Batas |
| --- | --- | --- | --- |
| Koma Impact | Tinta hitam/off-white, threshold bersih | Radial lines pinggir, nomor episode, burst kecil | Pusat 55% panel relatif tenang; bukan face detection |
| Soft Shoujo | Tone lembut lavender, highlight tertahan | Dua cluster bunga kecil, sparkle, bubble oval | Tidak memakai sparkle besar di mata atau skin smoothing |
| Copy Club | Monokrom kasar tetapi subjek terbaca | Tape pada margin, stamp, sobekan pinggir | Noise tidak menghapus ekspresi; maksimal dua aksen kertas dominan |
| Pocket ’98 | Empat hijau dari terang ke gelap | Pixel star, score, player label | Nearest-neighbor pada foto; teks ekspor tetap terbaca |

Setiap pasangan koleksi-layout punya tiga susunan preset (total 36). Ini konfigurasi posisi dari aset yang sama, bukan 36 gambar full-page. Pilihan warna latar mengikuti koleksi; UI shell tetap Paper/Ink/Vermilion.

## Inventory aset

| Asset | Jumlah | Bentuk dan brief |
| --- | --- | --- |
| Logo + mark + favicon | Satu sistem | SVG original, dapat dibaca kecil |
| Foto demo | Empat foto ekspresi dari satu subjek dewasa fiktif | Generated atau foto berizin; natural lighting, wajah konsisten, tanpa figur publik |
| Preview koleksi | Empat | Render dari foto demo yang sama menggunakan engine final, bukan janji visual yang tak bisa dicapai |
| Stiker | 24 | Enam/koleksi, SVG original, viewBox rapi, tanpa external reference |
| Speech bubble | Dua bentuk | Oval dan burst, vector; teks terpisah dirender asli |
| Paper texture | Maksimal dua | Tile grayscale halus, generated opsional, ringan, tidak baked dengan tulisan |
| Social preview | Satu 1200×630 | Logo dan contoh karya; tanpa data pengguna |
| Ikon UI | Satu sistem stroke | Self-authored SVG; stroke konsisten, accessible labels di kontrol |

Stiker enam/koleksi:
- Impact: impact burst, speed corner, exclamation, motion ticks, episode stamp, “WOW!”.
- Shoujo: petal cluster, sparkle, small heart, ribbon, diary seal, flower corner.
- Copy Club: tape, torn label, staple pair, barcode dekoratif, copy stamp, star cutout.
- Pocket: pixel star, heart, cursor, score label, battery dekoratif, player badge.

Barcode/staple/battery bersifat dekoratif, bukan scan code atau indikator perangkat. Japanese onomatopoeia boleh mengganti salah satu varian Impact hanya setelah makna/ejaan dipastikan; v1 tidak bergantung pada itu.

## Produksi visual saat implementasi

Sebelum menulis UI utama, buat mockup terpisah dan besar untuk intro desktop, booth mobile, studio desktop, studio mobile, serta result mobile. Jangan menggabungkan seluruh layar menjadi satu gambar kecil. Gunakan spesifikasi ini sebagai source of truth; gambar referensi tidak boleh mengubah kontrol yang sudah ditetapkan.

Jika image-generation tersedia, gunakan skill terkait dan hasilkan foto demo/texture/mockup. Jangan mengirim foto pengguna ke generator. Jika tool unavailable atau gagal, lanjutkan dengan aset original SVG/prosedural dan sample berizin yang tersedia; dokumentasikan keterbatasan. Tidak memasang API key atau generator runtime untuk mengatasi kekurangan aset build-time.

Simpan provenance setiap aset dalam manifest: path, asal/creator, tanggal, lisensi atau status generated, prompt bila generated, modifikasi. Jangan menyalin aset pesaing atau komik berlisensi. Lisensi kode proyek tidak otomatis dianggap meliputi semua aset.

Target budget desain: aset intro yang dikompresi sekitar ≤600 KB, tekstur ≤150 KB/file, stiker SVG umumnya ≤15 KB/item. Ini target, bukan benchmark yang sudah diukur. Hindari memasukkan gambar mockup besar ke bundle aplikasi.
