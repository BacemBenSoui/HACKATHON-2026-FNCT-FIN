
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
import { UserRole, StudentProfile } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);

  // Mock initial profile
  useEffect(() => {
    if (userRole === 'student') {
      // Fix: Align mock data properties with StudentProfile definition in types.ts
      setUserProfile({
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
    navigate('landing');
  };

  // Basic Router logic
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      case 'dashboard':
        return <Dashboard userProfile={userProfile} onNavigate={navigate} onLogout={handleLogout} />;
      case 'profile':
        return <ProfilePage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} />;
      case 'find-team':
        return <FindTeamPage onNavigate={navigate} onLogout={handleLogout} />;
      case 'create-team':
        return <CreateTeamPage onNavigate={navigate} onLogout={handleLogout} />;
      case 'team-workspace':
        return <TeamWorkspace onNavigate={navigate} onLogout={handleLogout} />;
      case 'application-form':
        return <ApplicationForm onNavigate={navigate} onLogout={handleLogout} />;
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
