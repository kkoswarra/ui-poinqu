"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import Button, { type ButtonTone, type ButtonVariant } from "./Button";
import Icon from "./Icon";
import styles from "./Dropdown.module.css";

export type DropdownItem = {
  type?: "item";
  label: string;
  icon?: string;
  shortcut?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  onSelect?: () => void;
};

export type DropdownEntry =
  | DropdownItem
  | { type: "separator" }
  | { type: "label"; label: string };

type DropdownProps = {
  label: string;
  icon?: string;
  iconRight?: string;
  tone?: ButtonTone;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  iconOnly?: boolean;
  align?: "start" | "end";
  items: DropdownEntry[];
  menuWidth?: number;
  className?: string;
};

type MenuPosition = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  maxHeight: number;
};

function computeMenuPosition(
  rect: DOMRect,
  align: "start" | "end",
  estimatedWidth: number,
): MenuPosition {
  const gap = 6;
  const margin = 8;
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - rect.bottom - gap - margin;
  const spaceAbove = rect.top - gap - margin;
  const openAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
  const maxHeight = Math.min(320, Math.max(140, openAbove ? spaceAbove : spaceBelow));

  if (align === "start") {
    return {
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? viewportHeight - rect.top + gap : undefined,
      left: Math.max(
        margin,
        Math.min(rect.left, window.innerWidth - estimatedWidth - margin),
      ),
      maxHeight,
    };
  }

  return {
    top: openAbove ? undefined : rect.bottom + gap,
    bottom: openAbove ? viewportHeight - rect.top + gap : undefined,
    right: Math.max(
      margin,
      Math.min(
        window.innerWidth - rect.right,
        window.innerWidth - estimatedWidth - margin,
      ),
    ),
    maxHeight,
  };
}

export default function Dropdown({
  label,
  icon,
  iconRight,
  tone,
  variant,
  size,
  iconOnly,
  align = "end",
  items,
  menuWidth,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  };

  const focusItem = (edge: "first" | "last") => {
    const menuItems = menuRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]:not(:disabled)',
    );
    if (!menuItems?.length) return;
    menuItems[edge === "first" ? 0 : menuItems.length - 1].focus();
  };

  const updatePosition = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition(
        computeMenuPosition(rect, align, menuWidth ?? 190),
      );
    }
  };

  const openMenu = () => {
    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const update = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition(
          computeMenuPosition(rect, align, menuWidth ?? 190),
        );
      }
    };

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [align, menuWidth, open]);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", closeOnOutside);
    return () => document.removeEventListener("click", closeOnOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      focusTrigger();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const menuItems = [
      ...(menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)',
      ) ?? []),
    ];
    if (!menuItems.length) return;

    const index = menuItems.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      menuItems[(index + 1) % menuItems.length].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      menuItems[(index - 1 + menuItems.length) % menuItems.length].focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      menuItems[0].focus();
    } else if (event.key === "End") {
      event.preventDefault();
      menuItems[menuItems.length - 1].focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        if (!open) {
          event.preventDefault();
          openMenu();
          requestAnimationFrame(() =>
            focusItem(event.key === "ArrowDown" ? "first" : "last"),
          );
          return;
        }
        if (!menuRef.current?.contains(document.activeElement)) {
          event.preventDefault();
          focusItem(event.key === "ArrowDown" ? "first" : "last");
        }
      }}
    >
      <Button
        label={label}
        icon={icon}
        iconRight={iconRight}
        tone={tone}
        variant={variant}
        size={size}
        iconOnly={iconOnly}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) setOpen(false);
          else openMenu();
        }}
      />

      {open && position ? (
        <div
          ref={menuRef}
          id={menuId}
          className={styles.menu}
          role="menu"
          aria-label={label}
          data-align={align}
          style={
            {
              ...(menuWidth ? { minWidth: menuWidth } : {}),
              ...position,
            } as CSSProperties
          }
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((entry, index) => {
            if (entry.type === "separator") {
              return (
                <div
                  key={`separator-${index}`}
                  className={styles.separator}
                  role="separator"
                />
              );
            }

            if (entry.type === "label") {
              return (
                <div key={`label-${index}-${entry.label}`} className={styles.menuLabel}>
                  {entry.label}
                </div>
              );
            }

            return (
              <button
                key={`item-${index}-${entry.label}`}
                type="button"
                role="menuitem"
                className={styles.item}
                data-tone={entry.tone}
                disabled={entry.disabled}
                onClick={() => {
                  entry.onSelect?.();
                  setOpen(false);
                  requestAnimationFrame(focusTrigger);
                }}
              >
                {entry.icon ? <Icon name={entry.icon} /> : null}
                <span>{entry.label}</span>
                {entry.shortcut ? <kbd>{entry.shortcut}</kbd> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
