"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
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
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
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

  useLayoutEffect(() => {
    if (!visible) return;

    const trigger = wrapperRef.current?.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const rect = tooltip.getBoundingClientRect();
    const gap = 8;
    const margin = 8;
    let top = 0;
    let left = 0;

    if (placement === "top") {
      top = trigger.top - rect.height - gap;
      left = trigger.left + trigger.width / 2 - rect.width / 2;
    } else if (placement === "bottom") {
      top = trigger.bottom + gap;
      left = trigger.left + trigger.width / 2 - rect.width / 2;
    } else if (placement === "left") {
      top = trigger.top + trigger.height / 2 - rect.height / 2;
      left = trigger.left - rect.width - gap;
    } else {
      top = trigger.top + trigger.height / 2 - rect.height / 2;
      left = trigger.right + gap;
    }

    top = Math.max(margin, Math.min(top, window.innerHeight - rect.height - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - rect.width - margin));

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }, [content, placement, visible]);

  useEffect(() => {
    if (!visible) return;

    const hideOnMove = () => setVisible(false);
    window.addEventListener("scroll", hideOnMove, true);
    window.addEventListener("resize", hideOnMove);
    return () => {
      window.removeEventListener("scroll", hideOnMove, true);
      window.removeEventListener("resize", hideOnMove);
    };
  }, [visible]);

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
      ref={wrapperRef}
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
          ref={tooltipRef}
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
