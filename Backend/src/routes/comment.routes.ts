import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createCommentSchema } from "../schema/comment.schema.js";
import {create,remove} from "../controllers/comment.controller.js"

const router=Router();
router.use(authenticate);

router.post("/:issueId",validate(createCommentSchema),create);
router.delete("/:commentId",remove);

export default router;