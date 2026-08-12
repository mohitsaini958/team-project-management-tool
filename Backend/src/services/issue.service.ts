import { prisma } from "../config/prisma.js";
import type {
  CreateIssueInput,
  UpdateIssueInput,
  ReorderIssueInput,
} from "../schema/issue.schema.js";
import { AppError } from "../utils/AppError.js";
import { requireWorkspaceRole } from "../utils/permissions.js";
import { logActivity } from "./activity.service.js";

export const createIssue = async (userId: string, data: CreateIssueInput) => {
  const project = await prisma.project.findUnique({
    where: {
      id: data.projectId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  await requireWorkspaceRole(project.workspaceId, userId, ["OWNER", "MEMBER"]);

  const lastIssue = await prisma.issue.findFirst({
    where: {
      projectId: data.projectId,
      status: data.status ?? "BACKLOG",
    },

    orderBy: {
      order: "desc",
    },
  });

  const issue = await prisma.issue.create({
    data: {
      title: data.title,
      description: data.description ?? "",

      priority: data.priority ?? "MEDIUM",

      status: data.status ?? "BACKLOG",

      order: (lastIssue?.order ?? -1) + 1,

      projectId: data.projectId,

      reporterId: userId,

      assigneeId: data.assigneeId ?? null,
    },
  });

  await logActivity({
    action: "ISSUE_CREATED",
    message: `Created issue "${issue.title}"`,
    userId,
    issueId: issue.id,
    projectId: issue.projectId,
  });

  return issue;
};

export const updateIssue = async (
  issueId: string,
  userId: string,
  data: UpdateIssueInput,
) => {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },

    include: {
      project: true,
    },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404);
  }

  await requireWorkspaceRole(issue.project.workspaceId, userId, [
    "OWNER",
    "MEMBER",
  ]);

  const updateData = {
    ...(data.title !== undefined && { title: data.title }),

    ...(data.description !== undefined && {
      description: data.description,
    }),

    ...(data.priority !== undefined && {
      priority: data.priority,
    }),

    ...(data.status !== undefined && {
      status: data.status,
    }),
  };

  const updated = await prisma.issue.update({
    where: {
      id: issueId,
    },
    data: updateData,
  });

  if (issue.status !== updated.status) {
    await logActivity({
      action: "ISSUE_STATUS_CHANGED",
      message: `Changed status from ${issue.status} to ${updated.status}`,
      userId,
      issueId: updated.id,
      projectId: updated.projectId,
    });
  }
  if (issue.priority !== updated.priority) {
    await logActivity({
      action: "ISSUE_PRIORITY_CHANGED",

      message: `Changed priority from ${issue.priority} to ${updated.priority}`,

      userId,

      issueId: updated.id,

      projectId: updated.projectId,
    });
  }

  if (issue.title !== updated.title) {
    await logActivity({
      action: "ISSUE_UPDATED",

      message: `Renamed "${issue.title}" to "${updated.title}"`,

      userId,

      issueId: updated.id,

      projectId: updated.projectId,
    });
  }

  if (issue.assigneeId !== updated.assigneeId) {
    await logActivity({
      action: "ISSUE_ASSIGNED",

      message: "Updated assignee.",

      userId,

      issueId: updated.id,

      projectId: updated.projectId,
    });
  }

  return updated;
};

export const deleteIssue = async (issueId: string, userId: string) => {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
    include: {
      project: true,
    },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404);
  }

  await requireWorkspaceRole(issue.project.workspaceId, userId, ["OWNER"]);

  await logActivity({
    action: "ISSUE_DELETED",

    message: `Deleted issue "${issue.title}"`,

    userId,

    issueId: issue.id,

    projectId: issue.projectId,
  });

  await prisma.issue.delete({
    where: {
      id: issueId,
    },
  });

  return {
    message: "Issue deleted successfully",
  };
};

export const getProjectIssues = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError("Project not found", 404);

  await requireWorkspaceRole(project.workspaceId, userId, [
    "OWNER",
    "MEMBER",
    "VIEWER",
  ]);

  return prisma.issue.findMany({
    where: { projectId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
  });
};

export const reorderIssues = async (
  userId: string,
  data: ReorderIssueInput,
) => {
  const firstIssue = await prisma.issue.findUnique({
    where: {
      id: data.issues[0]!.id,
    },
    include: {
      project: true,
    },
  });

  if (!firstIssue) {
    throw new AppError("Issue not found ", 404);
  }

  await requireWorkspaceRole(firstIssue.project.workspaceId, userId, [
    "OWNER",
    "MEMBER",
  ]);

  await prisma.$transaction(
    data.issues.map((issue) =>
      prisma.issue.update({
        where: {
          id: issue.id,
        },
        data: {
          status: issue.status,
          order: issue.order,
        },
      }),
    ),
  );

  return {
    message: "Issues reordered successfully.",
  };
};

export const getIssueById = async (issueId: string, userId: string) => {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },

    include: {
      project: true,
    },
  });

  if (!issue) {
    throw new AppError("Issue not found.", 404);
  }

  await requireWorkspaceRole(issue.project.workspaceId, userId, [
    "OWNER",
    "MEMBER",
    "VIEWER",
  ]);

  return prisma.issue.findUnique({
    where: {
      id: issueId,
    },

    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },

      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },

      comments: {
        where: {
          deletedAt: null,
        },

        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },

        orderBy: {
          createdAt: "asc",
        },
      },

      activityLogs: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};
