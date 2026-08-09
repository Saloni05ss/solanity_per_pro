import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  addComment,
  deleteComment,
  fetchReplies,
  fetchTopLevelComments,
} from '../features/comments/commentsSlice';
import { Comment } from '../types';

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function Avatar({ name, url, size = 8 }: { name: string; url?: string | null; size?: number }) {
  const sizeClass = size === 7 ? 'h-7 w-7' : 'h-8 w-8';
  return (
    <img
      src={url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=64&background=random`}
      alt={name}
      className={`${sizeClass} flex-shrink-0 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700`}
      style={{ minWidth: size === 7 ? 28 : 32, minHeight: size === 7 ? 28 : 32 }}
    />
  );
}

interface CommentRowProps {
  comment: Comment;
  postId: string;
  isReply?: boolean;
}

function CommentRow({ comment, postId, isReply = false }: CommentRowProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const replies = useAppSelector((s) => s.comments.repliesByCommentId[comment._id] ?? []);
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const replyInputRef = useRef<HTMLInputElement>(null);

  function toggleReplies() {
    if (!showReplies && replies.length === 0 && comment.repliesCount > 0) {
      dispatch(fetchReplies(comment._id));
    }
    setShowReplies((s) => !s);
  }

  function handleReplyClick() {
    setReplying((r) => !r);
    setTimeout(() => replyInputRef.current?.focus(), 50);
  }

  function submitReply(e: FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    dispatch(
      addComment({ postId, text: replyText, parentCommentId: comment._id, replyingToUser: comment.userName })
    );
    setReplyText('');
    setReplying(false);
    if (!showReplies) setShowReplies(true);
  }

  const isOwner = user?.uid === comment.userId;

  return (
    <div className={`flex gap-2.5 ${isReply ? 'py-2' : 'py-3'}`}>
      <Avatar name={comment.userName} url={comment.useravatarurl} size={isReply ? 7 : 8} />

      <div className="flex-1 min-w-0">
        {/* Comment bubble */}
        <div className="rounded-2xl rounded-tl-sm bg-gray-50 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 px-3.5 py-2.5">
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-0.5">{comment.userName}</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed break-words">
            {comment.replyingToUser && (
              <span className="mr-1 font-semibold text-brand-600 dark:text-brand-400">
                @{comment.replyingToUser}
              </span>
            )}
            {comment.text}
          </p>
        </div>

        {/* Action row */}
        <div className="mt-1.5 flex items-center gap-3 px-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500">
          <span>{timeAgo(comment.createdAt)}</span>

          {user && (
            <button
              onClick={handleReplyClick}
              className={`transition-colors ${replying ? 'text-brand-500' : 'hover:text-brand-500'}`}
            >
              Reply
            </button>
          )}

          {!isReply && comment.repliesCount > 0 && (
            <button onClick={toggleReplies} className="hover:text-brand-500 transition-colors">
              {showReplies ? '▾ Hide' : '▸ View'} {comment.repliesCount}{' '}
              {comment.repliesCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => dispatch(deleteComment({ postId, commentId: comment._id }))}
              className="ml-auto text-red-400 hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          )}
        </div>

        {/* Reply input */}
        {replying && (
          <form onSubmit={submitReply} className="mt-2 flex items-center gap-2">
            <input
              ref={replyInputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.userName}...`}
              className="flex-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-brand-500 focus:outline-none transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 disabled:opacity-40 transition-colors"
            >
              Post
            </button>
            <button
              type="button"
              onClick={() => setReplying(false)}
              className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Nested replies */}
        {!isReply && showReplies && (
          <div className="mt-2 space-y-0 border-l-2 border-brand-100 dark:border-brand-900/50 pl-3">
            {replies.length === 0 ? (
              <p className="py-2 text-xs text-gray-400 dark:text-gray-500">Loading replies...</p>
            ) : (
              replies.map((r) => (
                <CommentRow key={r._id} comment={r} postId={postId} isReply={true} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId }: { postId: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const comments = useAppSelector((s) => s.comments.byPostId[postId] ?? []);
  const [text, setText] = useState('');

  useEffect(() => {
    dispatch(fetchTopLevelComments(postId));
  }, [dispatch, postId]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch(addComment({ postId, text }));
    setText('');
  }

  return (
    <div className="px-4 py-4">
      {/* Comment input */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2.5">
          <Avatar name={user.username} url={user.useravatarurl} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white px-4 py-2 text-sm font-bold transition-all"
          >
            Post
          </button>
        </form>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="divide-y divide-gray-100/60 dark:divide-gray-800/60">
          {comments.map((c) => (
            <CommentRow key={c._id} comment={c} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
