import axios from 'axios';
import { config } from './config';

const API_BASE_URL = process.env.REACT_APP_API_URL || config.API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Function to set the auth token on the API instance
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api; 