import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const addCommentSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, 'Comment text is required').max(1000),
    parentCommentId: objectId.optional(),
    replyingToUser: z.string().max(30).optional(),
  }),
  params: z.object({ postId: objectId }),
  query: z.object({}).optional(),
});

export const commentIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ commentId: objectId }),
  query: z.object({}).optional(),
});
