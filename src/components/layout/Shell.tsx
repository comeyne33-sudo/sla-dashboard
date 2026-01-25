import React from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';

export const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 text-blue-600">
              <LayoutDashboard size={24} />
              <span className="font-bold text-slate-900 tracking-tight">SLA Service Portal</span>
            </div>
            <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-200 transition-all">
              <LogOut size={16} />
              <span>Uitloggen</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};