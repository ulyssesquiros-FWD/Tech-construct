import React from 'react';

export default function StatCard({ title, value, footer, icon: Icon, color = '#0284c7', bgLight = '#e0f2fe' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div className="kpi-icon-box" style={{ backgroundColor: bgLight, color: color }}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {footer && <div className="kpi-footer">{footer}</div>}
    </div>
  );
}

