import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .max(50),

  slug: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers and hyphens.",
    }),
});

export const inviteMemberSchema=z.object({
  email:z.email("Invalid email address"),
  role:z.enum(["MEMBER","VIEWER"]).default("MEMBER")
});

export type InviteMemberInput=z.infer<typeof inviteMemberSchema>;

export type CreateWorkspaceInput =
  z.infer<typeof createWorkspaceSchema>;