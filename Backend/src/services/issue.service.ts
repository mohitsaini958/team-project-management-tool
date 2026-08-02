import {prisma} from "../config/prisma.js"
import type { CreateIssueInput, UpdateIssueInput } from "../schema/issue.schema.js"
import { AppError } from "../utils/AppError.js"
import { requireWorkspaceRole } from "../utils/permissions.js";

export const createIssue=async(
    userId:string,
    data:CreateIssueInput
)=>{
    const project=await prisma.project.findUnique({
        where:{
            id:data.projectId,
        }
    });

    if(!project){
        throw new AppError("Project not found",404);
    }

    await requireWorkspaceRole(project.workspaceId,userId,["OWNER","MEMBER"]);

    const lastIssue=await prisma.issue.findFirst({
        where:{
            projectId:data.projectId,
            status:data.status ?? "BACKLOG",
        },

        orderBy:{
            order:"desc",
        },
    });

    return prisma.issue.create({
    data: {
      title: data.title,
      description: data.description??"",

      priority:
        data.priority ?? "MEDIUM",

      status:
        data.status ?? "BACKLOG",

      order:
        (lastIssue?.order ?? -1) + 1,

      projectId: data.projectId,

      reporterId: userId,

      assigneeId: data.assigneeId??null,
    },
  });
};

export const updateIssue=async(issueId:string,userId:string,data:UpdateIssueInput)=>{
  const issue=await prisma.issue.findUnique({
    where:{
      id:issueId,
    },

    include:{
      project:true,
    },
  });

  if(!issue){
    throw new AppError("Issue not found",404);
  }

  await requireWorkspaceRole(
    issue.project.workspaceId,
    userId,
    ["OWNER","MEMBER"]
  )

  const updateData = {
    ...(data.title !== undefined && { title: data.title }),

    ...(data.description !== undefined && {
        description: data.description,
    }),

    ...(data.priority !== undefined && {
        priority: data.priority,
    }),

    ...(data.status !== undefined && {
        status: data.status,
    }),
};

  return prisma.issue.update({
    where:{
      id:issueId,
    },
    data:updateData,
  });
}

export const deleteIssue=async(issueId:string,userId:string)=>{
  const issue=await prisma.issue.findUnique({
    where:{
      id:issueId,
    },
    include:{
      project:true,
    },
  });

  if(!issue){
    throw new AppError("Issue not found",404);
  }

  await requireWorkspaceRole(
    issue.project.workspaceId,
    userId,
    ["OWNER"]
  );

  await prisma.issue.delete({
    where:{
      id:issueId,
    },
  });

  return {
    message:"Issue deleted successfully",
  };
};

