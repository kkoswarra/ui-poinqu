"use client";

import { useMemo, useState } from "react";
import {
  ACTIVITIES,
  ACTIVITY_PERIODS,
  type Activity,
  type ActivityPeriod,
} from "@/lib/data";
import Icon from "@/components/ui/Icon";
import SearchField from "@/components/ui/SearchField";
import styles from "./LatestUpdates.module.css";

type PeriodFilter = ActivityPeriod | "week";

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <article className={styles.activity} data-tone={activity.tone}>
      <span className={styles.activityIcon}>
        <Icon name={activity.icon} />
      </span>
      <div className={styles.text}>
        <div className={styles.activityHeading}>
          <h3>{activity.title}</h3>
          <time>{activity.time}</time>
        </div>
        <p>{activity.description}</p>
      </div>
    </article>
  );
}

export default function LatestUpdates() {
  const [period, setPeriod] = useState<PeriodFilter>("today");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const activities = useMemo(
    () =>
      ACTIVITIES.filter((activity) => {
        const inPeriod = period === "week" || activity.period === period;
        const matches =
          !normalizedQuery ||
          `${activity.title} ${activity.time} ${activity.description}`
            .toLowerCase()
            .includes(normalizedQuery);
        return inPeriod && matches;
      }),
    [normalizedQuery, period],
  );

  const periodMeta = ACTIVITY_PERIODS.find((item) => item.value === period);
  const countLabel =
    activities.length === 1
      ? periodMeta?.singularCountLabel
      : periodMeta?.countLabel;

  return (
    <section className={styles.updates} aria-label="Latest Updates">
      <div className={styles.heading}>
        <h2>Latest Updates</h2>
        <Icon name="lucide:newspaper" />
      </div>
      <div className={styles.body}>
        <div className={styles.tabs} role="group" aria-label="Activity range">
          {ACTIVITY_PERIODS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={period === item.value}
              onClick={() => setPeriod(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search activities"
          ariaLabel="Search activities"
        />

        <p className={styles.count} aria-live="polite">
          <strong>{activities.length}</strong> {countLabel}
        </p>

        <div className={styles.list}>
          {activities.map((activity) => (
            <div
              key={`${period}-${normalizedQuery}-${activity.id}`}
              className={styles.item}
            >
              <ActivityRow activity={activity} />
            </div>
          ))}
          {activities.length === 0 ? (
            <p className={styles.empty}>No matching activities.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
