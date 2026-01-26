import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { SLAList } from './components/dashboard/OverviewList';
import { SLAMap } from './components/dashboard/SLAMap';
import { SLAForm } from './components/dashboard/SLAForm';
import { Toast, ToastType } from './components/ui/Toast'; // <--- NIEUWE IMPORT
import { supabase } from './lib/supabase';
import type { SLA } from './types/sla';

type View = 'home' | 'list' | 'map' | 'add' | 'manage';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [slaData, setSlaData] = useState<SLA[]>([]);
  const [editingItem, setEditingItem] = useState<SLA | null>(null);
  const [loading, setLoading] = useState(true);

  // NIEUWE STATE VOOR TOAST
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchSLAs();
  }, [session]);

  const showToast = (msg: string, type: ToastType) => {
    setToast({ msg, type });
  };

  const fetchSLAs = async () => {
    const { data, error } = await supabase
      .from('slas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Fout:', error);
    else setSlaData(data as SLA[]);
  };

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
      } else {
        const { error: insertError } = await supabase.from('slas').insert([dataToSave]);
        error = insertError;
      }

      if (error) throw error;

      // SUCCES MELDING
      showToast(editingItem ? 'Dossier succesvol bijgewerkt!' : 'Nieuw contract aangemaakt!', 'success');
      
      await fetchSLAs();
      setEditingItem(null);
      setCurrentView('list');
    
    } catch (error) {
      console.error(error);
      // FOUT MELDING
      showToast('Er ging iets mis bij het opslaan.', 'error');
    }
  };

  const handleDeleteSLA = async (idToDelete: string) => {
    try {
      const { error } = await supabase.from('slas').delete().eq('id', idToDelete);
      if (error) throw error;
      
      showToast('Dossier verwijderd.', 'success');
      fetchSLAs();
    } catch (error) {
      showToast('Kon dossier niet verwijderen.', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setSlaData([]);
  };

  const startEditing = (item: SLA) => { setEditingItem(item); setCurrentView('add'); };
  const startNew = () => { setEditingItem(null); setCurrentView('add'); };

  const handleViewSLA = (id: string) => {
    // Hier zouden we logic kunnen toevoegen om te filteren op ID, voor nu gaan we naar lijst
    setCurrentView('list');
  };

  if (loading && !session) return <div className="min-h-screen flex items-center justify-center text-blue-600">Laden...</div>;
  if (!session) return <Login />;

  return (
    <Shell onLogout={handleLogout}>
      {/* TOAST WEERGEVEN INDIEN AANWEZIG */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {currentView === 'home' && (
        <Dashboard data={slaData} onNavigate={(viewId) => { if (viewId === 'add') startNew(); else setCurrentView(viewId as View); }} />
      )}
      {currentView === 'list' && (
        <SLAList data={slaData} onBack={() => setCurrentView('home')} onDelete={handleDeleteSLA} onEdit={startEditing} />
      )}
      {currentView === 'map' && (
        <SLAMap data={slaData} onBack={() => setCurrentView('home')} onViewSLA={handleViewSLA} />
      )}
      {currentView === 'add' && (
        <SLAForm key={editingItem ? editingItem.id : 'new'} onBack={() => setCurrentView('home')} onSubmit={handleSaveSLA} initialData={editingItem} />
      )}
      {currentView === 'manage' && (
        <div className="p-8 text-center bg-white rounded-xl border">
          Beheer functionaliteit volgt. 
          <button onClick={() => setCurrentView('home')} className="text-blue-600 underline ml-2">Terug</button>
        </div>
      )}
    </Shell>
  );
}

export default App;