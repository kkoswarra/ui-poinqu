import type { RefObject } from "react";
import Icon from "./Icon";
import styles from "./SearchField.module.css";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export default function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
  inputRef,
}: SearchFieldProps) {
  return (
    <label className={[styles.search, className].filter(Boolean).join(" ")}>
      <Icon name="lucide:search" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
