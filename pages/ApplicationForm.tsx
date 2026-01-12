
import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { THEMES, REGIONS } from '../constants';
import { Team } from '../types';
import { supabase } from '../lib/supabase';

interface ApplicationFormProps {
  team: Team | null;
  setTeam: (t: Team) => void;
  onNavigate: (p: string) => void;
  onLogout: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ team, setTeam, onNavigate, onLogout }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    description: team?.description || '',
    theme: team?.theme || THEMES[0],
    secondaryTheme: team?.secondaryTheme || '',
    secondaryDescription: team?.secondaryThemeDescription || '',
    region: team?.preferredRegion || REGIONS[0].name,
    videoUrl: '',
    pocUrl: ''
  });

  const handleFinalSubmit = async () => {
    if (!team) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          description: formData.description,
          theme: formData.theme,
          secondary_theme: formData.secondaryTheme,
          secondary_theme_description: formData.secondaryDescription,
          preferred_region: formData.region,
          video_url: formData.videoUrl,
          poc_url: formData.pocUrl,
          status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', team.id);

      if (error) throw error;

      alert('Dossier de candidature déposé avec succès ! Votre équipe est verrouillée.');
      onNavigate('dashboard');
    } catch (err: any) {
      alert("Erreur lors de la soumission : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader title="Dossier de Candidature Final" subtitle="Dernière étape avant l'évaluation par le jury FNCT." />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-10">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">1. Innovation & Vision</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Thématique Principale *</label>
                    <select 
                      value={formData.theme}
                      onChange={(e) => setFormData({...formData, theme: e.target.value})}
                      className="w-full p-4 bg-slate-800 border-none rounded-2xl text-white font-black uppercase text-[11px] outline-none"
                    >
                      {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Description complète de la solution *</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={6}
                      className="w-full p-6 bg-slate-800 border-none rounded-3xl text-white font-medium outline-none text-sm leading-relaxed"
                      placeholder="Détaillez l'impact de votre projet..."
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
            
            {/* Steps navigation logic simplified for BREVITY */}
            <div className="mt-10 flex justify-between">
               {step > 1 && <button onClick={() => setStep(step-1)} className="px-10 py-4 bg-gray-100 rounded-xl text-xs font-black uppercase">Précédent</button>}
               {step < 2 ? (
                 <button onClick={() => setStep(step+1)} className="px-10 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase ml-auto">Suivant</button>
               ) : (
                 <button onClick={handleFinalSubmit} disabled={isSubmitting} className="px-10 py-4 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase ml-auto disabled:opacity-50">
                   {isSubmitting ? 'Soumission...' : 'Soumettre le dossier'}
                 </button>
               )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ApplicationForm;
