"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Checkbox from "./Checkbox";
import Icon from "./Icon";
import Input from "./Input";
import Pagination from "./Pagination";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "./Table";
import styles from "./DataTable.module.css";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  cell: (row: T) => ReactNode;
  width?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  ariaLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchText?: (row: T) => string;
  pageSize?: number;
  selectable?: boolean;
  emptyMessage?: string;
};

export default function DataTable<T>({
  data,
  columns,
  getRowId,
  ariaLabel = "Data table",
  searchable = true,
  searchPlaceholder = "Search…",
  searchText,
  pageSize = 5,
  selectable = false,
  emptyMessage = "No records match your filters.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "", direction: "asc" });
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;

    return data.filter((row) =>
      (searchText ? searchText(row) : JSON.stringify(row))
        .toLowerCase()
        .includes(normalized),
    );
  }, [data, query, searchText]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;

    const column = columns.find(
      (item) => item.key === sort.key && item.sortable && item.sortValue,
    );
    if (!column?.sortValue) return filtered;

    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((left, right) => {
      const leftValue = column.sortValue?.(left) ?? "";
      const rightValue = column.sortValue?.(right) ?? "";

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return (leftValue - rightValue) * factor;
      }

      return (
        String(leftValue).localeCompare(String(rightValue), undefined, {
          numeric: true,
        }) * factor
      );
    });
  }, [columns, filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(startIndex, startIndex + pageSize);
  const pageIds = pageRows.map(getRowId);

  const allChecked =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someChecked =
    pageIds.some((id) => selected.has(id)) && !allChecked;

  const toggleRow = (id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = (checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    setSort((previous) => ({
      key: column.key,
      direction:
        previous.key === column.key && previous.direction === "asc"
          ? "desc"
          : "asc",
    }));
    setPage(1);
  };

  const ariaSortFor = (key: string) => {
    if (sort.key !== key) return "none" as const;
    return sort.direction === "asc"
      ? ("ascending" as const)
      : ("descending" as const);
  };

  const rangeLabel = sorted.length
    ? `Showing ${startIndex + 1}–${Math.min(startIndex + pageSize, sorted.length)} of ${sorted.length}`
    : "No results";

  return (
    <div className={styles.dataTable}>
      <div className={styles.toolbar}>
        {searchable ? (
          <div className={styles.search}>
            <Input
              type="search"
              icon="lucide:search"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(event) => handleSearch(event.target.value)}
              fullWidth
            />
          </div>
        ) : null}

        <div className={styles.toolbarMeta}>
          {selectable && selected.size > 0 ? (
            <div className={styles.selection}>
              <span>{selected.size} selected</span>
              <button type="button" onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          ) : null}
          <span className={styles.resultCount}>
            {sorted.length} {sorted.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>

      {pageRows.length ? (
        <Table ariaLabel={ariaLabel} minWidth={760}>
          <TableHead>
            <TableRow>
              {selectable ? (
                <TableHeaderCell className={styles.checkCell}>
                  <Checkbox
                    aria-label="Select all rows on this page"
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={(event) => togglePage(event.target.checked)}
                  />
                </TableHeaderCell>
              ) : null}
              {columns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  align={column.align}
                  style={column.width ? { width: column.width } : undefined}
                  aria-sort={
                    column.sortable ? ariaSortFor(column.key) : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      aria-label={`Sort by ${column.header}`}
                      onClick={() => handleSort(column)}
                    >
                      {column.header}
                      <Icon
                        name={
                          sort.key === column.key
                            ? sort.direction === "asc"
                              ? "lucide:arrow-up"
                              : "lucide:arrow-down"
                            : "lucide:arrow-down-up"
                        }
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row) => {
              const id = getRowId(row);
              const isSelected = selected.has(id);

              return (
                <TableRow key={id} selected={isSelected}>
                  {selectable ? (
                    <TableCell className={styles.checkCell}>
                      <Checkbox
                        aria-label={`Select row ${id}`}
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Icon name="lucide:inbox" />
          </span>
          <strong>No results</strong>
          <p>{emptyMessage}</p>
          {query ? (
            <button type="button" onClick={() => handleSearch("")}>
              Clear search
            </button>
          ) : null}
        </div>
      )}

      {sorted.length ? (
        <div className={styles.footer}>
          <span className={styles.range}>{rangeLabel}</span>
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
