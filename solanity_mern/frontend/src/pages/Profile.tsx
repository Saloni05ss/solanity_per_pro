import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { api } from '../api/axios';
import { Post, User } from '../types';
import { checkIsFollowing, followUser, unfollowUser } from '../features/follow/followSlice';
import { updateProfile } from '../features/auth/authSlice';
import PostCard from '../components/PostCard';

/* ─── localStorage helpers (user-scoped) ──────────────────────────── */
export function savedKey(uid: string) { return `saved_posts_${uid}`; }
export function historyKey(uid: string) { return `view_history_${uid}`; }

export function getSaved(uid: string): Post[] {
  try { return JSON.parse(localStorage.getItem(savedKey(uid)) || '[]'); } catch { return []; }
}
export function getHistory(uid: string): Post[] {
  try { return JSON.parse(localStorage.getItem(historyKey(uid)) || '[]'); } catch { return []; }
}
export function removeSaved(uid: string, postId: string) {
  const updated = getSaved(uid).filter((p) => p._id !== postId);
  localStorage.setItem(savedKey(uid), JSON.stringify(updated));
  return updated;
}
export function removeHistory(uid: string, postId: string) {
  const updated = getHistory(uid).filter((p) => p._id !== postId);
  localStorage.setItem(historyKey(uid), JSON.stringify(updated));
  return updated;
}

/* ─── Thumbnail card with 3-dot menu ──────────────────────────────── */
function GridCard({
  post,
  uid,
  storageType,
  onRemove,
}: {
  post: Post;
  uid: string;
  storageType: 'saved' | 'history';
  onRemove: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    if (storageType === 'saved') removeSaved(uid, post._id);
    else removeHistory(uid, post._id);
    onRemove(post._id);
  }

  const thumb =
    post.mediaType === 'image' ? post.mediaUrl :
    post.mediaType === 'video' ? null :
    null;

  return (
    <div className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[9/16] cursor-pointer">
      {/* Thumbnail */}
      {thumb ? (
        <img
          src={thumb}
          alt={post.caption}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={() => navigate(`/post/${post._id}`)}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center text-4xl gap-2"
          onClick={() => navigate(`/post/${post._id}`)}
        >
          {post.mediaType === 'video' ? '🎬' : '📄'}
          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 text-center line-clamp-2">
            {post.caption}
          </span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Caption at bottom */}
      <p
        className="absolute bottom-2 left-2 right-8 text-[11px] text-white font-semibold line-clamp-2 leading-tight drop-shadow"
        onClick={() => navigate(`/post/${post._id}`)}
      >
        {post.caption || 'Untitled'}
      </p>

      {/* 3-dot menu button */}
      <div ref={menuRef} className="absolute top-1.5 right-1.5 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          className="flex items-center justify-center h-6 w-6 rounded-full bg-black/40 hover:bg-black/60 text-white text-lg leading-none transition-colors"
          title="Options"
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 w-32 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e2535] shadow-xl overflow-hidden animate-fade-in z-20">
            <button
              onClick={handleRemove}
              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              🗑 Remove
            </button>
            <Link
              to={storageType === 'saved' ? `/saved/${uid}` : `/history/${uid}`}
              className="block px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              📋 View All
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Profile page ────────────────────────────────────────────── */
export default function Profile() {
  const { uid } = useParams<{ uid: string }>();
  const dispatch = useAppDispatch();
  const { user: me } = useAppSelector((s) => s.auth);
  const isFollowing = useAppSelector((s) => (uid ? s.follow.followingIds[uid] : false));

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [viewHistory, setViewHistory] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = me?.uid === uid;

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    Promise.all([api.get(`/users/${uid}`), api.get(`/posts/user/${uid}`)])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data.user);
        setPosts(postsRes.data.posts);
      })
      .finally(() => setLoading(false));

    if (!isOwnProfile) dispatch(checkIsFollowing(uid));
  }, [uid, dispatch, isOwnProfile]);

  // Load user-specific saved/history
  useEffect(() => {
    if (isOwnProfile && uid) {
      setSavedPosts(getSaved(uid).slice(0, 6));
      setViewHistory(getHistory(uid).slice(0, 6));
    }
  }, [isOwnProfile, uid]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch(updateProfile({ useravatarurl: res.data.useravatarurl }));
    setProfile((p) => (p ? { ...p, useravatarurl: res.data.useravatarurl } : p));
  }

  if (loading) return <p className="py-10 text-center text-gray-400">Loading profile...</p>;
  if (!profile) return <p className="py-10 text-center text-gray-400">User not found</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Profile header card */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-[#111827]">
        <div className="relative">
          <img
            src={profile.useravatarurl || `https://ui-avatars.com/api/?name=${profile.username}`}
            alt={profile.username}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-50 dark:ring-gray-900"
          />
          {isOwnProfile && (
            <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-brand-600 p-2 text-white shadow-md hover:bg-brand-700 hover:scale-105 transition-all">
              ✎
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{profile.username}</h1>
          <div className="mt-2.5 flex justify-center sm:justify-start gap-5 text-sm text-gray-500 dark:text-gray-400">
            <span><strong className="text-gray-900 dark:text-gray-100 font-bold">{profile.postsCount}</strong> posts</span>
            <span><strong className="text-gray-900 dark:text-gray-100 font-bold">{profile.followersCount}</strong> followers</span>
            <span><strong className="text-gray-900 dark:text-gray-100 font-bold">{profile.followingCount}</strong> following</span>
          </div>
        </div>

        {!isOwnProfile && uid && (
          <button
            onClick={async () => {
              if (isFollowing) {
                await dispatch(unfollowUser(uid));
                setProfile((p) => p ? { ...p, followersCount: Math.max(0, p.followersCount - 1) } : null);
              } else {
                await dispatch(followUser(uid));
                setProfile((p) => p ? { ...p, followersCount: p.followersCount + 1 } : null);
              }
            }}
            className={`w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Saved & History grids – own profile only */}
      {isOwnProfile && uid && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Saved Posts */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800/80 dark:bg-[#111827]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Saved Posts</h2>
              <Link to={`/saved/${uid}`} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                View All
              </Link>
            </div>
            {savedPosts.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">No saved posts yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {savedPosts.map((p) => (
                  <GridCard
                    key={p._id}
                    post={p}
                    uid={uid}
                    storageType="saved"
                    onRemove={(id) => setSavedPosts((prev) => prev.filter((x) => x._id !== id))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* View History */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800/80 dark:bg-[#111827]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">View History</h2>
              <Link to={`/history/${uid}`} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                View All
              </Link>
            </div>
            {viewHistory.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">No history yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {viewHistory.map((p) => (
                  <GridCard
                    key={p._id}
                    post={p}
                    uid={uid}
                    storageType="history"
                    onRemove={(id) => setViewHistory((prev) => prev.filter((x) => x._id !== id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User posts feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No posts yet</p>
        </div>
      )}
    </div>
  );
}
