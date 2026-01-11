
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'student' | 'admin' | 'public';
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userType = 'public', onLogout, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => onNavigate?.('landing')}
                className="flex items-center space-x-3 focus:outline-none hover:opacity-80 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                  <span className="text-white font-black text-xs">FNCT</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-black text-blue-900 leading-none">Hackathon 2026</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">50 ans d'innovation</span>
                </div>
              </button>
              
              <div className="hidden md:flex h-8 w-px bg-gray-200 mx-2"></div>
              
              <button 
                onClick={() => onNavigate?.('landing')}
                className="text-gray-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                Home
              </button>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-8">
              {userType === 'public' ? (
                <>
                  <button className="text-gray-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors hidden lg:block">Guide didactic</button>
                  <button 
                    onClick={() => onNavigate?.('login')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                  >
                    Administration
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Espace</p>
                    <p className="text-sm font-black text-blue-900 uppercase tracking-tighter leading-none">{userType === 'admin' ? 'Pilotage' : 'Candidat'}</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-3 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex flex-col">
        {children}
      </div>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <div className="flex flex-col items-center md:items-start">
               <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-gray-400 font-black text-[10px]">FNCT</span>
               </div>
               <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em] text-center md:text-left">
                 Fédération Nationale des Communes Tunisiennes<br/>
                 Bâtir les villes de demain par l'innovation citoyenne.
               </p>
            </div>
            
            <div className="flex space-x-12">
              <div className="flex flex-col space-y-3">
                 <span className="text-blue-900 font-black text-[10px] uppercase tracking-widest mb-2">Hackathon 2026</span>
                 <a href="#" className="text-gray-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Contact Support</a>
                 <a href="#" className="text-gray-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Règlement Officiel</a>
              </div>
              <div className="flex flex-col space-y-3">
                 <span className="text-blue-900 font-black text-[10px] uppercase tracking-widest mb-2">Légal</span>
                 <a href="#" className="text-gray-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Vie Privée</a>
                 <a href="#" className="text-gray-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Mentions Légales</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-50 text-center">
            <span className="text-gray-300 text-[8px] font-bold uppercase tracking-[0.4em]">© 2026 FNCT | 50ème Anniversaire - Prototype Plateforme Haute-Fidélité</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
