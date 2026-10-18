export type Pagination = {
  next_cursor: string | null;
  has_more: boolean;
  limit: number;
};

export type ApiMeta = {
  request_id: string;
  timestamp: string;
};

export type ApiEnvelope<T> = {
  success: true;
  code: string;
  message: string;
  data: T;
  meta: ApiMeta;
};

export type ApiFieldError = {
  field: string;
  code: string;
  message: string;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
};

export type AdminProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

export type AdminSummary = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "ACTIVE" | "DISABLED";
  totp_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type LoginStep = "CHANGE_PASSWORD" | "SETUP_2FA" | "VERIFY_2FA";

export type LoginChallenge = {
  challenge_token: string;
  expires_in: number;
  twofa_required: boolean;
  next_step: LoginStep;
};

export type AdminAuthResult = {
  admin: AdminProfile;
  tokens: Tokens;
};

export type Role = {
  id: string;
  name: string;
  permissions: string[];
};

export type UserRow = {
  id: string;
  name: string;
  phone_masked: string;
  level: "BASIC" | "PREMIUM";
  kyc_status: "NONE" | "DRAFT" | "PENDING" | "VERIFIED" | "REJECTED";
  status: "ACTIVE" | "LOCKED" | "SUSPENDED";
  recovery_hold: boolean;
  created_at: string;
  last_active_at: string | null;
};

export type RecoveryStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type RecoveryRequestRow = {
  id: string;
  status: RecoveryStatus;
  name: string;
  old_phone: string;
  new_phone: string;
  account_found: boolean;
  last_transaction_hint: string | null;
  balance_hint: number | null;
  note: string | null;
  created_at: string;
  decided_at: string | null;
};

export type RecoveryDecisionResult = {
  id: string;
  status: RecoveryStatus;
  decided_at: string;
  transfer_blocked_until: string | null;
};

export type AuditActor = "USER" | "ADMIN" | "SYSTEM";

export type AuditLogRow = {
  id: number;
  actor_type: AuditActor;
  actor_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  request_id: string | null;
  created_at: string;
};

export type AppSetting = {
  key: string;
  value: unknown;
  version: number;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
};
