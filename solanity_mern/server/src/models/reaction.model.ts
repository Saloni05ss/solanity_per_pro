import { Schema, model, Document, Types } from 'mongoose';

export const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export const REACTION_META: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: '👌', label: 'Like' },
  love: { emoji: '❤️', label: 'Love' },
  haha: { emoji: '😂', label: 'Haha' },
  wow: { emoji: '😀', label: 'Wow' },
  sad: { emoji: '😥', label: 'Sad' },
};

export interface IReaction extends Document {
  _id: Types.ObjectId;
  parentType: 'post' | 'comment';
  parentId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  useravatarurl?: string | null;
  type: ReactionType;
  createdAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    parentType: { type: String, enum: ['post', 'comment'], required: true },
    parentId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    useravatarurl: { type: String, default: null },
    type: { type: String, enum: REACTION_TYPES, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One reaction per user per parent (post/comment) — mirrors the Firestore
// doc-id-per-user pattern (reactions/{userId}) used in reaction.service.dart
reactionSchema.index({ parentType: 1, parentId: 1, userId: 1 }, { unique: true });

export const Reaction = model<IReaction>('Reaction', reactionSchema);
