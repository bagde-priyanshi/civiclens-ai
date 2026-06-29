export type IssueCategory = 'Pothole' | 'Garbage' | 'Water Leak' | 'Broken Infrastructure';
export type IssueStatus = 'Reported' | 'Verified' | 'In Progress' | 'Resolved';

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  image: string;
  reportedBy: string;
  timestamp: string;
  votesConfirm: number;
  votesReject: number;
  userVoted: 'confirm' | 'reject' | null;
  aiConfidence?: number;
  address?: string;
  city: string;
}

export interface UserProfile {
  name: string;
  city: string;
  trustScore: number;
  reportCount: number;
  hasCompletedOnboarding: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'location';
}
