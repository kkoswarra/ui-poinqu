"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Button from "./Button";
import Icon from "./Icon";
import styles from "./AlertDialog.module.css";

export type AlertDialogTone = "default" | "danger" | "warning" | "success";

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  icon?: string;
  tone?: AlertDialogTone;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  loading?: boolean;
  size?: "default" | "sm";
};

const TONE_ICONS: Record<AlertDialogTone, string> = {
  default: "lucide:info",
  danger: "lucide:triangle-alert",
  warning: "lucide:alert-triangle",
  success: "lucide:circle-check",
};

const CONFIRM_TONES: Record<
  AlertDialogTone,
  "primary" | "danger" | "warning" | "success"
> = {
  default: "primary",
  danger: "danger",
  warning: "warning",
  success: "success",
};

export default function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  tone = "default",
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  size = "default",
}: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      data-tone={tone}
      data-size={size}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => {
        if (open) onOpenChange(false);
      }}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
    >
      <div className={styles.body}>
        <span className={styles.icon}>
          <Icon name={icon ?? TONE_ICONS[tone]} />
        </span>

        <div className={styles.text}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          label={cancelLabel}
          variant="outline"
          disabled={loading}
          onClick={() => onOpenChange(false)}
        />
        <Button
          label={confirmLabel}
          variant="solid"
          tone={CONFIRM_TONES[tone]}
          loading={loading}
          onClick={onConfirm}
        />
      </div>
    </dialog>
  );
}
