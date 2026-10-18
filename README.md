# 🛒 NEXUSTORE - E-Commerce & Katalog Produk Digital & Fisik
> Aplikasi Web E-Commerce modern berbasis **Next.js (App Router)**, **Tailwind CSS**, **TypeScript**, dan terintegrasi penuh dengan **Supabase** untuk database dan autentikasi.

---

## 🚀 Fitur Unggulan

### 1. 🔐 Autentikasi Pengguna & Hak Akses (Supabase Auth)
- **Login, Register & Logout**: Autentikasi pembeli terhubung langsung dengan Supabase Auth.
- **Proteksi Halaman**: Halaman keranjang belanja (`/cart`) dan proses pembayaran (`/checkout`) diproteksi agar hanya dapat diakses oleh pengguna yang telah login.
- **Role-Based Access**: Pembagian hak akses antara pembeli umum (`customer`) dan administrator (`admin`).
- **Interactive Testing Mode**: Tersedia tombol cepat untuk masuk sebagai *Pembeli (Budi Santoso)* atau *Admin Toko* hanya dengan 1 klik untuk pengujian instan.

### 2. 💎 Etalase & Katalog Produk (Digital & Fisik)
- **Dukungan Produk Ganda**:
  - **Produk Digital**: Source code boilerplate, e-book praktisi, bundle preset Lightroom, dan Figma UI kits dengan tautan unduhan instan.
  - **Produk Fisik**: Keyboard mekanikal kustom, tas komuter anti-air, alas meja kulit vegan, dan perlengkapan meja kerja.
- **Pencarian Real-Time**: Pencarian instan berdasarkan judul, kategori, dan deskripsi produk tanpa reload halaman.
- **Filter Multi-Kriteria**:
  - Filter jenis produk: *Semua*, *Digital (Download Langsung)*, *Fisik (Dikirim)*.
  - Filter kategori (*Source Code*, *E-Book*, *Preset*, *Setup Meja*, *Hardware*, dll).
- **Pengurutan (Sort)**: Urutkan produk berdasarkan Terbaru, Harga Terendah, Harga Tertinggi, dan Rating.

### 3. 🛍️ Keranjang Belanja & Checkout Terproteksi
- Tambah, ubah jumlah kuantitas, atau hapus item dari keranjang dengan perhitungan otomatis.
- Deteksi cerdas: Pengiriman otomatis diatur menjadi **Gratis** jika pesanan hanya berisi produk digital.
- Simulasi kode kupon promo (`DISKON20` untuk diskon 20%, `NEXUS50` untuk diskon 50%).
- Formulir checkout dinamis: Alamat pengiriman hanya muncul bila ada produk fisik; jika hanya digital, sistem langsung meminta email penerima file.
- Pemilihan metode pembayaran (QRIS Instant, BCA Virtual Account, Mandiri, E-Wallet).
- Penyimpanan data transaksi ke tabel Supabase `orders` dan `order_items`.

### 4. 📦 Riwayat & Akses Unduhan Pembeli
- Halaman status pesanan pembeli (`/orders`) menampilkan detail seluruh transaksi.
- **Direct Digital Download**: Tombol unduh aset langsung aktif pada pesanan untuk produk digital.

### 5. 🛡️ Panel Manajemen Admin (`/admin`)
- **Dashboard Ringkasan**: Statistik total pendapatan, jumlah pesanan, total produk katalog, dan breakdown digital vs fisik.
- **Manajemen Pesanan (`/admin/orders`)**: Lihat seluruh pesanan pembeli dan ubah status pesanan secara langsung:
  - `Menunggu Pembayaran`
  - `Diproses`
  - `Selesai`
  - `Dibatalkan`
- **Manajemen Produk (`/admin/products`)**: Operasi CRUD (Create, Read, Update, Delete) lengkap dengan modal form terpadu.

---

## 🗄️ Struktur Basis Data Supabase & Skrip SQL

Skrip SQL lengkap tersedia di file: [`supabase/schema.sql`](./supabase/schema.sql).

### Tabel-Tabel Utama:
1. `profiles`: Menyimpan profil pengguna, avatar, dan role (`customer` atau `admin`), tertaut dengan `auth.users(id)`.
2. `products`: Menyimpan katalog barang digital maupun fisik (tipe, kategori, harga, link file, stok, rating, dsb).
3. `orders`: Menyimpan data transaksi, alamat kirim, metode pembayaran, total bayar, dan status pesanan.
4. `order_items`: Menyimpan snapshot produk per pesanan beserta link unduh digital.

### Row Level Security (RLS) Policies:
- Tabel `products` dapat dibaca oleh publik (anon), namun hanya dapat dimodifikasi oleh admin.
- Tabel `orders` dan `order_items` hanya dapat dibaca oleh pemilik pesanan (`auth.uid() = user_id`) atau oleh administrator.
- Trigger otomatis `handle_new_user()` menyinkronkan data pendaftaran dari `auth.users` ke `profiles`.

---

## ⚙️ Panduan Menghubungkan ke Supabase

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor**, buka file [`supabase/schema.sql`](./supabase/schema.sql) dari repositori ini, salin seluruh isinya, lalu klik **Run**.
3. Buka menu **Project Settings** > **API**, salin:
   - `Project URL`
   - `anon public key`
4. Buat atau perbarui file `.env.local` di root folder proyek:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
   NEXT_PUBLIC_DEMO_MODE=false
   ```
5. *(Opsional)* Jika Anda ingin menjadikan pengguna tertentu sebagai Admin di Supabase:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'email-admin-anda@domain.com';
   ```

---

## 💻 Cara Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js versi 18 atau 20 LTS
- NPM atau PNPM

### Langkah Instalasi
```bash
# 1. Masuk ke direktori proyek
cd ecommerce-catalog

# 2. Instal seluruh dependensi
npm install

# 3. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000) untuk mulai menjelajahi katalog produk.

---

## 📁 Struktur Direktori Proyek

```
ecommerce-catalog/
├── supabase/
│   └── schema.sql             # Skrip SQL lengkap, RLS, triggers & seed data
├── src/
│   ├── app/
│   │   ├── admin/             # Panel manajemen admin
│   │   │   ├── page.tsx       # Overview dashboard admin & metriks
│   │   │   ├── layout.tsx     # Layout khusus admin
│   │   │   ├── orders/        # Halaman manajemen pesanan masuk
│   │   │   └── products/      # Halaman manajemen produk (CRUD)
│   │   ├── auth/              # Halaman autentikasi
│   │   │   ├── login/         # Form login pembeli & demo switcher
│   │   │   └── register/      # Form pendaftaran akun baru
│   │   ├── cart/              # Keranjang belanja & kupon diskon
│   │   ├── checkout/          # Halaman pembayaran & input pengiriman
│   │   ├── orders/            # Riwayat pesanan & akses unduhan pembeli
│   │   ├── products/[id]/     # Halaman detail produk lengkap
│   │   ├── globals.css        # Konfigurasi Tailwind CSS & style
│   │   ├── layout.tsx         # Root Layout, Auth & Cart Providers
│   │   └── page.tsx           # Etalase utama & katalog interaktif
│   ├── components/            # Komponen antarmuka (Navbar, Footer, ProductCard, Toast)
│   └── lib/
│       ├── context/           # AuthContext & CartContext
│       ├── data/              # StoreService & mock data produk
│       ├── supabase/          # Client, Server SSR helper & Types
│       └── utils.ts           # Helper format Rupiah & tanggal
├── .env.local.example         # Template konfigurasi environment Supabase
├── next.config.mjs            # Konfigurasi Next.js
├── tailwind.config.ts         # Desain sistem Tailwind CSS
├── tsconfig.json              # Konfigurasi TypeScript
└── package.json
```
