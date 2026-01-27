import React, { useState } from 'react';
import { ArrowLeft, Save, Building, MapPin, Wrench, Calendar, CheckSquare, MessageSquare, Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { SLA, SLAType, Attachment, UserRole } from '../../types/sla';
import { supabase } from '../../lib/supabase';

interface SLAFormProps {
  onBack: () => void;
  onSubmit: (data: Omit<SLA, 'id' | 'status' | 'lat' | 'lng' | 'lastUpdate'>) => void;
  initialData?: SLA | null;
  userRole: UserRole;
}

export const SLAForm = ({ onBack, onSubmit, initialData, userRole }: SLAFormProps) => {
  const isTechnician = userRole === 'technician';

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
    comments: initialData?.comments || '',
    attachments: initialData?.attachments || [] as Attachment[],
    price: initialData?.price || 0,
    isExecuted: initialData?.isExecuted || false,
  });

  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    const newAttachments: Attachment[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      try {
        const { error: uploadError } = await supabase.storage.from('sla-files').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('sla-files').getPublicUrl(fileName);
        newAttachments.push({
          name: file.name,
          url: publicUrl,
          type: file.type.startsWith('image/') ? 'image' : 'file'
        });
      } catch (error) {
        console.error(error);
        alert('Fout bij uploaden.');
      }
    }
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
    setUploading(false);
  };

  const removeAttachment = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
    }));
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
            {initialData ? 'Dossier Bekijken/Bewerken' : 'Nieuw Contract'}
          </h2>
          {isTechnician && <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">Read-only Modus (Alleen commentaar/bijlagen)</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          
          {initialData && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-4">
              <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm"><CheckSquare size={24} /></div>
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
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2"><Building size={18} className="text-blue-600" /> Bedrijfsgegevens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Klantnaam</label>
                <input required type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contactpersoon</label>
                <input required type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefoon</label>
                <input required type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2"><MapPin size={18} className="text-emerald-600" /> Locatie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stad</label>
                <input required type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specifieke Locatie</label>
                <input required type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2"><Wrench size={18} className="text-orange-500" /> Service Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Type Contract</label>
                <select disabled={isTechnician} className="w-full p-2.5 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as SLAType})}>
                  <option value="Basic">Basic</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Benodigde Onderdelen</label>
                <input type="text" disabled={isTechnician || formData.type === 'Basic'} className={`w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500`} value={formData.type === 'Basic' ? '' : formData.partsNeeded} onChange={e => setFormData({...formData, partsNeeded: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Geschatte Uren</label>
                <input type="number" step="0.5" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" value={formData.hoursRequired} onChange={e => setFormData({...formData, hoursRequired: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prijs (€)</label>
                <input type="number" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
              </div>
            </div>
          </div>

          {/* HIER IS HET TERUGGEZETTE BLOK PLANNING */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Calendar size={18} className="text-purple-600" /> Planning Uitvoering
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Geplande Maand</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  value={formData.plannedMonth} 
                  onChange={e => setFormData({...formData, plannedMonth: parseInt(e.target.value)})}
                  disabled={isTechnician} // Alleen admin mag plannen
                >
                  {months.map(m => (
                    <option key={m.val} value={m.val}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2"><MessageSquare size={18} className="text-slate-500" /> Commentaar</h3>
            <textarea className="w-full p-3 border border-slate-300 rounded-lg min-h-[100px]" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Technieker opmerkingen..." />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2"><Paperclip size={18} className="text-slate-500" /> Bijlagen</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className={`flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 border border-slate-200 ${uploading ? 'opacity-50' : ''}`}>
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                  <span className="font-medium">Bestand toevoegen</span>
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              {formData.attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {formData.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {file.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm truncate">{file.name}</a>
                      </div>
                      <button type="button" onClick={() => removeAttachment(idx)} className="p-1 hover:text-red-500"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-200 sticky bottom-0">
          <button type="button" onClick={onBack} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">Annuleren</button>
          <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> Opslaan</button>
        </div>
      </form>
    </div>
  );
};