import { useState } from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { SLAList } from './components/dashboard/SLAList';
import { SLAMap } from './components/dashboard/SLAMap';
import { SLAForm } from './components/dashboard/SLAForm';
import { mockSLAs } from './data/mockSLAs';
import type { SLA } from './types/sla';

type View = 'home' | 'list' | 'map' | 'add' | 'manage';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [slaData, setSlaData] = useState<SLA[]>(mockSLAs);
  const [editingItem, setEditingItem] = useState<SLA | null>(null);
  
  // HIER IS DE MAGIE: Functie om elk adres ter wereld op te zoeken
  const fetchCoordinates = async (address: string, city: string) => {
    try {
      // We vragen het aan OpenStreetMap (Nominatim)
      const query = `${address}, ${city}, Belgium`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        // GEVONDEN! We geven de coördinaten terug
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error("Kon locatie niet vinden:", error);
    }

    // FALLBACK: Als we het echt niet vinden, nemen we Brussel + een klein beetje random
    // zodat pinnen niet exact op elkaar liggen.
    return {
      lat: 50.8503 + (Math.random() - 0.5) * 0.02,
      lng: 4.3517 + (Math.random() - 0.5) * 0.02
    };
  };

  // Deze functie is nu 'async' omdat we op internet moeten wachten
  const handleSaveSLA = async (formData: Omit<SLA, 'id' | 'status' | 'lat' | 'lng'>) => {
    
    // Stap 1: Zoek de exacte coördinaten op basis van straat + stad
    const coords = await fetchCoordinates(formData.location, formData.city);

    if (editingItem) {
      // UPDATE BESTAANDE
      const updatedList = slaData.map(item => {
        if (item.id === editingItem.id) {
          return { 
            ...item, 
            ...formData, 
            lat: coords.lat, // Gebruik de nieuwe coördinaten
            lng: coords.lng,
            lastUpdate: 'Zojuist gewijzigd' 
          };
        }
        return item;
      });
      setSlaData(updatedList);
      setEditingItem(null); 
    } else {
      // MAAK NIEUWE
      const newSLA: SLA = {
        ...formData,
        id: (slaData.length + 1).toString(),
        status: 'active',
        lat: coords.lat, // Gebruik de gevonden coördinaten
        lng: coords.lng,
        lastUpdate: 'Zojuist'
      };
      setSlaData([...slaData, newSLA]);
    }
    setCurrentView('list');
  };

  const handleDeleteSLA = (idToDelete: string) => {
    setSlaData(slaData.filter(sla => sla.id !== idToDelete));
  };

  const startEditing = (item: SLA) => {
    setEditingItem(item); 
    setCurrentView('add'); 
  };

  const startNew = () => {
    setEditingItem(null); 
    setCurrentView('add');
  };

  return (
    <Shell>
      {currentView === 'home' && (
        <Dashboard 
          data={slaData} 
          onNavigate={(viewId) => {
             if (viewId === 'add') startNew();
             else setCurrentView(viewId as View);
          }} 
        />
      )}
      
      {currentView === 'list' && (
        <SLAList 
          data={slaData} 
          onBack={() => setCurrentView('home')} 
          onDelete={handleDeleteSLA}
          onEdit={startEditing} 
        />
      )}

      {currentView === 'map' && (
        <SLAMap data={slaData} onBack={() => setCurrentView('home')} />
      )}
      
      {currentView === 'add' && (
        <SLAForm 
          key={editingItem ? editingItem.id : 'new'} 
          onBack={() => setCurrentView('home')} 
          onSubmit={handleSaveSLA}
          initialData={editingItem} 
        />
      )}

      {currentView === 'manage' && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-700">Beheer</h2>
          <p className="text-slate-500 mb-4">Functionaliteit komt later.</p>
          <button onClick={() => setCurrentView('home')} className="text-blue-600 underline">Terug naar Dashboard</button>
        </div>
      )}
    </Shell>
  );
}

export default App;