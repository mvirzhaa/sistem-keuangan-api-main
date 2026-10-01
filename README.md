# Sistem Keuangan API (Backend)

API backend untuk Sistem Keuangan UIKA menggunakan Express.js, TypeScript, PostgreSQL, dan Prisma ORM.

---

## 📋 Prasyarat
- **Node.js**: v18+ (disarankan v20+)
- **PostgreSQL**: v14+ (sudah berjalan secara lokal di port 5432)
- Database PostgreSQL baru dibuat, misalnya bernama `sistem_keuangan`

---

## 🚀 Panduan Setup Lokal

### 1. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env` (atau edit file `.env` yang sudah disiapkan):
```bash
cp .env.example .env
```

Pastikan variabel berikut sesuai dengan konfigurasi PostgreSQL lokal Anda:
```env
PORT=3000
NODE_ENV=development

# Sesuaikan user, password, dan nama database:
DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/sistem_keuangan?schema=public"

# Kunci rahasia JWT
JWT_SECRET="sistem-keuangan-uika-secret-key-development-2026"

# Kredensial Super Admin awal
SUPERADMIN_EMAIL="admin@uika-bogor.ac.id"
SUPERADMIN_PASSWORD="Password123!"
SUPERADMIN_NAME="Super Admin Keuangan"
```

---

### 2. Install Dependensi
```bash
npm install
```

---

### 3. Generate Prisma Client & Sinkronisasi Database
Jalankan migrasi / sinkronisasi schema Prisma ke database PostgreSQL:
```bash
# Push schema tabel ke PostgreSQL
npx prisma db push

# Generate client Prisma
npm run prisma:generate
```

---

### 4. Seed Data Awal & Buat Akun Pengguna
Jalankan seeder untuk mengisi data referensi dasar (Jenis Transaksi, Kelompok, Unit Kerja, dsb.):
```bash
npm run db:seed
```

Buat akun untuk **semua role yang tersedia**:
```bash
npm run seed:users
```
*(Atau gunakan `npm run create-superadmin` jika hanya ingin membuat 1 akun Super Admin dari konfigurasi `.env`).*

---

### 5. Generate Dokumentasi Swagger
```bash
npm run generate:swagger
```

---

### 6. Menjalankan Server Development
```bash
npm run dev
```

Server akan aktif di:
- **API Base URL**: `http://localhost:3000/api`
- **Swagger Documentation Hub**: `http://localhost:3000/api-docs`
- **All Modules Docs**: `http://localhost:3000/api-docs/all`

---

## 👥 Daftar Akun untuk Setiap Role
Semua akun dibuat dengan password default: `Password123!`

| Role | Email | Nama | Password |
|---|---|---|---|
| `SUPER_ADMIN` | `superadmin@uika-bogor.ac.id` | Super Admin | `Password123!` |
| `ADMIN_KEUANGAN` | `admin.keuangan@uika-bogor.ac.id` | Admin Keuangan | `Password123!` |
| `OPERATOR_KEUANGAN` | `operator.keuangan@uika-bogor.ac.id` | Operator Keuangan | `Password123!` |
| `KASUBAG_KEUANGAN` | `kasubag.keuangan@uika-bogor.ac.id` | Kasubag Keuangan | `Password123!` |
| `KEPALA_TU_FAKULTAS` | `kepala.tu@uika-bogor.ac.id` | Kepala TU Fakultas | `Password123!` |
| `WAKIL_DEKAN_2` | `wadek2@uika-bogor.ac.id` | Wakil Dekan 2 | `Password123!` |
| `WAKIL_REKTOR_2` | `warek2@uika-bogor.ac.id` | Wakil Rektor 2 | `Password123!` |
| `REKTOR` | `rektor@uika-bogor.ac.id` | Rektor UIKA | `Password123!` |

*(Catatan: Akun `admin@uika-bogor.ac.id` dari create-superadmin juga tetap tersedia jika sebelumnya sudah dibuat).*

---

## 📜 Daftar Script Penting
| Command | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server backend mode watch/development |
| `npm run build` | Compile TypeScript dan Prisma client ke folder `dist` |
| `npm start` | Menjalankan aplikasi hasil build produksi |
| `npm run db:seed` | Mengisi data referensi dasar ke database |
| `npm run seed:users` | Membuat/seeding akun untuk semua 8 role |
| `npm run create-superadmin` | Membuat user Super Admin baru dari konfigurasi `.env` |
| `npm run generate:swagger` | Generate modul-modul Swagger dan navigasi |

