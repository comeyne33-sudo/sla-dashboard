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
  
  // 1. STATE: Hier houden we bij welk item bewerkt wordt
  const [editingItem, setEditingItem] = useState<SLA | null>(null);

  // 2. LOGICA: Opslaan (Nieuw of Update)
  const handleSaveSLA = (formData: Omit<SLA, 'id' | 'status' | 'lat' | 'lng'>) => {
    if (editingItem) {
      // UPDATE: We vervangen het bestaande item
      const updatedList = slaData.map(item => {
        if (item.id === editingItem.id) {
          return { ...item, ...formData, lastUpdate: 'Zojuist gewijzigd' };
        }
        return item;
      });
      setSlaData(updatedList);
      setEditingItem(null); 
    } else {
      // NIEUW: We maken een nieuwe aan
      const newSLA: SLA = {
        ...formData,
        id: (slaData.length + 1).toString(),
        status: 'active',
        lat: 50.8503 + (Math.random() - 0.5) * 0.1,
        lng: 4.3517 + (Math.random() - 0.5) * 0.1,
        lastUpdate: 'Zojuist'
      };
      setSlaData([...slaData, newSLA]);
    }
    setCurrentView('list');
  };

  const handleDeleteSLA = (idToDelete: string) => {
    setSlaData(slaData.filter(sla => sla.id !== idToDelete));
  };

  // 3. LOGICA: Start bewerken
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
          // ---------------------------------------------------------
          // DIT IS DE REGEL DIE JE MISTE! Zonder dit crasht de knop.
          onEdit={startEditing} 
          // ---------------------------------------------------------
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