import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "";

export const createMatch = createAsyncThunk(
  'matches/createMatch',
  async (matchData) => {
    try {
      console.log(matchData);
      const response = await axios.post(`${API_BASE}/api/matches/`, matchData);
      return response.data;
    } catch (error) {
      throw error.response  || error.message;
    }
  }
);

const initialState = {
  status: 'idle',
  error: null,
  createdMatch: null
};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    clearCreatedMatch: (state) => {
      state.createdMatch = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMatch.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.createdMatch = action.payload;
        state.error = null;
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { clearCreatedMatch } = matchesSlice.actions;
export default matchesSlice.reducer; 