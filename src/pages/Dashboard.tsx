import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Map, Plus, Calendar, FileText, List, Calculator, X, Download } from 'lucide-react';
import type { SLA, UserRole, UserProfile } from '../types/sla';

interface DashboardProps {
  data: SLA[]; 
  onNavigate: (view: string) => void;
  onNavigateToList: (filter: 'all' | 'critical' | 'planning' | 'done') => void;
  userRole: UserRole;
  userProfile: UserProfile | null;
}

export const Dashboard = ({ data, onNavigate, onNavigateToList, userRole, userProfile }: DashboardProps) => {
  const safeData = data || [];
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<{url: string, name: string} | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Goedemorgen');
    else if (hour < 18) setGreeting('Goedemiddag');
    else setGreeting('Goedenavond');
  }, []);
  
  const totalCount = safeData.length;
  const saltoCount = safeData.filter(s => s.category === 'Salto' || !s.category).length;
  const rensonCount = safeData.filter(s => s.category === 'Renson').length;

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  let nextMonth = currentMonth + 1;
  let monthAfter = currentMonth + 2;
  if (nextMonth > 12) nextMonth -= 12;
  if (monthAfter > 12) monthAfter -= 12;

  const toPlanCount = safeData.filter(s => !s.isExecuted && (s.plannedMonth === nextMonth || s.plannedMonth === monthAfter)).length;
  const criticalCount = safeData.filter(s => !s.isExecuted && s.plannedMonth <= currentMonth).length;
  const executedCount = safeData.filter(s => s.isExecuted).length;

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
        
        <header>
          <h1 className="text-3xl font-bold text-slate-900">
            {greeting}, <span className="text-blue-600">{userProfile?.display_name || (userRole === 'admin' ? 'Beheerder' : 'Technieker')}</span>
          </h1>
          <p className="text-slate-500 text-lg mt-2">
            SLA's op de teller: <span className="font-bold text-slate-900">{totalCount}</span>, waarvan <span className="font-bold text-blue-600">{saltoCount}</span> voor Salto en <span className="font-bold text-emerald-600">{rensonCount}</span> voor Renson.
          </p>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => onNavigateToList('critical')}
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-red-300 hover:shadow-md transition-all text-left"
          >
            <div className="p-3 bg-red-100 rounded-full text-red-600 group-hover:scale-110 transition-transform">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{criticalCount}</div>
              <div className="text-sm text-slate-500 group-hover:text-red-600 transition-colors">SLA Kritiek (Te laat/Nu)</div>
            </div>
          </button>

          <button 
             onClick={() => onNavigateToList('planning')}
             className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-orange-300 hover:shadow-md transition-all text-left"
          >
            <div className="p-3 bg-orange-100 rounded-full text-orange-600 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{toPlanCount}</div>
              <div className="text-sm text-slate-500 group-hover:text-orange-600 transition-colors">In te plannen (Komende 2 mnd)</div>
            </div>
          </button>

          <button 
             onClick={() => onNavigateToList('done')}
             className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-green-300 hover:shadow-md transition-all text-left"
          >
            <div className="p-3 bg-green-100 rounded-full text-green-600 group-hover:scale-110 transition-transform">
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{executedCount}</div>
              <div className="text-sm text-slate-500 group-hover:text-green-600 transition-colors">Reeds Uitgevoerd</div>
            </div>
          </button>
        </div>
        
        {/* Actie Knoppen Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <button 
            onClick={() => onNavigateToList('all')}
            className="p-6 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
              <List size={32} />
            </div>
            <span className="font-semibold text-lg">Bekijk / bewerk alle SLA's</span>
          </button>

          <button 
            onClick={() => onNavigate('map')}
            className="p-6 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
              <Map size={32} />
            </div>
            <span className="font-semibold text-lg">SLA's in kaart</span>
          </button>

          {userRole === 'admin' && (
            <button 
              onClick={() => onNavigate('add')}
              className="p-8 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition-all flex flex-row items-center justify-center gap-4 group md:col-span-2"
            >
              <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                <Plus size={40} />
              </div>
              <span className="font-bold text-2xl">Nieuwe SLA Aanmaken</span>
            </button>
          )}

          {userRole === 'admin' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
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