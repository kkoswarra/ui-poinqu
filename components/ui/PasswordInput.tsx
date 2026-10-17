"use client";

import { useState } from "react";
import Icon from "./Icon";
import Input, { type InputProps } from "./Input";
import styles from "./PasswordInput.module.css";

type PasswordInputProps = Omit<InputProps, "type" | "endAdornment">;

export default function PasswordInput({
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      disabled={disabled}
      endAdornment={
        <button
          type="button"
          className={styles.toggle}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((previous) => !previous)}
        >
          <Icon name={visible ? "lucide:eye-off" : "lucide:eye"} />
        </button>
      }
    />
  );
}
