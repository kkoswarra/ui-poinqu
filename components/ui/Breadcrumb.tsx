import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import Icon from "./Icon";
import styles from "./Breadcrumb.module.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  icon?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  ariaLabel?: string;
  separator?: ReactNode;
  className?: string;
};

export default function Breadcrumb({
  items,
  ariaLabel = "Breadcrumb",
  separator = "/",
  className,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={[styles.breadcrumb, className].filter(Boolean).join(" ")}
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <li className={styles.separator} aria-hidden="true">
                  {separator}
                </li>
              ) : null}
              <li className={styles.item}>
                {!last && item.href ? (
                  <Link href={item.href} className={styles.link}>
                    {item.icon ? <Icon name={item.icon} /> : null}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={last ? styles.current : styles.text}
                    aria-current={last ? "page" : undefined}
                  >
                    {item.icon ? <Icon name={item.icon} /> : null}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
