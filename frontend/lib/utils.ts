import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { User } from '@/types/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAbbreviation(string: string) {
  return string.substring(0, 2).toUpperCase();
}

export function getFullName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}
