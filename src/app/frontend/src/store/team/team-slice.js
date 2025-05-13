import { createSlice } from '@reduxjs/toolkit';

export const teamSlice = createSlice({
  name: 'teamSlice',
  initialState: {
    teamName: '',
    homeStadium: '',
    players: [],
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
      // Simulate sending data to the backend
      console.log('Saving team to backend:', {
        teamName: state.teamName,
        homeStadium: state.homeStadium,
        players: state.players,
      });

      // Reset state after saving
      state.teamName = '';
      state.homeStadium = '';
      state.players = [];
    },
  },
});

export const { setTeamName, setHomeStadium, addPlayer, updatePlayer, deletePlayer, saveTeam } = teamSlice.actions;
export const teamReducer = teamSlice.reducer;