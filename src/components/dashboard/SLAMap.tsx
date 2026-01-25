import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { SLA } from '../../types/sla'; // Strict import

// De robuuste CSS markers
const createCustomIcon = (status: string) => {
  const color = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
  
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
    ">
      <div style="background: white; width: 8px; height: 8px; border-radius: 50%;"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

interface SLAMapProps {
  data: SLA[];
  onBack: () => void;
}

export const SLAMap = ({ data, onBack }: SLAMapProps) => {
  // Console log om te checken of data binnenkomt
  console.log("--> SLAMap ontvangt data:", data);

  const safeData = data || [];
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

      {/* Kaart Container - AANGEPAST: min-h-150 in plaats van min-h-[600px] */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-300 shadow-inner relative z-0 min-h-150">
        <MapContainer 
          center={belgiumCenter} 
          zoom={9} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {safeData.map((sla) => (
            <Marker 
              key={sla.id} 
              position={[sla.lat, sla.lng]}
              icon={createCustomIcon(sla.status)}
            >
              <Popup className="min-w-55">
                <div className="p-1">
                  <h3 className="font-bold text-slate-900 mb-1">{sla.clientName}</h3>
                  <div className="text-xs text-slate-500 mb-2">{sla.city}</div>
                  
                  <div className="flex items-center gap-2 text-sm">
                     {sla.status === 'active' && <CheckCircle size={14} className="text-green-600" />}
                     {sla.status === 'warning' && <Clock size={14} className="text-orange-600" />}
                     {sla.status === 'critical' && <AlertTriangle size={14} className="text-red-600" />}
                     <span className="capitalize font-medium">{sla.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};