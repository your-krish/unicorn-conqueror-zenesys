import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Glassmorphic Command Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setCurrentTab('admin')}
        onOpenIncidentDetail={(id) => setSelectedIncidentId(id)}
      />

      {/* Main App Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
        
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
    <AuthProvider>
      <RealtimeProvider>
        <MainApp />
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
