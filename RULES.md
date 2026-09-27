# Bliyo — Project Rules untuk Cursor

Simpan isi file ini sebagai `.cursorrules` di root project (atau `.cursor/rules/bliyo.mdc` kalau pakai Cursor versi baru), supaya aturan ini otomatis dipatuhi di setiap sesi Cursor.

## Prinsip Umum

- Ini adalah proyek tahap piloting (50 sampai 100 user), dijalankan di VPS 2GB RAM / 2 core. Jangan over-engineer: tidak perlu microservices, tidak perlu Kubernetes, tidak perlu message broker terpisah selain Redis/BullMQ yang sudah ditentukan.
- Struktur kode harus modular per domain supaya mudah dipecah jadi service terpisah nanti kalau scale naik, tapi untuk sekarang tetap satu monolith.
- Semua konfigurasi lewat environment variable, jangan hardcode connection string, secret, atau URL.

## Stack yang Wajib Dipakai

- Backend: NestJS + TypeScript + Prisma + PostgreSQL + Redis + BullMQ
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Auth: JWT untuk session, Passport strategy untuk login email/password dan Google OAuth2
- Font: Manrope untuk seluruh teks di web, load dari Google Fonts

## Aturan Desain Visual (WAJIB)

Tema warna: hijau tua sebagai warna utama, dengan aksen wave dua warna hijau (gelap dan sedang), serta putih sebagai warna netral. Jangan menambah warna lain di luar palet ini kecuali untuk status semantik (misalnya merah untuk error, kuning untuk warning) dan itu pun dipakai seminimal mungkin.

Palet warna acuan:
- Hijau gelap (primary): `#0e3d23`
- Hijau sedang (wave/aksen): `#1a6b3f`
- Hijau terang (aksen tombol/highlight): `#1f8a4c`
- Hijau sangat muda (background section): `#e7f3ec`
- Putih: `#ffffff`
- Teks utama: `#16241c`
- Teks sekunder: `#5c6b62`
- Border: `#dfe8e2`

Larangan (tidak boleh dilanggar):

1. Jangan gunakan tanda pisah ganda (dua tanda hubung berurutan) di dalam teks/copy yang tampil ke user. Kalau butuh pemisah, gunakan koma, titik, atau kata penghubung biasa.
2. Jangan gunakan gradient warna-warni generik ala AI (ungu-ke-pink, biru-ke-cyan, dan sejenisnya). Warna harus flat/solid sesuai palet di atas. Wave background boleh dibuat dari dua warna hijau solid yang di-layer, bukan gradient.
3. Jangan gunakan "chip" atau badge membulat berwarna-warni yang tidak perlu untuk menandai status jika belum ada kebutuhan fungsional yang jelas. Kalau perlu badge status, pakai bentuk sederhana dengan outline, bukan filled berwarna mencolok.
4. Jangan gunakan icon set generic bergaya AI (icon 3D, icon gradient, emoji sebagai pengganti icon UI). Kalau butuh icon, gunakan SVG line icon sederhana dengan warna dari palet di atas, atau tidak usah pakai icon sama sekali kalau teks sudah cukup jelas.
5. Jangan gunakan bayangan (shadow) yang berlebihan atau efek glassmorphism. Elevasi cukup dengan border tipis (`1px solid #dfe8e2`) dan sedikit shadow halus kalau benar-benar perlu.
6. Sudut (border-radius) konsisten, gunakan sekitar 8 sampai 14px untuk card dan input, jangan campur aduk antar komponen.
7. Semua komponen harus dites tampil rapi di desktop dan mobile web (tidak perlu native app), pakai layout responsive standar (flexbox/grid), bukan breakpoint yang berantakan.

## Aturan Komponen

- Tombol utama (primary button): background hijau gelap `#0e3d23`, teks putih, border-radius sekitar 9px, tanpa gradient.
- Tombol Google login: hanya icon Google resmi tanpa teks, dengan border tipis, bentuk kotak dengan sudut membulat.
- Input text: border tipis `#dfe8e2`, berubah warna border jadi hijau terang saat fokus, tanpa efek glow berlebihan.
- Halaman yang belum ada detail spesifikasi (seperti Register, User Management, Settings) wajib dibuat sebagai halaman dummy dengan label jelas "Under Development", bukan dikosongkan begitu saja atau diisi konten karangan.
- Chart lingkaran (donut/pie) dibuat dengan SVG native atau library ringan, warnanya dari palet hijau di atas, tanpa animasi berlebihan.

## Aturan Kode

- Penamaan file dan folder konsisten: kebab-case untuk folder, PascalCase untuk komponen React, camelCase untuk fungsi dan variabel.
- Setiap module NestJS punya struktur: controller, service, module, dto, entity/repository jelas terpisah.
- Query Prisma tidak boleh N+1, gunakan `include`/`select` secukupnya.
- Semua endpoint API yang butuh autentikasi wajib pakai guard, jangan cek role manual di controller tanpa guard.
- Tulis komentar seperlunya, hindari komentar yang menjelaskan hal yang sudah jelas dari nama variabel/fungsi.

## Struktur Folder (acuan)

```
bliyo/
  apps/
    api/          -> NestJS backend
    web/          -> Next.js frontend
  docker-compose.yml
  RULES.md
  README.md
```
