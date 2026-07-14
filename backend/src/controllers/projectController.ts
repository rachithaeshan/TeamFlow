import { Request, Response } from "express";
import { projectService } from "../services/projectService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

function requester(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

export const projectController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.create(req.body, requester(req));
    res.status(201).json(project);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const projects = await projectService.list(requester(req));
    res.json(projects);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.getById(req.params.id, requester(req));
    res.json(project);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.update(req.params.id, req.body, requester(req));
    res.json(project);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await projectService.delete(req.params.id, requester(req));
    res.status(204).send();
  }),

  addMember: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.addMember(req.params.id, req.body.userId, requester(req));
    res.status(201).json(project);
  }),

  removeMember: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.removeMember(req.params.id, req.params.userId, requester(req));
    res.json(project);
  }),

 
};
