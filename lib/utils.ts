import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getYearProgress(): {
  dayOfYear: number;
  totalDays: number;
  percentComplete: number;
  weeksRemaining: number;
} {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const totalDays = isLeapYear(now.getFullYear()) ? 366 : 365;
  const percentComplete = Math.round((dayOfYear / totalDays) * 100);
  const daysRemaining = totalDays - dayOfYear;
  const weeksRemaining = Math.floor(daysRemaining / 7);

  return { dayOfYear, totalDays, percentComplete, weeksRemaining };
}

export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates
    .map((d) => new Date(d).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  for (let i = 0; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const expected = new Date(Date.now() - i * 86400000);

    if (current.toDateString() === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get date string (YYYY-MM-DD) from a Date object stored in database
// Uses UTC methods since we store dates at UTC noon
export function getDateStringFromDB(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get today's date string (YYYY-MM-DD) in user's local timezone
// Use this on client-side to get "today" for the user
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse a YYYY-MM-DD string as UTC noon to avoid timezone shifting
// Using UTC noon (12:00) ensures the date doesn't shift regardless of timezone
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Create date at UTC noon to prevent date shifting
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

// Get today's date at UTC noon for storing in database
export function getLocalToday(): Date {
  const now = new Date();
  // Use UTC noon to prevent date shifting when stored in database
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
  );
}
