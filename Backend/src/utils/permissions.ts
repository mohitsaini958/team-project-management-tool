import {prisma} from "../config/prisma.js"
import { AppError } from "./AppError.js"

export const requireWorkspaceRole=async(
    workspaceId:string,
    userId:string,
    roles:("OWNER"|"MEMBER"|"VIEWER")[]
)=>{
    const membership=await prisma.workspaceMember.findUnique({
        where:{
            userId_workspaceId:{
                userId,
                workspaceId,
            },
        },
    });

    if(!membership){
        throw new AppError("You are not a member of this workspace",403);
    }

    if(!roles.includes(membership.role)){
        throw new AppError("Permission denied",403);
    }

    return membership;
}

