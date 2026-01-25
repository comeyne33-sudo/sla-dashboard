import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import type { SLA } from '../../types/sla';

const createCustomIcon = (status: string) => {
  const color = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

interface SLAMapProps {
  data: SLA[];
  onBack: () => void;
}

export const SLAMap = ({ data, onBack }: SLAMapProps) => {
  // VEILIGHEIDSCHECK: Voorkomt de "undefined" crash
  const safeData = data || [];
  
  const belgiumCenter: [number, number] = [50.8503, 4.3517];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="text-emerald-600" />
            Locatie Overzicht
          </h2>
          <p className="text-slate-500 text-sm">Real-time status van alle actieve locaties in België.</p>
        </div>
      </div>

      {/* De Kaart */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-300 shadow-inner relative z-0">
        <MapContainer 
          center={belgiumCenter} 
          zoom={9} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* We gebruiken hier safeData in plaats van data */}
          {safeData.map((sla) => (
            <Marker 
              key={sla.id} 
              position={[sla.lat, sla.lng]}
              icon={createCustomIcon(sla.status)}
            >
              <Popup className="min-w-55">
                <div className="p-1 font-sans">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-base">{sla.clientName}</h3>
                    <span className={`w-3 h-3 rounded-full mt-1.5 ${
                      sla.status === 'active' ? 'bg-green-500' : 
                      sla.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                  </div>
                  
                  <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                    <MapPin size={12} /> {sla.location}, {sla.city}
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      {sla.status === 'active' && <CheckCircle size={14} className="text-green-600" />}
                      {sla.status === 'warning' && <Clock size={14} className="text-orange-600" />}
                      {sla.status === 'critical' && <AlertTriangle size={14} className="text-red-600" />}
                      <span className="font-medium capitalize">{sla.status}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Nodig:</strong> {sla.partsNeeded}
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Planning:</strong> {sla.plannedQuarter}
                    </div>
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