"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import SearchField from "@/components/ui/SearchField";
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
import type { Pagination, UserRow } from "@/lib/admin-types";
import { formatDate } from "@/lib/format";
import styles from "@/components/admin/AdminPages.module.css";

type Filters = { q: string; status: string; level: string };

export default function UsersPage() {
  const { hasPermission } = useAdminSession();
  const [qInput, setQInput] = useState("");
  const [filters, setFilters] = useState<Filters>({ q: "", status: "", level: "" });
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cursor = cursorStack[page] ?? null;
  const allowed = hasPermission("users.read");

  const load = useCallback(async () => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.users({
        q: filters.q || undefined,
        status: filters.status || undefined,
        level: filters.level || undefined,
        cursor,
        limit: 20,
      });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat pengguna.");
      setItems([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [allowed, cursor, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch data klien setelah sesi siap
    void load();
  }, [load]);

  const applyFilters = (next: Partial<Filters>) => {
    setFilters((previous) => ({ ...previous, ...next }));
    setCursorStack([null]);
    setPage(0);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = qInput.trim();
    if (value && value.length < 4) {
      setError("Kata kunci minimal 4 karakter.");
      return;
    }
    applyFilters({ q: value });
  };

  if (!allowed) {
    return (
      <Alert
        tone="warning"
        title="Akses terbatas"
        description="Akun admin ini tidak punya izin users.read."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Pengguna"
        title="Cari pengguna"
        description="Data nomor disamarkan. Gunakan pencarian nomor atau nama minimal 4 karakter."
      />

      <Card>
        <CardBody>
          <form className={styles.toolbar} onSubmit={submitSearch}>
            <div className={styles.grow}>
              <SearchField
                value={qInput}
                onChange={setQInput}
                placeholder="Cari nama atau nomor HP…"
                ariaLabel="Cari pengguna"
              />
            </div>
            <Select
              value={filters.status}
              onChange={(event) => applyFilters({ status: event.target.value })}
              aria-label="Filter status"
            >
              <option value="">Semua status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="LOCKED">LOCKED</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </Select>
            <Select
              value={filters.level}
              onChange={(event) => applyFilters({ level: event.target.value })}
              aria-label="Filter level"
            >
              <option value="">Semua level</option>
              <option value="BASIC">BASIC</option>
              <option value="PREMIUM">PREMIUM</option>
            </Select>
            <Button
              type="submit"
              label="Cari"
              icon="lucide:search"
              variant="solid"
              tone="primary"
            />
            <Button
              label="Reset"
              icon="lucide:rotate-ccw"
              onClick={() => {
                setQInput("");
                applyFilters({ q: "", status: "", level: "" });
              }}
            />
          </form>
        </CardBody>
      </Card>

      {error ? <Alert tone="danger" title="Gagal memuat" description={error} /> : null}

      <Card>
        <CardHeader
          title="Hasil pencarian"
          description="Data pengguna sesuai filter yang aktif."
          icon="lucide:users"
        />
        <CardBody padding="none">
          {loading ? (
            <div className={styles.loading}>
              <Spinner size="lg" label="Memuat pengguna" />
            </div>
          ) : items.length ? (
            <div className={styles.tableRegion}>
              <Table ariaLabel="Daftar pengguna" minWidth={900} flush>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Pengguna</TableHeaderCell>
                    <TableHeaderCell>Nomor HP</TableHeaderCell>
                    <TableHeaderCell>Level</TableHeaderCell>
                    <TableHeaderCell>KYC</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Hold</TableHeaderCell>
                    <TableHeaderCell>Terakhir aktif</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>{user.name}</div>
                        <span className={styles.monoCell}>{user.id}</span>
                      </TableCell>
                      <TableCell className={styles.phone}>{user.phone_masked}</TableCell>
                      <TableCell>
                        <Badge
                          tone={user.level === "PREMIUM" ? "success" : "neutral"}
                          size="sm"
                        >
                          {user.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            user.kyc_status === "VERIFIED"
                              ? "success"
                              : user.kyc_status === "PENDING"
                                ? "warning"
                                : user.kyc_status === "REJECTED"
                                  ? "danger"
                                  : "neutral"
                          }
                          size="sm"
                        >
                          {user.kyc_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            user.status === "ACTIVE"
                              ? "success"
                              : user.status === "LOCKED"
                                ? "warning"
                                : "danger"
                          }
                          dot
                          size="sm"
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.recovery_hold ? (
                          <Badge tone="warning" size="sm">
                            Ditahan
                          </Badge>
                        ) : (
                          <span className={styles.muted}>—</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.last_active_at)}</TableCell>
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
            <p className={styles.empty}>Tidak ada pengguna yang cocok dengan filter.</p>
          )}
        </CardBody>
      </Card>
    </>
  );
}
