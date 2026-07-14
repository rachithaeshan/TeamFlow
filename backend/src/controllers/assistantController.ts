import { Request, Response } from "express";
import { assistantService } from "../services/assistantService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

function requester(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

export const assistantController = {
  chat: asyncHandler(async (req: Request, res: Response) => {
    const reply = await assistantService.chat(req.body.question, requester(req));
    res.json({ reply });
  }),

  summary: asyncHandler(async (req: Request, res: Response) => {
    const reply = await assistantService.summary(requester(req));
    res.json({ reply });
  }),
};
