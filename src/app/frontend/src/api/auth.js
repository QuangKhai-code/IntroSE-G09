import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "";

export class AuthAPI {
    static async loginRequest({username, password}) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
          email,
          password,
        });

        return response.data; // { token, user }
      } catch (error) {
        // axios wraps errors
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || "Login failed");
        } else {
          throw new Error("Network error");
        }
      }
    }
}



