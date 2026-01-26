import { Activity, AlertTriangle, CheckCircle, Map, Plus } from 'lucide-react';
import type { SLA } from '../types/sla';

interface DashboardProps {
  data: SLA[]; 
  onNavigate: (view: string) => void;
}

export const Dashboard = ({ data, onNavigate }: DashboardProps) => {
  // VEILIGHEID: Als data undefined is, gebruik een lege lijst []
  // Dit voorkomt de "Cannot read properties of undefined (reading 'filter')" crash
  const safeData = data || [];

  // Nu filteren we op 'safeData' in plaats van 'data'
  const activeCount = safeData.filter(s => s.status === 'active').length;
  const warningCount = safeData.filter(s => s.status === 'warning').length;
  const criticalCount = safeData.filter(s => s.status === 'critical').length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welkom terug. Er zijn momenteel {safeData.length} dossiers in het systeem.</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{criticalCount}</div>
            <div className="text-sm text-slate-500">Kritieke SLA's</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{warningCount}</div>
            <div className="text-sm text-slate-500">Waarschuwingen</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
            <div className="text-sm text-slate-500">Op Schema</div>
          </div>
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => onNavigate('list')}
          className="p-6 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
            <Activity size={32} />
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

        <button 
          onClick={() => onNavigate('add')}
          className="p-6 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition-all flex flex-col items-center justify-center gap-3 group md:col-span-2"
        >
          <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <span className="font-semibold text-lg">Nieuwe SLA</span>
        </button>
      </div>
    </div>
  );
};