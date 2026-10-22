"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import styles from "./Combobox.module.css";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  group?: string;
  disabled?: boolean;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value?: string | string[] | null;
  onValueChange?: (value: string | string[] | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  multiple?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  className?: string;
};

type OptionGroup = {
  key: string;
  label?: string;
  options: { option: ComboboxOption; index: number }[];
};

type PopoverPosition = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

function computePopoverPosition(rect: DOMRect): PopoverPosition {
  const gap = 6;
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - rect.bottom - gap - 8;
  const spaceAbove = rect.top - gap - 8;
  const openAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
  const available = Math.max(120, openAbove ? spaceAbove : spaceBelow);
  const left = Math.max(
    8,
    Math.min(rect.left, window.innerWidth - rect.width - 8),
  );

  return {
    left,
    width: rect.width,
    top: openAbove ? undefined : rect.bottom + gap,
    bottom: openAbove ? viewportHeight - rect.top + gap : undefined,
    maxHeight: Math.min(280, available),
  };
}

export default function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyMessage = "No options found.",
  multiple = false,
  clearable = false,
  disabled = false,
  invalid = false,
  required = false,
  id,
  name,
  ariaLabel = "Combobox",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suppressOpen = useRef(false);
  const listId = useId();

  const selectedValues = useMemo(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    if (typeof value === "string") return [value];
    return [];
  }, [multiple, value]);

  const selectedOption = options.find(
    (option) => option.value === selectedValues[0],
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;

    return options.filter((option) =>
      `${option.label} ${option.description ?? ""} ${option.group ?? ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [options, query]);

  const groups = useMemo<OptionGroup[]>(() => {
    const result: OptionGroup[] = [];

    filteredOptions.forEach((option, index) => {
      const key = option.group ?? "";
      const last = result[result.length - 1];

      if (last && last.label === option.group) {
        last.options.push({ option, index });
      } else {
        result.push({
          key: `${key}-${result.length}`,
          label: option.group,
          options: [{ option, index }],
        });
      }
    });

    return result;
  }, [filteredOptions]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const update = () => {
      const rect = controlRef.current?.getBoundingClientRect();
      if (rect) setPosition(computePopoverPosition(rect));
    };

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const active = document.getElementById(`${listId}-option-${activeIndex}`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId, open]);

  const updatePosition = () => {
    const rect = controlRef.current?.getBoundingClientRect();
    if (rect) setPosition(computePopoverPosition(rect));
  };

  const closeList = () => {
    setOpen(false);
    setQuery("");
  };

  const openList = () => {
    if (disabled) return;
    setActiveIndex(0);
    updatePosition();
    setOpen(true);
  };

  const handleFocus = () => {
    if (suppressOpen.current || disabled) return;
    setActiveIndex(0);
    updatePosition();
    setOpen(true);
    if (!multiple) setQuery("");
  };

  const selectOption = (option: ComboboxOption) => {
    if (option.disabled) return;

    if (multiple) {
      const next = selectedValues.includes(option.value)
        ? selectedValues.filter((item) => item !== option.value)
        : [...selectedValues, option.value];
      onValueChange?.(next);
      setQuery("");
      return;
    }

    onValueChange?.(option.value);
    closeList();
  };

  const removeValue = (optionValue: string) => {
    onValueChange?.(selectedValues.filter((item) => item !== optionValue));
  };

  const clearSelection = () => {
    onValueChange?.(multiple ? [] : null);
    setQuery("");
  };

  const moveActive = (direction: 1 | -1) => {
    if (!filteredOptions.length) return;

    let next = activeIndex;
    for (let step = 0; step < filteredOptions.length; step += 1) {
      next =
        (next + direction + filteredOptions.length) % filteredOptions.length;
      if (!filteredOptions[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        closeList();
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter") {
      if (!open) return;
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) selectOption(option);
      else if (!multiple) closeList();
      return;
    }

    if (
      event.key === "Backspace" &&
      multiple &&
      !query &&
      selectedValues.length
    ) {
      event.preventDefault();
      removeValue(selectedValues[selectedValues.length - 1]);
      return;
    }

    if (event.key === "Tab") {
      closeList();
    }
  };

  const inputPlaceholder = multiple
    ? selectedValues.length
      ? searchPlaceholder
      : placeholder
    : open
      ? searchPlaceholder
      : placeholder;

  const inputValue = multiple
    ? query
    : open
      ? query
      : selectedOption?.label ?? "";

  const activeOption = open ? filteredOptions[activeIndex] : undefined;

  return (
    <div
      ref={rootRef}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
    >
      <div
        ref={controlRef}
        className={styles.control}
        data-open={open ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid || ariaInvalid ? "" : undefined}
        data-multiple={multiple ? "" : undefined}
        onClick={() => {
          if (disabled) return;
          openList();
          inputRef.current?.focus();
        }}
      >
        <Icon name="lucide:search" className={styles.leadingIcon} />

        {multiple ? (
          <span className={styles.chips}>
            {selectedValues.map((optionValue) => {
              const option = options.find((item) => item.value === optionValue);
              const label = option?.label ?? optionValue;

              return (
                <span key={optionValue} className={styles.chip}>
                  <span className={styles.chipLabel}>{label}</span>
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Remove ${label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeValue(optionValue);
                    }}
                  >
                    <Icon name="lucide:x" />
                  </button>
                </span>
              );
            })}
            <input
              ref={inputRef}
              id={id}
              name={name}
              className={styles.input}
              type="text"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              value={inputValue}
              placeholder={inputPlaceholder}
              disabled={disabled}
              required={required}
              aria-label={ariaLabel}
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={
                activeOption
                  ? `${listId}-option-${activeIndex}`
                  : undefined
              }
              aria-describedby={ariaDescribedBy}
              aria-invalid={invalid || ariaInvalid || undefined}
              onFocus={handleFocus}
              onChange={(event) => {
                setActiveIndex(0);
                setQuery(event.target.value);
                setOpen(true);
              }}
              onKeyDown={handleKeyDown}
            />
          </span>
        ) : (
          <input
            ref={inputRef}
            id={id}
            name={name}
            className={styles.input}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            value={inputValue}
            placeholder={inputPlaceholder}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              activeOption ? `${listId}-option-${activeIndex}` : undefined
            }
            aria-describedby={ariaDescribedBy}
            aria-invalid={invalid || ariaInvalid || undefined}
            onFocus={handleFocus}
            onChange={(event) => {
              setActiveIndex(0);
              setQuery(event.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />
        )}

        {clearable && selectedValues.length ? (
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear selection"
            onClick={(event) => {
              event.stopPropagation();
              clearSelection();
            }}
          >
            <Icon name="lucide:x" />
          </button>
        ) : null}

        <Icon name="lucide:chevrons-up-down" className={styles.chevron} />
      </div>

      {open && position
        ? createPortal(
            <div
              ref={popoverRef}
              className={styles.popover}
              style={
                {
                  left: position.left,
                  width: position.width,
                  top: position.top,
                  bottom: position.bottom,
                  maxHeight: position.maxHeight,
                } as CSSProperties
              }
            >
              <div
                className={styles.list}
                role="listbox"
                id={listId}
                aria-label={ariaLabel}
              >
                {filteredOptions.length ? (
                  groups.map((group) => (
                    <div
                      key={group.key}
                      className={styles.group}
                      role="group"
                      aria-label={group.label}
                    >
                      {group.label ? (
                        <span className={styles.groupLabel}>{group.label}</span>
                      ) : null}
                      {group.options.map(({ option, index }) => {
                        const selected = selectedValues.includes(option.value);

                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="option"
                            id={`${listId}-option-${index}`}
                            tabIndex={-1}
                            className={styles.option}
                            data-active={index === activeIndex ? "" : undefined}
                            data-selected={selected ? "" : undefined}
                            aria-selected={selected}
                            disabled={option.disabled}
                            onMouseEnter={() => {
                              if (!option.disabled) setActiveIndex(index);
                            }}
                            onClick={() => {
                              selectOption(option);
                              suppressOpen.current = true;
                              inputRef.current?.focus();
                              window.setTimeout(() => {
                                suppressOpen.current = false;
                              }, 0);
                            }}
                          >
                            {option.icon ? (
                              <Icon
                                name={option.icon}
                                className={styles.optionIcon}
                              />
                            ) : null}
                            <span className={styles.optionText}>
                              <span className={styles.optionLabel}>
                                {option.label}
                              </span>
                              {option.description ? (
                                <span className={styles.optionDescription}>
                                  {option.description}
                                </span>
                              ) : null}
                            </span>
                            {selected ? (
                              <Icon
                                name="lucide:check"
                                className={styles.check}
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className={styles.empty}>{emptyMessage}</div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
