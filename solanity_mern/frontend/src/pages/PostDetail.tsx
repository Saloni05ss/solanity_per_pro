import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchPostById } from '../features/posts/postsSlice';
import { api } from '../api/axios';
import { REACTION_EMOJI } from '../types';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Read post from Redux store to react instantly to updates
  const post = useAppSelector((s) => s.posts.items.find((p) => p._id === postId));
  const user = useAppSelector((s) => s.auth.user);

  const [reactions, setReactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'comments' | 'likes'>('comments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the post from backend on mount
  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    dispatch(fetchPostById(postId))
      .unwrap()
      .catch((err: any) => {
        setError(err || 'Failed to load post');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [postId, dispatch]);

  // Fetch reactions list whenever post ID or user's reaction status changes
  useEffect(() => {
    if (!postId) return;
    api.get(`/reactions/post/${postId}`)
      .then((res) => {
        setReactions(res.data.reactions || []);
      })
      .catch((err) => console.error('Failed to load reactions', err));
  }, [postId, post?.myReaction]);

  // Save to viewed history in localStorage (user-specific)
  useEffect(() => {
    if (!post || !user?.uid) return;
    try {
      const key = `view_history_${user.uid}`;
      const historyStr = localStorage.getItem(key) || '[]';
      let history = JSON.parse(historyStr);
      history = history.filter((h: any) => h._id !== post._id);
      history.unshift(post);
      if (history.length > 50) history = history.slice(0, 50);
      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to log history', e);
    }
  }, [post, user?.uid]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-red-500 font-semibold mb-4">{error || 'Post not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        ← Back
      </button>

      {/* Post Card details mode */}
      <PostCard post={post} isDetail={true} />

      {/* Tab bar */}
      <div className="mt-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'comments'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Comments ({post.commentsCount})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'likes'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Reactions ({reactions.length})
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-800/80 bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
        {activeTab === 'comments' ? (
          <CommentSection postId={post._id} />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-850">
            {reactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No reactions yet</p>
            ) : (
              reactions.map((r: any) => (
                <div key={r._id} className="flex items-center justify-between p-4">
                  <Link to={`/profile/${r.userId}`} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={r.useravatarurl || `https://ui-avatars.com/api/?name=${r.userName}`}
                        alt={r.userName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-xs shadow-sm">
                        {REACTION_EMOJI[r.type as keyof typeof REACTION_EMOJI] || '👌'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {r.userName}
                    </span>
                  </Link>
                  <span className="text-xs uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    {r.type}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
