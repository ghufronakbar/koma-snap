# Screen & Interaction Specification

## Struktur dan navigasi

Satu route aplikasi `/` dengan state intro/booth/studio/result agar sesi tidak unmount ketika berpindah ruang. Privacy dan credits tersedia sebagai dialog ringan dari footer. Browser Back untuk perpindahan ruang menggunakan history state non-sensitif; Back dari Result menuju Studio, Studio menuju review Booth, Booth menuju intro. Jangan menyimpan foto/caption dalam URL atau history state.

Intro dapat dikunjungi kembali tanpa menghapus sesi; tampilkan “Resume session”. Reset hanya melalui aksi eksplisit. Refresh kehilangan foto: jelaskan sejak pesan privasi awal; jangan menjanjikan recovery setelah tab ditutup. Jika history menunjuk Studio/Result tanpa sesi setelah refresh, pulihkan intro dan beri pesan sesi berakhir.

## A. Intro — pintu Booth

Desktop: header brand kecil, headline dua/tiga baris di kiri, artwork strip besar sedikit miring di kanan, CTA utama dan upload terlihat dalam tinggi layar laptop 1280×720. Bukan hero raksasa yang mendorong CTA ke bawah.

Mobile: headline ringkas, satu contoh hasil dominan, CTA “Start booth” dan “Use my photos”. Koleksi dapat dipilih di Booth; intro tidak menambahkan langkah pemilihan wajib.

Copy inti:
- Headline: “Your face. Four panels. Your story.”
- Pendukung: “A little drama. A strip worth keeping.”
- Privasi: “Your photos stay in this tab. Nothing is uploaded. Refreshing clears your session.”

Start booth membuka state kamera belum aktif; tombol “Enable camera” meminta izin. Use my photos langsung membuka file picker lewat gesture pengguna. Tidak ada izin kamera saat initial load, popup promosi, carousel otomatis, atau penghalang cookie buatan.

## B. Booth — kamera dan review dalam satu ruang

### Layout

Desktop: stage kamera dominan, rail empat thumbnail di kanan, koleksi dan tombol shutter di bawah stage. Pilihan timer/mirror/sound di toolbar ringkas. Review memakai stage sama untuk foto terpilih, bukan halaman tambahan.

Mobile: header kompak → koleksi horizontal → preview landscape 4:3 → thumbnail empat kolom → shutter dan action bar. Preview mengikuti ruang tersedia; konten boleh scroll vertikal di layar pendek, tetapi tombol primer tidak tertutup toolbar browser atau safe-area perangkat.

### Kamera

- Preview memiliki crop guide sesuai bentuk panel pertama; shot lain dapat memiliki guide berbeda untuk Manga Page, tetapi seluruh raw frame disimpan.
- Full style preview bukan prasyarat capture: video natural + overlay guide dan contoh koleksi berlabel “Final look”. Thumbnail setelah capture menerima efek lengkap.
- Status awal “Camera is off”. Loading izin: “Allow camera access to enter the booth”; upload tetap aktif.
- Switch camera hanya tampil bila relevan/tersedia. Jika request gagal, coba kembali kamera sebelumnya dan tawarkan upload; jangan menghapus hasil.
- Shutter “Take 4 photos” berubah sesuai slot kosong: “Take 2 more”. Input dan pergantian koleksi dikunci selama countdown/capture.
- Setiap shot: pose prompt → countdown 3/5 detik → capture → feedback singkat 350 ms → shot berikutnya. Tidak menambahkan jeda dua detik terpisah.
- Cancel menghentikan shot berikutnya, menyimpan frame yang sudah berhasil, dan kembali idle.
- Tab disembunyikan: countdown dibatalkan; frame sukses dipertahankan, kamera dihentikan. Saat kembali, perlu Resume camera; tidak mengambil foto saat tab tidak aktif.
- Review dimulai otomatis setelah empat foto. Kamera dihentikan; retake meminta kamera kembali lewat aksi pengguna.

### Review dan retake

Tap thumbnail untuk inspect. Aksi “Retake”, “Replace”, “Move left”, “Move right” merujuk foto terpilih. Thumbnail menyertakan nomor panel; urutan baca aplikasi selalu kiri-ke-kanan pada row, atas-ke-bawah pada strip, tidak berubah karena tema manga.

Retake memakai slot target yang tetap; hasil lama baru diganti setelah capture berhasil. Cancel/error mempertahankan hasil lama. Retake tidak perlu mengulang empat shot. Replace membuka file picker satu file. Foto baru me-reset crop/exposure slot tersebut, mempertahankan dekorasi yang berjangkar pada panel, lalu memberi tahu “Check the crop on your new photo”.

Continue aktif ketika empat slot valid dan tidak ada pekerjaan input berjalan. Foto blur tidak dideteksi otomatis; pengguna menilai dari preview.

## C. Studio — editor terkurasi

### Hierarki

Desktop: artwork di workspace kiri/tengah; inspector kanan 320 px; action bar bawah berisi Back, Undo, Redo, “Finish strip”. Tidak ada nested cards berlebihan.

Mobile: artwork di atas, tabs “Look / Layout / Photos / Decor / Text”, panel pengaturan di bawah. Advanced control memakai bottom sheet maksimum sekitar 60% tinggi viewport dengan bagian atas artwork tetap terlihat jika ruang memungkinkan. Ketika keyboard muncul, text sheet dapat mengambil ruang lebih besar; jangan memaksa canvas fixed-height hingga input tersembunyi.

Default tab Look: empat tile koleksi, intensity, tiga swatch latar, Remix. Semuanya langsung menghasilkan komposisi jadi. Pengaturan foto dan advanced decorations dibuka hanya ketika dipilih.

### Aturan edit

- Ganti koleksi mengganti filter dan dekorasi bawaan, mempertahankan foto, caption pengguna, crop, serta stiker pengguna.
- Ganti layout menyimpan pengaturan crop per layout. Kembali ke layout lama mengembalikan crop lama.
- Objek user berjangkar pada artwork atau panel index, bukan raw photo id. Reorder foto mengubah isi panel, bukan memindahkan dekorasinya.
- Saat Cover Shot dipilih, dekorasi panel lain disembunyikan sementara, bukan dihapus. Dekorasi artwork tetap ada.
- Crop modal: preview clip, pan, slider zoom 1–3, mirror, exposure, Reset, Cancel, Apply. Cancel memulihkan snapshot awal.
- Klik/tap objek membuka toolbar kecil. Drag hanya pada objek terpilih; jangan mencuri scroll dari ruang kosong.
- Resize melalui handle dan slider alternatif; rotate melalui handle dan pilihan −15/0/+15 serta slider. Touch tidak membutuhkan gesture dua jari.
- Keyboard: arrows memindah objek, Shift+arrow langkah lebih besar, Delete menghapus saat tidak mengetik, Escape menutup/deselect. Undo shortcut hanya aktif di konteks editor, bukan mengambil undo native text input.
- Satu drag/slider gesture menjadi satu history entry saat dilepas. Input teks menjadi satu transaksi saat blur/Apply, bukan satu entry setiap karakter.
- Remix mengganti seed/preset dekorasi bawaan dan dapat di-undo. Caption dan objek user tidak berubah.
- Hapus/reset dekorasi memerlukan konfirmasi jika mencakup beberapa objek user. Hapus satu objek cukup undo.
- Finish strip menuju Result dan memulai rendering; tidak otomatis download/share.

## D. Result — karya dahulu, distribusi kemudian

Tampilkan file PNG hasil render sebagai gambar final besar, bukan simulasi DOM yang berbeda. Pilih Story/Square/Strip (sesuai layout), Standard/2×, dan background swatch. Perubahan menginvalidasi file lama; tombol distribusi dinonaktifkan sampai hasil baru siap.

Desktop: Download PNG primer, Copy image sekunder bila mampu, Share image jika file-share tersedia. Mobile: Share image primer bila mampu, Download PNG selalu terlihat. Tidak melakukan user-agent sniffing untuk menentukan kemampuan; layout viewport dan feature detection menentukan penyajian.

Status rendering: “Preparing your image…” tanpa persentase palsu. Error: “Couldn't prepare the image. Try standard size.” Berikan Retry dan Back to edit.

Copy success: “Image copied”. Share completion: “Share sheet opened” atau pesan netral, bukan “Posted”. Cancel share kembali netral tanpa toast error merah. Download: “Download started”, bukan klaim sudah tersimpan di Photos. Jika browser membuka file alih-alih menyimpan, gambar tetap tersedia untuk tindakan simpan manual.

“Edit again” mempertahankan sesi. “Make another” membuka konfirmasi: “Start fresh? Download your image first. This clears the current photos.” Cancel tidak mengubah apa pun; confirm membersihkan foto dan metadata, mempertahankan koleksi terakhir hanya dalam memori.

## Error dan recovery

| Kondisi | Respons UI |
| --- | --- |
| Izin ditolak | Cara mengaktifkan izin browser secara umum + Use my photos |
| Izin belum dijawab setelah 10 detik | Bantuan nonblocking; bukan menyimpulkan penolakan |
| Perangkat tidak ditemukan/sedang dipakai | Retry camera / Use my photos |
| Kamera terputus | Stop countdown, pertahankan shot selesai, Retry |
| Upload tidak didukung/terlalu besar | Jelaskan nama file dan batas; input valid lain tetap dipertahankan |
| Decode gagal | Tidak mengisi slot dengan frame kosong; tawarkan replace |
| Belum empat foto | Label jumlah yang kurang, Continue disabled dengan alasan terlihat |
| Font/aset belum siap | Render menunggu; retry atau fallback font terdefinisi, tidak blank |
| Share/clipboard gagal | Pesan singkat + Download PNG; jangan mengulang otomatis |
| Render terlambat setelah edit baru | Abaikan hasil lama; jangan menimpa preview terkini |

## Aksesibilitas dan motion

Target kontrol sentuh minimal 44×44 CSS px sebagai keputusan desain. Input mobile minimal 16 px. Selected state memakai border/check/label, bukan warna saja. Focus ring terlihat, dialog memulihkan focus, icon-only punya accessible name. Informasi frame dan status memakai pengumuman singkat; tidak mengumumkan setiap frame video.

Tidak ada strobe: feedback shutter cukup perubahan border singkat dan angka. Sound off default. Reduced motion menghapus translate/rotate/reveal dan mempertahankan perubahan state instan. Seluruh alur tetap dapat digunakan tanpa suara atau drag.
