import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export const generateSchedule = async (startDate, daysBetweenRounds) => {
  try {
    const response = await axios.post(`${BASE_URL}/rounds/generate_schedule/`, {
      start_date: startDate,
      days_between_rounds: daysBetweenRounds
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 