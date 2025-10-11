// Simple API wrapper for the call center backend
export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export function getAuthToken(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const fromStorage = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (fromStorage) return fromStorage;
    }
  } catch {}
  // Fallback to env token if provided
  // @ts-ignore
  return import.meta.env.VITE_AUTH_TOKEN || null;
}

// Generic helper for fetch requests
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  return res.json();
}

// Types and helpers for Numbers API
export interface PhoneNumber {
  id: string;
  phone: string;
  label?: string | null;
  provider?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function listNumbers(): Promise<PhoneNumber[]> {
  return apiFetch<PhoneNumber[]>('/api/numbers');
}

export function createNumber(payload: {
  phone: string;
  label?: string | null;
  provider?: string | null;
  active?: boolean;
}): Promise<PhoneNumber> {
  return apiFetch<PhoneNumber>('/api/numbers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

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
export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Calls helpers
export interface Call {
  id: string;
  customerNumber: string;
  direction: string; // 'inbound' | 'outbound'
  status: 'INITIATED' | 'RINGING' | 'ACTIVE' | 'COMPLETED' | 'NO_ANSWER' | 'FAILED';
  startedAt: string;
  answeredAt?: string | null;
  endedAt?: string | null;
  agent?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function listCallHistory(): Promise<Call[]> {
  return apiFetch<Call[]>('/api/calls/history');
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
  return apiFetch<CreateCallResponse>('/api/calls', {
    method: 'POST',
    body: JSON.stringify({ to, ...(options || {}) }),
  });
}

// Hang up a call by ID
export function hangupCall(callId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/calls/${callId}/hangup`, {
    method: 'POST',
  });
}

// List active calls
export function listActiveCalls(): Promise<Call[]> {
  return apiFetch<Call[]>('/api/calls/active');
}

// Get a single call by ID
export function getCall(callId: string): Promise<Call> {
  return apiFetch<Call>(`/api/calls/${callId}`);
}

// Get call history for a specific customer number
export function getCallHistoryByNumber(customerNumber: string): Promise<Call[]> {
  const encodedNumber = encodeURIComponent(customerNumber);
  return apiFetch<Call[]>(`/api/calls/history/${encodedNumber}`);
}