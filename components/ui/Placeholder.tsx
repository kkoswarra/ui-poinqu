import type { CSSProperties } from "react";
import styles from "./Placeholder.module.css";

export type PlaceholderVariant = "text" | "heading" | "circle" | "rect";

type PlaceholderProps = {
  variant?: PlaceholderVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
};

const toSize = (value: string | number | undefined) =>
  typeof value === "number" ? `${value}px` : value;

export default function Placeholder({
  variant = "text",
  width,
  height,
  lines = 1,
  animated = true,
  className,
  style,
}: PlaceholderProps) {
  const baseClass = [styles.placeholder, className].filter(Boolean).join(" ");
  const commonStyle: CSSProperties = {
    width: toSize(width),
    height: toSize(height),
    ...style,
  };

  if (variant === "text" && lines > 1) {
    return (
      <span className={styles.lines} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <span
            key={index}
            className={baseClass}
            data-variant="text"
            data-animated={animated ? "" : undefined}
            style={{
              width: index === lines - 1 ? "68%" : toSize(width) ?? "100%",
            }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={baseClass}
      data-variant={variant}
      data-animated={animated ? "" : undefined}
      style={
        variant === "circle"
          ? { width: toSize(width) ?? "40px", height: toSize(height) ?? "40px", ...style }
          : commonStyle
      }
    />
  );
}
