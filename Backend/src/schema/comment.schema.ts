import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1,"Comment cannot be empty").max(2000,"Camment cannot be exceed 2000 characters"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;