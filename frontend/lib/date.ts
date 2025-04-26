import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function parseUTC(dateString: string): Date {
  return new Date(dateString);
}

export function getCurrentUTCDate(): string {
  return new Date().toISOString();
}

export function formatLocalTime(dateString: string, formatStr: string): string {
  const date = parseISO(dateString);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = toZonedTime(date, timeZone);

  return format(zonedDate, formatStr);
}

export function formatMessageTime(dateString: string): string {
  const date = parseISO(dateString);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = toZonedTime(date, timeZone);

  if (isToday(zonedDate)) {
    return format(zonedDate, 'h:mm a');
  } else if (isYesterday(zonedDate)) {
    return 'Yesterday';
  } else {
    return format(zonedDate, 'MMM d');
  }
}

export function calculateAge(birthDateString: string): number {
  const birthDate = parseISO(birthDateString);
  const now = new Date();
  return now.getFullYear() - birthDate.getFullYear();
}

export function formatLocalDate(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = toZonedTime(parsedDate, timeZone);
  return format(zonedDate, 'PPP');
}
