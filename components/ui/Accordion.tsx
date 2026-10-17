"use client";

import { useState, type ReactNode } from "react";
import Collapse, { type CollapseTone } from "./Collapse";
import styles from "./Accordion.module.css";

export type AccordionItem = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  badge?: ReactNode;
  tone?: CollapseTone;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  type?: "single" | "multiple";
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
};

export default function Accordion({
  items,
  type = "single",
  defaultValue = [],
  value,
  onValueChange,
  className,
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const toggle = (id: string, open: boolean) => {
    let next: string[];

    if (open) {
      next =
        type === "single"
          ? [id]
          : Array.from(new Set([...currentValue, id]));
    } else {
      next = currentValue.filter((item) => item !== id);
    }

    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <div className={[styles.accordion, className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <Collapse
          key={item.id}
          title={item.title}
          description={item.description}
          icon={item.icon}
          badge={item.badge}
          tone={item.tone}
          open={currentValue.includes(item.id)}
          onOpenChange={(open) => toggle(item.id, open)}
        >
          {item.content}
        </Collapse>
      ))}
    </div>
  );
}
