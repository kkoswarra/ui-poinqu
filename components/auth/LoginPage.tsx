"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import FormField from "@/components/ui/FormField";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PasswordInput from "@/components/ui/PasswordInput";
import { useToast } from "@/components/ui/Toast";
import styles from "./LoginPage.module.css";

const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);

  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    if (!isEmail(email)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setError(null);
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setLoading(false);
      toast({
        title: "Welcome back",
        description: "You are signed in to the Poinqu admin demo.",
        tone: "success",
      });
      router.push("/dashboard");
    }, 1100);
  };

  const openReset = () => {
    setResetEmail(email);
    setResetError(null);
    setResetOpen(true);
  };

  const handleReset = () => {
    if (!isEmail(resetEmail)) {
      setResetError("Masukkan alamat email yang valid.");
      return;
    }

    setResetOpen(false);
    toast({
      title: "Reset link sent",
      description: `We sent a reset link to ${resetEmail.trim()}.`,
      tone: "success",
    });
  };

  const fillDemo = () => {
    setEmail("admin@poinqu.com");
    setPassword("demo1234");
    setError(null);
  };

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
          <p className={styles.eyebrow}>Support operations</p>
          <h1>Run your support operation with confidence.</h1>
          <p className={styles.brandText}>
            One workspace for tickets, SLAs, agents, and the insights that keep
            your customers happy.
          </p>

          <ul className={styles.featureList}>
            <li>
              <span className={styles.featureIcon}>
                <Icon name="lucide:check" />
              </span>
              Real-time SLA monitoring and breach alerts
            </li>
            <li>
              <span className={styles.featureIcon}>
                <Icon name="lucide:check" />
              </span>
              Team workload, routing, and shift schedules
            </li>
            <li>
              <span className={styles.featureIcon}>
                <Icon name="lucide:check" />
              </span>
              Audit-ready reporting for every conversation
            </li>
          </ul>
        </div>

        <figure className={styles.quoteCard}>
          <blockquote>
            “Poinqu keeps our first response time under two hours, even during
            peak season.”
          </blockquote>
          <figcaption>
            <span className={styles.quoteAvatar}>SL</span>
            <span>
              <strong>Sarah Lee</strong>
              <small>Support Lead · Northwind</small>
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
            <h1>Welcome back</h1>
            <p>Sign in to your Poinqu admin workspace.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {error ? (
              <Alert
                tone="danger"
                title="Unable to sign in"
                description={error}
              />
            ) : null}

            <FormField label="Email address" required>
              <Input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@company.com"
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
                placeholder="Enter your password"
                icon="lucide:lock"
                autoComplete="current-password"
                fullWidth
              />
            </FormField>

            <div className={styles.formRow}>
              <Checkbox
                label="Remember me for 30 days"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <button
                type="button"
                className={styles.textButton}
                onClick={openReset}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              label={loading ? "Signing in…" : "Sign in"}
              loading={loading}
              variant="solid"
              tone="primary"
              icon="lucide:log-in"
              iconRight={loading ? undefined : "lucide:arrow-right"}
              fullWidth
            />

            <div className={styles.divider}>
              <span>or continue with</span>
            </div>

            <Button
              label="Continue with SSO"
              icon="lucide:building-2"
              fullWidth
              onClick={() =>
                toast({
                  title: "SSO is not configured",
                  description:
                    "Connect your identity provider to enable single sign-on.",
                  tone: "info",
                })
              }
            />

            <div className={styles.demoHint}>
              <Icon name="lucide:info" />
              <p>
                Demo mode: any valid email and password (6+ characters) works.{" "}
                <button
                  type="button"
                  className={styles.inlineButton}
                  onClick={fillDemo}
                >
                  Use demo account
                </button>
              </p>
            </div>
          </form>

          <div className={styles.formFooter}>
            <span>© 2026 Poinqu</span>
            <span>Privacy · Terms · Status</span>
          </div>
        </div>
      </main>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset password"
        description="Enter your admin email and we'll send a reset link."
        icon="lucide:key-round"
        tone="info"
        size="sm"
        footer={
          <>
            <Button
              label="Cancel"
              variant="ghost"
              onClick={() => setResetOpen(false)}
            />
            <Button
              label="Send reset link"
              variant="solid"
              tone="primary"
              icon="lucide:send"
              onClick={handleReset}
            />
          </>
        }
      >
        <FormField
          label="Email address"
          error={resetError ?? undefined}
        >
          <Input
            type="email"
            value={resetEmail}
            onChange={(event) => {
              setResetEmail(event.target.value);
              setResetError(null);
            }}
            placeholder="you@company.com"
            icon="lucide:mail"
            autoComplete="email"
            fullWidth
          />
        </FormField>
      </Modal>
    </div>
  );
}
