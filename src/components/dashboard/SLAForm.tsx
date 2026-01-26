import React, { useState } from 'react';
import { ArrowLeft, Save, Building, MapPin, Wrench, Calendar, CheckSquare } from 'lucide-react';
import type { SLA, SLAType } from '../../types/sla';

interface SLAFormProps {
  onBack: () => void;
  onSubmit: (data: Omit<SLA, 'id' | 'status' | 'lat' | 'lng' | 'lastUpdate'>) => void;
  initialData?: SLA | null;
}

export const SLAForm = ({ onBack, onSubmit, initialData }: SLAFormProps) => {
  const [formData, setFormData] = useState({
    clientName: initialData?.clientName || '',
    location: initialData?.location || '',
    city: initialData?.city || '',
    type: (initialData?.type || 'Basic') as SLAType,
    partsNeeded: initialData?.partsNeeded || '',
    hoursRequired: initialData?.hoursRequired || 2,
    plannedMonth: initialData?.plannedMonth || 1, 
    contactName: initialData?.contactName || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    price: initialData?.price || 0,
    isExecuted: initialData?.isExecuted || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const months = [
    { val: 1, label: 'Januari' }, { val: 2, label: 'Februari' }, { val: 3, label: 'Maart' },
    { val: 4, label: 'April' }, { val: 5, label: 'Mei' }, { val: 6, label: 'Juni' },
    { val: 7, label: 'Juli' }, { val: 8, label: 'Augustus' }, { val: 9, label: 'September' },
    { val: 10, label: 'Oktober' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
  ];

  return (
    <div className="max-w-3xl mx-auto h-full overflow-y-auto pb-10">
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-slate-50 py-4 z-10">
        <button type="button" onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 shadow-sm">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {initialData ? 'Dossier Bewerken' : 'Nieuw Contract'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          
          {initialData && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-4">
              <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
                <CheckSquare size={24} />
              </div>
              <div className="flex-1">
                <label className="font-semibold text-slate-900 cursor-pointer select-none flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    checked={formData.isExecuted}
                    onChange={e => setFormData({...formData, isExecuted: e.target.checked})}
                  />
                  Interventie is reeds uitgevoerd
                </label>
                <p className="text-sm text-slate-500 ml-7">Vink dit aan als het werk voltooid is.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Building size={18} className="text-blue-600" /> Bedrijfsgegevens
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Klantnaam</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" 
                  value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contactpersoon</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" 
                  value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefoon</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" 
                  value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full p-2 border border-slate-300 rounded-lg" 
                  value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <MapPin size={18} className="text-emerald-600" /> Locatie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stad</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" 
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specifieke Locatie</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Wrench size={18} className="text-orange-500" /> Service Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type Contract</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as SLAType})}>
                  <option value="Basic">Basic</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Benodigde Onderdelen</label>
                <input 
                  type="text" 
                  disabled={formData.type === 'Basic'}
                  className={`w-full p-2 border border-slate-300 rounded-lg transition-colors
                    ${formData.type === 'Basic' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'}
                  `}
                  value={formData.type === 'Basic' ? '' : formData.partsNeeded}
                  onChange={e => setFormData({...formData, partsNeeded: e.target.value})} 
                  placeholder={formData.type === 'Basic' ? 'Niet van toepassing bij Basic' : ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prijs (€)</label>
                <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" 
                  value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
              </div>
            </div>
          </div>

           <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Calendar size={18} className="text-purple-600" /> Planning Uitvoering
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Geplande Maand</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  value={formData.plannedMonth} 
                  onChange={e => setFormData({...formData, plannedMonth: parseInt(e.target.value)})}
                >
                  {months.map(m => (
                    <option key={m.val} value={m.val}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-200 sticky bottom-0">
          <button type="button" onClick={onBack} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Annuleren
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2">
            <Save size={18} />
            {initialData ? 'Wijzigingen Opslaan' : 'Aanmaken'}
          </button>
        </div>
      </form>
    </div>
  );
};