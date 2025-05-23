import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "";

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
      state.formSubmitted = true;
      
      const teamData = {
        name: state.teamName,
        home_stadium: state.homeStadium,
        players: state.players.map(player => ({
          name: player.name,
          birthdate: player.dateOfBirth,
          player_type: player.type.toLowerCase(),
          position: player.position,
          note: player.notes
        }))
      };

      console.log('Sending team data to backend:', teamData);
      
      axios.post(`${API_BASE}/api/teams/`, teamData)
        .then(response => {
          console.log('Team saved successfully:', response.data);
          // Dispatch clearFormData action after successful save
          window.dispatchEvent(new CustomEvent('teamSaved'));
        })
        .catch(error => {
          console.error('Error saving team:', error.response?.data || error.message);
          state.formSubmitted = false;
        });
    },

    clearFormData: (state) => {
      state.teamName = '';
      state.homeStadium = '';
      state.players = [];
      state.formSubmitted = false;
    },

    clearFormSubmittedFlag: (state) => {
      state.formSubmitted = false;
    }
  }
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