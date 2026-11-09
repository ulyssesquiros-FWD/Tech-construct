import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Toast from './Components/Toast';
import { api } from './services/api';

// Pages
import DashboardPage from './Pages/DashboardPage';
import MaterialsPage from './Pages/MaterialsPage';
import CategoriesPage from './Pages/CategoriesPage';
import InventoryByLocationPage from './Pages/InventoryByLocationPage';
import MovementsPage from './Pages/MovementsPage';
import PurchaseOrdersPage from './Pages/PurchaseOrdersPage';
import SuppliersPage from './Pages/SuppliersPage';
import ReorderAlertsPage from './Pages/ReorderAlertsPage';
import DuplicatesPage from './Pages/DuplicatesPage';
import TraceabilityPage from './Pages/TraceabilityPage';
import ApprovalsPage from './Pages/ApprovalsPage';
import ReportsPage from './Pages/ReportsPage';

const PAGE_TITLES = {
  dashboard: 'Panel de Control Principal',
  materiales: 'Gestión de Catálogo de Materiales',
  categorias: 'Taxonomía Estandarizada de Categorías',
  ubicaciones: 'Inventario por Bodega y Obra',
  movimientos: 'Registro de Movimientos de Inventario',
  ordenes: 'Órdenes de Compra y Matriz de Aprobación',
  proveedores: 'Directorio y Gestión de Proveedores',
  alertas: 'Alertas de Punto de Reorden',
  duplicados: 'Detección de Compras Duplicadas',
  trazabilidad: 'Trazabilidad y Línea de Tiempo de Materiales',
  aprobaciones: 'Bandeja de Aprobaciones Pendientes',
  reportes: 'Informes Estratégicos Empresariales'
};

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [badges, setBadges] = useState({
    reorderAlerts: 0,
    duplicateAlerts: 0,
    pendingApprovals: 0
  });
  const [preselectedMaterialId, setPreselectedMaterialId] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshBadges = async () => {
    try {
      const summaryRes = await api.getDashboardSummary();
      const kpis = summaryRes.data?.kpis || {};
      setBadges({
        reorderAlerts: kpis.materials_under_rop || 0,
        duplicateAlerts: kpis.potential_duplicate_alerts || 0,
        pendingApprovals: kpis.pending_approvals || 0
      });
    } catch (err) {
      // Silencioso en badge refresh inicial
    }
  };

  useEffect(() => {
    refreshBadges();
    const interval = setInterval(refreshBadges, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectMaterialTrace = (materialId) => {
    setPreselectedMaterialId(materialId);
    setActiveSection('trazabilidad');
  };

  return (
    <div className="app-container">
      {/* Sidebar de 12 Secciones */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          refreshBadges();
        }}
        badges={badges}
      />

      {/* Contenido Principal */}
      <div className="main-content">
        <Navbar
          activePageTitle={PAGE_TITLES[activeSection] || 'Constructora Del Valle S.A.'}
          pendingApprovalsCount={badges.pendingApprovals}
        />

        <main className="page-body">
          {activeSection === 'dashboard' && (
            <DashboardPage
              onNavigate={(sec) => setActiveSection(sec)}
              showToast={showToast}
            />
          )}

          {activeSection === 'materiales' && (
            <MaterialsPage
              showToast={showToast}
              onSelectMaterialTrace={handleSelectMaterialTrace}
            />
          )}

          {activeSection === 'categorias' && (
            <CategoriesPage showToast={showToast} />
          )}

          {activeSection === 'ubicaciones' && (
            <InventoryByLocationPage showToast={showToast} />
          )}

          {activeSection === 'movimientos' && (
            <MovementsPage showToast={showToast} />
          )}

          {activeSection === 'ordenes' && (
            <PurchaseOrdersPage
              showToast={showToast}
              onNavigate={(sec) => setActiveSection(sec)}
            />
          )}

          {activeSection === 'proveedores' && (
            <SuppliersPage showToast={showToast} />
          )}

          {activeSection === 'alertas' && (
            <ReorderAlertsPage showToast={showToast} />
          )}

          {activeSection === 'duplicados' && (
            <DuplicatesPage showToast={showToast} />
          )}

          {activeSection === 'trazabilidad' && (
            <TraceabilityPage
              showToast={showToast}
              preselectedMaterialId={preselectedMaterialId}
            />
          )}

          {activeSection === 'aprobaciones' && (
            <ApprovalsPage showToast={showToast} />
          )}

          {activeSection === 'reportes' && (
            <ReportsPage showToast={showToast} />
          )}
        </main>
      </div>

      {/* Notificaciones Toasts */}
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}
