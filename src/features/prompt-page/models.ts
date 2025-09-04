import { refineFromEmpty } from "@/features/common/schema-validation";
import { z } from "zod";

export const PROMPT_ATTRIBUTE = "PROMPT";
export type PromptModel = z.infer<typeof PromptModelSchema>;

export const PromptModelSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, {
      message: "Title cannot be empty",
    })
    .refine(refineFromEmpty, "Title cannot be empty"),
  description: z
    .string()
    .min(1, {
      message: "Description cannot be empty",
    })
    .refine(refineFromEmpty, "Description cannot be empty"),
  createdAt: z.union([z.date(), z.string()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  isPublished: z.boolean(),
  userId: z.string(),
  sharedWith: z.array(z.string()).default([]),
  type: z.literal(PROMPT_ATTRIBUTE),
});
