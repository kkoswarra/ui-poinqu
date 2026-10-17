import { SPARK_POINTS, type Metric, type RangeValue } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import styles from "./MetricCard.module.css";

type MetricCardProps = {
  metric: Metric;
  range: RangeValue;
};

export default function MetricCard({ metric, range }: MetricCardProps) {
  return (
    <section
      className={styles.metric}
      data-tone={metric.tone}
      aria-label={metric.title}
    >
      <div className={styles.heading}>
        <h2>{metric.title}</h2>
        <Icon name={metric.icon} />
      </div>
      <div className={styles.body}>
        <div>
          <p key={range} className={styles.value}>
            {metric.values[range]}
          </p>
          <div className={styles.comparison}>
            <span className={styles.delta}>{metric.delta}</span>
            <span>vs last week</span>
          </div>
        </div>
        <svg className={styles.spark} viewBox="0 0 90 40" aria-hidden="true">
          <polygon points={`${SPARK_POINTS} 90,40 0,40`} />
          <polyline points={SPARK_POINTS} />
        </svg>
      </div>
    </section>
  );
}
