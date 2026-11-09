import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  ArrowLeftRight,
  ShoppingCart,
  Truck,
  AlertTriangle,
  CopyCheck,
  History,
  CheckCircle2,
  BarChart3,
  HardHat
} from 'lucide-react';

export default function Sidebar({ activeSection, onSelectSection, badges = {} }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'materiales', label: 'Materiales', icon: Package },
    { id: 'categorias', label: 'Categorías', icon: Layers },
    { id: 'ubicaciones', label: 'Inventario por Ubicación', icon: Warehouse },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'ordenes', label: 'Órdenes de Compra', icon: ShoppingCart },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'alertas', label: 'Alertas de Reorden', icon: AlertTriangle, badge: badges.reorderAlerts },
    { id: 'duplicados', label: 'Duplicados', icon: CopyCheck, badge: badges.duplicateAlerts },
    { id: 'trazabilidad', label: 'Trazabilidad', icon: History },
    { id: 'aprobaciones', label: 'Aprobaciones', icon: CheckCircle2, badge: badges.pendingApprovals },
    { id: 'reportes', label: 'Reportes Empresariales', icon: BarChart3 }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <HardHat size={24} />
        </div>
        <div className="brand-info">
          <h1>DEL VALLE S.A.</h1>
          <p>Control de Inventarios</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSection(item.id)}
            >
              <div className="nav-item-content">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11.5px', color: '#64748b' }}>
        <div>Constructora Del Valle S.A.</div>
        <div style={{ color: '#0284c7', fontWeight: 600 }}>Quiz #2 — Opción 2</div>
      </div>
    </aside>
  );
}

