
import React from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';

const TeamWorkspace: React.FC<{ onNavigate: (p: string) => void; onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title="Espace Équipe : EcoConnect" 
        subtitle="Région : Sud-Est (Djerba) | Thématique : Déchets"
        actions={
          <button 
            onClick={() => onNavigate('application-form')}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
          >
            Soumettre candidature
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members List */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Membres (5/5)</h3>
                <span className="text-xs font-medium text-blue-600">✓ Complet</span>
              </div>
              <ul className="divide-y divide-gray-100">
                {[
                  { name: 'Sami K.', role: 'Chef d\'équipe', skill: 'Data/IA', gender: 'M' },
                  { name: 'Yosra B.', role: 'Membre', skill: 'Environnement', gender: 'F' },
                  { name: 'Ahmed L.', role: 'Membre', skill: 'Développement logiciel', gender: 'M' },
                  { name: 'Mariem S.', role: 'Membre', skill: 'Design UX/UI', gender: 'F' },
                  { name: 'Kais G.', role: 'Membre', skill: 'Urbanisme', gender: 'M' },
                ].map((m, i) => (
                  <li key={i} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{m.name} {m.gender === 'F' && '👩'}</p>
                        <p className="text-xs text-gray-500">{m.skill} • {m.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-wide">Validé</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Application Progress */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-6">Critères d'éligibilité</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-sm font-medium text-green-900">Effectif : 5 membres exactement</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-sm font-medium text-green-900">Mixité : Minimum 2 femmes (Actuel: 2)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-sm font-medium text-green-900">Pluridisciplinarité : Minimum 3 disciplines (Actuel: 5)</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Activity / Info */}
          <div className="space-y-6">
             <section className="bg-blue-900 text-white rounded-xl p-6 shadow-lg">
                <h3 className="font-bold mb-4">Prochaine Étape</h3>
                <p className="text-blue-100 text-sm mb-6">Tous les critères sont validés ! Vous pouvez maintenant remplir et soumettre votre dossier de candidature final.</p>
                <button 
                   onClick={() => onNavigate('application-form')}
                   className="w-full py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Remplir le dossier
                </button>
             </section>
             
             <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Invitations en attente</h3>
                <div className="text-center py-4 text-gray-400 text-sm italic">
                  Aucune demande en attente.
                </div>
             </section>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default TeamWorkspace;
