// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

// Book/Reading Types
export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: "not-started" | "reading" | "completed";
  startDate?: Date;
  completedDate?: Date;
  notes: string;
  rating?: number;
  coverUrl?: string;
}

// Coding Practice Types
export interface CodingSession {
  id: string;
  date: Date;
  duration: number; // minutes
  language: string;
  topic: string;
  notes: string;
}

// GitHub Types
export interface GitHubCommit {
  id: string;
  date: Date;
  repository: string;
  message: string;
  additions: number;
  deletions: number;
}

export interface GitHubStats {
  totalCommits: number;
  currentStreak: number;
  longestStreak: number;
  contributionsByMonth: Record<string, number>;
}

// LeetCode Types
export interface LeetCodeProblem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  status: "not-started" | "attempted" | "solved";
  solvedDate?: Date;
  timeSpent?: number; // minutes
  notes: string;
  topics: string[];
}

export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  longestStreak: number;
}

// Job Application Types
export interface JobApplication {
  id: string;
  company: string;
  position: string;
  location: string;
  type: "remote" | "hybrid" | "onsite";
  status:
    | "wishlist"
    | "applied"
    | "screening"
    | "interview"
    | "offer"
    | "rejected"
    | "accepted";
  appliedDate?: Date;
  salary?: string;
  notes: string;
  url?: string;
  contacts: Contact[];
  timeline: TimelineEvent[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: string;
  description: string;
}

// Startup Project Types
export interface StartupProject {
  id: string;
  name: string;
  description: string;
  status:
    | "idea"
    | "planning"
    | "building"
    | "launched"
    | "paused"
    | "completed";
  startDate: Date;
  targetLaunchDate?: Date;
  launchedDate?: Date;
  technologies: string[];
  milestones: Milestone[];
  progress: number; // 0-100
  notes: string;
  url?: string;
  githubUrl?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate?: Date;
  completedDate?: Date;
  status: "pending" | "in-progress" | "completed";
}

// Events Types
export interface Event {
  id: string;
  name: string;
  type:
    | "conference"
    | "meetup"
    | "workshop"
    | "webinar"
    | "hackathon"
    | "other";
  date: Date;
  location: string;
  isVirtual: boolean;
  description: string;
  takeaways: string;
  url?: string;
  attendees?: number;
}

// Dashboard Stats
export interface DashboardStats {
  booksRead: number;
  booksInProgress: number;
  totalCodingHours: number;
  githubCommits: number;
  leetCodeSolved: number;
  jobsApplied: number;
  projectsLaunched: number;
  eventsAttended: number;
}

// Year Progress
export interface YearProgress {
  dayOfYear: number;
  totalDays: number;
  percentComplete: number;
  weeksRemaining: number;
}
