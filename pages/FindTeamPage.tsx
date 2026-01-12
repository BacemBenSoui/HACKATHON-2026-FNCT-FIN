
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { REGIONS, THEMES, ThemeType } from '../constants';
import { StudentProfile, Team } from '../types';
import { supabase } from '../lib/supabase';

interface FindTeamPageProps {
  userProfile: StudentProfile | null;
  setUserProfile: (p: StudentProfile) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const FindTeamPage: React.FC<FindTeamPageProps> = ({ userProfile, setUserProfile, onNavigate, onLogout }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTheme, setFilterTheme] = useState<ThemeType | ''>('');

  const isInTeam = !!userProfile?.currentTeamId;

  useEffect(() => {
    fetchTeams();
  }, [filterRegion, filterTheme]);

  const fetchTeams = async () => {
    setIsLoading(true);
    let query = supabase
      .from('teams')
      .select('*, team_members(count)')
      .eq('status', 'incomplete');

    if (filterRegion) query = query.eq('preferred_region', filterRegion);
    if (filterTheme) query = query.eq('theme', filterTheme);

    const { data, error } = await query;
    if (error) console.error(error);
    else setTeams(data || []);
    setIsLoading(false);
  };

  const handleApply = async (teamId: string) => {
    if (isInTeam || !userProfile) return;
    
    try {
      const { error } = await supabase
        .from('join_requests')
        .insert({
          team_id: teamId,
          student_id: userProfile.id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') alert("Vous avez déjà postulé pour cette équipe.");
        else throw error;
      } else {
        const updatedProfile = { ...userProfile, applications: [...(userProfile.applications || []), teamId] };
        setUserProfile(updatedProfile);
        alert("Votre demande d'adhésion a été transmise au chef d'équipe !");
      }
    } catch (err: any) {
      alert("Erreur lors de la candidature : " + err.message);
    }
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title="Bourse aux Talents" 
        subtitle={isInTeam ? "Vous êtes déjà engagé dans une équipe." : "Explorez les projets et proposez vos compétences."}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isInTeam && (
          <div className="mb-12 p-8 bg-blue-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-800 rounded-full blur-3xl opacity-50"></div>
             <div className="mb-6 md:mb-0 relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tighter">Profil Verrouillé</h3>
                <p className="text-blue-300 font-bold uppercase text-[10px] tracking-widest mt-1">Vous faites déjà partie d'une aventure.</p>
             </div>
             <button 
                onClick={() => onNavigate('team-workspace')}
                className="px-10 py-4 bg-white text-blue-900 font-black text-xs uppercase rounded-2xl shadow-xl hover:bg-gray-100 transition-all relative z-10"
              >
                Retourner au Workspace
              </button>
          </div>
        )}

        <div className={`flex flex-col lg:flex-row gap-12 ${isInTeam ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
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
          </aside>

          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              <div className="col-span-full py-20 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chargement des équipes...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aucune équipe disponible pour le moment.</p>
              </div>
            ) : (
              teams.map(team => {
                const memberCount = team.team_members?.[0]?.count || 0;
                const hasApplied = userProfile?.applications?.includes(team.id);
                return (
                  <div key={team.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between transform hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-50 transition-all"></div>
                    <div>
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                          <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors leading-tight">{team.name}</h3>
                          <p className="text-[10px] font-black text-emerald-600 uppercase mt-2 tracking-widest">{team.theme}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase border border-blue-100 tracking-tight">{team.preferred_region?.split('(')[0]}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-8 leading-relaxed italic font-medium line-clamp-3">"{team.description}"</p>
                    </div>
                    <div className="flex items-center justify-between mb-8">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Effectif actuel</p>
                       <p className="text-lg font-black text-blue-900">{memberCount}/5</p>
                    </div>
                    <button 
                      onClick={() => handleApply(team.id)}
                      disabled={hasApplied || memberCount >= 5}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${hasApplied ? 'bg-orange-100 text-orange-600 cursor-not-allowed' : memberCount >= 5 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-blue-950'}`}
                    >
                      {hasApplied ? 'Déjà postulé' : memberCount >= 5 ? 'Équipe complète' : 'Postuler'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default FindTeamPage;
