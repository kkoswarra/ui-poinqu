import type { ReactNode } from "react";
import Icon from "./Icon";
import Spinner from "./Spinner";
import styles from "./Attachment.module.css";

export type AttachmentState =
  | "idle"
  | "uploading"
  | "processing"
  | "error"
  | "done";
export type AttachmentSize = "default" | "sm" | "xs";

type AttachmentProps = {
  name: string;
  meta?: string;
  icon?: string;
  image?: string;
  state?: AttachmentState;
  progress?: number;
  size?: AttachmentSize;
  orientation?: "horizontal" | "vertical";
  onOpen?: () => void;
  onRemove?: () => void;
  className?: string;
};

function stateDescription(
  state: AttachmentState,
  meta: string | undefined,
  progress: number | undefined,
) {
  if (state === "uploading") {
    return progress === undefined
      ? "Uploading…"
      : `Uploading · ${Math.round(progress)}%`;
  }
  if (state === "processing") return "Processing document…";
  if (state === "error") return "Upload failed. Try again.";
  return meta;
}

export default function Attachment({
  name,
  meta,
  icon = "lucide:file-text",
  image,
  state = "done",
  progress,
  size = "default",
  orientation = "horizontal",
  onOpen,
  onRemove,
  className,
}: AttachmentProps) {
  const clampedProgress =
    progress === undefined ? undefined : Math.min(100, Math.max(0, progress));
  const description = stateDescription(state, meta, clampedProgress);

  return (
    <div
      className={[styles.attachment, className].filter(Boolean).join(" ")}
      data-state={state}
      data-size={size}
      data-orientation={orientation}
    >
      {onOpen ? (
        <button
          type="button"
          className={styles.trigger}
          aria-label={`Preview ${name}`}
          onClick={onOpen}
        />
      ) : null}

      <span className={styles.media}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- attachment previews accept arbitrary local or remote files.
          <img src={image} alt="" />
        ) : (
          <Icon name={icon} />
        )}
      </span>

      <span className={styles.content}>
        <span className={styles.title}>{name}</span>
        {description ? (
          <span className={styles.description}>{description}</span>
        ) : null}
        {state === "uploading" ? (
          <span className={styles.progress} aria-hidden="true">
            <span style={{ width: `${clampedProgress ?? 0}%` }} />
          </span>
        ) : null}
      </span>

      <span className={styles.actions}>
        {state === "processing" ? <Spinner size="sm" label="Processing" /> : null}
        {state === "error" ? (
          <Icon name="lucide:circle-alert" className={styles.errorIcon} />
        ) : null}
        {onRemove ? (
          <button
            type="button"
            className={styles.action}
            aria-label={`Remove ${name}`}
            onClick={onRemove}
          >
            <Icon name="lucide:x" />
          </button>
        ) : null}
      </span>
    </div>
  );
}

export function AttachmentGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.group, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
