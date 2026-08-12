import {prisma} from "../config/prisma.js";
import type { CreateCommentInput } from "../schema/comment.schema.js";
import { AppError } from "../utils/AppError.js";
import { requireWorkspaceRole } from "../utils/permissions.js";
import { logActivity } from "./activity.service.js";

export const createComment=async(issueId:string,userId:string,data:CreateCommentInput)=>{
    const issue=await prisma.issue.findUnique({
        where:{id:issueId},
        include:{project:true},
    });

    if(!issue){
        throw new AppError("Issue not found",404);
    }

    await requireWorkspaceRole(issue.project.workspaceId,userId,["OWNER","MEMBER"]);

    const comment=await prisma.comment.create({
        data:{
            content:data.content,
            issueId,
            authorId:userId,
        },
        include:{
            author:{
                select:{id:true,name:true,avatarUrl:true},
            },
        },
    });

    await logActivity({
        action:"COMMENT_ADDED",
        message:"Added a comment",
        userId,
        issueId,
        projectId:issue.projectId,
    });

    return comment;
};

export const deleteComment=async(commentId:string,userId:string)=>{
    const comment=await prisma.comment.findUnique({
        where:{id:commentId},
        include:{issue:{include:{project:true}}},
    });

    if(!comment){
        throw new AppError("Comment not found",404);
    }

    const isAuthor=comment.authorId==userId;
    if(!isAuthor){
        await requireWorkspaceRole(comment.issue.project.workspaceId,userId,["OWNER"]);
    }

    await prisma.comment.update({
        where:{id:commentId},
        data:{deletedAt:new Date()},
    });

    return {message:"Comment deleted successfully"};
}