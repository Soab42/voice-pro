// Simple API wrapper for the call center backend
export const backendUrl =
  import.meta.env.VITE_BACKEND_URL + "/api" || "http://localhost:4000/api";

export function getAuthToken(): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      const fromStorage =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      if (fromStorage) return fromStorage;
    }
  } catch {}
  // Fallback to env token if provided
  // @ts-ignore
  return import.meta.env.VITE_AUTH_TOKEN || null;
}

// Generic helper for fetch requests
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
}

// Types and helpers for Numbers API
export interface PhoneNumber {
  id: string;
  phone: string;
  label: string | null;
  name: string | null;
  email: string | null;
  address: string | null;
  designation: string | null;
  provider: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Call {
  id: string;
  agentId: string | null;
  customerNumber: string;
  direction: string;
  status:
    | "INITIATED"
    | "RINGING"
    | "ACTIVE"
    | "COMPLETED"
    | "NO_ANSWER"
    | "FAILED";
  telnyxLegA: string | null;
  telnyxLegB: string | null;
  telnyxConferenceId: string | null;
  recordingUrl: string | null;
  aiSessionId: string | null;
  cost: number | null;
  startedAt: string;
  answeredAt: string | null;
  endedAt: string | null;
}

export interface PaginatedNumbers {
  numbers: PhoneNumber[];
  pagination: PaginationInfo;
}

export function listNumbers(page = 1, limit = 20): Promise<PaginatedNumbers> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiFetch<PaginatedNumbers>(`/numbers?${params}`);
}

export const createNumber = async (
  data: Pick<
    PhoneNumber,
    | "phone"
    | "label"
    | "name"
    | "email"
    | "address"
    | "designation"
    | "provider"
    | "active"
  >
): Promise<PhoneNumber> => {
  return apiFetch("/numbers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const login = async (email, password) => {
  const response = await fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return response.json();
};

export const register = async (name, email, password) => {
  const response = await fetch(`${backendUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return response.json();
};

export const getCall = async (callId: string): Promise<Call> => {
  return apiFetch(`/calls/${callId}`);
};

export const hangupCall = async (callId: string): Promise<void> => {
  return apiFetch(`/calls/${callId}/hangup`, {
    method: "POST",
  });
};

export const getCalls = async (): Promise<Call[]> => {
  return apiFetch("/calls/active");
};

export const getTelnyxToken = async (): Promise<{ token: string }> => {
  return apiFetch("/auth/telnyx-token", {
    method: "POST",
  });
};

// Auth helpers
export interface LoginResponseUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: LoginResponseUser;
}

// Pagination types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedCallHistory {
  calls: Call[];
  pagination: PaginationInfo;
}

export function listCallHistory(
  page = 1,
  limit = 20
): Promise<PaginatedCallHistory> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiFetch<PaginatedCallHistory>(`/calls/history?${params}`);
}

// Start an outbound call
export interface CreateCallResponse {
  id: string;
  telnyxLegId?: string;
}

export function createOutboundCall(
  to: string,
  options?: { record?: boolean; useAI?: boolean; aiProvider?: string }
): Promise<CreateCallResponse> {
  return apiFetch<CreateCallResponse>("/calls", {
    method: "POST",
    body: JSON.stringify({ to, ...(options || {}) }),
  });
}

// List active calls
export function listActiveCalls(): Promise<Call[]> {
  return apiFetch<Call[]>("/calls/active");
}

// Get call history for a specific customer number
export function getCallHistoryByNumber(
  customerNumber: string
): Promise<Call[]> {
  const encodedNumber = encodeURIComponent(customerNumber);
  return apiFetch<Call[]>(`/calls/history/${encodedNumber}`);
}

export interface WebhookRequest {
  id: string;
  method: string;
  url: string;
  headers: string;
  body: string;
  sourceIp?: string;
  userAgent?: string;
  timestamp: string;
  processed: boolean;
  error?: string;
}

export interface PaginatedWebhookRequests {
  webhookRequests: WebhookRequest[];
  pagination: PaginationInfo;
}

export function listWebhookRequests(
  page = 1,
  limit = 20
): Promise<PaginatedWebhookRequests> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiFetch<PaginatedWebhookRequests>(`/webhook-inspection?${params}`);
}

export function getWebhookRequest(id: string): Promise<WebhookRequest> {
  return apiFetch<WebhookRequest>(`/webhook-inspection/${id}`);
}

export function deleteWebhookRequest(id: string): Promise<void> {
  return apiFetch(`/webhook-inspection/${id}`, {
    method: "DELETE",
  });
}

export function clearAllWebhookRequests(): Promise<void> {
  return apiFetch("/webhook-inspection", {
    method: "DELETE",
  });
}
