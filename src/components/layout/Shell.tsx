import React from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar - Werkt op zowel laptop als gsm */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <LayoutDashboard size={20} />
              </div>
              <span className="font-bold text-slate-900 tracking-tight hidden sm:block">
                SLA Service Portal
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                Support
              </button>
              <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm transition-all">
                <LogOut size={16} />
                <span className="hidden sm:inline">Uitloggen</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer - Optioneel maar professioneel */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
          © {new Date().getFullYear()} Santens Automatics Service Management
        </div>
      </footer>
    </div>
  );
};