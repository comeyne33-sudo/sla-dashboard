import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, CheckCircle, Download, Lock, Save, Activity, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SLA, UserRole, AuditLog, UserProfile } from '../types/sla';

interface SettingsProps {
  onBack: () => void;
  onResetYear: () => Promise<void>;
  data: SLA[];
  userRole: UserRole;
  userProfile: UserProfile | null; // <--- NIEUW: Huidig profiel
  onProfileUpdate: () => void;     // <--- NIEUW: Trigger om App te updaten
}

export const Settings = ({ onBack, onResetYear, data, userRole, userProfile, onProfileUpdate }: SettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Wachtwoord state
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  // Profiel state (Naam)
  const [displayName, setDisplayName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    // Vul naam in als die er al is
    if (userProfile?.display_name) {
      setDisplayName(userProfile.display_name);
    }
    
    if (userRole === 'admin') {
      fetchLogs();
    }
  }, [userRole, userProfile]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setAuditLogs(data as AuditLog[]);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Upsert: Maak aan als niet bestaat, anders update
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          email: user.email, 
          display_name: displayName 
        });
      
      if (!error) {
        onProfileUpdate(); // Vertel App.tsx dat er een nieuwe naam is
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
    const headers = ['Categorie', 'Klant', 'Stad', 'Adres', 'Type/Details', 'Status', 'Prijs', 'Maand', 'Uitgevoerd?'];
    const csvContent = [
      headers.join(';'), 
      ...data.map(item => [
        item.category, // <--- NIEUW: Categorie in export
        `"${item.clientName}"`,
        `"${item.city}"`,
        `"${item.location}"`,
        item.category === 'Salto' ? item.type : item.renson_height, // <--- Dynamisch veld
        item.status,
        item.price,
        item.plannedMonth,
        item.isExecuted ? 'JA' : 'NEE'
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
    if (error) setPwMessage('Fout: ' + error.message);
    else {
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
        <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Terug naar Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Instellingen & Beheer</h2>
      </div>

      {/* BLOK 1: MIJN PROFIEL (NIEUW) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User size={20} className="text-blue-600" /> Mijn Profiel
          </h3>
          <p className="text-slate-500 mt-1 text-sm">Stel hier je naam in voor de begroeting.</p>
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

      {/* ALS TECHNIEKER: MELDING */}
      {userRole === 'technician' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center text-blue-800">
          <p>Je bent ingelogd als <strong>Technieker</strong>.</p>
          <p>Je hebt geen toegang tot geavanceerde instellingen of exports.</p>
        </div>
      )}

      {/* ADMIN SECTIES */}
      {userRole === 'admin' && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Download size={20} className="text-blue-600" /> Data Backup & Export</h3>
            </div>
            <div className="p-6 bg-slate-50">
              <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 shadow-sm">
                <Download size={18} /> Downloaden als CSV (Excel)
              </button>
            </div>
          </div>

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

      {/* WACHTWOORD WIJZIGEN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Lock size={20} className="text-blue-600" /> Wachtwoord Wijzigen</h3>
        </div>
        <form onSubmit={handleChangePassword} className="p-6 bg-slate-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nieuw Wachtwoord</label>
            <div className="flex gap-2">
              <input type="password" placeholder="Minimaal 6 tekens" className="flex-1 p-2 border border-slate-300 rounded-lg" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <button type="submit" disabled={pwLoading || !newPassword} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">Opslaan</button>
            </div>
          </div>
          {pwMessage && <div className={`text-sm p-3 rounded-lg ${pwMessage.includes('Succes') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{pwMessage}</div>}
        </form>
      </div>

      {/* GEVARENZONE */}
      {userRole === 'admin' && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-red-50">
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2"><RefreshCw size={20} /> Gevarenzone: Nieuw Dienstjaar</h3>
          </div>
          <div className="p-6 bg-white space-y-4">
            <div className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
              <AlertTriangle size={20} className="shrink-0 mt-0.5 text-orange-500" />
              <p>Hiermee worden <strong>alle dossiers</strong> gereset naar de status <strong>"Niet Uitgevoerd"</strong>. <br/> Doe dit alleen bij de start van een nieuw dienstjaar.</p>
            </div>
            <button onClick={handleResetClick} disabled={loading} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-sm">
              {loading ? 'Bezig met resetten...' : 'Start Nieuw Jaar (Reset alles)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};