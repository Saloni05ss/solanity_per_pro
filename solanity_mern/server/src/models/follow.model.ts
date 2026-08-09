import { Schema, model, Document, Types } from 'mongoose';

export interface IFollow extends Document {
  _id: Types.ObjectId;
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Mirrors the composite doc id `${followerId}_${followingId}` used in follow.service.dart
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const Follow = model<IFollow>('Follow', followSchema);
