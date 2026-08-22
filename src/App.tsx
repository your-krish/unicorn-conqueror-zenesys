import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { IncidentCommandCenter } from './components/incidents/IncidentCommandCenter';
import { IncidentDetailModal } from './components/incidents/IncidentDetailModal';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { ProcurementDeliveries } from './components/procurement/ProcurementDeliveries';
import { ApprovalCenter } from './components/approvals/ApprovalCenter';
import { WorkforceViewer } from './components/workforce/WorkforceViewer';
import { ReportGenerator } from './components/reports/ReportGenerator';
import { AuditTrailViewer } from './components/audit/AuditTrailViewer';
import { AdminManagementPanel } from './components/admin/AdminManagementPanel';
import { TransferStockModal } from './components/common/TransferStockModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { RealtimeAlertToasts } from './components/common/RealtimeAlertToasts';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dynamic radial spotlight tracking on pointer move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.spotlight-card');
      cards.forEach(card => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative transition-colors duration-200">
      
      {/* Ambient Blurred Mesh Background Glow Orbs */}
      <div className="ambient-glow-emerald" aria-hidden="true" />
      <div className="ambient-glow-violet" aria-hidden="true" />

      {/* Top Glassmorphic Command Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setCurrentTab('admin')}
        onOpenIncidentDetail={(id) => setSelectedIncidentId(id)}
      />

      {/* Main App Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6 relative z-10">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenTransferModal={() => setIsTransferModalOpen(true)}
        />

        {/* Central Dynamic View Content */}
        <section className="flex-1 min-w-0">
          {currentTab === 'overview' && (
            <ExecutiveDashboard
              onOpenIncidentDetail={(id) => setSelectedIncidentId(id)}
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
              onNavigateTab={(tab) => setCurrentTab(tab as TabType)}
            />
          )}

          {currentTab === 'incidents' && (
            <IncidentCommandCenter
              onOpenIncidentDetail={(id) => setSelectedIncidentId(id)}
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryManagement
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
            />
          )}

          {currentTab === 'procurement' && (
            <ProcurementDeliveries />
          )}

          {currentTab === 'approvals' && (
            <ApprovalCenter />
          )}

          {currentTab === 'workforce' && (
            <WorkforceViewer />
          )}

          {currentTab === 'reports' && (
            <ReportGenerator />
          )}

          {currentTab === 'audit' && (
            <AuditTrailViewer />
          )}

          {currentTab === 'admin' && (
            <AdminManagementPanel />
          )}
        </section>
      </main>

      {/* Interactive Modals */}
      <IncidentDetailModal
        incidentId={selectedIncidentId}
        onClose={() => setSelectedIncidentId(null)}
        onOpenTransferModal={() => setIsTransferModalOpen(true)}
      />

      <TransferStockModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectIncident={(id) => setSelectedIncidentId(id)}
      />

      {/* Realtime Alert Broadcast Toasts */}
      <RealtimeAlertToasts
        onOpenIncidentDetail={(id) => setSelectedIncidentId(id)}
      />

    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RealtimeProvider>
          <MainApp />
        </RealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
