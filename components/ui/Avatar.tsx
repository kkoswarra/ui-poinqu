import Image from "next/image";
import styles from "./Avatar.module.css";

type AvatarProps = {
  name: string;
  initials: string;
  src?: string;
};

export default function Avatar({ name, initials, src }: AvatarProps) {
  return (
    <span className={styles.avatar}>
      <span className={styles.image}>
        <span aria-hidden="true">{initials}</span>
        {src ? (
          <Image src={src} alt="" width={20} height={20} loading="lazy" />
        ) : null}
      </span>
      <span>{name}</span>
    </span>
  );
}
