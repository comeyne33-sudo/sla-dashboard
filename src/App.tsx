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

  const handleAddSLA = (newData: Omit<SLA, 'id' | 'status' | 'lat' | 'lng'>) => {
    const newSLA: SLA = {
      ...newData,
      id: (slaData.length + 1).toString(),
      status: 'active',
      lat: 50.8503 + (Math.random() - 0.5) * 0.1,
      lng: 4.3517 + (Math.random() - 0.5) * 0.1,
      lastUpdate: 'Zojuist'
    };
    setSlaData([...slaData, newSLA]);
    setCurrentView('list');
  };

  // Functie voor verwijderen
  const handleDeleteSLA = (idToDelete: string) => {
    const updatedList = slaData.filter(sla => sla.id !== idToDelete);
    setSlaData(updatedList);
  };

  return (
    <Shell>
      {currentView === 'home' && (
        <Dashboard 
          data={slaData} // <--- DIT WAS DE OORZAAK! Deze regel moet er staan.
          onNavigate={(viewId) => setCurrentView(viewId as View)} 
        />
      )}
      
      {currentView === 'list' && (
        <SLAList 
          data={slaData} 
          onBack={() => setCurrentView('home')} 
          onDelete={handleDeleteSLA}
        />
      )}

      {currentView === 'map' && (
        <SLAMap data={slaData} onBack={() => setCurrentView('home')} />
      )}
      
      {currentView === 'add' && (
        <SLAForm 
          onBack={() => setCurrentView('home')} 
          onSubmit={handleAddSLA}
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