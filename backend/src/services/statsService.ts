import { prisma } from "../config/prisma";
import { AuthenticatedUser } from "../middleware/auth";

export const statsService = {
  async getDashboard(requester: AuthenticatedUser) {
    const projectWhere =
      requester.role === "ADMIN"
        ? {}
        : requester.role === "PROJECT_MANAGER"
          ? { managerId: requester.id }
          : { members: { some: { userId: requester.id } } };

    const taskWhere =
      requester.role === "ADMIN"
        ? {}
        : requester.role === "PROJECT_MANAGER"
          ? { project: { managerId: requester.id } }
          : { assigneeId: requester.id };

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      tasksByStatus,
      overdueTasks,
      totalUsers,
    ] = await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.project.count({ where: { ...projectWhere, status: "ACTIVE" } }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.groupBy({
        by: ["status"],
        where: taskWhere,
        _count: true,
      }),
      prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: new Date() },
          status: { notIn: ["DONE"] },
        },
      }),
      requester.role === "ADMIN" ? prisma.user.count({ where: { isActive: true } }) : Promise.resolve(undefined),
    ]);

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      overdueTasks,
      totalUsers,
      tasksByStatus: tasksByStatus.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = row._count;
        return acc;
      }, {}),
    };
  },
};
