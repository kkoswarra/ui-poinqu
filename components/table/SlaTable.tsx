"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  PRIORITY_META,
  PRIORITY_OPTIONS,
  STATUS_META,
  STATUS_OPTIONS,
  TICKETS,
  type Priority,
  type Ticket,
  type TicketStatus,
} from "@/lib/data";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SearchField from "@/components/ui/SearchField";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./SlaTable.module.css";

type SlaTableProps = {
  onDetail: (detail: {
    title: string;
    description: string;
    fields: string;
  }) => void;
  onNotice: (message: string) => void;
};

type SortState = {
  column: number | null;
  direction: "asc" | "desc";
};

const COLUMNS = [
  "Ticket ID",
  "Subject",
  "Priority",
  "Assigned To",
  "Status",
  "Created Date",
  "SLA Due",
];

function sortValue(ticket: Ticket, column: number) {
  switch (column) {
    case 0:
      return ticket.id;
    case 1:
      return ticket.subject;
    case 2:
      return ticket.priority;
    case 3:
      return ticket.agent.name;
    case 4:
      return ticket.status;
    case 5:
      return ticket.created;
    case 6:
      return ticket.sla;
    default:
      return "";
  }
}

function rowText(ticket: Ticket) {
  return [
    ticket.id,
    ticket.subject,
    ticket.priority,
    ticket.agent.name,
    ticket.status,
    ticket.created,
    ticket.sla,
  ]
    .join(" ")
    .toLowerCase();
}

export default function SlaTable({ onDetail, onNotice }: SlaTableProps) {
  const [query, setQuery] = useState("");
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["2319"]));
  const [sort, setSort] = useState<SortState>({ column: null, direction: "asc" });

  const allRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDetailsElement>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filtersActive =
    Boolean(normalizedQuery) || priorities.length > 0 || statuses.length > 0;

  const tickets = useMemo(() => {
    const rows = TICKETS.filter((ticket) => {
      const matchesQuery = !normalizedQuery || rowText(ticket).includes(normalizedQuery);
      const matchesPriority = !priorities.length || priorities.includes(ticket.priority);
      const matchesStatus = !statuses.length || statuses.includes(ticket.status);
      return matchesQuery && matchesPriority && matchesStatus;
    });

    if (sort.column === null) return rows;

    const direction = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort(
      (a, b) =>
        sortValue(a, sort.column as number).localeCompare(
          sortValue(b, sort.column as number),
          undefined,
          { numeric: true },
        ) * direction,
    );
  }, [normalizedQuery, priorities, sort, statuses]);

  const allChecked =
    tickets.length > 0 && tickets.every((ticket) => selected.has(ticket.id));
  const someChecked =
    tickets.some((ticket) => selected.has(ticket.id)) && !allChecked;

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someChecked;
  }, [someChecked]);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      const filter = filterRef.current;
      if (filter?.open && !filter.contains(event.target as Node)) filter.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const filter = filterRef.current;
      if (filter?.open) {
        filter.open = false;
        filter.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("click", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const toggleRow = (id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);
      for (const ticket of tickets) {
        if (checked) next.add(ticket.id);
        else next.delete(ticket.id);
      }
      return next;
    });
  };

  const togglePriority = (priority: Priority) => {
    setPriorities((previous) =>
      previous.includes(priority)
        ? previous.filter((item) => item !== priority)
        : [...previous, priority],
    );
  };

  const toggleStatus = (status: TicketStatus) => {
    setStatuses((previous) =>
      previous.includes(status)
        ? previous.filter((item) => item !== status)
        : [...previous, status],
    );
  };

  const clearFilters = () => {
    setQuery("");
    setPriorities([]);
    setStatuses([]);
  };

  const sortBy = (column: number) => {
    setSort((previous) => ({
      column,
      direction:
        previous.column === column && previous.direction === "asc" ? "desc" : "asc",
    }));
  };

  const ariaSort = (column: number) => {
    if (sort.column !== column) return "none" as const;
    return sort.direction === "asc" ? ("ascending" as const) : ("descending" as const);
  };

  const openDetail = (ticket: Ticket) => {
    onDetail({
      title: `Ticket #${ticket.id}`,
      description: ticket.subject,
      fields: [
        ticket.priority,
        ticket.agent.name,
        ticket.status,
        ticket.created,
        ticket.sla,
      ].join(" · "),
    });
  };

  const exportCsv = () => {
    const rows = [
      COLUMNS,
      ...tickets.map((ticket) => [
        ticket.id,
        ticket.subject,
        ticket.priority,
        ticket.agent.name,
        ticket.status,
        ticket.created,
        ticket.sla,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "support-tickets.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onNotice("Ticket CSV exported.");
  };

  const resultCount = [
    `${tickets.length} of ${TICKETS.length} tickets`,
    priorities.length ? priorities.join(", ") : "",
    statuses.length ? statuses.join(", ") : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={styles.table} aria-label="SLA Monitoring">
      <div className={styles.header}>
        <Icon name="lucide:goal" />
        <h2>SLA Monitoring</h2>
        <div className={styles.tools}>
          <div className={styles.search}>
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Ticket"
              ariaLabel="Ticket"
            />
          </div>
          <details className={styles.filter} ref={filterRef}>
            <summary>
              <Icon name="lucide:filter" />
              <span>Filter</span>
            </summary>
            <div className={styles.filterPanel}>
              <fieldset>
                <legend>Priority</legend>
                {PRIORITY_OPTIONS.map((priority) => (
                  <label key={priority}>
                    <input
                      type="checkbox"
                      value={priority}
                      checked={priorities.includes(priority)}
                      onChange={() => togglePriority(priority)}
                    />
                    {priority}
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Status</legend>
                {STATUS_OPTIONS.map((status) => (
                  <label key={status}>
                    <input
                      type="checkbox"
                      value={status}
                      checked={statuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                    />
                    {status}
                  </label>
                ))}
              </fieldset>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          </details>
          <Button
            iconOnly
            icon="lucide:ellipsis-vertical"
            label="Export tickets"
            aria-label="Export tickets"
            onClick={exportCsv}
          />
        </div>
      </div>

      {filtersActive ? (
        <div className={styles.feedback}>
          <span aria-live="polite">{resultCount}</span>
          <button type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : null}

      <div className={styles.surface} tabIndex={0} aria-label="Scrollable ticket table">
        <table>
          <thead>
            <tr>
              <th scope="col" aria-sort={ariaSort(0)}>
                <input
                  ref={allRef}
                  type="checkbox"
                  aria-label="Select all tickets"
                  checked={allChecked}
                  onChange={(event) => toggleAll(event.target.checked)}
                />{" "}
                <button type="button" onClick={() => sortBy(0)}>
                  Ticket ID
                  <Icon name="lucide:arrow-down-up" />
                </button>
              </th>
              {COLUMNS.slice(1).map((column, index) => (
                <th key={column} scope="col" aria-sort={ariaSort(index + 1)}>
                  <button type="button" onClick={() => sortBy(index + 1)}>
                    {column}
                    <Icon name="lucide:arrow-down-up" />
                  </button>
                </th>
              ))}
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <label className={styles.ticket}>
                    <input
                      type="checkbox"
                      aria-label={`Select ticket #${ticket.id}`}
                      checked={selected.has(ticket.id)}
                      onChange={() => toggleRow(ticket.id)}
                    />
                    #{ticket.id}
                  </label>
                </td>
                <td>{ticket.subject}</td>
                <td>
                  <StatusBadge
                    tone={PRIORITY_META[ticket.priority].tone}
                    icon={PRIORITY_META[ticket.priority].icon}
                    label={ticket.priority}
                  />
                </td>
                <td>
                  <Avatar
                    name={ticket.agent.name}
                    initials={ticket.agent.initials}
                    src={ticket.agent.avatar}
                  />
                </td>
                <td>
                  <StatusBadge
                    tone={STATUS_META[ticket.status].tone}
                    icon={STATUS_META[ticket.status].icon}
                    label={ticket.status}
                  />
                </td>
                <td>{ticket.created}</td>
                <td>{ticket.sla}</td>
                <td>
                  <button
                    type="button"
                    className={styles.more}
                    aria-label={`Actions for #${ticket.id}`}
                    onClick={() => openDetail(ticket)}
                  >
                    <Icon name="lucide:ellipsis-vertical" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 ? (
          <p className={styles.empty}>No tickets match these filters.</p>
        ) : null}
      </div>
    </section>
  );
}
