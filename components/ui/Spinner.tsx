import styles from "./Spinner.module.css";

export type SpinnerTone = "default" | "primary" | "success" | "danger" | "muted";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  tone?: SpinnerTone;
  label?: string;
  className?: string;
};

export default function Spinner({
  size = "md",
  tone = "default",
  label = "Loading",
  className,
}: SpinnerProps) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      data-size={size}
      data-tone={tone}
      role="status"
      aria-label={label}
    />
  );
}
