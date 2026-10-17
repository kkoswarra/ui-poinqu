import Icon from "@/components/ui/Icon";
import Breadcrumb, { type BreadcrumbItem } from "@/components/ui/Breadcrumb";
import styles from "./Topbar.module.css";

type TopbarProps = {
  expanded: boolean;
  onToggleSidebar: () => void;
  breadcrumb?: BreadcrumbItem[];
  onNotifications?: () => void;
  onSettings?: () => void;
};

export default function Topbar({
  expanded,
  onToggleSidebar,
  breadcrumb = [{ label: "Overview", href: "/" }, { label: "Dashboard" }],
  onNotifications,
  onSettings,
}: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <button
        type="button"
        aria-label="Toggle sidebar"
        aria-expanded={expanded}
        onClick={onToggleSidebar}
      >
        <Icon name="lucide:layout-grid" />
      </button>
      <div className={styles.crumbs}>
        <Breadcrumb items={breadcrumb} />
      </div>
      {onNotifications ? (
        <button type="button" aria-label="Notifications" onClick={onNotifications}>
          <Icon name="lucide:bell" />
        </button>
      ) : null}
      {onSettings ? (
        <button type="button" aria-label="Settings" onClick={onSettings}>
          <Icon name="lucide:settings-2" />
        </button>
      ) : null}
    </header>
  );
}
