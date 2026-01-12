
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            university: formData.university,
            phone: formData.phone
          }
        }
      });

      if (authError) throw authError;

      alert('Inscription réussie ! Veuillez vérifier vos e-mails si la confirmation est activée, sinon connectez-vous.');
      onNavigate('login');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout onNavigate={onNavigate}>
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
          <div>
            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
              <span className="text-white font-black text-xl">FNCT</span>
            </div>
            <h2 className="text-center text-3xl font-black text-gray-900 tracking-tighter">Rejoindre l'aventure</h2>
            <p className="mt-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Inscrivez-vous pour déclencher votre profil d'innovateur
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-tight">
              {error}
            </div>
          )}
          
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Prénom</label>
                <input 
                  required 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" 
                  placeholder="Ex: Ahmed" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Nom</label>
                <input 
                  required 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" 
                  placeholder="Ex: Trabelsi" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Email universitaire</label>
              <input 
                required 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" 
                placeholder="etudiant@universite.tn" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Téléphone</label>
                <input 
                  required 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" 
                  placeholder="+216 22..." 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Université</label>
                <input 
                  required 
                  type="text" 
                  value={formData.university}
                  onChange={(e) => setFormData({...formData, university: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" 
                  placeholder="INSAT, FST, ESC..." 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Mot de passe</label>
              <input 
                required 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl text-white text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" 
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-xs font-black rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl transition-all active:scale-95 uppercase tracking-widest mt-6 disabled:opacity-50"
            >
              {isLoading ? 'Création...' : 'Participer au hackathon'}
            </button>
          </form>

          <div className="text-center pt-4">
            <button 
              onClick={() => onNavigate('login')}
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
              Déjà inscrit ? <span className="text-blue-600">Se connecter</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
