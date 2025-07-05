import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "";

// Create async thunk for saving team
export const saveTeamAsync = createAsyncThunk(
  'teamSlice/saveTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/teams/`, teamData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const teamSlice = createSlice({
  name: 'teamSlice',
  initialState: {
    teamName: '',
    homeStadium: '',
    players: [],
    formSubmitted: false,
    error: null,
    loading: false
  },
  reducers: {
    setTeamName: (state, action) => {
      state.teamName = action.payload;
    },

    setHomeStadium: (state, action) => {
      state.homeStadium = action.payload;
    },

    addPlayer: (state, action) => {
      state.players.push(action.payload);
    },

    updatePlayer: (state, action) => {
      const { index, player } = action.payload;
      state.players[index] = player;
    },

    deletePlayer: (state, action) => {
      state.players.splice(action.payload, 1);
    },

    clearFormData: (state) => {
      state.teamName = '';
      state.homeStadium = '';
      state.players = [];
      state.formSubmitted = false;
      state.error = null;
    },

    clearFormSubmittedFlag: (state) => {
      state.formSubmitted = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveTeamAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTeamAsync.fulfilled, (state) => {
        state.loading = false;
        state.formSubmitted = true;
        window.dispatchEvent(new CustomEvent('teamSaved'));
      })
      .addCase(saveTeamAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.formSubmitted = false;
      });
  }
});

export const { 
  setTeamName, 
  setHomeStadium, 
  addPlayer, 
  updatePlayer, 
  deletePlayer, 
  clearFormData,
  clearFormSubmittedFlag
} = teamSlice.actions;

export const teamReducer = teamSlice.reducer;