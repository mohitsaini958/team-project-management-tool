import type{ Request,Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createIssue,updateIssue,deleteIssue,getProjectIssues} from "../services/issue.service.js";

export const create = asyncHandler(async(req:Request,res:Response)=>{
    const issue=await createIssue(req.user!.userId,req.body);
    res.status(201).json({
        success:true,
        message:"Issue created successfully",
        data:issue,
    });
});

export const update=asyncHandler(async(req:Request,res:Response)=>{
    const issue=await updateIssue(req.params.issueId as string,req.user!.userId,req.body);
    res.status(200).json({
        success:true,
        message:"Issue updated sucessfully",
        data:issue
    });
});

export const remove = asyncHandler(async(req:Request,res:Response)=>{
    const result=await deleteIssue(req.params.issueId as string,req.user!.userId);
    res.status(200).json({
        success:true,
        message:result.message,
    });
});


export const getByProject = asyncHandler(async (req: Request, res: Response) => {
  const issues = await getProjectIssues(req.params.projectId as string, req.user!.userId);
  res.status(200).json({ success: true, data: issues });
});