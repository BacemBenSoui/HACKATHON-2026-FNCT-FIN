
import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { REGIONS, THEMES, TECH_SKILLS } from '../constants';
import { Team } from '../types';
import { supabase } from '../lib/supabase';

interface CreateTeamPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onCreateTeam: (team: Partial<Team>) => void;
}

const CreateTeamPage: React.FC<CreateTeamPageProps> = ({ onNavigate, onLogout, onCreateTeam }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: REGIONS[0].name,
    theme: THEMES[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      // 1. Insérer l'équipe
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          description: formData.description,
          leader_id: user.id,
          theme: formData.theme,
          preferred_region: formData.region,
          status: 'incomplete'
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // 2. Ajouter le leader comme premier membre
      // Le trigger check_team_limit s'activera ici
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          profile_id: user.id,
          role: 'leader'
        });

      if (memberError) throw memberError;

      alert("Équipe créée avec succès !");
      onNavigate('team-workspace');
    } catch (err: any) {
      alert("Erreur de création : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title="Créer une Équipe" 
        subtitle="Cette action écrira directement dans les tables 'teams' et 'team_members'."
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-10 space-y-12">
            <section>
              <h3 className="text-xl font-black text-blue-900 mb-8 border-b pb-4 uppercase tracking-tighter">Identité de l'Équipe</h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">Nom de l'équipe *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm outline-none" 
                    placeholder="Ex: Carthage Durable" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">Vision du projet *</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-800 border-none rounded-3xl text-white text-sm outline-none" 
                    placeholder="Innovation pour les communes..."
                  ></textarea>
                </div>
              </div>
            </section>
          </div>

          <div className="p-10 bg-gray-50 flex justify-end border-t">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 bg-blue-600 text-white font-black text-xs rounded-2xl hover:bg-blue-700 shadow-2xl transition-all uppercase tracking-widest"
            >
              {isSubmitting ? 'Écriture tables...' : "Lancer l'Équipe"}
            </button>
          </div>
        </form>
      </main>
    </Layout>
  );
};

export default CreateTeamPage;
