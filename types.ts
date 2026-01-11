
export type UserRole = 'student' | 'admin';

export interface StudentProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  gender: 'M' | 'F' | 'O';
  level: string;
  major: string;
  techSkills: string[];
  metierSkills: string[];
  otherSkills?: string;
  region?: string;
  cvUrl?: string;
  isComplete: boolean;
}

export interface TeamMemberSummary {
  id: string;
  name: string;
  techSkills: string[];
  metierSkills: string[];
  gender: 'M' | 'F' | 'O';
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: TeamMemberSummary[];
  requestedSkills: string[];
  preferredRegion: string;
  status: 'incomplete' | 'complete' | 'submitted' | 'selected' | 'waitlist' | 'rejected';
  theme: string;
  secondaryTheme?: string;
  secondaryThemeDescription?: string;
  score?: {
    base: number;
    bonus: number;
    total: number;
  };
}
