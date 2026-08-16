import type { Request,Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createWorkspace,getUserWorkspaces,getWorkspaceBySlug, removeMember } from "../services/workspace.service.js";
import { success } from "zod";
import { inviteMember } from "../services/workspace.service.js";

export const create=asyncHandler(
    async(req:Request,res:Response)=>{
        const workspace=await createWorkspace(req.user!.userId,req.body);
        console.log(workspace);
        res.status(201).json({
            success:true,
            message:"Workspace created successfully",
            data:workspace,
        });
    }
)

export const getAll=asyncHandler(
    async(req:Request,res:Response)=>{
        const workspaces=await getUserWorkspaces(
            req.user!.userId
        );

        res.status(200).json({
            success:true,
            data:workspaces,
        });
    }
);

export const getBySlug=asyncHandler(
    async(req:Request,res:Response)=>{
        const workspace=await getWorkspaceBySlug(req.params.slug as string,req.user!.userId);

        res.status(200).json({
            success:true,
            data:workspace,
        });
    }
);

export const invite=asyncHandler(async(req:Request,res:Response)=>{
    const membership=await inviteMember(req.params.workspaceId as string,req.user!.userId,req.body);

    res.status(201).json({
        success:true,
        message:"Member added successfully",
        data:membership,
    });
})


export const removeMemberController=asyncHandler(async(req:Request,res:Response)=>{
    const result=await removeMember(req.params.workspaceId as string,req.user!.userId,req.params.userId as string);
    res.status(200).json({
        success:true,
        message:result.message,
    });
});

