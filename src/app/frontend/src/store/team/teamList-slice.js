import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamApi } from '../../api/team';

// Async thunk to fetch all teams
export const fetchTeams = createAsyncThunk(
  'teamList/fetchTeams',
  async () => {
    try {
      const response = await teamApi.getAllTeams();
      return response;
    } catch (error) {
      if (error.detail) {
        throw error.detail;
      }
      throw error;
    }
  }
);

const initialState = {
  teams: [],
  status: 'idle',
  error: null
};

const teamListSlice = createSlice({
  name: 'teamList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.teams = action.payload;
        state.error = null;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default teamListSlice.reducer; 