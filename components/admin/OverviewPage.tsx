"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Spinner from "@/components/ui/Spinner";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import PageHeader from "@/components/admin/PageHeader";
import { checkHealth } from "@/lib/admin-api";
import { adminApi } from "@/lib/admin-api";
import type {
  AdminSummary,
  AppSetting,
  AuditLogRow,
  RecoveryRequestRow,
} from "@/lib/admin-types";
import { formatDate, formatRupiah } from "@/lib/format";
import styles from "@/components/admin/AdminPages.module.css";

type OverviewData = {
  audit: AuditLogRow[];
  recovery: RecoveryRequestRow[];
  recoveryMore: boolean;
  admins: AdminSummary[];
  settings: AppSetting[];
  health: { status: string; environment: string; version: string } | null;
};

export default function OverviewPage() {
  const router = useRouter();
  const { profile, hasPermission } = useAdminSession();
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [audit, recovery, admins, settings, health] = await Promise.allSettled([
        hasPermission("audit.read")
          ? adminApi.auditLogs({ limit: 6 })
          : Promise.resolve({ items: [], pagination: { next_cursor: null, has_more: false, limit: 0 } }),
        hasPermission("recovery.review")
          ? adminApi.recoveryRequests({ status: "PENDING_REVIEW", limit: 5 })
          : Promise.resolve({ items: [], pagination: { next_cursor: null, has_more: false, limit: 0 } }),
        hasPermission("admin.read")
          ? adminApi.admins({ limit: 100 })
          : Promise.resolve({ items: [], pagination: { next_cursor: null, has_more: false, limit: 0 } }),
        hasPermission("settings.read")
          ? adminApi.settings()
          : Promise.resolve({ items: [] }),
        checkHealth(),
      ]);

      if (!active) return;

      if (
        audit.status === "rejected" &&
        recovery.status === "rejected" &&
        admins.status === "rejected" &&
        settings.status === "rejected"
      ) {
        setError("Tidak dapat memuat data admin. Periksa sesi dan koneksi API.");
      }

      setData({
        audit: audit.status === "fulfilled" ? audit.value.items : [],
        recovery: recovery.status === "fulfilled" ? recovery.value.items : [],
        recoveryMore:
          recovery.status === "fulfilled"
            ? recovery.value.pagination.has_more
            : false,
        admins: admins.status === "fulfilled" ? admins.value.items : [],
        settings: settings.status === "fulfilled" ? settings.value.items : [],
        health: health.status === "fulfilled" ? health.value : null,
      });
    };

    load();
    return () => {
      active = false;
    };
  }, [hasPermission]);

  return (
    <>
      <PageHeader
        eyebrow="Poinqu Admin"
        title={`Halo, ${profile?.name ?? "Admin"}`}
        description="Ringkasan operasional dompet dan aktivitas admin terbaru."
        actions={
          <>
            {hasPermission("recovery.review") ? (
              <Button
                label="Antrean pemulihan"
                icon="lucide:life-buoy"
                onClick={() => router.push("/dashboard/recovery")}
              />
            ) : null}
            {hasPermission("users.read") ? (
              <Button
                label="Cari pengguna"
                icon="lucide:search"
                variant="solid"
                tone="primary"
                onClick={() => router.push("/dashboard/users")}
              />
            ) : null}
          </>
        }
      />

      {error ? <Alert tone="danger" title="Gagal memuat" description={error} /> : null}

      {!data ? (
        <div className={styles.loading}>
          <Spinner size="lg" label="Memuat ringkasan" />
        </div>
      ) : (
        <>
          <section className={styles.grid}>
            <Card>
              <CardBody className={styles.statBody}>
                <span className={styles.statLabel}>Pemulihan menunggu</span>
                <strong className={styles.statValue}>
                  {data.recovery.length}
                  {data.recoveryMore ? "+" : ""}
                </strong>
                <span className={styles.statHint}>Pengajuan PENDING_REVIEW</span>
              </CardBody>
            </Card>
            <Card>
              <CardBody className={styles.statBody}>
                <span className={styles.statLabel}>Admin aktif</span>
                <strong className={styles.statValue}>
                  {data.admins.filter((item) => item.status === "ACTIVE").length}
                </strong>
                <span className={styles.statHint}>
                  Dari total {data.admins.length} akun admin
                </span>
              </CardBody>
            </Card>
            <Card>
              <CardBody className={styles.statBody}>
                <span className={styles.statLabel}>Pengaturan</span>
                <strong className={styles.statValue}>{data.settings.length}</strong>
                <span className={styles.statHint}>Kunci konfigurasi aplikasi</span>
              </CardBody>
            </Card>
            <Card>
              <CardBody className={styles.statBody}>
                <span className={styles.statLabel}>Status API</span>
                <strong className={styles.statValue}>
                  {data.health?.status === "ok" ? "Online" : "Gangguan"}
                </strong>
                <span className={styles.statHint}>
                  {data.health
                    ? `${data.health.environment} · v${data.health.version}`
                    : "Health check tidak tersedia"}
                </span>
              </CardBody>
            </Card>
          </section>

          <div className={styles.twoColumn}>
            <Card>
              <CardHeader
                title="Aktivitas admin terbaru"
                description="Audit log enam aksi terakhir."
                icon="lucide:scroll-text"
                actions={
                  hasPermission("audit.read") ? (
                    <Button
                      label="Lihat semua"
                      size="sm"
                      onClick={() => router.push("/dashboard/audit")}
                    />
                  ) : undefined
                }
              />
              <CardBody padding="none">
                {data.audit.length ? (
                  <div className={styles.tableRegion}>
                    <Table ariaLabel="Aktivitas admin terbaru" minWidth={520} flush>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Aksi</TableHeaderCell>
                        <TableHeaderCell>Aktor</TableHeaderCell>
                        <TableHeaderCell>Waktu</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.audit.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <span className={styles.monoCell}>{log.action}</span>
                          </TableCell>
                          <TableCell>
                            <Badge tone="neutral" size="sm">
                              {log.actor_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(log.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <p className={styles.empty}>Belum ada aktivitas yang bisa ditampilkan.</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Pemulihan nomor"
                description="Pengajuan yang menunggu keputusan admin."
                icon="lucide:life-buoy"
                actions={
                  hasPermission("recovery.review") ? (
                    <Button
                      label="Buka antrean"
                      size="sm"
                      onClick={() => router.push("/dashboard/recovery")}
                    />
                  ) : undefined
                }
              />
              <CardBody padding="none">
                {data.recovery.length ? (
                  <div className={styles.tableRegion}>
                    <Table ariaLabel="Pemulihan menunggu" minWidth={520} flush>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Pemohon</TableHeaderCell>
                        <TableHeaderCell>Nomor baru</TableHeaderCell>
                        <TableHeaderCell>Saldo</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recovery.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>{item.name}</div>
                            <span className={styles.muted}>{item.id}</span>
                          </TableCell>
                          <TableCell className={styles.phone}>{item.new_phone}</TableCell>
                          <TableCell>{formatRupiah(item.balance_hint)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <p className={styles.empty}>Tidak ada pengajuan yang menunggu.</p>
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Izin akun"
              description="Hak akses yang melekat pada peran admin saat ini."
              icon="lucide:shield-check"
            />
            <CardBody>
              <div className={styles.permissionList}>
                {(profile?.permissions ?? []).map((permission) => (
                  <Badge key={permission} tone="info" size="sm">
                    <Icon name="lucide:check" />
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </>
  );
}
