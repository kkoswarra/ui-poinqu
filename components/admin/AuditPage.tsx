"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
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
import CursorPager from "@/components/admin/CursorPager";
import PageHeader from "@/components/admin/PageHeader";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ApiError, adminApi } from "@/lib/admin-api";
import type { AuditActor, AuditLogRow, Pagination } from "@/lib/admin-types";
import { formatDate, formatJson } from "@/lib/format";
import styles from "@/components/admin/AdminPages.module.css";

type Filters = {
  actor_type: AuditActor | "";
  action: string;
  date_from: string;
  date_to: string;
};

const EMPTY_FILTERS: Filters = {
  actor_type: "",
  action: "",
  date_from: "",
  date_to: "",
};

export default function AuditPage() {
  const { hasPermission } = useAdminSession();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<AuditLogRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditLogRow | null>(null);

  const allowed = hasPermission("audit.read");
  const cursor = cursorStack[page] ?? null;

  const load = useCallback(async () => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.auditLogs({
        actor_type: filters.actor_type || undefined,
        action: filters.action.trim() || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        cursor,
        limit: 20,
      });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat audit log.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [allowed, cursor, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch data klien setelah sesi siap
    void load();
  }, [load]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters(draft);
    setCursorStack([null]);
    setPage(0);
  };

  const reset = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setCursorStack([null]);
    setPage(0);
  };

  if (!allowed) {
    return (
      <Alert
        tone="warning"
        title="Akses terbatas"
        description="Akun admin ini tidak punya izin audit.read."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Keamanan"
        title="Audit log"
        description="Jejak tindakan admin dan sistem. Hanya baca; tidak ada endpoint ubah/hapus."
      />

      <Card>
        <CardBody>
          <form className={styles.toolbar} onSubmit={submit}>
            <Select
              value={draft.actor_type}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  actor_type: event.target.value as AuditActor | "",
                }))
              }
              aria-label="Aktor"
            >
              <option value="">Semua aktor</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
              <option value="SYSTEM">SYSTEM</option>
            </Select>
            <div className={styles.grow}>
              <Input
                value={draft.action}
                onChange={(event) =>
                  setDraft((previous) => ({ ...previous, action: event.target.value }))
                }
                placeholder="Filter aksi, mis. admin.login"
                icon="lucide:activity"
                fullWidth
              />
            </div>
            <Input
              type="date"
              value={draft.date_from}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  date_from: event.target.value,
                }))
              }
              aria-label="Dari tanggal"
            />
            <Input
              type="date"
              value={draft.date_to}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  date_to: event.target.value,
                }))
              }
              aria-label="Sampai tanggal"
            />
            <Button type="submit" label="Terapkan" icon="lucide:filter" />
            <Button label="Reset" icon="lucide:rotate-ccw" onClick={reset} />
          </form>
        </CardBody>
      </Card>

      {error ? <Alert tone="danger" title="Gagal memuat" description={error} /> : null}

      <Card>
        <CardHeader
          title="Riwayat audit"
          description="Urutan terbaru lebih dulu. Klik detail untuk melihat before/after."
          icon="lucide:scroll-text"
        />
        <CardBody padding="none">
          {loading ? (
            <div className={styles.loading}>
              <Spinner size="lg" label="Memuat audit log" />
            </div>
          ) : items.length ? (
            <div className={styles.tableRegion}>
              <Table ariaLabel="Audit log" minWidth={1000} flush>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Waktu</TableHeaderCell>
                    <TableHeaderCell>Aksi</TableHeaderCell>
                    <TableHeaderCell>Aktor</TableHeaderCell>
                    <TableHeaderCell>Entity</TableHeaderCell>
                    <TableHeaderCell>IP</TableHeaderCell>
                    <TableHeaderCell>Aksi</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                      <TableCell>
                        <span className={styles.monoCell}>{log.action}</span>
                      </TableCell>
                      <TableCell>
                        <Badge tone="neutral" size="sm">
                          {log.actor_type}
                        </Badge>
                        <div className={styles.monoCell}>{log.actor_id || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div>{log.entity || "—"}</div>
                        <span className={styles.monoCell}>{log.entity_id || ""}</span>
                      </TableCell>
                      <TableCell className={styles.monoCell}>{log.ip || "—"}</TableCell>
                      <TableCell>
                        <Button
                          label="Detail"
                          size="sm"
                          icon="lucide:eye"
                          onClick={() => setSelected(log)}
                        />
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
            <p className={styles.empty}>Tidak ada audit log pada filter ini.</p>
          )}
        </CardBody>
      </Card>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Detail audit log"
        description={selected ? `${selected.action} · #${selected.id}` : undefined}
        icon="lucide:scroll-text"
        tone="info"
        size="lg"
        footer={<Button label="Tutup" variant="ghost" onClick={() => setSelected(null)} />}
      >
        {selected ? (
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span>Waktu</span>
              <strong>{formatDate(selected.created_at)}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Aktor</span>
              <strong>
                {selected.actor_type} · {selected.actor_id || "—"}
              </strong>
            </div>
            <div className={styles.detailRow}>
              <span>Entity</span>
              <strong>
                {selected.entity || "—"} · {selected.entity_id || "—"}
              </strong>
            </div>
            <div className={styles.detailRow}>
              <span>Request ID / IP</span>
              <strong>
                {selected.request_id || "—"} · {selected.ip || "—"}
              </strong>
            </div>
            <div>
              <p className={styles.muted}>Before</p>
              <pre className={styles.codeBlock}>{formatJson(selected.before)}</pre>
            </div>
            <div>
              <p className={styles.muted}>After</p>
              <pre className={styles.codeBlock}>{formatJson(selected.after)}</pre>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
