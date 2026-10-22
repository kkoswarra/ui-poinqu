export type Tone =
  | "info"
  | "success"
  | "danger"
  | "warning"
  | "yellow"
  | "violet"
  | "cyan";

export const BRAND = {
  name: "Poinqu",
  mark: "P",
};

export type User = {
  name: string;
  email: string;
  initials: string;
};

export const USER: User = {
  name: "Aditya Pratama",
  email: "aditya.pratama@example.com",
  initials: "AP",
};

export type NavLink = {
  kind: "link";
  label: string;
  icon: string;
};

export type NavGroup = {
  kind: "group";
  label: string;
  icon: string;
  defaultOpen?: boolean;
  children: { label: string; icon: string }[];
};

export type NavEntry = NavLink | NavGroup;

export type NavSection = {
  caption: string;
  entries: NavEntry[];
};

export type RangeValue = "Last week" | "Last month" | "Last quarter";

export const RANGE_OPTIONS: RangeValue[] = [
  "Last week",
  "Last month",
  "Last quarter",
];

export type Priority = "High" | "Medium" | "Low";
export type TicketStatus = "In Review" | "In Progress" | "Delivered";

export const PRIORITY_META: Record<Priority, { tone: Tone; icon: string }> = {
  High: { tone: "danger", icon: "lucide:chart-no-axes-column-increasing" },
  Medium: { tone: "warning", icon: "lucide:chart-no-axes-column-increasing" },
  Low: { tone: "yellow", icon: "lucide:chart-no-axes-column-increasing" },
};

export const STATUS_META: Record<TicketStatus, { tone: Tone; icon: string }> = {
  "In Review": { tone: "info", icon: "lucide:file-text" },
  "In Progress": { tone: "warning", icon: "lucide:history" },
  Delivered: { tone: "success", icon: "lucide:check" },
};
