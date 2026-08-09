import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { deletePost, reactToPost, removePostReaction, sharePost } from '../features/posts/postsSlice';
import { Post, ReactionType, User } from '../types';
import ReactionPicker from './ReactionPicker';

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface PostCardProps {
  post: Post;
  isDetail?: boolean;
}

export default function PostCard({ post, isDetail = false }: PostCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [isSharing, setIsSharing] = useState(false);
  
  const myReaction = post.myReaction || null;

  const author = typeof post.userId === 'string' ? null : (post.userId as User);
  const isOwner = author && user && author.uid === user.uid;

  const [isSaved, setIsSaved] = useState(() => {
    if (!user?.uid) return false;
    const savedStr = localStorage.getItem(`saved_posts_${user.uid}`) || '[]';
    const saved: Post[] = JSON.parse(savedStr);
    return saved.some((p) => p._id === post._id);
  });

  function handleReact(type: ReactionType) {
    if (myReaction === type) {
      dispatch(removePostReaction(post._id));
    } else {
      dispatch(reactToPost({ postId: post._id, type }));
    }
  }

  function handleMediaDoubleClick() {
    if (!myReaction) {
      dispatch(reactToPost({ postId: post._id, type: 'like' }));
    }
    if (!isDetail) {
      navigate(`/post/${post._id}`);
    }
  }

  function handleCommentAction() {
    if (!isDetail) {
      navigate(`/post/${post._id}`);
    }
  }

  function handleSaveToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user?.uid) return;
    const key = `saved_posts_${user.uid}`;
    const savedStr = localStorage.getItem(key) || '[]';
    let saved: Post[] = JSON.parse(savedStr);
    if (isSaved) {
      saved = saved.filter((p) => p._id !== post._id);
      setIsSaved(false);
    } else {
      saved.unshift(post);
      setIsSaved(true);
    }
    localStorage.setItem(key, JSON.stringify(saved));
  }

  async function handleShare() {
    if (isSharing) return;

    const shareUrl = `${window.location.origin}/post/${post._id}`;
    const shareText = post.caption?.trim() || 'Check out this post on Solanity';

    try {
      setIsSharing(true);

      if (navigator.share) {
        await navigator.share({
          title: 'Solanity post',
          text: shareText,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt('Copy this link', shareUrl);
      }

      dispatch(sharePost(post._id));
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Share failed', error);
      }
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800/80 dark:bg-[#111827] transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-3.5">
        <Link to={`/profile/${author?.uid ?? ''}`} className="flex items-center gap-2.5">
          <img
            src={author?.useravatarurl || `https://ui-avatars.com/api/?name=${author?.username ?? 'U'}`}
            alt={author?.username}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
          />
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{author?.username ?? 'Unknown'}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <button
            onClick={() => dispatch(deletePost(post._id))}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            Delete
          </button>
        )}
      </div>

      {post.caption && (
        <p
          onClick={handleCommentAction}
          className={`px-4 pb-3.5 text-[14px] leading-relaxed text-gray-800 dark:text-gray-200 ${
            !isDetail ? 'cursor-pointer hover:text-gray-950 dark:hover:text-white' : ''
          }`}
        >
          {post.caption}
        </p>
      )}

      <div
        onDoubleClick={handleMediaDoubleClick}
        className={`relative overflow-hidden bg-gray-50 dark:bg-gray-950/50 ${
          !isDetail ? 'cursor-pointer' : ''
        }`}
      >
        {post.mediaType === 'video' ? (
          <video src={post.mediaUrl} controls className="max-h-[520px] w-full bg-black object-contain mx-auto" />
        ) : post.mediaType === 'pdf' ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 dark:bg-gray-900/50 text-center border-y border-gray-100 dark:border-gray-800">
            <span className="text-5xl mb-3">📄</span>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">PDF Document</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[280px] truncate">{post.mediaUrl.split('/').pop()}</p>
            <a
              href={post.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 text-xs font-bold shadow-sm transition-all duration-200"
            >
              Open PDF
            </a>
          </div>
        ) : (
          <img src={post.mediaUrl} alt="post media" className="max-h-[520px] w-full object-cover mx-auto hover:scale-[1.01] transition-transform duration-500" />
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
        <span
          onClick={handleCommentAction}
          className={`hover:text-brand-500 transition-colors ${!isDetail ? 'cursor-pointer' : ''}`}
        >
          {post.likesCount} reactions
        </span>
        <span className="flex gap-4">
          <span
            onClick={handleCommentAction}
            className={`hover:text-brand-500 transition-colors ${!isDetail ? 'cursor-pointer' : ''}`}
          >
            {post.commentsCount} comments
          </span>
          <span>{post.sharesCount} shares</span>
        </span>
      </div>

      <div className="flex items-center justify-around border-t border-gray-100 dark:border-gray-800/80 px-2 py-1 bg-gray-50/50 dark:bg-gray-900/20">
        <ReactionPicker onReact={handleReact} activeType={myReaction} />
        <button
          onClick={handleCommentAction}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          💬 Comment
        </button>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSharing ? 'Sharing…' : '🔁 Share'}
        </button>
        <button
          onClick={handleSaveToggle}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
            isSaved
              ? 'text-yellow-600 bg-yellow-50/50 dark:text-yellow-400 dark:bg-yellow-950/20'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save post'}
        >
          🔖 {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  );
}
