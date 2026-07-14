import { z } from "zod";

const taskStatus = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"]);
const taskPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    projectId: z.string().uuid("projectId must be a valid project id"),
    assigneeId: z.string().uuid().optional(),
    priority: taskPriority.optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    priority: taskPriority.optional(),
    dueDate: z.string().datetime().nullable().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: taskStatus,
  }),
});

export const updateTaskProgressSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    progress: z.number().int().min(0).max(100),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    content: z.string().min(1, "Comment cannot be empty"),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const listTasksQuerySchema = z.object({
  query: z.object({
    projectId: z.string().uuid().optional(),
    assigneeId: z.string().uuid().optional(),
    status: taskStatus.optional(),
    priority: taskPriority.optional(),
  }),
});
