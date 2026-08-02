import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import { createWorkspaceSchema } from "../schema/workspace.schema.js";

import {create,getAll,getBySlug,} from "../controllers/workspace.controller.js"

const router=Router();
router.use(authenticate);

router.post("/",validate(createWorkspaceSchema),create);
router.get("/",getAll);
router.get("/:slug",getBySlug);

export default router;

