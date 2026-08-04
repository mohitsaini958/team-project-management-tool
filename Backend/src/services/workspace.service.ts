import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

import type { CreateWorkspaceInput } from "../schema/workspace.schema.js";

export const createWorkspace=async(userId:string,data:CreateWorkspaceInput)=>{
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