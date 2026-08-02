import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { requireWorkspaceRole } from "../utils/permissions.js";
import type {CreateProjectInput,UpdateProjectInput} from "../schema/project.schema.js"

export const createProject=async(userId:string,data:CreateProjectInput)=>{
    await requireWorkspaceRole(data.workspaceId,userId,["OWNER","MEMBER"]);
    const project=await prisma.project.create({
        data:{
            name:data.name,
            description:data.description??"",
            workspaceId:data.workspaceId,
        },
    });
    return project;
};

export const getWorkspaceProjects=async(workspaceId:string,userId:string)=>{
    await requireWorkspaceRole(workspaceId,userId,["OWNER","MEMBER","VIEWER"]);
    return prisma.project.findMany({
        where:{
            workspaceId,
        },
        orderBy:{
            createdAt:"desc",
        },
    });
};

export const updateProject=async(projectId:string,userId:string,data:UpdateProjectInput)=>{
    const project=await prisma.project.findUnique({
        where:{
            id:projectId,
        },
    });

    if(!project){
        throw new AppError("Project not found",404);
    }

    await requireWorkspaceRole(project.workspaceId,userId,["OWNER","MEMBER"]);

      const updateData = {
    ...(data.name !== undefined && { name: data.name }),

    ...(data.description !== undefined && {
        description: data.description,
    })
};

    return prisma.project.update({
        where:{
            id:projectId,
        },
        data:updateData,
    });
};


export const deleteProject=async(projectId:string,userId:string)=>{
    const project=await prisma.project.findUnique({
        where:{
            id:projectId,
        },
    });

    if(!project){
        throw new AppError("Project not found",404);
    }

    await requireWorkspaceRole(
        project.workspaceId,
        userId,
        ["OWNER"]
    );

    await prisma.project.delete({
        where:{
            id:projectId,
        },
    });

    return {
        message:"Project deleted successfully",
    };
};