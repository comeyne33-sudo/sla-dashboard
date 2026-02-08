import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, MapPin, Hash, MessageSquare, PenTool, Printer, CheckCircle, XCircle, Cloud } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SLA, DoorItem } from '../../types/sla';
import { AttachmentManager } from './AttachmentManager';
import { SignaturePad } from '../ui/SignaturePad';
// NIEUW: Importeer de helper
import { generateAndPrintWorkOrder } from '../../lib/printWorkOrder';

interface ExecutionViewProps {
  sla: SLA;
  onBack: () => void;
  onFinish: () => void;
}

export const ExecutionView = ({ sla, onBack, onFinish }: ExecutionViewProps) => {
  const [doors, setDoors] = useState<DoorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executionReport, setExecutionReport] = useState(sla.execution_report || '');
  const [generalComments, setGeneralComments] = useState(sla.comments || '');
  const [, setUpdateTrigger] = useState(0);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (sla.category === 'Toegangscontrole') {
        fetchDoors();
    } else {
        setLoading(false);
    }
  }, [sla.id, sla.category]);

  const fetchDoors = async () => {
    const { data } = await supabase.from('sla_doors').select('*').eq('sla_id', sla.id).order('created_at', { ascending: true });
    if (data) setDoors(data as DoorItem[]);
    setLoading(false);
  };

  const toggleDoorCheck = (id: string, field: 'check_battery' | 'check_rights' | 'check_firmware') => {
    setDoors(doors.map(d => d.id === id ? { ...d, [field]: !d[field] } : d));
  };

  const updateDoorRemark = (id: string, text: string) => setDoors(doors.map(d => d.id === id ? { ...d, remarks: text } : d));

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      if (sla.category === 'Toegangscontrole' && doors.length > 0) {
        await supabase.from('sla_doors').upsert(doors);
      }
      await supabase.from('slas').update({
        comments: generalComments,
        execution_report: executionReport,
        lastUpdate: new Date().toLocaleDateString('nl-BE'),
      }).eq('id', sla.id);
      alert("Voortgang is opgeslagen.");
      onBack(); 
    } catch (error) { console.error(error); alert("Fout bij tussentijds opslaan."); } finally { setSaving(false); }
  };

  const handlePreFinish = () => {
    setShowSignModal(true);
  };

  const handleFinalSave = async () => {
    if (!signerName || !signatureBlob) { alert("Gelieve een naam en handtekening in te vullen."); return; }

    setSaving(true);
    try {
      const fileName = `${sla.id}_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, signatureBlob);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(fileName);

      if (sla.category === 'Toegangscontrole' && doors.length > 0) {
        await supabase.from('sla_doors').upsert(doors);
      }

      // We slaan nu de handtekening en naam op in het SLA object
      // zodat de print functie die kan gebruiken.
      const updatedSLA = {
        ...sla,
        isExecuted: true,
        comments: generalComments,
        execution_report: executionReport,
        lastUpdate: new Date().toLocaleDateString('nl-BE'),
        signer_name: signerName,
        signature_url: publicUrl
      };

      await supabase.from('slas').update({
        isExecuted: true,
        comments: generalComments,
        execution_report: executionReport,
        lastUpdate: new Date().toLocaleDateString('nl-BE'),
        signer_name: signerName,
        signature_url: publicUrl
      }).eq('id', sla.id);

      // Gebruik de nieuwe helper functie, geef het geüpdatete SLA object mee
      generateAndPrintWorkOrder(updatedSLA, doors);
      
      onFinish();
    } catch (error) { console.error(error); alert("Fout bij opslaan."); setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center">Laden...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={24} className="text-slate-600" /></button>
          <div><h2 className="text-xl font-bold text-slate-900">{sla.clientName}</h2><div className="flex items-center gap-3 text-sm text-slate-500"><span className="flex items-center gap-1"><MapPin size={14} /> {sla.city}</span><span className="font-semibold text-blue-600">{sla.category}</span></div></div>
        </div>
      </div>

      <div className="space-y-6 px-4">
        {sla.category === 'Toegangscontrole' ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center"><h3 className="font-bold text-slate-800">Deurlijst Controle</h3><span className="text-xs bg-white border px-2 py-1 rounded-full text-slate-500">{doors.length} deuren</span></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr><th className="p-3 w-1/3">Deur / Zone</th><th className="p-3 text-center">Batt.</th><th className="p-3 text-center">Rechten</th><th className="p-3 text-center">FW</th><th className="p-3">Opmerking</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doors.map(door => (
                                <tr key={door.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3"><div className="font-medium text-slate-900">{door.door_name}</div><div className="text-xs text-slate-500">{door.zone}</div></td>
                                    <td className="p-3 text-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={door.check_battery || false} onChange={() => toggleDoorCheck(door.id, 'check_battery')} /></td>
                                    <td className="p-3 text-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={door.check_rights || false} onChange={() => toggleDoorCheck(door.id, 'check_rights')} /></td>
                                    <td className="p-3 text-center"><input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={door.check_firmware || false} onChange={() => toggleDoorCheck(door.id, 'check_firmware')} /></td>
                                    <td className="p-3"><input type="text" className="w-full p-1.5 border border-slate-200 rounded text-xs focus:border-blue-300 outline-none" placeholder="..." value={door.remarks || ''} onChange={e => updateDoorRemark(door.id, e.target.value)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><PenTool size={20} className="text-blue-600" /> Uitgevoerde Werken</h3>
                <p className="text-sm text-slate-500">Beschrijf hieronder gedetailleerd welke werkzaamheden zijn uitgevoerd.</p>
                <textarea className="w-full p-4 border border-slate-300 rounded-lg min-h-[200px] text-slate-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="- Motor afgeregeld&#10;- Sensoren gereinigd&#10;- Testcyclus OK..." value={executionReport} onChange={e => setExecutionReport(e.target.value)} />
            </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={20} className="text-orange-500" /> Interne Opmerkingen & Foto's</h3><AttachmentManager sla={sla} onUpdate={() => setUpdateTrigger(n => n + 1)} /></div>
          <textarea className="w-full p-3 border border-slate-300 rounded-lg min-h-[80px] text-sm" placeholder="Opmerkingen voor intern gebruik..." value={generalComments} onChange={e => setGeneralComments(e.target.value)} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-20 flex flex-col sm:flex-row gap-3 justify-center max-w-4xl mx-auto">
         <button onClick={handleSaveProgress} disabled={saving} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-2 transition-colors">
            {saving ? <Loader2 className="animate-spin" /> : <Cloud size={20} />} Tussentijds Opslaan
         </button>
         <button onClick={handlePreFinish} disabled={saving} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
            <Save size={20} /> Naar Aftekenen
         </button>
      </div>

      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><PenTool size={18} /> Werkbon Aftekenen</h3><button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Naam Contactpersoon</label><input type="text" className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Naam klant..." value={signerName} onChange={e => setSignerName(e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Handtekening</label><SignaturePad onEnd={setSignatureBlob} /></div>
              <button onClick={handleFinalSave} disabled={saving} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm mt-4">{saving ? <Loader2 className="animate-spin" /> : <Printer size={20} />} Opslaan & Printen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};