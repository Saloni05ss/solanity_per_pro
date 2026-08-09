import { FormEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createPost } from '../features/posts/postsSlice';

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { createStatus, error } = useAppSelector((s) => s.posts);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('media', file);

    const result = await dispatch(createPost(formData));
    if (createPost.fulfilled.match(result)) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xl dark:border-gray-850 dark:bg-[#111827]">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-2.5">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Create post</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Share something interesting or eco-friendly..."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30 p-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
          />

          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
              {file?.type.startsWith('video') ? (
                <video src={preview} controls className="max-h-64 w-full rounded-lg object-contain mx-auto" />
              ) : file?.type === 'application/pdf' ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-4xl mb-2">📄</span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF</p>
                </div>
              ) : (
                <img src={preview} alt="preview" className="max-h-64 w-full rounded-lg object-cover mx-auto" />
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 rounded-full bg-black/60 hover:bg-black/85 p-1.5 text-white transition-all text-xs"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 py-8 cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 transition-colors">
              <span className="text-3xl">📸</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Upload photo, video, or PDF</span>
              <input
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={!file || createStatus === 'loading'}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200"
          >
            {createStatus === 'loading' ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
