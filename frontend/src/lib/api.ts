import axios, { AxiosError } from "axios";
import type {
  AuthResponse,
  DashboardStats,
  Project,
  Task,
  TaskActivity,
  TaskComment,
  UserSummary,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export const api = axios.create({ baseURL: BASE_URL });

const TOKEN_KEY = "tf_token";

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function saveToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string, role?: string) =>
    api.post<AuthResponse>("/auth/register", { name, email, password, role }).then((r) => r.data),
  me: () => api.get<{ user: AuthResponse["user"] }>("/auth/me").then((r) => r.data.user),
};

export const projectApi = {
  list: () => api.get<Project[]>("/projects").then((r) => r.data),
  getById: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (payload: { name: string; description?: string; startDate?: string; endDate?: string }) =>
    api.post<Project>("/projects", payload).then((r) => r.data),
  update: (id: string, payload: Partial<{ name: string; description: string; status: string }>) =>
    api.patch<Project>(`/projects/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, userId: string) =>
    api.post<Project>(`/projects/${id}/members`, { userId }).then((r) => r.data),
  removeMember: (id: string, userId: string) =>
    api.delete<Project>(`/projects/${id}/members/${userId}`).then((r) => r.data),
};

export const taskApi = {
  list: (params?: { projectId?: string; status?: string; assigneeId?: string }) =>
    api.get<Task[]>("/tasks", { params }).then((r) => r.data),
  getById: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (payload: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    priority?: string;
    dueDate?: string;
  }) => api.post<Task>("/tasks", payload).then((r) => r.data),
  update: (id: string, payload: Partial<{ title: string; description: string; assigneeId: string | null; priority: string }>) =>
    api.patch<Task>(`/tasks/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/tasks/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch<Task>(`/tasks/${id}/status`, { status }).then((r) => r.data),
  updateProgress: (id: string, progress: number) =>
    api.patch<Task>(`/tasks/${id}/progress`, { progress }).then((r) => r.data),
  listComments: (id: string) => api.get<TaskComment[]>(`/tasks/${id}/comments`).then((r) => r.data),
  addComment: (id: string, content: string) =>
    api.post<TaskComment>(`/tasks/${id}/comments`, { content }).then((r) => r.data),
  listActivity: (id: string) => api.get<TaskActivity[]>(`/tasks/${id}/activity`).then((r) => r.data),
};

export const userApi = {
  list: () => api.get<UserSummary[]>("/users").then((r) => r.data),
  update: (id: string, payload: Partial<{ name: string; role: string; isActive: boolean }>) =>
    api.patch<UserSummary>(`/users/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete<UserSummary>(`/users/${id}`).then((r) => r.data),
};

export const statsApi = {
  dashboard: () => api.get<DashboardStats>("/stats/dashboard").then((r) => r.data),
};

export const assistantApi = {
  chat: (question: string) =>
    api.post<{ reply: string }>("/assistant/chat", { question }).then((r) => r.data.reply),
  summary: () => api.get<{ reply: string }>("/assistant/summary").then((r) => r.data.reply),
};

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; details?: { field: string; message: string }[] } | undefined;
    if (data?.details?.length) {
      return data.details.map((d) => `${d.field}: ${d.message}`).join("; ");
    }
    return data?.error || err.message || "Something went wrong";
  }
  return "Something went wrong";
}
