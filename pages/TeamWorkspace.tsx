
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Team, StudentProfile, JoinRequest } from '../types';
import { GoogleGenAI } from "@google/genai";

interface TeamWorkspaceProps {
  userProfile: StudentProfile | null;
  team: Team | null;
  setTeam: (t: Team) => void;
  setUserProfile: (p: StudentProfile) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({ userProfile, team, setTeam, setUserProfile, onNavigate, onLogout }) => {
  if (!team) {
    onNavigate('dashboard');
    return null;
  }

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isLeader = userProfile?.teamRole === 'leader';
  const isFull = team.members.length === 5;
  const isSubmitted = team.status === 'submitted' || team.status === 'selected' || team.status === 'rejected';

  const [requests, setRequests] = useState<JoinRequest[]>(isLeader && !isFull && !isSubmitted ? [
    { studentId: 'req-1', studentName: 'Firas Ben Ali', major: 'Urbanisme', techSkills: ['Urbanisme / Aménagement'] },
    { studentId: 'req-2', studentName: 'Maya Trabelsi', major: 'Design', techSkills: ['Design UX / UI'] },
  ] : []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory]);

  const askAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

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
          systemInstruction: `Tu es l'IA Coach FNCT pour le hackathon 2026 "50 ans, 50 innovations". 
          Ton rôle est d'aider l'équipe "${team.name}" travaillant sur le thème "${team.theme}" dans la région "${team.preferredRegion}".
          Sois encourageant, technique et créatif. Utilise tes connaissances sur la Tunisie pour proposer des solutions réalistes.
          Si l'utilisateur pose une question sur l'actualité ou des données locales, utilise la recherche Google.`,
          tools: [{ googleSearch: {} }]
        }
      });

      setAiHistory(prev => [...prev, { role: 'model', text: response.text || "Désolé, j'ai eu un petit bug technique." }]);
    } catch (error) {
      console.error(error);
      setAiHistory(prev => [...prev, { role: 'model', text: "Erreur de connexion avec l'IA." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAcceptRequest = (req: JoinRequest) => {
    if (isFull) return;
    const newMember = {
      id: req.studentId,
      name: req.studentName,
      techSkills: req.techSkills,
      metierSkills: [],
      gender: 'O' as any,
      role: 'member' as any
    };
    const updatedTeam = { 
      ...team, 
      members: [...team.members, newMember],
      status: (team.members.length + 1 === 5) ? 'complete' : 'incomplete' as any
    };
    setTeam(updatedTeam);
    setRequests(prev => prev.filter(r => r.studentId !== req.studentId));
  };

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title={`Workspace : ${team.name}`} 
        subtitle={`Région : ${team.preferredRegion || 'Sud-Est'} | Thème : ${team.theme || 'Développement'}`}
        actions={
          isLeader && !isSubmitted && isFull && (
            <button 
              onClick={() => onNavigate('application-form')}
              className="px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase rounded-2xl hover:bg-blue-700 shadow-xl transition-all"
            >
              Déposer le dossier final
            </button>
          )
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="px-10 py-6 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-sm font-black text-blue-900 uppercase">Membres ({team.members.length}/5)</h3>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${isFull ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                  {isFull ? '✓ Équipe au complet' : 'Effectif incomplet'}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {team.members.map((m, i) => (
                  <li key={i} className="px-10 py-6 flex items-center justify-between hover:bg-blue-50/20 transition-colors">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-700 shadow-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{m.name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                          {m.role === 'leader' ? 'Responsable Projet' : 'Contributeur Technique'} • {m.techSkills[0]}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {isSubmitted && (
              <section className="bg-emerald-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-30"></div>
                <div className="relative z-10">
                   <h3 className="text-2xl font-black uppercase mb-2 tracking-tighter">Candidature en cours de traitement</h3>
                   <p className="text-emerald-300 font-bold uppercase text-[10px] tracking-widest mb-10 italic">L'équipe est verrouillée. Votre dossier est entre les mains du jury.</p>
                </div>
              </section>
            )}
          </div>

          <div className="space-y-10">
             {isLeader && !isFull && !isSubmitted && (
                <section className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                   <h3 className="text-sm font-black text-blue-900 mb-8 uppercase tracking-widest border-b pb-4">Demandes d'adhésion</h3>
                   <div className="space-y-6">
                      {requests.map(req => (
                        <div key={req.studentId} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-blue-200 transition-all">
                           <div className="mb-4">
                              <p className="text-xs font-black text-blue-900 uppercase tracking-tight">{req.studentName}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{req.major}</p>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => handleAcceptRequest(req)} className="py-2.5 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-emerald-700 transition-all">Accepter</button>
                              <button onClick={() => setRequests(prev => prev.filter(r => r.studentId !== req.studentId))} className="py-2.5 border border-gray-200 text-gray-400 text-[9px] font-black uppercase rounded-xl hover:bg-white transition-all">Refuser</button>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
             )}
          </div>
        </div>

        {/* AI COACH FLOATING COMPONENT */}
        <div className="fixed bottom-10 right-10 z-[60]">
          {!isAiOpen ? (
            <button 
              onClick={() => setIsAiOpen(true)}
              className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all animate-bounce hover:animate-none group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="absolute -top-12 right-0 bg-blue-900 text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap tracking-widest">Besoin d'aide ? Coach IA</span>
            </button>
          ) : (
            <div className="w-96 h-[550px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-10 duration-300">
               <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Coach IA FNCT</p>
                      <p className="text-[9px] text-blue-300 font-bold uppercase">Expert Innovation Locale</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAiOpen(false)} className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               
               <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                  {aiHistory.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Posez-moi une question !</p>
                      <div className="space-y-2">
                        <button onClick={() => setAiMessage("Comment innover sur les déchets à Djerba ?")} className="block w-full text-[10px] font-black uppercase p-3 bg-white border border-gray-100 rounded-xl hover:bg-blue-50 transition-colors">"Comment innover sur les déchets à Djerba ?"</button>
                        <button onClick={() => setAiMessage("Aide-nous à rédiger notre vision.")} className="block w-full text-[10px] font-black uppercase p-3 bg-white border border-gray-100 rounded-xl hover:bg-blue-50 transition-colors">"Aide-nous à rédiger notre vision."</button>
                      </div>
                    </div>
                  )}
                  {aiHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start">
                       <div className="bg-white p-4 rounded-2xl border border-gray-100 rounded-bl-none shadow-sm flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
               </div>

               <form onSubmit={askAi} className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Votre question..."
                    className="flex-grow p-4 bg-gray-100 border-none rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button 
                    disabled={isAiLoading}
                    className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg disabled:opacity-50 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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
