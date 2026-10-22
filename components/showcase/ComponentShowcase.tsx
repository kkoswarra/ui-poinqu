"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  PRIORITY_META,
  STATUS_META,
  USER,
  type NavSection,
  type Priority,
  type TicketStatus,
} from "@/lib/data";
import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/components/topbar/Topbar";
import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import AccountModal from "@/components/ui/AccountModal";
import Alert from "@/components/ui/Alert";
import AlertDialog from "@/components/ui/AlertDialog";
import Attachment, {
  type AttachmentState,
} from "@/components/ui/Attachment";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import ButtonGroup from "@/components/ui/ButtonGroup";
import Card, { CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Collapse from "@/components/ui/Collapse";
import Combobox, { type ComboboxOption } from "@/components/ui/Combobox";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import Dropdown, { type DropdownEntry } from "@/components/ui/Dropdown";
import FormField from "@/components/ui/FormField";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import ListGroup, { ListGroupItem } from "@/components/ui/ListGroup";
import Marker from "@/components/ui/Marker";
import Modal, { type ModalTone } from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import Placeholder from "@/components/ui/Placeholder";
import RadioGroup from "@/components/ui/RadioGroup";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import Stepper from "@/components/ui/Stepper";
import Switch from "@/components/ui/Switch";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import Tabs, { Tab, TabPanel, TabsList } from "@/components/ui/Tabs";
import Textarea from "@/components/ui/Textarea";
import { useToast, type ToastTone } from "@/components/ui/Toast";
import Tooltip from "@/components/ui/Tooltip";
import Trace, { type TraceItem } from "@/components/ui/Trace";
import Typography from "@/components/ui/Typography";
import styles from "./ComponentShowcase.module.css";

type SidebarMode = "default" | "closed" | "open";

const NAV_SECTIONS: NavSection[] = [
  {
    caption: "Foundations",
    entries: [
      { kind: "link", label: "Typography", icon: "lucide:type" },
    ],
  },
  {
    caption: "Components",
    entries: [
      { kind: "link", label: "Card", icon: "lucide:layout-panel-top" },
      { kind: "link", label: "Alert", icon: "lucide:triangle-alert" },
      { kind: "link", label: "Badge", icon: "lucide:badge" },
      { kind: "link", label: "Button", icon: "lucide:mouse-pointer-click" },
      { kind: "link", label: "Button Group", icon: "lucide:square-mouse-pointer" },
      { kind: "link", label: "Form Controls", icon: "lucide:text-cursor-input" },
      { kind: "link", label: "Combobox", icon: "lucide:list-filter" },
      { kind: "link", label: "Attachment", icon: "lucide:paperclip" },
      { kind: "link", label: "Placeholder", icon: "lucide:rectangle-ellipsis" },
      { kind: "link", label: "Spinner", icon: "lucide:loader-circle" },
    ],
  },
  {
    caption: "Navigation",
    entries: [
      { kind: "link", label: "Breadcrumb", icon: "lucide:chevron-right" },
      { kind: "link", label: "Tabs", icon: "lucide:panels-top-left" },
      { kind: "link", label: "Collapse", icon: "lucide:chevrons-down-up" },
      { kind: "link", label: "Stepper", icon: "lucide:list-checks" },
      { kind: "link", label: "Pagination", icon: "lucide:ellipsis" },
    ],
  },
  {
    caption: "Data display",
    entries: [
      { kind: "link", label: "Marker", icon: "lucide:map-pin" },
      { kind: "link", label: "Trace", icon: "lucide:waypoints" },
      { kind: "link", label: "List Group", icon: "lucide:list" },
      { kind: "link", label: "Accordion", icon: "lucide:chevrons-up-down" },
      { kind: "link", label: "Table", icon: "lucide:table" },
      { kind: "link", label: "Data Table", icon: "lucide:database" },
    ],
  },
  {
    caption: "Overlays & feedback",
    entries: [
      { kind: "link", label: "Modal", icon: "lucide:app-window" },
      { kind: "link", label: "Alert Dialog", icon: "lucide:shield-alert" },
      { kind: "link", label: "Toast", icon: "lucide:bell-ring" },
      { kind: "link", label: "Dropdown", icon: "lucide:chevron-down" },
      { kind: "link", label: "Tooltip", icon: "lucide:message-square-text" },
    ],
  },
];

const BADGE_TONES: BadgeTone[] = [
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
  "violet",
  "cyan",
  "yellow",
];

const ALIGNMENTS = [
  { id: "left", label: "Align left", icon: "lucide:align-left" },
  { id: "center", label: "Align center", icon: "lucide:align-center" },
  { id: "right", label: "Align right", icon: "lucide:align-right" },
];

const SECTION_LABELS = [
  "Typography",
  "Card",
  "Alert",
  "Badge",
  "Button",
  "Button Group",
  "Form Controls",
  "Combobox",
  "Attachment",
  "Placeholder",
  "Spinner",
  "Breadcrumb",
  "Tabs",
  "Collapse",
  "Stepper",
  "Pagination",
  "Marker",
  "Trace",
  "List Group",
  "Accordion",
  "Table",
  "Data Table",
  "Modal",
  "Alert Dialog",
  "Toast",
  "Dropdown",
  "Tooltip",
];

const STEPPER_STEPS = [
  { label: "Details", description: "Ticket information" },
  { label: "Priority", description: "Set an SLA target" },
  { label: "Assignment", description: "Choose an agent" },
  { label: "Review", description: "Confirm and create" },
];

const VERTICAL_STEPS = [
  { label: "Ticket created", description: "Aug 18, 09:12" },
  { label: "SLA policy applied", description: "High priority · 2h target" },
  { label: "Assigned to John Doe", description: "Support team" },
  { label: "Resolved", description: "Waiting for customer confirmation" },
];

type DemoRow = {
  id: string;
  subject: string;
  priority: Priority;
  agent: string;
  status: TicketStatus;
  updated: string;
};

const DEMO_ROWS: DemoRow[] = [
  { id: "2319", subject: "Payment failed on invoice", priority: "High", agent: "John Doe", status: "In Review", updated: "2025-08-20" },
  { id: "2320", subject: "Login issue", priority: "Medium", agent: "Sarah Lee", status: "Delivered", updated: "2025-08-20" },
  { id: "2321", subject: "Feature request export", priority: "Low", agent: "John Doe", status: "In Progress", updated: "2025-08-19" },
  { id: "2322", subject: "Contract renewal issue", priority: "Medium", agent: "Michael Wong", status: "In Progress", updated: "2025-08-19" },
  { id: "2323", subject: "Two-factor authentication", priority: "High", agent: "Sarah Lee", status: "In Progress", updated: "2025-08-18" },
  { id: "2324", subject: "Billing address update", priority: "Low", agent: "John Doe", status: "Delivered", updated: "2025-08-18" },
  { id: "2325", subject: "API rate limit increase", priority: "Medium", agent: "Michael Wong", status: "In Review", updated: "2025-08-17" },
  { id: "2326", subject: "SSO login redirect loop", priority: "High", agent: "Sarah Lee", status: "In Review", updated: "2025-08-17" },
  { id: "2327", subject: "Export template missing", priority: "Low", agent: "John Doe", status: "In Progress", updated: "2025-08-16" },
  { id: "2328", subject: "Invoice PDF formatting", priority: "Medium", agent: "Michael Wong", status: "Delivered", updated: "2025-08-16" },
  { id: "2329", subject: "Webhook retries exhausted", priority: "High", agent: "Sarah Lee", status: "In Progress", updated: "2025-08-15" },
  { id: "2330", subject: "Profile photo upload", priority: "Low", agent: "John Doe", status: "In Review", updated: "2025-08-15" },
];

const searchDemoRows = (row: DemoRow) =>
  `${row.id} ${row.subject} ${row.agent} ${row.priority} ${row.status} ${row.updated}`;

const DATA_COLUMNS: DataTableColumn<DemoRow>[] = [
  {
    key: "id",
    header: "Ticket",
    sortable: true,
    sortValue: (row) => row.id,
    width: "90px",
    cell: (row) => <span className={styles.mono}>#{row.id}</span>,
  },
  {
    key: "subject",
    header: "Subject",
    sortable: true,
    sortValue: (row) => row.subject,
    cell: (row) => row.subject,
  },
  {
    key: "priority",
    header: "Priority",
    sortable: true,
    sortValue: (row) => row.priority,
    width: "110px",
    cell: (row) => (
      <Badge tone={PRIORITY_META[row.priority].tone}>{row.priority}</Badge>
    ),
  },
  {
    key: "agent",
    header: "Agent",
    sortable: true,
    sortValue: (row) => row.agent,
    width: "140px",
    cell: (row) => row.agent,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortValue: (row) => row.status,
    width: "130px",
    cell: (row) => (
      <Badge tone={STATUS_META[row.status].tone} variant="outline">
        {row.status}
      </Badge>
    ),
  },
  {
    key: "updated",
    header: "Updated",
    align: "right",
    sortable: true,
    sortValue: (row) => row.updated,
    width: "110px",
    cell: (row) => row.updated,
  },
];

const FRAMEWORK_OPTIONS: ComboboxOption[] = [
  {
    value: "next",
    label: "Next.js",
    description: "React framework",
    icon: "lucide:atom",
    group: "React",
  },
  {
    value: "remix",
    label: "Remix",
    description: "Full-stack React",
    icon: "lucide:route",
    group: "React",
  },
  {
    value: "astro",
    label: "Astro",
    description: "Content-first framework",
    icon: "lucide:rocket",
    group: "Other",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
    description: "Svelte framework",
    icon: "lucide:flame",
    group: "Other",
  },
  {
    value: "nuxt",
    label: "Nuxt",
    description: "Vue framework",
    icon: "lucide:mountain",
    group: "Vue",
  },
  {
    value: "solid",
    label: "SolidStart",
    description: "Coming soon",
    icon: "lucide:box",
    group: "Other",
    disabled: true,
  },
];

const LABEL_OPTIONS: ComboboxOption[] = [
  { value: "billing", label: "Billing", icon: "lucide:credit-card" },
  { value: "bug", label: "Bug", icon: "lucide:bug" },
  { value: "feature", label: "Feature request", icon: "lucide:sparkles" },
  { value: "urgent", label: "Urgent", icon: "lucide:zap" },
  { value: "design", label: "Design", icon: "lucide:palette" },
  { value: "docs", label: "Documentation", icon: "lucide:book-open" },
];

const WORKSPACE_OPTIONS: ComboboxOption[] = [
  {
    value: "nuvio",
    label: "Nuvio Support",
    description: "24 agents",
    icon: "lucide:headset",
  },
  {
    value: "poinqu",
    label: "Poinqu Billing",
    description: "8 agents",
    icon: "lucide:credit-card",
  },
];

const TEAM_OPTIONS: ComboboxOption[] = [
  {
    value: "support",
    label: "Support",
    description: "12 agents",
    icon: "lucide:headset",
  },
  {
    value: "billing",
    label: "Billing",
    description: "4 agents",
    icon: "lucide:credit-card",
  },
  {
    value: "platform",
    label: "Platform",
    description: "8 agents",
    icon: "lucide:server",
  },
];

const TRACE_ITEMS: TraceItem[] = [
  {
    id: "thought",
    title: "Thought for 5s",
    description: "Diagnosing the failing CI install",
    icon: "lucide:brain",
    status: "done",
    defaultOpen: true,
    detail: (
      <p>
        The lockfile is out of sync with package.json, so a frozen install
        cannot resolve the new version.
      </p>
    ),
  },
  {
    id: "version",
    title: "Ran pnpm --version",
    description: "9.12.0",
    icon: "lucide:terminal",
    status: "done",
  },
  {
    id: "install",
    title: "Failed to run pnpm install",
    description: "Exit code 1",
    icon: "lucide:package",
    status: "error",
    detail: (
      <pre>{`ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
package.json and pnpm-lock.yaml are out of sync`}</pre>
    ),
  },
  {
    id: "build",
    title: "Running pnpm build",
    description: "Compiling 24 routes",
    icon: "lucide:hammer",
    status: "running",
  },
  {
    id: "test",
    title: "Run pnpm test",
    description: "Queued",
    icon: "lucide:flask-conical",
    status: "pending",
  },
];

type DemoAttachment = {
  id: string;
  name: string;
  meta: string;
  icon: string;
  state: AttachmentState;
  progress?: number;
};

const INITIAL_ATTACHMENTS: DemoAttachment[] = [
  {
    id: "sales",
    name: "sales-dashboard.pdf",
    meta: "PDF · 2.4 MB",
    icon: "lucide:file-text",
    state: "done",
  },
  {
    id: "design",
    name: "design-system.zip",
    meta: "ZIP · 12 MB",
    icon: "lucide:file-archive",
    state: "uploading",
    progress: 64,
  },
  {
    id: "research",
    name: "market-research.pdf",
    meta: "PDF · 8.1 MB",
    icon: "lucide:file-search",
    state: "processing",
  },
  {
    id: "model",
    name: "financial-model.xlsx",
    meta: "XLSX · 1.1 MB",
    icon: "lucide:file-spreadsheet",
    state: "error",
  },
];

type ModalKind = "basic" | "danger" | "form" | "sheet" | "fullscreen" | "success";

const MODAL_META: Record<
  ModalKind,
  {
    title: string;
    description: string;
    icon: string;
    tone: ModalTone;
    size: "sm" | "md" | "lg";
  }
> = {
  basic: {
    title: "Workspace settings",
    description: "Update the defaults for your support workspace.",
    icon: "lucide:settings-2",
    tone: "info",
    size: "sm",
  },
  danger: {
    title: "Delete ticket #2319?",
    description:
      "This action permanently removes the ticket and its activity history.",
    icon: "lucide:trash-2",
    tone: "danger",
    size: "sm",
  },
  form: {
    title: "Invite teammate",
    description: "Send an invitation to join the Poinqu support workspace.",
    icon: "lucide:user-round-plus",
    tone: "info",
    size: "md",
  },
  sheet: {
    title: "Ticket #2319",
    description: "Payment failed on invoice",
    icon: "lucide:ticket",
    tone: "info",
    size: "md",
  },
  fullscreen: {
    title: "Compose update",
    description: "A fullscreen surface for longer, focused workflows.",
    icon: "lucide:maximize-2",
    tone: "info",
    size: "lg",
  },
  success: {
    title: "Ticket resolved",
    description:
      "The customer has been notified and the SLA timer was stopped.",
    icon: "lucide:circle-check",
    tone: "success",
    size: "sm",
  },
};

const sectionId = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Section({
  id,
  tag,
  title,
  description,
  bodyPadding = "md",
  footer,
  children,
}: {
  id: string;
  tag: string;
  title: string;
  description: string;
  bodyPadding?: "none" | "sm" | "md";
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.sectionAnchor}>
      <Card>
        <CardHeader
          as="h2"
          title={title}
          description={description}
          actions={
            <Badge tone="neutral" variant="outline" size="sm">
              {tag}
            </Badge>
          }
        />
        <CardBody padding={bodyPadding}>{children}</CardBody>
      </Card>
      {footer}
    </section>
  );
}

export default function ComponentShowcase() {
  const { toast } = useToast();
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("default");
  const [isMobile, setIsMobile] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [alignment, setAlignment] = useState("left");
  const [activeSection, setActiveSection] = useState("Typography");
  const [priority, setPriority] = useState("medium");
  const [satisfaction, setSatisfaction] = useState("yes");
  const [step, setStep] = useState(1);
  const [paginationPage, setPaginationPage] = useState(3);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [framework, setFramework] = useState<string | null>("next");
  const [labels, setLabels] = useState<string[]>(["billing", "urgent"]);
  const [attachments, setAttachments] =
    useState<DemoAttachment[]>(INITIAL_ATTACHMENTS);
  const [alertDialog, setAlertDialog] = useState<"publish" | "delete" | null>(
    null,
  );
  const saveTimer = useRef<number | undefined>(undefined);
  const suppressSpy = useRef(0);

  const sidebarVisible = isMobile
    ? sidebarMode === "open"
    : sidebarMode !== "closed";

  const notify = (tone: ToastTone, title: string, description?: string) => {
    toast({ tone, title, description });
  };

  const toggleSidebar = () => {
    const mobile = window.matchMedia("(max-width:760px)").matches;
    setSidebarMode((previous) => {
      const opened = previous === "open" || (!mobile && previous === "default");
      return opened ? "closed" : "open";
    });
  };

  const navigate = (label: string) => {
    const id = sectionId(label);
    suppressSpy.current = Date.now() + 1000;
    setActiveSection(label);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });

    if (window.matchMedia("(max-width:760px)").matches) {
      setSidebarMode("closed");
    }
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width:760px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && window.matchMedia("(max-width:760px)").matches) {
        setSidebarMode("closed");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const update = () => {
      if (Date.now() < suppressSpy.current) return;

      const probe = window.scrollY + 160;
      let current = SECTION_LABELS[0];

      for (const label of SECTION_LABELS) {
        const element = document.getElementById(sectionId(label));
        if (!element) continue;
        if (element.getBoundingClientRect().top + window.scrollY <= probe) {
          current = label;
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
        for (const label of SECTION_LABELS) {
          const element = document.getElementById(sectionId(label));
          if (!element) continue;
          if (element.getBoundingClientRect().top < window.innerHeight - 80) {
            current = label;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(saveTimer.current);
  }, []);

  const save = () => {
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSaving(false);
      toast({
        title: "Changes saved",
        description: "The demo record was updated successfully.",
        tone: "success",
      });
    }, 1400);
  };

  const actionItems: DropdownEntry[] = [
    { type: "label", label: "Ticket #2319" },
    {
      label: "View details",
      icon: "lucide:eye",
      shortcut: "↵",
      onSelect: () => notify("info", "View details", "Opening ticket #2319."),
    },
    {
      label: "Assign agent",
      icon: "lucide:user-round-plus",
      onSelect: () => notify("info", "Assign agent", "Agent picker would open here."),
    },
    {
      label: "Copy link",
      icon: "lucide:link",
      shortcut: "⌘C",
      onSelect: () => notify("success", "Link copied", "Ticket link copied to clipboard."),
    },
    { type: "separator" },
    {
      label: "Archive",
      icon: "lucide:archive",
      disabled: true,
    },
    {
      label: "Delete ticket",
      icon: "lucide:trash-2",
      tone: "danger",
      onSelect: () => notify("danger", "Delete ticket", "Destructive actions should ask for confirmation."),
    },
  ];

  const moreItems: DropdownEntry[] = [
    { label: "Refresh data", icon: "lucide:refresh-cw", onSelect: () => notify("info", "Dashboard refreshed") },
    { label: "Export CSV", icon: "lucide:download", onSelect: () => notify("success", "Export queued") },
    { type: "separator" },
    { label: "Print dashboard", icon: "lucide:printer", shortcut: "⌘P" },
    { label: "Keyboard shortcuts", icon: "lucide:keyboard" },
  ];

  const filterItems: DropdownEntry[] = [
    { type: "label", label: "Priority" },
    { label: "High only", icon: "lucide:chart-no-axes-column-increasing", onSelect: () => notify("info", "Filter applied", "Showing high priority tickets.") },
    { label: "Medium only", icon: "lucide:chart-no-axes-column-increasing", onSelect: () => notify("info", "Filter applied", "Showing medium priority tickets.") },
    { label: "Low only", icon: "lucide:chart-no-axes-column-increasing", onSelect: () => notify("info", "Filter applied", "Showing low priority tickets.") },
    { type: "separator" },
    { label: "Clear filters", icon: "lucide:x", onSelect: () => notify("success", "Filters cleared") },
  ];

  const accordionItems: AccordionItem[] = [
    {
      id: "sla",
      title: "SLA & escalation policy",
      description: "Targets, business hours, and escalation rules.",
      icon: "lucide:clock-3",
      content: (
        <p>
          High priority tickets have a two-hour first response target. When 80% of
          the target elapses, the ticket is escalated to the team lead.
        </p>
      ),
    },
    {
      id: "routing",
      title: "Ticket routing",
      description: "How conversations reach the right team.",
      icon: "lucide:workflow",
      content: (
        <p>
          Incoming conversations are routed by language, product area, and agent
          availability. Manual overrides are always allowed.
        </p>
      ),
    },
    {
      id: "notifications",
      title: "Notification rules",
      description: "Alerts for agents and team leads.",
      icon: "lucide:bell",
      badge: (
        <Badge tone="warning" variant="outline" size="sm">
          3 rules
        </Badge>
      ),
      content: (
        <div className={styles.choiceStack}>
          <Switch
            label="SLA breach alerts"
            description="Notify the team lead immediately."
            defaultChecked
          />
          <Switch
            label="Daily digest"
            description="Send a summary every morning at 09:00."
          />
        </div>
      ),
    },
    {
      id: "security",
      title: "Security & audit logs",
      description: "Workspace access and retention.",
      icon: "lucide:shield-check",
      tone: "danger",
      content: (
        <p>
          Audit logs are retained for 12 months. Only workspace administrators can
          export or delete them.
        </p>
      ),
    },
  ];

  const modalMeta = MODAL_META[modal ?? "basic"];

  return (
    <div className={styles.shell} data-sidebar={sidebarMode}>
      <div className={styles.sidebarRegion} inert={!sidebarVisible}>
        <Sidebar
          sections={NAV_SECTIONS}
          brand={{ name: "Poinqu", mark: "P" }}
          searchable={false}
          initialActive="Typography"
          activeLabel={activeSection}
          expanded={sidebarVisible}
          user={USER}
          onToggle={toggleSidebar}
          onNavigate={navigate}
          onProfile={() => setAccountOpen(true)}
        />
      </div>

      <div className={styles.topbarRegion}>
        <Topbar
          expanded={sidebarVisible}
          onToggleSidebar={toggleSidebar}
          breadcrumb={[{ label: "UI Kit" }, { label: "Components" }]}
          onNotifications={() =>
            notify("info", "No new notifications", "You are all caught up.")
          }
          onSettings={() =>
            notify("info", "Settings", "Settings is not part of this component demo.")
          }
        />
      </div>

      <main className={styles.content}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Design system</p>
            <h1>Components</h1>
            <p>
              Building blocks for the Poinqu admin panel. Every component is typed,
              accessible, and ready to compose into real screens.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Badge tone="success" dot>
              Ready to use
            </Badge>
          </div>
        </header>

        <div className={styles.sections}>
          <Section
            id="typography"
            tag="Foundation"
            title="Typography"
            description="A consistent type scale for headings, body copy, labels, code, and quotes. Every variant uses the same tokens as the rest of the kit."
          >
            <div className={styles.typographyGrid}>
              <div className={styles.typographyStack}>
                <Typography variant="label">Display scale</Typography>
                <Typography variant="display">Design with rhythm</Typography>
                <Typography variant="h1">Heading one</Typography>
                <Typography variant="h2">Heading two</Typography>
                <Typography variant="h3">Heading three</Typography>
                <Typography variant="h4">Heading four</Typography>
              </div>

              <div className={styles.typographyStack}>
                <Typography variant="label">Text styles</Typography>
                <Typography variant="lead">
                  Lead paragraphs introduce a page or section with a little more
                  presence.
                </Typography>
                <Typography variant="body">
                  Body copy is the default. It is sized for comfortable reading in
                  dense admin screens and pairs with the card and table rhythm.
                </Typography>
                <Typography variant="small">
                  Small text for metadata and helper copy.
                </Typography>
                <Typography variant="muted">
                  Muted text for secondary information.
                </Typography>
                <Typography variant="quote">
                  Good design is as little design as possible.
                </Typography>
                <Typography variant="body">
                  Run <Typography variant="code">npm run build</Typography> before
                  shipping.
                </Typography>
                <div className={styles.row}>
                  <Typography variant="small" tone="success">
                    Success tone
                  </Typography>
                  <Typography variant="small" tone="warning">
                    Warning tone
                  </Typography>
                  <Typography variant="small" tone="danger">
                    Danger tone
                  </Typography>
                </div>
              </div>
            </div>
            <p className={styles.hint}>
              Gunakan <code>variant=&quot;label&quot;</code> untuk eyebrow dan{" "}
              <code>variant=&quot;code&quot;</code> untuk inline code. Semua
              variant bisa diberi tone tanpa mengubah ukuran.
            </p>
          </Section>

          <Section
            id="card"
            tag="Layout"
            title="Card"
            description="A flexible surface for grouping related content. Every showcase section below uses the same Card component."
          >
            <div className={styles.cardGrid}>
              <Card>
                <CardHeader
                  title="Support plan"
                  description="Your current subscription"
                  icon="lucide:life-buoy"
                  actions={
                    <Badge tone="success" dot>
                      Active
                    </Badge>
                  }
                />
                <CardBody>
                  <p className={styles.cardText}>
                    Unlimited tickets, SLA policies, and a shared inbox for your
                    support team.
                  </p>
                  <div className={styles.cardMetric}>
                    <strong>24</strong>
                    <span>agents online</span>
                  </div>
                </CardBody>
                <CardFooter align="between">
                  <span className={styles.cardMeta}>Renews Sep 12</span>
                  <Button
                    label="Manage"
                    size="sm"
                    iconRight="lucide:arrow-right"
                    onClick={() => notify("info", "Manage plan")}
                  />
                </CardFooter>
              </Card>

              <Card variant="muted">
                <CardHeader
                  title="SLA compliance"
                  icon="lucide:clock-3"
                  actions={
                    <Badge tone="warning" variant="outline">
                      At risk
                    </Badge>
                  }
                />
                <CardBody>
                  <p className={styles.cardText}>
                    92% of conversations were answered within the first response
                    target this week.
                  </p>
                  <div className={styles.progress}>
                    <span style={{ width: "92%" }} />
                  </div>
                  <div className={styles.cardMetaRow}>
                    <span>Within target</span>
                    <strong>92%</strong>
                  </div>
                </CardBody>
                <CardFooter align="between">
                  <span className={styles.cardMeta}>Last 7 days</span>
                  <Button
                    label="View report"
                    size="sm"
                    iconRight="lucide:arrow-right"
                    onClick={() => notify("info", "Compliance report")}
                  />
                </CardFooter>
              </Card>

              <Card variant="elevated">
                <CardHeader
                  title="Upgrade workspace"
                  description="Advanced SLA policies, audit logs, and priority support."
                  icon="lucide:sparkles"
                />
                <CardBody>
                  <p className={styles.cardText}>
                    Built for teams that need more control over routing and
                    reporting.
                  </p>
                </CardBody>
                <CardFooter align="between">
                  <span className={styles.cardMeta}>From $29 / seat</span>
                  <Button
                    label="View plans"
                    size="sm"
                    variant="solid"
                    tone="primary"
                    iconRight="lucide:arrow-up-right"
                    onClick={() => notify("info", "View plans")}
                  />
                </CardFooter>
              </Card>
            </div>
          </Section>

          <Section
            id="alert"
            tag="Feedback"
            title="Alert"
            description="Inline messages for information, success, warning, and destructive states."
          >
            <div className={styles.grid2}>
              <Alert
                tone="info"
                title="Information"
                description="Ticket volume is calculated from the last seven days of activity."
              />
              <Alert
                tone="success"
                title="Changes saved"
                description="The SLA policy was updated and applied to all open tickets."
              />
              <Alert
                tone="warning"
                title="SLA breach risk"
                description="Three tickets are approaching their first response target."
              />
              <Alert
                tone="danger"
                title="Integration failed"
                description="The email sync could not connect. Check the API credentials."
              />
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Dismissible</p>
              {alertVisible ? (
                <Alert
                  tone="info"
                  title="Dismissible alert"
                  description="Close this message without leaving the page."
                  onDismiss={() => setAlertVisible(false)}
                />
              ) : (
                <Button
                  label="Show dismissible alert"
                  icon="lucide:rotate-ccw"
                  size="sm"
                  onClick={() => setAlertVisible(true)}
                />
              )}
            </div>
          </Section>

          <Section
            id="badge"
            tag="Data display"
            title="Badge"
            description="Compact status labels with soft, solid, and outline treatments."
          >
            <div className={styles.group}>
              <p className={styles.groupLabel}>Soft</p>
              <div className={styles.row}>
                {BADGE_TONES.map((tone) => (
                  <Badge key={tone} tone={tone}>
                    {tone}
                  </Badge>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Solid</p>
              <div className={styles.row}>
                {BADGE_TONES.map((tone) => (
                  <Badge key={tone} tone={tone} variant="solid">
                    {tone}
                  </Badge>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Outline, dot, icon, and size</p>
              <div className={styles.row}>
                <Badge tone="info" variant="outline">
                  In review
                </Badge>
                <Badge tone="success" dot>
                  Active
                </Badge>
                <Badge tone="violet" icon="lucide:sparkles">
                  AI assisted
                </Badge>
                <Badge tone="warning" variant="outline" dot>
                  At risk
                </Badge>
                <Badge tone="neutral" size="sm">
                  Small
                </Badge>
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Notification badge</p>
              <div className={styles.row}>
                <span className={styles.notificationBadgeDemo}>
                  <Icon name="lucide:bell" />
                  <Badge
                    tone="danger"
                    variant="solid"
                    size="sm"
                    className={styles.notificationBadge}
                  >
                    8
                  </Badge>
                </span>
                <span className={styles.notificationBadgeDemo}>
                  <Icon name="lucide:mail" />
                  <Badge
                    tone="info"
                    variant="solid"
                    size="sm"
                    className={styles.notificationBadge}
                  >
                    3
                  </Badge>
                </span>
                <span className={styles.value}>
                  Overlay badges on icon buttons
                </span>
              </div>
            </div>
          </Section>

          <Section
            id="button"
            tag="Actions"
            title="Button"
            description="Primary, neutral, success, warning, and danger actions in outline, solid, and ghost variants."
          >
            <div className={styles.group}>
              <p className={styles.groupLabel}>Variants and tones</p>
              <div className={styles.row}>
                <Button label="Primary" variant="solid" tone="primary" icon="lucide:plus" />
                <Button label="Default" />
                <Button label="Danger" variant="solid" tone="danger" icon="lucide:trash-2" />
                <Button label="Success" variant="solid" tone="success" icon="lucide:check" />
                <Button label="Warning" variant="solid" tone="warning" icon="lucide:triangle-alert" />
                <Button label="Ghost" variant="ghost" icon="lucide:settings-2" />
                <Button label="Danger outline" tone="danger" icon="lucide:triangle-alert" />
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Size, icons, loading, and disabled</p>
              <div className={styles.row}>
                <Button label="Small" size="sm" />
                <Button label="Medium" />
                <Button
                  label="Continue"
                  variant="solid"
                  tone="primary"
                  iconRight="lucide:arrow-right"
                />
                <Button iconOnly icon="lucide:search" label="Search" />
                <Button
                  iconOnly
                  variant="solid"
                  tone="primary"
                  icon="lucide:plus"
                  label="Add item"
                />
                <Button label="Disabled" disabled />
                <Button
                  label={saving ? "Saving…" : "Save changes"}
                  loading={saving}
                  variant="solid"
                  tone="primary"
                  icon="lucide:save"
                  onClick={save}
                />
              </div>
            </div>
          </Section>

          <Section
            id="button-group"
            tag="Actions"
            title="Button Group"
            description="Segmented controls that keep related actions and views together."
          >
            <div className={styles.group}>
              <p className={styles.groupLabel}>Segmented control</p>
              <div className={styles.row}>
                <ButtonGroup aria-label="Time range">
                  <Button
                    label="Day"
                    size="sm"
                    aria-pressed={view === "day"}
                    onClick={() => setView("day")}
                  />
                  <Button
                    label="Week"
                    size="sm"
                    aria-pressed={view === "week"}
                    onClick={() => setView("week")}
                  />
                  <Button
                    label="Month"
                    size="sm"
                    aria-pressed={view === "month"}
                    onClick={() => setView("month")}
                  />
                </ButtonGroup>
                <span className={styles.value}>Selected: {view}</span>
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Icon group</p>
              <div className={styles.row}>
                <ButtonGroup aria-label="Text alignment">
                  {ALIGNMENTS.map((item) => (
                    <Button
                      key={item.id}
                      iconOnly
                      icon={item.icon}
                      label={item.label}
                      aria-pressed={alignment === item.id}
                      onClick={() => setAlignment(item.id)}
                    />
                  ))}
                </ButtonGroup>
                <span className={styles.value}>Alignment: {alignment}</span>
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Action group</p>
              <ButtonGroup aria-label="Ticket actions">
                <Button
                  label="Approve"
                  icon="lucide:check"
                  onClick={() => notify("success", "Ticket approved")}
                />
                <Button
                  label="Reassign"
                  icon="lucide:repeat-2"
                  onClick={() => notify("info", "Reassign ticket")}
                />
                <Button
                  label="Reject"
                  icon="lucide:x"
                  tone="danger"
                  onClick={() => notify("danger", "Ticket rejected")}
                />
              </ButtonGroup>
            </div>
          </Section>

          <Section
            id="form-controls"
            tag="Forms"
            title="Form Controls"
            description="Inputs, selects, textareas, checkboxes, radios, and switches with consistent sizing, focus states, and validation."
          >
            <div className={styles.formGrid}>
              <FormField
                label="Full name"
                required
                hint="Shown to teammates and customers."
              >
                <Input placeholder="Aditya Pratama" icon="lucide:user-round" />
              </FormField>

              <FormField label="Email address" error="Enter a valid email address.">
                <Input
                  type="email"
                  defaultValue="aditya@"
                  icon="lucide:mail"
                />
              </FormField>

              <FormField label="Default priority" required>
                <Select defaultValue="medium">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormField>

              <FormField label="Workspace ID" hint="Managed by your administrator.">
                <Input defaultValue="nuvio-8291" icon="lucide:hash" disabled />
              </FormField>
            </div>

            <div className={styles.group}>
              <FormField label="Internal note" hint="Only visible to agents.">
                <Textarea rows={4} placeholder="Add context for the team..." />
              </FormField>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Checkbox</p>
              <div className={styles.choiceStack}>
                <Checkbox
                  label="Email me about product updates"
                  description="One digest per week, no spam."
                  defaultChecked
                />
                <Checkbox
                  label="SMS alerts for SLA breaches"
                  description="Sent only for high priority tickets."
                />
                <Checkbox
                  label="Partially selected"
                  description="Use the indeterminate state for bulk selection."
                  indeterminate
                />
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Radio</p>
              <div className={styles.formGrid}>
                <RadioGroup
                  name="demo-priority"
                  label="Default priority for new tickets"
                  value={priority}
                  onChange={setPriority}
                  options={[
                    {
                      value: "low",
                      label: "Low",
                      description: "Best effort, no SLA target.",
                    },
                    {
                      value: "medium",
                      label: "Medium",
                      description: "Respond within four business hours.",
                    },
                    {
                      value: "high",
                      label: "High",
                      description: "Respond within one hour.",
                    },
                  ]}
                />

                <RadioGroup
                  name="demo-satisfaction"
                  label="Send a CSAT survey"
                  value={satisfaction}
                  onChange={setSatisfaction}
                  orientation="horizontal"
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Switch</p>
              <div className={styles.choiceStack}>
                <Switch
                  label="Email notifications"
                  description="Get a daily summary of ticket activity."
                  defaultChecked
                />
                <Switch
                  label="Auto-assign new tickets"
                  description="Round-robin within the support team."
                />
                <Switch
                  label="Maintenance mode"
                  description="Pause new incoming conversations."
                  disabled
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <Button
                label="Save changes"
                variant="solid"
                tone="primary"
                icon="lucide:save"
                onClick={() =>
                  notify("success", "Form saved", "The demo form values were saved.")
                }
              />
              <Button
                label="Reset"
                variant="ghost"
                icon="lucide:rotate-ccw"
                onClick={() => notify("info", "Form reset")}
              />
            </div>
          </Section>

          <Section
            id="combobox"
            tag="Forms"
            title="Combobox"
            description="Autocomplete input with a filtered list, keyboard navigation, clear action, and optional multiple selection with chips."
          >
            <div className={styles.formGrid}>
              <FormField
                label="Framework"
                hint="Single select with search, clear, and keyboard navigation."
              >
                <Combobox
                  options={FRAMEWORK_OPTIONS}
                  value={framework}
                  onValueChange={(next) =>
                    setFramework(typeof next === "string" ? next : null)
                  }
                  placeholder="Select a framework"
                  searchPlaceholder="Search frameworks..."
                  clearable
                />
              </FormField>

              <FormField
                label="Labels"
                hint="Multiple select with chips and backspace removal."
              >
                <Combobox
                  options={LABEL_OPTIONS}
                  value={labels}
                  onValueChange={(next) =>
                    setLabels(
                      Array.isArray(next) ? next : next ? [next] : [],
                    )
                  }
                  multiple
                  clearable
                  placeholder="Add label"
                  searchPlaceholder="Search labels..."
                />
              </FormField>

              <FormField
                label="Workspace"
                hint="Disabled state with a selected value."
              >
                <Combobox
                  options={WORKSPACE_OPTIONS}
                  value="nuvio"
                  disabled
                />
              </FormField>

              <FormField
                label="Team"
                error="Choose a team to continue."
              >
                <Combobox
                  options={TEAM_OPTIONS}
                  placeholder="Select a team"
                  searchPlaceholder="Search teams..."
                  invalid
                />
              </FormField>
            </div>
            <p className={styles.hint}>
              Gunakan panah atas/bawah untuk berpindah opsi, Enter untuk memilih,
              dan Escape untuk menutup. Mode multiple menyimpan pilihan sebagai
              chip dan bisa dihapus dengan tombol x atau Backspace.
            </p>
          </Section>

          <Section
            id="attachment"
            tag="Forms"
            title="Attachment"
            description="File cards with media, metadata, upload state, progress, and actions. Use them in composers, message threads, and upload lists."
          >
            {attachments.length ? (
              <div className={styles.attachmentGrid}>
                {attachments.map((attachment) => (
                  <Attachment
                    key={attachment.id}
                    name={attachment.name}
                    meta={attachment.meta}
                    icon={attachment.icon}
                    state={attachment.state}
                    progress={attachment.progress}
                    onOpen={() =>
                      notify(
                        "info",
                        "Preview attachment",
                        `Opening ${attachment.name}.`,
                      )
                    }
                    onRemove={() => {
                      setAttachments((previous) =>
                        previous.filter((item) => item.id !== attachment.id),
                      );
                      notify(
                        "info",
                        "Attachment removed",
                        `${attachment.name} removed.`,
                      );
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.attachmentEmpty}>
                <Icon name="lucide:paperclip" />
                <span>No attachments. Add a file to see it here.</span>
              </div>
            )}
            <p className={styles.hint}>
              State upload: idle, uploading, processing, error, dan done. Klik
              kartu untuk preview, atau tombol x untuk menghapus.
            </p>
          </Section>

          <Section
            id="placeholder"
            tag="Loading"
            title="Placeholder"
            description="Skeleton shapes for loading states. Compose circles, headings, text lines, and rectangles while data is on the way."
          >
            <div className={styles.placeholderGrid}>
              <div className={styles.skeletonCard}>
                <div className={styles.skeletonTop}>
                  <Placeholder variant="circle" width={40} height={40} />
                  <div className={styles.skeletonLines}>
                    <Placeholder variant="heading" width="52%" />
                    <Placeholder variant="text" width="34%" />
                  </div>
                </div>
                <Placeholder variant="text" lines={3} />
              </div>

              <div className={styles.skeletonCard}>
                <Placeholder variant="rect" height={86} />
                <div className={styles.skeletonRows}>
                  {[0, 1, 2].map((index) => (
                    <div key={index} className={styles.skeletonRow}>
                      <Placeholder variant="circle" width={28} height={28} />
                      <Placeholder
                        variant="text"
                        width={index === 1 ? "58%" : "78%"}
                      />
                      <Placeholder variant="text" width={36} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Building blocks</p>
              <div className={styles.row}>
                <span className={styles.value}>Circle</span>
                <Placeholder variant="circle" width={32} height={32} />
                <span className={styles.value}>Heading</span>
                <Placeholder variant="heading" width={120} />
                <span className={styles.value}>Text</span>
                <Placeholder variant="text" width={160} />
                <span className={styles.value}>Rect</span>
                <Placeholder variant="rect" width={160} height={40} />
              </div>
            </div>
          </Section>

          <Section
            id="spinner"
            tag="Loading"
            title="Spinner"
            description="Indeterminate progress indicators for actions that take a moment."
          >
            <div className={styles.spinnerGrid}>
              {(["sm", "md", "lg"] as const).map((size) => (
                <div key={size} className={styles.spinnerTile}>
                  <Spinner size={size} label={`${size} spinner`} />
                  <span>{size}</span>
                </div>
              ))}
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Tones</p>
              <div className={styles.spinnerGrid}>
                {(["default", "primary", "success", "danger", "muted"] as const).map(
                  (tone) => (
                    <div key={tone} className={styles.spinnerTile}>
                      <Spinner tone={tone} label={`${tone} spinner`} />
                      <span>{tone}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Inline</p>
              <div className={styles.row}>
                <Button
                  label="Loading"
                  variant="solid"
                  tone="primary"
                  loading
                />
                <span className={styles.value}>
                  <Spinner size="sm" /> Syncing tickets…
                </span>
                <span className={styles.value}>
                  <Spinner size="sm" tone="success" /> Connected
                </span>
              </div>
            </div>
          </Section>

          <Section
            id="breadcrumb"
            tag="Navigation"
            title="Breadcrumb"
            description="Show where the user is in the hierarchy. The same component is applied to the Topbar on every page."
          >
            <div className={styles.choiceStack}>
              <div>
                <p className={styles.groupLabel}>Default</p>
                <Breadcrumb
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Tickets", href: "/" },
                    { label: "Ticket #2319" },
                  ]}
                />
              </div>

              <div>
                <p className={styles.groupLabel}>With icons</p>
                <Breadcrumb
                  items={[
                    { label: "Dashboard", href: "/", icon: "lucide:layout-grid" },
                    { label: "Tickets", href: "/", icon: "lucide:ticket" },
                    { label: "#2319" },
                  ]}
                />
              </div>

              <div>
                <p className={styles.groupLabel}>Chevron separator</p>
                <Breadcrumb
                  separator={<Icon name="lucide:chevron-right" />}
                  items={[
                    { label: "Workspace", href: "/" },
                    { label: "Settings", href: "/" },
                    { label: "Billing" },
                  ]}
                />
              </div>
            </div>
            <p className={styles.hint}>
              Breadcrumb ini juga dipakai langsung oleh Topbar di halaman showcase.
            </p>
          </Section>

          <Section
            id="tabs"
            tag="Navigation"
            title="Tabs"
            description="Switch between related views in place, with arrow-key navigation and accessible tab panels."
          >
            <Tabs defaultValue="overview">
              <TabsList ariaLabel="Ticket details">
                <Tab value="overview" icon="lucide:layout-grid">
                  Overview
                </Tab>
                <Tab value="activity" icon="lucide:activity" badge="8">
                  Activity
                </Tab>
                <Tab value="settings" icon="lucide:settings-2">
                  Settings
                </Tab>
              </TabsList>

              <TabPanel value="overview">
                <div className={styles.tabPanelContent}>
                  <p className={styles.modalText}>
                    Payment failed on invoice #INV-8821. The gateway returned a
                    timeout, and the customer has retried twice.
                  </p>
                  <div className={`${styles.detailRows} ${styles.tabDetails}`}>
                    <div>
                      <span>Priority</span>
                      <Badge tone="danger">High</Badge>
                    </div>
                    <div>
                      <span>Assigned agent</span>
                      <span>John Doe</span>
                    </div>
                    <div>
                      <span>SLA due</span>
                      <span>2h left</span>
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="activity">
                <div className={styles.tabPanelContent}>
                  {[
                    ["Ticket updated", "11:20 AM", "info"],
                    ["Agent reassigned", "11:00 AM", "violet"],
                    ["Customer feedback", "10:30 AM", "warning"],
                  ].map(([label, time, tone]) => (
                    <div key={label} className={styles.tabItem}>
                      <span>{label}</span>
                      <span className={styles.tabItemMeta}>
                        <Badge tone={tone as BadgeTone} variant="outline" size="sm">
                          {time}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </TabPanel>

              <TabPanel value="settings">
                <div className={styles.choiceStack}>
                  <Switch
                    label="Email updates"
                    description="Notify me when this ticket changes."
                    defaultChecked
                  />
                  <Switch
                    label="SLA reminders"
                    description="Send a reminder one hour before the due time."
                  />
                </div>
              </TabPanel>
            </Tabs>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Pill variant</p>
              <Tabs defaultValue="day" variant="pill">
                <TabsList ariaLabel="Time range">
                  <Tab value="day">Day</Tab>
                  <Tab value="week">Week</Tab>
                  <Tab value="month">Month</Tab>
                </TabsList>
                <TabPanel value="day">
                  <p className={styles.modalText}>
                    Showing ticket volume for today — 584 conversations.
                  </p>
                </TabPanel>
                <TabPanel value="week">
                  <p className={styles.modalText}>
                    Showing the last seven days — 4,790 conversations.
                  </p>
                </TabPanel>
                <TabPanel value="month">
                  <p className={styles.modalText}>
                    Showing the last 30 days — 19,160 conversations.
                  </p>
                </TabPanel>
              </Tabs>
            </div>
          </Section>

          <Section
            id="collapse"
            tag="Disclosure"
            title="Collapse"
            description="Progressive disclosure for secondary details, preferences, and advanced settings."
          >
            <div className={styles.collapseStack}>
              <Collapse
                title="How do SLA policies work?"
                description="Targets, business hours, and escalation rules."
                icon="lucide:book-open"
                defaultOpen
              >
                <p>
                  Every new ticket inherits the SLA policy for its priority. The
                  timer pauses outside business hours and escalates when 80% of
                  the target has elapsed.
                </p>
                <div className={styles.row}>
                  <Badge tone="success">Active</Badge>
                  <Badge tone="info" variant="outline">
                    2h first response
                  </Badge>
                  <Badge tone="neutral" variant="outline">
                    Business hours
                  </Badge>
                </div>
              </Collapse>

              <Collapse
                title="Notification preferences"
                description="Choose what your team receives."
                icon="lucide:bell"
                badge={
                  <Badge tone="warning" variant="outline" size="sm">
                    3 changes
                  </Badge>
                }
              >
                <div className={styles.choiceStack}>
                  <Switch
                    label="SLA breach alerts"
                    description="Notify the team lead immediately."
                    defaultChecked
                  />
                  <Switch
                    label="Daily digest"
                    description="Send a summary every morning at 09:00."
                  />
                </div>
              </Collapse>

              <Collapse
                title="Danger zone"
                description="Permanent actions for this workspace."
                icon="lucide:triangle-alert"
                tone="danger"
              >
                <Alert
                  tone="danger"
                  title="Deleting the workspace cannot be undone"
                  description="All tickets, attachments, and audit logs will be removed."
                />
                <div className={styles.collapseActions}>
                  <Button
                    label="Delete workspace"
                    variant="solid"
                    tone="danger"
                    icon="lucide:trash-2"
                    onClick={() =>
                      notify(
                        "danger",
                        "Delete workspace",
                        "Destructive actions should ask for confirmation.",
                      )
                    }
                  />
                </div>
              </Collapse>
            </div>
          </Section>

          <Section
            id="stepper"
            tag="Navigation"
            title="Stepper"
            description="Show progress through a multi-step flow, with completed, current, and upcoming states."
          >
            <div className={styles.stepperDemo}>
              <Stepper
                steps={STEPPER_STEPS}
                current={step}
                onStepChange={setStep}
              />
              <div className={styles.stepperActions}>
                <Button
                  label="Back"
                  icon="lucide:arrow-left"
                  variant="ghost"
                  disabled={step === 0}
                  onClick={() => setStep(Math.max(0, step - 1))}
                />
                <Button
                  label={
                    step === STEPPER_STEPS.length - 1 ? "Finish" : "Next"
                  }
                  iconRight="lucide:arrow-right"
                  variant="solid"
                  tone="primary"
                  onClick={() => {
                    if (step === STEPPER_STEPS.length - 1) {
                      notify(
                        "success",
                        "Workflow complete",
                        "The ticket was created and assigned.",
                      );
                      setStep(0);
                    } else {
                      setStep(step + 1);
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Vertical</p>
              <div className={styles.stepperPanel}>
                <Stepper
                  steps={VERTICAL_STEPS}
                  current={2}
                  orientation="vertical"
                />
              </div>
            </div>
          </Section>

          <Section
            id="pagination"
            tag="Navigation"
            title="Pagination"
            description="Move through long result sets with page numbers, previous/next controls, and a compact mobile summary."
          >
            <div className={styles.paginationDemo}>
              <div className={styles.paginationRow}>
                <Pagination
                  page={paginationPage}
                  pageCount={12}
                  onPageChange={setPaginationPage}
                />
                <span className={styles.value}>12 pages · controlled</span>
              </div>

              <div className={styles.paginationRow}>
                <Pagination
                  page={paginationPage}
                  pageCount={12}
                  siblings={0}
                  onPageChange={setPaginationPage}
                />
                <span className={styles.value}>Compact, no siblings</span>
              </div>
            </div>
            <p className={styles.hint}>
              Di layar kecil, deretan nomor halaman diganti dengan ringkasan
              &ldquo;Page X of Y&rdquo; agar tetap muat.
            </p>
          </Section>

          <Section
            id="marker"
            tag="Data display"
            title="Marker"
            description="Inline notes, bordered status rows, and labeled separators for conversation and activity threads."
          >
            <div className={styles.choiceStack}>
              <Marker icon="lucide:git-branch">
                Switched to a new branch fix/frozen-lockfile
              </Marker>
              <Marker
                variant="border"
                icon="lucide:search"
                tone="info"
                meta="4 files"
              >
                Explored 4 related files
              </Marker>
              <Marker loading tone="info" meta="Live">
                Compacting conversation…
              </Marker>
              <Marker variant="separator">Today</Marker>
              <Marker
                variant="border"
                icon="lucide:circle-alert"
                tone="danger"
                meta="Retry"
              >
                Failed to connect to the workspace
              </Marker>
            </div>
            <p className={styles.hint}>
              Variant default untuk catatan inline, border untuk baris status,
              separator untuk pemisah berlabel. Gunakan loading untuk status yang
              sedang berjalan.
            </p>
          </Section>

          <Section
            id="trace"
            tag="Data display"
            title="Trace"
            description="A compact list of steps for reasoning, tool calls, and plans. Lines can expand to show detail and reflect running, error, or pending states."
          >
            <Trace ariaLabel="Agent trace" items={TRACE_ITEMS} />
            <p className={styles.hint}>
              Klik baris yang punya detail untuk membuka output. Status running
              memakai spinner dan shimmer; error, pending, dan done punya warna
              masing-masing.
            </p>
          </Section>

          <Section
            id="list-group"
            tag="Data display"
            title="List Group"
            description="A responsive list for records, activity, and navigation. Meta and actions move to a new row on small screens."
          >
            <ListGroup ariaLabel="Recent workspace activity">
              <ListGroupItem
                title="Ticket #2319"
                description="Payment failed on invoice · John Doe"
                icon="lucide:ticket"
                active
                meta={<Badge tone="danger">High</Badge>}
                actions={
                  <Button
                    label="View"
                    size="sm"
                    onClick={() =>
                      notify("info", "Open ticket", "Ticket #2319 selected.")
                    }
                  />
                }
              />
              <ListGroupItem
                title="Sarah Lee"
                description="Support agent · Online now"
                icon="lucide:user-round"
                meta={
                  <Badge tone="success" dot>
                    Online
                  </Badge>
                }
                actions={
                  <Button
                    label="Message"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      notify("info", "Message agent", "Composer would open here.")
                    }
                  />
                }
              />
              <ListGroupItem
                title="SLA breach risk"
                description="3 tickets need attention before 18:00"
                icon="lucide:triangle-alert"
                meta={
                  <Badge tone="warning" variant="outline">
                    3 alerts
                  </Badge>
                }
                actions={
                  <Button
                    label="Review"
                    size="sm"
                    onClick={() =>
                      notify("warning", "SLA review", "Filtering at-risk tickets.")
                    }
                  />
                }
              />
              <ListGroupItem
                title="Knowledge base updated"
                description="Login troubleshooting · 10:30 AM"
                icon="lucide:notebook-text"
                meta={
                  <Badge tone="info" variant="outline">
                    Article
                  </Badge>
                }
              />
            </ListGroup>
            <p className={styles.hint}>
              Coba perkecil viewport: badge meta dan tombol action akan turun ke
              baris berikutnya secara otomatis.
            </p>
          </Section>

          <Section
            id="accordion"
            tag="Data display"
            title="Accordion"
            description="An exclusive group of collapsible panels. Opening one panel closes the others when type is set to single."
          >
            <Accordion
              type="single"
              defaultValue={["sla"]}
              items={accordionItems}
            />
            <p className={styles.hint}>
              Hanya satu panel terbuka pada satu waktu. Gunakan type=&quot;multiple&quot;
              jika beberapa panel boleh terbuka bersamaan.
            </p>
          </Section>

          <Section
            id="table"
            tag="Data display"
            title="Table"
            description="Semantic table primitives with a flush mode that sits edge-to-edge inside a Card, plus aligned cells and a scrollable wrapper."
            bodyPadding="none"
            footer={
              <p className={styles.hint}>
                Table dasar tanpa state. Mode flush dipakai saat tabel berada di
                dalam card agar header sejajar dengan judul card.
              </p>
            }
          >
            <Table ariaLabel="Recent tickets" minWidth={680} flush>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Ticket</TableHeaderCell>
                  <TableHeaderCell>Subject</TableHeaderCell>
                  <TableHeaderCell>Priority</TableHeaderCell>
                  <TableHeaderCell>Agent</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_ROWS.slice(0, 5).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <span className={styles.mono}>#{row.id}</span>
                    </TableCell>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell>
                      <Badge tone={PRIORITY_META[row.priority].tone}>
                        {row.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.agent}</TableCell>
                    <TableCell>
                      <Badge
                        tone={STATUS_META[row.status].tone}
                        variant="outline"
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          <Section
            id="data-table"
            tag="Data display"
            title="Data Table"
            description="Search, sortable columns, row selection, pagination, and an empty state built on top of the Table primitives."
            bodyPadding="none"
            footer={
              <p className={styles.hint}>
                Coba cari, klik header kolom untuk sort, pilih baris, lalu pindah
                halaman. Toolbar dan footer tetap punya padding sendiri, tabelnya
                full-bleed di dalam card.
              </p>
            }
          >
            <DataTable
              data={DEMO_ROWS}
              columns={DATA_COLUMNS}
              getRowId={(row) => row.id}
              ariaLabel="Support tickets"
              searchPlaceholder="Search tickets..."
              searchText={searchDemoRows}
              pageSize={5}
              selectable
              flush
            />
          </Section>

          <Section
            id="modal"
            tag="Overlays"
            title="Modal"
            description="Centered dialogs, destructive confirmations, forms, a side sheet, and a fullscreen surface."
          >
            <div className={styles.row}>
              <Button
                label="Basic modal"
                icon="lucide:app-window"
                onClick={() => setModal("basic")}
              />
              <Button
                label="Confirm delete"
                tone="danger"
                icon="lucide:trash-2"
                onClick={() => setModal("danger")}
              />
              <Button
                label="Form modal"
                icon="lucide:user-round-plus"
                onClick={() => setModal("form")}
              />
              <Button
                label="Side sheet"
                icon="lucide:panel-right"
                onClick={() => setModal("sheet")}
              />
              <Button
                label="Fullscreen"
                icon="lucide:maximize-2"
                onClick={() => setModal("fullscreen")}
              />
              <Button
                label="Success modal"
                tone="success"
                icon="lucide:circle-check"
                onClick={() => setModal("success")}
              />
            </div>
            <p className={styles.hint}>
              Modal memakai native <code>&lt;dialog&gt;</code>: fokus terkunci di
              dalam dialog, Escape menutup, dan klik backdrop juga menutup.
            </p>
          </Section>

          <Section
            id="alert-dialog"
            tag="Overlays"
            title="Alert Dialog"
            description="A focused confirmation surface for destructive or high-impact actions. Backdrop clicks do not dismiss it."
          >
            <div className={styles.row}>
              <Button
                label="Publish changes"
                icon="lucide:upload-cloud"
                onClick={() => setAlertDialog("publish")}
              />
              <Button
                label="Delete workspace"
                tone="danger"
                icon="lucide:trash-2"
                onClick={() => setAlertDialog("delete")}
              />
            </div>
            <p className={styles.hint}>
              Alert Dialog memakai <code>role=&quot;alertdialog&quot;</code>, fokus
              terkunci di dalam dialog, Escape atau Cancel menutup, dan klik
              backdrop tidak menutup.
            </p>
            <AlertDialog
              open={alertDialog !== null}
              onOpenChange={(open) => {
                if (!open) setAlertDialog(null);
              }}
              title={
                alertDialog === "delete"
                  ? "Delete this workspace?"
                  : "Publish changes?"
              }
              description={
                alertDialog === "delete"
                  ? "This permanently deletes the workspace, its tickets, and audit history. This action cannot be undone."
                  : "This publishes 24 pending changes to the production workspace and notifies every agent."
              }
              icon={
                alertDialog === "delete"
                  ? "lucide:trash-2"
                  : "lucide:upload-cloud"
              }
              tone={alertDialog === "delete" ? "danger" : "default"}
              confirmLabel={
                alertDialog === "delete" ? "Delete workspace" : "Publish changes"
              }
              onConfirm={() => {
                const deleting = alertDialog === "delete";
                notify(
                  deleting ? "danger" : "success",
                  deleting ? "Workspace deleted" : "Changes published",
                  deleting
                    ? "The demo workspace was removed."
                    : "The demo changes are live.",
                );
                setAlertDialog(null);
              }}
            />
          </Section>

          <Section
            id="toast"
            tag="Feedback"
            title="Toast"
            description="Stackable, auto-dismissing notifications triggered from anywhere through useToast()."
          >
            <div className={styles.row}>
              <Button
                label="Info toast"
                icon="lucide:info"
                onClick={() =>
                  notify("info", "Heads up", "Reference data is up to date.")
                }
              />
              <Button
                label="Success toast"
                icon="lucide:circle-check"
                tone="success"
                onClick={() =>
                  notify("success", "Changes saved", "Your SLA policy was updated.")
                }
              />
              <Button
                label="Warning toast"
                icon="lucide:triangle-alert"
                tone="warning"
                onClick={() =>
                  notify("warning", "SLA at risk", "Three tickets need attention.")
                }
              />
              <Button
                label="Danger toast"
                icon="lucide:circle-alert"
                tone="danger"
                onClick={() =>
                  notify("danger", "Export failed", "The report could not be generated.")
                }
              />
              <Button
                label="Toast with action"
                icon="lucide:bell"
                variant="solid"
                tone="primary"
                onClick={() =>
                  toast({
                    title: "Report ready",
                    description: "Your weekly support report is available.",
                    tone: "success",
                    action: {
                      label: "Download report",
                      onClick: () => notify("info", "Download started"),
                    },
                  })
                }
              />
            </div>
          </Section>

          <Section
            id="dropdown"
            tag="Overlays"
            title="Dropdown"
            description="Accessible menus with labels, shortcuts, disabled items, and destructive actions."
          >
            <div className={styles.row}>
              <Dropdown
                label="Actions"
                iconRight="lucide:chevron-down"
                items={actionItems}
                menuWidth={220}
              />
              <Dropdown
                label="More actions"
                iconOnly
                icon="lucide:ellipsis-vertical"
                items={moreItems}
              />
              <Dropdown
                label="Filter"
                icon="lucide:filter"
                align="start"
                items={filterItems}
              />
            </div>
            <p className={styles.hint}>
              Klik trigger atau tekan ↓/↑ untuk membuka menu, lalu gunakan Home, End,
              Enter, dan Escape untuk bernavigasi.
            </p>
          </Section>

          <Section
            id="tooltip"
            tag="Overlays"
            title="Tooltip"
            description="Short contextual hints on hover or keyboard focus, available in four placements."
          >
            <div className={styles.tooltipGrid}>
              <Tooltip content="Create a new ticket" placement="top">
                <Button label="Top" icon="lucide:plus" />
              </Tooltip>
              <Tooltip content="Export the current view" placement="bottom">
                <Button label="Bottom" icon="lucide:download" />
              </Tooltip>
              <Tooltip content="Open filters" placement="left">
                <Button label="Left" icon="lucide:filter" />
              </Tooltip>
              <Tooltip content="Configure columns" placement="right">
                <Button label="Right" icon="lucide:columns-3" />
              </Tooltip>
              <Tooltip content="Icon-only actions are supported too">
                <Button iconOnly icon="lucide:settings-2" label="Settings" />
              </Tooltip>
              <Tooltip content="All systems operational">
                <button
                  type="button"
                  className={styles.tooltipTarget}
                  aria-label="System status"
                >
                  <Badge tone="success" dot>
                    Operational
                  </Badge>
                </button>
              </Tooltip>
            </div>
            <p className={styles.hint}>
              Tooltip muncul setelah hover atau fokus singkat, menutup saat blur,
              dan bisa ditutup dengan Escape. Konten memakai role=&quot;tooltip&quot;.
            </p>
          </Section>
        </div>

        <footer className={styles.pageFooter}>
          <span>Poinqu UI Kit</span>
          <span>Next.js · CSS Modules · Iconify</span>
        </footer>
      </main>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modalMeta.title}
        description={modalMeta.description}
        icon={modalMeta.icon}
        tone={modalMeta.tone}
        size={modalMeta.size}
        presentation={
          modal === "sheet"
            ? "sheet"
            : modal === "fullscreen"
              ? "fullscreen"
              : "center"
        }
        footer={
          modal === "success" ? (
            <Button
              label="Done"
              variant="solid"
              tone="primary"
              onClick={() => setModal(null)}
            />
          ) : (
            <>
              <Button
                label={modal === "danger" ? "Cancel" : "Close"}
                variant="ghost"
                onClick={() => setModal(null)}
              />
              {modal === "danger" ? (
                <Button
                  label="Delete ticket"
                  variant="solid"
                  tone="danger"
                  icon="lucide:trash-2"
                  onClick={() => {
                    setModal(null);
                    notify("danger", "Ticket deleted", "Ticket #2319 was removed.");
                  }}
                />
              ) : modal === "form" ? (
                <Button
                  label="Send invite"
                  variant="solid"
                  tone="primary"
                  icon="lucide:send"
                  onClick={() => {
                    setModal(null);
                    notify(
                      "success",
                      "Invitation sent",
                      "The teammate will receive an email shortly.",
                    );
                  }}
                />
              ) : modal === "sheet" ? (
                <Button
                  label="Assign to me"
                  variant="solid"
                  tone="primary"
                  icon="lucide:user-round-check"
                  onClick={() => {
                    setModal(null);
                    notify("success", "Ticket assigned", "Ticket #2319 is now yours.");
                  }}
                />
              ) : modal === "fullscreen" ? (
                <Button
                  label="Publish update"
                  variant="solid"
                  tone="primary"
                  icon="lucide:send"
                  onClick={() => {
                    setModal(null);
                    notify(
                      "success",
                      "Update published",
                      "Everyone in the workspace can see it now.",
                    );
                  }}
                />
              ) : (
                <Button
                  label="Save changes"
                  variant="solid"
                  tone="primary"
                  icon="lucide:save"
                  onClick={() => {
                    setModal(null);
                    notify(
                      "success",
                      "Settings saved",
                      "Workspace defaults were updated.",
                    );
                  }}
                />
              )}
            </>
          )
        }
      >
        {modal === "basic" ? (
          <div className={styles.modalStack}>
            <p className={styles.modalText}>
              These defaults are applied to every new conversation. You can still
              override them per ticket.
            </p>
            <div className={styles.detailRows}>
              <div>
                <span>Default priority</span>
                <Badge tone="warning">Medium</Badge>
              </div>
              <div>
                <span>Auto-assignment</span>
                <Badge tone="success" dot>
                  Enabled
                </Badge>
              </div>
              <div>
                <span>Business hours</span>
                <span>09:00 – 18:00</span>
              </div>
            </div>
          </div>
        ) : modal === "danger" ? (
          <Alert
            tone="danger"
            title="This action cannot be undone"
            description="Deleting a ticket also removes its replies, attachments, and activity history."
          />
        ) : modal === "form" ? (
          <div className={styles.modalForm}>
            <FormField label="Full name" required>
              <Input placeholder="Sarah Lee" icon="lucide:user-round" />
            </FormField>
            <FormField
              label="Email address"
              required
              hint="They will receive an invite link."
            >
              <Input type="email" placeholder="sarah@company.com" icon="lucide:mail" />
            </FormField>
            <FormField label="Role">
              <Select defaultValue="agent">
                <option value="agent">Support agent</option>
                <option value="lead">Team lead</option>
                <option value="admin">Administrator</option>
              </Select>
            </FormField>
          </div>
        ) : modal === "sheet" ? (
          <div className={styles.sheetContent}>
            <div className={styles.row}>
              <Badge tone="danger">High priority</Badge>
              <Badge tone="info">In review</Badge>
            </div>
            <dl className={styles.detailRows}>
              <div>
                <dt>Agent</dt>
                <dd>John Doe</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>2025-08-18</dd>
              </div>
              <div>
                <dt>SLA due</dt>
                <dd>2h left</dd>
              </div>
            </dl>
            <div className={styles.sheetNote}>
              <p>
                Customer reports that the payment failed on invoice #INV-8821. The
                gateway returned a timeout.
              </p>
            </div>
          </div>
        ) : modal === "fullscreen" ? (
          <div className={styles.modalForm}>
            <FormField label="Audience">
              <Select defaultValue="all">
                <option value="all">Everyone</option>
                <option value="team">Support team</option>
              </Select>
            </FormField>
            <FormField label="Message" hint="Markdown is supported.">
              <Textarea rows={12} placeholder="Share an update..." />
            </FormField>
          </div>
        ) : modal === "success" ? (
          <div className={styles.successContent}>
            <Badge tone="success" dot>
              Resolved
            </Badge>
            <p>
              Ticket #2319 was resolved in 1h 42m, ahead of the 2h SLA target.
            </p>
            <div className={styles.successMetric}>
              <strong>1h 42m</strong>
              <span>resolution time</span>
            </div>
          </div>
        ) : null}
      </Modal>

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        user={USER}
        role="Administrator"
        workspace="Poinqu"
        onSignOut={() => {
          notify(
            "info",
            "Signed out",
            "You have been signed out of the demo workspace.",
          );
          setAccountOpen(false);
        }}
      />

      <button
        type="button"
        className={styles.sidebarBackdrop}
        aria-label="Close navigation"
        onClick={() => setSidebarMode("closed")}
      />
    </div>
  );
}
