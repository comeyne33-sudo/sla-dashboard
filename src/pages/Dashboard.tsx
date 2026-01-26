import { AlertTriangle, CheckCircle, Map, Plus, Calendar, FileText, List } from 'lucide-react';
import type { SLA } from '../types/sla';

interface DashboardProps {
  data: SLA[]; 
  onNavigate: (view: string) => void;
}

export const Dashboard = ({ data, onNavigate }: DashboardProps) => {
  const safeData = data || [];
  
  // DATUM LOGICA
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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        {/* AANPASSING: DE NIEUWE ONDERTITEL */}
        <p className="text-slate-500 text-lg">
          SLA's op de teller: <span className="font-bold text-blue-600">{safeData.length}</span>
        </p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{criticalCount}</div>
            <div className="text-sm text-slate-500">SLA Kritiek (Te laat/Nu)</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{toPlanCount}</div>
            <div className="text-sm text-slate-500">In te plannen (Komende 2 mnd)</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{executedCount}</div>
            <div className="text-sm text-slate-500">Reeds Uitgevoerd</div>
          </div>
        </div>
      </div>
      
      {/* Actie Knoppen - NU IN EEN 2x2 GRID */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Bekijk Alle Dossiers (TERUG VAN WEGGEWEEST) */}
        <button 
          onClick={() => onNavigate('list')}
          className="p-6 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
            <List size={32} />
          </div>
          <span className="font-semibold text-lg">Bekijk Alle Dossiers</span>
        </button>

        {/* 2. Nieuwe SLA */}
        <button 
          onClick={() => onNavigate('add')}
          className="p-6 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <span className="font-semibold text-lg">Nieuwe SLA Aanmaken</span>
        </button>

        {/* 3. SharePoint */}
        <a 
          href="https://santensbe.sharepoint.com/sites/SantensAutomatics/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FSantensAutomatics%2FShared%20Documents%2F07%2E%20Service%20Level%20Agreement&viewid=ab64db07%2D76ab%2D4e13%2D8ef7%2Dff24363168f1"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-slate-800 text-white rounded-xl shadow-md hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
            <FileText size={32} />
          </div>
          <span className="font-semibold text-lg">SLA Documenten</span>
        </a>

        {/* 4. Locatie Kaart */}
        <button 
          onClick={() => onNavigate('map')}
          className="p-6 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
            <Map size={32} />
          </div>
          <span className="font-semibold text-lg">Locatie Kaart</span>
        </button>
      </div>
    </div>
  );
};