"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Icon from "./Icon";
import styles from "./Modal.module.css";

export type ModalTone = "default" | "info" | "success" | "warning" | "danger";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: string;
  tone?: ModalTone;
  size?: "sm" | "md" | "lg";
  presentation?: "center" | "sheet" | "fullscreen";
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  tone = "default",
  size = "md",
  presentation = "center",
  children,
  footer,
  closeOnBackdrop = true,
}: ModalProps) {
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
      data-size={size}
      data-presentation={presentation}
      data-tone={tone}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => {
        if (open) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (!closeOnBackdrop) return;
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const outside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom;
        if (outside) onClose();
      }}
    >
      <div className={styles.header}>
        {icon ? (
          <span className={styles.icon}>
            <Icon name={icon} />
          </span>
        ) : null}
        <div className={styles.headerText}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className={styles.close}
          aria-label="Close modal"
          onClick={onClose}
        >
          <Icon name="lucide:x" />
        </button>
      </div>

      {children ? <div className={styles.body}>{children}</div> : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </dialog>
  );
}
