"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
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
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/admin/PageHeader";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ApiError, adminApi } from "@/lib/admin-api";
import type { AppSetting } from "@/lib/admin-types";
import { asString, formatDate } from "@/lib/format";
import styles from "@/components/admin/AdminPages.module.css";

type EditKind = "boolean" | "number" | "string" | "json";

function kindOf(value: unknown): EditKind {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  return "json";
}

export default function SettingsPage() {
  const { hasPermission } = useAdminSession();
  const { toast } = useToast();
  const [items, setItems] = useState<AppSetting[]>([]);
  const [prefix, setPrefix] = useState("");
  const [appliedPrefix, setAppliedPrefix] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<AppSetting | null>(null);
  const [kind, setKind] = useState<EditKind>("string");
  const [editValue, setEditValue] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canWrite = hasPermission("settings.write");
  const allowed = hasPermission("settings.read");

  const load = useCallback(async () => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.settings(appliedPrefix.trim() || undefined);
      setItems(result.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat pengaturan.");
    } finally {
      setLoading(false);
    }
  }, [allowed, appliedPrefix]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch data klien setelah sesi siap
    void load();
  }, [load]);

  const submitFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (prefix.trim() === appliedPrefix.trim()) {
      void load();
      return;
    }
    setAppliedPrefix(prefix);
  };

  const openEdit = (setting: AppSetting) => {
    const nextKind = kindOf(setting.value);
    setKind(nextKind);
    setEditValue(
      nextKind === "json" ? JSON.stringify(setting.value, null, 2) : asString(setting.value),
    );
    setReason("");
    setFormError(null);
    setEditing(setting);
  };

  const parsedValue = useMemo(() => {
    if (!editing) return { ok: false as const, value: undefined };
    if (kind === "boolean") {
      return { ok: true as const, value: editValue === "true" };
    }
    if (kind === "number") {
      const value = Number(editValue);
      return { ok: Number.isFinite(value) as boolean, value };
    }
    if (kind === "json") {
      try {
        return { ok: true as const, value: JSON.parse(editValue) as unknown };
      } catch {
        return { ok: false as const, value: undefined };
      }
    }
    return { ok: true as const, value: editValue };
  }, [editValue, editing, kind]);

  const submitEdit = async () => {
    if (!editing || saving) return;
    if (!parsedValue.ok) {
      setFormError("Nilai tidak valid untuk tipe data ini.");
      return;
    }
    if (reason.trim().length < 10) {
      setFormError("Alasan perubahan minimal 10 karakter.");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await adminApi.updateSetting(editing.key, {
        value: parsedValue.value,
        version: editing.version,
        reason: reason.trim(),
      });
      setEditing(null);
      toast({ title: "Pengaturan diperbarui", tone: "success" });
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.code === "SETTING_VERSION_CONFLICT") {
        const detail = err.details as { current_version?: number } | null;
        setFormError(
          `Versi berubah menjadi ${detail?.current_version ?? "baru"}. Muat ulang lalu coba lagi.`,
        );
        await load();
      } else {
        setFormError(
          err instanceof ApiError ? err.message : "Gagal menyimpan pengaturan.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!allowed) {
    return (
      <Alert
        tone="warning"
        title="Akses terbatas"
        description="Akun admin ini tidak punya izin settings.read."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Konfigurasi"
        title="Pengaturan aplikasi"
        description="Nilai berversi. Perubahan menyimpan audit before/after beserta alasannya."
      />

      <Card>
        <CardBody>
          <form className={styles.toolbar} onSubmit={submitFilter}>
            <div className={styles.grow}>
              <Input
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
                placeholder="Filter awalan, mis. security. atau otp."
                icon="lucide:filter"
                fullWidth
              />
            </div>
            <Button type="submit" label="Muat" icon="lucide:refresh-cw" />
          </form>
        </CardBody>
      </Card>

      {error ? <Alert tone="danger" title="Gagal memuat" description={error} /> : null}

      <Card>
        <CardHeader
          title="Daftar pengaturan"
          description="Kunci konfigurasi beserta versi dan riwayat pembaruannya."
          icon="lucide:sliders-horizontal"
        />
        <CardBody padding="none">
          {loading ? (
            <div className={styles.loading}>
              <Spinner size="lg" label="Memuat pengaturan" />
            </div>
          ) : items.length ? (
            <div className={styles.tableRegion}>
            <Table ariaLabel="Daftar pengaturan" minWidth={980} flush>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Kunci</TableHeaderCell>
                  <TableHeaderCell>Nilai</TableHeaderCell>
                  <TableHeaderCell>Versi</TableHeaderCell>
                  <TableHeaderCell>Diperbarui</TableHeaderCell>
                  <TableHeaderCell>Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((setting) => (
                  <TableRow key={setting.key}>
                    <TableCell>
                      <div className={styles.monoCell}>{setting.key}</div>
                      <span className={styles.muted}>{setting.description || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className={styles.monoCell}>{asString(setting.value)}</span>
                    </TableCell>
                    <TableCell>v{setting.version}</TableCell>
                    <TableCell>
                      <div>{formatDate(setting.updated_at)}</div>
                      <span className={styles.muted}>{setting.updated_by || "seed"}</span>
                    </TableCell>
                    <TableCell>
                      {canWrite ? (
                        <Button
                          label="Ubah"
                          size="sm"
                          icon="lucide:pencil"
                          onClick={() => openEdit(setting)}
                        />
                      ) : (
                        <span className={styles.muted}>Read-only</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className={styles.empty}>Tidak ada pengaturan pada awalan ini.</p>
          )}
        </CardBody>
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Ubah pengaturan"
        description={editing?.key}
        icon="lucide:sliders-horizontal"
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
        {editing ? (
          <div className={styles.stack}>
            {formError ? (
              <Alert tone="danger" title="Gagal menyimpan" description={formError} />
            ) : null}

            <p className={styles.muted}>
              {editing.description || "Tidak ada deskripsi."} · versi saat ini v
              {editing.version}
            </p>

            <FormField label="Nilai">
              {kind === "boolean" ? (
                <Select
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  fullWidth
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </Select>
              ) : kind === "number" ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  fullWidth
                />
              ) : kind === "json" ? (
                <Textarea
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  rows={8}
                  spellCheck={false}
                />
              ) : (
                <Input
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  fullWidth
                />
              )}
            </FormField>

            <FormField label="Alasan perubahan" required hint="Minimal 10 karakter.">
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Contoh: Penyesuaian kebijakan keamanan."
              />
            </FormField>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
