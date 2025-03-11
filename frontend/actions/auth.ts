'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { ErrorResponse } from '@/types/api';
import { AuthResponse, UserLogin, UserRegister } from '@/types/auth';
import { http } from '@/lib/http';

export async function register(data: UserRegister): Promise<AuthResponse | ErrorResponse> {
  let shouldRedirect = false;

  try {
    const response = await http.post('/auth/register', data);

    // If successful, store the token in cookies
    if (response.data.token) {
      (await cookies()).set('token', response.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      shouldRedirect = true;
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
  } finally {
    if (shouldRedirect) {
      redirect('/');
    }
  }
}

export async function login(data: UserLogin): Promise<AuthResponse | ErrorResponse> {
  let shouldRedirect = false;

  try {
    const response = await http.post('/auth/login', data);

    // If successful, store the token in cookies
    if (response.data.token) {
      (await cookies()).set('token', response.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      shouldRedirect = true;
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
  } finally {
    if (shouldRedirect) {
      redirect('/');
    }
  }
}
