
import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { REGIONS, THEMES, TECH_SKILLS, METIER_SKILLS, ThemeType } from '../constants';

const MOCK_TEAMS = [
  { id: '1', name: 'EcoConnect', description: 'Solution de tri intelligent pour les marchés municipaux.', leader: 'Sami K.', members: 3, region: 'Sud-Est (Djerba)', tech: ['Data / Intelligence Artificielle'], metier: ['Gestion des déchets'], theme: 'Déchets et économie circulaire' },
  { id: '2', name: 'UrbanFlow', description: 'Optimisation des flux de transport urbain.', leader: 'Lina M.', members: 4, region: 'Centre-Est (Sfax)', tech: ['Urbanisme / Aménagement'], metier: ['Mobilité et transport'], theme: 'Gestion urbaine et territoriale' },
];

const FindTeamPage: React.FC<{ onNavigate: (p: string) => void; onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTheme, setFilterTheme] = useState<ThemeType | ''>('');
  const [filterTech, setFilterTech] = useState('');

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title="Bourse aux Talents" 
        subtitle="Trouvez l'équipe qui manque de votre expertise métier."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Filtres Avancés</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-wider">Région</label>
                  <select 
                    value={filterRegion} 
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les zones</option>
                    {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-wider">Thématique</label>
                  <select 
                    value={filterTheme} 
                    onChange={(e) => setFilterTheme(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les enjeux</option>
                    {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {filterTheme && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[10px] font-black text-emerald-600 uppercase mb-3 tracking-wider">Expertise métier recherchée</label>
                      <div className="space-y-2">
                        {METIER_SKILLS[filterTheme as ThemeType].map(skill => (
                          <label key={skill} className="flex items-center space-x-3 p-2 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors">
                            <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500" />
                            <span className="text-xs font-bold text-gray-600">{skill}</span>
                          </label>
                        ))}
                      </div>
                   </div>
                )}
              </div>
            </div>
          </aside>

          {/* Teams Grid */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_TEAMS.map(team => (
              <div key={team.id} className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between transform hover:-translate-y-1">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-blue-900 group-hover:text-blue-600 transition-colors">{team.name}</h3>
                      <p className="text-[10px] font-black text-emerald-600 uppercase mt-1 tracking-widest">{team.theme}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase border border-blue-100">{team.region}</span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed italic">"{team.description}"</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">En place</p>
                      <div className="flex flex-wrap gap-1">
                        {team.tech.map(s => <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[8px] font-black uppercase rounded">{s}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-orange-500 uppercase mb-2 tracking-widest">Recherche</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black uppercase rounded border border-orange-100">Expert Métier</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-3">
                    {[...Array(team.members)].map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-900 shadow-sm">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onNavigate('team-workspace')}
                    className="flex-grow py-4 bg-blue-900 text-white font-black text-xs rounded-2xl hover:bg-blue-950 transition-all shadow-xl active:scale-95 uppercase tracking-widest"
                  >
                    Postuler Expert
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default FindTeamPage;
