"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import CursorPager from "@/components/admin/CursorPager";
import PageHeader from "@/components/admin/PageHeader";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ApiError, adminApi } from "@/lib/admin-api";
import type {
  Pagination,
  RecoveryRequestRow,
  RecoveryStatus,
} from "@/lib/admin-types";
import { formatDate, formatRupiah } from "@/lib/format";
import styles from "@/components/admin/AdminPages.module.css";

const STATUS_LABEL: Record<RecoveryStatus, string> = {
  PENDING_REVIEW: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const STATUS_TONE: Record<RecoveryStatus, "warning" | "success" | "danger"> = {
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export default function RecoveryPage() {
  const { hasPermission } = useAdminSession();
  const { toast } = useToast();
  const [status, setStatus] = useState<RecoveryStatus | "">("PENDING_REVIEW");
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<RecoveryRequestRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RecoveryRequestRow | null>(null);
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const allowed = hasPermission("recovery.review");
  const cursor = cursorStack[page] ?? null;

  const load = useCallback(async () => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.recoveryRequests({
        status: status || undefined,
        cursor,
        limit: 20,
      });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat pengajuan.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [allowed, cursor, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch data klien setelah sesi siap
    void load();
  }, [load]);

  const openReview = (item: RecoveryRequestRow) => {
    setSelected(item);
    setDecision("APPROVE");
    setReason("");
    setFormError(null);
  };

  const submitDecision = async () => {
    if (!selected || submitting) return;
    if (reason.trim().length < 10) {
      setFormError("Alasan keputusan minimal 10 karakter.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const result = await adminApi.decideRecovery(selected.id, {
        decision,
        reason: reason.trim(),
      });
      setSelected(null);
      toast({
        title: "Keputusan disimpan",
        description:
          decision === "APPROVE"
            ? "Nomor berhasil dipulihkan dan sesi pengguna dicabut."
            : "Pengajuan ditolak dan hold saldo dilepas.",
        tone: "success",
      });
      if (result.status !== "PENDING_REVIEW") {
        await load();
      }
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Gagal menyimpan keputusan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!allowed) {
    return (
      <Alert
        tone="warning"
        title="Akses terbatas"
        description="Akun admin ini tidak punya izin recovery.review."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Pemulihan nomor"
        title="Antrean pengajuan"
        description="Tinjau bukti pengguna lalu setujui atau tolak. Persetujuan mencabut sesi dan menahan transaksi keluar."
      />

      <Card>
        <CardBody>
          <div className={styles.toolbar}>
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as RecoveryStatus | "");
                setCursorStack([null]);
                setPage(0);
              }}
              aria-label="Filter status pengajuan"
            >
              <option value="">Semua status</option>
              <option value="PENDING_REVIEW">Menunggu</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </Select>
            <Button
              label="Muat ulang"
              icon="lucide:refresh-cw"
              onClick={() => void load()}
            />
          </div>
        </CardBody>
      </Card>

      {error ? <Alert tone="danger" title="Gagal memuat" description={error} /> : null}

      <Card>
        <CardHeader
          title="Daftar pengajuan"
          description="Pengajuan pemulihan nomor sesuai filter."
          icon="lucide:life-buoy"
        />
        <CardBody padding="none">
          {loading ? (
            <div className={styles.loading}>
              <Spinner size="lg" label="Memuat pengajuan" />
            </div>
          ) : items.length ? (
            <div className={styles.tableRegion}>
              <Table ariaLabel="Antrean pemulihan" minWidth={980} flush>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Pemohon</TableHeaderCell>
                    <TableHeaderCell>Nomor lama</TableHeaderCell>
                    <TableHeaderCell>Nomor baru</TableHeaderCell>
                    <TableHeaderCell>Akun</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Dibuat</TableHeaderCell>
                    <TableHeaderCell>Aksi</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className={styles.monoCell}>{item.id}</span>
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className={styles.phone}>{item.old_phone}</TableCell>
                      <TableCell className={styles.phone}>{item.new_phone}</TableCell>
                      <TableCell>
                        <Badge
                          tone={item.account_found ? "success" : "neutral"}
                          size="sm"
                        >
                          {item.account_found ? "Cocok" : "Tidak ada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge tone={STATUS_TONE[item.status]} size="sm">
                          {STATUS_LABEL[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      <TableCell>
                        {item.status === "PENDING_REVIEW" ? (
                          <Button
                            label="Tinjau"
                            size="sm"
                            icon="lucide:eye"
                            onClick={() => openReview(item)}
                          />
                        ) : (
                          <span className={styles.muted}>Selesai</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <CursorPager
                page={page}
                hasPrev={page > 0}
                hasNext={Boolean(pagination?.has_more)}
                loading={loading}
                onPrev={() => setPage((value) => Math.max(0, value - 1))}
                onNext={() => {
                  const next = pagination?.next_cursor;
                  if (!next) return;
                  setCursorStack((previous) => [
                    ...previous.slice(0, page + 1),
                    next,
                  ]);
                  setPage((value) => value + 1);
                }}
              />
            </div>
          ) : (
            <p className={styles.empty}>Tidak ada pengajuan pada filter ini.</p>
          )}
        </CardBody>
      </Card>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Tinjau pemulihan"
        description={selected ? `${selected.name} · ${selected.id}` : undefined}
        icon="lucide:life-buoy"
        tone="warning"
        size="md"
        footer={
          <>
            <Button label="Batal" variant="ghost" onClick={() => setSelected(null)} />
            <Button
              label={submitting ? "Menyimpan…" : "Simpan keputusan"}
              variant="solid"
              tone={decision === "APPROVE" ? "primary" : "danger"}
              loading={submitting}
              onClick={submitDecision}
            />
          </>
        }
      >
        {selected ? (
          <div className={styles.detailGrid}>
            {formError ? (
              <Alert tone="danger" title="Tidak dapat menyimpan" description={formError} />
            ) : null}

            <div className={styles.detailRow}>
              <span>Nomor lama / baru</span>
              <strong>
                {selected.old_phone} → {selected.new_phone}
              </strong>
            </div>
            <div className={styles.detailRow}>
              <span>Akun ditemukan</span>
              <strong>{selected.account_found ? "Ya" : "Tidak"}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Saldo dilaporkan</span>
              <strong>{formatRupiah(selected.balance_hint)}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Transaksi terakhir</span>
              <strong>{selected.last_transaction_hint || "—"}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Catatan pemohon</span>
              <strong>{selected.note || "—"}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Diajukan</span>
              <strong>{formatDate(selected.created_at)}</strong>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.detailRow}>
                <span>Keputusan</span>
                <Select
                  value={decision}
                  onChange={(event) =>
                    setDecision(event.target.value as "APPROVE" | "REJECT")
                  }
                >
                  <option value="APPROVE">Setujui</option>
                  <option value="REJECT">Tolak</option>
                </Select>
              </label>
              <label className={[styles.detailRow, styles.full].join(" ")}>
                <span>Alasan (wajib, 10–300 karakter)</span>
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Contoh: Selfie dan riwayat transaksi cocok."
                />
              </label>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
