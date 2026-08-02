import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createIssueSchema,updateIssueSchema} from "../schema/issue.schema.js"

import {create,update,remove} from "../controllers/issue.controller.js"

const router=Router();
router.use(authenticate);

router.post("/",validate(createIssueSchema),create);
router.patch("/:issueId",validate(updateIssueSchema),update);
router.delete("/:issueId",remove);

export default router;