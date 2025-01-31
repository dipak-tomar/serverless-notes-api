import { z } from "zod";

export const CreateNoteSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  tags: z.array(z.string()).optional(),
});
