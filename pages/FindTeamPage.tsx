
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { REGIONS, THEMES, ThemeType } from '../constants';
import { StudentProfile } from '../types';
import { supabase } from '../lib/supabase';

interface FindTeamPageProps {
  userProfile: StudentProfile | null;
  setUserProfile: (p: StudentProfile) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  refreshData: () => Promise<void>;
}

const FindTeamPage: React.FC<FindTeamPageProps> = ({ userProfile, setUserProfile, onNavigate, onLogout, refreshData }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTheme, setFilterTheme] = useState<ThemeType | ''>('');

  const isInTeam = !!userProfile?.currentTeamId;
  const isLeader = userProfile?.teamRole === 'leader';

  useEffect(() => {
    fetchTeams();
  }, [filterRegion, filterTheme]);

  const fetchTeams = async () => {
    setIsLoading(true);
    let query = supabase
      .from('teams')
      .select(`*, team_members(role, profiles(first_name, last_name, tech_skills))`)
      // MAPPAGE BDD : Filtrer sur Statut (text) = 'incomplete'
      .eq('Statut', 'incomplete');

    if (filterRegion) query = query.eq('preferred_region', filterRegion);
    if (filterTheme) query = query.eq('theme', filterTheme);

    const { data } = await query;
    // On mappe Statut -> status pour le front si besoin, même si ici on ne l'utilise pas explicitement pour l'affichage
    const mappedData = data?.map(t => ({...t, status: t.Statut})) || [];
    setTeams(mappedData);
    setIsLoading(false);
  };

  const handleApply = async (teamId: string) => {
    if (isInTeam || isLeader) {
      alert("Accès refusé : Vous êtes déjà engagé dans une équipe.");
      return;
    }
    
    try {
      const { error } = await supabase.from('join_requests').insert({
        team_id: teamId,
        student_id: userProfile!.id,
        status: 'pending' // Ici on garde status car table join_requests utilise status text
      });

      if (error) {
        if (error.code === '23505') alert("Candidature déjà déposée pour ce projet.");
        else throw error;
      } else {
        alert("✅ Candidature transmise au Chef de Projet.");
        await refreshData();
      }
    } catch (err: any) {
      alert("Erreur technique : " + err.message);
    }
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader title="Bourse aux Équipes" subtitle="Trouvez le projet qui correspond à vos expertises." />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(isInTeam || isLeader) && (
          <div className="mb-10 p-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-2xl text-orange-700">
             <p className="text-[10px] font-black uppercase tracking-widest mb-1">Attention Candidat</p>
             <p className="text-xs font-bold leading-relaxed">Vous faites déjà partie d'une équipe active. Les fonctions de postulation sont verrouillées pour garantir la stabilité des effectifs FNCT.</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-80">
            <div className="bg-white p-10 rounded-[8px] border border-[#E0E0E0] shadow-sm sticky top-32 space-y-8">
              <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-4">Recherche</h3>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Pôle Régional</label>
                <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl text-[10px] font-black uppercase outline-none">
                  <option value="">Tous les pôles</option>
                  {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Axe Stratégique</label>
                <select value={filterTheme} onChange={(e) => setFilterTheme(e.target.value as any)} className="w-full p-4 bg-gray-50 rounded-xl text-[10px] font-black uppercase outline-none">
                  <option value="">Toutes thématiques</option>
                  {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </aside>

          <div className="flex-grow space-y-8">
            {isLoading ? (
              <div className="py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs">Synchronisation...</div>
            ) : teams.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[8px] border border-dashed border-[#E0E0E0]">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Aucun projet ne correspond à vos filtres.</p>
              </div>
            ) : (
              teams.map(team => {
                const members = team.team_members || [];
                const hasApplied = userProfile?.applications?.includes(team.id);
                // Utilisation de requested_skills: s'assurer qu'il existe ou default
                const reqSkills = team.requested_skills || [];
                
                return (
                  <div key={team.id} className="bg-white border border-[#E0E0E0] rounded-[8px] p-10 shadow-sm hover:shadow-lg transition-all group">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center space-x-2">
                           <span className="px-2 py-1 bg-blue-900 text-white text-[8px] font-black uppercase rounded">{team.preferred_region}</span>
                           <span className={`px-2 py-1 text-[8px] font-black uppercase rounded ${members.length === 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{members.length}/5 Membres</span>
                        </div>
                        <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{team.name}</h3>
                        <p className="text-gray-500 text-sm font-medium italic leading-relaxed line-clamp-3">"{team.description}"</p>
                      </div>

                      <div className="lg:col-span-4 border-l border-gray-100 pl-10">
                         <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-2 mb-4">Profils Recherchés</p>
                         <div className="flex flex-wrap gap-1">
                            {/* Gestion de la colonne potentiellement manquante proprement */}
                            {reqSkills.length > 0 ? reqSkills.map((s: string) => (
                              <span key={s} className="px-2 py-1 bg-white text-blue-600 text-[8px] font-black uppercase rounded border border-[#E0E0E0]">{s}</span>
                            )) : <span className="text-[8px] font-bold text-gray-300 italic">Ouvert à tout talent</span>}
                         </div>
                      </div>

                      <div className="lg:col-span-3 bg-gray-50 rounded-[2rem] p-8 flex flex-col justify-center">
                        <button 
                          onClick={() => handleApply(team.id)}
                          disabled={hasApplied || members.length >= 5 || isInTeam || isLeader}
                          className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${hasApplied ? 'bg-orange-100 text-orange-600' : (members.length >= 5 || isInTeam || isLeader) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'}`}
                        >
                          {hasApplied ? 'PITCH EN ATTENTE' : (isInTeam || isLeader) ? 'DÉJÀ MEMBRE' : 'POSTULER'}
                        </button>
                      </div>
                    </div>
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
