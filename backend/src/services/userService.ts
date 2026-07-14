import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { Role } from "@prisma/client";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

export const userService = {
  async list() {
    return prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });
    if (!user) throw ApiError.notFound("User not found");
    return user;
  },

  async update(id: string, data: { name?: string; role?: Role; isActive?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound("User not found");

    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  },

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound("User not found");

    // Soft delete via deactivation rather than a hard delete, to preserve
    // referential integrity with tasks/projects the user may have created
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: publicUserSelect,
    });
  },

  // Used by project/task services to validate assignee/manager references
  async listByRole(role: Role) {
    return prisma.user.findMany({
      where: { role, isActive: true },
      select: publicUserSelect,
    });
  },
};
