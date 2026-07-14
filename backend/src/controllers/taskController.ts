import { Request, Response } from "express";
import { taskService } from "../services/taskService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

function requester(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

export const taskController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.create(req.body, requester(req));
    res.status(201).json(task);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const tasks = await taskService.list(req.query, requester(req));
    res.json(tasks);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.getById(req.params.id, requester(req));
    res.json(task);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.update(req.params.id, req.body, requester(req));
    res.json(task);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await taskService.delete(req.params.id, requester(req));
    res.status(204).send();
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.updateStatus(req.params.id, req.body.status, requester(req));
    res.json(task);
  }),

  updateProgress: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.updateProgress(req.params.id, req.body.progress, requester(req));
    res.json(task);
  }),

  addComment: asyncHandler(async (req: Request, res: Response) => {
    const comment = await taskService.addComment(req.params.id, req.body.content, requester(req));
    res.status(201).json(comment);
  }),

  listComments: asyncHandler(async (req: Request, res: Response) => {
    const comments = await taskService.listComments(req.params.id, requester(req));
    res.json(comments);
  }),

  listActivity: asyncHandler(async (req: Request, res: Response) => {
    const activity = await taskService.listActivity(req.params.id, requester(req));
    res.json(activity);
  }),
};
