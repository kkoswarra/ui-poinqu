import type { ReactNode } from "react";
import styles from "./ButtonGroup.module.css";

type ButtonGroupProps = {
  children: ReactNode;
  "aria-label": string;
  className?: string;
};

export default function ButtonGroup({
  children,
  "aria-label": ariaLabel,
  className,
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={[styles.group, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
