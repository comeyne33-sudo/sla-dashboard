import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { SLAList } from './components/dashboard/OverviewList';
import { SLAMap } from './components/dashboard/SLAMap';
import { SLAForm } from './components/dashboard/SLAForm';
import { Settings } from './pages/Settings';
import { Toast, ToastType } from './components/ui/Toast'; 
import { supabase } from './lib/supabase';
import type { SLA, UserRole, UserProfile } from './types/sla'; // UserProfile type toegevoegd
import { AlertTriangle, X } from 'lucide-react';

type View = 'home' | 'list' | 'map' | 'add' | 'settings';
export type ListFilterType = 'all' | 'critical' | 'planning' | 'done';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // <--- NIEUW: PROFIEL STATE

  const [currentView, setCurrentView] = useState<View>('home');
  const [slaData, setSlaData] = useState<SLA[]>([]);
  const [editingItem, setEditingItem] = useState<SLA | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [listFilter, setListFilter] = useState<ListFilterType>('all');
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const [showYearEndWarning, setShowYearEndWarning] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkRole(session);
      if (session) fetchProfile(session.user.id); // Haal profiel op
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkRole(session);
      if (session) fetchProfile(session.user.id);
    });

    const today = new Date();
    if (today.getMonth() === 11) {
      setShowYearEndWarning(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const checkRole = (session: Session | null) => {
    if (session?.user?.email === 'technieker@santens.be') {
      setUserRole('technician');
    } else {
      setUserRole('admin');
    }
  };

  // NIEUW: Haal profiel (naam) op uit DB
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setUserProfile(data as UserProfile);
  };

  useEffect(() => {
    if (session) fetchSLAs();
  }, [session]);

  const showToast = (msg: string, type: ToastType) => {
    setToast({ msg, type });
  };

  const logAction = async (action: string, details: string) => {
    if (!session?.user?.email) return;
    await supabase.from('audit_logs').insert([{
      user_email: session.user.email,
      action: action,
      details: details
    }]);
  };

  const fetchSLAs = async () => {
    const { data, error } = await supabase
      .from('slas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Fout:', error);
    else setSlaData(data as SLA[]);
  };

  // ... (fetchCoordinates, handleSaveSLA, handleDeleteSLA, handleYearReset blijven hetzelfde)
  const fetchCoordinates = async (address: string, city: string) => {
    try {
      const query = `${address}, ${city}, Belgium`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (error) { console.error(error); }
    return { lat: 50.8503 + (Math.random() - 0.5) * 0.02, lng: 4.3517 + (Math.random() - 0.5) * 0.02 };
  };

  const handleSaveSLA = async (formData: Omit<SLA, 'id' | 'status' | 'lat' | 'lng' | 'lastUpdate'>) => {
    try {
      const coords = await fetchCoordinates(formData.location, formData.city);
      const mapStatus = formData.isExecuted ? 'active' : 'warning';
      
      const dataToSave = {
        ...formData,
        lat: coords.lat,
        lng: coords.lng,
        status: mapStatus,
        lastUpdate: new Date().toLocaleDateString('nl-BE')
      };

      let error;
      if (editingItem) {
        const { error: updateError } = await supabase.from('slas').update(dataToSave).eq('id', editingItem.id);
        error = updateError;
        await logAction('UPDATE', `Dossier bijgewerkt: ${formData.clientName}`);
      } else {
        const { error: insertError } = await supabase.from('slas').insert([dataToSave]);
        error = insertError;
        await logAction('CREATE', `Nieuw dossier: ${formData.clientName}`);
      }

      if (error) throw error;

      showToast(editingItem ? 'Dossier succesvol bijgewerkt!' : 'Nieuw contract aangemaakt!', 'success');
      
      await fetchSLAs();
      setEditingItem(null);
      setCurrentView('list');
      setListFilter('all'); 
    
    } catch (error) {
      console.error(error);
      showToast('Er ging iets mis bij het opslaan.', 'error');
    }
  };

  const handleDeleteSLA = async (idToDelete: string) => {
    try {
      const item = slaData.find(s => s.id === idToDelete);
      const { error } = await supabase.from('slas').delete().eq('id', idToDelete);
      if (error) throw error;
      await logAction('DELETE', `Dossier verwijderd: ${item?.clientName || 'Onbekend'}`);
      showToast('Dossier verwijderd.', 'success');
      fetchSLAs();
    } catch (error) {
      showToast('Kon dossier niet verwijderen.', 'error');
    }
  };

  const handleYearReset = async () => {
    try {
      const { error } = await supabase
        .from('slas')
        .update({ isExecuted: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      await logAction('RESET', 'Jaarreset uitgevoerd');
      await fetchSLAs();
    } catch (error) {
      console.error(error);
      showToast('Fout bij resetten jaar.', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setSlaData([]);
    setUserRole('admin');
    setUserProfile(null); // Reset profiel
  };

  const startEditing = (item: SLA) => { setEditingItem(item); setCurrentView('add'); };
  const startNew = () => { setEditingItem(null); setCurrentView('add'); };

  const handleViewSLA = (id: string) => {
    setCurrentView('list');
    setListFilter('all');
  };

  const navigateToList = (filter: ListFilterType) => {
    setListFilter(filter);
    setCurrentView('list');
  };

  if (loading && !session) return <div className="min-h-screen flex items-center justify-center text-blue-600">Laden...</div>;
  if (!session) return <Login />;

  return (
    <Shell 
      onLogout={handleLogout} 
      onHome={() => setCurrentView('home')}
      onSettings={() => setCurrentView('settings')}
    >
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {showYearEndWarning && userRole === 'admin' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-l-8 border-amber-500">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 text-amber-600 font-bold text-xl">
                  <AlertTriangle size={28} />
                  <h2>Jaarwissel Opgelet!</h2>
                </div>
                <button onClick={() => setShowYearEndWarning(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="space-y-4 text-slate-600">
                <p>De jaarwisseling staat voor de deur.</p>
                <div className="bg-amber-50 p-3 rounded-lg text-sm border border-amber-100 text-amber-800">
                  Ga rechtsboven naar het <strong>tandwiel icoon</strong> en kies voor "Nieuw Dienstjaar Starten".
                </div>
              </div>
              <button onClick={() => setShowYearEndWarning(false)} className="mt-6 w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors">Begrepen</button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'home' && (
        <Dashboard 
          data={slaData} 
          onNavigate={(viewId) => { if (viewId === 'add') startNew(); else setCurrentView(viewId as View); }} 
          onNavigateToList={navigateToList}
          userRole={userRole}
          userProfile={userProfile} // <--- Geef profiel door aan Dashboard
        />
      )}
      
      {currentView === 'list' && (
        <SLAList 
          data={slaData} 
          onBack={() => setCurrentView('home')} 
          onDelete={handleDeleteSLA} 
          onEdit={startEditing}
          onRefresh={fetchSLAs}
          initialFilter={listFilter}
          userRole={userRole}
        />
      )}
      
      {currentView === 'map' && (
        <SLAMap data={slaData} onBack={() => setCurrentView('home')} onViewSLA={handleViewSLA} />
      )}
      
      {currentView === 'add' && (
        <SLAForm key={editingItem ? editingItem.id : 'new'} onBack={() => setCurrentView('home')} onSubmit={handleSaveSLA} initialData={editingItem} userRole={userRole} />
      )}
      
      {currentView === 'settings' && (
        <Settings 
          onBack={() => setCurrentView('home')} 
          onResetYear={handleYearReset}
          data={slaData}
          userRole={userRole}
          userProfile={userProfile} // <--- Geef profiel door aan Settings
          onProfileUpdate={() => session && fetchProfile(session.user.id)} // <--- Update functie
        />
      )}
    </Shell>
  );
}

export default App;