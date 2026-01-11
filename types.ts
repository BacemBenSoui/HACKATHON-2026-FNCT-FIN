
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
  // Nouveaux champs pour la gestion d'équipe
  teamRole: TeamRole;
  currentTeamId: string | null;
  applications: string[]; // IDs des équipes où le candidat a postulé
}

export interface TeamMemberSummary {
  id: string;
  name: string;
  techSkills: string[];
  metierSkills: string[];
  gender: 'M' | 'F' | 'O';
  role: TeamRole;
}

export interface JoinRequest {
  studentId: string;
  studentName: string;
  techSkills: string[];
  major: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: TeamMemberSummary[];
  joinRequests: JoinRequest[];
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
