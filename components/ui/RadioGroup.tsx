import styles from "./Form.module.css";

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type RadioGroupProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  orientation?: "vertical" | "horizontal";
  className?: string;
};

export default function RadioGroup({
  name,
  label,
  value,
  onChange,
  options,
  orientation = "vertical",
  className,
}: RadioGroupProps) {
  return (
    <fieldset
      className={[styles.radioGroup, className].filter(Boolean).join(" ")}
    >
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.radioList} data-orientation={orientation}>
        {options.map((option) => (
          <label
            key={option.value}
            className={styles.choice}
            data-disabled={option.disabled ? "" : undefined}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className={styles.choiceInput}
            />
            <span className={styles.radioCircle} aria-hidden="true">
              <span className={styles.radioDot} />
            </span>
            <span className={styles.choiceTexts}>
              <span className={styles.choiceLabel}>{option.label}</span>
              {option.description ? (
                <span className={styles.choiceDescription}>
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
