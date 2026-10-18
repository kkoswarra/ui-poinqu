"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AccountModal from "@/components/ui/AccountModal";
import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/components/topbar/Topbar";
import { initials } from "@/lib/admin-session";
import type { NavSection } from "@/lib/data";
import {
  AdminSessionProvider,
  useAdminSession,
} from "./AdminSessionProvider";
import styles from "./AdminShell.module.css";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  permission?: string;
};

const NAV_GROUPS: { caption: string; items: NavItem[] }[] = [
  {
    caption: "Operasional",
    items: [
      {
        label: "Ringkasan",
        href: "/dashboard",
        icon: "lucide:layout-dashboard",
      },
      {
        label: "Pengguna",
        href: "/dashboard/users",
        icon: "lucide:users",
        permission: "users.read",
      },
      {
        label: "Pemulihan Nomor",
        href: "/dashboard/recovery",
        icon: "lucide:life-buoy",
        permission: "recovery.review",
      },
    ],
  },
  {
    caption: "Keamanan & Konfigurasi",
    items: [
      {
        label: "Admin",
        href: "/dashboard/admins",
        icon: "lucide:shield-check",
        permission: "admin.read",
      },
      {
        label: "Peran & Izin",
        href: "/dashboard/roles",
        icon: "lucide:key-round",
        permission: "admin.read",
      },
      {
        label: "Pengaturan",
        href: "/dashboard/settings",
        icon: "lucide:sliders-horizontal",
        permission: "settings.read",
      },
      {
        label: "Audit Log",
        href: "/dashboard/audit",
        icon: "lucide:scroll-text",
        permission: "audit.read",
      },
    ],
  },
];

function AdminShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, hasPermission, signOut } = useAdminSession();
  const [mode, setMode] = useState<"default" | "closed" | "open">("default");
  const [isMobile, setIsMobile] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width:760px)");
    const apply = () => {
      setIsMobile(media.matches);
      if (media.matches) setMode("closed");
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const visible = isMobile ? mode === "open" : mode !== "closed";

  const toggle = () => {
    setMode((previous) => {
      const opened =
        previous === "open" || (!isMobile && previous === "default");
      return opened ? "closed" : "open";
    });
  };

  const sections = useMemo<NavSection[]>(
    () =>
      NAV_GROUPS.map((group) => ({
        caption: group.caption,
        entries: group.items
          .filter((item) => !item.permission || hasPermission(item.permission))
          .map((item) => ({
            kind: "link" as const,
            label: item.label,
            icon: item.icon,
          })),
      })).filter((group) => group.entries.length > 0),
    [hasPermission],
  );

  const items = NAV_GROUPS.flatMap((group) => group.items);
  const active =
    [...items]
      .sort((left, right) => right.href.length - left.href.length)
      .find(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) ?? items[0];
  const activeLabel = active?.label ?? "Ringkasan";

  const navigate = (label: string) => {
    const target = items.find((item) => item.label === label);
    if (!target) return;
    router.push(target.href);
    if (isMobile) setMode("closed");
  };

  if (!profile) return null;

  return (
    <div className={styles.shell} data-sidebar={mode}>
      <div className={styles.sidebarRegion} inert={!visible}>
        <Sidebar
          sections={sections}
          user={{
            name: profile.name,
            email: profile.email,
            initials: initials(profile.name),
          }}
          expanded={visible}
          activeLabel={activeLabel}
          onToggle={toggle}
          onNavigate={navigate}
          onProfile={() => setAccountOpen(true)}
        />
      </div>

      <div className={styles.topbarRegion}>
        <Topbar
          expanded={visible}
          onToggleSidebar={toggle}
          breadcrumb={[
            { label: "Poinqu Admin", href: "/dashboard" },
            { label: activeLabel },
          ]}
          onNotifications={
            hasPermission("audit.read")
              ? () => router.push("/dashboard/audit")
              : undefined
          }
          onSettings={
            hasPermission("settings.read")
              ? () => router.push("/dashboard/settings")
              : undefined
          }
        />
      </div>

      <main className={styles.content}>{children}</main>

      <button
        type="button"
        className={styles.backdrop}
        aria-label="Tutup navigasi"
        onClick={() => setMode("closed")}
      />

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        user={{
          name: profile.name,
          email: profile.email,
          initials: initials(profile.name),
        }}
        role={profile.role}
        workspace="Poinqu"
        onSignOut={() => {
          void signOut();
        }}
      />
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminSessionProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminSessionProvider>
  );
}
