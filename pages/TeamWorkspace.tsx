
import React, { useState, useRef, useEffect } from 'react';
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
}

const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({ userProfile, team, setTeam, setUserProfile, onNavigate, onLogout }) => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isLeader = userProfile?.teamRole === 'leader';
  const isFull = (team?.members.length || 0) >= 5;
  const isSubmitted = team?.status === 'submitted' || team?.status === 'selected' || team?.status === 'rejected';

  useEffect(() => {
    if (team?.id && isLeader) {
      fetchJoinRequests();
    }
  }, [team?.id, isLeader]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory]);

  const fetchJoinRequests = async () => {
    const { data, error } = await supabase
      .from('join_requests')
      .select('*, profiles(first_name, last_name, major, tech_skills)')
      .eq('team_id', team!.id)
      .eq('status', 'pending');
    
    if (error) console.error(error);
    else setRequests(data || []);
  };

  const handleAcceptRequest = async (request: any) => {
    if (isFull || !team) return;

    try {
      // 1. Ajouter le membre
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          profile_id: request.student_id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // 2. Mettre à jour la requête
      await supabase
        .from('join_requests')
        .update({ status: 'accepted' })
        .eq('id', request.id);

      // Rafraîchir l'interface (on laisse App.tsx gérer le refresh via fetchUserData ou on force ici)
      alert("Nouveau membre ajouté !");
      window.location.reload(); // Solution simple pour forcer le re-fetch global
    } catch (err: any) {
      alert("Erreur : " + err.message);
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
          systemInstruction: `Tu es le Coach IA du Hackathon FNCT 2026. L'équipe s'appelle "${team.name}", thème "${team.theme}". Aide-les à innover pour les communes tunisiennes.`,
          tools: [{ googleSearch: {} }]
        }
      });
      setAiHistory(prev => [...prev, { role: 'model', text: response.text || "Erreur de réponse." }]);
    } catch (error) {
      setAiHistory(prev => [...prev, { role: 'model', text: "Erreur de connexion IA." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!team) return null;

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title={`Workspace : ${team.name}`} 
        subtitle={`${team.theme} | Région : ${team.preferredRegion}`}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="px-10 py-6 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-sm font-black text-blue-900 uppercase">Équipe ({team.members.length}/5)</h3>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${isFull ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                  {isFull ? '✓ Complet' : 'Incomplet'}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {team.members.map((m, i) => (
                  <li key={i} className="px-10 py-6 flex items-center justify-between hover:bg-blue-50/20 transition-colors">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-700 uppercase">{m.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase">{m.name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                          {m.role === 'leader' ? 'Chef de projet' : 'Membre'} • {m.techSkills?.[0] || 'Généraliste'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-10">
            {isLeader && !isFull && !isSubmitted && (
              <section className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl">
                <h3 className="text-sm font-black text-blue-900 mb-8 uppercase tracking-widest border-b pb-4">Demandes d'adhésion</h3>
                <div className="space-y-6">
                  {requests.length === 0 ? (
                    <p className="text-[10px] text-gray-400 font-bold uppercase text-center italic">Aucune demande en attente</p>
                  ) : (
                    requests.map(req => (
                      <div key={req.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <p className="text-xs font-black text-blue-900 uppercase">{req.profiles.first_name} {req.profiles.last_name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 mb-4">{req.profiles.major}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleAcceptRequest(req)} className="py-2.5 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-emerald-700">Accepter</button>
                          <button onClick={() => supabase.from('join_requests').update({status:'rejected'}).eq('id', req.id).then(() => fetchJoinRequests())} className="py-2.5 border border-gray-200 text-gray-400 text-[9px] font-black uppercase rounded-xl hover:bg-white">Refuser</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* AI COACH UI - Same as before but with real Gemini 3 calls */}
        <div className="fixed bottom-10 right-10 z-[60]">
          {!isAiOpen ? (
            <button onClick={() => setIsAiOpen(true)} className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all group">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          ) : (
            <div className="w-96 h-[550px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-10">
               <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                    <p className="text-xs font-black uppercase">Coach IA FNCT</p>
                  </div>
                  <button onClick={() => setIsAiOpen(false)} className="text-white/50 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
               </div>
               <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                  {aiHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>{m.text}</div>
                    </div>
                  ))}
                  {isAiLoading && <div className="animate-pulse flex space-x-2 p-4 bg-white rounded-2xl w-20"><div className="w-2 h-2 bg-gray-300 rounded-full"></div><div className="w-2 h-2 bg-gray-300 rounded-full"></div><div className="w-2 h-2 bg-gray-300 rounded-full"></div></div>}
                  <div ref={chatEndRef} />
               </div>
               <form onSubmit={askAi} className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
                  <input type="text" value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} placeholder="Posez une question..." className="flex-grow p-4 bg-gray-100 border-none rounded-2xl text-xs outline-none" />
                  <button className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
               </form>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default TeamWorkspace;
