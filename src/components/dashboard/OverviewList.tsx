import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Battery, Calendar, Clock, Euro, Mail, MapPin, Phone, User, Trash2, Pencil, CheckCircle, AlertCircle, Filter, SortAsc, Search, MessageSquare, RotateCcw } from 'lucide-react';
import type { SLA, SLAType, UserRole } from '../../types/sla';
import { AttachmentManager } from './AttachmentManager';

type ListFilterType = 'all' | 'critical' | 'planning' | 'done';

const monthNames = [ "", "Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December" ];
const BASE_LAT = 50.9904;
const BASE_LNG = 3.7632;
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

interface SLAListProps {
  data: SLA[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onEdit: (sla: SLA) => void;
  onRefresh: () => void;
  initialFilter?: ListFilterType;
  userRole: UserRole;
}

export const SLAList = ({ data, onBack, onDelete, onEdit, onRefresh, initialFilter = 'all', userRole }: SLAListProps) => {
  const [filterStatus, setFilterStatus] = useState<ListFilterType>(initialFilter);
  const [filterType, setFilterType] = useState<'all' | SLAType>('all');
  const [sortBy, setSortBy] = useState<'name' | 'month' | 'distance'>('month');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { if (initialFilter) setFilterStatus(initialFilter); }, [initialFilter]);

  // Check of er actieve filters zijn (om de reset knop te tonen/verbergen)
  const hasActiveFilters = filterStatus !== 'all' || filterType !== 'all' || searchQuery !== '';

  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterType('all');
  };

  const processedData = useMemo(() => {
    let result = [...data];
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    let nextMonth = currentMonth + 1;
    let monthAfter = currentMonth + 2;
    if (nextMonth > 12) nextMonth -= 12;
    if (monthAfter > 12) monthAfter -= 12;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(s => s.clientName.toLowerCase().includes(lowerQuery) || s.city.toLowerCase().includes(lowerQuery) || s.location.toLowerCase().includes(lowerQuery));
    }
    if (filterStatus === 'critical') result = result.filter(s => !s.isExecuted && s.plannedMonth <= currentMonth);
    else if (filterStatus === 'planning') result = result.filter(s => !s.isExecuted && (s.plannedMonth === nextMonth || s.plannedMonth === monthAfter));
    else if (filterStatus === 'done') result = result.filter(s => s.isExecuted);
    if (filterType !== 'all') result = result.filter(s => s.type === filterType);

    result.sort((a, b) => {
      if (sortBy === 'name') return a.clientName.localeCompare(b.clientName);
      if (sortBy === 'month') return a.plannedMonth - b.plannedMonth;
      if (sortBy === 'distance') return calculateDistance(BASE_LAT, BASE_LNG, a.lat, a.lng) - calculateDistance(BASE_LAT, BASE_LNG, b.lat, b.lng);
      return 0;
    });
    return result;
  }, [data, filterStatus, filterType, sortBy, searchQuery]);

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
             {filterStatus === 'critical' ? 'Kritieke Dossiers' : 
             filterStatus === 'planning' ? 'Planning' :
             filterStatus === 'done' ? 'Uitgevoerde Dossiers' : 
             'Alle Dossiers'} 
             <span className="ml-2 text-slate-500 font-normal">({processedData.length})</span>
          </h2>
          <p className="text-slate-500">Beheer filters en sortering hieronder.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* BOVENBALK MET ZOEK EN RESET */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-slate-400" /></div>
            <input type="text" placeholder="Zoek op klantnaam, stad of straat..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          
          {/* NIEUWE RESET KNOP (Alleen zichtbaar als er filters zijn) */}
          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-colors flex items-center gap-2 whitespace-nowrap"
              title="Alles tonen"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
           <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><Filter size={12} /> Status</label>
            <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
              <option value="all">Alles Tonen</option>
              <option value="critical">Kritiek (Te laat/Nu)</option>
              <option value="planning">In Planning (Next 2 mnd)</option>
              <option value="done">Reeds uitgevoerd</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><Filter size={12} /> Type</label>
            <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
              <option value="all">Alle Types</option>
              <option value="Basic">Basic</option>
              <option value="Comfort">Comfort</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><SortAsc size={12} /> Sorteren</label>
            <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="month">Maand</option>
              <option value="name">Naam</option>
              <option value="distance">Afstand</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {processedData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium">Geen dossiers gevonden.</p>
            <button onClick={resetFilters} className="mt-2 text-blue-600 text-sm hover:underline">
              Filters wissen
            </button>
          </div>
        )}

        {processedData.map((sla) => (
          <div key={sla.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition-all relative">
            <div className="absolute top-6 right-6 flex gap-2 items-center">
               <AttachmentManager sla={sla} onUpdate={onRefresh} />
               <button onClick={() => onEdit(sla)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-100">
                <Pencil size={18} />
              </button>
              {userRole === 'admin' && (
                <button 
                  onClick={() => { if(window.confirm(`Verwijderen?`)) onDelete(sla.id); }}
                  className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors border border-red-100"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4 pr-32">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {sla.clientName}
                  {sla.isExecuted ? <span className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle size={12} /> Uitgevoerd</span> : <span className="flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"><AlertCircle size={12} /> Te doen</span>}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm mt-1">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {sla.location}, {sla.city}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide hidden sm:inline-block ${sla.type === 'Premium' ? 'bg-purple-100 text-purple-700' : sla.type === 'Comfort' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{sla.type}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
               <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">Materiaal & Tijd</div>
                {sla.type !== 'Basic' && <div className="flex items-center gap-2 text-slate-700"><Battery size={16} className="text-orange-500"/> {sla.partsNeeded || 'Geen specifiek materiaal'}</div>}
                <div className="flex items-center gap-2 text-slate-700"><Clock size={16} className="text-blue-500"/> {sla.hoursRequired}u werk</div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">Planning</div>
                <div className="flex items-center gap-2 text-slate-700"><Calendar size={16} className="text-green-600"/> Uitvoering: {monthNames[sla.plannedMonth] || 'Onbekend'}</div>
                <div className="flex items-center gap-2 text-slate-700"><Euro size={16} className="text-slate-400"/> € {sla.price},-</div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">Contact</div>
                <div className="flex items-center gap-2 text-slate-700"><User size={16} className="text-slate-400"/> {sla.contactName}</div>
                <div className="flex items-center gap-2 text-slate-700"><Phone size={16} className="text-slate-400"/> {sla.contactPhone}</div>
              </div>
            </div>

            {sla.comments && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                 <div className="text-sm bg-slate-50 p-3 rounded-lg text-slate-600 italic border border-slate-100 flex gap-2 items-start">
                    <MessageSquare size={16} className="shrink-0 mt-0.5 text-slate-400" />
                    <span>"{sla.comments}"</span>
                  </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};