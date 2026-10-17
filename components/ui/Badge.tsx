import type { ReactNode } from "react";
import type { Tone } from "@/lib/data";
import Icon from "./Icon";
import styles from "./Badge.module.css";

export type BadgeTone = Tone | "neutral";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: "soft" | "solid" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
  icon?: string;
  className?: string;
};

export default function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  size = "md",
  dot = false,
  icon,
  className,
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {icon ? <Icon name={icon} /> : null}
      <span>{children}</span>
    </span>
  );
}
