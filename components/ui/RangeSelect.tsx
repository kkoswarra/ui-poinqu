import Icon from "./Icon";
import type { RangeValue } from "@/lib/data";
import { RANGE_OPTIONS } from "@/lib/data";
import styles from "./RangeSelect.module.css";

type RangeSelectProps = {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  ariaLabel: string;
};

export default function RangeSelect({ value, onChange, ariaLabel }: RangeSelectProps) {
  return (
    <label className={styles.range}>
      <Icon name="lucide:calendar-days" />
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value as RangeValue)}
      >
        {RANGE_OPTIONS.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <Icon name="lucide:chevron-down" />
    </label>
  );
}
