import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { ThreatIntelligence } from './pages/ThreatIntelligence';
import { DarkWebMonitor } from './pages/DarkWebMonitor';
import { VulnerabilityScanner } from './pages/VulnerabilityScanner';
import { AttackSurface } from './pages/AttackSurface';
import { LiveNews } from './pages/LiveNews';
import { DataLeaks } from './pages/DataLeaks';
import { AIAnalyst } from './pages/AIAnalyst';
import { Settings } from './pages/Settings';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-cyber-bg">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/threat-intel" element={<ThreatIntelligence />} />
              <Route path="/darkweb" element={<DarkWebMonitor />} />
              <Route path="/vulnerabilities" element={<VulnerabilityScanner />} />
              <Route path="/attack-surface" element={<AttackSurface />} />
              <Route path="/news" element={<LiveNews />} />
              <Route path="/data-leaks" element={<DataLeaks />} />
              <Route path="/ai-analyst" element={<AIAnalyst />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
