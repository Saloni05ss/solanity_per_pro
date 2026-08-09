export interface User {
  uid: string;
  email?: string;
  username: string;
  useravatarurl: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt?: string;
}

export interface Post {
  _id: string;
  userId: User | string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'pdf';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  reactionsCount: Record<string, number>;
  myReaction?: ReactionType | null;
  createdAt: string;
}

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad';

export const REACTION_EMOJI: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
};

export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  userName: string;
  useravatarurl: string | null;
  text: string;
  parentCommentId: string | null;
  rootCommentId: string | null;
  replyingToUser: string | null;
  repliesCount: number;
  likesCount: number;
  reactionsCount: Record<string, number>;
  createdAt: string;
}

export interface FeedResponse {
  success: boolean;
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}
