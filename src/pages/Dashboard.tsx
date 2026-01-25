import { LayoutList, MapPin, PlusCircle, Trash2 } from 'lucide-react';

// Deze interface is CRUCIAAL. Het vertelt VS Code: 
// "Dit component verwacht een functie genaamd onNavigate"
interface DashboardProps {
  onNavigate: (page: string) => void;
}

const tiles = [
  { id: 'list', title: 'SLA Overzicht', desc: 'Lijstweergave van batterijen, uren en kwartalen.', icon: LayoutList, color: 'bg-blue-600', border: 'hover:border-blue-600' },
  { id: 'map', title: 'Locatie Kaart', desc: 'Geografisch overzicht van alle klanten.', icon: MapPin, color: 'bg-emerald-600', border: 'hover:border-emerald-600' },
  { id: 'add', title: 'Nieuwe SLA', desc: 'Voeg een nieuw contract toe.', icon: PlusCircle, color: 'bg-orange-500', border: 'hover:border-orange-500' },
  { id: 'manage', title: 'Beheer', desc: 'Verwijder of pauzeer contracten.', icon: Trash2, color: 'bg-red-600', border: 'hover:border-red-600' },
];

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  return (
    <div className="space-y-8">
      <header className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">
          Welkom terug. Er zijn momenteel <span className="font-bold text-blue-700">3 actieve SLA's</span> die aandacht vereisen.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={() => onNavigate(tile.id)}
              className={`group relative flex flex-col items-start p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all text-left ${tile.border}`}
            >
              <div className={`p-3 rounded-lg ${tile.color} text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{tile.title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{tile.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};