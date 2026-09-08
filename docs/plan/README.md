# KomaSnap — Final Product & Implementation Plan

Revisi aktif: [Live preview dan aksesori wajah lokal](07-live-face-effects.md). Menggantikan keputusan preview natural pada dokumen awal.

Revisi koleksi: [Normal dan tiga look baru](08-expanded-looks.md). Menggantikan batas empat koleksi dan penundaan risograph/VHS di rencana awal.

Tanggal: 8 September 2026. Status: siap menjadi brief implementasi, belum diimplementasikan.

## Keputusan utama

**Manga-first photobooth, bukan editor desain generik.** Identitas brand tetap manga; koleksi alternatif memperluas ekspresi tanpa mengubah pola interaksi.

Tagline: **Your face. Four panels. Your story.**

- Tanpa akun, database, API pemrosesan foto, telemetry, atau penyimpanan foto otomatis.
- Foto diproses di browser. Hosting hanya mengirim aplikasi dan aset statis.
- Prioritas: kualitas hasil, kenyamanan capture, mobile UX, personalisasi, kemudian motion.
- Tiga ruang utama: **Booth → Studio → Result**. Pembuka singkat merupakan state awal Booth, bukan landing page panjang.
- Delapan look: Normal, Koma Impact, Soft Shoujo, Copy Club, Pocket ’98, Risograph, Midnight VHS, Flash Booth.
- Tiga layout: Four-Panel Strip, Manga Page, Cover Shot.
- PNG sebagai output utama; share dan clipboard merupakan progressive enhancement.
- Tidak membuat test case, test suite, atau memasang framework testing. Build, lint, dan inspeksi manual tetap bagian penyelesaian.

## Urutan baca

1. [Riset dan sumber](01-research.md): observasi referensi, batas bukti, serta koreksi brief awal.
2. [Produk dan scope](02-product-scope.md): fitur wajib, default, batas fitur, dan roadmap.
3. [Layar dan UX](03-screen-ux.md): alur, kontrol, navigasi, error, serta perilaku mobile.
4. [Visual dan aset](04-visual-assets.md): identitas, token, komposisi, motion, dan brief produksi aset.
5. [Arsitektur dan rendering](05-technical-plan.md): state, capture, filter, editor, export, privasi, dan fallback.
6. [Urutan implementasi](06-implementation.md): fase kerja dan definisi selesai tanpa test case.

## Hubungan dengan PROJECT.md

`PROJECT.md` tetap menjadi brief asal dan tidak diubah pada tahap ini. Dokumen dalam folder ini merinci hasil brainstorming berikutnya dan menjadi acuan scope implementasi jika terdapat perbedaan dengan brief asal. Instruksi langsung pengguna tetap lebih tinggi.

Perubahan yang disengaja:

| Brief asal | Keputusan final |
| --- | --- |
| Enam filter sekaligus | Awalnya empat; revisi 08 menambahkan Normal, Risograph, Midnight VHS, Flash Booth |
| Empat shot, jeda dua detik | Countdown 3/5 detik pada setiap shot; default 3 |
| Dramatic Splash memakai tiga foto | Manga Page memakai seluruh empat foto |
| Cassette J-Card | Ditunda; Cover Shot menjadi layout alternatif satu foto pilihan |
| Share to Story langsung | Share membuka pemilih sistem jika didukung; tidak menjamin target aplikasi atau unggah |
| PNG 300 DPI | Janji kualitas dalam dimensi pixel; bukan klaim metadata 300 DPI |
| Banyak modul terpisah | Satu sesi, tiga ruang, advanced controls melalui progressive disclosure |

## Batas perencanaan

Riset mencakup halaman publik dan dokumentasi primer, bukan pengujian kamera di aplikasi pihak ketiga atau studi pengguna. Visual spec adalah keputusan desain, bukan hasil validasi konversi. Gambar, mockup, dan aset final belum dihasilkan; brief produksinya sudah ditentukan. Tidak ada kode aplikasi yang diubah.

Implementasi boleh dilakukan dalam satu penugasan, tetapi harus tetap melewati fase internal: visual proof → pipeline inti → pengalaman lengkap → polish dan pemeriksaan. Jangan menyembunyikan fitur belum selesai di balik tombol dekoratif.
