import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import { createWorkspaceSchema, inviteMemberSchema } from "../schema/workspace.schema.js";

import {create,getAll,getBySlug,invite,removeMemberController} from "../controllers/workspace.controller.js"

const router=Router();
router.use(authenticate);

router.post("/",validate(createWorkspaceSchema),create);
router.get("/",getAll);
router.get("/:slug",getBySlug);
router.post("/:workspaceId/members",validate(inviteMemberSchema),invite);
router.delete("/:workspaceId/members/:userId",removeMemberController);

export default router;

