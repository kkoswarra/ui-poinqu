"use client";

import Button from "@/components/ui/Button";
import styles from "./AdminPages.module.css";

export default function CursorPager({
  page,
  hasPrev,
  hasNext,
  loading,
  onPrev,
  onNext,
}: {
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className={styles.paginationBar}>
      <span className={styles.muted}>Halaman {page + 1}</span>
      <div className={styles.actions}>
        <Button
          label="Sebelumnya"
          icon="lucide:chevron-left"
          size="sm"
          disabled={!hasPrev || loading}
          onClick={onPrev}
        />
        <Button
          label="Berikutnya"
          iconRight="lucide:chevron-right"
          size="sm"
          disabled={!hasNext || loading}
          onClick={onNext}
        />
      </div>
    </div>
  );
}
