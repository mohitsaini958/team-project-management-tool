import type { Request,Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createComment,deleteComment } from "../services/comment.service.js";
import { success } from "zod";

export const create=asyncHandler(async (req:Request,res:Response)=>{
    const comment=await createComment(req.params.issueId as string,req.user!.userId,req.body,);
    res.status(201).json({
        success:true,
        message:"Comment added successfully",
        data:comment,
    });
});

export const remove=asyncHandler(async(req:Request,res:Response)=>{
    const result=await deleteComment(req.params.commentId as string,req.user!.userId,);
    res.status(200).json({
        success:true,
        message:result.message,
    });
});

