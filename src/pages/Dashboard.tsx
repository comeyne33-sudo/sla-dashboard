import { useState } from 'react';
import { AlertTriangle, CheckCircle, Map, Plus, Calendar, FileText, List, Calculator, X, Download } from 'lucide-react';
import type { SLA } from '../types/sla';

interface DashboardProps {
  data: SLA[]; 
  onNavigate: (view: string) => void;
  onNavigateToList: (filter: 'all' | 'todo' | 'done') => void; // Nieuwe prop voor slimme navigatie
}

export const Dashboard = ({ data, onNavigate, onNavigateToList }: DashboardProps) => {
  const safeData = data || [];
  
  // STATE VOOR DOWNLOAD POPUP
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<{url: string, name: string} | null>(null);
  
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  let nextMonth = currentMonth + 1;
  let monthAfter = currentMonth + 2;
  if (nextMonth > 12) nextMonth -= 12;
  if (monthAfter > 12) monthAfter -= 12;

  const toPlanCount = safeData.filter(s => 
    !s.isExecuted && 
    (s.plannedMonth === nextMonth || s.plannedMonth === monthAfter)
  ).length;

  const criticalCount = safeData.filter(s => 
    !s.isExecuted && 
    s.plannedMonth <= currentMonth
  ).length;

  const executedCount = safeData.filter(s => s.isExecuted).length;

  // HULPFUNCTIE OM DOWNLOAD TE STARTEN
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
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-lg">
            SLA's op de teller: <span className="font-bold text-blue-600">{safeData.length}</span>
          </p>
        </header>

        {/* KPI Grid (NU KLIKBAAR) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <button 
            onClick={() => onNavigateToList('todo')}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-red-300 hover:shadow-md transition-all text-left"
          >
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{criticalCount}</div>
              <div className="text-sm text-slate-500">SLA Kritiek (Te laat/Nu)</div>
            </div>
          </button>

          <button 
             onClick={() => onNavigateToList('todo')}
             className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-orange-300 hover:shadow-md transition-all text-left"
          >
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{toPlanCount}</div>
              <div className="text-sm text-slate-500">In te plannen (Komende 2 mnd)</div>
            </div>
          </button>

          <button 
             onClick={() => onNavigateToList('done')}
             className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-green-300 hover:shadow-md transition-all text-left"
          >
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{executedCount}</div>
              <div className="text-sm text-slate-500">Reeds Uitgevoerd</div>
            </div>
          </button>
        </div>
        
        {/* Actie Knoppen Grid (NIEUWE INDELING) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* RIJ 1: Bekijk Alle & Kaart (Naast elkaar) */}
          <button 
            onClick={() => onNavigateToList('all')}
            className="p-6 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
              <List size={32} />
            </div>
            <span className="font-semibold text-lg">Bekijk Alle Dossiers</span>
          </button>

          <button 
            onClick={() => onNavigate('map')}
            className="p-6 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
              <Map size={32} />
            </div>
            <span className="font-semibold text-lg">Locatie Kaart</span>
          </button>

          {/* RIJ 2: Nieuwe SLA (Volledige breedte) */}
          <button 
            onClick={() => onNavigate('add')}
            className="p-8 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition-all flex flex-row items-center justify-center gap-4 group md:col-span-2"
          >
            <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
              <Plus size={40} />
            </div>
            <span className="font-bold text-2xl">Nieuwe SLA Aanmaken</span>
          </button>

          {/* RIJ 3: Sjablonen (Naast elkaar, met POPUP) */}
          <button 
            onClick={() => initiateDownload('/rekentool.xltm', 'rekentool.xltm')}
            className="p-6 bg-slate-800 text-white rounded-xl shadow-md hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
              <Calculator size={32} />
            </div>
            <span className="font-semibold text-lg">Sjabloon Rekentool</span>
          </button>

          <button 
            onClick={() => initiateDownload('/contract.dotx', 'contract.dotx')}
            className="p-6 bg-slate-700 text-white rounded-xl shadow-md hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
            <span className="font-semibold text-lg">Sjabloon Contract</span>
          </button>

        </div>
      </div>

      {/* DOWNLOAD MODAL POPUP */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
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
              Je staat op het punt om <strong>{downloadTarget?.name}</strong> te downloaden. Wil je doorgaan?
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
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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