import type { Entry, EntryInput, Page, PageDetail, PageInput } from "./types";

const TOKEN_KEY = "pinbook-token";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    window.dispatchEvent(new Event("auth-unauthorized"));
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type Direction = "up" | "down";

export const api = {
  login: (pin: string) =>
    request<{ token: string }>("/api/auth", { method: "POST", body: JSON.stringify({ pin }) }),

  listPages: () => request<Page[]>("/api/pages"),

  createPage: (data: PageInput) =>
    request<Page>("/api/pages", { method: "POST", body: JSON.stringify(data) }),

  updatePage: (id: string, data: PageInput) =>
    request<Page>(`/api/pages/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deletePage: (id: string) =>
    request<{ ok: boolean }>(`/api/pages/${id}`, { method: "DELETE" }),

  movePage: (id: string, direction: Direction) =>
    request<{ ok: boolean }>(`/api/pages/${id}/reorder`, {
      method: "PUT",
      body: JSON.stringify({ direction }),
    }),

  getPage: (id: string) => request<PageDetail>(`/api/pages/${id}`),

  createEntry: (data: EntryInput) =>
    request<Entry>("/api/entries", { method: "POST", body: JSON.stringify(data) }),

  updateEntry: (id: string, data: Omit<EntryInput, "pageId">) =>
    request<Entry>(`/api/entries/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteEntry: (id: string) =>
    request<{ ok: boolean }>(`/api/entries/${id}`, { method: "DELETE" }),

  moveEntry: (id: string, direction: Direction) =>
    request<{ ok: boolean }>(`/api/entries/${id}/reorder`, {
      method: "PUT",
      body: JSON.stringify({ direction }),
    }),
};
