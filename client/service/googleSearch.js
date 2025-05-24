import axios from 'axios';

const API_HOST = 'google-search74.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY; // asigură-te că ai acest .env

export const searchGoogleCourses = async (query) => {
  const response = await axios.get(`https://${API_HOST}/?query=${encodeURIComponent(query)}&limit=10&related_keywords=true`, {
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': API_HOST
    }
  });
  return response.data;
};
