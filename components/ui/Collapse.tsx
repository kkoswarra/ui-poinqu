"use client";

import { useState, type ReactNode, type SyntheticEvent } from "react";
import Icon from "./Icon";
import styles from "./Collapse.module.css";

export type CollapseTone = "default" | "info" | "success" | "warning" | "danger";

type CollapseProps = {
  title: string;
  description?: string;
  icon?: string;
  badge?: ReactNode;
  tone?: CollapseTone;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
};

export default function Collapse({
  title,
  description,
  icon,
  badge,
  tone = "default",
  defaultOpen = false,
  open,
  onOpenChange,
  children,
  className,
}: CollapseProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;

  const handleToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const next = event.currentTarget.open;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <details
      className={[styles.collapse, className].filter(Boolean).join(" ")}
      data-tone={tone}
      open={isOpen}
      onToggle={handleToggle}
    >
      <summary className={styles.summary}>
        {icon ? (
          <span className={styles.icon}>
            <Icon name={icon} />
          </span>
        ) : null}
        <span className={styles.texts}>
          <span className={styles.title}>{title}</span>
          {description ? (
            <span className={styles.description}>{description}</span>
          ) : null}
        </span>
        {badge !== undefined && badge !== null ? (
          <span className={styles.badge}>{badge}</span>
        ) : null}
        <Icon name="lucide:chevron-down" className={styles.chevron} />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
