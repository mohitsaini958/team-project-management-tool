import { prisma } from "../config/prisma.js";
import { ActivityAction } from "../generated/prisma/enums.js";

interface LogActivityInput {
  action: ActivityAction;
  message: string;
  userId: string;
  issueId?: string;
  projectId?: string;
}

export const logActivity = async (data: LogActivityInput) => {
  return prisma.activityLog.create({
    data: {
      action: data.action,
      message: data.message,
      userId: data.userId,

      ...(data.issueId && {
        issueId: data.issueId,
      }),

      ...(data.projectId && {
        projectId: data.projectId,
      }),
    },
  });
};

