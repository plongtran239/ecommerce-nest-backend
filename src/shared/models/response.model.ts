import { z } from 'zod';

const MessageResSchema = z.object({
  message: z.string(),
});

type MessageResType = z.infer<typeof MessageResSchema>;

export { MessageResSchema };

export type { MessageResType };
