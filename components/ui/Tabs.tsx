"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Icon from "./Icon";
import styles from "./Tabs.module.css";

export type TabsVariant = "underline" | "pill";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>");
  }
  return context;
}

const slug = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "-");

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  children: ReactNode;
  className?: string;
};

export default function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = "underline",
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const baseId = useId();
  const currentValue = value ?? internalValue;

  const setValue = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue, baseId }}>
      <div
        className={[styles.tabs, className].filter(Boolean).join(" ")}
        data-variant={variant}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

type TabsListProps = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
};

export function TabsList({ children, ariaLabel, className }: TabsListProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const tabs = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not(:disabled)',
      ),
    ];
    if (!tabs.length) return;

    event.preventDefault();
    const currentIndex = tabs.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    let next = currentIndex;
    if (event.key === "ArrowRight") {
      next = currentIndex < 0 ? 0 : (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      next =
        currentIndex < 0
          ? tabs.length - 1
          : (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = tabs.length - 1;
    }

    tabs[next].focus();
    tabs[next].click();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[styles.list, className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

type TabProps = {
  value: string;
  icon?: string;
  badge?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export function Tab({
  value,
  icon,
  badge,
  disabled = false,
  children,
  className,
}: TabProps) {
  const context = useTabs();
  const selected = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${context.baseId}-tab-${slug(value)}`}
      aria-selected={selected}
      aria-controls={`${context.baseId}-panel-${slug(value)}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-selected={selected ? "" : undefined}
      className={[styles.tab, className].filter(Boolean).join(" ")}
      onClick={() => context.setValue(value)}
    >
      {icon ? <Icon name={icon} /> : null}
      <span>{children}</span>
      {badge !== undefined && badge !== null ? (
        <span className={styles.badge}>{badge}</span>
      ) : null}
    </button>
  );
}

type TabPanelProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabPanel({ value, children, className }: TabPanelProps) {
  const context = useTabs();
  const selected = context.value === value;

  return (
    <div
      role="tabpanel"
      id={`${context.baseId}-panel-${slug(value)}`}
      aria-labelledby={`${context.baseId}-tab-${slug(value)}`}
      hidden={!selected}
      tabIndex={0}
      className={[styles.panel, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
