import React, { useState } from 'react';
import { ArrowLeft, Save, Building, MapPin, Wrench, Calendar } from 'lucide-react';
// Let op: 'import type' omdat jouw instellingen streng zijn
import type { SLA, SLAType, Quarter } from '../../types/sla';

interface SLAFormProps {
  onBack: () => void;
  onSubmit: (newSLA: Omit<SLA, 'id' | 'status' | 'lat' | 'lng'>) => void;
}

// Hier staat de 'export' die App.tsx zoekt
export const SLAForm = ({ onBack, onSubmit }: SLAFormProps) => {
  const [formData, setFormData] = useState({
    clientName: '',
    location: '',
    city: '',
    type: 'Basic' as SLAType,
    partsNeeded: '',
    hoursRequired: 2,
    plannedQuarter: 'Q1' as Quarter,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto h-full overflow-y-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-slate-50 py-4 z-10">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 shadow-sm">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Nieuw Contract</h2>
          <p className="text-slate-500">Voeg een nieuwe klant toe aan de database.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Sectie 1: Algemeen */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Building size={18} className="text-blue-600" /> Bedrijfsgegevens
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Klantnaam</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="bv. Havenbedrijf Gent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contactpersoon</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="bv. Jan Peeters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefoon</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} placeholder="+32 ..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} placeholder="@bedrijf.be" />
              </div>
            </div>
          </div>

          {/* Sectie 2: Locatie */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <MapPin size={18} className="text-emerald-600" /> Locatie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stad</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="bv. Antwerpen" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specifieke Locatie</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="bv. Hal 3, Poort 4" />
              </div>
            </div>
          </div>

          {/* Sectie 3: Contract Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Wrench size={18} className="text-orange-500" /> Service Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type Contract</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as SLAType})}>
                  <option value="Basic">Basic</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Benodigde Onderdelen</label>
                <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  value={formData.partsNeeded} onChange={e => setFormData({...formData, partsNeeded: e.target.value})} placeholder="bv. Batterij 12V" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prijs (€)</label>
                <input type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
              </div>
            </div>
          </div>

           {/* Sectie 4: Planning */}
           <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Calendar size={18} className="text-purple-600" /> Planning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gepland Kwartaal</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.plannedQuarter} onChange={e => setFormData({...formData, plannedQuarter: e.target.value as Quarter})}>
                  <option value="Q1">Q1 (Jan-Mrt)</option>
                  <option value="Q2">Q2 (Apr-Jun)</option>
                  <option value="Q3">Q3 (Jul-Sep)</option>
                  <option value="Q4">Q4 (Okt-Dec)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-200 sticky bottom-0">
          <button type="button" onClick={onBack} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Annuleren
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-transform active:scale-95">
            <Save size={18} />
            Opslaan
          </button>
        </div>
      </form>
    </div>
  );
};