import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  auth: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null
  },
};

export const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setUser: (currentSlice, action) => {
      currentSlice.auth.user = action.payload;
    },
    setTokens: (currentSlice, action) => {
      currentSlice.auth.accessToken = action.payload.access;
      currentSlice.auth.refreshToken = action.payload.refresh;
    },
    setLoading: (currentSlice, action) => {
      currentSlice.auth.isLoading = action.payload;
    },
    setError: (currentSlice, action) => {
      currentSlice.auth.error = action.payload;
    },
    logout: (currentSlice) => {
      currentSlice.auth.user = null;
      currentSlice.auth.accessToken = null;
      currentSlice.auth.refreshToken = null;
      currentSlice.auth.error = null;
    }
  },
});

export const { setUser, setTokens, setLoading, setError, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
