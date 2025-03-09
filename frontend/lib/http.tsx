import axios from 'axios';

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, ''),
  withCredentials: true,
});

http.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') {
    const cookieStore = await (await import('next/headers')).cookies();
    const token = cookieStore.get('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
  }

  return config;
});
