import { createSlice } from '@reduxjs/toolkit';

export const teamSlice = createSlice({
  name: 'teamSlice',
  initialState: {
    teamName: '',
    homeStadium: '',
    players: [],
    formSubmitted: false
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

    saveTeam: (state) => {
      // Set submitted flag to true
      state.formSubmitted = true;
      
      // Simulate sending data to the backend
      console.log('Saving team to backend:', {
        teamName: state.teamName,
        homeStadium: state.homeStadium,
        players: state.players,
      });

      // Clear form data only after successful submission to backend
      // Will be done in a separate action now so we can better control it
    },
    clearFormData: (state) => {
      // Reset state after successfully sending to backend
      state.teamName = '';
      state.homeStadium = '';
      state.players = [];
      state.formSubmitted = false;
    },
    clearFormSubmittedFlag: (state) => {
      state.formSubmitted = false;
    }
  },
});

export const { 
  setTeamName, 
  setHomeStadium, 
  addPlayer, 
  updatePlayer, 
  deletePlayer, 
  saveTeam,
  clearFormData,
  clearFormSubmittedFlag
} = teamSlice.actions;

export const teamReducer = teamSlice.reducer;