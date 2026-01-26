import React, { useState, useEffect } from 'react';
import { LogOut, Settings, ArrowUp } from 'lucide-react';

interface ShellProps { 
  children: React.ReactNode;
  onLogout: () => void;
  onHome: () => void;
  onSettings: () => void;
}

export const Shell = ({ children, onLogout, onHome, onSettings }: ShellProps) => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Scroll detectie logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Linker kant: Logo */}
            <button 
              onClick={onHome}
              className="flex items-center gap-4 hover:opacity-75 transition-opacity text-left"
              title="Terug naar Dashboard"
            >
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-12 w-auto object-contain" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-xl leading-tight">Santens Automatics</span>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Service Portal</span>
              </div>
            </button>

            {/* Rechter kant: Knoppen */}
            <div className="flex items-center gap-2">
              <button 
                onClick={onSettings}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Instellingen"
              >
                <Settings size={24} />
              </button>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              <button 
                onClick={onLogout} 
                className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                <span>Afmelden</span>
                <LogOut size={20} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* BACK TO TOP KNOP (Verschijnt alleen bij scrollen) */}
      {showTopBtn && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all border-2 border-white animate-in fade-in slide-in-from-bottom-4 duration-300"
          title="Terug naar boven"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};