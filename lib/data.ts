export type RangeValue = "Last week" | "Last month" | "Last quarter";

export type Tone = "info" | "success" | "danger" | "warning" | "yellow" | "violet" | "cyan";

export const RANGE_OPTIONS: RangeValue[] = ["Last week", "Last month", "Last quarter"];

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

const child = (label: string) => ({ label, icon: "lucide:corner-down-right" });

export const SIDEBAR = {
  sections: [
    {
      caption: "Main Navigation",
      entries: [
        { kind: "link", label: "Overview", icon: "lucide:layout-grid" },
        {
          kind: "group",
          label: "Tickets",
          icon: "lucide:ticket",
          defaultOpen: true,
          children: [child("All / My Queue"), child("SLA Breach Risk"), child("Escalations")],
        },
        { kind: "link", label: "Clients", icon: "lucide:contact" },
        {
          kind: "group",
          label: "Agents & Teams",
          icon: "lucide:users",
          children: [child("All Agents"), child("Teams"), child("Shift Schedules")],
        },
        {
          kind: "group",
          label: "Knowledge Base",
          icon: "lucide:notebook-text",
          children: [child("Articles"), child("Categories")],
        },
        { kind: "link", label: "Integrations", icon: "lucide:workflow" },
      ],
    },
    {
      caption: "Analytics & Insights",
      entries: [
        { kind: "link", label: "SLA Compliance", icon: "lucide:clock-3" },
        { kind: "link", label: "CSAT & NPS", icon: "lucide:star" },
        { kind: "link", label: "Workload Analytics", icon: "lucide:chart-no-axes-column-increasing" },
        { kind: "link", label: "Reports", icon: "lucide:file-text" },
      ],
    },
  ] satisfies NavSection[],
  support: {
    caption: "Support",
    entries: [
      { kind: "link", label: "Feedback", icon: "lucide:message-square-text" },
      { kind: "link", label: "Help & Support", icon: "lucide:headset" },
      { kind: "link", label: "Settings", icon: "lucide:settings-2" },
    ],
  } satisfies NavSection,
  user: USER,
};

export type MetricId = "tickets" | "resolution" | "compliance";

export type Metric = {
  id: MetricId;
  title: string;
  icon: string;
  tone: "success" | "danger";
  delta: string;
  values: Record<RangeValue, string>;
};

export const SPARK_POINTS =
  "0,39 10,13 20,15 30,25 40,5 50,24 60,19 70,34 80,20 90,30";

export const METRICS: Metric[] = [
  {
    id: "tickets",
    title: "Current Tickets",
    icon: "lucide:ticket",
    tone: "success",
    delta: "+7.1%",
    values: { "Last week": "3,484", "Last month": "13,936", "Last quarter": "41,808" },
  },
  {
    id: "resolution",
    title: "Daily Avg. Resolution",
    icon: "lucide:zap",
    tone: "success",
    delta: "+2%",
    values: { "Last week": "486", "Last month": "502", "Last quarter": "518" },
  },
  {
    id: "compliance",
    title: "SLA Compliance Rate",
    icon: "lucide:timer-reset",
    tone: "danger",
    delta: "-1.3%",
    values: { "Last week": "92%", "Last month": "94%", "Last quarter": "96%" },
  },
];

export const CHART = {
  days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  axis: [800, 600, 400, 200, 0],
  max: 900,
  initialIndex: 5,
  totals: {
    "Last week": "4,790",
    "Last month": "19,160",
    "Last quarter": "57,480",
  } satisfies Record<RangeValue, string>,
  factors: {
    "Last week": 1,
    "Last month": 1.12,
    "Last quarter": 0.88,
  } satisfies Record<RangeValue, number>,
  bars: [
    { day: "Sat", value: 286 },
    { day: "Sun", value: 584 },
    { day: "Mon", value: 676 },
    { day: "Mon", value: 399 },
    { day: "Tue", value: 538 },
    { day: "Tue", value: 584 },
    { day: "Wed", value: 462 },
    { day: "Wed", value: 584 },
    { day: "Thu", value: 765 },
    { day: "Thu", value: 676 },
    { day: "Fri", value: 626 },
    { day: "Fri", value: 676 },
    { day: "Sat", value: 353 },
    { day: "Sat", value: 714 },
    { day: "Sun", value: 525 },
  ],
};

export type ActivityPeriod = "today" | "yesterday";

export type Activity = {
  id: string;
  period: ActivityPeriod;
  tone: Tone;
  icon: string;
  title: string;
  time: string;
  description: string;
};

export const ACTIVITY_PERIODS: {
  value: "today" | "yesterday" | "week";
  label: string;
  countLabel: string;
  singularCountLabel: string;
}[] = [
  {
    value: "today",
    label: "Today",
    countLabel: "new activities today",
    singularCountLabel: "new activity today",
  },
  {
    value: "yesterday",
    label: "Yesterday",
    countLabel: "activities yesterday",
    singularCountLabel: "activity yesterday",
  },
  {
    value: "week",
    label: "This week",
    countLabel: "activities this week",
    singularCountLabel: "activity this week",
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: "today.ticket-updated",
    period: "today",
    tone: "info",
    icon: "lucide:ticket",
    title: "Ticket Updated",
    time: "11:20 AM",
    description: "Ticket #2319 SLA updated",
  },
  {
    id: "today.client-added",
    period: "today",
    tone: "success",
    icon: "lucide:user-round",
    title: "New Client Added",
    time: "11:15 AM",
    description: "PT. Alpha Indonesia registered",
  },
  {
    id: "today.reassigned",
    period: "today",
    tone: "violet",
    icon: "lucide:repeat-2",
    title: "Agent Reassigned",
    time: "11:00 AM",
    description: "Ticket #2322 moved to Michael Wong",
  },
  {
    id: "today.sla-risk",
    period: "today",
    tone: "danger",
    icon: "lucide:triangle-alert",
    title: "SLA Breach Risk",
    time: "10:45 AM",
    description: "Ticket #2320 'Login issue'",
  },
  {
    id: "today.knowledge",
    period: "today",
    tone: "cyan",
    icon: "lucide:notebook-text",
    title: "Knowledge Base",
    time: "10:30 AM",
    description: "New article published: 'Login Troubleshooting'",
  },
  {
    id: "today.feedback",
    period: "today",
    tone: "warning",
    icon: "lucide:star",
    title: "Customer Feedback",
    time: "10:30 AM",
    description: "'Great support response, thanks Sarah!'",
  },
  {
    id: "today.closed",
    period: "today",
    tone: "success",
    icon: "lucide:circle-check",
    title: "Ticket Closed",
    time: "09:58 AM",
    description: "Ticket #2311 resolved by Sarah Lee",
  },
  {
    id: "today.online",
    period: "today",
    tone: "success",
    icon: "lucide:user-round",
    title: "Agent Online",
    time: "09:02 AM",
    description: "John Doe started a shift",
  },
  {
    id: "yesterday.breached",
    period: "yesterday",
    tone: "danger",
    icon: "lucide:triangle-alert",
    title: "SLA Breached",
    time: "05:40 PM",
    description: "Ticket #2298 missed first response",
  },
  {
    id: "yesterday.reassigned",
    period: "yesterday",
    tone: "violet",
    icon: "lucide:repeat-2",
    title: "Agent Reassigned",
    time: "03:12 PM",
    description: "Ticket #2301 moved to Sarah Lee",
  },
  {
    id: "yesterday.feedback",
    period: "yesterday",
    tone: "warning",
    icon: "lucide:star",
    title: "Customer Feedback",
    time: "01:26 PM",
    description: "'Fast fix on the billing bug'",
  },
  {
    id: "yesterday.updated",
    period: "yesterday",
    tone: "info",
    icon: "lucide:ticket",
    title: "Ticket Updated",
    time: "11:05 AM",
    description: "Ticket #2305 priority raised",
  },
  {
    id: "yesterday.knowledge",
    period: "yesterday",
    tone: "cyan",
    icon: "lucide:notebook-text",
    title: "Knowledge Base",
    time: "09:30 AM",
    description: "Article updated: 'Invoice Exports'",
  },
];

export type Priority = "High" | "Medium" | "Low";
export type TicketStatus = "In Review" | "In Progress" | "Delivered";

export type Ticket = {
  id: string;
  subject: string;
  priority: Priority;
  agent: { name: string; initials: string; avatar?: string };
  status: TicketStatus;
  created: string;
  sla: string;
};

export const PRIORITY_OPTIONS: Priority[] = ["High", "Medium", "Low"];
export const STATUS_OPTIONS: TicketStatus[] = ["In Review", "In Progress", "Delivered"];

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

export const TICKETS: Ticket[] = [
  {
    id: "2319",
    subject: "Payment failed on invoice",
    priority: "High",
    agent: { name: "John Doe", initials: "JD" },
    status: "In Review",
    created: "2025-08-18",
    sla: "2h left",
  },
  {
    id: "2320",
    subject: "Login issue",
    priority: "Medium",
    agent: { name: "Sarah Lee", initials: "SL" },
    status: "Delivered",
    created: "2025-08-19",
    sla: "1h left",
  },
  {
    id: "2321",
    subject: "Feature request export",
    priority: "Low",
    agent: { name: "John Doe", initials: "JD" },
    status: "In Progress",
    created: "2025-08-19",
    sla: "1d left",
  },
  {
    id: "2322",
    subject: "Contract renewal issue",
    priority: "Medium",
    agent: { name: "Michael Wong", initials: "MW" },
    status: "In Progress",
    created: "2025-08-20",
    sla: "9h left",
  },
];
