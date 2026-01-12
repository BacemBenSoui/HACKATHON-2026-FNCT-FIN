
import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { TECH_SKILLS, METIER_SKILLS, THEMES } from '../constants';
import { StudentProfile } from '../types';
import { supabase } from '../lib/supabase';

interface ProfilePageProps {
  userProfile: StudentProfile | null;
  setUserProfile: (p: StudentProfile) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, setUserProfile, onNavigate, onLogout }) => {
  const [formData, setFormData] = useState<Partial<StudentProfile>>(userProfile || {});
  const [isSaving, setIsSaving] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const profileScore = useMemo(() => {
    let score = 0;
    if (formData.university) score += 10;
    if (formData.major && formData.major.length > 3) score += 10;
    const techCount = formData.techSkills?.length || 0;
    score += Math.min(techCount * 5, 20);
    const metierCount = formData.metierSkills?.length || 0;
    score += Math.min(metierCount * 10, 30);
    if (cvFile || (formData.cvUrl && formData.cvUrl.length > 0)) score += 30;
    return score;
  }, [formData, cvFile]);

  const handleSave = async () => {
    if (!userProfile?.id) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          major: formData.major,
          tech_skills: formData.techSkills,
          metier_skills: formData.metierSkills,
          other_skills: formData.otherSkills,
          is_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      setUserProfile({ ...userProfile, ...formData, isComplete: true } as StudentProfile);
      onNavigate('dashboard');
    } catch (err: any) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTechSkill = (skill: string) => {
    const current = formData.techSkills || [];
    setFormData({ ...formData, techSkills: current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill] });
  };

  const toggleMetierSkill = (skill: string) => {
    const current = formData.metierSkills || [];
    setFormData({ ...formData, metierSkills: current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill] });
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader title="Mon Profil Candidat" subtitle="Vos données sont synchronisées avec la base de données FNCT." />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Profile Score Card */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between border border-blue-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-20"></div>
          <div className="mb-8 md:mb-0 relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">Score d'Innovation</h2>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-2">Profil synchronisé en temps réel.</p>
          </div>
          <div className="flex items-center space-x-8 relative z-10">
            <div className="relative w-28 h-28">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-blue-800" strokeDasharray="100, 100" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-400 transition-all duration-1000 ease-out" strokeDasharray={`${profileScore}, 100`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black">{profileScore}%</span>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-10 space-y-12">
            <section>
              <h3 className="text-xl font-black text-blue-900 border-b pb-4 mb-8 uppercase tracking-tighter">Formation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Spécialité (Majeure) *</label>
                  <input 
                    type="text" 
                    value={formData.major || ''} 
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-800 border-none rounded-2xl text-white font-medium outline-none"
                    placeholder="Ex: Génie Logiciel"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-blue-900 border-b pb-4 mb-8 uppercase tracking-tighter">Compétences</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TECH_SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleTechSkill(skill)}
                    className={`p-4 rounded-2xl text-[10px] font-black border transition-all uppercase ${formData.techSkills?.includes(skill) ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="px-10 py-10 bg-gray-50 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-16 py-5 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl uppercase tracking-widest"
            >
              {isSaving ? 'Écriture base...' : 'Synchroniser mon profil'}
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;
