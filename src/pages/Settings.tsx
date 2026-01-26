import { useState } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
  onResetYear: () => Promise<void>;
}

export const Settings = ({ onBack, onResetYear }: SettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetClick = async () => {
    // Dubbele bevestiging voor veiligheid
    if (confirm("⚠️ LET OP: Weet je het zeker?\n\nHiermee zet je ALLE contracten terug op 'Niet Uitgevoerd'.\nDoe dit alleen aan het begin van het nieuwe jaar!")) {
      if (confirm("Echt zeker? Dit kan niet ongedaan worden gemaakt.")) {
        setLoading(true);
        await onResetYear();
        setLoading(false);
        setSuccess(true);
      }
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-green-800">Jaarreset Voltooid!</h2>
        <p className="text-slate-600">Alle dossiers staan weer open voor het nieuwe dienstjaar.</p>
        <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Terug naar Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Instellingen & Beheer</h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw size={20} className="text-blue-600" />
            Nieuw Dienstjaar Starten
          </h3>
          <p className="text-slate-500 mt-1">
            Gebruik deze functie enkel aan het begin van het nieuwe jaar (bijv. 1 januari).
          </p>
        </div>
        
        <div className="p-6 bg-slate-50 space-y-4">
          <div className="flex gap-4 items-start p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <p>
              <strong>Wat doet dit?</strong><br/>
              Alle dossiers worden gereset naar de status <strong>"Niet Uitgevoerd"</strong>. 
              De contracten zelf, locaties en historiek blijven bestaan. Je kunt dan opnieuw beginnen met afvinken voor het nieuwe jaar.
            </p>
          </div>

          <button 
            onClick={handleResetClick}
            disabled={loading}
            className="w-full py-3 bg-white border-2 border-red-500 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Bezig met resetten...' : 'Start Nieuw Jaar (Reset alles)'}
          </button>
        </div>
      </div>
    </div>
  );
};