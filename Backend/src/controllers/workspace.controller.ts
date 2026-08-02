import type { Request,Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createWorkspace,getUserWorkspaces,getWorkspaceBySlug } from "../services/workspace.service.js";
import { success } from "zod";

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