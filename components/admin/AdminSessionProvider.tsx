"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { adminApi, UNAUTHORIZED_EVENT } from "@/lib/admin-api";
import {
  clearSession,
  getAccessToken,
  saveProfile,
} from "@/lib/admin-session";
import type { AdminProfile } from "@/lib/admin-types";
import Spinner from "@/components/ui/Spinner";

type AdminSessionValue = {
  profile: AdminProfile | null;
  loading: boolean;
  hasPermission: (code: string) => boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const next = await adminApi.me();
    saveProfile(next);
    setProfile(next);
  }, []);

  useEffect(() => {
    let active = true;

    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- validasi sesi saat mount
    loadProfile()
      .catch(() => {
        if (!active) return;
        clearSession();
        router.replace("/login");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadProfile, router]);

  const signOut = useCallback(async () => {
    try {
      await adminApi.logout();
    } finally {
      clearSession();
      setProfile(null);
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setProfile(null);
      router.replace("/login");
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [router]);

  const value = useMemo<AdminSessionValue>(
    () => ({
      profile,
      loading,
      hasPermission: (code: string) =>
        Boolean(
          profile &&
            (profile.role === "SUPERADMIN" || profile.permissions.includes(code)),
        ),
      refreshProfile: loadProfile,
      signOut,
    }),
    [loading, loadProfile, profile, signOut],
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--color-canvas)",
        }}
      >
        <Spinner size="lg" label="Memuat sesi admin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSessionValue {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession harus dipakai di dalam AdminSessionProvider");
  }
  return context;
}
