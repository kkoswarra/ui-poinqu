import type { InputHTMLAttributes } from "react";
import styles from "./Form.module.css";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  description?: string;
  indeterminate?: boolean;
};

export default function Checkbox({
  label,
  description,
  indeterminate = false,
  className,
  disabled,
  ...rest
}: CheckboxProps) {
  const setRef = (node: HTMLInputElement | null) => {
    if (node) node.indeterminate = indeterminate;
  };

  return (
    <label
      className={[styles.choice, className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "" : undefined}
    >
      <input
        ref={setRef}
        type="checkbox"
        className={styles.choiceInput}
        disabled={disabled}
        {...rest}
      />
      <span className={styles.checkBox} aria-hidden="true">
        <svg className={styles.checkMark} viewBox="0 0 12 12" focusable="false">
          {indeterminate ? (
            <path d="M2.5 6h7" />
          ) : (
            <path d="M2.6 6.2 4.9 8.4 9.4 3.4" />
          )}
        </svg>
      </span>
      {label || description ? (
        <span className={styles.choiceTexts}>
          {label ? <span className={styles.choiceLabel}>{label}</span> : null}
          {description ? (
            <span className={styles.choiceDescription}>{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
