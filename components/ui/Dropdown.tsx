"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  };

  const focusItem = (position: "first" | "last") => {
    const menuItems = menuRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]:not(:disabled)',
    );
    if (!menuItems?.length) return;
    menuItems[position === "first" ? 0 : menuItems.length - 1].focus();
  };

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
          setOpen(true);
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
        onClick={() => setOpen((previous) => !previous)}
      />

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          className={styles.menu}
          role="menu"
          aria-label={label}
          data-align={align}
          style={menuWidth ? { minWidth: menuWidth } : undefined}
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
