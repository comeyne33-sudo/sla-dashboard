import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Save, Loader2, MapPin, Hash, MessageSquare, PenTool, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SLA, DoorItem } from '../../types/sla';
import { AttachmentManager } from './AttachmentManager';
import { SignaturePad } from '../ui/SignaturePad';

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
  const [, setUpdateTrigger] = useState(0);

  // Sign Modal State
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);

  useEffect(() => { fetchDoors(); }, [sla.id]);

  const fetchDoors = async () => {
    const { data } = await supabase.from('sla_doors').select('*').eq('sla_id', sla.id).order('created_at', { ascending: true });
    if (data) setDoors(data as DoorItem[]);
    setLoading(false);
  };

  const updateDoorStatus = (id: string, status: 'ok' | 'nok') => setDoors(doors.map(d => d.id === id ? { ...d, status } : d));
  const updateDoorRemark = (id: string, text: string) => setDoors(doors.map(d => d.id === id ? { ...d, remarks: text } : d));

  const handlePreFinish = () => {
    if (doors.length > 0) {
      const pending = doors.filter(d => d.status === 'pending');
      if (pending.length > 0 && !confirm(`Er zijn nog ${pending.length} deuren niet gecontroleerd. Toch afronden?`)) return;
    }
    setShowSignModal(true);
  };

  const handleFinalSave = async () => {
    if (!signerName || !signatureBlob) {
      alert("Gelieve een naam in te vullen en af te tekenen.");
      return;
    }

    setSaving(true);
    try {
      // 1. Upload Handtekening
      const fileName = `${sla.id}_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, signatureBlob);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(fileName);

      // 2. Update Deuren
      if (doors.length > 0) await supabase.from('sla_doors').upsert(doors);

      // 3. Update SLA
      await supabase.from('slas').update({
        isExecuted: true,
        comments: generalComments,
        lastUpdate: new Date().toLocaleDateString('nl-BE'),
        signer_name: signerName,
        signature_url: publicUrl
      }).eq('id', sla.id);

      // 4. Genereer Werkbon (Simpele Print)
      generateWorkOrder(publicUrl);
      
      onFinish();
    } catch (error) {
      console.error(error);
      alert("Fout bij opslaan.");
      setSaving(false);
    }
  };

  const generateWorkOrder = (sigUrl: string) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const doorRows = doors.map(d => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${d.door_name}</td>
        <td style="padding: 8px; color: ${d.status === 'ok' ? 'green' : d.status === 'nok' ? 'red' : 'gray'}; font-weight: bold;">${d.status.toUpperCase()}</td>
        <td style="padding: 8px;">${d.remarks || ''}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head><title>Werkbon - ${sla.clientName}</title></head>
        <body style="font-family: sans-serif; padding: 40px; color: #333;">
          <h1 style="margin-bottom: 5px;">Werkbon Interventie</h1>
          <p style="color: #666; margin-top:0;">Ref: ${sla.vo_number || 'N/A'} - Datum: ${new Date().toLocaleDateString('nl-BE')}</p>
          
          <div style="margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <strong>Klant:</strong> ${sla.clientName}<br/>
            <strong>Locatie:</strong> ${sla.location}, ${sla.city}<br/>
            <strong>Contact:</strong> ${sla.contactName}
          </div>

          <h3>Uitgevoerde Controle (${sla.category})</h3>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="background: #eee;">
                <th style="padding: 8px;">Onderdeel / Deur</th>
                <th style="padding: 8px;">Status</th>
                <th style="padding: 8px;">Opmerking</th>
              </tr>
            </thead>
            <tbody>${doorRows.length > 0 ? doorRows : '<tr><td colspan="3" style="padding:10px;">Algemeen onderhoud uitgevoerd.</td></tr>'}</tbody>
          </table>

          <div style="margin-top: 20px;">
            <strong>Algemene Opmerkingen:</strong>
            <p style="background: #fff; border: 1px solid #eee; padding: 10px;">${generalComments || 'Geen opmerkingen'}</p>
          </div>

          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div>
              <p>Voor uitvoerder,</p>
              <p><strong>Santens Techniek</strong></p>
            </div>
            <div>
              <p>Voor akkoord,</p>
              <p><strong>${signerName}</strong></p>
              <img src="${sigUrl}" style="max-height: 80px; border: 1px solid #ddd;" />
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <div className="p-10 text-center">Laden...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20 relative">
      <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={24} className="text-slate-600" /></button>
          <div><h2 className="text-xl font-bold text-slate-900">{sla.clientName}</h2><div className="flex items-center gap-3 text-sm text-slate-500"><span className="flex items-center gap-1"><MapPin size={14} /> {sla.city}</span>{sla.vo_number && <span className="flex items-center gap-1 bg-slate-100 px-2 rounded"><Hash size={12} /> {sla.vo_number}</span>}</div></div>
        </div>
      </div>

      <div className="space-y-6 px-4">
        {doors.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100"><h3 className="font-bold text-blue-900">Deurlijst ({doors.filter(d => d.status !== 'pending').length}/{doors.length})</h3></div>
            <div className="divide-y divide-slate-100">
              {doors.map((door) => (
                <div key={door.id} className={`p-4 transition-colors ${door.status === 'ok' ? 'bg-green-50/50' : door.status === 'nok' ? 'bg-red-50/50' : ''}`}>
                  <div className="flex justify-between items-center gap-4">
                    <div className="font-medium text-slate-800">{door.door_name}</div>
                    <div className="flex gap-2">
                      <button onClick={() => updateDoorStatus(door.id, 'ok')} className={`p-2 rounded-lg flex items-center gap-1 transition-all ${door.status === 'ok' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}><CheckCircle size={20} /> OK</button>
                      <button onClick={() => updateDoorStatus(door.id, 'nok')} className={`p-2 rounded-lg flex items-center gap-1 transition-all ${door.status === 'nok' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}><XCircle size={20} /> NOK</button>
                    </div>
                  </div>
                  {(door.status === 'nok' || door.remarks) && (<div className="mt-3"><input type="text" placeholder="Wat is er mis?" className="w-full text-sm p-2 border border-slate-300 rounded-lg" value={door.remarks || ''} onChange={e => updateDoorRemark(door.id, e.target.value)} /></div>)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center"><CheckCircle size={32} className="mx-auto mb-4 text-blue-600" /><h3 className="text-lg font-bold text-slate-900">Algemene Uitvoering</h3><p className="text-slate-500">Geen checklist. Noteer bevindingen hieronder.</p></div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={20} /> Verslag & Foto's</h3>
             <AttachmentManager sla={sla} onUpdate={() => setUpdateTrigger(n => n + 1)} />
          </div>
          <textarea className="w-full p-3 border border-slate-300 rounded-lg min-h-[120px]" placeholder="Beschrijf wat je gedaan hebt..." value={generalComments} onChange={e => setGeneralComments(e.target.value)} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-20">
         <div className="max-w-3xl mx-auto"><button onClick={handlePreFinish} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={20} /> Naar Aftekenen</button></div>
      </div>

      {/* AFTEKEN MODAL */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><PenTool size={18} /> Werkbon Aftekenen</h3>
              <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Naam Contactpersoon</label>
                <input type="text" className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Naam klant..." value={signerName} onChange={e => setSignerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Handtekening</label>
                <SignaturePad onEnd={setSignatureBlob} />
              </div>
              <button onClick={handleFinalSave} disabled={saving} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm mt-4">
                {saving ? <Loader2 className="animate-spin" /> : <Printer size={20} />} Opslaan & Werkbon Printen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};