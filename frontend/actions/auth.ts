'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { ErrorResponse, User } from '@/types/api';
import { AuthResponse, UserLogin, UserRegister } from '@/types/auth';
import { http } from '@/lib/http';

export async function register(data: UserRegister): Promise<AuthResponse | ErrorResponse> {
  try {
    const response = await http.post('/auth/register', data);

    // If successful, store the token in cookies
    if (response.data.token) {
      (await cookies()).set('session_token', response.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response.data;
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      return error.response.data as ErrorResponse;
    }

    // Handle unexpected errors
    return {
      timestamp: new Date().toISOString(),
      status: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong',
      path: '/auth/register',
      validationErrors: [],
    };
  }
}

export async function login(data: UserLogin): Promise<AuthResponse | ErrorResponse> {
  try {
    const response = await http.post('/auth/login', data);

    // If successful, store the token in cookies
    if (response.data.token) {
      (await cookies()).set('session_token', response.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response.data;
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      return error.response.data as ErrorResponse;
    }

    // Handle unexpected errors
    return {
      timestamp: new Date().toISOString(),
      status: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong',
      path: '/auth/login',
      validationErrors: [],
    };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
  redirect('/');
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');

    if (!token) return null;

    const response = await http.get<User>('/user/me');

    // Add the token to the user object
    return {
      ...response.data,
      token: token.value,
    };
  } catch (error) {
    return null;
  }
}
