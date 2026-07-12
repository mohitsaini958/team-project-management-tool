import express from "express"
import cors from "cors"

import { env } from "./config/env.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./utils/AppError.js";

const app=express();

app.use(cors())
app.use(express.json());

app.get("/health",(req,res)=>{
    res.status(200).json({
        status:"ok",
    });
});

app.get("/error",(req,res,next)=>{
    next(new AppError("this is custom error",400));
})

app.use(errorHandler)

app.listen(env.PORT,()=>{
    console.log(`Server is running on http://localhost:${env.PORT}`);
})

