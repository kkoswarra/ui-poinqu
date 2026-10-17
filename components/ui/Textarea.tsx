import type { TextareaHTMLAttributes } from "react";
import styles from "./Form.module.css";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export default function Textarea({
  invalid = false,
  className,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      className={[styles.textarea, className].filter(Boolean).join(" ")}
      data-invalid={invalid ? "" : undefined}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
