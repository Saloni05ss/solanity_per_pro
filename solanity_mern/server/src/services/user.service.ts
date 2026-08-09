import { UserDao } from '../dao/user.dao';
import { ApiError } from '../utils/ApiError';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload';

export const UserService = {
  async getProfile(uid: string) {
    const user = await UserDao.findById(uid);
    if (!user) throw new ApiError(404, 'User not found');
    return {
      uid: user._id,
      username: user.username,
      useravatarurl: user.useravatarurl ?? null,
      postsCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
    };
  },

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const { url } = await uploadBufferToCloudinary(file.buffer, `avatars/${userId}`, 'image');
    const user = await UserDao.updateById(userId, { useravatarurl: url });
    return user?.useravatarurl ?? null;
  },
};
