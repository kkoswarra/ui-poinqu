"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { ApiError, adminApi } from "@/lib/admin-api";
import { getAccessToken, saveSession } from "@/lib/admin-session";
import type { AdminAuthResult, LoginStep } from "@/lib/admin-types";
import styles from "./LoginPage.module.css";

type Step = "credentials" | "password" | "setup" | "verify";

const STEP_COPY: Record<Step, { title: string; description: string }> = {
  credentials: {
    title: "Masuk ke admin",
    description: "Gunakan email dan password akun admin Poinqu.",
  },
  password: {
    title: "Ganti password",
    description: "Password sementara wajib diganti sebelum melanjutkan.",
  },
  setup: {
    title: "Aktifkan 2FA",
    description: "Simpan secret ini di aplikasi authenticator, lalu masukkan kodenya.",
  },
  verify: {
    title: "Verifikasi 2FA",
    description: "Masukkan 6 digit kode dari aplikasi authenticator.",
  },
};

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    const field = error.errors?.[0];
    return field ? `${error.message} ${field.message}` : error.message;
  }
  return "Terjadi kesalahan. Coba lagi.";
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [secret, setSecret] = useState("");
  const [otpauth, setOtpauth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const finish = (result: AdminAuthResult) => {
    saveSession(result.admin, result.tokens);
    router.replace("/dashboard");
  };

  const continueStep = async (nextStep: LoginStep, token: string) => {
    setChallenge(token);
    if (nextStep === "CHANGE_PASSWORD") {
      setStep("password");
      return;
    }
    if (nextStep === "SETUP_2FA") {
      const setup = await adminApi.setupTwoFactor(token);
      setSecret(setup.secret);
      setOtpauth(setup.otpauth_uri);
      setStep("setup");
      return;
    }
    setStep("verify");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await adminApi.login(email.trim(), password);
      await continueStep(result.next_step, result.challenge_token);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (newPassword.length < 12) {
      setError("Password baru minimal 12 karakter.");
      return;
    }
    if (newPassword !== confirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await adminApi.changePassword(
        challenge,
        password,
        newPassword,
      );
      setPassword(newPassword);
      await continueStep(result.next_step, result.challenge_token);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Kode 2FA harus 6 digit.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result =
        step === "setup"
          ? await adminApi.enableTwoFactor(challenge, code)
          : await adminApi.verifyTwoFactor(challenge, code);
      finish(result);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const back = () => {
    setStep("credentials");
    setPassword("");
    setNewPassword("");
    setConfirmation("");
    setCode("");
    setChallenge("");
    setSecret("");
    setOtpauth("");
    setError(null);
  };

  const copy = STEP_COPY[step];

  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <div className={styles.brandTop}>
          <Link href="/" className={styles.brandLink} aria-label="Poinqu home">
            <span className={styles.logo} aria-hidden="true">
              P
            </span>
            <strong>Poinqu</strong>
          </Link>
          <span className={styles.consoleBadge}>
            <Icon name="lucide:shield-check" />
            Admin console
          </span>
        </div>

        <div className={styles.brandContent}>
          <p className={styles.eyebrow}>Wallet operations</p>
          <h1>Kelola dompet digital dari satu konsol.</h1>
          <p className={styles.brandText}>
            Verifikasi pengguna, tinjau pemulihan nomor, atur batas, dan audit
            setiap aksi admin.
          </p>

          <ul className={styles.featureList}>
            <li>
              <span className={styles.featureIcon}>
                <Icon name="lucide:check" />
              </span>
              Pengawasan pengguna dan status KYC
            </li>
            <li>
              <span className={styles.featureIcon}>
                <Icon name="lucide:check" />
              </span>
              Antrean pemulihan nomor dengan maker-checker
            </li>
            <li>
              <span className={styles.featureIcon}>
                <Icon name="lucide:check" />
              </span>
              Pengaturan berversi dan audit log
            </li>
          </ul>
        </div>

        <figure className={styles.quoteCard}>
          <blockquote>
            “Setiap perubahan sensitif tercatat, dari batas saldo sampai
            keputusan pemulihan.”
          </blockquote>
          <figcaption>
            <span className={styles.quoteAvatar}>PQ</span>
            <span>
              <strong>Poinqu Security</strong>
              <small>Admin access policy</small>
            </span>
          </figcaption>
        </figure>

        <div className={styles.brandFooter}>
          <span>© 2026 Poinqu</span>
          <span>Secure admin workspace</span>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.mobileBrand}>
          <Link href="/" className={styles.brandLink} aria-label="Poinqu home">
            <span className={styles.logo} aria-hidden="true">
              P
            </span>
            <strong>Poinqu</strong>
          </Link>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <span className={styles.adminChip}>
              <Icon name="lucide:shield-check" />
              Admin console
            </span>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </div>

          {error ? (
            <div className={styles.formError}>
              <Alert
                tone="danger"
                title="Tidak dapat memproses"
                description={error}
              />
            </div>
          ) : null}

          {step === "credentials" ? (
            <form className={styles.form} onSubmit={handleLogin} noValidate>
              <FormField label="Email address" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="owner@poinqu.id"
                  icon="lucide:mail"
                  autoComplete="email"
                  fullWidth
                />
              </FormField>

              <FormField label="Password" required>
                <PasswordInput
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Masukkan password admin"
                  icon="lucide:lock"
                  autoComplete="current-password"
                  fullWidth
                />
              </FormField>

              <Button
                type="submit"
                label={loading ? "Memeriksa…" : "Masuk"}
                loading={loading}
                variant="solid"
                tone="primary"
                icon="lucide:log-in"
                iconRight={loading ? undefined : "lucide:arrow-right"}
                fullWidth
              />
            </form>
          ) : null}

          {step === "password" ? (
            <form
              className={styles.form}
              onSubmit={handleChangePassword}
              noValidate
            >
              <div className={styles.stepNote}>
                <Icon name="lucide:info" />
                <span>
                  Password lama: password sementara dari pembuatan akun admin.
                </span>
              </div>

              <FormField label="Password baru" required hint="Minimal 12 karakter.">
                <PasswordInput
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Password baru"
                  icon="lucide:key-round"
                  autoComplete="new-password"
                  fullWidth
                />
              </FormField>

              <FormField label="Konfirmasi password" required>
                <PasswordInput
                  value={confirmation}
                  onChange={(event) => {
                    setConfirmation(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ulangi password baru"
                  icon="lucide:key-round"
                  autoComplete="new-password"
                  fullWidth
                />
              </FormField>

              <Button
                type="submit"
                label={loading ? "Menyimpan…" : "Ganti password"}
                loading={loading}
                variant="solid"
                tone="primary"
                icon="lucide:save"
                fullWidth
              />

              <div className={styles.backRow}>
                <button type="button" className={styles.textButton} onClick={back}>
                  Kembali ke login
                </button>
              </div>
            </form>
          ) : null}

          {step === "setup" || step === "verify" ? (
            <form className={styles.form} onSubmit={handleCode} noValidate>
              {step === "setup" ? (
                <>
                  <div className={styles.secretBox}>
                    <div>
                      <span>Secret TOTP</span>
                      <code>{secret}</code>
                    </div>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={copySecret}
                    >
                      {copied ? "Tersalin" : "Salin"}
                    </button>
                  </div>
                  <p className={styles.secretHint}>
                    Tambahkan ke Google Authenticator/Authy, atau buka tautan{" "}
                    <a href={otpauth} target="_blank" rel="noreferrer">
                      otpauth
                    </a>
                    .
                  </p>
                </>
              ) : null}

              <FormField label="Kode 6 digit" required>
                <Input
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    if (error) setError(null);
                  }}
                  placeholder="123456"
                  icon="lucide:hash"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  fullWidth
                />
              </FormField>

              <Button
                type="submit"
                label={
                  loading
                    ? "Memverifikasi…"
                    : step === "setup"
                      ? "Aktifkan 2FA"
                      : "Verifikasi & masuk"
                }
                loading={loading}
                variant="solid"
                tone="primary"
                icon="lucide:shield-check"
                fullWidth
              />

              <div className={styles.backRow}>
                <button type="button" className={styles.textButton} onClick={back}>
                  Kembali ke login
                </button>
              </div>
            </form>
          ) : null}

          <div className={styles.formFooter}>
            <span>© 2026 Poinqu</span>
            <span>Admin access only</span>
          </div>
        </div>
      </main>
    </div>
  );
}
