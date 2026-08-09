import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

function extractError(err: any): string {
  return err?.response?.data?.message || 'Something went wrong';
}

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { email: string; password: string; username: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/signup', data);
      return res.data as { token: string; user: User };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const signin = createAsyncThunk(
  'auth/signin',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/signin', data);
      return res.data as { token: string; user: User };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (credential: string, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/google', { credential });
      return res.data as { token: string; user: User };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchMe = createAsyncThunk('auth/me', async (_: void, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data.user as User;
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { username?: string; useravatarurl?: string }, { rejectWithValue }) => {
    try {
      const res = await api.patch('/auth/profile', data);
      return res.data.user as User;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.status = 'idle';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(signin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signin.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.status = 'idle';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(signin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(googleLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.status = 'idle';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
