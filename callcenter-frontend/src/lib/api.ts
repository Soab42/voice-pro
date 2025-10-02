// Simple API wrapper for the call center backend
export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Generic helper for fetch requests
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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