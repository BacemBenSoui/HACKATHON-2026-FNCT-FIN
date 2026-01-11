
import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { TECH_SKILLS, METIER_SKILLS, THEMES, ThemeType } from '../constants';
import { StudentProfile } from '../types';

interface ProfilePageProps {
  userProfile: StudentProfile | null;
  setUserProfile: (p: StudentProfile) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, setUserProfile, onNavigate, onLogout }) => {
  const [formData, setFormData] = useState<Partial<StudentProfile>>(userProfile || {
    techSkills: [],
    metierSkills: [],
    otherSkills: '',
    cvUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const profileScore = useMemo(() => {
    let score = 0;
    // 1. Formation (Université + Majeure) - 20 pts (10+10)
    if (formData.university) score += 10;
    if (formData.major && formData.major.length > 3) score += 10;
    
    // 2. Compétences Techniques - 20 pts max
    const techCount = formData.techSkills?.length || 0;
    score += Math.min(techCount * 5, 20);
    
    // 3. Compétences Métiers - 30 pts max
    const metierCount = formData.metierSkills?.length || 0;
    score += Math.min(metierCount * 10, 30);
    
    // 4. CV Upload - 30 pts
    if (cvFile || (formData.cvUrl && formData.cvUrl.length > 0)) score += 30;
    
    return score;
  }, [formData, cvFile]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updated = { ...formData, isComplete: true } as StudentProfile;
      setUserProfile(updated);
      setIsSaving(false);
      onNavigate('dashboard');
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setCvFile(file);
      } else {
        alert("Veuillez sélectionner un fichier PDF.");
      }
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
      <DashboardHeader title="Mon Profil Candidat" subtitle="Précisez vos domaines de prédilection pour optimiser votre score d'équipe." />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Profile Score Indicator */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between border border-blue-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-20"></div>
          <div className="mb-8 md:mb-0 relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">Candidature & Complétion</h2>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-2">Plus votre score est élevé, plus les chefs d'équipe vous solliciteront.</p>
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
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Visibilité profil</p>
              <p className={`text-xl font-black uppercase ${profileScore > 70 ? 'text-emerald-400' : profileScore > 40 ? 'text-orange-400' : 'text-red-400'}`}>
                {profileScore < 40 ? 'Basique' : profileScore < 80 ? 'Confirmé' : 'Candidat'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-10 space-y-12">
            
            {/* CV Upload */}
            <section className="animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xl font-black text-blue-900 border-b pb-4 mb-8 uppercase tracking-tighter flex items-center justify-between">
                <span>Curriculum Vitae</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">+30 pts</span>
              </h3>
              <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                   <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                </div>
                <p className="text-blue-600 font-black text-sm uppercase tracking-widest underline decoration-2 underline-offset-4 text-center">
                  {cvFile ? cvFile.name : formData.cvUrl ? 'CV_Dossier_Existant.pdf' : 'Cliquer ou glisser mon CV (PDF)'}
                </p>
                <p className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-widest italic">PDF uniquement • Max 2MB</p>
              </div>
            </section>

            {/* Académique */}
            <section className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xl font-black text-blue-900 border-b pb-4 mb-8 uppercase tracking-tighter flex items-center justify-between">
                <span>Formation Académique</span>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">+20 pts</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Université / École</label>
                  <input type="text" value={formData.university} disabled className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl text-gray-500 font-bold uppercase text-xs cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Spécialité (Majeure) *</label>
                  <input 
                    type="text" 
                    value={formData.major} 
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-800 border-none rounded-2xl text-white font-medium focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none"
                    placeholder="Ex: Génie Logiciel, Urbanisme..."
                  />
                </div>
              </div>
            </section>

            {/* Compétences Techniques */}
            <section className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '200ms' }}>
              <h3 className="text-xl font-black text-blue-900 border-b pb-4 mb-8 uppercase tracking-tighter flex items-center justify-between">
                <span>Compétences Transverses</span>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">+20 pts max</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TECH_SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleTechSkill(skill)}
                    className={`p-4 rounded-2xl text-[10px] font-black border transition-all text-center uppercase tracking-tight leading-tight ${formData.techSkills?.includes(skill) ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-blue-300'}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </section>

            {/* Compétences Métiers */}
            <section className="space-y-10 animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '300ms' }}>
              <h3 className="text-xl font-black text-blue-900 border-b pb-4 mb-2 uppercase tracking-tighter flex items-center justify-between">
                <span>Domaines de Candidature</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">+30 pts max</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic mb-6">Sélectionnez vos spécialisations pour être prioritaire sur les projets municipaux.</p>
              
              {THEMES.map(theme => (
                <div key={theme} className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                  <h4 className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-6">{theme}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {METIER_SKILLS[theme].map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleMetierSkill(skill)}
                        className={`flex items-center space-x-4 p-4 rounded-2xl text-[11px] font-black transition-all border ${formData.metierSkills?.includes(skill) ? 'bg-white text-emerald-600 border-emerald-500 shadow-xl' : 'bg-white text-gray-400 border-white hover:border-emerald-200'}`}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.metierSkills?.includes(skill) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-gray-200'}`}>
                          {formData.metierSkills?.includes(skill) && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                        </div>
                        <span className="uppercase tracking-tight text-left leading-tight">{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Bio */}
            <section>
              <h3 className="text-xl font-black text-blue-900 border-b pb-4 mb-8 uppercase tracking-tighter">Bio & Présentation</h3>
              <textarea 
                value={formData.otherSkills}
                onChange={(e) => setFormData({...formData, otherSkills: e.target.value})}
                className="w-full p-8 bg-slate-800 border-none rounded-3xl text-white font-medium focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none"
                placeholder="Racontez-nous ce qui vous motive à transformer les communes tunisiennes..."
                rows={5}
              ></textarea>
            </section>
          </div>

          <div className="px-10 py-10 bg-gray-50 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-16 py-5 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl active:scale-95 flex items-center uppercase tracking-widest"
            >
              {isSaving ? 'Synchronisation...' : 'Enregistrer mon profil Candidat'}
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;
