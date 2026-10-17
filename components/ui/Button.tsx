import type { ButtonHTMLAttributes } from "react";
import Icon from "./Icon";
import styles from "./Button.module.css";

export type ButtonTone = "default" | "primary" | "danger" | "success" | "warning";
export type ButtonVariant = "outline" | "solid" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon?: string;
  iconRight?: string;
  tone?: ButtonTone;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  iconOnly?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export default function Button({
  label,
  icon,
  iconRight,
  tone = "default",
  variant = "outline",
  size = "md",
  iconOnly = false,
  loading = false,
  fullWidth = false,
  className,
  type = "button",
  disabled,
  title,
  "aria-label": ariaLabel,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      data-icon-only={iconOnly ? "" : undefined}
      data-full-width={fullWidth ? "" : undefined}
      data-loading={loading ? "" : undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel ?? (iconOnly ? label : undefined)}
      title={iconOnly ? title ?? label : title}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : icon ? (
        <Icon name={icon} />
      ) : null}
      {iconOnly ? null : <span className={styles.label}>{label}</span>}
      {iconRight && !iconOnly && !loading ? <Icon name={iconRight} /> : null}
    </button>
  );
}
