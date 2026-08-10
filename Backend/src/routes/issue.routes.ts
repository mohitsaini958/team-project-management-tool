import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createIssueSchema,updateIssueSchema,reorderIssueSchema} from "../schema/issue.schema.js"

import {create,update,remove,getByProject,reorder, getById} from "../controllers/issue.controller.js"

const router=Router();
router.use(authenticate);

router.post("/",validate(createIssueSchema),create);
router.patch("/reorder",validate(reorderIssueSchema),reorder);
router.get("/:issueId",getById);
router.patch("/:issueId",validate(updateIssueSchema),update);
router.delete("/:issueId",remove);
router.get("/project/:projectId", getByProject);

export default router;