
import React from 'react';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { StudentProfile } from '../types';

interface DashboardProps {
  userProfile: StudentProfile | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onNavigate, onLogout }) => {
  return (
    <Layout userType="student" onLogout={onLogout} onNavigate={onNavigate}>
      <DashboardHeader 
        title={`Bienvenue, ${userProfile?.firstName}`} 
        subtitle="Suivez votre progression et gérez votre équipe"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Status Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Profil Étudiant</h3>
              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${userProfile?.isComplete ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {userProfile?.isComplete ? 'Complet' : 'Incomplet'}
              </span>
            </div>
            {!userProfile?.isComplete && (
              <button 
                onClick={() => onNavigate('profile')}
                className="w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
              >
                Compléter mon profil
              </button>
            )}
            {userProfile?.isComplete && (
              <p className="text-sm text-gray-500">Votre profil est prêt pour le hackathon.</p>
            )}
          </div>

          {/* Team Status Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Équipe</h3>
              <span className="px-2 py-1 text-xs rounded-full font-semibold bg-gray-100 text-gray-700">Aucune</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button 
                onClick={() => onNavigate('create-team')}
                className="py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Créer une équipe
              </button>
              <button 
                onClick={() => onNavigate('find-team')}
                className="py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
              >
                Trouver une équipe
              </button>
            </div>
          </div>

          {/* Application Status Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Candidature</h3>
              <span className="px-2 py-1 text-xs rounded-full font-semibold bg-gray-100 text-gray-700">Non soumise</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Éligibilité : Requis une équipe de 5 membres.</p>
            <button 
              disabled
              className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed"
            >
              Soumettre (Inactif)
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Calendrier des Régionales</h3>
          <div className="space-y-6">
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <div className="w-0.5 flex-grow bg-blue-100"></div>
              </div>
              <div className="pb-6">
                <p className="font-bold text-blue-900">Sud-Est (Djerba)</p>
                <p className="text-sm text-gray-500">3 Avril 2026</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">2</div>
                <div className="w-0.5 flex-grow bg-gray-100"></div>
              </div>
              <div className="pb-6">
                <p className="font-bold text-gray-700">Centre-Est (Sfax)</p>
                <p className="text-sm text-gray-500">6 Avril 2026</p>
              </div>
            </div>
            {/* Other dates simplified */}
            <div className="flex items-center text-gray-400 text-sm italic ml-2">
              Voir plus...
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
