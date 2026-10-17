import type { ReactNode, SelectHTMLAttributes } from "react";
import Icon from "./Icon";
import styles from "./Form.module.css";

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> & {
  children: ReactNode;
  invalid?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

export default function Select({
  children,
  invalid = false,
  size = "md",
  fullWidth = false,
  className,
  disabled,
  ...rest
}: SelectProps) {
  return (
    <div
      className={[styles.selectWrap, fullWidth ? styles.fullWidth : "", className]
        .filter(Boolean)
        .join(" ")}
      data-size={size}
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <select
        className={styles.select}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>
      <Icon name="lucide:chevron-down" className={styles.selectIcon} />
    </div>
  );
}
