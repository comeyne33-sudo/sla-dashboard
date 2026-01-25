import { useState } from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { SLAList } from './components/dashboard/SLAList';
import { SLAMap } from './components/dashboard/SLAMap';

// De mogelijke schermen in de app
type View = 'home' | 'list' | 'map' | 'add' | 'manage';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <Shell>
      {/* 1. Dashboard (Home) */}
      {currentView === 'home' && (
        <Dashboard onNavigate={(viewId) => setCurrentView(viewId as View)} />
      )}
      
      {/* 2. Lijst Weergave */}
      {currentView === 'list' && (
        <SLAList onBack={() => setCurrentView('home')} />
      )}

      {/* 3. Kaart Weergave (NIEUW) */}
      {currentView === 'map' && (
        <SLAMap onBack={() => setCurrentView('home')} />
      )}
      
      {/* 4. Placeholder voor Toevoegen */}
      {currentView === 'add' && (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-700">Nieuwe SLA Toevoegen</h2>
          <p className="text-slate-500 mb-4">Hier komt straks het formulier.</p>
          <button onClick={() => setCurrentView('home')} className="text-blue-600 underline">Terug</button>
        </div>
      )}

      {/* 5. Placeholder voor Beheer */}
      {currentView === 'manage' && (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-700">Beheer</h2>
          <button onClick={() => setCurrentView('home')} className="text-blue-600 underline">Terug</button>
        </div>
      )}
    </Shell>
  );
}

export default App;