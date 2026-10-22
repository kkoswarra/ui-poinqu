"use client";

import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import Spinner from "./Spinner";
import styles from "./Trace.module.css";

export type TraceStatus = "done" | "running" | "error" | "pending";

export type TraceItem = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  status?: TraceStatus;
  meta?: ReactNode;
  detail?: ReactNode;
  defaultOpen?: boolean;
};

type TraceProps = {
  items: TraceItem[];
  ariaLabel?: string;
  className?: string;
};

const STATUS_ICONS: Record<TraceStatus, string> = {
  done: "lucide:check",
  running: "lucide:loader-circle",
  error: "lucide:x",
  pending: "lucide:circle-dashed",
};

function TraceLine({
  item,
  status,
  expandable,
}: {
  item: TraceItem;
  status: TraceStatus;
  expandable: boolean;
}) {
  return (
    <span className={styles.line}>
      <span
        className={styles.icon}
        aria-hidden={status === "running" ? undefined : true}
      >
        {status === "running" ? (
          <Spinner size="sm" label={`${item.title} running`} />
        ) : (
          <Icon name={item.icon ?? STATUS_ICONS[status]} />
        )}
      </span>

      <span className={styles.text}>
        <span className={styles.title}>{item.title}</span>
        {item.description ? (
          <span className={styles.description}>{item.description}</span>
        ) : null}
      </span>

      {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
      {expandable ? (
        <Icon name="lucide:chevron-down" className={styles.chevron} />
      ) : null}
    </span>
  );
}

function TraceCollapsible({
  item,
  status,
}: {
  item: TraceItem;
  status: TraceStatus;
}) {
  const [open, setOpen] = useState(Boolean(item.defaultOpen));

  return (
    <details
      className={styles.collapsible}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className={styles.summary}>
        <TraceLine item={item} status={status} expandable />
      </summary>
      <div className={styles.detail}>{item.detail}</div>
    </details>
  );
}

export default function Trace({
  items,
  ariaLabel = "Trace",
  className,
}: TraceProps) {
  return (
    <ol
      className={[styles.trace, className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const status = item.status ?? "done";

        return (
          <li key={item.id} className={styles.item} data-status={status}>
            {item.detail ? (
              <TraceCollapsible item={item} status={status} />
            ) : (
              <TraceLine item={item} status={status} expandable={false} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
