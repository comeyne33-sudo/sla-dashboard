import React from 'react';
import { LayoutList, MapPin, PlusCircle, Trash2, ClipboardCheck } from 'lucide-react';

const tiles = [
  { id: 'list', title: 'SLA Overzicht', desc: 'Volledige lijst met batterijen & uren', icon: LayoutList, color: 'bg-blue-600' },
  { id: 'map', title: 'Interactieve Kaart', desc: 'Locaties van alle SLA-klanten in België', icon: MapPin, color: 'bg-emerald-600' },
  { id: 'add', title: 'Nieuwe SLA', desc: 'Voeg een klant of contract toe', icon: PlusCircle, color: 'bg-orange-500' },
  { id: 'manage', title: 'Beheer & Verwijder', desc: 'SLA\'s aanpassen of stopzetten', icon: Trash2, color: 'bg-red-600' },
];

export const Dashboard = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-800 font-bold italic">
          <ClipboardCheck size={28} />
          <span className="text-2xl tracking-tighter uppercase">Santens Automatics</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Service Management</h1>
        <p className="text-slate-500 max-w-2xl">Welkom in het beheersysteem. Er zijn momenteel <span className="font-bold text-blue-600">3</span> actieve SLA's gepland voor uitvoering.</p>
      </header>

      {/* Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            className="group relative flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all text-left overflow-hidden"
          >
            <div className={`p-3 rounded-xl ${tile.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
              <tile.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{tile.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{tile.desc}</p>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-600 group-hover:w-full transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};