__PRODUCT REQUIREMENTS DOCUMENT__

__Tracer Study Alumni PTI UMS__

Jalur Profesi PPG & Studi Lanjut S2/S3

Versi 1\.0  •  April 2026

 

__Nama Produk__

Tracer Study Alumni PTI UMS

__Versi Dokumen__

1\.0

__Tanggal__

April 2026

__Tim/Unit__

Program Studi Pendidikan Teknologi Informasi, UMS

__Status__

Draft \- Untuk Review

 

 

# <a id="_5foykd2u31tu"></a>__1\. Pendahuluan__

## <a id="_n6uo1d5yzjd6"></a>__1\.1 Latar Belakang__

Program Studi Pendidikan Teknologi Informasi \(PTI\) Universitas Muhammadiyah Surakarta \(UMS\) membutuhkan sistem tracer study yang terstruktur untuk memantau perkembangan karir alumni, khususnya pada dua jalur utama: \(1\) Profesi Guru melalui Program PPG, dan \(2\) Studi Lanjut ke jenjang S2 maupun S3\.

 

## <a id="_cbca4cmfjza6"></a>__1\.2 Tujuan Produk__

• 	Memudahkan alumni PTI UMS untuk mengisi data tracer study secara mandiri melalui web

• 	Menyediakan database alumni yang terkelola dengan baik dan dapat diperbarui oleh admin

• 	Menghasilkan dashboard analitik yang membantu prodi memahami sebaran alumni pada jalur PPG dan S2/S3

• 	Mendukung proses akreditasi dan evaluasi kurikulum Program Studi PTI UMS

 

## <a id="_q38epvape4me"></a>__1\.3 Ruang Lingkup__

Aplikasi ini mencakup dua modul utama:

• 	Modul Alumni \(User\): Pencarian nama, pengisian survey, dan pembaruan data

• 	Modul Admin: Manajemen database alumni, monitoring pengisian, dan dashboard laporan

 

Scope survey terbatas pada dua jalur karir: Profesi PPG dan Studi Lanjut S2/S3\. Perluasan ke jalur lain di luar scope ini tidak termasuk dalam versi pertama aplikasi\.

 

## <a id="_bp2jzdhx8p9r"></a>__1\.4 Definisi & Singkatan__

__Istilah__

__Definisi__

PTI UMS

Program Studi Pendidikan Teknologi Informasi, Universitas Muhammadiyah Surakarta

PPG

Pendidikan Profesi Guru \- program pendidikan profesi untuk calon guru

Tracer Study

Studi penelusuran jejak alumni setelah lulus dari perguruan tinggi

Admin

Pengelola sistem dari pihak Prodi PTI UMS yang memiliki akses penuh ke dashboard

Alumni

Lulusan Program Studi PTI UMS yang menjadi responden survey

Database Alumni

Kumpulan data nama alumni yang diimpor melalui file Excel oleh Admin

 

 

# <a id="_xzsezkvasvqg"></a>__2\. Pengguna Sistem__

## <a id="_x07q556civ2h"></a>__2\.1 Jenis Pengguna__

__Jenis Pengguna__

__Deskripsi__

__Akses__

Alumni \(User\)

Lulusan PTI UMS yang namanya terdaftar di database alumni

Halaman survey publik \(tanpa login\)

Admin

Staf/dosen PTI UMS yang mengelola data dan laporan

Dashboard admin \(login wajib\)

 

## <a id="_ihruwabix1ym"></a>__2\.2 Karakteristik Pengguna Alumni__

• 	Tidak memerlukan akun atau login

• 	Hanya dapat mengisi survey jika nama ditemukan di database alumni

• 	Dapat mengakses dan mengedit jawaban survey yang telah disubmit sebelumnya

• 	Mengakses sistem melalui browser di desktop maupun perangkat mobile

 

## <a id="_fsdoar33dw1s"></a>__2\.3 Karakteristik Pengguna Admin__

• 	Menggunakan username dan password untuk login

• 	Memiliki akses penuh terhadap seluruh data survey alumni

• 	Dapat mengelola \(tambah, lihat, hapus\) database alumni melalui upload Excel

• 	Dapat mengunduh data survey dalam format Excel/CSV

 

 

# <a id="_z4jvkg2pix25"></a>__3\. Fitur & Persyaratan Fungsional__

## <a id="_l7mfzf71231g"></a>__3\.1 Modul Alumni \(User\)__

__3\.1\.1 Halaman Pencarian Alumni__

• 	Terdapat kolom pencarian nama dengan fitur autocomplete/suggestion berbasis database alumni

• 	Sistem menampilkan daftar nama yang cocok saat alumni mulai mengetik \(minimal 2 karakter\)

• 	Alumni memilih namanya dari dropdown/daftar hasil pencarian

• 	Jika nama tidak ditemukan, sistem menampilkan pesan: "Nama Anda tidak terdaftar\. Hubungi admin PTI UMS\."

• 	Setelah nama dipilih, sistem mengecek apakah alumni sudah pernah mengisi survey

–	Jika belum: lanjut ke form pengisian survey

–	Jika sudah: tampilkan ringkasan jawaban lama dengan opsi "Edit Jawaban"

 

__3\.1\.2 Formulir Survey__

Formulir terdiri dari tiga bagian:

 

__Bagian A: Identitas Dasar__

__No__

__Pertanyaan__

__Tipe Input__

__Wajib__

1

Nama Lengkap

Text \(auto\-fill dari pencarian\)

Ya

2

Tahun Lulus dari UMS

Dropdown \(pilih tahun\)

Ya

3

Nomor HP Aktif

Text \(format nomor telepon\)

Ya

4

Status Pekerjaan Saat Ini

Dropdown pilihan

Ya

5

Nama Instansi/Tempat Mengajar

Text

Ya

6

Pesan/Saran untuk Prodi PTI UMS terkait PPG

Textarea

Tidak

 

Pilihan Status Pekerjaan: Belum Bekerja, Bekerja sebagai Guru/Pendidik, Bekerja Non\-Pendidikan, Mahasiswa S2/S3, Lainnya\.

 

__Bagian B: Studi Lanjut S2/S3 \(Conditional\)__

__No__

__Pertanyaan__

__Tipe Input__

__Kondisi Tampil__

7

Apakah melanjutkan studi ke S2/S3?

Radio: Ya / Tidak

Selalu tampil

8

Jurusan/Program Studi S2/S3

Text

Jika jawaban No\.7 = Ya

9

Universitas Tempat S2/S3

Text

Jika jawaban No\.7 = Ya

 

__Bagian C: Program PPG \(Conditional\)__

__No__

__Pertanyaan__

__Tipe Input__

__Kondisi Tampil__

10

Apakah mengikuti program PPG?

Radio: Ya / Tidak

Selalu tampil

11

Tahun Mengikuti PPG

Dropdown \(pilih tahun\)

Jika jawaban No\.10 = Ya

12

Universitas Penyelenggara PPG

Text dengan autocomplete

Jika jawaban No\.10 = Ya

 

__3\.1\.3 Proses Submit & Edit__

• 	Tombol "Kirim Survey" hanya aktif jika semua field wajib telah diisi

• 	Setelah submit berhasil, tampilkan halaman konfirmasi dengan ringkasan jawaban

• 	Alumni dapat kembali ke halaman pencarian dan memilih namanya kembali untuk melakukan edit

• 	Saat edit, jawaban lama ditampilkan dan bisa diubah, kemudian disimpan ulang

 

## <a id="_vlufj1y5jm6q"></a>__3\.2 Modul Admin__

__3\.2\.1 Autentikasi Admin__

• 	Halaman login terpisah di URL /admin/login

• 	Login menggunakan username dan password

• 	Session login berlaku selama browser aktif \(session\-based\) atau bisa dikonfigurasi timeout

• 	Terdapat tombol logout

 

__3\.2\.2 Manajemen Database Alumni__

• 	Admin dapat mengupload file Excel \(\.xlsx / \.xls\) berisi data alumni

• 	Format Excel yang diterima minimal memiliki kolom: Nama Lengkap, NIM, Tahun Lulus

• 	Sistem memvalidasi format file sebelum import, dan menampilkan preview data sebelum dikonfirmasi

• 	Sistem mendeteksi duplikasi nama\+NIM dan meminta konfirmasi dari admin sebelum overwrite

• 	Admin dapat melihat daftar seluruh alumni yang ada di database

• 	Admin dapat menghapus data alumni tertentu

• 	Admin dapat menambah alumni secara manual \(satu per satu\) jika tidak melalui Excel

 

__3\.2\.3 Monitoring Pengisian Survey__

• 	Admin dapat melihat daftar alumni yang sudah mengisi survey \(beserta tanggal pengisian\)

• 	Admin dapat melihat daftar alumni yang belum mengisi survey

• 	Admin dapat melihat detail jawaban survey dari setiap alumni

• 	Admin dapat mengunduh seluruh data survey dalam format Excel \(\.xlsx\)

• 	Terdapat fitur pencarian/filter berdasarkan nama, tahun lulus, status pengisian

 

__3\.2\.4 Dashboard & Grafik__

• 	Ringkasan statistik utama ditampilkan di halaman utama admin:

–	Total alumni terdaftar di database

–	Jumlah alumni yang sudah mengisi survey

–	Jumlah alumni yang belum mengisi \(persentase respons\)

• 	Grafik distribusi alumni yang melanjutkan PPG \(pie/donut chart: Ya vs Tidak\)

• 	Grafik distribusi alumni yang melanjutkan S2/S3 \(pie/donut chart: Ya vs Tidak\)

• 	Grafik persebaran tahun kelulusan alumni yang sudah mengisi survey \(bar chart\)

• 	Grafik universitas penyelenggara PPG terbanyak \(bar chart horizontal\)

• 	Grafik jurusan S2/S3 yang paling banyak dipilih alumni \(bar chart horizontal\)

• 	Grafik status pekerjaan alumni \(pie chart\)

 

 

# <a id="_gw8ekf71gndy"></a>__4\. Persyaratan Non\-Fungsional__

## <a id="_pgfdbmqu0zx0"></a>__4\.1 Antarmuka & Pengalaman Pengguna__

• 	Aplikasi bersifat mobile\-friendly / responsive \(mendukung layar 360px hingga 1920px\)

• 	Bahasa antarmuka seluruhnya dalam Bahasa Indonesia

• 	Desain bersih, sederhana, dan profesional mencerminkan identitas kampus PTI UMS

• 	Waktu loading halaman utama tidak lebih dari 3 detik pada koneksi normal

• 	Form survey menampilkan indikator progres jika pertanyaan bersifat multi\-langkah

 

## <a id="_2gzfkvcgao4x"></a>__4\.2 Keamanan__

• 	Halaman admin hanya dapat diakses setelah login berhasil; redirect ke halaman login jika belum autentikasi

• 	Password admin disimpan dalam bentuk hash \(bcrypt atau setara\)

• 	Proteksi terhadap serangan SQL Injection dan XSS pada semua input form

• 	HTTPS wajib digunakan pada environment produksi

 

## <a id="_1abqeuamhzqd"></a>__4\.3 Ketersediaan & Performa__

• 	Aplikasi harus dapat diakses 24/7 selama masa survey aktif

• 	Mendukung setidaknya 100 pengguna bersamaan tanpa penurunan performa signifikan

 

## <a id="_ss4wn8uy9khe"></a>__4\.4 Kompatibilitas Browser__

__Browser__

__Versi Minimum__

__Prioritas__

Google Chrome

90\+

Utama

Mozilla Firefox

88\+

Utama

Microsoft Edge

90\+

Utama

Safari \(iOS/macOS\)

14\+

Pendukung

Samsung Internet \(Android\)

14\+

Pendukung

 

 

# <a id="_i63e5xpfabyi"></a>__5\. Alur Pengguna \(User Flow\)__

## <a id="_pti9991xz5aq"></a>__5\.1 Alur Alumni Mengisi Survey__

__Langkah__

__Aksi Pengguna__

__Respons Sistem__

1

Membuka URL aplikasi di browser

Menampilkan halaman pencarian nama

2

Mulai mengetik nama \(min\. 2 karakter\)

Autocomplete menampilkan daftar nama yang cocok dari database

3a

Nama ditemukan, klik nama dari daftar

Sistem memeriksa apakah sudah pernah mengisi

3b

Nama tidak ditemukan

Tampil pesan: hubungi admin PTI UMS

4a

Belum pernah mengisi

Menampilkan form survey kosong

4b

Sudah pernah mengisi

Menampilkan ringkasan jawaban \+ tombol Edit Jawaban

5

Mengisi form survey, termasuk pertanyaan conditional

Field conditional muncul/hilang otomatis sesuai jawaban Ya/Tidak

6

Klik tombol Kirim Survey

Sistem memvalidasi semua field wajib

7a

Validasi berhasil

Data tersimpan, tampil halaman konfirmasi sukses

7b

Validasi gagal

Tampil pesan error pada field yang belum diisi

8

Selesai

Alumni dapat kembali untuk edit, atau menutup browser

 

## <a id="_s9s78ja0xu8l"></a>__5\.2 Alur Admin Mengelola Data__

__Langkah__

__Aksi Admin__

__Respons Sistem__

1

Membuka URL /admin/login

Menampilkan halaman login

2

Memasukkan username & password

Autentikasi; jika berhasil redirect ke dashboard

3

Melihat dashboard utama

Menampilkan statistik ringkas dan grafik terkini

4

Upload file Excel alumni baru

Sistem validasi format, tampil preview, konfirmasi import

5

Melihat daftar pengisian survey

Tabel alumni yang sudah/belum mengisi, filter & search tersedia

6

Klik detail alumni tertentu

Menampilkan seluruh jawaban survey alumni tersebut

7

Mengunduh laporan Excel

File \.xlsx terunduh berisi seluruh data survey

8

Logout

Sesi dihapus, redirect ke halaman login

 

 

# <a id="_zfk55ehneoty"></a>__6\. Struktur Data__

## <a id="_lib6rh12qowi"></a>__6\.1 Tabel: Data Alumni \(Database\)__

__Field__

__Tipe Data__

__Keterangan__

id

Integer \(PK, auto increment\)

Identifikasi unik alumni

nama\_lengkap

String \(255\)

Nama lengkap alumni

nim

String \(20\)

Nomor Induk Mahasiswa \(opsional, untuk validasi duplikat\)

tahun\_lulus

Integer

Tahun kelulusan dari PTI UMS

created\_at

Datetime

Waktu data dimasukkan ke sistem

updated\_at

Datetime

Waktu data terakhir diperbarui

 

## <a id="_c0rldtdjy9zq"></a>__6\.2 Tabel: Data Survey__

__Field__

__Tipe Data__

__Keterangan__

id

Integer \(PK\)

Identifikasi unik respons survey

alumni\_id

Integer \(FK\)

Relasi ke tabel alumni

tahun\_lulus\_konfirmasi

Integer

Tahun lulus yang dikonfirmasi alumni saat isi survey

status\_pekerjaan

Enum/String

Status pekerjaan saat ini

nama\_instansi

String \(255\)

Nama instansi/tempat mengajar

nomor\_hp

String \(20\)

Nomor HP aktif alumni

lanjut\_s2s3

Boolean

Apakah melanjutkan studi S2/S3

jurusan\_s2s3

String \(255\)

Jurusan/prodi S2/S3 \(nullable\)

universitas\_s2s3

String \(255\)

Nama universitas S2/S3 \(nullable\)

lanjut\_ppg

Boolean

Apakah mengikuti program PPG

tahun\_ppg

Integer

Tahun mengikuti PPG \(nullable\)

universitas\_ppg

String \(255\)

Universitas penyelenggara PPG \(nullable\)

pesan\_saran

Text

Pesan/saran untuk prodi PTI UMS \(nullable\)

created\_at

Datetime

Waktu pertama kali mengisi survey

updated\_at

Datetime

Waktu terakhir mengupdate jawaban

 

## <a id="_vtumb6eu7w5r"></a>__6\.3 Tabel: Admin__

__Field__

__Tipe Data__

__Keterangan__

id

Integer \(PK\)

Identifikasi unik admin

username

String \(100, unique\)

Username untuk login

password\_hash

String \(255\)

Password ter\-hash \(bcrypt\)

nama

String \(255\)

Nama lengkap admin

created\_at

Datetime

Waktu akun dibuat

 

 

# <a id="_7mmoz7an1m18"></a>__7\. Format File Excel Import Alumni__

File Excel yang digunakan admin untuk mengimpor data alumni harus mengikuti format berikut:

 

__Nama Kolom di Excel__

__Tipe Data__

__Wajib__

__Keterangan__

Nama Lengkap

Text

Ya

Nama lengkap alumni, tidak boleh kosong

NIM

Text

Ya

Nomor Induk Mahasiswa, untuk deteksi duplikat

Tahun Lulus

Angka \(4 digit\)

Ya

Contoh: 2019, 2020, 2021

 

• 	Baris pertama \(header/judul kolom\) harus persis seperti format di atas

• 	Kolom tambahan lainnya di luar format akan diabaikan oleh sistem

• 	Sistem akan memvalidasi setiap baris: baris dengan data tidak valid akan ditandai dan dilaporkan

• 	Admin dapat mengunduh template Excel kosong dari halaman import untuk kemudahan pengisian

 

 

# <a id="_wqzxx6aiyb37"></a>__8\. Rekomendasi Teknologi__

Berikut adalah rekomendasi stack teknologi yang dapat dipertimbangkan oleh tim pengembang:

 

__Komponen__

__Rekomendasi__

__Alternatif__

Frontend

React\.js / Next\.js

Vue\.js / Nuxt\.js

Backend

Node\.js \+ Express / Laravel \(PHP\)

Django \(Python\) / FastAPI

Database

PostgreSQL / MySQL

SQLite \(untuk skala kecil\)

Autentikasi Admin

JWT / Session\-based auth

Passport\.js / Laravel Sanctum

File Upload Excel

SheetJS \(js\-xlsx\) / PHPSpreadsheet

Openpyxl \(Python\)

Grafik Dashboard

Chart\.js / Recharts

ApexCharts / D3\.js

Hosting

VPS kampus / shared hosting

Vercel \+ Supabase \(gratis\)

CSS Framework

Tailwind CSS

Bootstrap 5

 

 

# <a id="_48lfmvfo5s83"></a>__9\. Daftar Halaman Aplikasi__

## <a id="_b8g4pjeoqeyi"></a>__9\.1 Sisi Alumni \(Publik\)__

__URL__

__Nama Halaman__

__Deskripsi__

/

Beranda / Pencarian

Kolom cari nama, autocomplete, entry point alumni

/survey/:id

Halaman Survey

Form pengisian survey untuk alumni yang dipilih

/survey/:id/edit

Edit Survey

Form edit jawaban survey yang sudah disubmit

/survey/selesai

Konfirmasi Selesai

Halaman sukses setelah submit survey

 

## <a id="_ych1koane3hi"></a>__9\.2 Sisi Admin \(Terproteksi Login\)__

__URL__

__Nama Halaman__

__Deskripsi__

/admin/login

Login Admin

Form login username & password

/admin/dashboard

Dashboard

Statistik ringkas \+ grafik/chart analitik

/admin/alumni

Daftar Alumni

Tabel seluruh alumni di database \+ fitur filter

/admin/alumni/import

Import Alumni

Upload Excel, preview, dan konfirmasi import

/admin/alumni/tambah

Tambah Alumni

Form tambah alumni manual satu per satu

/admin/survey

Data Survey

Daftar alumni yang sudah dan belum mengisi

/admin/survey/:id

Detail Survey

Jawaban lengkap survey satu alumni

/admin/survey/export

Export Excel

Download semua data survey sebagai \.xlsx

 

 

# <a id="_in623qfc4nl9"></a>__10\. Kriteria Penerimaan \(Acceptance Criteria\)__

## <a id="_e8t508ieex6y"></a>__10\.1 Modul Alumni__

__ID__

__Skenario__

__Kriteria Berhasil__

AC\-A01

Alumni mencari nama yang ada di database

Nama muncul di dropdown, dapat dipilih, dan form survey tampil

AC\-A02

Alumni mencari nama yang tidak ada di database

Pesan 'Nama tidak terdaftar' tampil, form tidak dapat diakses

AC\-A03

Alumni submit form dengan field wajib kosong

Tombol submit tidak aktif atau muncul pesan validasi

AC\-A04

Alumni submit form lengkap

Data tersimpan, halaman konfirmasi muncul

AC\-A05

Alumni yang sudah mengisi mencari namanya lagi

Ringkasan jawaban lama tampil beserta tombol Edit Jawaban

AC\-A06

Alumni mengedit dan menyimpan ulang jawaban

Data baru tersimpan, menimpa data lama

AC\-A07

Alumni menjawab 'Ya' pada pertanyaan PPG

Field tahun PPG dan universitas PPG muncul otomatis

AC\-A08

Alumni menjawab 'Tidak' pada pertanyaan PPG

Field PPG tidak tampil dan tidak dikirim ke server

 

## <a id="_d3sbe13i3pjg"></a>__10\.2 Modul Admin__

__ID__

__Skenario__

__Kriteria Berhasil__

AC\-B01

Admin login dengan kredensial benar

Berhasil masuk ke dashboard admin

AC\-B02

Admin login dengan kredensial salah

Pesan error tampil, tidak bisa masuk

AC\-B03

Admin upload Excel format benar

Data ter\-preview, setelah konfirmasi ter\-import ke database

AC\-B04

Admin upload Excel format salah

Pesan error validasi tampil, data tidak diimport

AC\-B05

Admin melihat dashboard

Statistik & grafik terbaru tampil dengan data yang akurat

AC\-B06

Admin mendownload data survey

File \.xlsx terunduh berisi seluruh data survey

AC\-B07

Akses halaman admin tanpa login

Redirect otomatis ke halaman /admin/login

 

 

# <a id="_rv6gpyqgj7fz"></a>__11\. Asumsi & Batasan__

## <a id="_zhhjaq1wnvf7"></a>__11\.1 Asumsi__

• 	Data alumni awal sudah tersedia dalam format Excel dan siap untuk diimport ke sistem

• 	Admin yang mengelola sistem memiliki kemampuan dasar penggunaan komputer dan browser

• 	Alumni diasumsikan memiliki akses internet dan browser yang kompatibel

• 	Setiap nama alumni dalam database diasumsikan unik; jika ada nama yang sama, NIM digunakan sebagai pembeda

 

## <a id="_rf9rkww8hxps"></a>__11\.2 Batasan__

• 	Sistem hanya mendukung survey untuk jalur PPG dan S2/S3; perluasan ke jalur lain tidak termasuk versi ini

• 	Tidak ada fitur notifikasi email untuk alumni maupun admin dalam versi ini

• 	Alumni tidak dapat mendaftar sendiri ke database; pendaftaran hanya melalui import Excel oleh admin

• 	Tidak ada fitur multi\-bahasa; bahasa yang digunakan hanya Bahasa Indonesia

• 	Laporan dalam format Excel saja; format PDF atau PowerPoint tidak disertakan dalam versi ini

 

 

# <a id="_rsvomqv3n966"></a>__12\. Rencana Pengembangan__

__Fase__

__Periode__

__Cakupan Pengembangan__

Fase 1 \- MVP

Bulan 1\-2

Halaman pencarian alumni, form survey lengkap dengan conditional logic, submit & edit jawaban, login admin dasar

Fase 2 \- Admin Core

Bulan 2\-3

Import Excel alumni, daftar alumni, monitoring pengisian survey, export Excel

Fase 3 \- Dashboard

Bulan 3\-4

Dashboard analitik dengan grafik, filter & search data, optimasi tampilan mobile

Fase 4 \- Hardening

Bulan 4

Pengujian keamanan, optimasi performa, perbaikan bug, deployment ke server produksi

 

 

 

*Dokumen ini dibuat untuk keperluan pengembangan sistem Tracer Study Alumni PTI UMS\.*

*Versi 1\.0  •  April 2026  •  Program Studi PTI UMS*

