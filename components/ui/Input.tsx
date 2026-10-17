import type { InputHTMLAttributes, ReactNode } from "react";
import Icon from "./Icon";
import styles from "./Form.module.css";

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  icon?: string;
  iconRight?: string;
  endAdornment?: ReactNode;
  size?: "sm" | "md";
  invalid?: boolean;
  fullWidth?: boolean;
};

export default function Input({
  icon,
  iconRight,
  endAdornment,
  size = "md",
  invalid = false,
  fullWidth = false,
  className,
  disabled,
  ...rest
}: InputProps) {
  return (
    <div
      className={[styles.inputWrap, fullWidth ? styles.fullWidth : "", className]
        .filter(Boolean)
        .join(" ")}
      data-size={size}
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      {icon ? <Icon name={icon} className={styles.inputIcon} /> : null}
      <input
        className={styles.input}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {iconRight ? <Icon name={iconRight} className={styles.inputIcon} /> : null}
      {endAdornment}
    </div>
  );
}
