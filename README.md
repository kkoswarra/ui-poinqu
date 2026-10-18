# Poinqu Admin Panel

Konsol admin **Poinqu** berbasis Next.js App Router, React, dan TypeScript.
Semua data operasional diambil dari API admin FastAPI
(`poinqu-backend`), bukan lagi data statis.

## Halaman

| Route | Fungsi | Izin |
|---|---|---|
| `/login` | Login password + TOTP 2FA, ganti password, aktivasi 2FA | publik |
| `/dashboard` | Ringkasan admin, status API, audit terbaru, antrean pemulihan | — |
| `/dashboard/users` | Cari pengguna (nama/nomor), filter status & level | `users.read` |
| `/dashboard/recovery` | Antrean pemulihan nomor + keputusan approve/reject | `recovery.review` |
| `/dashboard/admins` | Daftar, buat, ubah peran/status admin | `admin.read` / `admin.write` |
| `/dashboard/roles` | Peran dan daftar izin | `admin.read` |
| `/dashboard/settings` | Pengaturan berversi + edit dengan alasan | `settings.read` / `settings.write` |
| `/dashboard/audit` | Audit log dengan filter dan detail before/after | `audit.read` |

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

`NEXT_PUBLIC_API_BASE_URL` menentukan backend:

```dotenv
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://poinqu-backend.vercel.app
# atau backend lokal:
# NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Backend harus mengizinkan origin panel di `CORS_ORIGINS`
(`http://localhost:3000` untuk dev).

Perintah lain:

```bash
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

## Alur login

1. `POST /v1/admin/auth/login` dengan email + password → `challenge_token`
   dan `next_step`.
2. `next_step` menentukan langkah berikut:
   - `CHANGE_PASSWORD` → form ganti password (wajib sebelum 2FA).
   - `SETUP_2FA` → `POST /admin/auth/2fa/setup`, tampilkan secret/otpauth,
     lalu `POST /admin/auth/2fa/enable` untuk mengaktifkan dan menerbitkan token.
   - `VERIFY_2FA` → `POST /admin/auth/2fa/verify`.
3. Access token disimpan di `localStorage`; refresh token dirotasi otomatis
   lewat `POST /v1/admin/auth/token/refresh` saat menerima 401.
4. Sesi tidak valid → `localStorage` dibersihkan dan diarahkan ke `/login`.

## API yang dipakai

| Endpoint | Dipakai di |
|---|---|
| `POST /v1/admin/auth/login` | Login |
| `POST /v1/admin/auth/password/change` | Ganti password |
| `POST /v1/admin/auth/2fa/setup` / `enable` / `verify` | 2FA |
| `POST /v1/admin/auth/token/refresh` | Rotasi sesi |
| `POST /v1/admin/auth/logout` | Sign out |
| `GET /v1/admin/me` | Guard sesi + profil |
| `GET/POST/PATCH /v1/admin/admins` | Kelola admin |
| `GET /v1/admin/roles` | Peran & izin |
| `GET /v1/admin/settings`, `PUT /v1/admin/settings/{key}` | Pengaturan |
| `GET /v1/admin/users` | Pencarian pengguna |
| `GET /v1/admin/recovery-requests`, `POST .../{id}/decision` | Pemulihan nomor |
| `GET /v1/admin/audit-logs` | Audit log |
| `GET /health` | Status API di ringkasan |

## Struktur

```
app/
  page.tsx                       # redirect ke /dashboard
  login/page.tsx                 # halaman login
  dashboard/layout.tsx           # shell admin + guard sesi
  dashboard/page.tsx             # ringkasan
  dashboard/users|recovery|admins|roles|settings|audit/page.tsx
components/
  admin/
    AdminSessionProvider.tsx     # profil, izin, sign out, event 401
    AdminShell.tsx               # sidebar, topbar, account modal
    *Page.tsx                    # halaman admin
    PageHeader.tsx, CursorPager.tsx
  auth/LoginPage.tsx             # login + 2FA + ganti password
  ui/                            # UI kit (Button, Card, Table, Modal, Toast, ...)
lib/
  admin-api.ts                   # fetch, envelope, refresh token, ApiError
  admin-session.ts               # localStorage token/profil
  admin-types.ts                 # tipe kontrak API admin
  format.ts                      # tanggal, rupiah, JSON
```

## Catatan

- Token admin disimpan di `localStorage`. Untuk hardening produksi,
  pertimbangkan cookie `HttpOnly` lewat route handler/proxy Next.js.
- `NEXT_PUBLIC_API_BASE_URL` ikut ter-bundle ke browser; jangan isi secret.
- Panel ini memakai izin dari `/v1/admin/me`; menu yang tidak diizinkan
  disembunyikan dan API tetap menolak akses langsung.
- Edit pengaturan memakai optimistic concurrency (`version`) dan menyimpan
  alasan; konflik versi ditampilkan dan data dimuat ulang.
- Aksi tulis (buat/ubah admin, keputusan pemulihan, ubah setting) belum
  dijalankan pada data produksi saat pengembangan; endpoint-nya sudah
  terhubung dan tipe responsnya sesuai backend.
- Halaman lama (showcase/support dashboard) masih ada di repo tetapi tidak
  lagi dipakai oleh route aktif.
