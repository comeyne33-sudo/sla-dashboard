import { useState, useRef } from 'react';
import { Paperclip, X, FileText, Image as ImageIcon, Loader2, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SLA, Attachment } from '../../types/sla';

interface AttachmentManagerProps {
  sla: SLA;
  onUpdate: () => void;
}

export const AttachmentManager = ({ sla, onUpdate }: AttachmentManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachments = sla.attachments || [];
  const hasAttachments = attachments.length > 0;

  // UPLOAD FUNCTIE
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    const newAttachments: Attachment[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('sla-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('sla-files')
          .getPublicUrl(fileName);

        newAttachments.push({
          name: file.name,
          url: publicUrl,
          type: file.type.startsWith('image/') ? 'image' : 'file'
        });
      } catch (error) {
        console.error('Upload error:', error);
        alert('Fout bij uploaden van ' + file.name);
      }
    }

    // Update de database
    const updatedAttachments = [...attachments, ...newAttachments];
    await supabase.from('slas').update({ attachments: updatedAttachments }).eq('id', sla.id);
    
    setUploading(false);
    onUpdate(); // Ververs de hoofdlijst
    
    // Als we van 0 naar 1+ bestanden gaan, openen we de modal zodat de gebruiker het resultaat ziet
    if (!hasAttachments && newAttachments.length > 0) {
      setShowModal(true);
    }
    
    // Reset de input zodat je hetzelfde bestand nog eens kunt kiezen indien nodig
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // DELETE FUNCTIE
  const handleDelete = async (urlToDelete: string) => {
    if (!confirm('Dit bestand definitief verwijderen?')) return;

    const updatedAttachments = attachments.filter(a => a.url !== urlToDelete);
    await supabase.from('slas').update({ attachments: updatedAttachments }).eq('id', sla.id);
    
    onUpdate();
    
    // Als er niets meer overblijft, sluit de modal automatisch
    if (updatedAttachments.length === 0) setShowModal(false);
  };

  // KLIK LOGICA (De kern van je vraag)
  const handleMainClick = () => {
    if (hasAttachments) {
      // Wel bestanden? Open de popup
      setShowModal(true);
    } else {
      // Geen bestanden? Open direct de verkenner
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      {/* DE TRIGGER KNOP */}
      <div className="relative inline-block">
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
        />
        
        <button 
          onClick={handleMainClick}
          disabled={uploading}
          className={`
            p-2 rounded-full border transition-all flex items-center justify-center relative
            ${hasAttachments 
              ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
          `}
          title={hasAttachments ? "Bekijk documenten" : "Documenten toevoegen"}
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
          
          {/* Teller badge */}
          {hasAttachments && !uploading && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white shadow-sm border border-white">
              {attachments.length}
            </span>
          )}
        </button>
      </div>

      {/* DE MODAL / POPUP */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Paperclip size={18} className="text-blue-600" /> 
                Documenten ({attachments.length})
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Lijst */}
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-blue-300 transition-all shadow-sm">
                  
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                       {file.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700">{file.name}</p>
                      <p className="text-xs text-slate-400">Klik om te openen</p>
                    </div>
                  </a>

                  <button 
                    onClick={() => handleDelete(file.url)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                    title="Verwijderen"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer met 'Toevoegen' knop */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm active:scale-[0.98]"
               >
                 {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                 Extra bestand toevoegen
               </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};