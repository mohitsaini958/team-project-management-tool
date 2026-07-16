import type { Request,Response,NextFunction } from "express";

import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export const authenticate=(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return next(new AppError("Authentication required",401));
    }

    const token=authHeader.split(" ")[1];
    try {
        const payload=verifyToken(token);
        req.user={
            userId:payload.userId,
        };
        next();
    } catch (error) {
        next(new AppError("Invalid or expired token",401));
    }
}