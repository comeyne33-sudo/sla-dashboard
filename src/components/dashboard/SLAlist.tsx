import { ArrowLeft, Battery, Calendar, Clock, Euro, Mail, MapPin, Phone, User, Trash2 } from 'lucide-react';
import type { SLA } from '../../types/sla';

interface SLAListProps {
  data: SLA[];
  onBack: () => void;
  onDelete: (id: string) => void; // <--- NIEUW: De lijst moet weten dat hij mag verwijderen
}

export const SLAList = ({ data, onBack, onDelete }: SLAListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Actieve Dossiers ({data.length})</h2>
          <p className="text-slate-500">Lijst van geplande interventies en materialen.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {data.map((sla) => (
          <div key={sla.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition-all group relative">
            
            {/* NIEUW: Verwijder knop (alleen zichtbaar bij hover, of altijd op mobiel) */}
            <button 
              onClick={() => {
                if(window.confirm(`Weet je zeker dat je ${sla.clientName} wilt verwijderen?`)) {
                  onDelete(sla.id);
                }
              }}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Verwijder dossier"
            >
              <Trash2 size={20} />
            </button>

            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4 pr-12">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{sla.clientName}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                  <MapPin size={14} /> {sla.location}, {sla.city}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${sla.type === 'Premium' ? 'bg-purple-100 text-purple-700' : 
                  sla.type === 'Comfort' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                {sla.type}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">Materiaal & Tijd</div>
                <div className="flex items-center gap-2 text-slate-700"><Battery size={16} className="text-orange-500"/> {sla.partsNeeded}</div>
                <div className="flex items-center gap-2 text-slate-700"><Clock size={16} className="text-blue-500"/> {sla.hoursRequired}u werk</div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">Planning</div>
                <div className="flex items-center gap-2 text-slate-700"><Calendar size={16} className="text-green-600"/> Uitvoering: {sla.plannedQuarter}</div>
                <div className="flex items-center gap-2 text-slate-700"><Euro size={16} className="text-slate-400"/> € {sla.price},-</div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">Contact</div>
                <div className="flex items-center gap-2 text-slate-700"><User size={16} className="text-slate-400"/> {sla.contactName}</div>
                <div className="flex items-center gap-2 text-slate-700"><Phone size={16} className="text-slate-400"/> {sla.contactPhone}</div>
                <div className="flex items-center gap-2 text-slate-700 truncate"><Mail size={16} className="text-slate-400"/> {sla.contactEmail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};