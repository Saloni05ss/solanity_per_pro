import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

interface FollowState {
  followingIds: Record<string, boolean>; // userId -> am I following them
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: FollowState = {
  followingIds: {},
  status: 'idle',
  error: null,
};

function extractError(err: any): string {
  return err?.response?.data?.message || 'Something went wrong';
}

export const checkIsFollowing = createAsyncThunk(
  'follow/check',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/follow/${targetUserId}/is-following`);
      return { targetUserId, isFollowing: res.data.isFollowing as boolean };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const followUser = createAsyncThunk(
  'follow/follow',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      await api.post(`/follow/${targetUserId}`);
      return targetUserId;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'follow/unfollow',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/follow/${targetUserId}`);
      return targetUserId;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkIsFollowing.fulfilled, (state, action) => {
        state.followingIds[action.payload.targetUserId] = action.payload.isFollowing;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followingIds[action.payload] = true;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followingIds[action.payload] = false;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default followSlice.reducer;
