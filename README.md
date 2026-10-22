# Poinqu UI Kit

Design system **Poinqu** berbasis Next.js App Router, React, dan TypeScript.
Repositori ini sekarang hanya berisi halaman showcase komponen beserta
komponen UI yang bisa dipakai ulang. Semua halaman admin, login, dan integrasi
API sudah dihapus.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Halaman utama (`/`) langsung menampilkan
showcase komponen. Sidebar di halaman tersebut memuat daftar komponen dan
bisa dipakai untuk melompat ke bagian terkait.

Perintah lain:

```bash
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

## Struktur

```
app/
  layout.tsx                     # root layout + ToastProvider + font + ikon
  page.tsx                       # satu-satunya route: showcase komponen
  globals.css                    # design token, reset, scrollbar
components/
  showcase/ComponentShowcase.tsx # galeri semua komponen
  sidebar/Sidebar.tsx            # navigasi daftar komponen
  topbar/Topbar.tsx              # breadcrumb + aksi topbar
  ui/                            # UI kit (Button, Card, Table, Modal, ...)
lib/
  data.ts                        # tipe dan data demo untuk showcase
types/
  iconify.d.ts                   # tipe elemen <iconify-icon>
docs/
  admin-template.html            # referensi desain/prototipe awal
```

## Komponen

Sidebar showcase dikelompokkan menjadi:

| Grup | Komponen |
|---|---|
| Foundations | Typography |
| Components | Card, Alert, Badge, Button, Button Group, Form Controls, Combobox, Attachment, Placeholder, Spinner |
| Navigation | Breadcrumb, Tabs, Collapse, Stepper, Pagination |
| Data display | Marker, Trace, List Group, Accordion, Table, Data Table |
| Overlays & feedback | Modal, Alert Dialog, Toast, Dropdown, Tooltip |

Semua komponen ada di `components/ui/`, memakai CSS module, dan tidak
bergantung pada backend.

`Table` dan `DataTable` mendukung mode `flush` supaya tabel menempel ke tepi
`Card` tanpa padding ganda. Toolbar, footer, dan header tabel tetap memakai
padding sendiri agar sejajar dengan judul card.

`Combobox`, `Trace`, `Marker`, `Attachment`, `AlertDialog`, dan `Typography`
mengikuti pola komponen shadcn terbaru (combobox dengan chips, trace untuk
langkah agen, marker untuk catatan inline, attachment dengan state upload,
alert dialog untuk konfirmasi, dan skala tipografi berbasis variant).
