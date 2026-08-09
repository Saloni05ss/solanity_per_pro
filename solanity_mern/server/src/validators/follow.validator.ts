import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const followingIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ followingId: objectId }),
  query: z.object({}).optional(),
});

export const userIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ userId: objectId }),
  query: z.object({}).optional(),
});
