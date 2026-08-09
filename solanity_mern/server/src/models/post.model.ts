import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'pdf';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  reactionsCount: Map<string, number>;
  createdAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    caption: { type: String, default: '' },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video', 'pdf'], default: 'image' },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    reactionsCount: { type: Map, of: Number, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

postSchema.index({ createdAt: -1 });

export const Post = model<IPost>('Post', postSchema);
