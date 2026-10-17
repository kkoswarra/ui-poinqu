# Poinqu Admin Panel

Template dashboard admin Poinqu yang di-port dari [`docs/admin-template.html`](docs/admin-template.html) ke Next.js App Router, React, dan TypeScript. Styling memakai CSS Modules dengan token desain dari template asli.

Saat ini tersedia dua halaman:

- `/` — showcase UI kit (Card, Alert, Badge, Button, Button Group, Form Controls, Placeholder, Spinner, Breadcrumb, Tabs, Collapse, Stepper, Pagination, List Group, Accordion, Table, Data Table, Modal, Toast, Dropdown, Tooltip).
- `/dashboard` — dashboard Poinqu dari template asli.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Perintah lain:

```bash
npm run build   # build produksi
npm run start   # jalankan hasil build
npm run lint    # ESLint
npx tsc --noEmit
```

## Struktur

```
app/
  globals.css                 # token warna, tipografi, spacing, motion, reset
  layout.tsx                  # font Inter, metadata, Iconify, ToastProvider
  page.tsx                    # showcase UI kit
  dashboard/page.tsx          # dashboard Poinqu
components/
  dashboard/Dashboard.tsx     # state dashboard: sidebar, range, dialog
  showcase/                   # halaman demo komponen + layout showcase
  sidebar/                    # navigasi yang bisa dikonfigurasi (dashboard & demo)
  topbar/                     # breadcrumb + aksi topbar
  metrics/                    # kartu metrik + sparkline
  chart/                      # bar chart ticket volume
  updates/                    # panel latest updates + activity
  table/                      # tabel SLA: search, filter, sort, export
  ui/
    Card.tsx                  # Card + CardHeader / CardBody / CardFooter
    Alert.tsx                 # info / success / warning / danger, dismissible
    Badge.tsx                 # soft / solid / outline, dot, icon, size
    Button.tsx                # outline / solid / ghost, tone, size, loading
    ButtonGroup.tsx           # segmented control
    AccountModal.tsx          # popup info akun dari sidebar footer
    FormField.tsx             # label, hint, error, aria-describedby otomatis
    Input.tsx                 # input + icon kiri/kanan, invalid, size
    Select.tsx                # native select yang di-style
    Textarea.tsx              # textarea + invalid state
    Checkbox.tsx              # checkbox + description + indeterminate
    RadioGroup.tsx            # radio group vertical / horizontal
    Switch.tsx                # toggle switch + description
    Placeholder.tsx           # skeleton text / heading / circle / rect
    Spinner.tsx               # loading indicator, size + tone
    Breadcrumb.tsx            # breadcrumb, dipakai langsung oleh Topbar
    Tabs.tsx                  # Tabs / TabsList / Tab / TabPanel
    Collapse.tsx              # disclosure dengan animasi native details
    Stepper.tsx               # progress langkah horizontal / vertical
    Pagination.tsx            # page numbers, ellipsis, prev/next, mobile summary
    ListGroup.tsx             # ListGroup + ListGroupItem responsif
    Accordion.tsx             # single / multiple open, berbasis Collapse
    Table.tsx                 # Table + TableHead / TableBody / TableRow / cell
    DataTable.tsx             # search, sort, selection, pagination, empty state
    Modal.tsx                 # dialog center / sheet / fullscreen
    Toast.tsx                 # ToastProvider + useToast()
    Dropdown.tsx              # menu dengan keyboard navigation
    Tooltip.tsx               # tooltip hover/focus, 4 placement
    Icon.tsx                  # wrapper <iconify-icon>
    SearchField.tsx
    RangeSelect.tsx
    StatusBadge.tsx
    Avatar.tsx
lib/data.ts                   # data statis & tipe dashboard
types/iconify.d.ts            # deklarasi JSX untuk <iconify-icon>
docs/admin-template.html      # template HTML referensi
```

## Menggunakan komponen

```tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card, { CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function Example() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <Card>
        <CardHeader title="Support plan" description="Your current subscription" />
        <CardBody>...</CardBody>
        <CardFooter align="between">
          <Button
            label="Save changes"
            variant="solid"
            tone="primary"
            onClick={() => {
              toast({ title: "Changes saved", tone: "success" });
              setOpen(true);
            }}
          />
        </CardFooter>
      </Card>

      <FormField label="Email address" hint="We only use this for alerts." required>
        <Input type="email" icon="lucide:mail" placeholder="you@company.com" />
      </FormField>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Workspace settings"
        description="Update the defaults for your support workspace."
        footer={<Button label="Done" onClick={() => setOpen(false)} />}
      >
        ...
      </Modal>
    </>
  );
}
```

`FormField` otomatis menghubungkan label, hint/error, `aria-describedby`, dan `aria-invalid` ke control di dalamnya. `Modal` memakai native `<dialog>` sehingga mendukung fokus terkurung, Escape, dan klik backdrop.

## Catatan

- Data dashboard masih statis dan terpusat di `lib/data.ts`, sehingga mudah diganti dengan API nanti.
- Sidebar dashboard dan showcase memakai komponen `Sidebar` yang sama; isi navigasi, brand, search, dan profil kini dikirim lewat props.
- Navigasi sidebar punya area scroll sendiri. Footer akun tetap di bawah sidebar; klik footer membuka `AccountModal` dengan info user, role, workspace, dan status.
- Ikon memakai web component [Iconify](https://iconify.design/) yang dimuat dari CDN melalui `next/script`.
- `next.config.ts` tidak memakai loader `@tailwindcss/turbopack` karena styling memakai CSS Modules; aturan loader tersebut membuat CSS Modules tidak ter-scope dengan benar.
