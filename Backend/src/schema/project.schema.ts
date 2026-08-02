import {z} from "zod";

export const createProjectSchema=z.object({
    name:z.string().trim().min(3,"Project name must be at least 3 characters.").max(100),
    description:z.string().trim().max(500).optional(),
    workspaceId:z.string().cuid(),
});

export const updateProjectSchema=z.object({
    name:z.string().trim().min(3).max(100).optional(),
    description:z.string().trim().max(500).optional(),
});

export type CreateProjectInput=z.infer<typeof createProjectSchema>
export type UpdateProjectInput=z.infer<typeof updateProjectSchema>
