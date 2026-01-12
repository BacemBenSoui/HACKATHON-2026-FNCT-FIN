
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Team, StudentProfile } from '../types';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../lib/supabase';

interface TeamWorkspaceProps {
  userProfile: StudentProfile | null;
  team: Team | null;
  setTeam: (t: Team) => void;
  setUserProfile: (p: StudentProfile) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  refreshData?: () => Promise<void>;
}

const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({ userProfile, team, setTeam, setUserProfile, onNavigate, onLogout, refreshData }) => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const isLeader = userProfile?.teamRole === 'leader';
  const membersCount = team?.members.length || 0;
  const isFull = membersCount >= 5;
  const isSubmitted = team?.status === 'submitted' || team?.status === 'selected' || team?.status === 'rejected';

  const compliance = useMemo(() => {
    if (!team) return null;
    const femaleCount = team.members.filter(m => m.gender === 'F').length;
    const skills = new Set(team.members.flatMap(m => m.techSkills || []));
    const isTechPresent = team.members.some(m => m.techSkills?.some(s => ['Développement logiciel', 'Data / Intelligence Artificielle'].includes(s)));
    
    return {
      fiveMembers: team.members.length === 5,
      twoWomen: femaleCount >= 2,
      diversity: skills.size >= 3,
      techProfile: isTechPresent,
      totalOk: team.members.length === 5 && femaleCount >= 2 && skills.size >= 3 && isTechPresent
    };
  }, [team]);

  useEffect(() => {
    if (team?.id && isLeader) {
      fetchJoinRequests();
    }
  }, [team?.id, isLeader]);

  const fetchJoinRequests = async () => {
    const { data, error } = await supabase
      .from('join_requests')
      .select('*, profiles(first_name, last_name, university, level, major, metier_skills, other_skills, gender)')
      .eq('team_id', team!.id)
      .eq('status', 'pending');
    
    if (error) console.error("Erreur requêtes:", error);
    else setRequests(data || []);
  };

  const fetchMemberProfile = async (profileId: string) => {
    setIsProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) throw error;
      setSelectedMemberProfile(data);
    } catch (err) {
      console.error("Erreur profil membre:", err);
      alert("Impossible de charger la fiche candidat.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleAcceptRequest = async (request: any) => {
    if (!team) return;
    setProcessingRequestId(request.id);

    try {
      // 1. VÉRIFICATION CRITIQUE DU NOMBRE RÉEL EN BASE (Sécurité anti-plantage)
      const { count, error: countError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id);

      if (countError) throw countError;

      if (count !== null && count >= 5) {
        alert("Action impossible : L'équipe est déjà au complet (5 membres).");
        // Auto-refus préventif pour les autres si quota atteint
        await supabase.from('join_requests').update({ status: 'rejected' }).eq('team_id', team.id).eq('status', 'pending');
        await fetchJoinRequests();
        return;
      }

      // 2. INSERTION DU MEMBRE
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          profile_id: request.student_id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // 3. MISE À JOUR DE LA REQUÊTE
      const { error: requestError } = await supabase
        .from('join_requests')
        .update({ status: 'accepted' })
        .eq('id', request.id);
        
      if (requestError) throw requestError;

      // 4. LOGIQUE D'AUTO-REFUS : Si on vient d'ajouter le 5ème
      const newTotal = (count || 0) + 1;
      if (newTotal >= 5) {
        await supabase
          .from('join_requests')
          .update({ status: 'rejected' })
          .eq('team_id', team.id)
          .eq('status', 'pending');
      }

      alert(`✅ Candidat approuvé ! Effectif : ${newTotal}/5`);
      
      // 5. RAFRAÎCHISSEMENT ORDONNÉ
      if (refreshData) {
        await refreshData();
      }
      await fetchJoinRequests();
      
    } catch (err: any) {
      console.error("Erreur critique approbation:", err);
      alert("Erreur de synchronisation : " + (err.message || "Vérifiez vos permissions."));
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      
      if (error) throw error;
      await fetchJoinRequests();
    } catch (err: any) {
      alert("Erreur lors du refus : " + err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const askAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim() || !team) return;

    const userText = aiMessage;
    setAiHistory(prev => [...prev, { role: 'user', text: userText }]);
    setAiMessage('');
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...aiHistory, { role: 'user', text: userText }].map(m => ({
          parts: [{ text: m.text }],
          role: m.role === 'user' ? 'user' : 'model'
        })),
        config: {
          systemInstruction: `Tu es le Coach IA FNCT 2026. Tu aides l'équipe sur le thème ${team.theme}.`,
          tools: [{ googleSearch: {} }]
        }
      });
      
      let replyText = response.text || "Erreur de réponse de l'IA.";
      setAiHistory(prev => [...prev, { role: 'model', text: replyText }]);
    } catch (error) {
      setAiHistory(prev => [...prev, { role: 'model', text: "Service IA indisponible." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!team) return null;

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate} currentTeamId={team.id}>
      <DashboardHeader 
        title={`Espace de Pilotage : ${team.name}`} 
        subtitle={`${team.theme} | Région : ${team.preferredRegion}`}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Résumé de conformité */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`p-8 rounded-[2.5rem] border ${compliance?.fiveMembers ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'} transition-colors`}>
            <p className="text-[9px] font-black uppercase text-gray-400 mb-2 tracking-widest">Effectif (Requis: 5)</p>
            <p className={`text-3xl font-black ${compliance?.fiveMembers ? 'text-emerald-600' : 'text-blue-900'}`}>{team.members.length}/5</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border ${compliance?.twoWomen ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'} transition-colors`}>
            <p className="text-[9px] font-black uppercase text-gray-400 mb-2 tracking-widest">Mixité (Requis: 2F)</p>
            <p className={`text-3xl font-black ${compliance?.twoWomen ? 'text-emerald-600' : 'text-orange-600'}`}>{team.members.filter(m => m.gender === 'F').length}/2</p>
          </div>
          <div className="p-8 rounded-[2.5rem] border bg-gray-50 border-gray-100 md:col-span-2 flex items-center justify-between">
            <div>
               <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Statut du Dossier</p>
               <p className="text-xl font-black text-blue-900 uppercase">{team.status === 'submitted' ? 'Dossier Transmis' : 'En cours de constitution'}</p>
            </div>
            {isLeader && isFull && !isSubmitted && (
              <button onClick={() => onNavigate('application-form')} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-700 shadow-xl animate-pulse">
                Finaliser le dépôt
              </button>
            )}
          </div>
        </div>

        {/* Liste des membres actuels */}
        <section className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden">
          <div className="px-10 py-6 bg-gray-50 border-b">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">L'Équipe Actuelle</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 divide-x divide-gray-100">
            {team.members.map((m, i) => (
              <div key={i} className="p-8 flex flex-col items-center text-center space-y-4 hover:bg-blue-50/20 transition-colors">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl uppercase ${m.role === 'leader' ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {m.name.charAt(0)}
                </div>
                <button 
                  onClick={() => fetchMemberProfile(m.id)}
                  className="group"
                >
                  <p className="text-[11px] font-black text-gray-900 uppercase leading-tight group-hover:text-blue-600 group-hover:underline transition-all decoration-2 underline-offset-4">{m.name}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{m.role === 'leader' ? 'Chef de Projet' : 'Expert'}</p>
                </button>
                <div className="flex flex-wrap justify-center gap-1">
                  {m.techSkills?.slice(0, 2).map(s => <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[7px] font-black uppercase rounded">{s}</span>)}
                </div>
              </div>
            ))}
            {Array.from({ length: 5 - team.members.length }).map((_, i) => (
              <div key={`empty-${i}`} className="p-8 flex flex-col items-center justify-center border-dashed border-2 border-gray-50 text-gray-200">
                 <p className="text-[8px] font-black uppercase tracking-widest">Poste vacant</p>
              </div>
            ))}
          </div>
        </section>

        {/* TABLEAU DES CANDIDATURES EN ATTENTE */}
        {isLeader && !isFull && (
          <section className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-10 py-8 border-b bg-blue-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">Demandes d'adhésion en attente</h3>
                <p className="text-[9px] font-bold uppercase text-blue-300 mt-1">Gérez vos futurs talents pour atteindre l'effectif de 5</p>
              </div>
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase">{requests.length} Postulants</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-10 py-5">Candidat</th>
                    <th className="px-10 py-5">Université & Niveau</th>
                    <th className="px-10 py-5">Expertises Métier</th>
                    <th className="px-10 py-5">Autres Atouts</th>
                    <th className="px-10 py-5 text-right">Décision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center">
                        <p className="text-gray-300 font-black uppercase text-[10px] tracking-[0.3em]">Aucune nouvelle demande pour le moment</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req.id} className="hover:bg-blue-50/10 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => fetchMemberProfile(req.student_id)}
                              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xs uppercase hover:bg-blue-600 hover:text-white transition-colors"
                            >
                              {req.profiles?.first_name?.charAt(0) || '?'}
                            </button>
                            <div>
                              <button onClick={() => fetchMemberProfile(req.student_id)} className="text-[11px] font-black text-blue-900 uppercase hover:underline">
                                {req.profiles?.first_name} {req.profiles?.last_name}
                              </button>
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{req.profiles?.major}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-[10px] font-black text-gray-700 uppercase">{req.profiles?.university}</p>
                          <p className="text-[9px] font-medium text-gray-400">{req.profiles?.level}</p>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {req.profiles?.metier_skills?.map((s: string) => (
                              <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[7px] font-black uppercase rounded border border-emerald-100">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-[9px] text-gray-500 italic line-clamp-2 max-w-[250px]">
                            {req.profiles?.other_skills || "Aucune information complémentaire"}
                          </p>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleRejectRequest(req.id)}
                              disabled={!!processingRequestId}
                              className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30"
                              title="Refuser"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <button 
                              onClick={() => handleAcceptRequest(req)}
                              disabled={!!processingRequestId}
                              className="px-6 py-3 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-emerald-700 shadow-lg active:scale-95 transition-all disabled:opacity-30 flex items-center space-x-2"
                            >
                              {processingRequestId === req.id ? (
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              ) : (
                                <span>APPROUVER</span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* MODAL FICHE CANDIDAT */}
        {(selectedMemberProfile || isProfileLoading) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" onClick={() => setSelectedMemberProfile(null)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              {isProfileLoading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase text-blue-900 tracking-widest">Chargement de la fiche...</p>
                </div>
              ) : selectedMemberProfile && (
                <>
                  <div className="p-8 bg-blue-900 text-white flex justify-between items-start">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl font-black uppercase border border-white/20">
                        {selectedMemberProfile.first_name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter">{selectedMemberProfile.first_name} {selectedMemberProfile.last_name}</h4>
                        <p className="text-[10px] font-bold uppercase text-blue-300 tracking-[0.2em] mt-1">{selectedMemberProfile.major}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedMemberProfile(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
                    <section className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Établissement</p>
                        <p className="text-xs font-black text-blue-900 uppercase">{selectedMemberProfile.university}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Niveau</p>
                        <p className="text-xs font-black text-blue-900 uppercase">{selectedMemberProfile.level}</p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-2">Expertises Métier & Tech</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedMemberProfile.metier_skills?.map((s: string) => (
                          <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-lg border border-emerald-100">{s}</span>
                        ))}
                        {selectedMemberProfile.tech_skills?.map((s: string) => (
                          <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-lg border border-blue-100">{s}</span>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h5 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b pb-2">Biographie / Atouts</h5>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                        "{selectedMemberProfile.other_skills || "Aucune description fournie."}"
                      </p>
                    </section>

                    {selectedMemberProfile.cv_url && (
                      <div className="pt-4">
                        <a 
                          href={selectedMemberProfile.cv_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-5 bg-gray-50 border border-gray-100 text-blue-600 rounded-2xl flex items-center justify-center space-x-3 hover:bg-blue-50 transition-colors group"
                        >
                          <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Consulter le CV (PDF)</span>
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8 bg-gray-50 text-center border-t">
                     <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Document confidentiel - Usage Hackathon FNCT uniquement</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* AI COACH FLOATING BUTTON */}
        <div className="fixed bottom-10 right-10 z-[60]">
          {!isAiOpen ? (
            <button onClick={() => setIsAiOpen(true)} className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all border-4 border-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          ) : (
            <div className="w-[400px] h-[550px] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-right-10 duration-500">
               <div className="p-8 bg-blue-900 text-white flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Assistant Stratégique</p>
                    <p className="text-sm font-black uppercase tracking-tighter">Coach IA Hackathon</p>
                  </div>
                  <button onClick={() => setIsAiOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-gray-50/50 no-scrollbar">
                  {aiHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-2xl text-[10px] font-medium leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && <div className="flex justify-start"><div className="bg-gray-200 w-12 h-6 rounded-full animate-pulse"></div></div>}
               </div>
               <form onSubmit={askAi} className="p-6 bg-white border-t flex items-center space-x-3">
                  <input type="text" value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} placeholder="Comment optimiser notre POC ?" className="flex-grow p-4 bg-gray-100 rounded-2xl text-[10px] outline-none font-bold" />
                  <button type="submit" className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
               </form>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default TeamWorkspace;
