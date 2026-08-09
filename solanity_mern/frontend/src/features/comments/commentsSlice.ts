import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import { Comment } from '../../types';

interface CommentsState {
  byPostId: Record<string, Comment[]>;
  repliesByCommentId: Record<string, Comment[]>;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: CommentsState = {
  byPostId: {},
  repliesByCommentId: {},
  status: 'idle',
  error: null,
};

function extractError(err: any): string {
  return err?.response?.data?.message || 'Something went wrong';
}

export const fetchTopLevelComments = createAsyncThunk(
  'comments/fetchTopLevel',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      return { postId, comments: res.data.comments as Comment[] };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchReplies = createAsyncThunk(
  'comments/fetchReplies',
  async (commentId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/comments/${commentId}/replies`);
      return { commentId, replies: res.data.replies as Comment[] };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/add',
  async (
    payload: { postId: string; text: string; parentCommentId?: string; replyingToUser?: string },
    { rejectWithValue }
  ) => {
    try {
      const { postId, ...body } = payload;
      const res = await api.post(`/posts/${postId}/comments`, body);
      return { postId, comment: res.data.comment as Comment };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async ({ postId, commentId }: { postId: string; commentId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/comments/${commentId}`);
      return { postId, commentId };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopLevelComments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTopLevelComments.fulfilled, (state, action) => {
        state.status = 'idle';
        state.byPostId[action.payload.postId] = action.payload.comments;
      })
      .addCase(fetchTopLevelComments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        state.repliesByCommentId[action.payload.commentId] = action.payload.replies;
      })
      .addCase(addComment.fulfilled, (state, action: PayloadAction<{ postId: string; comment: Comment }>) => {
        const { postId, comment } = action.payload;
        if (comment.parentCommentId) {
          const rootId = comment.rootCommentId ?? comment.parentCommentId;
          const list = state.repliesByCommentId[rootId] ?? [];
          state.repliesByCommentId[rootId] = [...list, comment];
          const parent = state.byPostId[postId]?.find((c) => c._id === comment.parentCommentId);
          if (parent) parent.repliesCount += 1;
        } else {
          state.byPostId[postId] = [comment, ...(state.byPostId[postId] ?? [])];
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        state.byPostId[postId] = (state.byPostId[postId] ?? []).filter((c) => c._id !== commentId);
        delete state.repliesByCommentId[commentId];
      });
  },
});

export default commentsSlice.reducer;
