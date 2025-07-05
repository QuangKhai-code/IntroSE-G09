import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "";

export const rulesApi = {
  getRules: async () => {
    const response = await axios.get(API_BASE + "/api/tournament-rules");
    return response.data[0]; // Since API returns an array with single object
  },

  updateRules: async (rules) => {
    const response = await axios.patch(API_BASE + "/api/tournament-rules/1/", rules);
    return response.data;
  }
}; 