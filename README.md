# Bliyo

Platform generate link affiliate dan bagi komisi, tahap piloting.

Lokal dijalankan dengan Node.js, tanpa Docker. Docker Compose hanya untuk VPS. Nginx di host yang mengurus HTTPS. Web mendengarkan `127.0.0.1:13003` dan API mendengarkan `127.0.0.1:13004`.

## Menjalankan secara lokal

PostgreSQL harus sudah terpasang di mesin ini. Redis dipakai antrian komisi. Kalau Redis belum ada, biarkan `REDIS_ENABLED=false` di `apps/api/.env`. Di VPS Redis nyala bersama Compose, jadi variabel itu tidak perlu diisi.

1. Buat database `bliyo`, lalu salin environment.

```bash
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
```

`JWT_SECRET` di kedua file harus sama. `DATABASE_URL` mengarah ke Postgres lokal.

2. Install, migrate, dan buat akun superadmin.

```bash
npm install
npm run prisma:deploy
npm run prisma:seed
```

3. Jalankan API dan web.

```bash
npm run dev
```

Buka http://localhost:13003. API ada di http://localhost:13004. Kedua port ini sama dengan port host di VPS.

Akun awal memakai `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` di `apps/api/.env`. Ganti kata sandi itu sebelum dipakai di server. Role superadmin masuk ke `/admin`. User Google baru otomatis menjadi member.

## Deploy VPS

Pola yang sama dengan DealHub: push ke `main` menjalankan GitHub Actions, SSH ke VPS, lalu `docker compose up -d --build`.

### Sekali di VPS

```bash
sudo mkdir -p /apps
sudo chown $USER:$USER /apps
git clone <repo-bliyo> /apps/Bliyo
cd /apps/Bliyo
cp .env.example .env
# Edit .env: JWT_SECRET, DOMAIN, APP_HOST_PORT (default 13003), akun seed
docker compose up -d --build
docker compose run --rm migrate npx prisma db seed
```

Arahkan DNS ke VPS, lalu nginx host dan sertifikat:

```bash
sudo cp deploy/nginx-bliyo.conf.example /etc/nginx/sites-available/bliyo
# Ubah server_name. Ubah proxy_pass hanya jika APP_HOST_PORT bukan 13003
sudo ln -s /etc/nginx/sites-available/bliyo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d bliyo.teknodika.com
```

User deploy harus bisa menjalankan Docker tanpa `sudo` (grup `docker`) dan `git pull` di `/apps/Bliyo`.

Port `13003` kosong di mesin pengembangan ini, jadi itu yang dipakai sebagai port host. Postgres dan Redis tidak dibuka ke host. Nginx meneruskan semua traffic ke `127.0.0.1:13003`. Next.js meneruskan jalur `/api` ke container API.

### Secret GitHub

| Secret | Contoh | Wajib |
|--------|---------|-------|
| `VPS_HOST` | IP VPS | Ya |
| `VPS_USER` | `ubuntu` | Ya |
| `VPS_SSH_KEY` | Private key PEM | Ya |
| `VPS_PORT` | `22` | Tidak |
| `VPS_APP_DIR` | `/apps/Bliyo` | Tidak (default ini) |

File `.env` tetap di server. Deploy tidak menimpanya.

Deploy manual:

```bash
cd /apps/Bliyo
bash deploy/git-sync.sh
bash deploy/docker-deploy.sh
```

## Environment di VPS

Hanya rahasia dan konfigurasi deploy. Lihat `.env.example`.

| Variabel | Fungsi |
|---|---|
| `APP_HOST_PORT` | Port host aplikasi, default `13003`, bind `127.0.0.1` |
| `DOMAIN` | Hostname publik, untuk cek HTTPS dan URL Google |
| `JWT_SECRET` | Rahasia token login |
| `GOOGLE_CLIENT_ID` | Client Google OAuth, boleh kosong saat piloting |
| `GOOGLE_CLIENT_SECRET` | Secret Google OAuth |
| `GOOGLE_CALLBACK_URL` | `https://DOMAIN/api/auth/google/callback` |
| `SEED_ADMIN_EMAIL` | Email superadmin untuk seed pertama |
| `SEED_ADMIN_PASSWORD` | Kata sandi superadmin untuk seed pertama |

`DATABASE_URL` di dalam Compose mengarah ke service `db`, bukan ke env file.
