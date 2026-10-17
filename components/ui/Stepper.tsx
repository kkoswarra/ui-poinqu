import Icon from "./Icon";
import styles from "./Stepper.module.css";

export type StepItem = {
  label: string;
  description?: string;
};

type StepperProps = {
  steps: StepItem[];
  current: number;
  orientation?: "horizontal" | "vertical";
  onStepChange?: (index: number) => void;
  className?: string;
};

export default function Stepper({
  steps,
  current,
  orientation = "horizontal",
  onStepChange,
  className,
}: StepperProps) {
  return (
    <ol
      className={[styles.stepper, className].filter(Boolean).join(" ")}
      data-orientation={orientation}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const state =
          index < current ? "complete" : index === current ? "current" : "upcoming";

        const content = (
          <>
            <span className={styles.indicator} data-state={state} aria-hidden="true">
              {state === "complete" ? (
                <Icon name="lucide:check" />
              ) : (
                <span>{index + 1}</span>
              )}
            </span>
            <span className={styles.texts}>
              <span className={styles.label}>{step.label}</span>
              {step.description ? (
                <span className={styles.description}>{step.description}</span>
              ) : null}
            </span>
          </>
        );

        return (
          <li
            key={`${step.label}-${index}`}
            className={styles.step}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            {onStepChange ? (
              <button
                type="button"
                className={styles.stepAction}
                onClick={() => onStepChange(index)}
              >
                {content}
              </button>
            ) : (
              <div className={styles.stepAction}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
