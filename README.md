# Poinqu UI Kit

Komponen UI dan design system untuk produk **Poinqu**. Dokumentasi lengkap,
panduan penggunaan, dan showcase interaktif tersedia di:

**[https://ui.poinqu.com](https://ui.poinqu.com)**

Repositori ini (`raph-ui`) berisi source code komponen, halaman showcase, dan
token desain yang dipakai oleh aplikasi Poinqu.

## Dokumentasi

- Dokumentasi & showcase: [https://ui.poinqu.com](https://ui.poinqu.com)
- Source komponen: [`components/ui`](./components/ui)
- Token desain: [`app/globals.css`](./app/globals.css)

## Kebutuhan

- Node.js 20 atau lebih baru
- npm

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Halaman utama langsung
menampilkan showcase komponen. Sidebar di halaman tersebut memuat daftar
komponen dan bisa dipakai untuk melompat ke bagian terkait.

## Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat production build |
| `npm run start` | Menjalankan hasil production build |
| `npm run lint` | Menjalankan ESLint |
| `npx tsc --noEmit` | Type-check tanpa menghasilkan file |

## Cara Pakai

Import komponen langsung dari `components/ui`:

```tsx
import Button from "@/components/ui/Button";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";

export function WorkspaceCard() {
  return (
    <Card>
      <CardHeader
        title="Workspace"
        description="Kelola workspace dan anggota tim."
      />
      <CardBody>
        <Button label="Simpan perubahan" variant="solid" tone="primary" />
      </CardBody>
    </Card>
  );
}
```

Komponen interaktif seperti `Combobox`, `AlertDialog`, `Dropdown`, `Toast`,
`Trace`, dan `Modal` adalah Client Components. Gunakan di dalam Client
Component atau tambahkan `"use client"` pada file yang memakainya.

Contoh `Combobox` single-select:

```tsx
"use client";

import { useState } from "react";
import Combobox, { type ComboboxOption } from "@/components/ui/Combobox";

const options: ComboboxOption[] = [
  { value: "next", label: "Next.js", description: "React framework" },
  { value: "astro", label: "Astro", description: "Content-first framework" },
];

export function FrameworkPicker() {
  const [value, setValue] = useState<string | null>("next");

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={(next) =>
        setValue(typeof next === "string" ? next : null)
      }
      placeholder="Pilih framework"
      searchPlaceholder="Cari framework..."
      clearable
    />
  );
}
```

Contoh `AlertDialog` terkontrol:

```tsx
"use client";

import { useState } from "react";
import AlertDialog from "@/components/ui/AlertDialog";
import Button from "@/components/ui/Button";

export function DeleteWorkspace() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        label="Hapus workspace"
        tone="danger"
        onClick={() => setOpen(true)}
      />
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Hapus workspace ini?"
        description="Tindakan ini tidak bisa dibatalkan."
        tone="danger"
        confirmLabel="Hapus"
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}
```

## Komponen

| Grup | Komponen |
|---|---|
| Foundations | Typography |
| Components | Card, Alert, Badge, Button, Button Group, Form Controls, Combobox, Attachment, Placeholder, Spinner |
| Navigation | Breadcrumb, Tabs, Collapse, Stepper, Pagination |
| Data display | Marker, Trace, List Group, Accordion, Table, Data Table |
| Overlays & feedback | Modal, Alert Dialog, Toast, Dropdown, Tooltip |

Komponen tambahan yang juga tersedia di `components/ui`:

- `Avatar`
- `AccountModal`
- `PasswordInput`
- `RangeSelect`
- `SearchField`
- `StatusBadge`

`Table` dan `DataTable` mendukung mode `flush` agar tabel menempel ke tepi
`Card` tanpa padding ganda. Toolbar, footer, dan header tabel tetap memakai
padding sendiri agar sejajar dengan judul card.

## Struktur

```txt
app/
  layout.tsx                     # root layout + ToastProvider + font + ikon
  page.tsx                       # showcase komponen
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

## Styling

- Styling memakai **CSS Modules** per komponen.
- Warna, ukuran, radius, spacing, dan motion memakai token dari
  `app/globals.css`.
- Ikon memakai **Iconify** yang dimuat di `app/layout.tsx` melalui
  `https://code.iconify.design`.
- Setiap komponen berada di `components/ui` dan tidak bergantung pada backend.

## Menambah Komponen Baru

1. Buat `NamaKomponen.tsx` dan `NamaKomponen.module.css` di `components/ui`.
2. Gunakan token dari `app/globals.css`, bukan nilai warna/ukuran hardcoded.
3. Tambahkan demo ke `components/showcase/ComponentShowcase.tsx`.
4. Tambahkan label komponen ke `NAV_SECTIONS` dan `SECTION_LABELS` agar muncul
   di sidebar dan ikut scroll-spy.
5. Dokumentasikan penggunaan komponen di [ui.poinqu.com](https://ui.poinqu.com).

## Dokumentasi Online

Untuk referensi lengkap, contoh interaktif, dan panduan terbaru:

**[https://ui.poinqu.com](https://ui.poinqu.com)**
