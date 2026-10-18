"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
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
import { useToast } from "@/components/ui/Toast";
import CursorPager from "@/components/admin/CursorPager";
import PageHeader from "@/components/admin/PageHeader";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ApiError, adminApi } from "@/lib/admin-api";
import type { AdminSummary, Pagination, Role } from "@/lib/admin-types";
import { formatDate } from "@/lib/format";
import styles from "@/components/admin/AdminPages.module.css";

export default function AdminsPage() {
  const { profile, hasPermission } = useAdminSession();
  const { toast } = useToast();
  const canWrite = hasPermission("admin.write");

  const [items, setItems] = useState<AdminSummary[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", roleId: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState("");

  const [editing, setEditing] = useState<AdminSummary | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "DISABLED">("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const allowed = hasPermission("admin.read");
  const cursor = cursorStack[page] ?? null;

  const load = useCallback(async () => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [admins, rolesResult] = await Promise.all([
        adminApi.admins({ cursor, limit: 20 }),
        adminApi.roles(),
      ]);
      setItems(admins.items);
      setPagination(admins.pagination);
      setRoles(rolesResult.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat admin.");
    } finally {
      setLoading(false);
    }
  }, [allowed, cursor]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch data klien setelah sesi siap
    void load();
  }, [load]);

  const openCreate = () => {
    setForm({ email: "", name: "", roleId: roles[0]?.id ?? "" });
    setCreateError(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (creating) return;
    if (!form.email.trim() || !form.name.trim() || !form.roleId) {
      setCreateError("Email, nama, dan peran wajib diisi.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const result = await adminApi.createAdmin({
        email: form.email.trim(),
        name: form.name.trim(),
        role_id: form.roleId,
      });
      setCreateOpen(false);
      setTemporaryPassword(result.temporary_password);
      setCreatedEmail(result.admin.email);
      setCopied(false);
      toast({
        title: "Admin dibuat",
        description: "Password sementara hanya ditampilkan sekali.",
        tone: "success",
      });
      await load();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Gagal membuat admin.");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (admin: AdminSummary) => {
    setEditing(admin);
    const role = roles.find((item) => item.name === admin.role);
    setEditRole(role?.id ?? "");
    setEditStatus(admin.status);
    setEditError(null);
  };

  const submitEdit = async () => {
    if (!editing || saving) return;
    setSaving(true);
    setEditError(null);
    try {
      await adminApi.updateAdmin(editing.id, {
        ...(editRole ? { role_id: editRole } : {}),
        status: editStatus,
      });
      setEditing(null);
      toast({ title: "Admin diperbarui", tone: "success" });
      await load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Gagal memperbarui admin.");
    } finally {
      setSaving(false);
    }
  };

  const copyPassword = async () => {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

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
        title="Kelola admin"
        description="Buat akun admin, atur peran, dan nonaktifkan akses."
        actions={
          canWrite ? (
            <Button
              label="Tambah admin"
              icon="lucide:user-plus"
              variant="solid"
              tone="primary"
              onClick={openCreate}
            />
          ) : undefined
        }
      />

      {error ? <Alert tone="danger" title="Gagal memuat" description={error} /> : null}

      <Card>
        <CardHeader
          title="Akun admin"
          description="Peran, status, dan status 2FA tiap admin."
          icon="lucide:shield-check"
        />
        <CardBody padding="none">
          {loading ? (
            <div className={styles.loading}>
              <Spinner size="lg" label="Memuat admin" />
            </div>
          ) : items.length ? (
            <div className={styles.tableRegion}>
              <Table ariaLabel="Daftar admin" minWidth={980} flush>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Admin</TableHeaderCell>
                    <TableHeaderCell>Peran</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>2FA</TableHeaderCell>
                    <TableHeaderCell>Login terakhir</TableHeaderCell>
                    <TableHeaderCell>Aksi</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((admin) => {
                    const isSelf = admin.id === profile?.id;
                    return (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div>{admin.name}</div>
                          <span className={styles.monoCell}>{admin.email}</span>
                        </TableCell>
                        <TableCell>
                          <Badge tone="neutral" size="sm">
                            {admin.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            tone={admin.status === "ACTIVE" ? "success" : "danger"}
                            dot
                            size="sm"
                          >
                            {admin.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            tone={admin.totp_enabled ? "success" : "warning"}
                            size="sm"
                          >
                            {admin.totp_enabled ? "Aktif" : "Belum"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(admin.last_login_at)}</TableCell>
                        <TableCell>
                          {canWrite ? (
                            <Button
                              label={isSelf ? "Akun sendiri" : "Ubah"}
                              size="sm"
                              icon="lucide:pencil"
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "Tidak bisa mengubah akun sendiri"
                                  : undefined
                              }
                              onClick={() => openEdit(admin)}
                            />
                          ) : (
                            <span className={styles.muted}>Read-only</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
            <p className={styles.empty}>Belum ada admin.</p>
          )}
        </CardBody>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tambah admin"
        description="Password sementara akan ditampilkan sekali. Admin wajib mengganti password dan memasang 2FA."
        icon="lucide:user-plus"
        tone="info"
        footer={
          <>
            <Button label="Batal" variant="ghost" onClick={() => setCreateOpen(false)} />
            <Button
              label={creating ? "Membuat…" : "Buat admin"}
              variant="solid"
              tone="primary"
              loading={creating}
              onClick={submitCreate}
            />
          </>
        }
      >
        <div className={styles.stack}>
          {createError ? (
            <Alert tone="danger" title="Gagal membuat" description={createError} />
          ) : null}
          <FormField label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, email: event.target.value }))
              }
              placeholder="cs@poinqu.id"
              icon="lucide:mail"
              fullWidth
            />
          </FormField>
          <FormField label="Nama" required>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, name: event.target.value }))
              }
              placeholder="Tim CS"
              icon="lucide:user"
              fullWidth
            />
          </FormField>
          <FormField label="Peran" required>
            <Select
              value={form.roleId}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, roleId: event.target.value }))
              }
              fullWidth
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </Modal>

      <Modal
        open={temporaryPassword !== null}
        onClose={() => {
          setTemporaryPassword(null);
          setCreatedEmail("");
        }}
        title="Password sementara"
        description={`Simpan sekarang. Password untuk ${createdEmail} tidak ditampilkan lagi.`}
        icon="lucide:key-round"
        tone="warning"
        size="sm"
        footer={
          <>
            <Button label="Tutup" variant="ghost" onClick={() => setTemporaryPassword(null)} />
            <Button
              label={copied ? "Tersalin" : "Salin password"}
              icon="lucide:copy"
              variant="solid"
              tone="primary"
              onClick={copyPassword}
            />
          </>
        }
      >
        <pre className={styles.codeBlock}>{temporaryPassword}</pre>
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Ubah admin"
        description={editing ? `${editing.name} · ${editing.email}` : undefined}
        icon="lucide:shield"
        tone="info"
        footer={
          <>
            <Button label="Batal" variant="ghost" onClick={() => setEditing(null)} />
            <Button
              label={saving ? "Menyimpan…" : "Simpan"}
              variant="solid"
              tone="primary"
              loading={saving}
              onClick={submitEdit}
            />
          </>
        }
      >
        <div className={styles.stack}>
          {editError ? (
            <Alert tone="danger" title="Gagal menyimpan" description={editError} />
          ) : null}
          <FormField label="Peran">
            <Select
              value={editRole}
              onChange={(event) => setEditRole(event.target.value)}
              fullWidth
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select
              value={editStatus}
              onChange={(event) =>
                setEditStatus(event.target.value as "ACTIVE" | "DISABLED")
              }
              fullWidth
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DISABLED">DISABLED</option>
            </Select>
          </FormField>
          <p className={styles.muted}>
            Menonaktifkan admin akan mencabut seluruh sesi admin tersebut.
          </p>
        </div>
      </Modal>
    </>
  );
}
