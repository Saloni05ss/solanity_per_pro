import { PostDao } from '../dao/post.dao';
import { CommentDao } from '../dao/comment.dao';
import { ReactionDao } from '../dao/reaction.dao';
import { UserDao } from '../dao/user.dao';
import { ApiError } from '../utils/ApiError';
import { uploadBufferToCloudinary, extractCloudinaryPublicId } from '../utils/cloudinaryUpload';
import cloudinary from '../config/cloudinary';

export const PostService = {
  async createPost(userId: string, caption: string, file?: Express.Multer.File) {
    if (!file) throw new ApiError(400, 'Media file is required');

    const mediaType = file.mimetype.startsWith('video') ? 'video' : file.mimetype === 'application/pdf' ? 'pdf' : 'image';
    const { url } = await uploadBufferToCloudinary(
      file.buffer,
      `posts/${userId}/${mediaType}`,
      mediaType === 'video' ? 'video' : mediaType === 'pdf' ? 'auto' : 'image'
    );

    const post = await PostDao.create({ userId: userId as any, caption, mediaUrl: url, mediaType });
    await UserDao.incrementCounts(userId, { postsCount: 1 });
    return post;
  },

  /** Cursor-based pagination — mirrors Firestore's startAfterDocument(lastDoc). */
  async getFeedPage(cursor: string | undefined, limit: number, currentUserId?: string) {
    let beforeDate: Date | undefined;
    if (cursor) {
      const cursorPost = await PostDao.findById(cursor);
      if (cursorPost) beforeDate = cursorPost.createdAt;
    }

    const posts = await PostDao.findFeedPage(beforeDate, limit);
    let postsWithReaction: any[] = posts.map((p) => p.toObject());

    if (currentUserId && posts.length > 0) {
      const postIds = posts.map((p) => p._id);
      const reactions = await ReactionDao.findByUserAndParents('post', postIds, currentUserId);
      const reactionMap = new Map(reactions.map((r) => [r.parentId.toString(), r.type]));
      postsWithReaction = postsWithReaction.map((p) => ({
        ...p,
        myReaction: reactionMap.get(p._id.toString()) || null,
      }));
    }

    return {
      posts: postsWithReaction as any,
      nextCursor: posts.length === limit ? posts[posts.length - 1]._id : null,
      hasMore: posts.length === limit,
    };
  },

  async getUserPosts(userId: string, currentUserId?: string) {
    const posts = await PostDao.findByUser(userId);
    let postsWithReaction: any[] = posts.map((p) => p.toObject());

    if (currentUserId && posts.length > 0) {
      const postIds = posts.map((p) => p._id);
      const reactions = await ReactionDao.findByUserAndParents('post', postIds, currentUserId);
      const reactionMap = new Map(reactions.map((r) => [r.parentId.toString(), r.type]));
      postsWithReaction = postsWithReaction.map((p) => ({
        ...p,
        myReaction: reactionMap.get(p._id.toString()) || null,
      }));
    }
    return postsWithReaction as any;
  },

  async getPost(postId: string) {
    const post = await PostDao.findByIdPopulated(postId);
    if (!post) throw new ApiError(404, 'Post not found');
    return post;
  },

  async deletePost(postId: string, requesterId: string) {
    const post = await PostDao.findById(postId);
    if (!post) throw new ApiError(404, 'Post not found');
    if (post.userId.toString() !== requesterId) throw new ApiError(403, 'Not authorized to delete this post');

    await PostDao.deleteById(postId);
    await CommentDao.deleteAllForPost(postId);
    await ReactionDao.deleteAllForParent('post', postId);
    await UserDao.incrementCounts(requesterId, { postsCount: -1 });

    try {
      const publicId = extractCloudinaryPublicId(post.mediaUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: post.mediaType === 'video' ? 'video' : 'image' });
      }
    } catch {
      // best-effort cleanup, matches the Dart StorageService.deleteMedia swallow-and-continue behavior
    }
  },
};
