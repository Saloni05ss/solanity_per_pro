import { ClientSession, Types } from 'mongoose';
import { User, IUser } from '../models/user.model';

export const UserDao = {
  create(data: Partial<IUser>) {
    return User.create(data);
  },

  findByEmail(email: string, withPassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    return withPassword ? query.select('+password') : query;
  },

  findById(id: string | Types.ObjectId) {
    return User.findById(id);
  },

  updateById(id: string | Types.ObjectId, update: Partial<IUser>) {
    return User.findByIdAndUpdate(id, update, { new: true });
  },

  incrementCounts(id: string | Types.ObjectId, fields: Partial<Record<'postsCount' | 'followersCount' | 'followingCount', number>>, session?: ClientSession) {
    return User.updateOne({ _id: id }, { $inc: fields }, { session });
  },
};
