import type { Tone } from "@/lib/data";
import Icon from "./Icon";
import styles from "./StatusBadge.module.css";

type StatusBadgeProps = {
  tone: Tone;
  icon: string;
  label: string;
};

export default function StatusBadge({ tone, icon, label }: StatusBadgeProps) {
  return (
    <span className={styles.status} data-tone={tone}>
      <Icon name={icon} />
      <span>{label}</span>
    </span>
  );
}
