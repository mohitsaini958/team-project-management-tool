import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import {prisma} from "../config/prisma.js"
import {env} from "../config/env.js"
import { AppError } from "../utils/AppError.js"
import type { LoginInput,RegisterInput } from "../schema/auth.schema.js"
import { SubscriptionStatus } from "../generated/prisma/enums.js"

const SALT_ROUNDS=12;

export const registerUser=async(data:RegisterInput)=>{
    const existingUser=await prisma.user.findUnique({
        where:{
            email:data.email,
        },
    });

    if(existingUser){
        throw new AppError("User already exists",409);
    }

    const passwordHash=await bcrypt.hash(data.password,SALT_ROUNDS);

    const user=await prisma.user.create({
        data:{
            name:data.name,
            email:data.email,
            passwordHash,
        },
    });

    const token=jwt.sign(
        {
            userId:user.id,
        },
        env.JWT_SECRET,
        {
            expiresIn:"7d",
        }
    );

    return {
        user:{
            id:user.id,
            name:user.name,
            email:user.email,
            avatarUrl:user.avatarUrl,
            SubscriptionStatus:user.subscriptionStatus
        },
        token
    }
}

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      subscriptionStatus: user.subscriptionStatus,
    },
    token,
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      subscriptionStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};