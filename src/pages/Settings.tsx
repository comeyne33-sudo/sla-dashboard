import { useState } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, CheckCircle, Download, Lock, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SLA } from '../types/sla';

interface SettingsProps {
  onBack: () => void;
  onResetYear: () => Promise<void>;
  data: SLA[]; // <--- NIEUWE PROP: We hebben de data nodig voor de export
}

export const Settings = ({ onBack, onResetYear, data }: SettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // State voor wachtwoord wijzigen
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  // 1. JAAR RESET FUNCTIE
  const handleResetClick = async () => {
    if (confirm("⚠️ LET OP: Weet je het zeker?\n\nHiermee zet je ALLE contracten terug op 'Niet Uitgevoerd'.\nDoe dit alleen aan het begin van het nieuwe jaar!")) {
      if (confirm("Echt zeker? Dit kan niet ongedaan worden gemaakt.")) {
        setLoading(true);
        await onResetYear();
        setLoading(false);
        setResetSuccess(true);
      }
    }
  };

  // 2. EXPORT FUNCTIE (Naar CSV)
  const handleExport = () => {
    // Koppen van de CSV
    const headers = ['Klant', 'Stad', 'Adres', 'Type', 'Status', 'Prijs', 'Maand', 'Uitgevoerd?'];
    
    // Data omzetten naar CSV formaat
    const csvContent = [
      headers.join(';'), // Excel in België gebruikt vaak puntkomma
      ...data.map(item => [
        `"${item.clientName}"`,
        `"${item.city}"`,
        `"${item.location}"`,
        item.type,
        item.status,
        item.price,
        item.plannedMonth,
        item.isExecuted ? 'JA' : 'NEE'
      ].join(';'))
    ].join('\n');

    // Bestand downloaden
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SLA_Export_${new Date().toLocaleDateString('nl-BE').replace(/\//g, '-')}.csv`);
    link.click();
  };

  // 3. WACHTWOORD WIJZIGEN FUNCTIE
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPwMessage('Wachtwoord moet minstens 6 tekens zijn.');
      return;
    }
    
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);

    if (error) {
      setPwMessage('Fout: ' + error.message);
    } else {
      setPwMessage('Succes! Je wachtwoord is gewijzigd.');
      setNewPassword('');
    }
  };

  if (resetSuccess) {
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
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Instellingen & Beheer</h2>
      </div>

      {/* BLOK 1: DATA EXPORT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Download size={20} className="text-blue-600" />
            Data Backup & Export
          </h3>
          <p className="text-slate-500 mt-1 text-sm">
            Download een lijst van al je {data.length} dossiers voor Excel of administratie.
          </p>
        </div>
        <div className="p-6 bg-slate-50">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all shadow-sm w-full sm:w-auto"
          >
            <Download size={18} />
            Downloaden als CSV (Excel)
          </button>
        </div>
      </div>

      {/* BLOK 2: ACCOUNT BEVEILIGING */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            Wachtwoord Wijzigen
          </h3>
          <p className="text-slate-500 mt-1 text-sm">
            Stel hier een nieuw wachtwoord in voor je account.
          </p>
        </div>
        <form onSubmit={handleChangePassword} className="p-6 bg-slate-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nieuw Wachtwoord</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="Minimaal 6 tekens"
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={pwLoading || !newPassword}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {pwLoading ? '...' : <Save size={18} />}
                Opslaan
              </button>
            </div>
          </div>
          {pwMessage && (
            <div className={`text-sm p-3 rounded-lg ${pwMessage.includes('Succes') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {pwMessage}
            </div>
          )}
        </form>
      </div>

      {/* BLOK 3: GEVARENZONE (JAAR RESET) */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-red-50">
          <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <RefreshCw size={20} />
            Gevarenzone: Nieuw Dienstjaar
          </h3>
          <p className="text-red-600 mt-1 text-sm">
            Gebruik dit alleen op 1 januari.
          </p>
        </div>
        
        <div className="p-6 bg-white space-y-4">
          <div className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
            <AlertTriangle size={20} className="shrink-0 mt-0.5 text-orange-500" />
            <p>
              Hiermee worden <strong>alle {data.length} dossiers</strong> gereset naar de status <strong>"Niet Uitgevoerd"</strong>.
              Dit is nodig om het nieuwe jaar te starten. De historie wordt niet gewist, enkel de vinkjes worden uitgezet.
            </p>
          </div>

          <button 
            onClick={handleResetClick}
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            {loading ? 'Bezig met resetten...' : 'Start Nieuw Jaar (Reset alles)'}
          </button>
        </div>
      </div>
    </div>
  );
};