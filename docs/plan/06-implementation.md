# Rencana Eksekusi dan Handoff

## Cara menggunakan brief ini

Implementasikan seluruh fitur wajib dalam `02-product-scope.md`, mengikuti perilaku `03-screen-ux.md`, visual `04-visual-assets.md`, dan kontrak teknis `05-technical-plan.md`. Dokumen ini tidak memberi izin untuk mulai implementasi pada tahap perencanaan sekarang.

Saat pengguna memberikan penugasan implementasi, kerjakan mandiri secara bertahap. Tidak perlu bertanya ulang soal palette, font, jumlah koleksi, layout, atau default yang sudah diputuskan. Jika ada hambatan nyata pada generator aset/perangkat, gunakan fallback yang sudah ditentukan dan laporkan keterbatasannya. Jangan diam-diam mengurangi fitur wajib.

## Fase 1 — Visual proof dan fondasi

- Periksa repo, instruksi scoped AGENTS.md, dan guide Next.js lokal sebelum menulis kode.
- Tetapkan token, font lokal beserta lisensi, logo original, dan scene layout constants.
- Produksi mockup terpisah untuk intro desktop, booth mobile, studio desktop/mobile, result mobile. Ini pekerjaan saat implementasi, belum tersedia dalam paket plan.
- Siapkan empat foto demo konsisten dan dua texture opsional sesuai manifest; jangan mencuri aset referensi.
- Buat shell statis dan tiga ruang tanpa backend, dengan kontrol nyata dan layout responsive.

Keluaran fase: arah visual terbaca di laptop kecil/mobile, aset mempunyai provenance, shell dapat dibangun. Jangan menghabiskan fase ini pada animasi marketing atau landing section tambahan.

## Fase 2 — Satu jalur lengkap lebih dahulu

- Bangun source repository dan metadata session.
- Selesaikan upload empat foto → Koma Impact → Four-Panel Strip → PNG Story standard.
- Gunakan renderer yang sama untuk preview dan PNG; pastikan font, crop, dan scene geometry menyatu.
- Sediakan error decode/render dan cleanup source sejak awal.

Keluaran fase: satu hasil nyata end-to-end, bukan UI dengan mock data permanen. Ini mengurangi risiko editor selesai tetapi export tidak cocok.

## Fase 3 — Capture dan review

- Kamera opt-in, preview, mirror, countdown 3/5, sound opt-in, pose prompts.
- Empat shot, cancel/resume, retake satu foto, replace, reorder.
- Tangani izin tertunda/ditolak, disconnected camera, tab hidden, dan late promise.
- Matikan kamera ketika tidak digunakan; upload tetap jalur alternatif lengkap.

Keluaran fase: seluruh cara masuk foto menghasilkan source yang sama untuk renderer. Tidak ada raw image di URL, localStorage, atau request network.

## Fase 4 — Koleksi, layout, personalisasi

- Lengkapi Soft Shoujo, Copy Club, Pocket ’98 dengan efek pixel sesungguhnya.
- Tambah Manga Page dan Cover Shot, crop per layout, intensity dan exposure.
- Lengkapi 24 stiker original, dua bubble, caption/date/credit, serta 36 preset config.
- Bangun transforms, alternative controls tanpa drag, history 30 commands, dan remix aman.
- Terapkan aturan retake/history, objek tersembunyi antar layout, overflow teks, dan reset confirmation.

Keluaran fase: semua fitur mandatory bisa digunakan, tidak ada tombol palsu, perubahan koleksi tidak merusak edit pengguna.

## Fase 5 — Result dan polish

- Implementasikan semua format/ukuran sesuai matrix; contain dan padding konsisten.
- Siapkan file sebelum gesture share, capability detection, clipboard, download, error fallback.
- Lengkapi privacy/credits, loading/error copy, keyboard/focus, reduced motion.
- Tambahkan motion ringan dan texture setelah flow stabil; periksa foto tetap dominan.
- Lengkapi README penggunaan/deployment saat implementasi; tidak membuat akun, analytics, atau backend.

Keluaran fase: hasil file sesuai preview dan dapat disimpan tanpa share API.

## Penyelesaian tanpa test case

Sesuai arahan pengguna, tidak menulis test case, skenario formal, test suite, atau memasang framework testing. Pemeriksaan di bawah merupakan tanggung jawab penyelesaian, bukan artefak testing baru:

- Jalankan build dan lint yang sudah tersedia; laporkan kegagalan unrelated tanpa memperluas scope.
- Inspeksi layout/interaksi secara manual pada desktop kecil dan mobile viewport; jangan menyamakan viewport emulation dengan pengujian perangkat asli.
- Buka file PNG hasil nyata dan bandingkan secara visual dengan preview, termasuk frame, teks, crop, dan rasio.
- Gunakan perangkat/browser yang benar-benar tersedia untuk kamera/share; jika tidak tersedia, laporkan sebagai belum diverifikasi, bukan mengklaim sukses.
- Periksa bahwa tidak ada foto dikirim lewat network, aset missing, atau kamera dibiarkan aktif setelah keluar.

Tidak ada klaim “semua browser lulus” tanpa bukti. Tidak perlu menulis laporan QA panjang; ringkas perubahan, verifikasi yang benar dilakukan, dan batas yang tersisa.

## Definisi selesai produk

Produk selesai ketika pengguna dapat memperoleh hasil yang layak dibagikan dari kamera maupun upload tanpa akun; empat koleksi dan tiga layout berfungsi; kontrol editor berdampak pada hasil nyata; download tetap tersedia tanpa dukungan share; sesi tidak hilang saat navigasi internal; dan visual mobile/laptop konsisten dengan arah cetak manga.

Scope tidak dianggap selesai hanya karena home bagus atau semua kontrol terlihat. Fitur wajib yang belum selesai harus disebut secara eksplisit.

## Risiko utama dan keputusan mitigasi

| Risiko | Mitigasi yang telah diputuskan |
| --- | --- |
| Terlalu banyak fitur mengaburkan UX | Tiga ruang, default komposisi siap pakai, advanced panel tertutup |
| Threshold menghilangkan ekspresi | Exposure per foto, intensity, tuning berbasis demo dengan pencahayaan berbeda |
| Filter berat di mobile | Post-capture sebagai baseline, preview kecil, worker bila tersedia, serial render |
| PNG tidak cocok dengan editor | Shared renderer, font-ready, scene normalized, seed tersimpan |
| Share dianggap direct posting | Label Share image, file prebuilt, download fallback, copy jujur |
| Input besar menghabiskan memori | Limit file, decode serial, working resize, lifecycle bitmap |
| Aset generated tidak konsisten | Satu subjek demo, preview dibuat engine, SVG untuk kontrol dan lettering |
| Lisensi aset tidak jelas | Manifest provenance, original graphics, tidak membundel karya referensi |
| “One-shot” mendorong pekerjaan dangkal | Fase internal tetap berjalan dan semua mandatory dituntaskan |

## Brief implementasi ringkas yang dapat digunakan nanti

> Implementasikan KomaSnap berdasarkan seluruh dokumen docs/plan/. Prioritaskan kualitas visual dan UX mobile, manga-first, tanpa akun dan tanpa backend pemrosesan foto. Kerjakan semua fitur v1 dalam scope, bukan hanya landing page. Ikuti guide Next.js lokal dan instruksi repo. Produksi aset original/generated sesuai brief bila diperlukan; jangan mengirim foto pengguna ke layanan lain. Jalankan fase internal sampai hasil export nyata dan editor konsisten. Tidak perlu membuat test case atau test suite; lakukan build/lint dan pemeriksaan visual/interaksi yang memungkinkan. Jangan membuat commit atau mengganti scope diam-diam. Laporkan keterbatasan yang benar-benar belum dapat diverifikasi.
