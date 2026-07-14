import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("A valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // Only ADMIN and PROJECT_MANAGER are allowed to self-register with elevated roles
    // in a real product this would be gated further; kept simple for this assignment
    role: z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email is required"),
    password: z.string().min(1, "Password is required"),
  }),
});
