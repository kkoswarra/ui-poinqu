import type { CSSProperties } from "react";

type IconProps = {
  name: string;
  className?: string;
  style?: CSSProperties;
};

export default function Icon({ name, className, style }: IconProps) {
  return (
    <iconify-icon
      icon={name}
      className={className}
      style={style}
      aria-hidden="true"
      noobserver
    />
  );
}
