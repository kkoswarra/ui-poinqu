"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

type TooltipChildProps = {
  "aria-describedby"?: string;
};

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  className?: string;
};

export default function Tooltip({
  content,
  children,
  placement = "top",
  delay = 120,
  disabled = false,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const hovered = useRef(false);
  const focused = useRef(false);
  const id = useId();

  const clearTimer = () => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
      timer.current = undefined;
    }
  };

  const show = () => {
    if (disabled) return;
    clearTimer();
    timer.current = window.setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimer();
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
    };
  }, []);

  const child = isValidElement(children)
    ? (children as ReactElement<Record<string, unknown>>)
    : null;
  const childProps = child?.props as TooltipChildProps | undefined;

  const describedBy = visible
    ? [childProps?.["aria-describedby"], id].filter(Boolean).join(" ")
    : childProps?.["aria-describedby"];

  const trigger = child
    ? cloneElement(child, { "aria-describedby": describedBy })
    : children;

  return (
    <span
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      onMouseEnter={() => {
        hovered.current = true;
        show();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        if (!focused.current) hide();
      }}
      onFocus={() => {
        focused.current = true;
        show();
      }}
      onBlur={() => {
        focused.current = false;
        if (!hovered.current) hide();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") hide();
      }}
    >
      {trigger}
      {visible ? (
        <span
          role="tooltip"
          id={id}
          className={styles.tooltip}
          data-placement={placement}
        >
          {content}
          <span className={styles.arrow} aria-hidden="true" />
        </span>
      ) : null}
    </span>
  );
}
