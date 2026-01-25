import { useState } from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { SLAList } from './components/dashboard/SLAList';
import { SLAMap } from './components/dashboard/SLAMap';
import { SLAForm } from './components/dashboard/SLAForm';
import { mockSLAs } from './data/mockSLAs';
import type { SLA } from './types/sla'; // Strict import

type View = 'home' | 'list' | 'map' | 'add' | 'manage';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  // Dit is de "Database" van je applicatie
  const [slaData, setSlaData] = useState<SLA[]>(mockSLAs);

  const handleAddSLA = (newData: Omit<SLA, 'id' | 'status' | 'lat' | 'lng'>) => {
    const newSLA: SLA = {
      ...newData,
      id: (slaData.length + 1).toString(),
      status: 'active',
      // Genereer een locatie rond Brussel (bij gebrek aan geocoding API)
      lat: 50.8503 + (Math.random() - 0.5) * 0.1,
      lng: 4.3517 + (Math.random() - 0.5) * 0.1,
      lastUpdate: 'Zojuist'
    };

    setSlaData([...slaData, newSLA]);
    setCurrentView('list');
  };

  return (
    <Shell>
      {currentView === 'home' && (
        <Dashboard onNavigate={(viewId) => setCurrentView(viewId as View)} />
      )}
      
      {currentView === 'list' && (
        <SLAList data={slaData} onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'map' && (
        <SLAMap 
          data={slaData} 
          onBack={() => setCurrentView('home')} 
        />
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