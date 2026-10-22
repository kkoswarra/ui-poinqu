import type { ElementType, ReactNode } from "react";
import styles from "./Typography.module.css";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "lead"
  | "body"
  | "small"
  | "muted"
  | "label"
  | "code"
  | "quote";

export type TypographyTone =
  | "default"
  | "secondary"
  | "muted"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type TypographyWeight = "regular" | "medium" | "semibold";

type TypographyProps = {
  children: ReactNode;
  as?: ElementType;
  variant?: TypographyVariant;
  tone?: TypographyTone;
  weight?: TypographyWeight;
  align?: "left" | "center" | "right";
  truncate?: boolean;
  className?: string;
};

const DEFAULT_TAG: Record<TypographyVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  lead: "p",
  body: "p",
  small: "p",
  muted: "p",
  label: "span",
  code: "code",
  quote: "blockquote",
};

export default function Typography({
  children,
  as,
  variant = "body",
  tone = "default",
  weight,
  align = "left",
  truncate = false,
  className,
}: TypographyProps) {
  const Tag = as ?? DEFAULT_TAG[variant];

  return (
    <Tag
      className={[styles.typography, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-tone={tone}
      data-weight={weight}
      data-align={align === "left" ? undefined : align}
      data-truncate={truncate ? "" : undefined}
    >
      {children}
    </Tag>
  );
}
