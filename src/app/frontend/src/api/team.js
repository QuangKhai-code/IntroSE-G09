import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export const teamApi = {
  // Get all teams
  getAllTeams: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/teams/`);
      return response.data;
    } catch (error) {
      console.error('API Error Response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  // Update team
  updateTeam: async (teamId, teamData) => {
    try {
      const response = await axios.patch(`${BASE_URL}/teams/${teamId}/update_team_info/`, teamData);
      return response.data;
    } catch (error) {
      console.error('API Error Response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  // Add player to team
  addPlayer: async (teamId, playerData) => {
    try {
      const response = await axios.post(`${BASE_URL}/teams/${teamId}/add_player/`, playerData);
      return response.data;
    } catch (error) {
      console.error('API Error Response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  // Remove player from team
  removePlayer: async (teamId, playerId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/teams/${teamId}/remove_player/`, {
        data: { player_id: playerId }
      });
      return response.data;
    } catch (error) {
      console.error('API Error Response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  // Update player in team
  updatePlayer: async (teamId, playerId, playerData) => {
    try {
      const response = await axios.patch(`${BASE_URL}/teams/${teamId}/update_player/`, {
        id: playerId,
        ...playerData
      });
      return response.data;
    } catch (error) {
      console.error('API Error Response:', error.response?.data);
      throw error.response?.data || error;
    }
  }
}; 