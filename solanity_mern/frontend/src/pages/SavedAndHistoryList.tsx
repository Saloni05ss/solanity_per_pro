import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Post } from '../types';
import { getSaved, getHistory, removeSaved, removeHistory } from './Profile';

export default function SavedAndHistoryList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { uid } = useParams<{ uid: string }>();
  const isSavedPage = location.pathname.startsWith('/saved');

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!uid) return;
    setPosts(isSavedPage ? getSaved(uid) : getHistory(uid));
  }, [isSavedPage, uid]);

  function handleClearAll() {
    if (!uid) return;
    const key = isSavedPage ? `saved_posts_${uid}` : `view_history_${uid}`;
    localStorage.setItem(key, '[]');
    setPosts([]);
  }

  function handleRemove(postId: string) {
    if (!uid) return;
    const updated = isSavedPage ? removeSaved(uid, postId) : removeHistory(uid, postId);
    setPosts(updated);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">
          {isSavedPage ? '🔖 Saved Posts' : '🕑 View History'}
        </h1>
        {posts.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-16 text-center">
          <p className="text-2xl mb-2">{isSavedPage ? '🔖' : '🕑'}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
            {isSavedPage ? 'No saved posts yet' : 'No history yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {posts.map((post) => {
            const thumb = post.mediaType === 'image' ? post.mediaUrl : null;
            return (
              <div
                key={post._id}
                className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[9/16]"
              >
                {/* Thumbnail */}
                {thumb ? (
                  <img
                    src={thumb}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                    onClick={() => navigate(`/post/${post._id}`)}
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center text-3xl gap-1.5 cursor-pointer"
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    {post.mediaType === 'video' ? '🎬' : '📄'}
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 px-1.5 text-center line-clamp-2">
                      {post.caption}
                    </span>
                  </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Caption */}
                <p
                  className="absolute bottom-6 left-1.5 right-1.5 text-[10px] text-white font-semibold line-clamp-2 leading-tight drop-shadow cursor-pointer"
                  onClick={() => navigate(`/post/${post._id}`)}
                >
                  {post.caption || 'Untitled'}
                </p>

                {/* Remove button (bottom) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(post._id); }}
                  className="absolute bottom-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-black/50 hover:bg-red-600 text-white text-[10px] transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  ✕
                </button>

                {/* View post overlay on hover */}
                <Link
                  to={`/post/${post._id}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold text-white">
                    View Post
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
