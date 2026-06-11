# Court Report Job API

Backend API for court reporting job management using Express, PostgreSQL, and Prisma.

## Solution Overview

- Manages `jobs` and `users` (Reporter/Editor) with Zod validation and business rules in the service layer.
- Enforces sequential workflow status: `NEW -> ASSIGNED -> TRANSCRIBED -> REVIEWED -> COMPLETED`.
- Supports personnel assignment (including city rules for `PHYSICAL` jobs) and payout calculation via a payment endpoint.

## Quickstart

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Create environment file:
   ```bash
   cp .env.example .env
   ```
3. Fill in `DATABASE_URL` (PostgreSQL).
4. Generate Prisma Client and run migrations:
   ```bash
   yarn prisma:generate
   yarn prisma:migrate:dev --name init
   ```
5. Start the server:
   ```bash
   yarn dev
   ```

### Key Configuration

- Server port: `PORT` (default `3000`)
- Editor flat fee: `EDITOR_FLAT_FEE` (default `50000`)
- Health check: `GET /api/health`

## PostgreSQL Schema

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
- `city` string nullable, required for `PHYSICAL`
- `status` enum `NEW | ASSIGNED | TRANSCRIBED | REVIEWED | COMPLETED`
- `reporter_id` UUID nullable, foreign key ke `users.id`
- `editor_id` UUID nullable, foreign key ke `users.id`
- `created_at` timestamp

## API Endpoints

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

## Example Payloads

### Create a job

```json
{
  "caseName": "State vs Doe",
  "durationMinutes": 90,
  "locationType": "PHYSICAL",
  "city": "Jakarta",
  "status": "NEW"
}
```

### Assign a user to a job

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440010",
  "role_type": "REPORTER"
}
```

### Create a user

```json
{
  "name": "Ayu",
  "role": "REPORTER",
  "city": "Jakarta",
  "isAvailable": true
}
```

### Update job status

```json
{
  "status": "ASSIGNED"
}
```

## Business Rules

- `PHYSICAL` jobs must have `city`.
- `REMOTE` jobs must not have `city`.
- Assigned reporters must have role `REPORTER`, be available, and for `PHYSICAL` jobs must match the job city.
- Assigned editors must have role `EDITOR` and be available.
- Status transitions must be sequential: `NEW -> ASSIGNED -> TRANSCRIBED -> REVIEWED -> COMPLETED`.
- A job cannot transition to `ASSIGNED` unless `reporter_id` is already set.
- Reporter listing sorts same-city reporters to the top when `job_id` points to a `PHYSICAL` job.
- Payment formula:
  - `reporter_payout = duration_minutes * 2000`
  - `editor_payout = EDITOR_FLAT_FEE`
  - `total_cost = reporter_payout + editor_payout`

## Running Locally

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Copy environment:
   ```bash
   cp .env.example .env
   ```
3. Prepare PostgreSQL and set `DATABASE_URL`.
4. Generate Prisma Client:
   ```bash
   yarn prisma:generate
   ```
5. Run database migrations:
   ```bash
   yarn prisma:migrate:dev --name init
   ```
6. Start the server:
   ```bash
   yarn dev
   ```
   