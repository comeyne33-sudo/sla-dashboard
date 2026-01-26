import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, Calendar, ExternalLink } from 'lucide-react';
import type { SLA } from '../../types/sla';

const monthNames = [
  "", "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
];

// Status logic (hetzelfde als dashboard)
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
  let color = '#94a3b8'; // Standaard grijs
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
  const safeData = data || [];
  // Centrum van België
  const belgiumCenter: [number, number] = [50.8503, 4.3517];

  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="text-emerald-600" />
            Locatie Overzicht
          </h2>
          <p className="text-slate-500 text-sm">Real-time status van {safeData.length} locaties.</p>
        </div>
      </div>

      {/* HIER ZAT HET PROBLEEM.
          We gebruiken nu een vaste pixel hoogte (600px).
          Dit garandeert dat de kaart zichtbaar is.
      */}
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

          {safeData.map((sla) => {
            const status = getMarkerStatus(sla);
            return (
              <Marker 
                key={sla.id} 
                position={[sla.lat, sla.lng]}
                icon={createCustomIcon(status)}
              >
                <Popup className="min-w-[250px]">
                  <div className="p-1 space-y-3">
                    {/* 1. Klantnaam */}
                    <h3 className="font-bold text-slate-900 text-base">{sla.clientName}</h3>
                    
                    {/* 2. Adres */}
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span>{sla.location}, {sla.city}</span>
                    </div>
                    
                    {/* 3. Uitvoeringsmaand & Status */}
                    <div className="flex items-center gap-2 text-sm">
                       <Calendar size={16} className="text-slate-400 shrink-0" />
                       <div className="flex flex-col">
                        <span className="text-slate-600">
                          Uitvoering: <span className="font-medium">{monthNames[sla.plannedMonth] || 'Onbekend'}</span>
                        </span>
                        
                        {/* Status Labeltje eronder */}
                        {status === 'executed' && <span className="text-xs font-medium text-green-600">Reeds uitgevoerd</span>}
                        {status === 'critical' && <span className="text-xs font-medium text-red-600">Kritiek / Nu inplannen!</span>}
                        {status === 'upcoming' && <span className="text-xs font-medium text-orange-600">Binnenkort inplannen</span>}
                      </div>
                    </div>

                    {/* 4. De Knop "Bekijk in lijst" */}
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