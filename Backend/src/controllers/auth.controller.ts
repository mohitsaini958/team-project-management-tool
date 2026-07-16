import type { Request,Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
    registerUser,
    loginUser,
    getMe as getMeService
}  from "../services/auth.service.js"
import { success } from "zod";

export const register=asyncHandler(async(req:Request,res:Response)=>{
    const result=await registerUser(req.body);
    res.status(201).json({
        success:true,
        message:"User registered successfully",
        data:result,
    });
});

export const login=asyncHandler(async (req:Request,res:Response)=>{
    const result=await loginUser(req.body);
    res.status(200).json({
        success:true,
        message:"Login successfully",
        data:result
    });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await getMeService(req.user!.userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});