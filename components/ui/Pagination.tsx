import Icon from "./Icon";
import styles from "./Pagination.module.css";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  ariaLabel?: string;
  className?: string;
};

type PageItem = number | "ellipsis";

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

function getPageItems(page: number, total: number, siblings: number): PageItem[] {
  const totalNumbers = siblings * 2 + 5;

  if (total <= totalNumbers) {
    return range(1, total);
  }

  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, siblings * 2 + 3), "ellipsis", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "ellipsis", ...range(total - (siblings * 2 + 2), total)];
  }

  return [
    1,
    "ellipsis",
    ...range(leftSibling, rightSibling),
    "ellipsis",
    total,
  ];
}

export default function Pagination({
  page,
  pageCount,
  onPageChange,
  siblings = 1,
  ariaLabel = "Pagination",
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const current = Math.min(Math.max(page, 1), pageCount);
  const items = getPageItems(current, pageCount, siblings);

  return (
    <nav
      className={[styles.pagination, className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={styles.navButton}
        aria-label="Previous page"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        <Icon name="lucide:chevron-left" />
      </button>

      <div className={styles.pages}>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className={styles.ellipsis}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={styles.pageButton}
              aria-label={`Page ${item}`}
              aria-current={item === current ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <span className={styles.summary} aria-live="polite">
        Page {current} of {pageCount}
      </span>

      <button
        type="button"
        className={styles.navButton}
        aria-label="Next page"
        disabled={current === pageCount}
        onClick={() => onPageChange(current + 1)}
      >
        <Icon name="lucide:chevron-right" />
      </button>
    </nav>
  );
}
