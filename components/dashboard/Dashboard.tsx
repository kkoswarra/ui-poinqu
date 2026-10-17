"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { METRICS, SIDEBAR, USER, type RangeValue } from "@/lib/data";
import Button from "@/components/ui/Button";
import AccountModal from "@/components/ui/AccountModal";
import Icon from "@/components/ui/Icon";
import RangeSelect from "@/components/ui/RangeSelect";
import { useToast } from "@/components/ui/Toast";
import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/components/topbar/Topbar";
import MetricCard from "@/components/metrics/MetricCard";
import TicketVolumeChart from "@/components/chart/TicketVolumeChart";
import LatestUpdates from "@/components/updates/LatestUpdates";
import SlaTable from "@/components/table/SlaTable";
import styles from "./Dashboard.module.css";

type SidebarMode = "default" | "closed" | "open";

type Detail = {
  title: string;
  description: string;
  fields: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("default");
  const [isMobile, setIsMobile] = useState(false);
  const [range, setRange] = useState<RangeValue>("Last week");
  const [trendRange, setTrendRange] = useState<RangeValue>("Last week");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const { toast } = useToast();

  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const optionsRef = useRef<HTMLDetailsElement>(null);
  const sidebarSearchRef = useRef<HTMLInputElement>(null);
  const tableRegionRef = useRef<HTMLDivElement>(null);

  const sidebarVisible = isMobile
    ? sidebarMode === "open"
    : sidebarMode !== "closed";

  const notice = (message: string) => {
    toast({ title: message, tone: "info" });
  };

  const showDetail = (next: Detail) => {
    setDetail(next);
  };

  const toggleSidebar = () => {
    const mobile = window.matchMedia("(max-width:760px)").matches;
    setSidebarMode((previous) => {
      const opened =
        previous === "open" || (!mobile && previous === "default");
      return opened ? "closed" : "open";
    });
  };

  const scrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  useEffect(() => {
    const media = window.matchMedia("(max-width:760px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const style = getComputedStyle(root);
    const duration = parseFloat(style.getPropertyValue("--duration-panel")) || 0;
    const stagger = parseFloat(style.getPropertyValue("--duration-stagger")) || 0;
    const easing = style.getPropertyValue("--ease-standard").trim();

    const animations = [...root.querySelectorAll<HTMLElement>("[data-region]")].map(
      (region, index) =>
        region.animate(
          [
            { opacity: 0, transform: "translateY(6px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration,
            delay: index * stagger,
            easing,
            fill: "backwards",
          },
        ),
    );

    return () => animations.forEach((animation) => animation.cancel());
  }, []);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      const options = optionsRef.current;
      if (options?.open && !options.contains(event.target as Node)) {
        options.open = false;
      }
    };
    document.addEventListener("click", closeOnOutside);
    return () => document.removeEventListener("click", closeOnOutside);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSidebarMode("open");
        requestAnimationFrame(() => sidebarSearchRef.current?.focus());
      }

      if (event.key === "Escape") {
        if (window.matchMedia("(max-width:760px)").matches) {
          setSidebarMode("closed");
        }
        if (optionsRef.current?.open) optionsRef.current.open = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (detail && !dialog.open) dialog.showModal();
    if (!detail && dialog.open) dialog.close();
  }, [detail]);

  const resetRange = () => {
    setRange("Last week");
    setTrendRange("Last week");
    notice("Time ranges reset to last week.");
    if (optionsRef.current) optionsRef.current.open = false;
  };

  const navigate = (label: string) => {
    if (label === "Overview") {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      return;
    }

    if (
      ["All / My Queue", "SLA Breach Risk", "Escalations", "SLA Compliance"].includes(
        label,
      )
    ) {
      tableRegionRef.current?.scrollIntoView({
        behavior: scrollBehavior(),
        block: "start",
      });
      notice(`${label} · showing reference tickets`);
      return;
    }

    showDetail({
      title: label,
      description:
        "This section is represented by the navigation in the reference dashboard.",
      fields:
        "Use Overview to explore the support dashboard and its sample records.",
    });
  };

  return (
    <div
      ref={rootRef}
      className={styles.dashboard}
      data-sidebar={sidebarMode}
    >
      <div className={styles.sidebarRegion} inert={!sidebarVisible}>
        <Sidebar
          sections={SIDEBAR.sections}
          support={SIDEBAR.support}
          user={SIDEBAR.user}
          searchRef={sidebarSearchRef}
          expanded={sidebarVisible}
          onToggle={toggleSidebar}
          onNavigate={navigate}
          onProfile={() => setAccountOpen(true)}
        />
      </div>

      <div className={styles.topbarRegion}>
        <Topbar
          expanded={sidebarVisible}
          onToggleSidebar={toggleSidebar}
          breadcrumb={[
            { label: "Overview", href: "/dashboard" },
            { label: "Dashboard" },
          ]}
          onNotifications={() =>
            showDetail({
              title: "Notifications",
              description: "8 new activities today",
              fields:
                "Ticket #2319 SLA updated · PT. Alpha Indonesia registered · Ticket #2322 reassigned.",
            })
          }
          onSettings={() =>
            showDetail({
              title: "Settings",
              description: "Poinqu support workspace",
              fields: `Signed in as ${USER.name} · ${USER.email}`,
            })
          }
        />
      </div>

      <section className={styles.welcomeRegion} data-region>
        <div>
          <h1>
            Hello, {USER.name}{" "}
            <span role="img" aria-label="waving hand">
              👋
            </span>
          </h1>
          <p>Here are the latest insights from your customer interactions.</p>
        </div>
        <div className={styles.welcomeActions}>
          <RangeSelect
            value={range}
            onChange={setRange}
            ariaLabel="dashboard time range"
          />
          <details className={styles.options} ref={optionsRef}>
            <summary aria-label="Dashboard options">
              <Icon name="lucide:ellipsis-vertical" />
            </summary>
            <div className={styles.optionsMenu}>
              <button
                type="button"
                onClick={() => {
                  notice("Dashboard refreshed. Reference sample data is up to date.");
                  if (optionsRef.current) optionsRef.current.open = false;
                }}
              >
                Refresh data
              </button>
              <button
                type="button"
                onClick={() => {
                  if (optionsRef.current) optionsRef.current.open = false;
                  window.print();
                }}
              >
                Print dashboard
              </button>
              <button type="button" onClick={resetRange}>
                Reset range
              </button>
            </div>
          </details>
        </div>
      </section>

      <main className={styles.analyticsRegion}>
        <div className={styles.metricsRegion} data-region>
          {METRICS.map((metric) => (
            <MetricCard key={metric.id} metric={metric} range={range} />
          ))}
        </div>

        <div className={styles.chartRegion} data-region>
          <TicketVolumeChart range={trendRange} onRangeChange={setTrendRange} />
        </div>

        <div className={styles.updatesRegion} data-region>
          <LatestUpdates />
        </div>
      </main>

      <div className={styles.tableRegion} data-region ref={tableRegionRef}>
        <SlaTable onDetail={showDetail} onNotice={notice} />
      </div>

      <button
        type="button"
        className={styles.sidebarBackdrop}
        aria-label="Close navigation"
        onClick={() => setSidebarMode("closed")}
      />

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Dashboard details"
        onClose={() => setDetail(null)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const outside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;
          if (outside) setDetail(null);
        }}
      >
        <button
          type="button"
          className={styles.dialogClose}
          aria-label="Close dialog"
          onClick={() => setDetail(null)}
        >
          <Icon name="lucide:x" />
        </button>
        <h2>{detail?.title}</h2>
        <p>{detail?.description}</p>
        <p>{detail?.fields}</p>
        <small>Interactive prototype · reference sample data</small>
        <footer>
          <Button
            icon="lucide:check"
            label="Done"
            onClick={() => setDetail(null)}
          />
        </footer>
      </dialog>

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        user={USER}
        role="Administrator"
        workspace="Poinqu"
        onSignOut={() => {
          toast({
            title: "Signed out",
            description: "You have been signed out of the demo workspace.",
            tone: "info",
          });
          router.push("/login");
        }}
      />
    </div>
  );
}
