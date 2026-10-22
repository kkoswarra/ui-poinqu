import type { AriaRole, ReactNode } from "react";
import Icon from "./Icon";
import Spinner, { type SpinnerTone } from "./Spinner";
import styles from "./Marker.module.css";

export type MarkerVariant = "default" | "border" | "separator";
export type MarkerTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "muted";

type MarkerProps = {
  children: ReactNode;
  variant?: MarkerVariant;
  tone?: MarkerTone;
  icon?: string;
  loading?: boolean;
  meta?: ReactNode;
  role?: AriaRole;
  className?: string;
};

const SPINNER_TONES: Record<MarkerTone, SpinnerTone> = {
  default: "default",
  info: "primary",
  success: "success",
  warning: "default",
  danger: "danger",
  muted: "muted",
};

export default function Marker({
  children,
  variant = "default",
  tone = "default",
  icon,
  loading = false,
  meta,
  role,
  className,
}: MarkerProps) {
  if (variant === "separator") {
    return (
      <div
        className={[styles.separator, className].filter(Boolean).join(" ")}
        data-tone={tone}
        role={role}
      >
        <span>{children}</span>
      </div>
    );
  }

  return (
    <div
      className={[styles.marker, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-tone={tone}
      role={role}
    >
      {loading ? (
        <Spinner size="sm" tone={SPINNER_TONES[tone]} className={styles.icon} />
      ) : icon ? (
        <Icon name={icon} className={styles.icon} />
      ) : null}
      <span className={styles.content}>{children}</span>
      {meta ? <span className={styles.meta}>{meta}</span> : null}
    </div>
  );
}
