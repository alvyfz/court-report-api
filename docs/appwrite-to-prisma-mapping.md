# Mapping Appwrite ke Prisma/PostgreSQL

## Ringkasan
Migrasi dilakukan dari koleksi Appwrite `jobs` ke tabel PostgreSQL `jobs`, dengan normalisasi tambahan ke tabel `users` untuk relasi `reporter_id` dan `editor_id`.

## Mapping Koleksi Jobs
| Appwrite | PostgreSQL / Prisma | Catatan |
| --- | --- | --- |
| `$id` | tidak dipakai sebagai PK target | Target memakai UUID PostgreSQL baru |
| `case_name` / `caseName` | `jobs.case_name` | Nama perkara |
| `duration_minutes` / `durationMinutes` | `jobs.duration_minutes` | Integer |
| `location_type` / `locationType` | `jobs.location_type` | Enum `PHYSICAL` / `REMOTE` |
| `city` | `jobs.city` | Null untuk `REMOTE` |
| `status` | `jobs.status` | Enum uppercase |
| `reporter_id` / `reporterId` | `jobs.reporter_id` | Direlasikan ke `users.id` baru |
| `editor_id` / `editorId` | `jobs.editor_id` | Direlasikan ke `users.id` baru |
| `created_at` / `createdAt` | `jobs.created_at` | Dikonversi ke timestamp |

## Mapping User
Karena sumber Appwrite yang aktif di proyek hanya menyimpan referensi reporter/editor pada job, skrip impor membuat record `users` placeholder saat dibutuhkan:
- `role = REPORTER` untuk `reporter_id`
- `role = EDITOR` untuk `editor_id`
- `name` dibangkitkan sementara dari legacy id
- `city` reporter diisi dari kota job fisik bila tersedia

## Transformasi Penting
- ID Appwrite tidak diasumsikan UUID, sehingga ID target dibangkitkan ulang oleh PostgreSQL.
- Status yang tidak dikenal difallback ke `NEW`.
- `location_type` yang tidak dikenal difallback ke `REMOTE`.
- Relasi user dijaga melalui pemetaan legacy id ke UUID target saat proses impor.

## Validasi Pasca Migrasi
- Bandingkan jumlah dokumen hasil ekspor dengan jumlah record hasil impor.
- Verifikasi distribusi status job.
- Verifikasi job `PHYSICAL` selalu memiliki `city`.
- Verifikasi reporter/editor yang direlasikan memiliki role yang benar.
