import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createProjectSchema,updateProjectSchema} from "../schema/project.schema.js"

import {create,update,remove,getByWorkspace} from "../controllers/project.controller.js"

const router=Router();

router.use(authenticate)

router.post("/",validate(createProjectSchema),create);
router.get("/workspace/:workspaceId",getByWorkspace);
router.patch("/:projectId",validate(updateProjectSchema),update);
router.delete("/:projectId",remove);

export default router;