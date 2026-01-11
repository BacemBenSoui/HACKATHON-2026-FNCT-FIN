
import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { THEMES, REGIONS } from '../constants';

const ApplicationForm: React.FC<{ onNavigate: (p: string) => void; onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  // Form states
  const [mainDescription, setMainDescription] = useState('');
  const [mainTheme, setMainTheme] = useState(THEMES[0]);
  const [secondaryTheme, setSecondaryTheme] = useState('');
  const [secondaryDescription, setSecondaryDescription] = useState('');
  const [pocUrl, setPocUrl] = useState('');
  const [region, setRegion] = useState(REGIONS[0].name);
  const [videoUrl, setVideoUrl] = useState('');

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Candidature soumise avec succès !');
      onNavigate('dashboard');
    }, 2000);
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title="Dossier de Candidature" 
        subtitle="Finalisez votre projet pour le hackathon FNCT 2026."
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex h-2 bg-gray-100">
            <div className={`h-full bg-blue-600 transition-all duration-700`} style={{ width: `${step * 33.33}%` }}></div>
          </div>

          <div className="p-10">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">1. Thématiques & Innovation</h3>
                
                {/* Thème Principal */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest">Thématique Principale *</label>
                  </div>
                  <select 
                    value={mainTheme}
                    onChange={(e) => setMainTheme(e.target.value as any)}
                    className="w-full p-4 bg-slate-800 border-none rounded-2xl text-white font-black uppercase text-[11px] outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    {THEMES.map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                  </select>
                  <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Description détaillée (Problème, Solution, Impact) *</label>
                  <textarea 
                    value={mainDescription}
                    onChange={(e) => setMainDescription(e.target.value)}
                    rows={6}
                    className="w-full p-6 bg-slate-800 border-none rounded-3xl text-white font-medium focus:ring-4 focus:ring-blue-100 outline-none text-sm"
                    placeholder="Détaillez votre innovation principale..."
                  ></textarea>
                </div>

                {/* Thème Secondaire */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest">Thématique Secondaire (Transversalité) *</label>
                  <select 
                    value={secondaryTheme}
                    onChange={(e) => setSecondaryTheme(e.target.value)}
                    className="w-full p-4 bg-slate-800 border-none rounded-2xl text-white font-black uppercase text-[11px] outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="" className="bg-slate-800">-- Choisir un thème secondaire --</option>
                    {THEMES.filter(t => t !== mainTheme).map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                  </select>
                  <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Approche complémentaire du thème secondaire *</label>
                  <textarea 
                    value={secondaryDescription}
                    onChange={(e) => setSecondaryDescription(e.target.value)}
                    rows={4}
                    className="w-full p-6 bg-slate-800 border-none rounded-3xl text-white font-medium focus:ring-4 focus:ring-blue-100 outline-none text-sm"
                    placeholder="En quoi votre solution répond-elle aussi à cet enjeu secondaire ?"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1">POC / Lien Prototype (Optionnel)</label>
                  <input 
                    type="text" 
                    value={pocUrl}
                    onChange={(e) => setPocUrl(e.target.value)}
                    className="w-full p-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-medium outline-none focus:ring-4 focus:ring-blue-100" 
                    placeholder="https://github.com/..." 
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">2. Logistique & Médias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1">Région choisie *</label>
                    <select 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full p-4 bg-slate-800 border-none rounded-2xl text-white font-black uppercase text-[11px] outline-none"
                    >
                      {REGIONS.map(r => <option key={r.id} value={r.name} className="bg-slate-800">{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1">Lien Vidéo YouTube/Vimeo</label>
                    <input 
                      type="text" 
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full p-4 bg-slate-800 border-none rounded-2xl text-white text-sm font-medium outline-none" 
                      placeholder="URL de votre pitch" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1">Lettre de motivation (PDF) *</label>
                  <div className="border-4 border-dashed border-gray-100 rounded-3xl p-12 text-center bg-gray-50/50 hover:bg-blue-50 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                       <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                    </div>
                    <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Uploader le dossier PDF</button>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold">Max 5MB • PDF UNIQUEMENT</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 text-center py-10 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-50 rotate-6">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Finalisation</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] max-w-sm mx-auto">Veuillez certifier l'exactitude des données de l'équipe.</p>
                <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 text-left max-w-xl mx-auto space-y-6">
                  <label className="flex items-start space-x-4 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded-lg text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight">Je certifie que les 5 membres ont approuvé le contenu technique et la description du projet déposés ici.</span>
                  </label>
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="w-full py-5 bg-white border-2 border-blue-600 text-blue-600 font-black text-[10px] uppercase rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-lg tracking-widest"
                  >
                    Prévisualiser le Dossier Final
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 bg-gray-50/50 border-t flex justify-between items-center">
            <button 
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-white border border-gray-200 shadow-sm'}`}
            >
              Précédent
            </button>
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="px-12 py-4 bg-blue-900 text-white font-black text-xs rounded-2xl hover:bg-blue-950 shadow-2xl transition-all active:scale-95 uppercase tracking-widest"
              >
                Suivant
              </button>
            ) : (
              <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-14 py-4 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-700 shadow-2xl disabled:opacity-50 transition-all flex items-center uppercase tracking-widest"
              >
                {isSubmitting ? 'Traitement...' : 'Soumettre le Dossier'}
              </button>
            )}
          </div>
        </div>

        {/* Modale de Prévisualisation */}
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="sticky top-0 bg-white border-b p-8 flex justify-between items-center z-10">
                  <h3 className="text-2xl font-black text-blue-900 uppercase">Aperçu de la Candidature</h3>
                  <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               
               <div className="p-10 space-y-10">
                  <section>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Thème Principal</p>
                    <p className="text-sm font-black text-gray-900 uppercase mb-4">{mainTheme}</p>
                    <div className="p-6 bg-gray-50 rounded-2xl text-xs font-medium text-gray-600 leading-relaxed italic">
                      {mainDescription || "Aucune description saisie."}
                    </div>
                  </section>

                  <section>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Thème Secondaire</p>
                    <p className="text-sm font-black text-gray-900 uppercase mb-4">{secondaryTheme || "Non sélectionné"}</p>
                    <div className="p-6 bg-gray-50 rounded-2xl text-xs font-medium text-gray-600 leading-relaxed italic">
                      {secondaryDescription || "Aucune description secondaire saisie."}
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-8">
                     <section>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Région</p>
                        <p className="text-xs font-black text-gray-900 uppercase">{region}</p>
                     </section>
                     <section>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">POC / Prototype</p>
                        <p className="text-xs font-bold text-blue-600 break-all">{pocUrl || "N/A"}</p>
                     </section>
                  </div>

                  <section className="bg-blue-50 p-6 rounded-2xl">
                     <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2">Vidéo de Pitch</p>
                     <p className="text-xs font-bold text-gray-600 break-all">{videoUrl || "Aucune vidéo liée"}</p>
                  </section>
               </div>

               <div className="p-8 bg-gray-50 border-t flex justify-end">
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="px-10 py-4 bg-blue-600 text-white font-black text-xs rounded-2xl uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all"
                  >
                    Fermer l'aperçu
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default ApplicationForm;
