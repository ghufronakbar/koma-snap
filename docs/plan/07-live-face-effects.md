# Revisi: live look dan aksesori wajah lokal

Keputusan 8 September 2026. Menggantikan ketentuan preview kamera natural pada rencana awal.

## Ruang lingkup

- Preview panel aktif memakai renderer artwork yang sama dengan editor/export: collection look, aksesori wajah, nomor panel, speedlines, dan decor.
- Preview kecil menampilkan komposisi penuh dengan foto sebelumnya dan panel kamera aktif. Cover memakai panel cover terpilih.
- Countdown, status tracking, dan pose prompt hanya UI; tidak masuk foto.
- Enam aksesori prosedural: Soft Blush, Manga Blush, Freckles, Starry, Neko, Drama (sweat drop). Satu preset aktif, intensitas bersama, default Off.
- Landmark untuk penempatan aksesori, bukan AI portrait, identifikasi orang, atau perubahan bentuk wajah.
- Target satu wajah, belum semua orang dalam foto grup.

## Pemrosesan dan privasi

MediaPipe Tasks Vision dipasang dengan versi exact. Bundle JS/WASM disalin dari dependency ke public/vendor/mediapipe saat predev/prebuild. Model face_landmarker.task disertakan di public/models. Worker, library, model, font, dan aset berasal dari origin aplikasi; tidak ada CDN/API pihak ketiga ketika aplikasi dipakai.

Worker tracking dimuat hanya saat efek wajah dipakai. Resolusi input preview dibatasi 480 px; loop render serial tidak menumpuk frame. Tracking live memakai smoothing ringan, menghilangkan landmark lama setelah 500 ms, dan tidak menaruh aksesori saat deteksi kosong. Kamera tetap tersedia ketika tracking gagal.

Saat capture, frame bersih dibekukan dahulu; tracking memakai frame yang sama. Foto mentah serta koordinat landmark dinormalisasi disimpan di memori. Aksesori dirender sesudah filter agar aksen merah tetap terlihat pada manga monokrom; transformasi crop/mirror yang sama diterapkan pada foto dan aksesori. Mengganti look/preset/intensitas tidak merusak sumber foto. Live memiliki resolusi dan latensi berbeda dari export, bukan jaminan kesamaan piksel atau FPS.

Editor menyediakan Fit effects to photos untuk upload, foto yang diambil saat efek Off, atau deteksi ulang. Gambar tanpa wajah tidak diberi aksesori. Model tetap di worker dan tidak mengunggah gambar.

## Deployment dan aset

Tetap Next static export tanpa function pemrosesan gambar, akun, database, atau API key. Vercel Hobby tunduk pada kuota dan ketentuan paket; bukan hosting gratis untuk trafik tak terbatas. Unduhan model/WASM memakai bandwidth hosting.

Aksesori sederhana memakai canvas prosedural original, tidak membutuhkan generasi raster. Arahan agy untuk generasi aset kompleks berikutnya: model gemini-3.8-flash-high dan effort high. Tidak dijalankan pada revisi ini dan tidak menjadi dependency runtime.

## Pemeriksaan

Tanpa test case atau framework test baru. Jalankan lint, TypeScript, build statis, inspeksi UI dan pemuatan model bila tersedia. Kamera fisik, browser mobile, serta performa tracking pada perangkat pengguna perlu pemeriksaan manual terpisah; jangan menyatakan terverifikasi tanpa pengamatan nyata.
