import { PostDao } from '../dao/post.dao';
import { ApiError } from '../utils/ApiError';

// The OS share sheet (share_plus) stays on the client — this only records the
// share the way share.service.dart bumped `sharesCount`.
export const ShareService = {
  async sharePost(postId: string) {
    const post = await PostDao.incrementField(postId, 'sharesCount', 1);
    if (!post) throw new ApiError(404, 'Post not found');
    return post.sharesCount;
  },
};
