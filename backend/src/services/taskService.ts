import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedUser } from "../middleware/auth";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { assertProjectVisible } from "./projectService";

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true, managerId: true } },
  _count: { select: { comments: true } },
} as const;

interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeId?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
}

interface ListFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

async function logActivity(
  taskId: string,
  userId: string,
  action: string,
  fromValue?: string | null,
  toValue?: string | null
) {
  await prisma.taskActivity.create({
    data: { taskId, userId, action, fromValue: fromValue ?? undefined, toValue: toValue ?? undefined },
  });
}

async function getTaskOrThrow(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: taskInclude });
  if (!task) throw ApiError.notFound("Task not found");
  return task;
}

function canManageProjectTasks(requester: AuthenticatedUser, managerId: string) {
  return requester.role === "ADMIN" || (requester.role === "PROJECT_MANAGER" && managerId === requester.id);
}

export const taskService = {
  async create(input: CreateTaskInput, requester: AuthenticatedUser) {
    const project = await assertProjectVisible(input.projectId, requester);
    if (!canManageProjectTasks(requester, project.managerId)) {
      throw ApiError.forbidden("Only the project's manager or an admin can create tasks");
    }

    if (input.assigneeId) {
      const isMember = project.members.some((m) => m.user.id === input.assigneeId);
      if (!isMember) {
        throw ApiError.badRequest("The assignee must be a member of the project");
      }
    }

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        assigneeId: input.assigneeId,
        creatorId: requester.id,
        priority: input.priority ?? "MEDIUM",
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      },
      include: taskInclude,
    });

    await logActivity(task.id, requester.id, "CREATED");
    return task;
  },

  async list(filters: ListFilters, requester: AuthenticatedUser) {
    const where: Record<string, unknown> = {};

    if (requester.role === "TEAM_MEMBER") {
      // Team members only ever see tasks assigned to them
      where.assigneeId = requester.id;
    } else if (requester.role === "PROJECT_MANAGER") {
      where.project = { managerId: requester.id };
    }
    // ADMIN sees everything by default

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.assigneeId && requester.role !== "TEAM_MEMBER") where.assigneeId = filters.assigneeId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    return prisma.task.findMany({ where, include: taskInclude, orderBy: { createdAt: "desc" } });
  },

  async getById(taskId: string, requester: AuthenticatedUser) {
    const task = await getTaskOrThrow(taskId);
    await assertProjectVisible(task.projectId, requester); // reuses project visibility rules
    if (requester.role === "TEAM_MEMBER" && task.assigneeId !== requester.id) {
      throw ApiError.forbidden("You can only view tasks assigned to you");
    }
    return task;
  },

  async update(taskId: string, input: UpdateTaskInput, requester: AuthenticatedUser) {
    const task = await getTaskOrThrow(taskId);
    if (!canManageProjectTasks(requester, task.project.managerId)) {
      throw ApiError.forbidden("Only the project's manager or an admin can edit this task");
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: input.title,
        description: input.description,
        assigneeId: input.assigneeId,
        priority: input.priority,
        dueDate: input.dueDate === null ? null : input.dueDate ? new Date(input.dueDate) : undefined,
      },
      include: taskInclude,
    });

    if (input.assigneeId !== undefined && input.assigneeId !== task.assigneeId) {
      await logActivity(taskId, requester.id, "REASSIGNED", task.assigneeId, input.assigneeId);
    }

    return updated;
  },

  async delete(taskId: string, requester: AuthenticatedUser) {
    const task = await getTaskOrThrow(taskId);
    if (!canManageProjectTasks(requester, task.project.managerId)) {
      throw ApiError.forbidden("Only the project's manager or an admin can delete this task");
    }
    await prisma.task.delete({ where: { id: taskId } });
  },

  // Team members update status/progress on tasks assigned to them.
  // Managers/admins can update status on any task within their scope too.
  async updateStatus(taskId: string, status: TaskStatus, requester: AuthenticatedUser) {
    const task = await getTaskOrThrow(taskId);
    const isOwnerAssignee = task.assigneeId === requester.id;
    const isManagerOfProject = canManageProjectTasks(requester, task.project.managerId);

    if (!isOwnerAssignee && !isManagerOfProject) {
      throw ApiError.forbidden("You can only update tasks assigned to you");
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status, progress: status === "DONE" ? 100 : task.progress },
      include: taskInclude,
    });

    await logActivity(taskId, requester.id, "STATUS_CHANGED", task.status, status);
    return updated;
  },

  async updateProgress(taskId: string, progress: number, requester: AuthenticatedUser) {
    const task = await getTaskOrThrow(taskId);
    const isOwnerAssignee = task.assigneeId === requester.id;
    const isManagerOfProject = canManageProjectTasks(requester, task.project.managerId);

    if (!isOwnerAssignee && !isManagerOfProject) {
      throw ApiError.forbidden("You can only update tasks assigned to you");
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        progress,
        status: progress === 100 && task.status !== "DONE" ? "DONE" : task.status,
      },
      include: taskInclude,
    });

    await logActivity(taskId, requester.id, "PROGRESS_UPDATED", String(task.progress), String(progress));
    return updated;
  },

  async addComment(taskId: string, content: string, requester: AuthenticatedUser) {
    const task = await getTaskOrThrow(taskId);
    await assertProjectVisible(task.projectId, requester);
    if (requester.role === "TEAM_MEMBER" && task.assigneeId !== requester.id) {
      throw ApiError.forbidden("You can only comment on tasks assigned to you");
    }

    return prisma.taskComment.create({
      data: { taskId, userId: requester.id, content },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async listComments(taskId: string, requester: AuthenticatedUser) {
    const task = await getTaskOrThrow(taskId);
    await assertProjectVisible(task.projectId, requester);
    if (requester.role === "TEAM_MEMBER" && task.assigneeId !== requester.id) {
      throw ApiError.forbidden("You can only view comments on tasks assigned to you");
    }

    return prisma.taskComment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  async listActivity(taskId: string, requester: AuthenticatedUser) {
    const task = await getTaskOrThrow(taskId);
    await assertProjectVisible(task.projectId, requester);
    if (requester.role === "TEAM_MEMBER" && task.assigneeId !== requester.id) {
      throw ApiError.forbidden("You can only view activity on tasks assigned to you");
    }

    return prisma.taskActivity.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};
