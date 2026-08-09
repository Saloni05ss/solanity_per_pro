import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    username: z.string().trim().min(2, 'Username must be at least 2 characters').max(30),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      username: z.string().trim().min(2).max(30).optional(),
      useravatarurl: z.string().url().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
