import { Request, Response } from "express";
import { userService } from "../services/userService";
import { asyncHandler } from "../utils/asyncHandler";

export const userController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.list();
    res.json(users);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getById(req.params.id);
    res.json(user);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.delete(req.params.id);
    res.json(user);
  }),
};
