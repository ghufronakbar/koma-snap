# Normal dan tiga look baru

Revisi 8 September 2026. Memperluas koleksi menjadi delapan pilihan, tanpa mengubah identitas manga-first atau menambahkan layanan runtime.

## Pilihan dan alasan desain

| Look | Karakter | Peran |
| --- | --- | --- |
| Normal | Warna foto asli, frame bersih | Pilihan netral untuk pengguna yang hanya ingin photostrip |
| Risograph | Tinta pink–teal, tekstur kertas, registrasi tinta bergeser | Hasil ilustratif yang kontras dengan manga monokrom |
| Midnight VHS | Pemisahan kanal warna, scanlines, grain, palet agak dingin | Nuansa rekaman analog malam hari |
| Flash Booth | Highlight hangat, kontras, grain tipis, vignette | Pilihan foto yang tetap recognisable dan tidak terlalu stylized |

Empat look awal tetap tersedia: Koma Impact, Soft Shoujo, Copy Club, Pocket ’98. Klaim daya tarik adalah pertimbangan desain, bukan hasil studi pengguna atau data tren.

## Normal berarti apa?

Tidak ada perubahan warna dari collection filter. Pada exposure 0, data warna yang masuk ke filter dipertahankan. Tidak ada preset sticker, speedlines, atau pola background otomatis. Frame/layout, caption, tanggal opsional, dan credit tetap fitur photostrip.

Crop, mirror, exposure yang dipilih pengguna, face effects, serta stiker manual tidak dihapus diam-diam ketika berganti ke Normal. Pengguna dapat mematikan face effects secara terpisah. Slider look intensity dan tombol remix disembunyikan karena tidak relevan untuk Normal. Tiga stiker minimal tersedia bila pengguna ingin menambah decor secara manual.

## Pipeline

Semua efek diproses oleh filterRows yang sama pada worker/fallback; dipakai untuk preview kamera, thumbnail, studio dan export. Risograph/VHS mengambil sampel tetangga dari salinan sumber immutable, bukan piksel hasil filter, sehingga tidak bergantung pada urutan pemrosesan baris. Offset dan pola disesuaikan ke koordinat panel logis agar tetap proporsional pada resolusi output berbeda. Noise deterministik mengikuti seed, bukan waktu rendering.

Risograph adalah simulasi print, Midnight VHS simulasi tape, dan Flash Booth grading foto; bukan simulasi fisik sempurna, bukan rekonstruksi detail, serta tidak mengontrol flash hardware kamera.

Tiga koleksi berfilter mendapat enam stiker original masing-masing dan tiga komposisi preset. Total stiker menjadi 45 termasuk tiga opsi manual untuk Normal. Face effects tetap dirender setelah filter agar aksesori berwarna tetap terbaca.

## UX dan hosting

Normal ditempatkan paling awal agar mudah ditemukan; default sesi tetap Koma Impact. Delapan pilihan memakai thumbnail hasil renderer sebenarnya. Jumlah pilihan, ikon, serta label tidak mengasumsikan empat koleksi. Booth membungkus pilihan ke beberapa baris agar opsi tambahan tidak tersembunyi atau membuat layar overflow.

Tidak ada dependency baru, API eksternal, aset generatif, atau proses server. Build tetap static export. Pemeriksaan menggunakan lint, TypeScript, build, dan inspeksi browser; tanpa test suite baru.
