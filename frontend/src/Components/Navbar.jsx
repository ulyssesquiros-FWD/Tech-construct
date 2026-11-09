import React from 'react';
import { HardHat, Bell, ShieldCheck, UserCheck } from 'lucide-react';

export default function Navbar({ activePageTitle, pendingApprovalsCount = 0 }) {
  return (
    <header className="top-navbar">
      <div className="nav-title-group">
        <h2>{activePageTitle}</h2>
        <p>Tech-Construct | Sistema de Gestión Empresarial de Inventarios</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '6px 12px', borderRadius: '20px', fontWeight: 600 }}>
          <ShieldCheck size={16} />
          <span>Base de Datos: MySQL Activa</span>
        </div>

        <div className="user-badge">
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #0284c7, #f59e0b)', color: '#ffffff', fontWeight: 800 }}>U</div>
          <div>
            <div style={{ fontSize: '13px', lineHeight: 1.1, fontWeight: 700 }}>Ulysses</div>
            <div style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: 600 }}>Administrador / Tech-Construct</div>
          </div>
        </div>
      </div>
    </header>
  );
}

