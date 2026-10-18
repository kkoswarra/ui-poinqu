"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import PageHeader from "@/components/admin/PageHeader";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ApiError, adminApi } from "@/lib/admin-api";
import type { Role } from "@/lib/admin-types";
import styles from "@/components/admin/AdminPages.module.css";

export default function RolesPage() {
  const { hasPermission } = useAdminSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const allowed = hasPermission("admin.read");

  useEffect(() => {
    if (!allowed) return;
    let active = true;
    adminApi
      .roles()
      .then((result) => {
        if (active) setRoles(result.items);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof ApiError ? err.message : "Gagal memuat peran.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [allowed]);

  if (!allowed) {
    return (
      <Alert
        tone="warning"
        title="Akses terbatas"
        description="Akun admin ini tidak punya izin admin.read."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Keamanan"
        title="Peran & izin"
        description="Daftar peran dan hak akses yang tersedia untuk akun admin."
      />

      {error ? <Alert tone="danger" title="Gagal memuat" description={error} /> : null}

      {loading ? (
        <div className={styles.loading}>
          <Spinner size="lg" label="Memuat peran" />
        </div>
      ) : (
        <div className={styles.grid}>
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader
                title={role.name}
                description={`${role.permissions.length} izin`}
                icon="lucide:key-round"
              />
              <CardBody>
                <div className={styles.permissionList}>
                  {role.permissions.map((permission) => (
                    <Badge key={permission} tone="info" size="sm">
                      {permission}
                    </Badge>
                  ))}
                </div>
                <p className={`${styles.muted} ${styles.mono}`}>{role.id}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
