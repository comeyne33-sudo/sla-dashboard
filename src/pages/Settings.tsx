import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, CheckCircle, Download, Lock, Save, Activity, User, Archive, CheckSquare, Hash, Trash2, Calculator } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SLA, UserRole, AuditLog, UserProfile } from '../types/sla';

interface SettingsProps {
  onBack: () => void;
  onResetYear: () => Promise<void>;
  data: SLA[];
  userRole: UserRole;
  userProfile: UserProfile | null;
  onProfileUpdate: () => void;
}

export const Settings = ({ onBack, onResetYear, data, userRole, userProfile, onProfileUpdate }: SettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Wachtwoord state
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  // Profiel state
  const [displayName, setDisplayName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // NACALCULATIE STATE (NIEUW)
  const [selectedSLAId, setSelectedSLAId] = useState<string>('');
  const [actualHours, setActualHours] = useState<string>('');
  const [calcResult, setCalcResult] = useState<{status: string, text: string, color: string} | null>(null);
  
  // Lijsten filteren voor nacalculatie
  // 1. Te doen: Wel uitgevoerd, nog geen nacalculatie
  const pendingCalculations = data.filter(s => s.isExecuted && !s.calculation_done);
  // 2. Klaar: Wel uitgevoerd EN wel nacalculatie
  const completedCalculations = data.filter(s => s.isExecuted && s.calculation_done);

  useEffect(() => {
    if (userProfile?.display_name) {
      setDisplayName(userProfile.display_name);
    }
    if (userRole === 'admin') {
      fetchLogs();
    }
  }, [userRole, userProfile, data]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setAuditLogs(data as AuditLog[]);
  };

  // --- NACALCULATIE LOGICA (NIEUW) ---
  const calculateDifference = (planned: number, actual: number) => {
    // Logica: 
    // Minder uren = Winst
    // Max 10% meer = Correct
    // Meer dan 10% meer = Verlies
    
    if (actual < planned) {
      return { status: 'profit', text: 'Winstgevender dan gedacht', color: 'text-green-700 bg-green-50 border-green-200' };
    } else if (actual <= planned * 1.10) { 
      return { status: 'correct', text: 'Correct uitgerekend', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    } else {
      return { status: 'loss', text: 'Te weinig uren voorzien in SLA', color: 'text-red-700 bg-red-50 border-red-200' };
    }
  };

  // Update resultaat als input verandert
  useEffect(() => {
    if (selectedSLAId && actualHours) {
      const sla = data.find(s => s.id === selectedSLAId);
      // We gebruiken || 0 om errors te voorkomen als hoursRequired undefined is
      const planned = sla?.hoursRequired || 0;
      
      if (planned > 0) {
        const result = calculateDifference(planned, parseFloat(actualHours));
        setCalcResult(result);
      }
    } else {
      setCalcResult(null);
    }
  }, [selectedSLAId, actualHours, data]);

  const saveCalculation = async () => {
    if (!selectedSLAId || !calcResult) return;
    
    const { error } = await supabase.from('slas').update({
      calculation_done: true,
      actual_hours: parseFloat(actualHours),
      calculation_result: calcResult.status,
      calculation_note: calcResult.text
    }).eq('id', selectedSLAId);

    if (!error) {
      onProfileUpdate(); // Data verversen
      setSelectedSLAId(''); // Formulier resetten
      setActualHours('');
      alert('Nacalculatie succesvol opgeslagen!');
    } else {
      alert('Fout bij opslaan nacalculatie.');
    }
  };

  const deleteCalculation = async (id: string) => {
    if(!confirm("Ben je zeker? Dit verwijdert de nacalculatie en zet het dossier terug op 'te berekenen'.")) return;
    
    const { error } = await supabase.from('slas').update({
      calculation_done: false,
      actual_hours: null,
      calculation_result: null,
      calculation_note: null
    }).eq('id', id);

    if(!error) onProfileUpdate();
  };

  // --- BESTAANDE HANDLERS ---

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          email: user.email, 
          display_name: displayName 
        });
      
      if (!error) {
        onProfileUpdate();
        alert('Naam opgeslagen!');
      } else {
        console.error(error);
        alert('Fout bij opslaan naam.');
      }
    }
    setProfileSaving(false);
  };

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

  const handleExport = () => {
    // Aangepaste export met nieuwe velden
    const headers = ['Categorie', 'Klant', 'Stad', 'Gepland (u)', 'Gepresteerd (u)', 'Resultaat', 'Status'];
    
    const csvContent = [
      headers.join(';'), 
      ...data.map(item => [
        item.category,
        `"${item.clientName}"`,
        `"${item.city}"`,
        item.hoursRequired,
        item.actual_hours || '', // Nieuw veld
        item.calculation_note || '', // Nieuw veld
        item.isExecuted ? 'Uitgevoerd' : 'Open'
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SLA_Export_${new Date().toLocaleDateString('nl-BE').replace(/\//g, '-')}.csv`);
    link.click();
  };

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
        <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Terug naar Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Instellingen & Beheer</h2>
      </div>

      {/* MIJN PROFIEL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User size={20} className="text-blue-600" /> Mijn Profiel
          </h3>
        </div>
        <div className="p-6 bg-slate-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Weergavenaam</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="bv. Jan Peeters" 
                className="flex-1 p-2 border border-slate-300 rounded-lg" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
              />
              <button 
                onClick={handleSaveProfile} 
                disabled={profileSaving}
                className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50"
              >
                {profileSaving ? '...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TECHNIEKER MELDING */}
      {userRole === 'technician' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center text-blue-800">
          <p>Je bent ingelogd als <strong>Technieker</strong>.</p>
          <p>Je hebt geen toegang tot geavanceerde instellingen of exports.</p>
        </div>
      )}

      {/* ADMIN SECTIES */}
      {userRole === 'admin' && (
        <>
          {/* --- NIEUW: NACALCULATIE MODULE --- */}
          <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-indigo-100 bg-indigo-50">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <Calculator size={20} /> Nacalculatie Tool
              </h3>
              <p className="text-sm text-indigo-600 mt-1">
                Vergelijk geplande uren met werkelijke uren voor uitgevoerde SLA's.
              </p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LINKER KOLOM: NIEUWE BEREKENING */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 border-b pb-2">Nieuwe berekening invoeren</h4>
                
                {pendingCalculations.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-100 text-slate-500 text-sm">
                    <CheckSquare size={24} className="mx-auto mb-2 text-slate-300" />
                    <p>Alles is bijgewerkt!</p>
                    <p>Geen openstaande dossiers.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Selecteer Dossier</label>
                      <select 
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-white" 
                        value={selectedSLAId} 
                        onChange={e => { setSelectedSLAId(e.target.value); setActualHours(''); setCalcResult(null); }}
                      >
                        <option value="">-- Kies een werf --</option>
                        {pendingCalculations.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.clientName} ({s.city}) - Plan: {s.hoursRequired}u
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedSLAId && (
                      <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Effectief gepresteerde uren</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.5" 
                              className="w-full p-2 border border-slate-300 rounded-lg pr-10" 
                              value={actualHours} 
                              onChange={e => setActualHours(e.target.value)} 
                              placeholder="bv. 4.5" 
                            />
                            <span className="absolute right-3 top-2 text-slate-400 text-sm">uur</span>
                          </div>
                        </div>
                        
                        {calcResult && (
                          <div className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 border ${calcResult.color}`}>
                            <Activity size={18} /> 
                            <span>{calcResult.text}</span>
                          </div>
                        )}

                        <button 
                          onClick={saveCalculation} 
                          disabled={!actualHours} 
                          className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Save size={18} /> Opslaan & Afronden
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RECHTER KOLOM: HISTORIEK */}
              <div className="border-l border-slate-100 pl-0 md:pl-8">
                <h4 className="font-semibold text-slate-900 mb-4 border-b pb-2 flex justify-between items-center">
                  <span>Historiek ({completedCalculations.length})</span>
                </h4>
                
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {completedCalculations.length === 0 && (
                    <p className="text-slate-400 text-sm italic">Nog geen nacalculaties uitgevoerd.</p>
                  )}

                  {completedCalculations.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm group hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 truncate pr-2">{item.clientName}</span>
                        <button 
                          onClick={() => deleteCalculation(item.id)} 
                          className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          title="Verwijder berekening"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-2">
                        <div>Plan: <span className="font-medium">{item.hoursRequired}u</span></div>
                        <div>Echt: <span className="font-medium">{item.actual_hours}u</span></div>
                      </div>

                      <div className={`text-xs font-bold px-2 py-1 rounded inline-block w-full text-center ${
                        item.calculation_result === 'profit' ? 'bg-green-100 text-green-700' : 
                        item.calculation_result === 'loss' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.calculation_note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* EXPORT */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Download size={20} className="text-blue-600" /> Data Backup & Export
              </h3>
            </div>
            <div className="p-6 bg-slate-50">
              <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 shadow-sm">
                <Download size={18} /> Downloaden als CSV (Excel)
              </button>
            </div>
          </div>

          {/* AUDIT LOGS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity size={20} className="text-blue-600" /> Audit Logboek (Laatste 50)
              </h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Datum</th>
                    <th className="px-6 py-3">Gebruiker</th>
                    <th className="px-6 py-3">Actie</th>
                    <th className="px-6 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-500">{new Date(log.created_at).toLocaleString('nl-BE')}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">{log.user_email}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                          log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                          log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>{log.action}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* WACHTWOORD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" /> Wachtwoord Wijzigen
          </h3>
        </div>
        <form onSubmit={handleChangePassword} className="p-6 bg-slate-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nieuw Wachtwoord</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="Minimaal 6 tekens" 
                className="flex-1 p-2 border border-slate-300 rounded-lg" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
              />
              <button 
                type="submit" 
                disabled={pwLoading || !newPassword} 
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
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

      {/* GEVARENZONE (JAAR RESET) */}
      {userRole === 'admin' && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-red-50">
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
              <RefreshCw size={20} /> Gevarenzone: Nieuw Dienstjaar
            </h3>
          </div>
          <div className="p-6 bg-white space-y-4">
            <div className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
              <AlertTriangle size={20} className="shrink-0 mt-0.5 text-orange-500" />
              <p>Hiermee worden <strong>alle dossiers</strong> gereset naar de status <strong>"Niet Uitgevoerd"</strong>.</p>
            </div>
            <button 
              onClick={handleResetClick} 
              disabled={loading} 
              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-sm"
            >
              {loading ? 'Bezig met resetten...' : 'Start Nieuw Jaar (Reset alles)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};