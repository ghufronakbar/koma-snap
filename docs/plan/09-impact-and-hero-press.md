# Shadow Koma Impact dan Hero Press

Revisi 8 September 2026, berdasarkan feedback bahwa area wajah mudah menjadi blok hitam saat pencahayaan kurang merata/backlight.

## Koma Impact

Threshold lama menjadikan seluruh piksel dengan luminance sekitar di bawah 115 sebagai tinta gelap. Mengurangi intensity saja akan mencampurkan kembali foto asli, bukan memperbaiki hilangnya detail di layer efek.

Jalur baru menggantikan threshold tersebut dengan:

- Kurva akar luminance untuk mengangkat area gelap secara bertahap tanpa memutihkan highlight secara berlebihan.
- Screentone bertingkat dengan warna dasar abu-abu hangat, bukan dua nilai hitam/putih saja.
- Kontur tinta dari perbandingan luminance dengan empat sampel tetangga pada sumber yang belum difilter. Tinta mengikuti tepi lokal, bukan seluruh bidang shadow.
- Grain ringan yang deterministik, sementara speedlines, layout, dan aksesori wajah tetap mengikuti alur sebelumnya.

Tidak mengubah exposure kamera secara otomatis, tidak mendeteksi warna kulit, dan tidak mengirim foto ke server. Input hitam yang sudah kehilangan detail tidak bisa direkonstruksi. Performa/keterbacaan pada kamera dengan backlight nyata masih perlu pemeriksaan pengguna.

## Hero Press

Look original yang terinspirasi bahasa visual komik superhero Amerika klasik: warna tegas, posterization per kanal, kontur tinta gelap kebiruan, titik cetak staggered, dan kertas hangat. Merah, biru, serta kuning digunakan pada decor dan pilihan background. Warna foto tetap menjadi dasar—bukan memaksa semua wajah menjadi merah atau biru.

Enam decor original: POW! burst, skyline kota, bintang, caption To be continued, Hero Edition, dan Action banner. Tidak memakai tokoh, kostum, logo Superman/DC, atau panel komik yang disalin. Tiga remix menggunakan mekanisme koleksi yang sama. Hero Press ditempatkan setelah Koma Impact, total sembilan pilihan dan 51 stiker.

## Integrasi

Filter bersama digunakan pada kamera live, thumbnail, studio, dan export. Radius kontur/pola mengacu pada lebar panel logis agar proporsional lintas resolusi. Sampel tetangga memakai salinan immutable yang sama selama pemrosesan per-baris, termasuk fallback. Face effects tetap dilukis setelah filter.

Tanpa dependency baru, generasi AI, API eksternal, atau server pemrosesan gambar. Tetap static export. Tidak menambahkan test suite. Pemeriksaan visual memakai demo original dan versi yang digelapkan secara sintetis; ini bukan bukti pengujian backlight kamera fisik.
