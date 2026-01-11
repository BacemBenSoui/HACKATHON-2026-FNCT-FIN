
import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Team, StudentProfile, JoinRequest } from '../types';

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

  const isLeader = userProfile?.teamRole === 'leader';
  const isFull = team.members.length === 5;
  const isSubmitted = team.status === 'submitted' || team.status === 'selected' || team.status === 'rejected';

  // Mock de demandes d'adhésion si on est leader et l'équipe n'est pas pleine
  const [requests, setRequests] = useState<JoinRequest[]>(isLeader && !isFull && !isSubmitted ? [
    { studentId: 'req-1', studentName: 'Firas Ben Ali', major: 'Urbanisme', techSkills: ['Urbanisme / Aménagement'] },
    { studentId: 'req-2', studentName: 'Maya Trabelsi', major: 'Design', techSkills: ['Design UX / UI'] },
  ] : []);

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
    alert(`${req.studentName} a été ajouté à l'équipe !`);
  };

  const handleRejectRequest = (reqId: string) => {
    setRequests(prev => prev.filter(r => r.studentId !== reqId));
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Members List */}
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
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest ${m.role === 'leader' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {m.role === 'leader' ? 'Chef' : 'Membre'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Application Progress / Eligibility */}
            {!isSubmitted && (
               <section className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">
                  <h3 className="text-sm font-black text-blue-900 mb-8 uppercase tracking-widest">Statut d'Éligibilité</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-2xl border-2 ${isFull ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                      <p className="text-[10px] font-black uppercase mb-1">Effectif Minimal</p>
                      <p className="text-lg font-black">{team.members.length} / 5 membres</p>
                      <p className="text-[9px] font-bold mt-2 uppercase">{isFull ? 'Condition remplie' : 'Recrutement requis'}</p>
                    </div>
                    <div className="p-6 rounded-2xl border-2 bg-blue-50 border-blue-100 text-blue-700">
                      <p className="text-[10px] font-black uppercase mb-1">Composition</p>
                      <p className="text-lg font-black">Pluridisciplinaire</p>
                      <p className="text-[9px] font-bold mt-2 uppercase">Vérifié automatiquement</p>
                    </div>
                  </div>
               </section>
            )}

            {isSubmitted && (
              <section className="bg-emerald-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-30"></div>
                <div className="relative z-10">
                   <h3 className="text-2xl font-black uppercase mb-2 tracking-tighter">Candidature en cours de traitement</h3>
                   <p className="text-emerald-300 font-bold uppercase text-[10px] tracking-widest mb-10 italic">L'équipe est verrouillée. Votre dossier est entre les mains du jury.</p>
                   
                   <div className="flex items-center space-x-4 mb-8">
                      <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xs font-black uppercase">Statut : {team.status === 'submitted' ? 'Soumis / À l\'examen' : team.status.toUpperCase()}</span>
                   </div>

                   <button disabled className="px-8 py-4 bg-emerald-800 text-white/50 border border-emerald-700 font-black text-[10px] uppercase rounded-2xl cursor-not-allowed">
                     Modification impossible
                   </button>
                </div>
              </section>
            )}
          </div>

          {/* Leader Panel / Invitations */}
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
                           <div className="flex flex-wrap gap-1 mb-6">
                              {req.techSkills.map(s => <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded uppercase">{s}</span>)}
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => handleAcceptRequest(req)}
                                className="py-2.5 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all"
                              >
                                Accepter
                              </button>
                              <button 
                                onClick={() => handleRejectRequest(req.studentId)}
                                className="py-2.5 border border-gray-200 text-gray-400 text-[9px] font-black uppercase rounded-xl hover:bg-white transition-all"
                              >
                                Refuser
                              </button>
                           </div>
                        </div>
                      ))}
                      {requests.length === 0 && (
                        <p className="text-center py-6 text-gray-300 font-black uppercase text-[9px] tracking-widest italic leading-relaxed">
                          En attente de nouvelles<br/>candidatures spontanées...
                        </p>
                      )}
                   </div>
                </section>
             )}

             <section className="bg-blue-900 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-800 rounded-full blur-2xl -ml-12 -mt-12 opacity-50"></div>
                <h3 className="text-sm font-black uppercase mb-6 tracking-widest text-blue-300">Information Clé</h3>
                <p className="text-xs font-medium leading-relaxed italic mb-8">
                  "Un chef d'équipe est verrouillé sur sa propre structure. Une fois l'équipe de 5 constituée, le profil est figé pour garantir la stabilité de la solution."
                </p>
                <div className="h-1 bg-blue-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-400" style={{width: `${(team.members.length/5)*100}%`}}></div>
                </div>
                <p className="text-[9px] font-black text-blue-400 uppercase mt-4 text-right">FNCT Charter 2026</p>
             </section>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default TeamWorkspace;
