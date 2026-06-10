# Court Report Job API

Backend API untuk manajemen pekerjaan court reporting menggunakan Express, PostgreSQL, dan Prisma.

## Skema PostgreSQL

### users
- `id` UUID primary key
- `name` string
- `role` enum `REPORTER | EDITOR`
- `city` string nullable
- `is_available` boolean

### jobs
- `id` UUID primary key
- `case_name` string
- `duration_minutes` integer
- `location_type` enum `PHYSICAL | REMOTE`
- `city` string nullable, wajib untuk `PHYSICAL`
- `status` enum `NEW | ASSIGNED | TRANSCRIBED | REVIEWED | COMPLETED`
- `reporter_id` UUID nullable, foreign key ke `users.id`
- `editor_id` UUID nullable, foreign key ke `users.id`
- `created_at` timestamp

## Endpoint API

### Job Management
- `POST /api/jobs`
- `GET /api/jobs`
- `PATCH /api/jobs/:id/status`

### Assignment
- `GET /api/users?role=REPORTER&available=true&job_id=<job_uuid>`
- `POST /api/users`
- `POST /api/jobs/:id/assign`

### Payment
- `GET /api/jobs/:id/payment`

### Utility
- `GET /api/health`

## Contoh Payload

### Buat job
```json
{
  "caseName": "State vs Doe",
  "durationMinutes": 90,
  "locationType": "PHYSICAL",
  "city": "Jakarta",
  "status": "NEW"
}
```

### Assign user ke job
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440010",
  "role_type": "REPORTER"
}
```

### Buat user
```json
{
  "name": "Ayu",
  "role": "REPORTER",
  "city": "Jakarta",
  "isAvailable": true
}
```

### Update status job
```json
{
  "status": "ASSIGNED"
}
```

## Aturan Bisnis
- Job `PHYSICAL` wajib memiliki `city`.
- Job `REMOTE` tidak boleh memiliki `city`.
- Reporter yang di-assign harus ber-role `REPORTER`, tersedia, dan untuk job `PHYSICAL` harus berasal dari kota yang sama.
- Editor yang di-assign harus ber-role `EDITOR` dan tersedia.
- Transisi status harus berurutan: `NEW -> ASSIGNED -> TRANSCRIBED -> REVIEWED -> COMPLETED`.
- Job tidak boleh masuk ke `ASSIGNED` jika `reporter_id` belum terisi.
- Endpoint daftar reporter akan mengurutkan reporter satu kota di urutan teratas bila `job_id` mengarah ke job `PHYSICAL`.
- Payment dihitung dengan rumus:
  - `reporter_payout = duration_minutes * 2000`
  - `editor_payout = EDITOR_FLAT_FEE`
  - `total_cost = reporter_payout + editor_payout`

## Menjalankan Proyek
1. Install dependensi:
   ```bash
   yarn install
   ```
2. Salin environment:
   ```bash
   cp .env.example .env
   ```
3. Siapkan PostgreSQL lokal atau remote dan isi `DATABASE_URL`.
4. Generate Prisma Client:
   ```bash
   yarn prisma:generate
   ```
5. Jalankan migrasi database:
   ```bash
   yarn prisma:migrate:dev --name init
   ```
6. Jalankan server:
   ```bash
   yarn dev
   ```

## Migrasi Data dari Appwrite
1. Isi variabel `APPWRITE_*` di `.env`.
2. Ekspor data jobs dari Appwrite:
   ```bash
   yarn migrate:appwrite:export
   ```
3. Impor hasil transformasi ke PostgreSQL:
   ```bash
   yarn migrate:appwrite:import
   ```
