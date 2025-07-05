import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "";

// Async thunk to fetch all teams
export const fetchTeams = createAsyncThunk(
  'teamList/fetchTeams',
  async () => {
    try {
      const response = await fetch(`${API_BASE}/api/teams/all-stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      // Transform the API data to match our component's expected format
      return data.map(team => ({
        id: team.id,
        name: team.team_name,
        homeStadium: team.home_stadium,
        totalPlayers: team.total_players,
        domesticPlayers: team.domestic_players,
        foreignPlayers: team.foreign_players
      }));
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
  reducers: {
    updateTeamLocally: (state, action) => {
      const { id, name, homeStadium } = action.payload;
      const teamIndex = state.teams.findIndex(team => team.id === id);
      if (teamIndex !== -1) {
        state.teams[teamIndex] = {
          ...state.teams[teamIndex],
          name,
          homeStadium
        };
      }
    }
  },
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

export const { updateTeamLocally } = teamListSlice.actions;
export default teamListSlice.reducer; 