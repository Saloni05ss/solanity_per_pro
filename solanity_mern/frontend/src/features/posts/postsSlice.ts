import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import { FeedResponse, Post, ReactionType } from '../../types';

interface PostsState {
  items: Post[];
  nextCursor: string | null;
  hasMore: boolean;
  status: 'idle' | 'loading' | 'failed';
  createStatus: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  nextCursor: null,
  hasMore: true,
  status: 'idle',
  createStatus: 'idle',
  error: null,
};

function extractError(err: any): string {
  return err?.response?.data?.message || 'Something went wrong';
}

// Infinite-scroll feed page — cursor comes from the previous page's nextCursor
export const fetchFeedPage = createAsyncThunk(
  'posts/fetchFeedPage',
  async (cursor: string | null | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get<FeedResponse>('/posts/feed', {
        params: { limit: 10, ...(cursor ? { cursor } : {}) },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.post as Post;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchById',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/posts/${postId}`);
      return res.data.post as Post;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const reactToPost = createAsyncThunk(
  'posts/react',
  async ({ postId, type }: { postId: string; type: ReactionType }, { rejectWithValue }) => {
    try {
      await api.post(`/reactions/post/${postId}`, { type });
      return { postId, type };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const removePostReaction = createAsyncThunk(
  'posts/removeReaction',
  async (postId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/reactions/post/${postId}`);
      return postId;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const sharePost = createAsyncThunk(
  'posts/share',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/posts/${postId}/share`);
      return { postId, sharesCount: res.data.sharesCount as number };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetFeed(state) {
      state.items = [];
      state.nextCursor = null;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedPage.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFeedPage.fulfilled, (state, action: PayloadAction<FeedResponse>) => {
        state.status = 'idle';
        // De-dupe in case the same page is fetched twice (e.g. StrictMode double effect)
        const existingIds = new Set(state.items.map((p) => p._id));
        const fresh = action.payload.posts.filter((p) => !existingIds.has(p._id));
        state.items.push(...fresh);
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchFeedPage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createPost.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.createStatus = 'idle';
        state.items.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(fetchPostById.fulfilled, (state, action: PayloadAction<Post>) => {
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(reactToPost.fulfilled, (state, action) => {
        const post = state.items.find((p) => p._id === action.payload.postId);
        if (post) {
          if (post.myReaction) {
            post.reactionsCount[post.myReaction] = Math.max(0, (post.reactionsCount[post.myReaction] ?? 1) - 1);
          }
          post.reactionsCount[action.payload.type] = (post.reactionsCount[action.payload.type] ?? 0) + 1;
          post.likesCount = Object.values(post.reactionsCount).reduce((a, b) => a + b, 0);
          post.myReaction = action.payload.type;
        }
      })
      .addCase(removePostReaction.fulfilled, (state, action) => {
        const post = state.items.find((p) => p._id === action.payload);
        if (post && post.myReaction) {
          post.reactionsCount[post.myReaction] = Math.max(0, (post.reactionsCount[post.myReaction] ?? 1) - 1);
          post.likesCount = Object.values(post.reactionsCount).reduce((a, b) => a + b, 0);
          post.myReaction = null;
        }
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        const post = state.items.find((p) => p._id === action.payload.postId);
        if (post) post.sharesCount = action.payload.sharesCount;
      });
  },
});

export const { resetFeed } = postsSlice.actions;
export default postsSlice.reducer;
