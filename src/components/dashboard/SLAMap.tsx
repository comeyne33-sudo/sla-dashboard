import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, Calendar, ExternalLink } from 'lucide-react';
import type { SLA, SLACategory } from '../../types/sla';

const monthNames = [
  "", "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
];

const getMarkerStatus = (sla: SLA) => {
  if (sla.isExecuted) return 'executed'; 

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  
  let nextMonth = currentMonth + 1;
  let monthAfter = currentMonth + 2;
  if (nextMonth > 12) nextMonth -= 12;
  if (monthAfter > 12) monthAfter -= 12;

  if (sla.plannedMonth <= currentMonth) return 'critical'; 
  if (sla.plannedMonth === nextMonth || sla.plannedMonth === monthAfter) return 'upcoming'; 
  
  return 'future';
};

const createCustomIcon = (status: string, category: string) => {
  let color = '#3b82f6'; // Blauw
  
  if (status === 'executed') color = '#10b981'; // Groen
  if (status === 'critical') color = '#ef4444'; // Rood
  if (status === 'upcoming') color = '#f59e0b'; // Oranje
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: white;
    ">${category === 'Renson' ? 'R' : 'S'}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

interface SLAMapProps {
  data: SLA[];
  onBack: () => void;
  onViewSLA: (id: string) => void; 
}

export const SLAMap = ({ data, onBack, onViewSLA }: SLAMapProps) => {
  const [viewCategory, setViewCategory] = useState<'All' | SLACategory>('All');
  const [showExecuted, setShowExecuted] = useState(false);

  const safeData = data || [];
  const belgiumCenter: [number, number] = [50.8503, 4.3517];

  const filteredData = useMemo(() => {
    return safeData.filter(sla => {
      if (viewCategory !== 'All') {
        const cat = sla.category || 'Salto';
        if (cat !== viewCategory) return false;
      }
      if (!showExecuted && sla.isExecuted) return false;
      if (sla.calculation_done) return false;
      return true;
    });
  }, [safeData, viewCategory, showExecuted]);

  return (
    <div className="flex flex-col space-y-4 h-full relative">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="text-emerald-600" />
              Locatie Overzicht
            </h2>
            <p className="text-slate-500 text-sm">
              {filteredData.length} locaties zichtbaar
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewCategory('All')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewCategory === 'All' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Alles
            </button>
            <button 
              onClick={() => setViewCategory('Salto')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewCategory === 'Salto' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Salto
            </button>
            <button 
              onClick={() => setViewCategory('Renson')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewCategory === 'Renson' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Renson
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              checked={showExecuted}
              onChange={e => setShowExecuted(e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-700">Toon ook uitgevoerd</span>
          </label>
        </div>
      </div>

      <div 
        className="rounded-xl overflow-hidden border border-slate-300 shadow-inner relative z-0 flex-1 min-h-[500px]"
      >
        <MapContainer 
          center={belgiumCenter} 
          zoom={9} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredData.map((sla) => {
            const status = getMarkerStatus(sla);
            const category = sla.category || 'Salto';
            
            return (
              <Marker 
                key={sla.id} 
                position={[sla.lat, sla.lng]}
                icon={createCustomIcon(status, category)}
              >
                <Popup className="min-w-[250px]">
                  <div className="p-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 text-base">{sla.clientName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${category === 'Salto' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {category}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span>{sla.location}, {sla.city}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                       <Calendar size={16} className="text-slate-400 shrink-0" />
                       <div className="flex flex-col">
                        <span className="text-slate-600">
                          Planning: <span className="font-medium">{monthNames[sla.plannedMonth] || 'Onbekend'}</span>
                        </span>
                        
                        {status === 'executed' && <span className="text-xs font-medium text-green-600">Reeds uitgevoerd</span>}
                        {status === 'critical' && <span className="text-xs font-medium text-red-600">Kritiek / Nu inplannen!</span>}
                        {status === 'upcoming' && <span className="text-xs font-medium text-orange-600">Binnenkort inplannen</span>}
                      </div>
                    </div>

                    <button 
                      onClick={() => onViewSLA(sla.id)}
                      className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium border border-slate-200"
                    >
                      <ExternalLink size={14} /> Naar dossier
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};