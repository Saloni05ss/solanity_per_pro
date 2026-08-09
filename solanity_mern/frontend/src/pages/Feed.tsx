import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchFeedPage, resetFeed } from '../features/posts/postsSlice';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

export default function Feed() {
  const dispatch = useAppDispatch();
  const { items, nextCursor, hasMore, status } = useAppSelector((s) => s.posts);
  const [showCreate, setShowCreate] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Load the very first page once
  useEffect(() => {
    dispatch(resetFeed());
    dispatch(fetchFeedPage(null));
  }, [dispatch]);

  // Infinite Scroll Trigger
  useEffect(() => {
    if (status === 'loading' || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        dispatch(fetchFeedPage(nextCursor));
      }
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [dispatch, hasMore, nextCursor, status]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 relative">
      {/* Floating Create Post Button */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 font-extrabold text-2xl"
        title="Create post"
      >
        ＋
      </button>

      <div className="space-y-6">
        {items.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-8" />}

      {status === 'loading' && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="py-8 text-center text-sm font-medium text-gray-400 dark:text-gray-500">
          You're all caught up 🎉
        </p>
      )}
      {!hasMore && items.length === 0 && status !== 'loading' && (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No posts yet. Be the first to share your eco-inspiration!
          </p>
        </div>
      )}

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
