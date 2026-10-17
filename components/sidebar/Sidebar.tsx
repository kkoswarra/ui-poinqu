"use client";

import { useMemo, useState, type RefObject } from "react";
import { BRAND, type NavEntry, type NavSection, type User } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import SearchField from "@/components/ui/SearchField";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  sections: NavSection[];
  support?: NavSection;
  user?: User;
  brand?: { name: string; mark: string };
  searchable?: boolean;
  searchRef?: RefObject<HTMLInputElement | null>;
  expanded: boolean;
  initialActive?: string;
  activeLabel?: string;
  onToggle: () => void;
  onNavigate: (label: string) => void;
  onProfile?: () => void;
};

type VisibleSection = {
  caption: string;
  entries: { entry: NavEntry; children: { label: string; icon: string }[] }[];
};

function filterSections(sections: NavSection[], query: string): VisibleSection[] {
  const result: VisibleSection[] = [];

  for (const section of sections) {
    const entries: VisibleSection["entries"] = [];

    for (const entry of section.entries) {
      if (!query) {
        entries.push({
          entry,
          children: entry.kind === "group" ? entry.children : [],
        });
        continue;
      }

      if (entry.kind === "link") {
        if (entry.label.toLowerCase().includes(query)) {
          entries.push({ entry, children: [] });
        }
        continue;
      }

      const groupMatches = entry.label.toLowerCase().includes(query);
      const children = groupMatches
        ? entry.children
        : entry.children.filter((item) => item.label.toLowerCase().includes(query));

      if (groupMatches || children.length) {
        entries.push({ entry, children });
      }
    }

    if (entries.length) result.push({ caption: section.caption, entries });
  }

  return result;
}

export default function Sidebar({
  sections: sectionsData,
  support: supportData,
  user,
  brand = BRAND,
  searchable = true,
  searchRef,
  expanded,
  initialActive = "Overview",
  activeLabel: controlledActive,
  onToggle,
  onNavigate,
  onProfile,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const [internalActive, setInternalActive] = useState(initialActive);
  const activeLabel = controlledActive ?? internalActive;

  const normalizedQuery = searchable ? query.trim().toLowerCase() : "";
  const searching = Boolean(normalizedQuery);
  const sections = useMemo(
    () => filterSections(sectionsData, normalizedQuery),
    [normalizedQuery, sectionsData],
  );
  const support = useMemo(
    () => (supportData ? filterSections([supportData], normalizedQuery)[0] : undefined),
    [normalizedQuery, supportData],
  );

  const select = (label: string) => {
    setInternalActive(label);
    onNavigate(label);
  };

  const renderLink = (
    label: string,
    icon: string,
    { nested = false }: { nested?: boolean } = {},
  ) => (
    <button
      key={label}
      type="button"
      className={nested ? styles.subButton : styles.navButton}
      title={label}
      aria-current={activeLabel === label ? "page" : undefined}
      onClick={() => select(label)}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </button>
  );

  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          {brand.mark}
        </span>
        <strong>{brand.name}</strong>
        <button
          type="button"
          aria-label="Collapse sidebar"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <Icon name="lucide:panel-left" />
        </button>
      </div>

      {searchable ? (
        <div className={styles.searchWrap}>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search anything"
            ariaLabel="Search anything"
            inputRef={searchRef}
          />
          <kbd>⌘ K</kbd>
        </div>
      ) : null}

      <nav className={styles.nav} aria-label="Sections">
        {sections.map((section) => (
          <div key={section.caption}>
            <p className={styles.caption}>{section.caption}</p>
            {section.entries.map(({ entry, children }) => {
              if (entry.kind === "link") return renderLink(entry.label, entry.icon);

              return (
                <details
                  key={`${entry.label}-${searching}`}
                  className={styles.group}
                  open={searching || Boolean(entry.defaultOpen)}
                >
                  <summary className={styles.summary}>
                    <Icon name={entry.icon} />
                    <span>{entry.label}</span>
                    <Icon name="lucide:chevron-down" className={styles.chevron} />
                  </summary>
                  <div className={styles.sub}>
                    {children.map((item) => renderLink(item.label, item.icon, { nested: true }))}
                  </div>
                </details>
              );
            })}
          </div>
        ))}

        {support ? (
          <div className={styles.support}>
            <p className={styles.caption}>{support.caption}</p>
            {support.entries.map(({ entry }) =>
              entry.kind === "link" ? renderLink(entry.label, entry.icon) : null,
            )}
          </div>
        ) : null}
      </nav>

      {user && onProfile ? (
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.profile}
            aria-haspopup="dialog"
            onClick={onProfile}
          >
            <span className={styles.avatar}>{user.initials}</span>
            <span>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </span>
            <Icon name="lucide:chevrons-up-down" />
          </button>
        </div>
      ) : null}
    </aside>
  );
}
