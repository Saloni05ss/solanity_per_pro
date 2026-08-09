import { z } from 'zod';
import { REACTION_TYPES } from '../models/reaction.model';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const reactSchema = z.object({
  body: z.object({
    type: z.enum(REACTION_TYPES as unknown as [string, ...string[]]),
  }),
  params: z.object({
    parentType: z.enum(['post', 'comment']),
    parentId: objectId,
  }),
  query: z.object({}).optional(),
});

export const reactionParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    parentType: z.enum(['post', 'comment']),
    parentId: objectId,
  }),
  query: z.object({}).optional(),
});
