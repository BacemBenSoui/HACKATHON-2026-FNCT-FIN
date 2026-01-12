
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'student' | 'admin' | 'public';
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
  currentTeamId?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children, userType = 'public', onLogout, onNavigate, currentTeamId }) => {
  const isInTeam = !!currentTeamId;

  const openGuideDidactiel = () => {
    window.open("https://drive.google.com/file/d/1sHHNDVJC23Y5lvLLtr5pv5aoeekR4T-5/view?usp=sharing", "_blank");
  };

  const openGuideParticipation = () => {
    window.open("https://drive.google.com/file/d/1Omc4sAu6fPgWRfidcQ_nV8l_hQjRlCWO/view?usp=sharing", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => onNavigate?.('landing')}
                className="flex items-center space-x-3 focus:outline-none group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                  <span className="text-white font-black text-xs">FNCT</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-black text-blue-900 leading-none tracking-tighter">Hackathon 2026</span>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Plateforme Officielle</span>
                </div>
              </button>

              <div className="hidden lg:flex items-center space-x-4 border-l border-gray-100 pl-8">
                <button 
                  onClick={() => onNavigate?.('landing')}
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  Accueil
                </button>
                <button 
                  onClick={openGuideDidactiel}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-tight hover:bg-blue-100 transition-colors"
                >
                  Guide Didactiel
                </button>
                <button 
                  onClick={openGuideParticipation}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-tight hover:bg-emerald-100 transition-colors"
                >
                  Guide de Participation
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {userType === 'public' ? (
                <>
                  <button 
                    onClick={() => onNavigate?.('login')}
                    className="p-3 text-gray-300 hover:text-blue-600 transition-colors"
                    title="Accès Administration"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onNavigate?.('login')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95"
                  >
                    CANDIDAT
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Session</p>
                    <p className="text-xs font-black text-blue-900 uppercase tracking-tight">{userType === 'admin' ? 'Pilotage' : 'Candidat'}</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-3 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {userType === 'student' && (
        <div className="bg-blue-900 text-white border-b border-blue-800 sticky top-20 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center overflow-x-auto no-scrollbar py-3 space-x-8">
              <button onClick={() => onNavigate?.('dashboard')} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest hover:text-blue-300 transition-colors">Tableau de bord</button>
              <button onClick={() => onNavigate?.('profile')} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest hover:text-blue-300 transition-colors">Mon Profil</button>
              {!isInTeam ? (
                <>
                  <button onClick={() => onNavigate?.('find-team')} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest hover:text-blue-300 transition-colors">Bourse aux équipes</button>
                  <button onClick={() => onNavigate?.('create-team')} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest hover:text-blue-300 transition-colors">Créer une équipe</button>
                </>
              ) : (
                <button onClick={() => onNavigate?.('team-workspace')} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>Pilotage Équipe</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col">
        {children}
      </div>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-gray-400 font-black text-[8px]">FNCT</span>
          </div>
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-4">
            Fédération Nationale des Communes Tunisiennes - Hackathon 2026
          </p>
          <div className="flex justify-center space-x-8">
            <button onClick={() => onNavigate?.('landing')} className="text-gray-300 hover:text-blue-600 text-[8px] font-black uppercase tracking-widest">Accueil</button>
            <a href="#" className="text-gray-300 hover:text-blue-600 text-[8px] font-black uppercase tracking-widest">Confidentialité</a>
            <a href="#" className="text-gray-300 hover:text-blue-600 text-[8px] font-black uppercase tracking-widest text-emerald-600">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
