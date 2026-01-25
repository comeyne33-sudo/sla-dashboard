import { useState } from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { SLAList } from './components/dashboard/SLAList';
// Dit type definieert welke schermen we hebben
type View = 'home' | 'list' | 'map' | 'add' | 'manage';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <Shell>
      {/* 1. De Homepagina (Dashboard) */}
      {currentView === 'home' && (
        <Dashboard 
          onNavigate={(viewId) => setCurrentView(viewId as View)} 
        />
      )}
      
      {/* 2. De Lijst Pagina */}
      {currentView === 'list' && (
        <SLAList 
          onBack={() => setCurrentView('home')} 
        />
      )}

      {/* 3. Placeholder voor de kaart (komt later) */}
      {currentView === 'map' && (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <h3 className="text-xl font-bold text-slate-700">Kaart weergave</h3>
          <p className="text-slate-500 mb-4">Hier komt straks de kaart van België.</p>
          <button onClick={() => setCurrentView('home')} className="text-blue-600 underline">Terug naar home</button>
        </div>
      )}
    </Shell>
  );
}

export default App;