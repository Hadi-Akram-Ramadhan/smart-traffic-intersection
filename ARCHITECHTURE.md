# Arsitektur Project Next.js (App Router)

Dokumen ini menjelaskan struktur folder standar untuk project Next.js modern menggunakan **App Router** (Next.js 13+), lengkap dengan fungsi masing-masing folder dan file.

---

## Struktur Folder Lengkap

```
my-nextjs-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (main)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── route.ts
│   │   │   └── users/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── loading.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── shared/
│   │       └── LoadingSpinner.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   └── product/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types.ts
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── validators.ts
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   └── userService.ts
│   │
│   ├── store/
│   │   ├── userStore.ts
│   │   └── cartStore.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   └── api.ts
│   │
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── config/
│   │   ├── site.ts
│   │   └── env.ts
│   │
│   └── middleware.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── .env.local
├── .env.example
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Penjelasan Fungsi Setiap Folder

### 1. `src/app/` — Routing & Halaman (App Router)
Folder inti Next.js 13+ yang menggunakan **file-based routing**. Setiap folder di dalamnya merepresentasikan sebuah route/URL.

- **`(auth)/` dan `(main)/`** — *Route Groups*. Tanda kurung `()` membuat folder ini tidak muncul di URL, hanya digunakan untuk mengelompokkan route yang punya layout atau logika berbeda (misalnya halaman auth vs halaman utama).
- **`api/`** — Berisi **Route Handlers** (`route.ts`) untuk membuat REST API endpoint langsung di dalam Next.js (backend serverless).
- **`layout.tsx`** — Layout bersama (navbar, footer, dll) yang membungkus semua halaman di level tersebut.
- **`page.tsx`** — Komponen halaman yang dirender untuk sebuah route.
- **`loading.tsx`** — UI loading otomatis (Suspense boundary) saat halaman/data sedang dimuat.
- **`error.tsx`** — UI fallback otomatis saat terjadi error di route tersebut.
- **`not-found.tsx`** — Halaman 404 khusus.
- **`globals.css`** — Style global aplikasi.

### 2. `src/components/` — Komponen UI Reusable
Kumpulan komponen yang dipakai berulang di banyak halaman.

- **`ui/`** — Komponen dasar/atomic (Button, Input, Modal) yang tidak punya logika bisnis, murni tampilan.
- **`layout/`** — Komponen struktural seperti Navbar, Sidebar, Footer.
- **`shared/`** — Komponen kecil yang dipakai lintas fitur (spinner, badge, dll).

### 3. `src/features/` — Modul per Fitur (Feature-based)
Alternatif dari pendekatan "per tipe file", di sini kode dikelompokkan **per fitur bisnis** (auth, product, cart, dll), masing-masing punya komponen, hooks, service, dan types sendiri. Cocok untuk project besar agar mudah di-scale dan tidak saling tercampur.

### 4. `src/lib/` — Konfigurasi & Utilitas Inti
Berisi setup library pihak ketiga dan helper inti, contoh: koneksi database (`db.ts`), konfigurasi autentikasi (`auth.ts`), skema validasi (`validators.ts` — biasanya pakai Zod/Yup).

### 5. `src/hooks/` — Custom React Hooks
Hooks yang dipakai lintas komponen/fitur, misalnya `useDebounce`, `useLocalStorage`, `useFetch`.

### 6. `src/services/` — Layer Komunikasi API
Fungsi-fungsi yang menangani pemanggilan API (fetch/axios) ke backend eksternal atau ke `api/` internal, memisahkan logika network dari komponen UI.

### 7. `src/store/` — State Management Global
Berisi store untuk state management (Zustand, Redux, Jotai, dll) yang dipakai lintas komponen, misalnya data user yang sedang login atau isi keranjang belanja.

### 8. `src/types/` — TypeScript Type Definitions
Kumpulan interface/type global yang dipakai di banyak tempat, agar konsisten dan tidak duplikasi.

### 9. `src/utils/` — Fungsi Utilitas Murni (Pure Functions)
Fungsi bantu kecil tanpa side effect: format tanggal, konstanta aplikasi, fungsi perhitungan, dll.

### 10. `src/config/` — Konfigurasi Aplikasi
Pengaturan aplikasi seperti metadata situs (`site.ts`) atau validasi environment variable (`env.ts`).

### 11. `src/middleware.ts`
File khusus Next.js yang berjalan **sebelum request selesai diproses**, umum dipakai untuk autentikasi, redirect, atau modifikasi header di edge runtime.

### 12. `public/`
Folder untuk aset statis yang bisa diakses langsung via URL (gambar, ikon, font, favicon). Tidak melalui proses build seperti file di `src/`.

### 13. `prisma/` (opsional)
Jika menggunakan Prisma ORM: `schema.prisma` mendefinisikan model database, dan `migrations/` menyimpan riwayat perubahan skema database.

### 14. `tests/`
Berisi file pengujian aplikasi, dipisah menjadi:
- **`unit/`** — Unit test untuk fungsi/komponen individual.
- **`e2e/`** — End-to-end test yang mensimulasikan alur pengguna sungguhan.

### 15. File Konfigurasi di Root

| File | Fungsi |
|---|---|
| `.env.local` / `.env.example` | Menyimpan environment variable (API key, DB URL, dll). `.env.local` tidak di-commit, `.env.example` sebagai template. |
| `.eslintrc.json` | Aturan linting kode agar konsisten. |
| `.gitignore` | Daftar file/folder yang diabaikan Git. |
| `next.config.js` | Konfigurasi khusus Next.js (redirect, image domain, dll). |
| `tailwind.config.ts` | Konfigurasi Tailwind CSS (jika dipakai). |
| `tsconfig.json` | Konfigurasi TypeScript. |
| `package.json` | Daftar dependency dan script project. |
| `README.md` | Dokumentasi project. |

---

## Prinsip Umum di Balik Struktur Ini

1. **Separation of Concerns** — UI (`components`), logika bisnis (`features`, `services`), dan data (`store`, `lib`) dipisah agar mudah dipelihara.
2. **Colocation per Fitur** — Pendekatan `features/` membuat kode yang saling terkait berada berdekatan, memudahkan navigasi saat project membesar.
3. **Skalabilitas** — Struktur ini bisa berkembang dari project kecil ke besar tanpa perlu merombak total.
4. **Konsistensi dengan Konvensi Next.js** — Nama file seperti `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx` mengikuti konvensi App Router agar fitur bawaan Next.js (streaming, error boundary, dll) berjalan otomatis.

> Catatan: Struktur ini bersifat rekomendasi umum. Untuk project kecil, folder `features/` bisa dihilangkan dan cukup menggunakan `components/`, `services/`, serta `hooks/` di level atas.