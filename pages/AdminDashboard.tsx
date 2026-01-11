
import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { STATUS_COLORS, STATUS_LABELS, REGIONS, THEMES, METIER_SKILLS, TECH_SKILLS, IDEAL_TEAMS, ThemeType } from '../constants';

interface AdminTeam {
  id: string;
  name: string;
  leader: string;
  leaderEmail: string;
  membersCount: number;
  womenCount: number;
  region: string;
  theme: ThemeType;
  description: string;
  techSkills: string[];
  metierSkills: string[];
  status: keyof typeof STATUS_COLORS;
  submittedAt: string;
  cvLinks: string[];
  videoUrl?: string;
  pocUrl?: string;
  rejectionReason?: string;
  lastUpdated: string;
}

const MOCK_TEAMS_ADMIN: AdminTeam[] = [
  { 
    id: '1', name: 'EcoConnect', leader: 'Sami K.', leaderEmail: 'sami.k@universite.tn',
    membersCount: 5, womenCount: 2, 
    region: 'Sud-Est (Djerba)', theme: 'Déchets et économie circulaire',
    description: "Solution de tri intelligent par IA utilisant la vision par ordinateur pour les points de collecte municipaux.",
    techSkills: ['Développement logiciel', 'Data / Intelligence Artificielle', 'Environnement / Climat'],
    metierSkills: ['Gestion des déchets', 'Économie circulaire'],
    status: 'submitted', submittedAt: '2026-03-20', lastUpdated: '2026-03-20',
    cvLinks: ['#cv1', '#cv2', '#cv3', '#cv4', '#cv5'],
    videoUrl: 'https://youtube.com/watch?v=demo1',
    pocUrl: 'https://github.com/demo/ecoconnect'
  },
  { 
    id: '2', name: 'UrbanFlow', leader: 'Lina M.', leaderEmail: 'lina.m@universite.tn',
    membersCount: 5, womenCount: 3, 
    region: 'Centre-Est (Sfax)', theme: 'Gestion urbaine et territoriale',
    description: "Monitoring en temps réel du trafic urbain pour optimiser les services de transport public.",
    techSkills: ['Développement logiciel', 'Urbanisme / Aménagement'],
    metierSkills: ['Mobilité et transport'],
    status: 'selected', submittedAt: '2026-03-18', lastUpdated: '2026-03-18',
    cvLinks: ['#cv1', '#cv2', '#cv3', '#cv4', '#cv5'],
    videoUrl: 'https://vimeo.com/demo2'
  },
  { 
    id: '3', name: 'SmartGov', leader: 'Amine R.', leaderEmail: 'amine.r@universite.tn',
    membersCount: 3, womenCount: 1, 
    region: 'Nord-Ouest (Tabarka)', theme: 'Gestion administrative et financière',
    description: "Audit digital et automatisation des services territoriaux de proximité.",
    techSkills: ['Droit / Réglementation'],
    metierSkills: [],
    status: 'incomplete', submittedAt: '2026-03-22', lastUpdated: '2026-03-22',
    cvLinks: []
  },
  { 
    id: '4', name: 'HydroVigil', leader: 'Ines T.', leaderEmail: 'ines.t@universite.tn',
    membersCount: 5, womenCount: 2, 
    region: 'Centre-Ouest (Kairouan)', theme: 'Adaptation au changement climatique',
    description: "Système de détection précoce des risques naturels et gestion intelligente de l'eau.",
    techSkills: ['Développement logiciel', 'Environnement / Climat'],
    metierSkills: ['Hydrologie et gestion de l\'eau', 'Risques naturels'],
    status: 'submitted', submittedAt: '2026-03-21', lastUpdated: '2026-03-21',
    cvLinks: ['#cv1', '#cv2', '#cv3'],
    pocUrl: 'https://hydrovigil.tn/demo'
  }
];

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'skills'>('overview');
  const [teamsData, setTeamsData] = useState<AdminTeam[]>(MOCK_TEAMS_ADMIN);
  const [filters, setFilters] = useState({ region: 'all', theme: 'all', status: 'all' });
  const [evaluationTeam, setEvaluationTeam] = useState<AdminTeam | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const calculateScore = (team: AdminTeam) => {
    let bonus = 0;
    const relevantSkills = METIER_SKILLS[team.theme];
    const teamMetierCount = team.metierSkills.filter(s => relevantSkills.includes(s)).length;
    if (teamMetierCount >= 1) bonus += 5;
    if (teamMetierCount >= 2) bonus += 10;
    if (team.techSkills.length >= 3) bonus += 15;
    const base = team.membersCount * 10;
    return { base, bonus, total: base + bonus };
  };

  const filteredTeams = useMemo(() => {
    return teamsData.filter(t => {
      const regionMatch = filters.region === 'all' || t.region === filters.region;
      const themeMatch = filters.theme === 'all' || t.theme === filters.theme;
      const statusMatch = filters.status === 'all' || t.status === filters.status;
      return regionMatch && themeMatch && statusMatch;
    });
  }, [filters, teamsData]);

  // Handle Validation
  const handleValidate = (team: AdminTeam) => {
    const updated = teamsData.map(t => t.id === team.id ? { ...t, status: 'selected' as const, lastUpdated: new Date().toISOString() } : t);
    setTeamsData(updated);
    alert(`E-mail de confirmation envoyé à ${team.leader} (${team.leaderEmail}).\n\nStatut mis à jour : ACCEPTÉ POUR LA RÉGIONALE.`);
    setEvaluationTeam(null);
  };

  // Handle Rejection
  const handleRejectSubmit = () => {
    if (!evaluationTeam) return;
    const updated = teamsData.map(t => t.id === evaluationTeam.id ? { ...t, status: 'rejected' as const, rejectionReason: rejectionComment, lastUpdated: new Date().toISOString() } : t);
    setTeamsData(updated);
    alert(`Notification de rejet envoyée à ${evaluationTeam.leader}.\nMotif : ${rejectionComment}`);
    setRejectionComment('');
    setShowRejectionModal(false);
    setEvaluationTeam(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Equipe', 'Chef', 'Email', 'Membres', 'Femmes', 'Region', 'Theme', 'Statut', 'Score Total', 'Motif Rejet', 'Soumis le'];
    const rows = teamsData.map(t => [
      t.id, t.name, t.leader, t.leaderEmail, t.membersCount, t.womenCount, t.region, t.theme, t.status, calculateScore(t).total, `"${t.rejectionReason || ''}"`, t.submittedAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hackathon_fnct_export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout userType="admin" onLogout={onLogout}>
      <DashboardHeader 
        title="Centre de Pilotage FNCT" 
        subtitle="Analytique et Gouvernance du Hackathon 2026"
        actions={
          <button 
            onClick={handleExportCSV}
            className="px-5 py-3 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center space-x-2 border border-emerald-500 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="uppercase tracking-widest">Télécharger Export Global (CSV)</span>
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-2xl mb-10 w-fit">
          {['overview', 'teams', 'skills'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-900 text-white shadow-xl' : 'text-gray-500 hover:text-blue-900'}`}
            >
              {tab === 'overview' ? 'Tableau de bord' : tab === 'teams' ? 'Dossiers & Évaluation' : 'Compétences par Région'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Équipes</p>
                <p className="text-4xl font-black text-blue-900 mt-2">{teamsData.length}</p>
                <div className="mt-4 flex items-center text-[10px] font-bold text-gray-400">
                   <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{width: '65%'}}></div>
                   </div>
                   <span className="ml-2">65% objectif</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sélectionnées</p>
                <p className="text-4xl font-black text-emerald-600 mt-2">{teamsData.filter(t => t.status === 'selected').length}</p>
                <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-tight">Accès finale régionale</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidats totaux</p>
                <p className="text-4xl font-black text-indigo-600 mt-2">{teamsData.reduce((acc, t) => acc + t.membersCount, 0)}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Inscriptions individuelles</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parité (Femmes)</p>
                <p className="text-4xl font-black text-pink-600 mt-2">
                  {Math.round((teamsData.reduce((acc, t) => acc + t.womenCount, 0) / teamsData.reduce((acc, t) => acc + t.membersCount, 1)) * 100)}%
                </p>
                <p className="text-[10px] font-bold text-pink-400 mt-2 uppercase tracking-tight">Engagement féminin</p>
              </div>
            </div>

            {/* Monitoring View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tighter">Avancement des soumissions par Zone</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="bg-gray-50 p-4 border border-gray-100"></th>
                        {REGIONS.map(r => (
                          <th key={r.id} className="p-4 bg-gray-50 border border-gray-100 text-[10px] font-black uppercase text-gray-400">{r.name.split('(')[0]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {THEMES.map(theme => (
                        <tr key={theme}>
                          <td className="p-4 border border-gray-100 text-xs font-black text-blue-900 bg-gray-50/50 w-48">{theme}</td>
                          {REGIONS.map(region => {
                            const count = teamsData.filter(t => t.theme === theme && t.region === region.name).length;
                            const submitted = teamsData.filter(t => t.theme === theme && t.region === region.name && (t.status === 'submitted' || t.status === 'selected')).length;
                            return (
                              <td key={region.id} className="p-4 border border-gray-100 text-center">
                                <div className="flex flex-col items-center">
                                   <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${count > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-200'}`}>
                                      {count}
                                   </span>
                                   {count > 0 && <span className="text-[8px] font-bold text-emerald-500 mt-1">{submitted} soumis</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="space-y-6">
                 <div className="bg-blue-900 p-8 rounded-3xl text-white shadow-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-blue-300">Statut des candidatures</h4>
                    <div className="space-y-4">
                       {[
                         { label: 'Soumises / À évaluer', count: teamsData.filter(t => t.status === 'submitted').length, color: 'bg-emerald-500' },
                         { label: 'En cours (Incomplètes)', count: teamsData.filter(t => t.status === 'incomplete').length, color: 'bg-orange-400' },
                         { label: 'Acceptées (Régionale)', count: teamsData.filter(t => t.status === 'selected').length, color: 'bg-blue-400' },
                         { label: 'Refusées', count: teamsData.filter(t => t.status === 'rejected').length, color: 'bg-red-400' },
                       ].map(stat => (
                         <div key={stat.label}>
                            <div className="flex justify-between text-[11px] font-bold mb-2 uppercase">
                               <span>{stat.label}</span>
                               <span>{stat.count}</span>
                            </div>
                            <div className="w-full bg-blue-800 h-2 rounded-full overflow-hidden">
                               <div className={`${stat.color} h-full`} style={{width: `${(stat.count/teamsData.length)*100}%`}}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             {evaluationTeam ? (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                   <div className="bg-blue-900 p-10 text-white flex justify-between items-start">
                      <div>
                        <button onClick={() => setEvaluationTeam(null)} className="text-blue-300 text-xs font-black uppercase mb-4 hover:text-white flex items-center">
                          ← Retour à la liste des dossiers
                        </button>
                        <h2 className="text-3xl font-black">{evaluationTeam.name}</h2>
                        <p className="text-blue-300 uppercase font-black text-xs mt-1 tracking-widest">{evaluationTeam.theme}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">Évaluation Globale</p>
                         <span className="text-5xl font-black">{calculateScore(evaluationTeam).total} <span className="text-xl text-blue-400">/ 100</span></span>
                      </div>
                   </div>

                   <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                      {/* Left: Project Data */}
                      <div className="lg:col-span-7 space-y-10">
                         <section>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 border-b pb-2 tracking-widest">Description détaillée du projet</h4>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-line italic shadow-inner">
                               "{evaluationTeam.description}"
                            </div>
                         </section>

                         <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase mb-8 tracking-widest">Dossier de candidature : Éléments à évaluer</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                  <div className="mb-4">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">CV des participants (x{evaluationTeam.cvLinks.length})</p>
                                     <div className="flex flex-wrap gap-2">
                                        {evaluationTeam.cvLinks.map((cv, i) => (
                                          <a key={i} href={cv} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-[10px] hover:bg-blue-600 hover:text-white transition-all uppercase">P{i+1} CV</a>
                                        ))}
                                        {evaluationTeam.cvLinks.length === 0 && <span className="text-[10px] text-red-500 font-black italic">AUCUN CV TÉLÉVERSÉ</span>}
                                     </div>
                                  </div>
                                  <p className="text-[9px] text-gray-400 font-bold italic">Vérifiez les compétences académiques.</p>
                               </div>

                               <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Média : Vidéo de Pitch</p>
                                  {evaluationTeam.videoUrl ? (
                                    <div className="space-y-4">
                                       <a href={evaluationTeam.videoUrl} target="_blank" className="flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-red-700 transition-all">
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                          <span>Ouvrir la vidéo en ligne</span>
                                       </a>
                                       <p className="text-[9px] text-gray-400 font-bold text-center">Durée estimée : 2-3 minutes.</p>
                                    </div>
                                  ) : <p className="text-[10px] text-gray-400 font-black italic border-2 border-dashed border-gray-100 p-4 rounded-xl text-center uppercase">Aucune vidéo fournie</p>}
                               </div>

                               <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:col-span-2">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Preuve de Concept (POC) / Démonstration</p>
                                  {evaluationTeam.pocUrl ? (
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center">
                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                          </div>
                                          <div>
                                             <p className="text-[11px] font-black text-gray-900 uppercase">Prototype en ligne</p>
                                             <p className="text-[10px] text-gray-400 font-bold">{evaluationTeam.pocUrl}</p>
                                          </div>
                                       </div>
                                       <a href={evaluationTeam.pocUrl} target="_blank" className="px-6 py-2 bg-emerald-600 text-white font-black text-[10px] uppercase rounded-lg shadow-lg hover:bg-emerald-700 transition-all">Tester le POC</a>
                                    </div>
                                  ) : <p className="text-[10px] text-gray-400 font-black italic border-2 border-dashed border-gray-100 p-4 rounded-xl text-center uppercase">Dossier sans prototype fonctionnel</p>}
                               </div>
                            </div>
                         </section>
                      </div>

                      {/* Right: Actions & Scoring */}
                      <div className="lg:col-span-5 space-y-8">
                         <section className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8 shadow-inner">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase mb-6 tracking-widest border-b border-blue-100 pb-2">Décision Administrative</h4>
                            <div className="space-y-6">
                               <button 
                                 onClick={() => handleValidate(evaluationTeam)}
                                 className="w-full py-5 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-3"
                               >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                 <span>Valider pour la Régionale</span>
                               </button>
                               <button 
                                 onClick={() => setShowRejectionModal(true)}
                                 className="w-full py-5 bg-red-100 text-red-600 font-black text-xs rounded-2xl hover:bg-red-200 border-2 border-red-200 uppercase tracking-widest transition-all active:scale-95"
                               >
                                 Rejeter le dossier
                               </button>
                            </div>
                            <div className="mt-8 p-4 bg-white/50 rounded-xl">
                               <p className="text-[9px] text-blue-800 font-bold italic leading-relaxed">
                                  L'acceptation d'un dossier génère l'envoi automatique d'une convocation à l'équipe avec les détails logistiques de sa zone.
                               </p>
                            </div>
                         </section>

                         <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest">Analyse des compétences</h4>
                            <div className="space-y-6">
                               <div>
                                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Transverses / Tech</p>
                                  <div className="flex flex-wrap gap-1">
                                     {evaluationTeam.techSkills.map(s => <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase rounded border border-blue-200">{s}</span>)}
                                  </div>
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Métiers / Thématiques</p>
                                  <div className="flex flex-wrap gap-1">
                                     {evaluationTeam.metierSkills.map(s => <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded border border-emerald-200">{s}</span>)}
                                  </div>
                               </div>
                            </div>
                         </section>
                      </div>
                   </div>
                </div>
             ) : (
                /* Table View with Enhanced Filters */
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-in fade-in duration-500">
                  <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                     <h3 className="text-sm font-black text-blue-900 uppercase">Registre des candidatures</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase">Affichage : {filteredTeams.length} / {teamsData.length} dossiers</p>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="px-6 py-6">Équipe / Leader</th>
                        <th className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="mb-2">Région</span>
                            <select 
                              value={filters.region}
                              onChange={(e) => setFilters({...filters, region: e.target.value})}
                              className="bg-slate-800 text-white border-none rounded-lg px-3 py-2 text-[9px] font-black uppercase outline-none shadow-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="all">Toutes Zones</option>
                              {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name.split('(')[0]}</option>)}
                            </select>
                          </div>
                        </th>
                        <th className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="mb-2">Thématique</span>
                            <select 
                              value={filters.theme}
                              onChange={(e) => setFilters({...filters, theme: e.target.value})}
                              className="bg-slate-800 text-white border-none rounded-lg px-3 py-2 text-[9px] font-black uppercase outline-none shadow-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="all">Tous Enjeux</option>
                              {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </th>
                        <th className="px-6 py-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className="mb-2">Statut</span>
                            <select 
                              value={filters.status}
                              onChange={(e) => setFilters({...filters, status: e.target.value})}
                              className="bg-slate-800 text-white border-none rounded-lg px-3 py-2 text-[9px] font-black uppercase outline-none shadow-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="all">Tous États</option>
                              {Object.keys(STATUS_LABELS).map(k => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                            </select>
                          </div>
                        </th>
                        <th className="px-6 py-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredTeams.map(team => (
                        <tr key={team.id} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-6 py-5">
                            <p className="font-black text-gray-900">{team.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{team.leader}</p>
                          </td>
                          <td className="px-6 py-5">
                             <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded uppercase border border-gray-200">
                                {team.region.split('(')[0]}
                             </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-black text-blue-900 uppercase tracking-tighter line-clamp-1">{team.theme}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${STATUS_COLORS[team.status]}`}>
                              {STATUS_LABELS[team.status]}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <button 
                                onClick={() => setEvaluationTeam(team)}
                                className="opacity-0 group-hover:opacity-100 px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase rounded-xl shadow-xl hover:bg-blue-800 transition-all border border-blue-900 active:scale-95"
                             >
                               Évaluer Dossier
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTeams.length === 0 && (
                    <div className="py-20 text-center">
                       <p className="text-gray-300 font-black uppercase text-sm tracking-widest">Aucun dossier ne correspond aux filtres.</p>
                    </div>
                  )}
                </div>
             )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b pb-6">
                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Diagnostic des Talents par Région</h3>
                <div className="mt-4 md:mt-0 flex space-x-2">
                   {REGIONS.map(r => (
                     <span key={r.id} className="px-3 py-1 bg-gray-100 text-gray-400 text-[8px] font-black uppercase rounded-full">{r.name.split('(')[0]}</span>
                   ))}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {REGIONS.map(region => {
                   const teamsInRegion = teamsData.filter(t => t.region === region.name);
                   const totalMembers = teamsInRegion.reduce((acc, t) => acc + t.membersCount, 0);
                   const techStats = TECH_SKILLS.slice(0, 4).map(skill => ({
                      name: skill,
                      count: teamsInRegion.filter(t => t.techSkills.includes(skill)).length
                   }));

                   return (
                     <div key={region.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:border-blue-200 transition-colors">
                        <h4 className="text-sm font-black text-blue-900 mb-6 uppercase border-b border-gray-100 pb-2">{region.name}</h4>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacité humaine</p>
                              <span className="text-xl font-black text-indigo-600">{totalMembers}</span>
                           </div>
                           
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diversité Tech / 4 tops</p>
                              {techStats.map(stat => (
                                <div key={stat.name}>
                                   <div className="flex justify-between text-[9px] font-bold text-gray-600 mb-1 uppercase tracking-tight">
                                      <span>{stat.name}</span>
                                      <span>{stat.count}</span>
                                   </div>
                                   <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                                      <div className="bg-blue-500 h-full" style={{width: `${(stat.count/Math.max(teamsInRegion.length,1))*100}%`}}></div>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
        )}

        {/* Rejection Modal with Dark Slat Inputs */}
        {showRejectionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/70 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-red-100">
               <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Motif officiel du Rejet</h3>
               <p className="text-xs text-gray-400 uppercase font-bold mb-8 tracking-widest">Équipe : {evaluationTeam?.name}</p>
               
               <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase ml-1">Commentaire pour le chef d'équipe</label>
                  <textarea 
                     value={rejectionComment}
                     onChange={(e) => setRejectionComment(e.target.value)}
                     className="w-full h-44 bg-slate-800 text-white placeholder-slate-400 p-6 rounded-2xl border-none outline-none focus:ring-4 focus:ring-red-100 text-sm font-medium transition-all"
                     placeholder="Détaillez les raisons du rejet (ex: manque d'expert métier, projet hors thématique...)"
                  ></textarea>
               </div>

               <div className="flex space-x-4 mt-10">
                  <button 
                    onClick={() => setShowRejectionModal(false)}
                    className="flex-grow py-4 bg-gray-100 text-gray-600 font-black text-xs rounded-2xl uppercase hover:bg-gray-200 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleRejectSubmit}
                    disabled={!rejectionComment.trim()}
                    className="flex-grow py-4 bg-red-600 text-white font-black text-xs rounded-2xl uppercase hover:bg-red-700 shadow-xl disabled:opacity-50 transition-all active:scale-95"
                  >
                    Confirmer le Rejet & Notifier
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default AdminDashboard;
