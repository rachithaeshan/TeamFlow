import { Request, Response } from "express";
import { statsService } from "../services/statsService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const statsController = {
  dashboard: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const stats = await statsService.getDashboard(req.user);
    res.json(stats);
  }),
};
