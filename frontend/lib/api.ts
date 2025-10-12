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

export function listNumbers(): Promise<PhoneNumber[]> {
  return apiFetch<PhoneNumber[]>("/numbers");
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
  return apiFetch("/auth/telnyx-token");
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

export function listCallHistory(): Promise<Call[]> {
  return apiFetch<Call[]>("/calls/history");
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
