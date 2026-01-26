import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js'; // <--- HIER HEB IK 'type' TOEGEVOEGD
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { SLAList } from './components/dashboard/SLAList';
import { SLAMap } from './components/dashboard/SLAMap';
import { SLAForm } from './components/dashboard/SLAForm';
import { supabase } from './lib/supabase';
import type { SLA } from './types/sla';
import { LogOut } from 'lucide-react';

type View = 'home' | 'list' | 'map' | 'add' | 'manage';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [slaData, setSlaData] = useState<SLA[]>([]);
  const [editingItem, setEditingItem] = useState<SLA | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. AUTHENTICATIE CHECK
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

  // 2. DATA OPHALEN
  useEffect(() => {
    if (session) {
      fetchSLAs();
    }
  }, [session]);

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

  const handleSaveSLA = async (formData: Omit<SLA, 'id' | 'status' | 'lat' | 'lng'>) => {
    const coords = await fetchCoordinates(formData.location, formData.city);
    const mapStatus = formData.isExecuted ? 'active' : 'warning';
    
    const dataToSave = {
      ...formData,
      lat: coords.lat,
      lng: coords.lng,
      status: mapStatus,
      lastUpdate: new Date().toLocaleDateString('nl-BE')
    };

    if (editingItem) {
      await supabase.from('slas').update(dataToSave).eq('id', editingItem.id);
    } else {
      await supabase.from('slas').insert([dataToSave]);
    }
    await fetchSLAs();
    setEditingItem(null);
    setCurrentView('list');
  };

  const handleDeleteSLA = async (idToDelete: string) => {
    await supabase.from('slas').delete().eq('id', idToDelete);
    fetchSLAs();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setSlaData([]);
  };

  const startEditing = (item: SLA) => { setEditingItem(item); setCurrentView('add'); };
  const startNew = () => { setEditingItem(null); setCurrentView('add'); };

  // --- RENDERING ---

  if (loading && !session) {
    return <div className="min-h-screen flex items-center justify-center text-blue-600">Laden...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Shell>
       <div className="absolute top-4 right-4 z-50">
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
          <LogOut size={14} /> Uitloggen
        </button>
      </div>

      {currentView === 'home' && <Dashboard data={slaData} onNavigate={(viewId) => { if (viewId === 'add') startNew(); else setCurrentView(viewId as View); }} />}
      {currentView === 'list' && <SLAList data={slaData} onBack={() => setCurrentView('home')} onDelete={handleDeleteSLA} onEdit={startEditing} />}
      {currentView === 'map' && <SLAMap data={slaData} onBack={() => setCurrentView('home')} />}
      {currentView === 'add' && <SLAForm key={editingItem ? editingItem.id : 'new'} onBack={() => setCurrentView('home')} onSubmit={handleSaveSLA} initialData={editingItem} />}
      {currentView === 'manage' && <div className="p-8 text-center bg-white rounded-xl border">Beheer functionaliteit volgt. <button onClick={() => setCurrentView('home')} className="text-blue-600 underline">Terug</button></div>}
    </Shell>
  );
}

export default App;