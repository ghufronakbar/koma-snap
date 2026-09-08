# Riset dan Dasar Keputusan

Tanggal akses: 8 September 2026.

## Metode dan batas bukti

Pencarian web awal tidak mengembalikan hasil yang dapat dipakai dari alat pencarian. Riset dilanjutkan melalui pencarian browser, inspeksi halaman publik dan screenshot, serta pengambilan dokumentasi resmi secara langsung. Ringkasan AI mesin pencari tidak digunakan sebagai sumber.

Halaman pesaing hanya diperiksa pada permukaan publik tanpa login, memberi izin kamera, mengunggah foto, atau menyimpulkan perilaku internal mereka. Sumber browser tidak digunakan untuk mengklaim kompatibilitas seluruh perangkat. Angka dan batas dalam dokumen lain merupakan keputusan produk kecuali dinyatakan sebagai temuan sumber.

## Referensi UX dan visual

### R1 — MySketchBooth

Sumber: `https://mysketchbooth.com`

Diamati langsung: pembuka monokrom berupa gambar mesin photobooth bergaris tangan, tombol masuk pada badan mesin, contoh strip kecil, dan navigasi tambahan di bawah. Saat inspeksi muncul modal ajakan mengikuti media sosial sebelum pengalaman inti; modal ditutup untuk melihat pembuka.

**Diambil:** satu metafora visual kuat dapat menjelaskan pengalaman tanpa paragraf panjang. Contoh hasil menyatu dengan tema, bukan screenshot dashboard.

**Tidak diambil:** gerbang modal promosi, ilustrasi mesin sebagai satu-satunya navigasi, serta contoh strip yang terlalu kecil. KomaSnap memakai artwork strip besar dan tombol HTML yang jelas. Jangan menyalin ilustrasinya.

### R2 — SnapEdit Photo Booth

Sumber: `https://snapedit.app/photo-booth`

Diamati langsung: headline besar, contoh foto, area upload, navigasi produk yang luas, serta bagian template/filter/stiker. Halaman menjelaskan alur capture atau upload → customize → download; ini klaim halaman produknya, bukan hasil menjalankan editor.

**Diambil:** upload perlu terlihat sebagai jalur utama alternatif; contoh hasil harus menjelaskan nilai produk.

**Tidak diambil:** navigasi lintas produk, promosi aplikasi, paragraf marketing panjang, dan gradient hero. KomaSnap adalah alat dengan satu tujuan, bukan katalog layanan foto.

### R3 — CELSYS / Clip Studio Paint: Effective Storytelling and Design Tips

Sumber: `https://www.clipstudio.net/en/comics-manga/design-tips/`

Panduan resmi menekankan keseimbangan karakter dan background, ruang di dalam balon dialog, keterbacaan teks, serta peletakan sound effect yang mengikuti adegan. Contoh memperlihatkan background yang diringankan agar subjek menonjol.

**Interpretasi untuk KomaSnap:** manga bukan sekadar filter hitam-putih. Identitas datang dari framing, hierarki, negative space, dan lettering. Speedlines ditempatkan di pinggir dengan area pusat yang tenang; dekorasi bawaan tidak menutupi pusat foto. Batas teks KomaSnap lebih ketat daripada komik panjang karena output kecil.

Ilustrasi milik sumber hanya menjadi referensi komposisi, tidak dibundel atau dipakai sebagai stiker.

### R4 — Font primer

Sumber: `https://github.com/google/fonts/tree/main/ofl/barlowcondensed`

Repositori keluarga Barlow Condensed diperiksa sebagai calon display type. Keputusan: Barlow Condensed untuk judul editorial; Geist Sans untuk kontrol dan isi, Geist Mono untuk label teknis kecil. Sebelum membundel, unduh dari sumber resmi dan sertakan lisensi masing-masing; keberadaan di repositori bukan pengganti pemeriksaan file lisensi.

## Dokumen browser primer

### T1 — Kamera

Sumber: `https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia`

API membutuhkan secure context. Penolakan izin dan tidak adanya perangkat memiliki kondisi error berbeda. Permintaan izin bisa tetap menggantung jika pengguna tidak memilih. `facingMode` mendukung preferensi kamera.

**Keputusan:** gunakan HTTPS; kamera diminta melalui tindakan pengguna, `audio: false`; selalu sediakan upload. Jika izin belum dijawab, tampilkan bantuan dan opsi upload, bukan spinner tak berujung. Pengalihan jalur membatalkan penerapan hasil permintaan lama, bukan mengklaim dialog izin sistem dapat dibatalkan.

### T2 — Native share

Sumber: `https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share`

Share target bergantung perangkat. File sharing dapat tidak didukung, membutuhkan user activation, dan perlu pemeriksaan `navigator.canShare()`. `AbortError` dapat berarti pengguna membatalkan atau tidak ada target; penyelesaian promise bukan bukti foto berhasil diposting.

**Keputusan:** label “Share image”, bukan “Post to Instagram”. Siapkan file sebelum klik share; download selalu tersedia. Tidak ada integrasi direct-to-Story yang dijanjikan.

### T3 — Clipboard

Sumber: `https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write`

Clipboard write memerlukan secure context; PNG merupakan format gambar yang umum didukung. Dukungan metode tidak menjamin setiap operasi mendapat izin.

**Keputusan:** fitur “Copy image” dengan PNG dan penanganan kegagalan; tidak mengganti gambar dengan URL tanpa penjelasan. Pesan sukses hanya setelah operasi selesai.

### T4 — Canvas export

Sumber: `https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob`

PNG wajib didukung. File format yang mendukung metadata resolusi menggunakan 96 DPI dari API ini. Callback dapat menerima null.

**Keputusan:** nyatakan dimensi pixel dan sediakan ukuran 2×, tanpa menjanjikan metadata 300 DPI. Handle null dan kegagalan alokasi; jangan menganggap memperbesar canvas menambahkan detail foto asli.

### T5 — Origin-clean canvas

Sumber: `https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image`

Gambar lintas-origin tanpa persetujuan CORS bisa membuat canvas tidak dapat dibaca atau diekspor.

**Keputusan:** aset render dibundel same-origin, input foto dari file lokal atau kamera. Tidak menerima URL gambar bebas atau SVG upload pada v1.

### T6 — Next.js versi proyek

Paket lokal saat riset: Next.js 16.3.4, React 19.2.8, Tailwind CSS 4.

Sumber lokal yang dibaca:
- `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

Static export menghasilkan aset statis; Server Components yang sesuai dapat berjalan saat build. Browser APIs harus berada pada boundary client dan tetap tidak dipanggil saat prerender.

**Keputusan:** static hosting tanpa runtime backend; baca ulang guide lokal relevan sebelum implementasi karena proyek secara eksplisit memperingatkan perbedaan versi.

## Kesimpulan desain

Keputusan kreatif berikut adalah sintesis kita, bukan klaim bahwa referensi membuktikan keberhasilan bisnis:

1. Manga menjadi identitas tunggal; variasi koleksi muncul pada hasil, bukan struktur UI.
2. Pembuka singkat, tidak ada modal promosi, dan upload sama mudahnya dengan kamera.
3. Wajah serta hasil akhir lebih penting daripada ornamen website.
4. Kontrol dibuka bertahap. Efek yang lengkap setelah capture lebih penting daripada shader live yang berat.
5. Janji privasi dan sharing harus sempit, jelas, dan sesuai perilaku sebenarnya.
