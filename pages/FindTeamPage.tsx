
import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { REGIONS, THEMES, METIER_SKILLS, ThemeType } from '../constants';
import { StudentProfile } from '../types';

const MOCK_TEAMS = [
  { id: 'team-1', name: 'EcoConnect', description: 'Solution de tri intelligent pour les marchés municipaux.', leader: 'Sami K.', members: 3, region: 'Sud-Est (Djerba)', tech: ['Data / Intelligence Artificielle'], theme: 'Déchets et économie circulaire' },
  { id: 'team-2', name: 'UrbanFlow', description: 'Optimisation des flux de transport urbain.', leader: 'Lina M.', members: 4, region: 'Centre-Est (Sfax)', tech: ['Urbanisme / Aménagement'], theme: 'Gestion urbaine et territoriale' },
];

interface FindTeamPageProps {
  userProfile: StudentProfile | null;
  setUserProfile: (p: StudentProfile) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const FindTeamPage: React.FC<FindTeamPageProps> = ({ userProfile, setUserProfile, onNavigate, onLogout }) => {
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTheme, setFilterTheme] = useState<ThemeType | ''>('');

  const isInTeam = !!userProfile?.currentTeamId;
  const isLeader = userProfile?.teamRole === 'leader';

  const handleApply = (teamId: string) => {
    if (isInTeam) return;
    const currentApps = userProfile?.applications || [];
    if (currentApps.includes(teamId)) {
      alert("Vous avez déjà postulé dans cette équipe.");
      return;
    }
    const updatedProfile = { ...userProfile!, applications: [...currentApps, teamId] };
    setUserProfile(updatedProfile);
    alert("Votre demande d'adhésion a été transmise au chef d'équipe !");
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title="Bourse aux Talents" 
        subtitle={isInTeam ? "Vous êtes déjà engagé dans une équipe." : "Explorez les projets et proposez vos compétences."}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Lock Overlay if in team */}
        {isInTeam && (
          <div className="mb-12 p-8 bg-blue-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-800 rounded-full blur-3xl opacity-50"></div>
             <div className="mb-6 md:mb-0 relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tighter">Profil Verrouillé</h3>
                <p className="text-blue-300 font-bold uppercase text-[10px] tracking-widest mt-1">Vous faites partie de l'équipe : {userProfile?.currentTeamId}</p>
             </div>
             <button 
                onClick={() => onNavigate('team-workspace')}
                className="px-10 py-4 bg-white text-blue-900 font-black text-xs uppercase rounded-2xl shadow-xl hover:bg-gray-100 transition-all relative z-10"
              >
                Retourner au Workspace
              </button>
          </div>
        )}

        <div className={`flex flex-col lg:flex-row gap-12 ${isInTeam ? 'opacity-40 grayscale pointer-events-none select-none' : ''}`}>
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black text-gray-900 mb-8 uppercase tracking-widest">Recherche Ciblée</h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Zone d'intervention</label>
                  <select 
                    value={filterRegion} 
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-xs font-black text-blue-900 uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value="">Toutes les régions</option>
                    {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Enjeu Prioritaire</label>
                  <select 
                    value={filterTheme} 
                    onChange={(e) => setFilterTheme(e.target.value as any)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-xs font-black text-blue-900 uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value="">Toutes thématiques</option>
                    {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl">
               <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Avis aux Candidats</h4>
               <p className="text-[11px] font-medium leading-relaxed italic">
                 "Postulez dans les équipes qui manquent de vos compétences spécifiques pour augmenter vos chances d'être accepté rapidement."
               </p>
            </div>
          </aside>

          {/* Teams Grid */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_TEAMS.map(team => {
              const hasApplied = userProfile?.applications.includes(team.id);
              return (
                <div key={team.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-50 group-hover:bg-blue-100 transition-all"></div>
                  <div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors leading-tight">{team.name}</h3>
                        <p className="text-[10px] font-black text-emerald-600 uppercase mt-2 tracking-widest">{team.theme}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase border border-blue-100 tracking-tight">{team.region.split('(')[0]}</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed italic font-medium">"{team.description}"</p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Compétences</p>
                        <div className="flex flex-wrap gap-1">
                          {team.tech.map(s => <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[8px] font-black uppercase rounded tracking-tighter">{s}</span>)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-blue-900 uppercase mb-3 tracking-widest">Effectif</p>
                        <p className="text-lg font-black text-blue-900">{team.members}/5</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 relative z-10">
                    <button 
                      onClick={() => handleApply(team.id)}
                      disabled={hasApplied || team.members === 5}
                      className={`flex-grow py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${hasApplied ? 'bg-orange-100 text-orange-600 cursor-not-allowed' : team.members === 5 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-blue-950'}`}
                    >
                      {hasApplied ? 'En attente...' : team.members === 5 ? 'Équipe pleine' : 'Postuler comme Candidat'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default FindTeamPage;
