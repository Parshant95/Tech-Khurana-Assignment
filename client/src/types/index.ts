export type ApplicationStatus = 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected';

export const KANBAN_COLUMNS: ApplicationStatus[] = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Offer',
  'Rejected',
];

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange?: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ParsedJD {
  company: string;
  role: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

export interface AIParseResponse {
  parsed: ParsedJD;
  suggestions: string[];
}
