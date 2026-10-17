import type { InputHTMLAttributes } from "react";
import styles from "./Form.module.css";

export type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  description?: string;
};

export default function Switch({
  label,
  description,
  className,
  disabled,
  ...rest
}: SwitchProps) {
  return (
    <label
      className={[styles.switch, className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "" : undefined}
    >
      <span className={styles.switchTexts}>
        <span className={styles.choiceLabel}>{label}</span>
        {description ? (
          <span className={styles.choiceDescription}>{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        role="switch"
        className={styles.choiceInput}
        disabled={disabled}
        {...rest}
      />
      <span className={styles.switchTrack} aria-hidden="true">
        <span className={styles.switchThumb} />
      </span>
    </label>
  );
}
