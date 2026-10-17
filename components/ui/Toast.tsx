"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Icon from "./Icon";
import styles from "./Toast.module.css";

export type ToastTone = "info" | "success" | "warning" | "danger";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastOptions = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: ToastAction;
};

type ToastRecord = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
  action?: ToastAction;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICONS: Record<ToastTone, string> = {
  info: "lucide:info",
  success: "lucide:circle-check",
  warning: "lucide:triangle-alert",
  danger: "lucide:circle-alert",
};

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastRecord;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    if (!item.duration) return;
    const timer = window.setTimeout(() => onDismiss(item.id), item.duration);
    return () => window.clearTimeout(timer);
  }, [item.duration, item.id, onDismiss]);

  return (
    <div
      className={styles.toast}
      data-tone={item.tone}
      role="status"
      style={{ "--toast-duration": `${item.duration}ms` } as CSSProperties}
    >
      <span className={styles.icon}>
        <Icon name={TONE_ICONS[item.tone]} />
      </span>
      <div className={styles.content}>
        <strong className={styles.title}>{item.title}</strong>
        {item.description ? (
          <p className={styles.description}>{item.description}</p>
        ) : null}
        {item.action ? (
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              item.action?.onClick();
              onDismiss(item.id);
            }}
          >
            {item.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss notification"
        onClick={() => onDismiss(item.id)}
      >
        <Icon name="lucide:x" />
      </button>
      {item.duration ? <span className={styles.progress} aria-hidden="true" /> : null}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = ++nextId.current;
    const record: ToastRecord = {
      id,
      title: options.title,
      description: options.description,
      tone: options.tone ?? "info",
      duration: options.duration ?? 4200,
      action: options.action,
    };
    setToasts((previous) => [...previous.slice(-3), record]);
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={styles.viewport}
        aria-live="polite"
        aria-atomic="false"
        aria-label="Notifications"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
