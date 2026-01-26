import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, Calendar, ExternalLink } from 'lucide-react';
import type { SLA } from '../../types/sla';

const monthNames = [
  "", "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
];

// Status Logica
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

const createCustomIcon = (status: string) => {
  // HIER IS DE AANPASSING:
  let color = '#3b82f6'; // Standaard is nu BLAUW (was grijs)
  
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
    "></div>`,
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
  const [showCritical, setShowCritical] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showExecuted, setShowExecuted] = useState(true);

  const safeData = data || [];
  const belgiumCenter: [number, number] = [50.8503, 4.3517];

  // Filter de data voor de kaart
  const filteredData = safeData.filter(sla => {
    const status = getMarkerStatus(sla);
    
    // Logica voor de checkboxes:
    if (status === 'critical' && !showCritical) return false;
    if (status === 'executed' && !showExecuted) return false;
    
    // 'Upcoming' checkbox bestuurt nu zowel Oranje (binnenkort) als Blauw (toekomst)
    // Zodat je "alles wat nog moet gebeuren maar niet kritiek is" samen kunt aan/uitzetten
    if ((status === 'upcoming' || status === 'future') && !showUpcoming) return false;
    
    return true;
  });

  return (
    <div className="flex flex-col space-y-4 h-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="text-emerald-600" />
              Locatie Overzicht
            </h2>
            <p className="text-slate-500 text-sm">Real-time status van {filteredData.length} locaties.</p>
          </div>
        </div>

        {/* MAP FILTERS */}
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="accent-red-500 w-4 h-4" checked={showCritical} onChange={e => setShowCritical(e.target.checked)} />
            <span className="text-red-600">Kritiek</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            {/* Tekstkleur aangepast naar blauw/oranje om aan te geven dat dit de "toekomst" is */}
            <input type="checkbox" className="accent-blue-500 w-4 h-4" checked={showUpcoming} onChange={e => setShowUpcoming(e.target.checked)} />
            <span className="text-slate-700">In Planning (Oranje/Blauw)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="accent-green-500 w-4 h-4" checked={showExecuted} onChange={e => setShowExecuted(e.target.checked)} />
            <span className="text-green-600">Uitgevoerd</span>
          </label>
        </div>
      </div>

      <div 
        className="rounded-xl overflow-hidden border border-slate-300 shadow-inner relative z-0"
        style={{ height: '600px', width: '100%' }} 
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
            return (
              <Marker 
                key={sla.id} 
                position={[sla.lat, sla.lng]}
                icon={createCustomIcon(status)}
              >
                <Popup className="min-w-[250px]">
                  <div className="p-1 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base">{sla.clientName}</h3>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span>{sla.location}, {sla.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                       <Calendar size={16} className="text-slate-400 shrink-0" />
                       <div className="flex flex-col">
                        <span className="text-slate-600">
                          Uitvoering: <span className="font-medium">{monthNames[sla.plannedMonth] || 'Onbekend'}</span>
                        </span>
                        
                        {status === 'executed' && <span className="text-xs font-medium text-green-600">Reeds uitgevoerd</span>}
                        {status === 'critical' && <span className="text-xs font-medium text-red-600">Kritiek / Nu inplannen!</span>}
                        {status === 'upcoming' && <span className="text-xs font-medium text-orange-600">Binnenkort inplannen</span>}
                        {status === 'future' && <span className="text-xs font-medium text-blue-600">Gepland later dit jaar</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => onViewSLA(sla.id)}
                      className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-100"
                    >
                      <ExternalLink size={14} /> Bekijk in lijst
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