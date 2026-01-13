
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
    // Gestionnaire d'état d'authentification robuste
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log("Auth Event:", event); // Debug
      
      if (session) {
        // L'utilisateur est connecté, on charge ses données
        try {
          await fetchUserData(session.user.id);
        } catch (err) {
          console.error("Erreur chargement données utilisateur:", err);
          // En cas d'erreur critique de données, on ne bloque pas l'UI sur loading
        }
      } else {
        // L'utilisateur est déconnecté (ou pas encore connecté)
        setUserProfile(null);
        setUserRole(null);
        setUserTeam(null);
        setCurrentPage('landing');
      }
      
      // On arrête le chargement dans tous les cas une fois la vérification terminée
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        const { data: requests } = await supabase
          .from('join_requests')
          .select('team_id')
          .eq('student_id', userId)
          .eq('status', 'pending');

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
          otherSkills: profile.other_skills || '',
          cvUrl: profile.cv_url || '',
          isComplete: profile.is_complete || false,
          teamRole: null,
          currentTeamId: null,
          applications: requests?.map(r => r.team_id) || [],
        };

        const { data: membership } = await supabase
          .from('team_members')
          .select('team_id, role, teams(*)')
          .eq('profile_id', userId)
          .maybeSingle();

        if (membership && membership.teams) {
          const teamData = Array.isArray(membership.teams) ? membership.teams[0] : membership.teams;
          
          formattedProfile.currentTeamId = membership.team_id;
          formattedProfile.teamRole = membership.role as any;
          
          const { data: allMembers } = await supabase
             .from('team_members')
             .select('profile_id, profiles(first_name, last_name, email, phone, tech_skills, metier_skills, gender), role')
             .eq('team_id', membership.team_id);

          // Gestion robuste de la casse pour 'Statut'
          const teamStatus = teamData.Statut || teamData.statut || 'incomplete';

          setUserTeam({
            id: teamData.id,
            name: teamData.name,
            description: teamData.description,
            leaderId: teamData.leader_id,
            theme: teamData.theme,
            secondaryTheme: teamData.secondary_theme,
            secondaryThemeDescription: teamData.secondary_theme_description,
            // MAPPAGE BDD : Utilisation de Statut (text)
            status: teamStatus, 
            preferredRegion: teamData.preferred_region,
            videoUrl: teamData.video_url,
            pocUrl: teamData.poc_url,
            motivationUrl: teamData.motivation_url,
            // MAPPAGE BDD : Colonnes absentes du schéma fourni, initialisation vide pour éviter crash
            lettreMotivationUrl: '', 
            requestedSkills: [], 
            joinRequests: [],
            members: allMembers?.map((m: any) => ({
              id: m.profile_id,
              name: m.profiles ? `${m.profiles.first_name} ${m.profiles.last_name}` : 'Utilisateur',
              email: m.profiles?.email || '',
              phone: m.profiles?.phone || '',
              techSkills: m.profiles?.tech_skills || [],
              metierSkills: m.profiles?.metier_skills || [],
              gender: m.profiles?.gender || 'O',
              role: m.role
            })) || []
          });
        } else {
          setUserTeam(null);
        }

        setUserProfile(formattedProfile);
        setUserRole(profile.role);
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
      throw e; // Propager pour que le catch supérieur le gère si besoin
    }
  };

  const refreshData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchUserData(session.user.id);
    }
  };

  const navigate = (page: string) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    if (confirm("Voulez-vous quitter la plateforme ?")) {
      try {
        await supabase.auth.signOut();
        // Le nettoyage d'état et la redirection sont gérés par onAuthStateChange
        // Mais par sécurité, on force le nettoyage ici aussi pour une réponse UI immédiate
        setUserProfile(null);
        setUserRole(null);
        setUserTeam(null);
        navigate('landing');
      } catch (error) {
        console.error("Erreur déconnexion:", error);
        // Force la redirection même en cas d'erreur réseau
        navigate('landing');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
           <div className="w-12 h-12 border-4 border-blue-400 border-t-white rounded-full animate-spin"></div>
           <p className="text-blue-100 font-black text-xs uppercase tracking-[0.3em]">FNCT 2026 - Synchronisation...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    let effectivePage = currentPage;
    if (currentPage === 'dashboard' && userRole === 'admin') {
      effectivePage = 'admin-dashboard';
    }

    switch (effectivePage) {
      case 'landing': return <LandingPage onNavigate={navigate} />;
      case 'login': return <LoginPage onLogin={() => navigate('dashboard')} onNavigate={navigate} />;
      case 'register': return <RegisterPage onNavigate={navigate} />;
      case 'dashboard': return <Dashboard userProfile={userProfile} userTeam={userTeam} onNavigate={navigate} onLogout={handleLogout} />;
      case 'profile': return <ProfilePage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} refreshData={refreshData} />;
      case 'find-team': return <FindTeamPage userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} refreshData={refreshData} />;
      case 'create-team': return <CreateTeamPage userProfile={userProfile} onNavigate={navigate} onLogout={handleLogout} refreshData={refreshData} />;
      case 'team-workspace': return <TeamWorkspace userProfile={userProfile} team={userTeam} setTeam={setUserTeam} setUserProfile={setUserProfile} onNavigate={navigate} onLogout={handleLogout} refreshData={refreshData} />;
      case 'application-form': return <ApplicationForm team={userTeam} setTeam={setUserTeam} onNavigate={navigate} onLogout={handleLogout} refreshData={refreshData} />;
      case 'admin-dashboard': return <AdminDashboard onLogout={handleLogout} onNavigate={navigate} />;
      default: return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {renderPage()}
    </div>
  );
};

export default App;
