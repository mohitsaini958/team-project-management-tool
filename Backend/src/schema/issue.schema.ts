import { z } from "zod";

export const createIssueSchema = z.object({
  title: z.string().trim().min(3).max(200),

  description: z.string().optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),

  status: z.enum(["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),

  assigneeId: z.string().cuid().optional(),

  projectId: z.string().cuid(),
});

export const updateIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),

  status: z
    .enum([
      "BACKLOG",
      "IN_PROGRESS",
      "IN_REVIEW",
      "DONE",
    ])
    .optional(),

  assigneeId: z
    .string()
    .cuid()
    .nullable()
    .optional(),

  order: z
    .number()
    .int()
    .min(0)
    .optional(),
});


export const reorderIssueSchema = z.object({
  issues: z
    .array(
      z.object({
        id: z.string().cuid(),
        status: z.enum(["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
        order: z.number().int().min(0),
      }),
    )
    .min(1),
});

export type ReorderIssueInput=z.infer<typeof reorderIssueSchema>;

export type CreateIssueInput = z.infer<typeof createIssueSchema>;

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
