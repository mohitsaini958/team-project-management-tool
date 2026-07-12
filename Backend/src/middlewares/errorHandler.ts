import type{ Request,Response,NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler=(
    err:Error,
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success:false,
            status:err.status,
            message:err.message,
        });
    }

    console.log(err);

    return res.status(500).json({
        success:false,
        status:"error",
        message:"Internal Server Error",
    });
}