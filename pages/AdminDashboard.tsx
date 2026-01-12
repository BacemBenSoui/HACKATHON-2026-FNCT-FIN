
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { STATUS_COLORS, STATUS_LABELS, REGIONS, THEMES } from '../constants';
import { supabase } from '../lib/supabase';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teams'>('overview');
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluationTeam, setEvaluationTeam] = useState<any | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*, leader:profiles!leader_id(first_name, last_name, email)');
    
    if (error) console.error(error);
    else setTeams(data || []);
    setIsLoading(false);
  };

  const handleUpdateStatus = async (teamId: string, status: string) => {
    const { error } = await supabase
      .from('teams')
      .update({ status })
      .eq('id', teamId);
    
    if (error) alert("Erreur : " + error.message);
    else {
      alert(`Équipe ${status === 'selected' ? 'Acceptée' : 'Refusée'}.`);
      setEvaluationTeam(null);
      fetchAdminData();
    }
  };

  return (
    <Layout userType="admin" onLogout={onLogout}>
      <DashboardHeader title="Centre de Pilotage FNCT" subtitle="Gouvernance réelle des candidatures Hackathon 2026." />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-2xl mb-10 w-fit">
          {['overview', 'teams'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-900 text-white shadow-xl' : 'text-gray-500 hover:text-blue-900'}`}
            >
              {tab === 'overview' ? 'Statistiques' : 'Évaluation Dossiers'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Dossiers reçus</p>
              <p className="text-4xl font-black text-blue-900">{teams.length}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">À évaluer</p>
              <p className="text-4xl font-black text-orange-500">{teams.filter(t => t.status === 'submitted').length}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Sélectionnés</p>
              <p className="text-4xl font-black text-emerald-600">{teams.filter(t => t.status === 'selected').length}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Incomplets</p>
              <p className="text-4xl font-black text-gray-300">{teams.filter(t => t.status === 'incomplete').length}</p>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4">
             {evaluationTeam ? (
               <div className="p-10 space-y-8 animate-in zoom-in-95">
                 <button onClick={() => setEvaluationTeam(null)} className="text-xs font-black text-blue-600 uppercase">← Retour</button>
                 <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">{evaluationTeam.name}</h2>
                      <p className="text-sm font-bold text-gray-500 uppercase mt-1">{evaluationTeam.theme} • {evaluationTeam.preferred_region}</p>
                    </div>
                    <div className="flex space-x-4">
                       <button onClick={() => handleUpdateStatus(evaluationTeam.id, 'selected')} className="px-6 py-3 bg-emerald-600 text-white font-black text-xs uppercase rounded-xl">Accepter</button>
                       <button onClick={() => handleUpdateStatus(evaluationTeam.id, 'rejected')} className="px-6 py-3 bg-red-600 text-white font-black text-xs uppercase rounded-xl">Rejeter</button>
                    </div>
                 </div>
                 <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-sm italic">
                    "{evaluationTeam.description}"
                 </div>
               </div>
             ) : (
               <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-6">Équipe</th>
                    <th className="px-8 py-6">Région</th>
                    <th className="px-8 py-6">Thème</th>
                    <th className="px-8 py-6">Statut</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {teams.map(t => (
                    <tr key={t.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-8 py-5 font-black text-gray-900 uppercase tracking-tight">{t.name}</td>
                      <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase">{t.preferred_region?.split('(')[0]}</td>
                      <td className="px-8 py-5 text-[10px] font-black text-blue-900 uppercase max-w-[200px] truncate">{t.theme}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => setEvaluationTeam(t)} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Voir Dossier</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
               </table>
             )}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default AdminDashboard;
