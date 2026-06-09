# Job Management API Template

Starter backend API yang sudah dibersihkan untuk kebutuhan manajemen pekerjaan dengan Express, TypeScript, dan Appwrite.

## Endpoint

- `POST /api/jobs` untuk membuat pekerjaan baru
- `GET /api/jobs` untuk mengambil daftar pekerjaan
- `GET /api/jobs?status=pending|in_progress|completed` untuk filter berdasarkan status
- `PATCH /api/jobs/:id/status` untuk memperbarui status pekerjaan
- `GET /api/health` untuk health check

## Struktur Proyek

- `src/app.ts` inisialisasi Express dan registrasi route
- `src/index.ts` entrypoint server lokal
- `src/routes/jobsRoutes.ts` definisi route API jobs
- `src/controller/jobsController.ts` validasi request dan respons HTTP
- `src/services/jobsService.ts` logika bisnis dan akses Appwrite Database
- `src/models/job.model.ts` tipe data dan skema validasi Zod
- `src/config/appwrite.ts` konfigurasi koneksi Appwrite
- `src/middleware/errorHandler.ts` penanganan error terpusat
- `__tests__/jobs.test.ts` verifikasi endpoint utama

## Menjalankan Proyek

1. Install dependensi:
   ```bash
   yarn install
   ```
2. Salin file environment:
   ```bash
   cp .env.example .env
   ```
3. Isi konfigurasi Appwrite di file `.env`.
4. Jalankan server development:
   ```bash
   yarn dev
   ```

## Variabel Environment

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_JOBS_COLLECTION_ID`
- `PORT`
- `NODE_ENV`

## Catatan Koleksi Appwrite

Buat koleksi `jobs` atau koleksi lain sesuai nilai `APPWRITE_JOBS_COLLECTION_ID` dengan field berikut:

- `title` string, wajib
- `description` string, opsional
- `status` enum/string dengan nilai `pending`, `in_progress`, `completed`
