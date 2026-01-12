
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { THEMES, REGIONS } from '../constants';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const CountdownTimer = () => {
  const targetDate = new Date('2026-04-03T09:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const Unit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center p-4 min-w-[100px] bg-white rounded-2xl shadow-lg border border-gray-100">
      <span className="text-3xl font-black text-blue-900 leading-none">{String(value).padStart(2, '0')}</span>
      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-2">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <Unit value={timeLeft.days} label="Jours" />
      <Unit value={timeLeft.hours} label="Heures" />
      <Unit value={timeLeft.minutes} label="Minutes" />
      <Unit value={timeLeft.seconds} label="Secondes" />
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const themeColors = [
    'bg-[#1e3a8a]', // Bleu foncé
    'bg-[#38bdf8]', // Bleu Ciel
    'bg-[#dc2626]', // Rouge
    'bg-[#10b981]', // Vert
    'bg-[#fbbf24]'  // Jaune
  ];

  return (
    <Layout onNavigate={onNavigate}>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(30,58,138,0.8),_transparent)] z-10"></div>
        <div className="absolute inset-0 opacity-20 grayscale bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80')] bg-cover bg-center scale-110"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-blue-600/30 backdrop-blur-md px-4 py-2 rounded-full border border-blue-400/20 mb-8">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">50 ans, 50 innovations pour les communes</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
              L'INNOVATION <br/> <span className="text-blue-400 font-outline">TERRITORIALE</span> <br/> ARRIVE.
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100/70 max-w-2xl mb-12 font-medium leading-relaxed">
              Le plus grand hackathon municipal de Tunisie. Transformez les défis locaux en opportunités technologiques pour nos territoires.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => onNavigate('login')}
                className="px-20 py-8 bg-blue-600 text-white text-base font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-blue-900/50 hover:bg-blue-500 hover:scale-[1.02] transition-all active:scale-95 border-b-4 border-blue-800"
              >
                IDENTIFICATION
              </button>
              
              <button 
                onClick={() => onNavigate('register')}
                className="px-12 py-8 bg-white/5 backdrop-blur-xl text-white text-sm font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-white/10 transition-all border border-white/20"
              >
                INSCRIPTION
              </button>
            </div>

            <div className="mt-16">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6">Ouverture du hackathon dans</p>
              <CountdownTimer />
            </div>
          </div>
        </div>
      </section>

      {/* THEMES SECTION */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Stratégie FNCT 2026</p>
            <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">5 Thématiques Prioritaires</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {THEMES.map((theme, i) => (
              <div 
                key={i} 
                className={`${themeColors[i]} p-8 rounded-[8px] border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default`}
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-12 shadow-sm text-white font-black text-xl">
                  {i+1}
                </div>
                <h3 className="text-[11px] font-black text-white uppercase leading-relaxed tracking-[0.15em]">
                  {theme}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP SECTION */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Parcours Candidat</p>
            <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Comment participer ? La Roadmap</h2>
          </div>

          <div className="relative">
            {/* Ligne de connexion (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-200 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {[
                { step: "01", title: "Profil & CV", desc: "Créez votre compte et optimisez votre profil pour atteindre un score > 70%." },
                { step: "02", title: "Constitution", desc: "Rejoignez ou créez une équipe de 5 membres respectant la mixité (min 2F)." },
                { step: "03", title: "Soumission", desc: "Déposez votre pitch vidéo et votre mémoire de motivation avant la date limite." },
                { step: "04", title: "Grand Jury", desc: "Présentez votre innovation devant les experts lors des étapes régionales." }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center">
                  <div className="w-14 h-14 bg-blue-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 font-black text-xl shadow-lg border-4 border-white">
                    {item.step}
                  </div>
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-3">{item.title}</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <button onClick={() => onNavigate('register')} className="px-12 py-6 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95">
              Démarrer mon inscription maintenant
            </button>
          </div>
        </div>
      </section>

      {/* DATES SECTION */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Calendrier Officiel</p>
              <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Dates Importantes & Escales</h2>
            </div>
            <div className="hidden md:block">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saison 2026 • 24 Communes Partenaires</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REGIONS.map((region, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-6 hover:border-blue-200 transition-all">
                <div className="flex flex-col items-center justify-center px-4 py-3 bg-blue-50 rounded-2xl min-w-[80px]">
                  <span className="text-[10px] font-black text-blue-400 uppercase leading-none mb-1">AVR</span>
                  <span className="text-2xl font-black text-blue-900 leading-none">{region.date.split('-')[2]}</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">{region.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Hackathon Régional</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
