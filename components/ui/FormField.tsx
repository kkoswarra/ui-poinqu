"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./Form.module.css";

type FormFieldProps = {
  label: string;
  id?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export default function FormField({
  label,
  id,
  hint,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const child = isValidElement(children)
    ? (children as ReactElement<Record<string, unknown>>)
    : null;

  const childId =
    typeof child?.props.id === "string" ? child.props.id : undefined;
  const controlId = childId ?? id ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  const existingDescribedBy =
    typeof child?.props["aria-describedby"] === "string"
      ? child.props["aria-describedby"]
      : undefined;
  const describedBy =
    [existingDescribedBy, error ? errorId : hint ? hintId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  const control = child
    ? cloneElement(child, {
        id: controlId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : child.props["aria-invalid"],
        invalid: error ? true : child.props.invalid,
        required: required ?? child.props.required,
      })
    : children;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={controlId}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {control}
      {error ? (
        <p className={styles.errorText} id={errorId}>
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
