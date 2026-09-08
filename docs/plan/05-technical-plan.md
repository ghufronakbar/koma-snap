# Technical Implementation Plan

## Boundary dan deployment

Stack yang sudah ada dipertahankan: Next.js 16.3.4 App Router, React 19.2.8, TypeScript, Tailwind 4. Tidak upgrade dependency sebagai pekerjaan sampingan. Sebelum menulis kode, baca guide lokal Next.js yang relevan sesuai AGENTS.md. Landasan riset: `01-research.md` T1–T6.

Target `output: 'export'`, static hosting HTTPS. Shell dan metadata dapat diprerender; sesi interaktif pada Client Component. `window`, kamera, canvas, AudioContext, dan storage tidak diakses di module scope atau saat prerender. Tidak ada Server Actions, route pemrosesan foto, database, API key, atau image optimization yang memerlukan server runtime. Untuk aset gunakan mekanisme statis yang didukung guide lokal.

Satu application session provider tidak di-unmount selama intro/booth/studio/result. React reducer + context cukup untuk metadata v1. Blob/ImageBitmap/media stream/canvas di repository dan refs terpisah, bukan disalin ke seluruh state React. Hindari library state, canvas scene graph, atau motion besar kecuali kebutuhan nyata belum dapat ditangani sederhana.

## Pembagian modul yang direncanakan

Ikuti struktur repo aktual (app di root atau src); nama berikut merupakan tanggung jawab, bukan instruksi memindahkan struktur existing.

- App shell: metadata, font lokal, privacy/credits, workspace navigation.
- Session: reducer, commands, history, non-sensitive navigation state, session cleanup.
- Camera: useCamera, lifecycle stream, capture scheduler, permission error mapping.
- Photo repository: validasi input, decode, orientation normalization, Blob/ImageBitmap lifecycle.
- Collections: filter config, palettes, curated asset ids, pose prompts, default presets.
- Layouts: canonical dimensions, panel rectangles, caption regions, export placement.
- Editor: pointer transform, selection, crop, text measurement, accessible numeric controls.
- Renderer: source transform → photo effect → panel clipping → frame → decor → text → export stage.
- Distribution: blob generation, file preparation, capability checks, download/share/clipboard.

## Model sesi konseptual

Session memiliki revision id, step, empat photo slots, collection id, layout id, selected cover slot, effect intensity, caption fields, date state, branding flag, decor seed, user objects, dan output settings.

Photo slot menyimpan stable slot id, source reference, dimensions, mirror, exposure, serta crop per layout/panel. Source repository menyimpan normalized input Blob; decoded bitmap dibuat lazy dan dibuang saat tidak diperlukan. Input asli tidak ditimpa filter, tetapi dapat dinormalisasi/diperkecil untuk working resolution yang diumumkan.

Scene object menyimpan id, kind, asset/text, anchor artwork atau panel index, normalized position, scale, rotation, z-order, dan owner default/user. Object user maksimal 12. Semua preset immutable; remix memilih konfigurasi dengan seed tersimpan.

Revision berubah ketika hasil final berpotensi berubah. Worker/render job membawa revision id. Hasil lama diabaikan. Export cache dipasangkan dengan revision + format + scale + palette; tidak pernah membagikan file lama setelah edit baru.

History hanya metadata, maksimum 30 commands; tidak menduplikasi pixel data. Replacing/retaking photo mengosongkan history yang bergantung pada source lama setelah konfirmasi jika perlu; jangan membiarkan undo merujuk Blob yang sudah dilepas. UI memberitahu retake tidak dapat di-undo; hasil lama dipertahankan sampai retake sukses. Undo/redo edit biasa tetap tersedia.

## Capture dan import

1. User gesture memulai request kamera, `audio: false`, ideal 1280×960 dan front-facing, bukan exact constraint yang rapuh.
2. Video `playsInline` dan muted. Tunggu metadata dan frame valid dengan dimensi bukan nol; jangan capture sebelum siap.
3. Mirror preview harus sama dengan representasi hasil. Simpan raw tidak terbalik plus mirror flag; renderer menerapkannya sekali. Teks/stiker tidak ikut dicerminkan.
4. Scheduler memakai cancellation token/generation id; double click tidak memulai dua sequence. Satu shot sukses mengisi satu slot lalu thumbnail diproses.
5. Timer memakai waktu berlalu aktual, bukan berasumsi interval selalu tepat. Tab hidden membatalkan sequence, bukan mengejar shot yang tertunda sekaligus.
6. Late getUserMedia result setelah jalur dibatalkan harus langsung menghentikan tracks. Bersihkan stream/listener pada exit, retake selesai, reset, hidden, dan unmount.
7. Upload memeriksa ukuran/format lalu decode satu per satu. Normalkan orientation melalui satu jalur decode yang terverifikasi; jangan menerapkan EXIF rotation dua kali.
8. Maksimum input 20 MB dan 32 MP. Downsample working image ke sisi terpanjang maksimal 2400 px; output besar dapat meng-upscale, tidak menambah detail.
9. Hindari menyimpan data URL. Lepas object URLs, bitmap dan buffer ketika photo diganti, history dibersihkan, atau sesi di-reset.

Input sangat besar masih bisa menghabiskan memori saat decode sebelum dimensinya diketahui; file-size gate adalah mitigasi, bukan jaminan. Decode serial, tangani kegagalan tanpa membuang sesi, dan beri saran gambar lebih kecil. Jangan memproses empat bitmap besar secara bersamaan.

## Rendering dan filter

Canvas 2D menjadi jalur wajib. Tidak mewajibkan WebGL di v1. Preview kamera natural; filtered thumbnail/editor post-capture lengkap. Preview diperkecil hingga sekitar 900 px sisi terpanjang, thumbnail lebih kecil. Kerja pixel dijalankan pada worker ketika jalur tersebut tersedia; fallback main-thread dibagi bertahap dan UI tetap menunjukkan busy state. OffscreenCanvas adalah optimasi terdeteksi, bukan hard requirement.

Urutan: orient/mirror → crop sesuai panel → exposure → filter warna/pixel → mask panel → bingkai dan tekstur → default decor → user objects → caption/date/credit → panggung format. Source tetap immutable.

### Koma Impact

Luminance → exposure → contrast → threshold tinta pada foto; optional screentone pada rentang midtone untuk default yang menjaga ekspresi. Intensity mengatur campuran efek dengan foto asal dan kekuatan texture. Speedlines merupakan overlay di koordinat panel, tidak digambar menembus area pusat. Seed menentukan variasi noise/garis, bukan random baru di setiap redraw. Sediakan tuning threshold internal yang dapat dipengaruhi intensity; exposure per foto membantu pencahayaan yang berbeda tanpa menambah banyak slider.

### Soft Shoujo

Luminance/desaturasi ringan → lavender tint → soft highlight glow dari buffer downsample yang dikomposit kembali → fine halftone. Bloom terbatas agar highlight tidak habis. Jika filter canvas blur tidak tersedia, gunakan pass blur kecil pada buffer, bukan menghilangkan koleksi. Flower/sparkle terpisah dari photo filter agar tetap tajam.

### Copy Club

Grayscale → contrast curve → threshold yang lebih kasar → seeded grain → paper edge/tape/staples pada frame. Noise dikontrol di luminance, tidak menutup seluruh wajah dengan gambar texture opaque. Sobekan berada di margin/mask tepi dan tidak mengurangi bounds foto secara tak terduga.

### Pocket ’98

Foto panel diperkecil ke grid logis lebar 160 pixel dengan tinggi mengikuti aspect. Luminance dinormalisasi, diberi threshold ordered Bayer 4×4, lalu dikuantisasi ke tepat empat warna: `#E0E8BA`, `#A8B86A`, `#607344`, `#293B2D`. Clamp hasil kuantisasi ke indeks 0–3. Nearest-neighbor saat dibesarkan. Ukuran grid logis tetap antara preview dan export; tidak tiba-tiba menjadi lebih detail pada file 2×. Intensity 100 mempertahankan tepat empat warna foto; intensity lebih rendah boleh mencampur foto asal sesuai kontrol global.

### Konsistensi preview/export

Gunakan satu scene renderer untuk editor raster dan file final; DOM hanya selection handles/control. Jangan memakai screenshot DOM sebagai export. Koordinat normalized dipetakan ke unit layout di `04-visual-assets.md`. Texture frequency, seed, line width, serta crop harus diskalakan dari unit canonical, bukan pixel canvas preview.

Tunggu font dan aset selesai decode. Text layout memakai pengukuran actual font dan line wrapping yang sama untuk preview/final. Jika teks tidak muat pada batas minimum font, tampilkan error sebelum Finish; jangan silently clip. Plain text saja, bukan HTML yang dieksekusi.

## Editor transforms

Pointer position ditransformasikan dari CSS canvas bounds ke canonical scene units, memperhitungkan fit scale dan offset. Pointer capture menjaga drag; touch-action dibatasi pada area manipulasi, bukan seluruh halaman. Handle screen-size tetap mudah disentuh walau output strip kecil.

Posisi objek disimpan relatif anchor; scale/rotation diterapkan sekitar pusat. Object tidak boleh sepenuhnya hilang di luar artwork; clamp sehingga bagian yang dapat dipilih tetap terlihat. Saat berubah layout, map normalized coordinates ke bounds anchor baru; crop foto terpisah per layout. Panel object nonaktif pada Cover tetap tersimpan.

## Export contract

| Format | Standard | 2× | Aturan |
| --- | --- | --- | --- |
| Story | 1080×1920 | 2160×3840 | Semua layout, contain artwork |
| Square | 1080×1080 | 2160×2160 | Semua layout, contain artwork |
| Strip | 800×2400 | 1600×4800 | Four-Panel Strip saja, artwork native |

Story design safe area: 72 px kiri/kanan dan 180 px atas/bawah pada standard; Square 64 px semua sisi. Ini padding desain, **bukan jaminan safe zone semua platform**. Artwork di-fit di dalam area tersebut dan tidak dipotong. Untuk Square, strip akan lebih kecil; preview memperlihatkan konsekuensinya tanpa mengubah layout otomatis.

PNG opaque, background ikut diekspor. Gunakan `toBlob`, tangani callback null dan exception. Kualitas dijelaskan dalam pixel, bukan “300 DPI” (T4). Render panel serial, reuse scratch canvas. 2× sekitar 8 MP; jika gagal, pertahankan source dan tawarkan Standard, jangan silently mengubah ukuran pilihan.

Siapkan Blob/File saat Result selesai render; distribusi melalui klik terpisah agar user activation tidak habis karena render panjang. `canShare({ files })` menggunakan file aktual. Jika tidak mendukung, Share tidak menjadi CTA primer; Download tetap tersedia. Clipboard PNG hanya tampil bila API terkait ada, dan error tetap ditangani. Abort share tidak menjadi error fatal. Download object URL dilepas setelah tidak lagi diperlukan, bukan sebelum browser sempat memakainya.

File name: `komasnap-{collection}-{local-date}-{session-short-id}.png`; tidak memakai nama upload atau caption pribadi. Export ulang scene yang tidak berubah memakai cache yang sama.

## Privasi dan support envelope

Tidak ada upload foto, analytics, third-party embeds, remote fonts runtime, atau persistence foto. Hosting tetap menerima request aset dan dapat memiliki access logs; jangan mengklaim “zero network” atau “anonimitas total”. Aksi share yang dipilih pengguna menyerahkan gambar ke target di luar KomaSnap; jelaskan singkat dalam privacy dialog.

User text/date berada di memori; URL/history tidak mengandung isi sesi. Download adalah pilihan pengguna menyimpan file ke perangkat. Foto demo build-time generated tidak melibatkan foto pengguna.

Target pemeriksaan: Safari iOS, Chrome Android, Chrome/Edge desktop, dan Safari macOS pada versi yang tersedia saat implementasi. Ini target dukungan, bukan klaim sudah diuji. Browser in-app social dapat terbatas; sediakan instruksi “Open in your browser” dan upload. Kamera/share/clipboard membutuhkan kemampuan dan izin aktual (T1–T3); download tetap jalur utama.

Tidak menjanjikan offline-first hanya karena client-first. Loading pertama membutuhkan jaringan; tidak menambahkan service worker pada v1. Error unsupported browser harus tetap menampilkan informasi, bukan layar putih.
