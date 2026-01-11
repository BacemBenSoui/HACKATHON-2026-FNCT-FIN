
import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { REGIONS, TECH_SKILLS } from '../constants';

const CreateTeamPage: React.FC<{ onNavigate: (p: string) => void; onLogout: () => void }> = ({ onNavigate, onLogout }) => {
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
    alert('Équipe créée avec succès !');
    onNavigate('team-workspace');
  };

  return (
    <Layout userType="student" onLogout={onLogout}>
      <DashboardHeader 
        title="Créer une équipe" 
        subtitle="Devenez chef d'équipe et recrutez des talents."
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-10 space-y-10">
          <div>
            <h3 className="text-xl font-black text-blue-900 mb-6 border-b pb-4 uppercase tracking-tighter">Informations de base</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Nom de l'équipe *</label>
                <input required type="text" className="w-full px-5 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" placeholder="Ex: Les Innovateurs Verts" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Vision du projet *</label>
                <textarea required rows={3} className="w-full px-5 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" placeholder="Décrivez en quelques lignes l'innovation que vous souhaitez porter."></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Région préférée *</label>
                <select required className="w-full px-5 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-black uppercase outline-none focus:ring-4 focus:ring-blue-100">
                  {REGIONS.map(r => <option key={r.id} value={r.id} className="bg-slate-800">{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-blue-900 mb-6 border-b pb-4 uppercase tracking-tighter">Profils recherchés</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 tracking-widest">Sélectionnez les compétences manquantes.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TECH_SKILLS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`p-3 rounded-2xl text-[9px] font-black border transition-all uppercase tracking-tight ${teamSkills.includes(skill) ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white text-gray-400 border-gray-100'}`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="mt-8">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Critères spécifiques (Optionnel)</label>
              <input type="text" className="w-full px-5 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" placeholder="Ex: Recherche expert en hydrologie..." />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-blue-900 mb-6 border-b pb-4 uppercase tracking-tighter">Invitations</h3>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Emails (séparés par virgules)</label>
            <input type="text" className="w-full px-5 py-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" placeholder="ami@email.tn, collègue@email.tn" />
          </div>

          <div className="pt-6 flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-4 bg-gray-100 text-gray-500 font-black text-xs rounded-2xl hover:bg-gray-200 transition-all uppercase"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="px-12 py-4 bg-blue-600 text-white font-black text-xs rounded-2xl hover:bg-blue-700 shadow-2xl transition-all active:scale-95 uppercase tracking-widest"
            >
              Créer l'équipe
            </button>
          </div>
        </form>
      </main>
    </Layout>
  );
};

export default CreateTeamPage;
