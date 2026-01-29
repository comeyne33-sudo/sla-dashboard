import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Save, Loader2, MapPin, Hash, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SLA, DoorItem } from '../../types/sla';
import { AttachmentManager } from './AttachmentManager';

interface ExecutionViewProps {
  sla: SLA;
  onBack: () => void;
  onFinish: () => void;
}

export const ExecutionView = ({ sla, onBack, onFinish }: ExecutionViewProps) => {
  const [doors, setDoors] = useState<DoorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generalComments, setGeneralComments] = useState(sla.comments || '');
  
  // Trigger voor updates (foto's)
  const [, setUpdateTrigger] = useState(0);

  useEffect(() => {
    fetchDoors();
  }, [sla.id]);

  const fetchDoors = async () => {
    const { data } = await supabase
      .from('sla_doors')
      .select('*')
      .eq('sla_id', sla.id)
      .order('created_at', { ascending: true });
    
    if (data) setDoors(data as DoorItem[]);
    setLoading(false);
  };

  const updateDoorStatus = (id: string, status: 'ok' | 'nok') => {
    setDoors(doors.map(d => d.id === id ? { ...d, status } : d));
  };

  const updateDoorRemark = (id: string, text: string) => {
    setDoors(doors.map(d => d.id === id ? { ...d, remarks: text } : d));
  };

  const handleFinish = async () => {
    if (doors.length > 0) {
      const pending = doors.filter(d => d.status === 'pending');
      if (pending.length > 0) {
        if(!confirm(`Er zijn nog ${pending.length} deuren niet gecontroleerd. Toch afronden?`)) return;
      }
    } else {
       if(!confirm("Ben je klaar met deze interventie?")) return;
    }

    setSaving(true);

    try {
      if (doors.length > 0) {
        await supabase.from('sla_doors').upsert(doors);
      }

      await supabase.from('slas').update({
        isExecuted: true,
        comments: generalComments,
        lastUpdate: new Date().toLocaleDateString('nl-BE')
      }).eq('id', sla.id);

      onFinish();

    } catch (error) {
      console.error(error);
      alert("Er ging iets mis bij het opslaan.");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Laden...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{sla.clientName}</h2>
            <div className="flex items-center gap-3 text-sm text-slate-500">
               <span className="flex items-center gap-1"><MapPin size={14} /> {sla.city}</span>
               {sla.vo_number && <span className="flex items-center gap-1 bg-slate-100 px-2 rounded"><Hash size={12} /> {sla.vo_number}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4">
        
        {/* CHECKLIST */}
        {doors.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
               <h3 className="font-bold text-blue-900">Deurlijst Controle ({doors.filter(d => d.status !== 'pending').length}/{doors.length})</h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              {doors.map((door) => (
                <div key={door.id} className={`p-4 transition-colors ${door.status === 'ok' ? 'bg-green-50/50' : door.status === 'nok' ? 'bg-red-50/50' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="font-medium text-slate-800">{door.door_name}</div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateDoorStatus(door.id, 'ok')}
                        className={`p-2 rounded-lg flex items-center gap-1 transition-all ${door.status === 'ok' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'}`}
                      >
                        <CheckCircle size={20} /> <span className="text-sm font-bold">OK</span>
                      </button>
                      
                      <button 
                        onClick={() => updateDoorStatus(door.id, 'nok')}
                        className={`p-2 rounded-lg flex items-center gap-1 transition-all ${door.status === 'nok' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600'}`}
                      >
                        <XCircle size={20} /> <span className="text-sm font-bold">NOK</span>
                      </button>
                    </div>
                  </div>
                  
                  {(door.status === 'nok' || door.remarks) && (
                    <div className="mt-3">
                       <input 
                         type="text" 
                         placeholder="Wat is er mis?" 
                         className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                         value={door.remarks || ''}
                         onChange={e => updateDoorRemark(door.id, e.target.value)}
                       />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
               <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Algemene Uitvoering</h3>
            <p className="text-slate-500">Er is geen specifieke checklist voor dit dossier.</p>
          </div>
        )}

        {/* FOTO & OPMERKINGEN */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={20} /> Eindverslag & Foto's</h3>
             <AttachmentManager sla={sla} onUpdate={() => setUpdateTrigger(n => n + 1)} />
          </div>
          <textarea 
            className="w-full p-3 border border-slate-300 rounded-lg min-h-[120px]" 
            placeholder="Beschrijf wat je gedaan hebt..." 
            value={generalComments} 
            onChange={e => setGeneralComments(e.target.value)} 
          />
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-20">
         <div className="max-w-3xl mx-auto">
            <button 
              onClick={handleFinish}
              disabled={saving}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Interventie Afronden & Opslaan
            </button>
         </div>
      </div>
    </div>
  );
};