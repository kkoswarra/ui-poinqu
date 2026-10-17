"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CHART, type RangeValue } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import RangeSelect from "@/components/ui/RangeSelect";
import styles from "./TicketVolumeChart.module.css";

type TicketVolumeChartProps = {
  range: RangeValue;
  onRangeChange: (value: RangeValue) => void;
};

export default function TicketVolumeChart({
  range,
  onRangeChange,
}: TicketVolumeChartProps) {
  const [selected, setSelected] = useState(CHART.initialIndex);
  const [marker, setMarker] = useState({ top: 35, left: 35 });
  const plotRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const bars = useMemo(
    () =>
      CHART.bars.map((bar) => ({
        ...bar,
        value: Math.round(bar.value * CHART.factors[range]),
      })),
    [range],
  );

  const updateMarker = useCallback(() => {
    const bar = barRefs.current[selected];
    const plot = plotRef.current;
    if (!bar || !plot) return;

    const value = Math.round(CHART.bars[selected].value * CHART.factors[range]);
    setMarker({
      top: 100 - (value / CHART.max) * 100,
      left: Math.min(
        85,
        Math.max(25, ((bar.offsetLeft + bar.offsetWidth / 2) / plot.clientWidth) * 100),
      ),
    });
  }, [range, selected]);

  useEffect(() => {
    updateMarker();
    window.addEventListener("resize", updateMarker);
    return () => window.removeEventListener("resize", updateMarker);
  }, [updateMarker]);

  const current = bars[selected];

  return (
    <section className={styles.chart} aria-label="Ticket Volume Trend">
      <div className={styles.heading}>
        <Icon name="lucide:ticket" />
        <h2>Ticket Volume Trend</h2>
        <RangeSelect
          value={range}
          onChange={onRangeChange}
          ariaLabel="trend time range"
        />
      </div>
      <div className={styles.body}>
        <div className={styles.summary}>
          <strong key={range} className={styles.total}>
            {CHART.totals[range]}
          </strong>
          <span className={styles.comparison}>
            <strong>+8%</strong>vs last week
          </span>
        </div>
        <div className={styles.plot} ref={plotRef}>
          <div
            className={styles.bars}
            role="group"
            aria-label="Ticket volume by half-day. Use arrow keys to inspect bars."
          >
            {bars.map((bar, index) => (
              <button
                key={`${bar.day}-${index}`}
                ref={(element) => {
                  barRefs.current[index] = element;
                }}
                type="button"
                className={styles.bar}
                style={
                  {
                    "--bar-height": `${(bar.value / CHART.max) * 100}%`,
                    "--index": index,
                  } as CSSProperties
                }
                data-value={bar.value}
                aria-label={`${bar.day}: ${bar.value} tickets`}
                aria-pressed={selected === index}
                onPointerEnter={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  const next =
                    event.key === "ArrowRight" ? index + 1 : index - 1;
                  barRefs.current[next]?.focus();
                }}
              />
            ))}
          </div>
          <div
            className={styles.marker}
            style={{ top: `${marker.top}%`, left: `${marker.left}%` }}
          >
            <span className={styles.tooltip}>
              {current.day}: {current.value}
            </span>
          </div>
          <div className={styles.axis} aria-hidden="true">
            {CHART.axis.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
        <div className={styles.days} aria-hidden="true">
          {CHART.days.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
