import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  useravatarurl?: string | null;
  text: string;
  parentCommentId?: Types.ObjectId | null;
  rootCommentId?: Types.ObjectId | null;
  replyingToUser?: string | null;
  repliesCount: number;
  likesCount: number;
  reactionsCount: Map<string, number>;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    useravatarurl: { type: String, default: null },
    text: { type: String, required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    rootCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    replyingToUser: { type: String, default: null },
    repliesCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    reactionsCount: { type: Map, of: Number, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

commentSchema.virtual('isReply').get(function (this: IComment) {
  return this.parentCommentId != null;
});

export const Comment = model<IComment>('Comment', commentSchema);
