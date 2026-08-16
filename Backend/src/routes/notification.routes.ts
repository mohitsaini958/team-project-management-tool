import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";

import {
  getUnread,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/unread", getUnread);

router.patch("/:notificationId/read", markAsRead);

export default router;