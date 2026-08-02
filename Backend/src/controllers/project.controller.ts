import type { Request,Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createProject,updateProject,deleteProject,getWorkspaceProjects } from "../services/project.service.js";
import { success } from "zod";

export const create=asyncHandler(async(req:Request,res:Response)=>{
    const project=await createProject(req.user!.userId,req.body);
    res.status(201).json({
        success:true,
        messsage:"Project created successfully",
        data:project,
    });
});

export const getByWorkspace=asyncHandler(async (req:Request,res:Response) => {
    const projects=await getWorkspaceProjects(req.params.workspaceId as string,req.user!.userId);
    res.status(200).json({
        success:true,
        data:projects,
    })
})

export const update=asyncHandler(async(req:Request,res:Response)=>{
    const project=await updateProject(req.params.projectId as string,req.user!.userId,req.body);

    res.status(200).json({
        success:true,
        message:"Project updated successfully",
        data:project,
    });
});

export const remove=asyncHandler(async(req:Request,res:Response)=>{
    const result = await deleteProject(req.params.projectId as string,req.user!.userId);

    res.status(200).json({
        success:true,
        message:result.message,
    });
});

