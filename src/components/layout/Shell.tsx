import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Linker kant: Logo en Titel */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-900 p-2 rounded-lg text-white">
                <LayoutDashboard size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight">Santens Automatics</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Service Portal</span>
              </div>
            </div>
            
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