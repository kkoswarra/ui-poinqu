"use client";

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./admin-session";
import type {
  AdminAuthResult,
  AdminProfile,
  AdminSummary,
  ApiEnvelope,
  ApiFieldError,
  AppSetting,
  AuditActor,
  AuditLogRow,
  LoginChallenge,
  Pagination,
  RecoveryDecisionResult,
  RecoveryRequestRow,
  RecoveryStatus,
  Role,
  Tokens,
  UserRow,
} from "./admin-types";

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly errors?: ApiFieldError[];

  constructor(
    message: string,
    status = 0,
    code = "UNKNOWN",
    details?: unknown,
    errors?: ApiFieldError[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
  redirectOnAuthFail?: boolean;
};

export const UNAUTHORIZED_EVENT = "poinqu:unauthorized";

function notifyUnauthorized(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

let refreshPromise: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/v1/admin/auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const payload = (await response.json()) as ApiEnvelope<Tokens>;
    if (!payload.success || !payload.data?.access_token) return false;
    saveTokens(payload.data);
    return true;
  } catch {
    return false;
  }
}

export function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function queryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    retry = true,
    redirectOnAuthFail = true,
  } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Periksa koneksi atau alamat API.",
    );
  }

  const text = await response.text();
  let payload: {
    success?: boolean;
    code?: string;
    message?: string;
    data?: T;
    details?: unknown;
    errors?: ApiFieldError[];
  } | null = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (response.status === 401 && auth && retry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retry: false });
    }
    clearSession();
    if (redirectOnAuthFail) notifyUnauthorized();
    throw new ApiError(
      payload?.message ?? "Sesi berakhir. Silakan login kembali.",
      response.status,
      payload?.code ?? "UNAUTHORIZED",
      payload?.details,
      payload?.errors,
    );
  }

  if (!payload || payload.success !== true || payload.data === undefined) {
    throw new ApiError(
      payload?.message ?? `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
      payload?.code ?? "INTERNAL_ERROR",
      payload?.details,
      payload?.errors,
    );
  }

  return payload.data;
}

export async function checkHealth(): Promise<{
  status: string;
  environment: string;
  version: string;
}> {
  const response = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  if (!response.ok) throw new ApiError(`Health check gagal (HTTP ${response.status}).`);
  return (await response.json()) as {
    status: string;
    environment: string;
    version: string;
  };
}

export const adminApi = {
  login(email: string, password: string) {
    return apiRequest<LoginChallenge>("/v1/admin/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
      retry: false,
    });
  },

  changePassword(
    challengeToken: string,
    oldPassword: string,
    newPassword: string,
  ) {
    return apiRequest<{
      next_step: "SETUP_2FA" | "VERIFY_2FA";
      challenge_token: string;
      expires_in: number;
    }>("/v1/admin/auth/password/change", {
      method: "POST",
      body: {
        challenge_token: challengeToken,
        old_password: oldPassword,
        new_password: newPassword,
      },
      auth: false,
      retry: false,
    });
  },

  setupTwoFactor(challengeToken: string) {
    return apiRequest<{
      otpauth_uri: string;
      secret: string;
      expires_in: number;
    }>("/v1/admin/auth/2fa/setup", {
      method: "POST",
      body: { challenge_token: challengeToken },
      auth: false,
      retry: false,
    });
  },

  enableTwoFactor(challengeToken: string, code: string) {
    return apiRequest<AdminAuthResult>("/v1/admin/auth/2fa/enable", {
      method: "POST",
      body: { challenge_token: challengeToken, code },
      auth: false,
      retry: false,
    });
  },

  verifyTwoFactor(challengeToken: string, code: string) {
    return apiRequest<AdminAuthResult>("/v1/admin/auth/2fa/verify", {
      method: "POST",
      body: { challenge_token: challengeToken, code },
      auth: false,
      retry: false,
    });
  },

  me() {
    return apiRequest<AdminProfile>("/v1/admin/me");
  },

  admins(params: { cursor?: string | null; limit?: number } = {}) {
    return apiRequest<{ items: AdminSummary[]; pagination: Pagination }>(
      `/v1/admin/admins${queryString(params)}`,
    );
  },

  createAdmin(body: { email: string; name: string; role_id: string }) {
    return apiRequest<{ admin: AdminSummary; temporary_password: string }>(
      "/v1/admin/admins",
      { method: "POST", body },
    );
  },

  updateAdmin(
    id: string,
    body: { role_id?: string; status?: "ACTIVE" | "DISABLED" },
  ) {
    return apiRequest<AdminSummary>(`/v1/admin/admins/${id}`, {
      method: "PATCH",
      body,
    });
  },

  roles() {
    return apiRequest<{ items: Role[] }>("/v1/admin/roles");
  },

  settings(prefix?: string) {
    return apiRequest<{ items: AppSetting[] }>(
      `/v1/admin/settings${queryString({ prefix })}`,
    );
  },

  updateSetting(
    key: string,
    body: { value: unknown; version: number; reason: string },
  ) {
    return apiRequest<AppSetting>(`/v1/admin/settings/${encodeURIComponent(key)}`, {
      method: "PUT",
      body,
    });
  },

  users(params: {
    q?: string;
    status?: string;
    level?: string;
    cursor?: string | null;
    limit?: number;
  } = {}) {
    return apiRequest<{ items: UserRow[]; pagination: Pagination }>(
      `/v1/admin/users${queryString(params)}`,
    );
  },

  recoveryRequests(params: {
    status?: RecoveryStatus | "";
    cursor?: string | null;
    limit?: number;
  } = {}) {
    return apiRequest<{ items: RecoveryRequestRow[]; pagination: Pagination }>(
      `/v1/admin/recovery-requests${queryString(params)}`,
    );
  },

  decideRecovery(
    id: string,
    body: { decision: "APPROVE" | "REJECT"; reason: string },
  ) {
    return apiRequest<RecoveryDecisionResult>(
      `/v1/admin/recovery-requests/${id}/decision`,
      { method: "POST", body },
    );
  },

  auditLogs(params: {
    actor_type?: AuditActor | "";
    action?: string;
    date_from?: string;
    date_to?: string;
    cursor?: string | null;
    limit?: number;
  } = {}) {
    return apiRequest<{ items: AuditLogRow[]; pagination: Pagination }>(
      `/v1/admin/audit-logs${queryString(params)}`,
    );
  },

  async logout() {
    try {
      await apiRequest<null>("/v1/admin/auth/logout", { method: "POST" });
    } finally {
      clearSession();
    }
  },
};
