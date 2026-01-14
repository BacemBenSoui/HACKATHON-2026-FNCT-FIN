
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { STATUS_COLORS, STATUS_LABELS, REGIONS, THEMES, TECH_SKILLS } from '../constants';
import { supabase } from '../lib/supabase';

type AdminTab = 'stats' | 'teams' | 'jury';

interface EmailDraft {
  status: string;
  to: string;
  subject: string;
  body: string;
  teamId: string;
}

const AdminDashboard: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [teams, setTeams] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour la modale d'évaluation
  const [evaluatingTeam, setEvaluatingTeam] = useState<any | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [evaluationScores, setEvaluationScores] = useState<Record<string, number>>({});
  
  // États pour la modale d'email
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const { data: teamsData } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!leader_id(first_name, last_name, email),
          members:team_members(
            profile_id,
            role,
            profiles(*)
          )
        `);
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      const mappedTeams = teamsData?.map((t: any) => ({
         ...t,
         status: t.Statut || t.statut || 'incomplete'
      })) || [];

      setTeams(mappedTeams);
      setProfiles(profilesData || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      totalCandidates: profiles.length,
      totalTeams: teams.length,
      submitted: teams.filter(t => t.status === 'submitted').length,
      pending: teams.filter(t => t.status === 'incomplete' || t.status === 'complete').length,
      accepted: teams.filter(t => t.status === 'selected').length,
    };
  }, [teams, profiles]);

  const distributionMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    REGIONS.forEach(r => {
      matrix[r.name] = {};
      THEMES.forEach(t => {
        matrix[r.name][t] = 0;
      });
    });

    teams.forEach(team => {
      if (matrix[team.preferred_region] && matrix[team.preferred_region][team.theme] !== undefined) {
        matrix[team.preferred_region][team.theme]++;
      }
    });
    return matrix;
  }, [teams]);

  const expertiseStats = useMemo(() => {
    const counts: Record<string, number> = {};
    profiles.forEach(p => {
      (p.tech_skills || []).forEach((s: string) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [profiles]);

  const calculateScore = (team: any) => {
    const baseScore = (team.members?.length / 5) * 40; 
    const bonusSkill = (team.requested_skills?.length || 0) * 5;
    const evalScore = evaluationScores[team.id] || 0;
    return Math.min(Math.round(baseScore + bonusSkill + evalScore), 100);
  };

  // Préparation de l'email avant ouverture modale
  const handleDecisionClick = (team: any, status: string) => {
    // Récupération des emails (Chef + Membres)
    const recipients = [
      team.leader?.email,
      ...team.members.map((m: any) => m.profiles?.email)
    ].filter(Boolean).join(', '); // Note: Pour mailto, souvent ';' ou ',' selon le client. ',' est standard web.

    const leaderName = `${team.leader?.first_name || 'Chef'} ${team.leader?.last_name || 'de Projet'}`;
    let subject = "";
    let decisionText = "";

    switch (status) {
      case 'selected':
        subject = `Félicitations ! Acceptation de votre dossier FNCT - ${team.name}`;
        decisionText = "ACCEPTER";
        break;
      case 'rejected':
        subject = `Mise à jour concernant votre candidature FNCT - ${team.name}`;
        decisionText = "REFUSER";
        break;
      case 'waitlist':
        subject = `Votre dossier FNCT en liste d'attente - ${team.name}`;
        decisionText = "METTRE EN ATTENTE";
        break;
      default:
        subject = `Information Hackathon FNCT - ${team.name}`;
        decisionText = "TRAITER";
    }

    const body = `Bonjour ${leaderName} et l'équipe,\n\nSuite à la soumission de votre dossier de candidature au hackathon FNCT 2026, les membres du jury ont décidé de ${decisionText} votre dossier.\n\nNous restons à votre disposition pour tout complément d'information.\n\nCordialement,\nLe Jury FNCT 2026`;

    setEmailDraft({
      teamId: team.id,
      status: status,
      to: recipients,
      subject: subject,
      body: body
    });
  };

  const handleSendEmailAndSave = async () => {
    if (!emailDraft) return;

    // 1. Mise à jour Base de Données
    const { error } = await supabase.from('teams').update({ Statut: emailDraft.status }).eq('id', emailDraft.teamId);
    
    if (error) {
       console.error("Erreur update statut:", error);
       alert("Erreur lors de la mise à jour BDD : " + error.message);
       return;
    }

    // 2. Ouverture Client Mail
    const mailtoLink = `mailto:?bcc=${encodeURIComponent(emailDraft.to)}&subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`;
    window.location.href = mailtoLink;

    // 3. Fermeture et Rafraîchissement
    setEmailDraft(null);
    setEvaluatingTeam(null);
    await fetchAdminData();
    alert("Statut mis à jour et client mail ouvert.");
  };

  const handleExportCSV = () => {
    const headers = [
      "ID Candidat", "Prénom", "Nom", "Email", "Téléphone", "Université", "Niveau", "Genre",
      "Compétences Techniques", "Compétences Métier",
      "Nom Équipe", "ID Équipe", "Région", "Thème", "Statut Dossier", "Rôle dans l'équipe"
    ];

    const rows = profiles.map(profile => {
      const associatedTeam = teams.find(t => 
        t.members.some((m: any) => m.profile_id === profile.id)
      );

      let teamInfo = {
        name: "Sans équipe",
        id: "",
        region: "",
        theme: "",
        status: "",
        role: "Aucun"
      };

      if (associatedTeam) {
        const memberRecord = associatedTeam.members.find((m: any) => m.profile_id === profile.id);
        teamInfo = {
          name: associatedTeam.name || "N/A",
          id: associatedTeam.id || "",
          region: associatedTeam.preferred_region || "",
          theme: associatedTeam.theme || "",
          status: STATUS_LABELS[associatedTeam.status] || associatedTeam.status,
          role: memberRecord?.role === 'leader' ? "Chef de Projet" : "Membre Expert"
        };
      }

      const clean = (text: string) => `"${(text || '').toString().replace(/"/g, '""')}"`;

      return [
        clean(profile.id),
        clean(profile.first_name),
        clean(profile.last_name),
        clean(profile.email),
        clean(profile.phone),
        clean(profile.university),
        clean(profile.level),
        clean(profile.gender),
        clean((profile.tech_skills || []).join(', ')),
        clean((profile.metier_skills || []).join(', ')),
        clean(teamInfo.name),
        clean(teamInfo.id),
        clean(teamInfo.region),
        clean(teamInfo.theme),
        clean(teamInfo.status),
        clean(teamInfo.role)
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FNCT2026_Export_Global_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
       <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-900">Initialisation du Pilotage...</p>
       </div>
    </div>
  );

  return (
    <Layout userType="admin" onNavigate={onNavigate}>
      <DashboardHeader 
        title="Centre de Pilotage FNCT 2026" 
        subtitle="Saison Innovation Territoriale - 50 ans de la Fédération."
        actions={
          <button 
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-5 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
            title="Télécharger la base de données complète"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Export Excel (.csv)</span>
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <div className="flex space-x-2 bg-gray-100 p-2 rounded-[2rem] w-fit">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-white text-blue-900 shadow-xl' : 'text-gray-400 hover:text-blue-900'}`}
          >
            Vue d'Ensemble
          </button>
          <button 
            onClick={() => setActiveTab('teams')}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'teams' ? 'bg-white text-blue-900 shadow-xl' : 'text-gray-400 hover:text-blue-900'}`}
          >
            Gestion des Équipes
          </button>
          <button 
            onClick={() => setActiveTab('jury')}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'jury' ? 'bg-white text-blue-900 shadow-xl' : 'text-gray-400 hover:text-blue-900'}`}
          >
            Jury & Évaluation
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { label: "Candidats", val: stats.totalCandidates, color: "text-blue-600" },
                { label: "Équipes", val: stats.totalTeams, color: "text-blue-900" },
                { label: "Soumis", val: stats.submitted, color: "text-emerald-600" },
                { label: "En Attente", val: stats.pending, color: "text-orange-500" },
                { label: "Acceptés", val: stats.accepted, color: "text-blue-900" }
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <p className="text-[9px] font-black uppercase text-gray-400 mb-2 tracking-widest">{s.label}</p>
                  <p className={`text-4xl font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            <section className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-8 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Distribution Régionale par Thème</h3>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Nombre d'équipes par segment</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white border-b">
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Région / Pôle</th>
                        {THEMES.map(t => (
                          <th key={t} className="px-4 py-5 text-[8px] font-black text-blue-900 uppercase text-center max-w-[100px] leading-tight">{t}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {REGIONS.map(region => (
                        <tr key={region.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-8 py-5 text-[10px] font-black text-blue-900 uppercase">{region.name}</td>
                          {THEMES.map(theme => (
                            <td key={theme} className="px-4 py-5 text-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${distributionMatrix[region.name][theme] > 0 ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-300'}`}>
                                {distributionMatrix[region.name][theme]}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b">
                 <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                   <th className="px-10 py-6">Équipe & Pôle</th>
                   <th className="px-10 py-6">Effectif</th>
                   <th className="px-10 py-6">Thématiques (P | S)</th>
                   <th className="px-10 py-6">État Dossier</th>
                   <th className="px-10 py-6 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {teams.map(team => (
                    <tr key={team.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-10 py-6">
                        <p className="text-xs font-black text-blue-900 uppercase leading-none">{team.name}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">{team.preferred_region}</p>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex items-center space-x-2">
                            <span className={`text-xs font-black ${team.members?.length === 5 ? 'text-emerald-600' : 'text-blue-900'}`}>{team.members?.length}/5</span>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600" style={{ width: `${(team.members?.length / 5) * 100}%` }}></div>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-6 max-w-xs">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-blue-900 uppercase truncate">P: {team.theme}</p>
                            <p className="text-[9px] font-bold text-emerald-600 uppercase truncate">S: {team.secondary_theme || 'N/A'}</p>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                         <span className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-full border ${STATUS_COLORS[team.status]}`}>
                            {STATUS_LABELS[team.status]}
                         </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <button onClick={() => setEvaluatingTeam(team)} className="px-4 py-2 bg-blue-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-blue-800 transition-all">Consulter</button>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'jury' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-8 border-b pb-4">Top Expertises présentes sur la plateforme</h3>
                <div className="flex flex-wrap gap-4">
                   {expertiseStats.slice(0, 8).map(([skill, count]) => (
                     <div key={skill} className="flex items-center space-x-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black text-blue-900 uppercase">{skill}</span>
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{count as any}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-blue-900 text-white">
                      <tr className="text-[10px] font-black uppercase tracking-widest">
                         <th className="px-10 py-6">Innovation Projet</th>
                         <th className="px-10 py-6">Pôle</th>
                         <th className="px-10 py-6">Effectif</th>
                         <th className="px-10 py-6 text-center">Score Global</th>
                         <th className="px-10 py-6">Statut</th>
                         <th className="px-10 py-6 text-right">Évaluation</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {teams.filter(t => t.status === 'submitted' || t.status === 'selected').map(team => (
                        <tr key={team.id} className="hover:bg-blue-50/50 transition-colors">
                           <td className="px-10 py-7">
                              <p className="text-sm font-black text-blue-900 uppercase tracking-tighter leading-none">{team.name}</p>
                              <p className="text-[8px] font-bold text-gray-400 uppercase mt-2">{team.theme}</p>
                           </td>
                           <td className="px-10 py-7 text-[10px] font-black text-gray-500 uppercase">{team.preferred_region}</td>
                           <td className="px-10 py-7">
                              <span className="px-3 py-1 bg-blue-50 text-blue-900 text-[10px] font-black rounded-lg">{team.members?.length}/5</span>
                           </td>
                           <td className="px-10 py-7 text-center">
                              <p className="text-xl font-black text-blue-600 leading-none">{calculateScore(team)}</p>
                              <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">/ 100</p>
                           </td>
                           <td className="px-10 py-7">
                              <span className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-full border ${STATUS_COLORS[team.status]}`}>
                                {STATUS_LABELS[team.status]}
                              </span>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <button 
                                onClick={() => setEvaluatingTeam(team)}
                                className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-700 shadow-lg active:scale-95 transition-all"
                              >
                                Évaluer
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* MODALE D'ÉVALUATION DU DOSSIER */}
        {evaluatingTeam && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/90 backdrop-blur-md overflow-y-auto">
             <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b bg-gray-50 flex justify-between items-center shrink-0">
                   <div>
                      <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Dossier Technique de Candidature</h2>
                      <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">{evaluatingTeam.name}</h3>
                   </div>
                   <button onClick={() => setEvaluatingTeam(null)} className="p-4 bg-gray-200 text-gray-600 rounded-[2rem] hover:bg-red-50 hover:text-red-500 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>

                <div className="flex-grow overflow-y-auto p-12 space-y-16">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                      <div className="space-y-10">
                         <section className="space-y-4">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-2">Ressources Déposées</h4>
                            <div className="space-y-3">
                               {evaluatingTeam.motivation_url && (
                                 <a href={evaluatingTeam.motivation_url} target="_blank" className="flex items-center justify-between p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 hover:bg-emerald-100 transition-all group">
                                    <span className="text-[10px] font-black uppercase">Mémoire Motivation (PDF)</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                 </a>
                               )}
                               {evaluatingTeam.video_url && (
                                 <a href={evaluatingTeam.video_url} target="_blank" className="flex items-center justify-between p-5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 hover:bg-blue-100 transition-all group">
                                    <span className="text-[10px] font-black uppercase">Pitch Vidéo (MP4/URL)</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                 </a>
                               )}
                               {evaluatingTeam.poc_url && (
                                 <a href={evaluatingTeam.poc_url} target="_blank" className="flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all group">
                                    <span className="text-[10px] font-black uppercase">Source / POC Prototype</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                 </a>
                               )}
                            </div>
                         </section>

                         <section className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 space-y-6">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-2">Notation Jury</h4>
                            <div className="space-y-4">
                               <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Score Qualitatif (/40)</label>
                               <input 
                                 type="range" 
                                 min="0" max="40" 
                                 value={evaluationScores[evaluatingTeam.id] || 0} 
                                 onChange={(e) => setEvaluationScores({...evaluationScores, [evaluatingTeam.id]: parseInt(e.target.value)})} 
                                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                               />
                               <div className="flex justify-between text-lg font-black text-blue-900">
                                  <span>0</span>
                                  <span>{evaluationScores[evaluatingTeam.id] || 0}</span>
                                  <span>40</span>
                               </div>
                            </div>
                            <div className="pt-4 flex flex-col gap-3">
                               <button onClick={() => handleDecisionClick(evaluatingTeam, 'selected')} className="w-full py-5 bg-emerald-600 text-white text-[11px] font-black uppercase rounded-2xl shadow-xl hover:bg-emerald-700 transition-all">SÉLECTIONNER</button>
                               <button onClick={() => handleDecisionClick(evaluatingTeam, 'rejected')} className="w-full py-5 bg-red-600 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-red-700 transition-all">REJETER</button>
                               <button onClick={() => handleDecisionClick(evaluatingTeam, 'waitlist')} className="w-full py-5 border-2 border-orange-200 text-orange-500 text-[11px] font-black uppercase rounded-2xl hover:bg-orange-50 transition-all">LISTE D'ATTENTE</button>
                            </div>
                         </section>
                      </div>

                      <div className="lg:col-span-2 space-y-12">
                         <section className="space-y-4">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-2">Résumé de l'Impact</h4>
                            <div className="p-10 bg-blue-50/50 rounded-[3rem] border border-blue-100 italic text-blue-900/70 text-base leading-relaxed">
                               "{evaluatingTeam.description || "Aucun pitch écrit fourni."}"
                            </div>
                         </section>

                         <section className="space-y-6">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-2">Composition Nominative (Cliquez pour les détails)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {evaluatingTeam.members?.map((m: any, idx: number) => (
                                 <button 
                                   key={idx} 
                                   onClick={() => setSelectedCandidate(m.profiles)}
                                   className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-left group"
                                 >
                                    <div className="flex items-center space-x-4">
                                       <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                          {m.profiles?.first_name?.charAt(0)}
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-blue-900 uppercase leading-none">{m.profiles?.first_name} {m.profiles?.last_name}</p>
                                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{m.role === 'leader' ? 'Chef de Projet' : 'Expert'}</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Fiche Profil →</span>
                                    </div>
                                 </button>
                               ))}
                            </div>
                         </section>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* MODALE D'ENVOI D'EMAIL (NEW) */}
        {emailDraft && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
             <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
                <div className="bg-blue-900 px-8 py-6 flex justify-between items-center">
                   <h3 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Communication Jury
                   </h3>
                   <button onClick={() => setEmailDraft(null)} className="text-white/50 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                
                <div className="p-8 space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Destinataires (Cachés)</label>
                      <input 
                         type="text" 
                         readOnly 
                         value={emailDraft.to} 
                         className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600" 
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Sujet</label>
                      <input 
                         type="text" 
                         value={emailDraft.subject} 
                         onChange={(e) => setEmailDraft({...emailDraft, subject: e.target.value})} 
                         className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-600 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Corps du message</label>
                      <textarea 
                         rows={8}
                         value={emailDraft.body}
                         onChange={(e) => setEmailDraft({...emailDraft, body: e.target.value})} 
                         className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm leading-relaxed text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none" 
                      ></textarea>
                   </div>
                </div>

                <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                   <button onClick={() => setEmailDraft(null)} className="px-6 py-3 text-gray-500 font-bold text-xs uppercase hover:bg-gray-200 rounded-xl transition-all">Annuler</button>
                   <button 
                      onClick={handleSendEmailAndSave} 
                      className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                   >
                      <span>Confirmer & Envoyer</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* MODALE CANDIDAT (EXISTANTE) */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-lg" onClick={() => setSelectedCandidate(null)}></div>
             <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                <div className="p-10 bg-blue-900 text-white flex items-center space-x-6">
                   <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl font-black uppercase border border-white/20">
                      {selectedCandidate.first_name?.charAt(0)}
                   </div>
                   <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{selectedCandidate.first_name} {selectedCandidate.last_name}</h4>
                      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-2">{selectedCandidate.major}</p>
                   </div>
                   <button onClick={() => setSelectedCandidate(null)} className="absolute top-8 right-8 text-white/50 hover:text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                
                <div className="p-10 space-y-8">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                         <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Université</p>
                         <p className="text-[10px] font-black text-blue-900 uppercase">{selectedCandidate.university}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                         <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Niveau</p>
                         <p className="text-[10px] font-black text-blue-900 uppercase">{selectedCandidate.level}</p>
                      </div>
                   </div>

                   <section className="space-y-4">
                      <p className="text-[9px] font-black text-blue-900 uppercase border-b pb-2">Expertises Déclarées</p>
                      <div className="flex flex-wrap gap-2">
                         {selectedCandidate.metier_skills?.map((s: string) => (
                           <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase rounded-lg border border-emerald-100">{s}</span>
                         ))}
                         {selectedCandidate.tech_skills?.map((s: string) => (
                           <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-[8px] font-black uppercase rounded-lg border border-blue-100">{s}</span>
                         ))}
                      </div>
                   </section>

                   <section className="space-y-2">
                      <p className="text-[9px] font-black text-blue-900 uppercase border-b pb-2">Bio & Motivations</p>
                      <p className="text-xs text-gray-500 leading-relaxed italic">"{selectedCandidate.other_skills || "Aucun résumé fourni."}"</p>
                   </section>

                   {selectedCandidate.cv_url && (
                     <a href={selectedCandidate.cv_url} target="_blank" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center space-x-3 shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Voir le Curriculum Vitae</span>
                     </a>
                   )}
                </div>
             </div>
          </div>
        )}

      </main>
    </Layout>
  );
};

export default AdminDashboard;
