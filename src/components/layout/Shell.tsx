import React from 'react';
import { LogOut } from 'lucide-react';

interface ShellProps { 
  children: React.ReactNode;
  onLogout: () => void;
  onHome: () => void; // <--- NIEUW: Functie om naar home te gaan
}

export const Shell = ({ children, onLogout, onHome }: ShellProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Linker kant: Logo en Titel (NU KLIKBAAR) */}
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

            {/* Rechter kant: Uitloggen */}
            <button 
              onClick={onLogout} 
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              <span>Afmelden</span>
              <LogOut size={20} />
            </button>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};