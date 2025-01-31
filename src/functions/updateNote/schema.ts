import { z } from "zod";

export const UpdateNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(1000).optional(),
  tags: z.array(z.string()).optional(),
});
