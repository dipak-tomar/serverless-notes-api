import { z } from "zod";

export const NoteCreateInputSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  tags: z.array(z.string()).optional(),
});

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
