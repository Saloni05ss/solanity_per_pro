import { ClientSession, Types } from 'mongoose';
import { Reaction, IReaction, ReactionType } from '../models/reaction.model';

export const ReactionDao = {
  findOne(parentType: string, parentId: string | Types.ObjectId, userId: string | Types.ObjectId, session?: ClientSession) {
    return Reaction.findOne({ parentType, parentId, userId }).session(session ?? null);
  },

  create(data: Partial<IReaction>, session?: ClientSession) {
    return Reaction.create([data], { session }).then((docs) => docs[0]);
  },

  updateType(reaction: IReaction, type: ReactionType, session?: ClientSession) {
    reaction.type = type;
    return reaction.save({ session });
  },

  deleteOne(id: Types.ObjectId, session?: ClientSession) {
    return Reaction.deleteOne({ _id: id }).session(session ?? null);
  },

  findByParent(parentType: string, parentId: string | Types.ObjectId) {
    return Reaction.find({ parentType, parentId }).sort({ createdAt: -1 });
  },

  deleteAllForParent(parentType: string, parentId: string | Types.ObjectId) {
    return Reaction.deleteMany({ parentType, parentId });
  },

  findByUserAndParents(parentType: string, parentIds: (string | Types.ObjectId)[], userId: string | Types.ObjectId) {
    return Reaction.find({
      parentType,
      parentId: { $in: parentIds },
      userId,
    });
  },
};

