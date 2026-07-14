import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedUser } from "../middleware/auth";
import { ProjectStatus } from "@prisma/client";

const projectInclude = {
  manager: { select: { id: true, name: true, email: true } },
  members: {
    select: { user: { select: { id: true, name: true, email: true } }, addedAt: true },
  },
  _count: { select: { tasks: true } },
} as const;

interface CreateProjectInput {
  name: string;
  description?: string;
  managerId?: string;
  startDate?: string;
  endDate?: string;
}

interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

async function assertProjectVisible(projectId: string, requester: AuthenticatedUser) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });
  if (!project) throw ApiError.notFound("Project not found");

  if (requester.role === "ADMIN") return project;
  if (requester.role === "PROJECT_MANAGER" && project.managerId === requester.id) return project;
  if (requester.role === "TEAM_MEMBER") {
    const isMember = project.members.some((m) => m.user.id === requester.id);
    if (isMember) return project;
  }
  throw ApiError.forbidden("You do not have access to this project");
}

export const projectService = {
  async create(input: CreateProjectInput, requester: AuthenticatedUser) {
    // Admins may create a project on behalf of any manager; PMs always own what they create
    const managerId =
      requester.role === "ADMIN" && input.managerId ? input.managerId : requester.id;

    if (requester.role === "TEAM_MEMBER") {
      throw ApiError.forbidden("Team members cannot create projects");
    }

    return prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        managerId,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      },
      
      include: projectInclude,
    });
  },
  

  async list(requester: AuthenticatedUser) {
    if (requester.role === "ADMIN") {
      return prisma.project.findMany({ include: projectInclude, orderBy: { createdAt: "desc" } });
    }
    if (requester.role === "PROJECT_MANAGER") {
      return prisma.project.findMany({
        where: { managerId: requester.id },
        include: projectInclude,
        orderBy: { createdAt: "desc" },
      });
    }
    // TEAM_MEMBER: only projects they've been added to
    return prisma.project.findMany({
      where: { members: { some: { userId: requester.id } } },
      include: projectInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(projectId: string, requester: AuthenticatedUser) {
    return assertProjectVisible(projectId, requester);
  },

  async update(projectId: string, input: UpdateProjectInput, requester: AuthenticatedUser) {
    const project = await assertProjectVisible(projectId, requester);
    if (requester.role === "TEAM_MEMBER") {
      throw ApiError.forbidden("Team members cannot edit project details");
    }
    if (requester.role === "PROJECT_MANAGER" && project.managerId !== requester.id) {
      throw ApiError.forbidden("You can only edit projects you manage");
    }

    return prisma.project.update({
      where: { id: projectId },
      data: {
        name: input.name,
        description: input.description,
        status: input.status,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      },
      include: projectInclude,
    });
  },

  async delete(projectId: string, requester: AuthenticatedUser) {
    const project = await assertProjectVisible(projectId, requester);
    if (requester.role === "TEAM_MEMBER") {
      throw ApiError.forbidden("Team members cannot delete projects");
    }
    if (requester.role === "PROJECT_MANAGER" && project.managerId !== requester.id) {
      throw ApiError.forbidden("You can only delete projects you manage");
    }
    await prisma.project.delete({ where: { id: projectId } });
  },

  async addMember(projectId: string, userId: string, requester: AuthenticatedUser) {
    const project = await assertProjectVisible(projectId, requester);
    if (requester.role === "TEAM_MEMBER") {
      throw ApiError.forbidden("Team members cannot manage project membership");
    }
    if (requester.role === "PROJECT_MANAGER" && project.managerId !== requester.id) {
      throw ApiError.forbidden("You can only manage members of projects you manage");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("User not found");

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (existing) throw ApiError.conflict("This user is already a member of the project");

    await prisma.projectMember.create({ data: { projectId, userId } });
    return assertProjectVisible(projectId, requester);
  },

  async removeMember(projectId: string, userId: string, requester: AuthenticatedUser) {
    const project = await assertProjectVisible(projectId, requester);
    if (requester.role === "TEAM_MEMBER") {
      throw ApiError.forbidden("Team members cannot manage project membership");
    }
    if (requester.role === "PROJECT_MANAGER" && project.managerId !== requester.id) {
      throw ApiError.forbidden("You can only manage members of projects you manage");
    }

    await prisma.projectMember.deleteMany({ where: { projectId, userId } });
    return assertProjectVisible(projectId, requester);
  },
};

export { assertProjectVisible };
