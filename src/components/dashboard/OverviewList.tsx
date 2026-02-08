import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Battery, Calendar, Clock, Euro, MapPin, Phone, User, Trash2, Pencil, CheckCircle, AlertCircle, Search, MessageSquare, RotateCcw, ChevronDown, ChevronUp, Hash, ArrowUpFromLine, Maximize, PlayCircle, CheckCircle2, RotateCw } from 'lucide-react';
import type { SLA, SLAType, UserRole, SLACategory } from '../../types/sla';
import { AttachmentManager } from './AttachmentManager';
import { supabase } from '../../lib/supabase';

type ListFilterType = 'all' | 'critical' | 'planning' | 'done';
const monthNames = [ "", "Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December" ];

const SLAItemCard = ({ sla, onEdit, onDelete, userRole, onUpdate, onExecute }: { 
  sla: SLA; 
  onEdit: (sla: SLA) => void; 
  onDelete: (id: string) => void;
  onExecute: (sla: SLA) => void;
  userRole: UserRole;
  onUpdate: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Kleur op basis van categorie
  let themeClass = 'border-slate-200';
  if (sla.category === 'Toegangscontrole') themeClass = 'hover:border-blue-300';
  if (sla.category === 'Draaideurautomatisatie') themeClass = 'hover:border-orange-300';
  if (sla.category === 'Poortautomatisatie') themeClass = 'hover:border-purple-300';
  if (sla.category === 'Zonneweringen') themeClass = 'hover:border-yellow-300';

  const isSalto = sla.category === 'Toegangscontrole'; // Voor specifieke iconen

  // Check of de SLA al gestart is (bevat tekst, maar niet afgerond)
  const isStarted = !sla.isExecuted && (!!sla.execution_report || !!sla.comments);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-all ${themeClass}`}>
      <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900">{sla.clientName}</h3>
            {sla.vo_number && <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1"><Hash size={10} /> {sla.vo_number}</span>}
            
            {sla.isExecuted ? (
              sla.calculation_done ? (
                <span className="flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full" title="Financieel afgerond"><CheckCircle2 size={12} /> Afgerond</span>
              ) : (
                 <span className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle size={12} /> Uitgevoerd</span>
              )
            ) : <span className="flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"><AlertCircle size={12} /> Open</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm">
            <span className="flex items-center gap-1"><MapPin size={14} /> {sla.city}</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-700">{sla.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {!sla.isExecuted && (
             <button 
                onClick={(e) => { e.stopPropagation(); onExecute(sla); }} 
                className={`px-3 py-1.5 text-white text-sm font-medium rounded-lg flex items-center gap-1 transition-colors ${isStarted ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
             >
                {isStarted ? <><RotateCw size={14} /> Hervatten</> : <><PlayCircle size={14} /> Uitvoeren</>}
             </button>
           )}
           <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="p-2 text-slate-400 hover:text-slate-600">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
        </div>
      </div>
      {expanded && (
        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="h-px bg-slate-100 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm mb-4">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase">Specificaties</div>
              <div className="flex items-center gap-2 text-slate-700"><Clock size={16} className="text-blue-500"/> {sla.hoursRequired}u voorzien</div>
              {sla.partsNeeded && <div className="flex items-center gap-2 text-slate-700"><Battery size={16} className="text-orange-500"/> {sla.partsNeeded}</div>}
              {isSalto && sla.type && <div className="flex items-center gap-2 text-slate-700 font-medium">Type: {sla.type}</div>}
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase">Locatie & Planning</div>
              <div className="flex items-center gap-2 text-slate-700"><MapPin size={16} className="text-slate-400"/> {sla.location}</div>
              <div className="flex items-center gap-2 text-slate-700"><Calendar size={16} className="text-green-600"/> {monthNames[sla.plannedMonth]}</div>
              <div className="flex items-center gap-2 text-slate-700"><Euro size={16} className="text-slate-400"/> € {sla.price},-</div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase">Contact</div>
              <div className="flex items-center gap-2 text-slate-700"><User size={16} className="text-slate-400"/> {sla.contactName}</div>
              <div className="flex items-center gap-2 text-slate-700"><Phone size={16} className="text-slate-400"/> {sla.contactPhone}</div>
            </div>
          </div>
          {sla.comments && (<div className="mb-4 text-sm bg-slate-50 p-3 rounded-lg text-slate-600 italic border border-slate-100 flex gap-2 items-start"><MessageSquare size={16} className="shrink-0 mt-0.5 text-slate-400" /><span>"{sla.comments}"</span></div>
          )}
          <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-slate-100">
             <AttachmentManager sla={sla} onUpdate={onUpdate} />
             <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(sla); }} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"><Pencil size={18} /></button>
                {userRole === 'admin' && <button onClick={(e) => { e.stopPropagation(); if(window.confirm(`Verwijderen?`)) onDelete(sla.id); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SLAListProps {
  data: SLA[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onEdit: (sla: SLA) => void;
  onRefresh: () => void;
  onExecute: (sla: SLA) => void;
  initialFilter?: ListFilterType;
  userRole: UserRole;
}

export const SLAList = ({ data, onBack, onDelete, onEdit, onRefresh, onExecute, initialFilter = 'all', userRole }: SLAListProps) => {
  const [filterStatus, setFilterStatus] = useState<ListFilterType>(initialFilter);
  const [viewCategory, setViewCategory] = useState<string>('Alle');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { if (initialFilter) setFilterStatus(initialFilter); }, [initialFilter]);

  const processedData = useMemo(() => {
    let result = [...data];
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    let nextMonth = currentMonth + 1; let monthAfter = currentMonth + 2;
    if (nextMonth > 12) nextMonth -= 12; if (monthAfter > 12) monthAfter -= 12;

    if (viewCategory !== 'Alle') {
        result = result.filter(s => s.category === viewCategory);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(s => s.clientName.toLowerCase().includes(lowerQuery) || s.city.toLowerCase().includes(lowerQuery) || s.location.toLowerCase().includes(lowerQuery));
    }

    if (filterStatus === 'critical') result = result.filter(s => !s.isExecuted && s.plannedMonth <= currentMonth);
    else if (filterStatus === 'planning') result = result.filter(s => !s.isExecuted && (s.plannedMonth === nextMonth || s.plannedMonth === monthAfter));
    else if (filterStatus === 'done') result = result.filter(s => s.isExecuted);

    result.sort((a, b) => a.plannedMonth - b.plannedMonth);
    return result;
  }, [data, filterStatus, viewCategory, searchQuery]);

  const categories = ['Alle', 'Toegangscontrole', 'Draaideurautomatisatie', 'Poortautomatisatie', 'Zonneweringen'];

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-slate-600" /></button>
        <div><h2 className="text-2xl font-bold text-slate-900">{filterStatus === 'critical' ? 'Kritieke Dossiers' : filterStatus === 'planning' ? 'Planning' : filterStatus === 'done' ? 'Uitgevoerd' : 'Alle Dossiers'} <span className="ml-2 text-slate-500 font-normal">({processedData.length})</span></h2></div>
      </div>

      <div className="flex overflow-x-auto gap-2 p-1">
        {categories.map(cat => (
            <button 
                key={cat}
                onClick={() => setViewCategory(cat)} 
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${viewCategory === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
                {cat}
            </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-slate-400" /></div><input type="text" placeholder="Zoek op klant, stad..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <div className="flex gap-2">
            <select className="p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 min-w-[150px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}><option value="all">Alles</option><option value="critical">Kritiek</option><option value="planning">Planning</option><option value="done">Uitgevoerd</option></select>
            {(searchQuery || filterStatus !== 'all') && (<button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="p-2 bg-slate-100 text-slate-600 rounded-lg" title="Reset"><RotateCcw size={18} /></button>)}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {processedData.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed"><p className="text-slate-500 font-medium">Geen dossiers gevonden.</p></div>}
        {processedData.map((sla) => <SLAItemCard key={sla.id} sla={sla} onEdit={onEdit} onDelete={onDelete} userRole={userRole} onUpdate={onRefresh} onExecute={onExecute} />)}
      </div>
    </div>
  );
};