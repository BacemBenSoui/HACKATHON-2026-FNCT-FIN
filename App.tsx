
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import FindTeamPage from './pages/FindTeamPage';
import CreateTeamPage from './pages/CreateTeamPage';
import TeamWorkspace from './pages/TeamWorkspace';
import ApplicationForm from './pages/ApplicationForm';
import AdminDashboard from './pages/AdminDashboard';
import { UserRole, StudentProfile, Team } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'auth Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchUserData(session.user.id);
      } else {
        setUserProfile(null);
        setUserRole(null);
        setUserTeam(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    // 1. Fetch Profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      const formattedProfile: StudentProfile = {
        id: profile.id,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        university: profile.university || '',
        gender: profile.gender || 'O',
        level: profile.level || '',
        major: profile.major || '',
        techSkills: profile.tech_skills || [],
        metierSkills: profile.metier_skills || [],
        isComplete: profile.is_complete || false,
        teamRole: null, // À calculer via team_members
        currentTeamId: null,
        applications: [],
      };

      // 2. Fetch Team Membership
      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id, role, teams(*)')
        .eq('profile_id', userId)
        .single();

      if (membership) {
        formattedProfile.currentTeamId = membership.team_id;
        formattedProfile.teamRole = membership.role as any;
        
        const teamData = membership.teams as any;
        const { data: allMembers } = await supabase
           .from('team_members')
           .select('profile_id, profiles(first_name, last_name, tech_skills, metier_skills, gender), role')
           .eq('team_id', membership.team_id);

        setUserTeam({
          id: teamData.id,
          name: teamData.name,
          description: teamData.description,
          leaderId: teamData.leader_id,
          theme: teamData.theme,
          status: teamData.status,
          preferredRegion: teamData.preferred_region,
          joinRequests: [],
          requestedSkills: [],
          members: allMembers?.map((m: any) => ({
            id: m.profile_id,
            name: `${m.profiles.first_name} ${m.profiles.last_name}`,
            techSkills: m.profiles.tech_skills,
            metierSkills: m.profiles.metier_skills,
            gender: m.profiles.gender,
            role: m.role
          })) || []
        });
      }

      setUserProfile(formattedProfile);
      setUserRole(profile.role);
    }
  };

  const navigate = (page: string) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
           <div className="w-12 h-12 border-4 border-blue-400 border-t-white rounded-full animate-spin"></div>
           <p className="text-blue-100 font-black text-xs uppercase tracking-[0.3em]">FNCT 2026 - Initialisation...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={navigate} />;
      case 'login': return <LoginPage onLogin={() => navigate('dashboard')} onNavigate={navigate} />;
      case 'register': return <RegisterPage onNavigate={navigate} />;
      case 'dashboard': return <Dashboard userProfile={userProfile} userTeam={userTeam} onNavigate={navigate} onLogout={handleLogout} />;
      case 'profile': return <ProfilePage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} />;
      case 'find-team': return <FindTeamPage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} />;
      case 'create-team': return <CreateTeamPage onNavigate={navigate} onLogout={handleLogout} onCreateTeam={() => {}} />;
      case 'team-workspace': return <TeamWorkspace userProfile={userProfile} team={userTeam} setTeam={setUserTeam} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} />;
      case 'application-form': return <ApplicationForm team={userTeam} setTeam={setUserTeam} onNavigate={navigate} onLogout={handleLogout} />;
      case 'admin-dashboard': return <AdminDashboard onLogout={handleLogout} />;
      default: return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
};

export default App;
