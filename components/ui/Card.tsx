import type { ReactNode } from "react";
import Icon from "./Icon";
import styles from "./Card.module.css";

type CardProps = {
  children: ReactNode;
  variant?: "default" | "muted" | "elevated";
  interactive?: boolean;
  className?: string;
};

export default function Card({
  children,
  variant = "default",
  interactive = false,
  className,
}: CardProps) {
  return (
    <div
      className={[styles.card, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-interactive={interactive ? "" : undefined}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: string;
  as?: "h2" | "h3" | "h4";
  className?: string;
};

export function CardHeader({
  title,
  description,
  actions,
  icon,
  as = "h3",
  className,
}: CardHeaderProps) {
  const Heading = as;

  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      {icon ? (
        <span className={styles.headerIcon}>
          <Icon name={icon} />
        </span>
      ) : null}
      <div className={styles.headerText}>
        <Heading className={styles.headerTitle}>{title}</Heading>
        {description ? (
          <p className={styles.headerDescription}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className={styles.headerActions}>{actions}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  padding = "md",
  className,
}: {
  children: ReactNode;
  padding?: "none" | "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={[styles.body, className].filter(Boolean).join(" ")}
      data-padding={padding}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  align = "end",
  className,
}: {
  children: ReactNode;
  align?: "start" | "end" | "between";
  className?: string;
}) {
  return (
    <div
      className={[styles.footer, className].filter(Boolean).join(" ")}
      data-align={align}
    >
      {children}
    </div>
  );
}
