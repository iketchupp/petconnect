import axios from 'axios';

// Fallback to a default API URL if environment variable is not defined
const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  : 'https://iketchupp.xyz/api/v1';

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

http.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') {
    const cookieStore = await (await import('next/headers')).cookies();
    const token = cookieStore.get('session_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
  }

  return config;
});
