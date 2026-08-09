import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createPostSchema = z.object({
  body: z.object({
    caption: z.string().max(2200).optional().default(''),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const getFeedSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    cursor: objectId.optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

export const postIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ postId: objectId }),
  query: z.object({}).optional(),
});

export const userIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ userId: objectId }),
  query: z.object({}).optional(),
});
