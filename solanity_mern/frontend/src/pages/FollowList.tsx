import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/axios';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { followUser, unfollowUser } from '../features/follow/followSlice';

interface FollowUser {
  uid: string;
  username: string;
  useravatarurl: string | null;
  isFollowing?: boolean;
}

function normalizeUser(user: any): FollowUser {
  return {
    uid: user.uid || user._id || user.id,
    username: user.username || 'Unknown',
    useravatarurl: user.useravatarurl ?? null,
    isFollowing: user.isFollowing ?? false,
  };
}

export default function FollowList() {
  const { uid } = useParams<{ uid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: me } = useAppSelector((s) => s.auth);
  
  const isFollowersPage = location.pathname.endsWith('/followers');
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);

    api
      .get(`/follow/${uid}/${isFollowersPage ? 'followers' : 'following'}`)
      .then((res) => {
        setUsers((res.data.users || []).map(normalizeUser));
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load data');
      })
      .finally(() => setLoading(false));
  }, [uid, isFollowersPage]);

  const handleFollowToggle = async (targetUser: FollowUser) => {
    if (!me) {
      navigate('/login');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [targetUser.uid]: true }));
    try {
      if (targetUser.isFollowing) {
        await dispatch(unfollowUser(targetUser.uid)).unwrap();
        setUsers((prev) =>
          prev.map((u) =>
            u.uid === targetUser.uid ? { ...u, isFollowing: false } : u
          )
        );
      } else {
        await dispatch(followUser(targetUser.uid)).unwrap();
        setUsers((prev) =>
          prev.map((u) =>
            u.uid === targetUser.uid ? { ...u, isFollowing: true } : u
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUser.uid]: false }));
    }
  };

  const title = isFollowersPage ? 'Followers' : 'Following';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">{title}</h1>
        <Link
          to={`/profile/${uid}`}
          className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          View profile
        </Link>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-[#111827]">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading {title.toLowerCase()}…</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
            <p className="text-2xl mb-3">{isFollowersPage ? '👥' : '➡️'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">No {title.toLowerCase()} yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {users.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between gap-4 px-2 py-3 transition-all duration-205 hover:bg-gray-50/50 dark:hover:bg-gray-800/35 rounded-2xl"
              >
                <Link
                  to={`/profile/${user.uid}`}
                  className="flex items-center gap-4 min-w-0 flex-1 group"
                >
                  <img
                    src={user.useravatarurl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                    alt={user.username}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-850 group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View profile</p>
                  </div>
                </Link>

                {me && me.uid !== user.uid && (
                  <button
                    onClick={() => handleFollowToggle(user)}
                    disabled={actionLoading[user.uid]}
                    className={`rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all duration-200 shrink-0 ${
                      user.isFollowing
                        ? 'bg-gray-150 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        : 'bg-brand-600 text-white hover:bg-brand-700'
                    } disabled:opacity-50`}
                  >
                    {actionLoading[user.uid]
                      ? '...'
                      : user.isFollowing
                      ? 'Following'
                      : 'Follow'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
