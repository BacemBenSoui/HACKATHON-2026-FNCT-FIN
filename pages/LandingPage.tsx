
import React from 'react';
import Layout from '../components/Layout';
import { THEMES, REGIONS } from '../constants';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const openParticipationGuide = () => {
    window.open('https://drive.google.com/file/d/1Omc4sAu6fPgWRfidcQ_nV8l_hQjRlCWO/view?usp=sharing', '_blank');
  };

  return (
    <Layout onNavigate={onNavigate}>
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/1920/1080?grayscale')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mb-6 inline-block bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-xl">
            Édition 2026 - 50 Ans de la FNCT
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            50 ans, 50 innovations <br/> pour les communes
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-medium">
            L'innovation technologique au service des collectivités locales tunisiennes. Relevez le défi et transformez votre ville.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => onNavigate('register')}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all transform hover:scale-105 shadow-2xl uppercase text-xs tracking-widest"
            >
              Participer au hackathon
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="px-10 py-5 bg-white text-blue-900 hover:bg-gray-100 font-black rounded-2xl transition-all shadow-xl uppercase text-xs tracking-widest"
            >
              Trouver une équipe
            </button>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100 shadow-sm transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-100">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black mb-4 text-blue-900 uppercase tracking-tighter">Collaboration</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Formez des équipes pluridisciplinaires de 5 membres pour aborder les défis locaux sous tous les angles.</p>
            </div>
            <div className="p-10 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 shadow-sm transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-100">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-2xl font-black mb-4 text-emerald-900 uppercase tracking-tighter">Impact Direct</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Vos solutions seront étudiées par la FNCT pour une possible implémentation dans les municipalités tunisiennes.</p>
            </div>
            <div className="p-10 bg-orange-50 rounded-[2.5rem] border border-orange-100 shadow-sm transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-orange-100">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-2xl font-black mb-4 text-orange-900 uppercase tracking-tighter">Régionalité</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Des sélections régionales à Djerba, Sfax, Kairouan et Tabarka pour être au plus proche du terrain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tighter">5 Thématiques Prioritaires</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-16">Les piliers de la transformation urbaine</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {THEMES.map((theme, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center border border-gray-100 group">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">{i+1}</div>
                <p className="text-xs font-black text-gray-800 uppercase leading-tight tracking-tight">{theme}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-blue-600 py-24 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent opacity-50"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter uppercase">Prêt à innover ?</h2>
          <p className="text-blue-100 mb-12 text-lg font-medium">Consultez notre guide de participation et commencez votre aventure avec les municipalités tunisiennes.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={openParticipationGuide}
              className="flex items-center space-x-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-2xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
              <span>Guide de Participation</span>
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="px-12 py-4 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-950 transition-all shadow-2xl border border-blue-800"
            >
              Je participe
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
