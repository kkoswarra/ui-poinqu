import type {
  HTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import styles from "./Table.module.css";

type CellAlign = "left" | "center" | "right";

type TableProps = {
  children: ReactNode;
  ariaLabel?: string;
  caption?: string;
  minWidth?: number;
  className?: string;
};

export default function Table({
  children,
  ariaLabel,
  caption,
  minWidth = 720,
  className,
}: TableProps) {
  return (
    <div className={styles.wrapper}>
      <table
        className={[styles.table, className].filter(Boolean).join(" ")}
        style={{ minWidth }}
        aria-label={ariaLabel}
      >
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className={styles.head}>{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className={styles.body}>{children}</tbody>;
}

type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
  selected?: boolean;
};

export function TableRow({
  children,
  selected = false,
  className,
  ...rest
}: TableRowProps) {
  return (
    <tr
      {...rest}
      className={[styles.row, className].filter(Boolean).join(" ")}
      data-selected={selected ? "" : undefined}
    >
      {children}
    </tr>
  );
}

type TableHeaderCellProps = Omit<
  ThHTMLAttributes<HTMLTableCellElement>,
  "align"
> & {
  align?: CellAlign;
  children?: ReactNode;
};

export function TableHeaderCell({
  children,
  align = "left",
  className,
  scope = "col",
  ...rest
}: TableHeaderCellProps) {
  return (
    <th
      {...rest}
      scope={scope}
      className={[styles.headerCell, className].filter(Boolean).join(" ")}
      data-align={align}
    >
      {children}
    </th>
  );
}

type TableCellProps = Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> & {
  align?: CellAlign;
  children?: ReactNode;
};

export function TableCell({
  children,
  align = "left",
  className,
  ...rest
}: TableCellProps) {
  return (
    <td
      {...rest}
      className={[styles.cell, className].filter(Boolean).join(" ")}
      data-align={align}
    >
      {children}
    </td>
  );
}
