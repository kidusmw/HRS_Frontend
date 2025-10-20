import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUser, verifyEmail, loginUser, logoutUser } from '@/features/auth/api/authApi';
import type { AuthState, LoginCredentials, RegisterData } from '@/types/auth';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isVerified: false,
  loading: false,
  error: null,
};

// Async thunks
export const registerUserThunk = createAsyncThunk(
  'auth/registerUser',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await registerUser(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  'auth/verifyEmail',
  async (url: string, { rejectWithValue }) => {
    try {
      const response = await verifyEmail(url);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (data: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await loginUser(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

// Hydrate from localStorage
export const hydrateFromStorage = createAsyncThunk(
  'auth/hydrateFromStorage',
  async () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return { token, user };
    }
    
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isVerified = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isVerified = false; // User needs to verify email
        state.isAuthenticated = false; // Not logged in yet
        state.error = null;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify email
    builder
      .addCase(verifyEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerified = true;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        state.error = null;
      })
      .addCase(verifyEmailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login user
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token || null;
        state.isAuthenticated = true;
        state.isVerified = !!action.payload.user.email_verified_at;
        state.error = null;
        
        // Persist to localStorage
        if (action.payload.access_token) {
          localStorage.setItem('auth_token', action.payload.access_token);
        }
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout user
    builder
      .addCase(logoutUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.error = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      })
      .addCase(logoutUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Hydrate from storage
    builder
      .addCase(hydrateFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.isVerified = !!action.payload.user.email_verified_at;
        }
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
