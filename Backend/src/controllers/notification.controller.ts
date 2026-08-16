import type { Request, Response } from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";

import {
  getUnreadNotifications,
  markNotificationAsRead,
} from "../services/notification.service.js";

export const getUnread = asyncHandler(
  async (req: Request, res: Response) => {
    const notifications = await getUnreadNotifications(
      req.user!.userId
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  }
);

export const markAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const notification = await markNotificationAsRead(
      req.params.notificationId,
      req.user!.userId
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  }
);