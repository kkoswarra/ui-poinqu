import type { ReactNode } from "react";
import Icon from "./Icon";
import styles from "./ListGroup.module.css";

type ListGroupProps = {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
};

export default function ListGroup({
  children,
  ariaLabel,
  className,
}: ListGroupProps) {
  return (
    <ul
      className={[styles.listGroup, className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {children}
    </ul>
  );
}

type ListGroupItemProps = {
  title: string;
  description?: string;
  icon?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  active?: boolean;
  className?: string;
};

export function ListGroupItem({
  title,
  description,
  icon,
  meta,
  actions,
  active = false,
  className,
}: ListGroupItemProps) {
  return (
    <li
      className={[styles.item, className].filter(Boolean).join(" ")}
      data-active={active ? "" : undefined}
    >
      {icon ? (
        <span className={styles.leading}>
          <Icon name={icon} />
        </span>
      ) : null}
      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {description ? (
          <span className={styles.description}>{description}</span>
        ) : null}
      </span>
      {meta ? <span className={styles.meta}>{meta}</span> : null}
      {actions ? <span className={styles.actions}>{actions}</span> : null}
    </li>
  );
}
