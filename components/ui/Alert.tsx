import type { ReactNode } from "react";
import Icon from "./Icon";
import styles from "./Alert.module.css";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONE_ICONS: Record<AlertTone, string> = {
  info: "lucide:info",
  success: "lucide:circle-check",
  warning: "lucide:triangle-alert",
  danger: "lucide:circle-alert",
};

type AlertProps = {
  title: string;
  description?: ReactNode;
  tone?: AlertTone;
  icon?: string;
  onDismiss?: () => void;
  className?: string;
};

export default function Alert({
  title,
  description,
  tone = "info",
  icon,
  onDismiss,
  className,
}: AlertProps) {
  return (
    <div
      className={[styles.alert, className].filter(Boolean).join(" ")}
      data-tone={tone}
      role="alert"
    >
      <Icon name={icon ?? TONE_ICONS[tone]} className={styles.icon} />
      <div className={styles.content}>
        <strong className={styles.title}>{title}</strong>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className={styles.close}
          aria-label="Dismiss alert"
          onClick={onDismiss}
        >
          <Icon name="lucide:x" />
        </button>
      ) : null}
    </div>
  );
}
