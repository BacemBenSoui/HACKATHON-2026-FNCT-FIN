
import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { REGIONS, THEMES, TECH_SKILLS } from '../constants';
import { Team } from '../types';

interface CreateTeamPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onCreateTeam: (team: Partial<Team>) => void;
}

const CreateTeamPage: React.FC<CreateTeamPageProps> = ({ onNavigate, onLogout, onCreateTeam }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState(REGIONS[0].name);
  const [theme, setTheme] = useState(THEMES[0]);
  const [teamSkills, setTeamSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    if (teamSkills.includes(skill)) {
      setTeamSkills(teamSkills.filter(s => s !== skill));
    } else {
      setTeamSkills([...teamSkills, skill]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTeam({
      name: teamName,
      description,
      preferredRegion: region,
      theme,
      requestedSkills: teamSkills
    });
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title="Créer une Équipe" 
        subtitle="En tant que Chef d'équipe, vous pilotez l'innovation municipale."
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-10 space-y-12">
            
            <section>
              <h3 className="text-xl font-black text-blue-900 mb-8 border-b pb-4 uppercase tracking-tighter">Identité de l'Équipe</h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">Nom de l'équipe *</label>
                  <input 
                    required 
                    type="text" 
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none transition-all" 
                    placeholder="Ex: Carthage Durable" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">Vision du projet (Hackathon FNCT 2026) *</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-800 border-none rounded-3xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none transition-all" 
                    placeholder="Décrivez en quelques lignes l'innovation que vous souhaitez porter pour les communes..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">Zone de déploiement *</label>
                    <select 
                      required 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-black uppercase outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      {REGIONS.map(r => <option key={r.id} value={r.name} className="bg-slate-800">{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">Thématique Prioritaire *</label>
                    <select 
                      required 
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as any)}
                      className="w-full px-6 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-black uppercase outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      {THEMES.map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-blue-900 mb-8 border-b pb-4 uppercase tracking-tighter">Profils recherchés (Talents manquants)</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 tracking-widest italic">Sélectionnez les compétences que vous souhaitez recruter.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TECH_SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`p-4 rounded-2xl text-[9px] font-black border transition-all uppercase tracking-tight leading-tight ${teamSkills.includes(skill) ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-blue-200'}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="p-10 bg-gray-50 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 border-t">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center md:text-left max-w-sm">
              En créant cette équipe, vous en devenez le responsable légal. Votre profil sera verrouillé sur ce projet.
            </p>
            <div className="flex space-x-4">
              <button 
                type="button" 
                onClick={() => onNavigate('dashboard')}
                className="px-10 py-4 bg-white border-2 border-gray-200 text-gray-500 font-black text-xs rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-12 py-4 bg-blue-600 text-white font-black text-xs rounded-2xl hover:bg-blue-700 shadow-2xl transition-all active:scale-95 uppercase tracking-widest"
              >
                Lancer l'Équipe
              </button>
            </div>
          </div>
        </form>
      </main>
    </Layout>
  );
};

export default CreateTeamPage;
