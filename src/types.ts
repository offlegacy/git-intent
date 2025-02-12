import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['TODO', 'IN-PROGRESS', 'DONE']),
  createdAt: z.string().datetime(),
});

export type Task = z.infer<typeof TaskSchema>;
