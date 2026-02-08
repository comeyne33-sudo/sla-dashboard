import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Building, MapPin, Wrench, Calendar, CheckSquare, MessageSquare, Paperclip, X, FileText, Image as ImageIcon, Loader2, Hash, Upload, FileSpreadsheet, Trash2 } from 'lucide-react';
import type { SLA, SLAType, Attachment, UserRole, SLACategory, DoorItem } from '../../types/sla';
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
    category: (initialData?.category || 'Toegangscontrole') as SLACategory,
    vo_number: initialData?.vo_number || '',
    clientName: initialData?.clientName || '',
    location: initialData?.location || '',
    city: initialData?.city || '',
    
    // Specifieke velden (hergebruikt waar nodig)
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
    calculation_done: initialData?.calculation_done || false,
  });

  const [uploading, setUploading] = useState(false);
  const [doors, setDoors] = useState<DoorItem[]>([]);
  const [importingDoors, setImportingDoors] = useState(false);

  useEffect(() => {
    if (initialData?.id) fetchDoors();
  }, [initialData]);

  const fetchDoors = async () => {
    if (!initialData?.id) return;
    const { data } = await supabase.from('sla_doors').select('*').eq('sla_id', initialData.id).order('created_at', { ascending: true });
    if (data) setDoors(data as DoorItem[]);
  };

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
        newAttachments.push({ name: file.name, url: publicUrl, type: file.type.startsWith('image/') ? 'image' : 'file' });
      } catch (error) { console.error(error); alert('Fout bij uploaden.'); }
    }
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
    setUploading(false);
  };

  const removeAttachment = (indexToRemove: number) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, index) => index !== indexToRemove) }));
  };

  // --- CSV IMPORT LOGICA (AANGEPAST) ---
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !initialData?.id) {
        alert("Sla het dossier eerst op voordat je deuren importeert.");
        return;
    }
    
    setImportingDoors(true);
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const newDoors = lines
        .map(line => {
          // Split op komma, verwijder quotes indien nodig
          const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
          if (cols.length < 2) return null; // Te weinig kolommen

          // INDEX 1 = Naam (Deurnaam)
          // INDEX 2 = Zone
          // INDEX 7 = Status (Offline/Online)
          const name = cols[1];
          const zone = cols[2] || '';
          const status = cols[7] || '';

          if (!name || name.toLowerCase() === 'naam') return null; // Header skip

          return {
            sla_id: initialData.id,
            door_name: name,
            zone: zone,
            connection_status: status,
            status: 'pending'
          };
        })
        .filter(item => item !== null);

      if (newDoors.length === 0) {
        alert("Geen geldige deuren gevonden in CSV.");
        setImportingDoors(false);
        return;
      }

      // @ts-ignore (status type check)
      const { error } = await supabase.from('sla_doors').insert(newDoors);
      
      if (error) {
        console.error(error);
        alert("Fout bij importeren database.");
      } else {
        alert(`${newDoors.length} deuren succesvol geïmporteerd!`);
        fetchDoors();
      }
      setImportingDoors(false);
    };

    reader.readAsText(file);
  };

  const handleDeleteAllDoors = async () => {
    if(!initialData?.id) return;
    if(!confirm("Ben je zeker? Dit verwijdert alle geïmporteerde deuren.")) return;
    
    await supabase.from('sla_doors').delete().eq('sla_id', initialData.id);
    fetchDoors();
  };

  const months = [
    { val: 1, label: 'Januari' }, { val: 2, label: 'Februari' }, { val: 3, label: 'Maart' },
    { val: 4, label: 'April' }, { val: 5, label: 'Mei' }, { val: 6, label: 'Juni' },
    { val: 7, label: 'Juli' }, { val: 8, label: 'Augustus' }, { val: 9, label: 'September' },
    { val: 10, label: 'Oktober' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
  ];

  const categories: SLACategory[] = ['Toegangscontrole', 'Draaideurautomatisatie', 'Poortautomatisatie', 'Zonneweringen'];

  return (
    <div className="max-w-3xl mx-auto h-full overflow-y-auto pb-10">
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-slate-50 py-4 z-10">
        <button type="button" onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 shadow-sm">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {initialData ? 'Dossier Bekijken/Bewerken' : 'Nieuw Dossier'}
          </h2>
          {isTechnician && <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">Read-only Modus</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* CATEGORIE KEUZE */}
        <div className="border-b border-slate-200 p-4 bg-slate-50">
          <label className="block text-sm font-bold text-slate-700 mb-2">Selecteer Categorie</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                disabled={isTechnician}
                onClick={() => setFormData({...formData, category: cat})}
                className={`p-2 text-xs sm:text-sm font-bold rounded-lg transition-colors border ${
                  formData.category === cat 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

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

          {/* ALGEMENE GEGEVENS */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2"><Building size={18} className="text-slate-500" /> Algemene Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Klantnaam</label>
                <input required type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                   <Hash size={14} /> VO Nummer
                </label>
                <input type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100" value={formData.vo_number} onChange={e => setFormData({...formData, vo_number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prijs (€)</label>
                <input type="number" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
              </div>
            </div>
          </div>

          {/* LOCATIE & CONTACT */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2"><MapPin size={18} className="text-slate-500" /> Locatie & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stad</label>
                <input required type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                <input required type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contactpersoon</label>
                    <input type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefoon</label>
                    <input type="text" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" disabled={isTechnician} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                 </div>
              </div>
            </div>
          </div>

          {/* DYNAMISCH BLOK: TOEGANGSCONTROLE SPECIFIEK */}
          <div className={`rounded-xl border p-4 ${formData.category === 'Toegangscontrole' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className={`font-bold flex items-center gap-2 mb-4 ${formData.category === 'Toegangscontrole' ? 'text-blue-800' : 'text-slate-800'}`}>
              <Wrench size={20} />
              Specificaties: {formData.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Benodigde Onderdelen</label>
                  <input type="text" disabled={isTechnician} className="w-full p-2 border border-slate-200 rounded-lg" value={formData.partsNeeded} onChange={e => setFormData({...formData, partsNeeded: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Geschatte Uren</label>
                  <input type="number" step="0.5" disabled={isTechnician} className="w-full p-2 border border-slate-200 rounded-lg" value={formData.hoursRequired} onChange={e => setFormData({...formData, hoursRequired: parseFloat(e.target.value) || 0})} />
                </div>
            </div>

            {/* --- CSV DEURLIJST IMPORT (ALLEEN BIJ TOEGANGSCONTROLE) --- */}
            {initialData && formData.category === 'Toegangscontrole' && !isTechnician && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <label className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                       <FileSpreadsheet size={18} /> Deurlijst (CSV Import)
                    </label>
                    
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      {doors.length > 0 ? (
                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <p className="text-green-600 font-medium flex items-center gap-2">
                               <CheckSquare size={18} /> {doors.length} deuren geïmporteerd
                             </p>
                             <button type="button" onClick={handleDeleteAllDoors} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                               <Trash2 size={14} /> Verwijder lijst
                             </button>
                           </div>
                           <div className="max-h-32 overflow-y-auto bg-slate-50 p-2 rounded border border-slate-100 text-sm text-slate-600">
                              {doors.map((d, i) => <div key={i} className="truncate">{i+1}. {d.door_name} ({d.zone})</div>)}
                           </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                           <p className="text-sm text-slate-500 mb-3">Upload de deurenlijst (.csv)</p>
                           <label className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors ${importingDoors ? 'opacity-50' : ''}`}>
                             {importingDoors ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                             <span>CSV Selecteren</span>
                             <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                           </label>
                        </div>
                      )}
                    </div>
                  </div>
            )}
          </div>

          {/* PLANNING */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Calendar size={18} className="text-slate-500" /> Planning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Geplande Maand</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100"
                  value={formData.plannedMonth} 
                  onChange={e => setFormData({...formData, plannedMonth: parseInt(e.target.value)})}
                  disabled={isTechnician}
                >
                  {months.map(m => (
                    <option key={m.val} value={m.val}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* COMMENTS & ATTACHMENTS */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2"><MessageSquare size={18} className="text-slate-500" /> Opmerkingen & Foto's</h3>
            <textarea className="w-full p-3 border border-slate-300 rounded-lg min-h-[100px]" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Interne opmerkingen voor technieker..." />
            
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