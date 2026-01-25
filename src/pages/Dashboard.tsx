import { LayoutList, MapPin, PlusCircle, Trash2, ClipboardCheck } from 'lucide-react';

const tiles = [
  { id: 'list', title: 'SLA Overzicht', desc: 'Batterijen & planning', icon: LayoutList, color: 'bg-blue-600' },
  { id: 'map', title: 'Kaart', desc: 'Locaties in België', icon: MapPin, color: 'bg-emerald-600' },
  { id: 'add', title: 'Nieuwe SLA', desc: 'Toevoegen aan systeem', icon: PlusCircle, color: 'bg-orange-500' },
  { id: 'manage', title: 'Beheer', desc: 'Aanpassen of wissen', icon: Trash2, color: 'bg-red-600' },
];

export const Dashboard = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-800 font-bold italic">
          <ClipboardCheck size={28} />
          <span className="text-2xl tracking-tighter uppercase">Santens Automatics</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500">Beheer je onderhoudscontracten en batterijwissels.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              className="group relative flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all text-left"
            >
              <div className={`p-3 rounded-xl ${tile.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{tile.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{tile.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};