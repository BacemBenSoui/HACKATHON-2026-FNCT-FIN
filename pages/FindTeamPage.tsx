
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
  const [filterSkill, setFilterSkill] = useState('');

  const isInTeam = !!userProfile?.currentTeamId;
  const isLeader = userProfile?.teamRole === 'leader';

  useEffect(() => {
    fetchTeams();
  }, [filterRegion, filterTheme, filterSkill]);

  const fetchTeams = async () => {
    setIsLoading(true);
    let query = supabase
      .from('teams')
      .select(`
        *,
        team_members(
          role,
          profiles(first_name, last_name, tech_skills)
        )
      `)
      .eq('status', 'incomplete');

    if (filterRegion) query = query.eq('preferred_region', filterRegion);
    if (filterTheme) query = query.eq('theme', filterTheme);
    if (filterSkill) query = query.contains('requested_skills', [filterSkill]);

    const { data, error } = await query;
    if (error) console.error("Erreur lors de la récupération des équipes:", error);
    else setTeams(data || []);
    setIsLoading(false);
  };

  const handleApply = async (teamId: string) => {
    console.log("Tentative de postulation pour l'équipe ID:", teamId);
    
    if (!userProfile) {
      alert("Veuillez vous reconnecter pour postuler.");
      return;
    }

    if (isInTeam || isLeader) {
      alert("Action impossible : vous faites déjà partie d'une équipe.");
      return;
    }
    
    try {
      // 1. Appel API Supabase
      const { data, error } = await supabase
        .from('join_requests')
        .insert({
          team_id: teamId,
          student_id: userProfile.id,
          status: 'pending'
        })
        .select();

      if (error) {
        console.error("Erreur API Postulation:", error);
        if (error.code === '23505') {
          alert("Vous avez déjà une candidature en cours pour cette équipe.");
        } else {
          throw error;
        }
      } else {
        console.log("Candidature enregistrée avec succès:", data);
        
        // 2. Retour utilisateur
        alert("✅ CANDIDATURE ENVOYÉE ! Le chef d'équipe a été notifié de votre intérêt.");
        
        // 3. Rafraîchissement des données de l'application
        await refreshData();
      }
    } catch (err: any) {
      console.error("Erreur inattendue:", err);
      alert("Erreur technique : " + (err.message || "Impossible d'envoyer la demande. Vérifiez votre connexion."));
    }
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title="Bourse aux Équipes" 
        subtitle="Identifiez les projets municipaux qui ont besoin de vos talents."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Aside Filters */}
          <aside className="w-full lg:w-80">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-32 space-y-8">
              <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-4">Filtrage</h3>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Région</label>
                <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl text-[10px] font-black uppercase outline-none">
                  <option value="">Tout le pays</option>
                  {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Thématique</label>
                <select value={filterTheme} onChange={(e) => setFilterTheme(e.target.value as any)} className="w-full p-4 bg-gray-50 rounded-xl text-[10px] font-black uppercase outline-none">
                  <option value="">Toutes</option>
                  {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </aside>

          {/* Teams List */}
          <div className="flex-grow space-y-8">
            {isLoading ? (
              <div className="py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-[0.2em]">Synchronisation de la bourse...</div>
            ) : teams.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Aucune équipe disponible pour le moment.</p>
              </div>
            ) : (
              teams.map(team => {
                const members = team.team_members || [];
                const hasApplied = userProfile?.applications?.includes(team.id);
                
                return (
                  <div key={team.id} className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all group">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      
                      {/* Project Info */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center space-x-2">
                           <span className="px-2 py-1 bg-blue-900 text-white text-[8px] font-black uppercase rounded">{team.preferred_region}</span>
                           <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded">{members.length}/5 Membres</span>
                        </div>
                        <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{team.name}</h3>
                        <p className="text-gray-500 text-sm font-medium italic leading-relaxed line-clamp-3">"{team.description}"</p>
                        <div className="pt-4 border-t border-gray-50 space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Axe Stratégique</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[8px] font-black uppercase rounded">{team.theme}</span>
                            {team.secondary_theme && (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase rounded">Vocation : {team.secondary_theme}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Current Members */}
                      <div className="lg:col-span-4 border-l border-gray-100 pl-10 space-y-6">
                         <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-2">Composition Équipe</p>
                         <div className="space-y-4">
                           {members.map((m: any, idx: number) => (
                             <div key={idx} className="flex items-center space-x-3">
                               <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-black text-[10px] text-blue-600 uppercase">
                                 {m.profiles.first_name?.charAt(0)}
                               </div>
                               <div>
                                 <p className="text-[11px] font-black text-gray-900 uppercase leading-none">{m.profiles.first_name} {m.profiles.last_name}</p>
                                 <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">
                                   Expertise : {m.profiles.tech_skills?.[0] || 'Généraliste'}
                                 </p>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>

                      {/* Call to Action */}
                      <div className="lg:col-span-3 bg-gray-50 rounded-[2rem] p-8 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-black text-blue-900 uppercase mb-4 tracking-widest">Besoins du Projet</p>
                          <div className="flex flex-wrap gap-1">
                            {team.requested_skills?.length > 0 ? team.requested_skills.map((s: string) => (
                              <span key={s} className="px-2 py-1 bg-white text-blue-600 text-[8px] font-black uppercase rounded border border-gray-200">{s}</span>
                            )) : <span className="text-[8px] font-bold text-gray-300 italic">Ouvert à tous profils</span>}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleApply(team.id)}
                          disabled={hasApplied || members.length >= 5 || isInTeam || isLeader}
                          className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${hasApplied ? 'bg-orange-100 text-orange-600 shadow-none' : (members.length >= 5 || isInTeam || isLeader) ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl active:scale-95'}`}
                        >
                          {hasApplied ? 'CANDIDATURE EN COURS' : (isInTeam || isLeader) ? 'DÉJÀ ENGAGÉ' : 'POSTULER'}
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
