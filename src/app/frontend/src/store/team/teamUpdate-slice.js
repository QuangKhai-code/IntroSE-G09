import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamApi } from '../../api/team';

// Async thunks
export const updateTeam = createAsyncThunk(
  'teamUpdate/updateTeam',
  async ({ teamId, teamData }) => {
    try {
      const response = await teamApi.updateTeam(teamId, teamData);
      return response;
    } catch (error) {
      if (error.detail) {
        throw error.detail;
      }
      throw error;
    }
  }
);

export const addPlayer = createAsyncThunk(
  'teamUpdate/addPlayer',
  async ({ teamId, playerData }) => {
    try {
      const response = await teamApi.addPlayer(teamId, playerData);
      return response;
    } catch (error) {
      if (error.detail) {
        throw error.detail;
      }
      throw error;
    }
  }
);

export const removePlayer = createAsyncThunk(
  'teamUpdate/removePlayer',
  async ({ teamId, playerId }) => {
    try {
      await teamApi.removePlayer(teamId, playerId);
      return { teamId, playerId };
    } catch (error) {
      if (error.detail) {
        throw error.detail;
      }
      throw error;
    }
  }
);

export const updatePlayer = createAsyncThunk(
  'teamUpdate/updatePlayer',
  async ({ teamId, playerId, playerData }) => {
    try {
      const response = await teamApi.updatePlayer(teamId, playerId, playerData);
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
  status: 'idle',
  error: null,
  currentTeam: null
};

const teamUpdateSlice = createSlice({
  name: 'teamUpdate',
  initialState,
  reducers: {
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
    },
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Update Team
      .addCase(updateTeam.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Add Player
      .addCase(addPlayer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addPlayer.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(addPlayer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Remove Player
      .addCase(removePlayer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(removePlayer.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(removePlayer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Update Player
      .addCase(updatePlayer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updatePlayer.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updatePlayer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setCurrentTeam, clearCurrentTeam } = teamUpdateSlice.actions;
export default teamUpdateSlice.reducer; 