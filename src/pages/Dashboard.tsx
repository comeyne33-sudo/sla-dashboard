import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Map, Plus, Calendar, FileText, List, Calculator, X, Download, User } from 'lucide-react';
import type { SLA, UserRole } from '../types/sla';

interface DashboardProps {
  data: SLA[]; 
  onNavigate: (view: string) => void;
  onNavigateToList: (filter: 'all' | 'critical' | 'planning' | 'done') => void;
  userRole: UserRole;
}

// --- NIEUW: EEN SIMPEL CIRKELDIAGRAM COMPONENT ---
const ProgressRing = ({ radius, stroke, progress, color }: { radius: number, stroke: number, progress: number, color: string }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="#e2e8f0" // Slate-200 (achtergrond cirkel)
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Percentage in het midden */}
      <div className="absolute text-xs font-bold text-slate-600">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export const Dashboard = ({ data, onNavigate, onNavigateToList, userRole }: DashboardProps) => {
  const safeData = data || [];
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<{url: string, name: string} | null>(null);
  const [greeting, setGreeting] = useState('');

  // --- NIEUW: TIJD-GEBASEERDE BEGROETING ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Goedemorgen');
    else if (hour < 18) setGreeting('Goedemiddag');
    else setGreeting('Goedenavond');
  }, []);
  
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  let nextMonth = currentMonth + 1;
  let monthAfter = currentMonth + 2;
  if (nextMonth > 12) nextMonth -= 12;
  if (monthAfter > 12) monthAfter -= 12;

  const toPlanCount = safeData.filter(s => !s.isExecuted && (s.plannedMonth === nextMonth || s.plannedMonth === monthAfter)).length;
  const criticalCount = safeData.filter(s => !s.isExecuted && s.plannedMonth <= currentMonth).length;
  const executedCount = safeData.filter(s => s.isExecuted).length;
  
  // Bereken percentages voor de cirkels
  const totalCount = safeData.length || 1; // Voorkom delen door 0
  const criticalPercent = (criticalCount / totalCount) * 100;
  const planPercent = (toPlanCount / totalCount) * 100;
  const executedPercent = (executedCount / totalCount) * 100;

  const initiateDownload = (url: string, name: string) => {
    setDownloadTarget({ url, name });
    setShowDownloadModal(true);
  };

  const confirmDownload = () => {
    if (downloadTarget) {
      const link = document.createElement('a');
      link.href = downloadTarget.url;
      link.download = downloadTarget.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowDownloadModal(false);
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- NIEUW: DYNAMISCHE HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              {greeting}, {userRole === 'admin' ? 'Beheerder' : 'Technieker'} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-500 text-lg mt-1">
              Hier is het overzicht voor vandaag.
            </p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-medium text-sm flex items-center gap-2">
            <User size={16} />
            Ingelogd als {userRole === 'admin' ? 'Santens Admin' : 'Santens Techniek'}
          </div>
        </header>

        {/* KPI Grid (NU MET PROGRESS RINGS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <button 
            onClick={() => onNavigateToList('critical')}
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-red-300 hover:shadow-md transition-all text-left relative overflow-hidden"
          >
            {/* Achtergrond gloed effect bij hover */}
            <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{criticalCount}</div>
                <div className="text-sm font-medium text-slate-500 group-hover:text-red-600 transition-colors">Kritiek</div>
              </div>
            </div>
            <div className="relative z-10">
              <ProgressRing radius={28} stroke={4} progress={criticalPercent} color="#ef4444" />
            </div>
          </button>

          <button 
             onClick={() => onNavigateToList('planning')}
             className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-orange-300 hover:shadow-md transition-all text-left relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            
             <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{toPlanCount}</div>
                <div className="text-sm font-medium text-slate-500 group-hover:text-orange-600 transition-colors">Planning</div>
              </div>
            </div>
            <div className="relative z-10">
              <ProgressRing radius={28} stroke={4} progress={planPercent} color="#f97316" />
            </div>
          </button>

          <button 
             onClick={() => onNavigateToList('done')}
             className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-green-300 hover:shadow-md transition-all text-left relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity" />

             <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{executedCount}</div>
                <div className="text-sm font-medium text-slate-500 group-hover:text-green-600 transition-colors">Uitgevoerd</div>
              </div>
            </div>
            <div className="relative z-10">
              <ProgressRing radius={28} stroke={4} progress={executedPercent} color="#22c55e" />
            </div>
          </button>
        </div>
        
        {/* Actie Knoppen Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <button 
            onClick={() => onNavigateToList('all')}
            className="p-6 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <List size={24} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-lg">Bekijk Alle Dossiers</span>
              <span className="text-sm text-slate-400">Zoeken, filteren en bewerken</span>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('map')}
            className="p-6 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Map size={24} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-lg">SLA's in Kaart</span>
              <span className="text-sm text-slate-400">Geografisch overzicht</span>
            </div>
          </button>

          {/* Nieuwe SLA (ADMIN) */}
          {userRole === 'admin' && (
            <button 
              onClick={() => onNavigate('add')}
              className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group md:col-span-2"
            >
              <div className="p-2 bg-white/20 rounded-full group-hover:rotate-90 transition-transform">
                <Plus size={28} />
              </div>
              <span className="font-bold text-xl">Nieuwe SLA Aanmaken</span>
            </button>
          )}

          <button 
            onClick={() => initiateDownload('/rekentool.xltm', 'rekentool.xltm')}
            className="p-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Calculator size={18} />
            Sjabloon Rekentool
          </button>

          <button 
            onClick={() => initiateDownload('/contract.dotx', 'contract.dotx')}
            className="p-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FileText size={18} />
            Sjabloon Contract
          </button>

        </div>
      </div>

      {/* DOWNLOAD MODAL */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Download size={24} />
              </div>
              <button onClick={() => setShowDownloadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bestand Downloaden?</h3>
            <p className="text-slate-500 mb-6">
              Je staat op het punt om <strong>{downloadTarget?.name}</strong> te downloaden.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Annuleren
              </button>
              <button 
                onClick={confirmDownload}
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Downloaden
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};