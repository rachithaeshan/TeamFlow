export type Role = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectMemberInfo {
  user: { id: string; name: string; email: string };
  addedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  manager: { id: string; name: string; email: string };
  members: ProjectMemberInfo[];
  _count: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueDate?: string | null;
  createdAt: string;
  project: { id: string; name: string; managerId: string };
  assignee?: { id: string; name: string; email: string } | null;
  creator: { id: string; name: string; email: string };
  _count: { comments: number };
}

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface TaskActivity {
  id: string;
  action: string;
  fromValue?: string | null;
  toValue?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  overdueTasks: number;
  totalUsers?: number;
  tasksByStatus: Record<string, number>;
}

export interface ApiErrorBody {
  error: string;
  details?: { field: string; message: string }[];
}
