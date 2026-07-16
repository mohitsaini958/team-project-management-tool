import express from "express"
import cors from "cors"

import { env } from "./config/env.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./utils/AppError.js";

import authRoutes from "./routes/auth.routes.js";

const app=express();

app.use(cors())
app.use(express.json());

app.get("/health",(req,res)=>{
    res.status(200).json({
        status:"ok",
    });
});

app.use("/api/v1/auth",authRoutes);

app.use((req,res,next)=>{
    next(new AppError(`Route ${req.originalUrl} not found`,404));
})

app.use(errorHandler)

app.listen(env.PORT,()=>{
    console.log(`Server is running on http://localhost:${env.PORT}`);
})

