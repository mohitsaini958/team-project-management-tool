import express from "express"
import cors from "cors"

import { env } from "./config/env.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./utils/AppError.js";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js"
import workspaceRoutes from "./routes/workspace.routes.js"
import issueRoutes from "./routes/issue.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import notificationRoutes from "./routes/notification.routes.js"

const app=express();

app.use(cors())
app.use(express.json());

app.get("/health",(req,res)=>{
    res.status(200).json({
        status:"ok",
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/comments",commentRoutes);
app.use("/api/v1/notifications",notificationRoutes);


app.use((req,res,next)=>{
    next(new AppError(`Route ${req.originalUrl} not found`,404));
})

app.use(errorHandler)

app.listen(env.PORT,()=>{
    console.log(`Server is running on http://localhost:${env.PORT}`);
})