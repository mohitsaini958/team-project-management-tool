import { prisma } from "../config/prisma.js";
import type { NotificationType } from "../generated/prisma/enums.js";
import { AppError } from "../utils/AppError.js";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  issueId?: string;
}

export const createNotification = async (
  data: CreateNotificationInput
) => {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      message: data.message,

      ...(data.issueId !== undefined && {
        issueId: data.issueId,
      }),
    },
  });
};

export const getUnreadNotifications = async (
  userId: string
) => {
  return prisma.notification.findMany({
    where: {
      userId,
      readAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      readAt: new Date(),
    },
  });
};