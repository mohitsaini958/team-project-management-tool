import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { requireWorkspaceRole } from "../utils/permissions.js";

import type { CreateWorkspaceInput,InviteMemberInput } from "../schema/workspace.schema.js";

export const createWorkspace=async(userId:string,data:CreateWorkspaceInput)=>{

    const user=await prisma.user.findUnique({
      where:{
        id:userId,
      },
      select:{
        subscriptionStatus:true,
      }
    });

    if(!user){
      throw new AppError("User not found",404);
    }

    if(user.subscriptionStatus=="TRIAL"){
      const workspaceCount=await prisma.workspace.count({
        where:{
          ownerId:userId,
        },
      });

      if(workspaceCount>=1){
        throw new AppError("Free users can only create one workspace. Upgrade your subsciption to create more.",403);
      }
    }

    const existing=await prisma.workspace.findUnique({
        where:{
            slug:data.slug,
        },
    });

    if(existing){
        throw new AppError("Workspace slug already exist",409);
    }

    const workspace=await prisma.workspace.create({
        data:{
            name:data.name,
            slug:data.slug,
            owner:{
                connect:{
                    id:userId,
                },
            },
            members:{
                create:{
                    user:{
                        connect:{
                            id:userId,
                        },
                    },
                    role:"OWNER"
                },
            },
        },

        include:{
            owner:true,
            members:true,
        },

    });

    return workspace;
};

export const getUserWorkspaces = async (userId: string) => {
  return prisma.workspace.findMany({
    where: {
      members: { some: { userId } }, 
    },
    include: {
      _count: { select: { projects: true, members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getWorkspaceBySlug = async (
  slug: string,
  userId: string
) => {
  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,

      members: {
        some: {
          userId,
        },
      },
    },

    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },

      projects: true,
    },
  });

  if (!workspace) {
    throw new AppError(
      "Workspace not found.",
      404
    );
  }

  return workspace;
};

export const inviteMember=async(workspaceId:string,requesterId:string,data:InviteMemberInput)=>{
  await requireWorkspaceRole(workspaceId,requesterId,["OWNER","MEMBER"]);

  const targetUser=await prisma.user.findUnique({
    where:{
      email:data.email,
    },
  });

  if(!targetUser){
    throw new AppError("User with this email does not exist",404);
  }

  const existingMembership =
    await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUser.id,
          workspaceId,
        },
      },
    });

  if(existingMembership){
    throw new AppError("User is already a member of this workspace",409);
  }

  const membership=await prisma.workspaceMember.create({
    data:{
      userId:targetUser.id,
      workspaceId,
      role:data.role??"MEMBER",
    },
    include:{
      user:{
        select:{
          id:true,
          name:true,
          email:true,
          avatarUrl:true,
        },
      },
    },
  });

  return membership;
};


export const removeMember=async(workspaceId:string,requesterId:string,targetUserId:string)=>{
  await requireWorkspaceRole(
    workspaceId,requesterId,["OWNER"],
  );

  if(requesterId==targetUserId){
    throw new AppError("You cannot remove yourself from the workspace",400);
  }

  const membership=await prisma.workspaceMember.findUnique({
    where:{
      userId_workspaceId:{
        userId:targetUserId,
        workspaceId,
      },
    },
  });

  if(!membership){
    throw new AppError("User is not a member of this workspace",404);
  }

  await prisma.workspaceMember.delete({
    where:{
      userId_workspaceId:{
        userId:targetUserId,
        workspaceId,
      },
    },
  });

  return {
    message:"Member removed successfully",
  };
};