# 🎓 Tracer Study - FKIP UMS

Aplikasi **Tracer Study** untuk Fakultas Keguruan dan Ilmu Pendidikan (FKIP) Universitas Muhammadiyah Surakarta. Digunakan untuk melacak dan menganalisis data alumni serta survei kelulusan.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup Lokal](#-instalasi--setup-lokal)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Deployment ke VPS](#-deployment-ke-vps)
- [Deployment ke Shared Hosting](#-deployment-ke-shared-hosting)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Fitur

### Publik (Alumni)
- 🔍 **Pencarian Alumni** — Cari data alumni berdasarkan nama atau NIM
- 📝 **Pengisian Survei** — Alumni mengisi survei tracer study secara online
- 🔐 **Login Google** — Autentikasi alumni via Google Sign-In

### Admin
- 📊 **Dashboard Analitik** — Visualisasi data alumni & survei dengan chart interaktif
- 👥 **Manajemen Alumni** — CRUD data alumni (tambah, edit, hapus)
- 📥 **Import Data** — Import data alumni dari file Excel (.xlsx)
- 📤 **Export Data** — Download data alumni & survei dalam format Excel
- 📋 **Manajemen Survei** — Lihat dan kelola hasil survei alumni
- ⚙️ **Pengaturan** — Konfigurasi sistem

---

## 🛠 Tech Stack

| Layer        | Teknologi                                      |
| ------------ | ---------------------------------------------- |
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, Chart.js |
| **Backend**  | Express 5, TypeScript, Zod (validasi)          |
| **Database** | PostgreSQL 15+                                 |
| **Auth**     | Session-based, Google OAuth, bcrypt            |
| **Tooling**  | npm workspaces (monorepo), concurrently        |

---

## 📁 Struktur Proyek

```
tracer/
├── apps/
│   ├── api/                  # Backend Express API
│   │   └── src/
│   │       ├── config/       # Konfigurasi environment
│   │       ├── controllers/  # Request handlers
│   │       ├── db/           # Database pool & transaction
│   │       ├── middlewares/  # Auth, error handler, rate limit
│   │       ├── repositories/ # Query database (Data layer)
│   │       ├── routes/       # Definisi routing API
│   │       ├── services/     # Business logic
│   │       ├── types/        # TypeScript types
│   │       ├── utils/        # Helper functions
│   │       └── validations/  # Zod schemas
│   │
│   └── web/                  # Frontend Next.js
│       ├── app/              # Pages (App Router)
│       │   ├── admin/        # Halaman admin (dashboard, alumni, survey)
│       │   ├── login/        # Login alumni
│       │   ├── pencarian/    # Pencarian alumni
│       │   └── survey/       # Pengisian survei
│       ├── components/       # Reusable UI components
│       └── lib/              # API client, types, utilities
│
├── infra/
│   └── database/             # Seed script & schema SQL
│
└── package.json              # Root workspace config
```

---

## 📌 Prasyarat

Pastikan software berikut sudah terinstall:

- **Node.js** >= 18.x — [Download](https://nodejs.org/)
- **npm** >= 9.x (sudah termasuk dalam Node.js)
- **PostgreSQL** >= 15.x — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)

---

## 🚀 Instalasi & Setup Lokal

### 1. Clone Repository

```bash
git clone https://github.com/arvadf/tracer.git
cd tracer
```

### 2. Install Dependencies

```bash
npm install
```

> Perintah ini akan otomatis menginstall semua dependencies untuk `apps/api` dan `apps/web` sekaligus (npm workspaces).

### 3. Setup Database PostgreSQL

Buat database baru di PostgreSQL:

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE tracer;

# Keluar
\q
```

### 4. Import Schema Database

Jika Anda memiliki file `backup_full.sql` (full backup):

```bash
psql -U postgres -d tracer < backup_full.sql
```

Atau jika hanya schema (tanpa data):

```bash
psql -U postgres -d tracer < skema_saja.sql
```

### 5. Konfigurasi Environment

Buat file `.env` di folder `apps/api/`:

```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@localhost:5432/tracer
SESSION_SECRET=ganti-dengan-string-random-yang-panjang
CORS_ORIGIN=http://localhost:3000
PORT=5000
NODE_ENV=development
GOOGLE_CLIENT_ID=your-google-client-id
```

Buat file `.env.local` di folder `apps/web/`:

```bash
# apps/web/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## ▶️ Menjalankan Aplikasi

### Mode Development (Frontend + Backend sekaligus)

```bash
npm run dev
```

Ini akan menjalankan:
- **Frontend (Next.js)** di `http://localhost:3000`
- **Backend (Express API)** di `http://localhost:5000`

### Menjalankan Terpisah

```bash
# Jalankan API saja
npm run dev --workspace=api

# Jalankan Web saja
npm run dev --workspace=web
```

### Akses Aplikasi

| Halaman            | URL                              |
| ------------------ | -------------------------------- |
| Homepage           | http://localhost:3000             |
| Pencarian Alumni   | http://localhost:3000/pencarian   |
| Login Alumni       | http://localhost:3000/login       |
| Admin Login        | http://localhost:3000/admin/login |
| Admin Dashboard    | http://localhost:3000/admin/dashboard |
| API Health Check   | http://localhost:5000/health      |

### Login Admin Default

```
Username: admin
Password: admin123
```

> ⚠️ **Penting:** Segera ganti password admin setelah setup pertama kali!

---

## ⚙️ Konfigurasi Environment

### Backend (`apps/api/.env`)

| Variable            | Deskripsi                          | Default                                      |
| ------------------- | ---------------------------------- | -------------------------------------------- |
| `DATABASE_URL`      | Connection string PostgreSQL       | `postgresql://postgres:password@localhost:5432/tracer` |
| `PORT`              | Port untuk API server              | `5000`                                       |
| `NODE_ENV`          | Environment mode                   | `development`                                |
| `SESSION_SECRET`    | Secret key untuk session           | *(wajib diganti di production)*              |
| `CORS_ORIGIN`       | Origin frontend yang diizinkan     | `http://localhost:3000`                      |
| `IMPORT_TTL_MINUTES`| Masa berlaku sesi import (menit)   | `15`                                         |
| `GOOGLE_CLIENT_ID`  | Client ID Google OAuth             | —                                            |

### Frontend (`apps/web/.env.local`)

| Variable                       | Deskripsi              |
| ------------------------------ | ---------------------- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID Google OAuth |

---

## 📖 Panduan Penggunaan

### Untuk Alumni

1. **Buka halaman utama** di browser (`http://localhost:3000`)
2. **Cari nama Anda** di halaman pencarian menggunakan NIM atau nama lengkap
3. **Login** menggunakan akun Google
4. **Isi survei** tracer study yang tersedia — isi semua field yang diminta
5. Setelah selesai, Anda akan diarahkan ke halaman konfirmasi

### Untuk Admin

1. **Login** di halaman `http://localhost:3000/admin/login`
   - Username: `admin` | Password: `admin123`
2. **Dashboard** — Lihat statistik dan grafik analitik alumni & survei
3. **Kelola Alumni:**
   - Tambah alumni satu per satu melalui form
   - **Import massal** dari file Excel (.xlsx) — format kolom: `NIM`, `Nama Lengkap`, `Tahun Lulus`
   - Edit atau hapus data alumni yang ada
4. **Kelola Survei:**
   - Lihat daftar semua survei yang masuk
   - Lihat detail respons survei individual
   - Import survei dari file Excel
5. **Export Data:**
   - Download data alumni dalam format Excel
   - Download hasil survei & grafik dashboard dalam format Excel

### Format File Import Excel

Untuk import alumni, siapkan file `.xlsx` dengan kolom:

| NIM       | Nama Lengkap | Tahun Lulus |
| --------- | ------------ | ----------- |
| A71010001 | Ahmad Budi   | 2020        |
| A71010002 | Siti Aminah  | 2021        |

> Kolom `Tahun Lulus` bersifat opsional.

---

## 🖥 Deployment ke VPS

Panduan deployment ke VPS (DigitalOcean, AWS EC2, Contabo, IDCloudHost, dll).

### Spesifikasi Minimum VPS

| Spesifikasi | Minimum   | Rekomendasi |
| ----------- | --------- | ----------- |
| RAM         | 1 GB      | 2 GB        |
| CPU         | 1 vCPU    | 2 vCPU      |
| Storage     | 20 GB SSD | 40 GB SSD   |
| OS          | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### Step 1: Setup Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi
node -v   # harus >= 18
npm -v    # harus >= 9

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 2: Setup Database

```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Buat user dan database
CREATE USER tracer_user WITH PASSWORD 'password_kuat_anda';
CREATE DATABASE tracer OWNER tracer_user;
GRANT ALL PRIVILEGES ON DATABASE tracer TO tracer_user;
\q
```

Kemudian import schema/data:

```bash
psql -U tracer_user -d tracer < backup_full.sql
```

### Step 3: Clone & Setup Proyek

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/arvadf/tracer.git
cd tracer

# Set permission
sudo chown -R $USER:$USER /var/www/tracer

# Install dependencies
npm install
```

### Step 4: Konfigurasi Environment Production

```bash
# Backend environment
cat > apps/api/.env << 'EOF'
DATABASE_URL=postgresql://tracer_user:password_kuat_anda@localhost:5432/tracer
PORT=5000
NODE_ENV=production
SESSION_SECRET=ganti-dengan-random-string-minimal-64-karakter
CORS_ORIGIN=https://domain-anda.com
GOOGLE_CLIENT_ID=your-google-client-id
EOF

# Frontend environment
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_API_URL=https://domain-anda.com/api/v1
EOF
```

### Step 5: Build Frontend

```bash
cd apps/web
npm run build
cd ../..
```

### Step 6: Setup PM2 (Process Manager)

Buat file `ecosystem.config.js` di root proyek:

```javascript
module.exports = {
  apps: [
    {
      name: 'tracer-api',
      cwd: './apps/api',
      script: 'node_modules/.bin/ts-node-dev',
      args: 'src/server.ts',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'tracer-web',
      cwd: './apps/web',
      script: 'node_modules/.bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

Jalankan dengan PM2:

```bash
# Mulai semua service
pm2 start ecosystem.config.js

# Auto-start saat server reboot
pm2 startup
pm2 save

# Cek status
pm2 status

# Lihat log
pm2 logs
```

### Step 7: Setup Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/tracer
```

Isi dengan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Express)
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000;
    }
}
```

Aktifkan konfigurasi:

```bash
# Aktifkan site
sudo ln -s /etc/nginx/sites-available/tracer /etc/nginx/sites-enabled/

# Hapus default site (opsional)
sudo rm /etc/nginx/sites-enabled/default

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Setup SSL (HTTPS) dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Dapatkan sertifikat SSL (ganti domain-anda.com)
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com

# Auto-renewal (otomatis sudah terkonfigurasi)
sudo certbot renew --dry-run
```

### Step 9: Konfigurasi Firewall

```bash
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

---

## 🌐 Deployment ke Shared Hosting

> ⚠️ **Catatan Penting:** Shared hosting **tidak ideal** untuk aplikasi Node.js. Sebagian besar shared hosting tradisional (cPanel) hanya mendukung PHP. Namun, beberapa shared hosting modern sudah mendukung Node.js.

### Opsi 1: Shared Hosting dengan Node.js Support (cPanel)

Hosting yang mendukung Node.js di cPanel: **A2 Hosting, HostGator, Namecheap (Stellar Business+)**.

#### Step 1: Setup Node.js di cPanel

1. Login ke **cPanel**
2. Cari menu **"Setup Node.js App"**
3. Klik **"Create Application"**
4. Isi konfigurasi:
   - **Node.js version:** 18.x atau lebih baru
   - **Application mode:** Production
   - **Application root:** tracer
   - **Application URL:** domain-anda.com
   - **Application startup file:** apps/api/src/server.ts

#### Step 2: Upload Proyek

1. Buka **File Manager** di cPanel
2. Upload semua file proyek ke folder yang ditentukan
3. Atau gunakan SSH (jika tersedia):

```bash
cd ~/tracer
git clone https://github.com/arvadf/tracer.git .
npm install
```

#### Step 3: Setup Database

1. Di cPanel, buka **"PostgreSQL Databases"** (atau MySQL jika PostgreSQL tidak tersedia)
2. Buat database baru
3. Buat user baru dan assign ke database
4. Import data via **phpPgAdmin** atau command line

#### Step 4: Build & Konfigurasi

```bash
# Buat file .env
nano apps/api/.env
# (isi sesuai konfigurasi environment di atas)

# Build frontend
cd apps/web
npm run build
```

### Opsi 2: Platform Cloud (Rekomendasi — Gratis/Murah)

Alternatif yang lebih mudah dan banyak memiliki tier gratis:

| Platform                                      | Frontend         | Backend          | Database         | Harga       |
| --------------------------------------------- | ---------------- | ---------------- | ---------------- | ----------- |
| [**Vercel**](https://vercel.com)              | ✅ Next.js       | ❌               | ❌               | Gratis      |
| [**Railway**](https://railway.app)            | ✅               | ✅ Express       | ✅ PostgreSQL    | $5/bulan    |
| [**Render**](https://render.com)              | ✅               | ✅ Express       | ✅ PostgreSQL    | Gratis*     |
| [**Supabase**](https://supabase.com)          | ❌               | ❌               | ✅ PostgreSQL    | Gratis      |
| [**Fly.io**](https://fly.io)                  | ✅               | ✅               | ✅ PostgreSQL    | Gratis*     |

> \* Gratis dengan batasan tertentu

#### Contoh Deploy ke Railway (Paling Mudah)

1. Buka [railway.app](https://railway.app) dan login dengan GitHub
2. Klik **"New Project"** → **"Deploy from GitHub repo"**
3. Pilih repository `arvadf/tracer`
4. Railway akan otomatis mendeteksi dan deploy
5. Tambahkan **PostgreSQL** database dari dashboard Railway
6. Set environment variables di dashboard
7. Selesai! Aplikasi Anda sudah online 🚀

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Public

| Method | Endpoint             | Deskripsi                  |
| ------ | -------------------- | -------------------------- |
| GET    | `/health`            | Health check               |
| GET    | `/alumni/search`     | Cari alumni                |
| POST   | `/auth/google`       | Login via Google           |
| POST   | `/alumni/survey`     | Submit survei              |

### Admin (Memerlukan Session Auth)

| Method | Endpoint                  | Deskripsi                     |
| ------ | ------------------------- | ----------------------------- |
| POST   | `/admin/auth/login`       | Login admin                   |
| POST   | `/admin/auth/logout`      | Logout admin                  |
| GET    | `/admin/alumni`           | List semua alumni             |
| POST   | `/admin/alumni`           | Tambah alumni baru            |
| PUT    | `/admin/alumni/:id`       | Update data alumni            |
| DELETE | `/admin/alumni/:id`       | Hapus alumni                  |
| POST   | `/admin/alumni/import`    | Import alumni dari Excel      |
| GET    | `/admin/surveys`          | List semua survei             |
| GET    | `/admin/surveys/:id`      | Detail survei                 |
| GET    | `/admin/dashboard`        | Data dashboard & statistik    |
| GET    | `/admin/dashboard/export` | Export data dashboard (Excel) |

---

## 🔧 Troubleshooting

### Error: `ECONNREFUSED` saat koneksi database

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solusi:** Pastikan PostgreSQL sudah berjalan:

```bash
# Windows
net start postgresql-x64-15

# Linux
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Error: `npm install` gagal

```bash
# Hapus cache dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Error: Port sudah digunakan

```bash
# Cari proses yang menggunakan port 3000 atau 5000
# Windows
netstat -ano | findstr :5000

# Linux
lsof -i :5000
kill -9 <PID>
```

### Error: `permission denied` saat akses database

Pastikan user PostgreSQL memiliki akses ke database:

```sql
GRANT ALL PRIVILEGES ON DATABASE tracer TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan internal **FKIP Universitas Muhammadiyah Surakarta**.

---

<p align="center">
  Dibuat dengan ❤️ untuk FKIP UMS
</p>
