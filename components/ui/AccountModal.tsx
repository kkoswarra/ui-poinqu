"use client";

import type { User } from "@/lib/data";
import Badge from "./Badge";
import Button from "./Button";
import Modal from "./Modal";
import styles from "./AccountModal.module.css";

type AccountModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
  role?: string;
  workspace?: string;
  onSignOut?: () => void;
};

export default function AccountModal({
  open,
  onClose,
  user,
  role = "Administrator",
  workspace = "Poinqu",
  onSignOut,
}: AccountModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Account"
      description="Informasi akun yang sedang login."
      icon="lucide:user-round"
      tone="info"
      size="sm"
      footer={
        <>
          {onSignOut ? (
            <Button
              label="Sign out"
              variant="ghost"
              tone="danger"
              icon="lucide:log-out"
              onClick={() => {
                onSignOut();
                onClose();
              }}
            />
          ) : null}
          <Button
            label="Close"
            variant="solid"
            tone="primary"
            onClick={onClose}
          />
        </>
      }
    >
      <div className={styles.account}>
        <span className={styles.avatar}>{user.initials}</span>
        <span className={styles.text}>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </span>
        <Badge tone="success" dot size="sm">
          Online
        </Badge>
      </div>

      <div className={styles.details}>
        <div>
          <span>Role</span>
          <strong>{role}</strong>
        </div>
        <div>
          <span>Workspace</span>
          <strong>{workspace}</strong>
        </div>
        <div>
          <span>Status</span>
          <Badge tone="success" dot size="sm">
            Online
          </Badge>
        </div>
      </div>
    </Modal>
  );
}
