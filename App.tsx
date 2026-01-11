
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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (userRole === 'student') {
      setUserProfile({
        id: 'user-123',
        firstName: 'Anis',
        lastName: 'Mansour',
        email: 'anis.mansour@insat.u-carthage.tn',
        phone: '+216 22 333 444',
        university: 'INSAT',
        gender: 'M',
        level: 'M2',
        major: 'Génie Logiciel',
        techSkills: ['Développement logiciel', 'Data / Intelligence Artificielle'],
        metierSkills: [],
        isComplete: false,
        teamRole: null,
        currentTeamId: null,
        applications: [],
      });
    }
  }, [userRole]);

  const navigate = (page: string) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    navigate(role === 'admin' ? 'admin-dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserProfile(null);
    setUserTeam(null);
    navigate('landing');
  };

  // Logique métier : Création d'équipe
  const onCreateTeam = (teamData: Partial<Team>) => {
    const newTeam: Team = {
      id: 'team-' + Math.random().toString(36).substr(2, 9),
      name: teamData.name || 'Nouvelle Équipe',
      description: teamData.description || '',
      leaderId: userProfile!.id,
      members: [{
        id: userProfile!.id,
        name: `${userProfile!.firstName} ${userProfile!.lastName}`,
        techSkills: userProfile!.techSkills,
        metierSkills: userProfile!.metierSkills,
        gender: userProfile!.gender,
        role: 'leader'
      }],
      joinRequests: [],
      requestedSkills: teamData.requestedSkills || [],
      preferredRegion: teamData.preferredRegion || '',
      status: 'incomplete',
      theme: teamData.theme || '',
    };
    setUserTeam(newTeam);
    setUserProfile(prev => prev ? ({ ...prev, teamRole: 'leader', currentTeamId: newTeam.id, applications: [] }) : null);
    navigate('team-workspace');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      case 'dashboard':
        return <Dashboard userProfile={userProfile} userTeam={userTeam} onNavigate={navigate} onLogout={handleLogout} />;
      case 'profile':
        return <ProfilePage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} />;
      case 'find-team':
        return <FindTeamPage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} />;
      case 'create-team':
        return <CreateTeamPage onNavigate={navigate} onLogout={handleLogout} onCreateTeam={onCreateTeam} />;
      case 'team-workspace':
        return <TeamWorkspace userProfile={userProfile} team={userTeam} setTeam={setUserTeam} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} />;
      case 'application-form':
        return <ApplicationForm team={userTeam} setTeam={setUserTeam} onNavigate={navigate} onLogout={handleLogout} />;
      case 'admin-dashboard':
        return <AdminDashboard onLogout={handleLogout} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
};

export default App;
