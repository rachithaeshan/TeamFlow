import { z } from "zod";

const role = z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"]);

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).optional(),
    role: role.optional(),
    isActive: z.boolean().optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
