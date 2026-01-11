
import React from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { StudentProfile, Team } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

interface DashboardProps {
  userProfile: StudentProfile | null;
  userTeam: Team | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, userTeam, onNavigate, onLogout }) => {
  const isInTeam = !!userProfile?.currentTeamId;
  const isLeader = userProfile?.teamRole === 'leader';

  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title={`Bienvenue, ${userProfile?.firstName}`} 
        subtitle={isInTeam ? `Membre de l'équipe : ${userTeam?.name}` : "Prêt à transformer les communes tunisiennes ?"}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Status Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
               <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mon Profil</p>
                <h3 className="font-black text-blue-900 uppercase">Candidat</h3>
               </div>
              <span className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-tight ${userProfile?.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                {userProfile?.isComplete ? 'Complet' : 'Incomplet'}
              </span>
            </div>
            {!userProfile?.isComplete && (
              <button 
                onClick={() => onNavigate('profile')}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
              >
                Compléter le profil
              </button>
            )}
            {userProfile?.isComplete && (
              <p className="text-xs text-gray-400 font-bold italic leading-relaxed">Votre profil est prêt. Vous pouvez postuler ou créer une équipe.</p>
            )}
          </div>

          {/* Team Status Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
               <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mon Équipe</p>
                <h3 className="font-black text-blue-900 uppercase">{isLeader ? 'Chef d\'équipe' : isInTeam ? 'Membre' : 'Aucune'}</h3>
               </div>
              {userTeam && (
                <span className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-tight ${STATUS_COLORS[userTeam.status]}`}>
                  {STATUS_LABELS[userTeam.status]}
                </span>
              )}
            </div>
            
            {isInTeam ? (
              <button 
                onClick={() => onNavigate('team-workspace')}
                className="w-full py-4 bg-blue-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-950 shadow-xl transition-all"
              >
                Accéder au workspace
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onNavigate('create-team')}
                  className="py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all"
                >
                  Créer
                </button>
                <button 
                  onClick={() => onNavigate('find-team')}
                  className="py-4 border-2 border-blue-600 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
                >
                  Postuler
                </button>
              </div>
            )}
            {!isInTeam && userProfile?.applications.length! > 0 && (
              <p className="text-[10px] text-orange-500 font-bold uppercase mt-4 text-center tracking-tight">
                {userProfile?.applications.length} candidature(s) en attente
              </p>
            )}
          </div>

          {/* Application Status Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
               <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Candidature</p>
                <h3 className="font-black text-blue-900 uppercase">Dossier</h3>
               </div>
              <span className="px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-tight bg-gray-100 text-gray-400 border border-gray-200">
                {userTeam?.status === 'submitted' ? 'Soumis' : 'Non Soumis'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mb-4 leading-relaxed font-bold uppercase">Éligibilité : {userTeam?.members.length || 0}/5 membres.</p>
            <button 
              disabled={!isLeader || userTeam?.members.length !== 5 || userTeam?.status === 'submitted'}
              onClick={() => onNavigate('application-form')}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${(!isLeader || userTeam?.members.length !== 5 || userTeam?.status === 'submitted') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-50'}`}
            >
              {userTeam?.status === 'submitted' ? 'Dossier déposé' : isLeader ? 'Déposer le dossier' : 'Réservé au chef'}
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <h3 className="text-xl font-black text-blue-900 mb-10 uppercase tracking-tighter">Calendrier FNCT 2026</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative pl-8 border-l-4 border-blue-600">
              <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Sud-Est</p>
              <p className="text-sm font-black text-gray-900">3 Avril</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Djerba</p>
            </div>
            <div className="relative pl-8 border-l-4 border-gray-100">
              <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Centre-Est</p>
              <p className="text-sm font-black text-gray-400">6 Avril</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Sfax</p>
            </div>
            <div className="relative pl-8 border-l-4 border-gray-100">
              <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Centre-Ouest</p>
              <p className="text-sm font-black text-gray-400">8 Avril</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Kairouan</p>
            </div>
            <div className="relative pl-8 border-l-4 border-gray-100">
              <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Nord-Ouest</p>
              <p className="text-sm font-black text-gray-400">15 Avril</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Tabarka</p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
