
export type UserRole = 'student' | 'admin';
export type TeamRole = 'leader' | 'member' | null;

export interface StudentProfile {
  id: string;
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
  teamRole: TeamRole;
  currentTeamId: string | null;
  applications: string[]; 
}

export interface TeamMemberSummary {
  id: string;
  name: string;
  techSkills: string[];
  metierSkills: string[];
  gender: 'M' | 'F' | 'O';
  role: TeamRole;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: TeamMemberSummary[];
  joinRequests: any[];
  requestedSkills: string[];
  preferredRegion: string;
  status: 'incomplete' | 'complete' | 'submitted' | 'selected' | 'waitlist' | 'rejected';
  theme: string;
  secondaryTheme: string; // NOT NULL dans le schéma public.teams
  secondaryThemeDescription?: string;
  videoUrl?: string;
  pocUrl?: string;
  motivationUrl?: string;
}

// Added JoinRequest interface to fix the error in Dashboard.tsx
export interface JoinRequest {
  id: string;
  teamId: string;
  teamName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
