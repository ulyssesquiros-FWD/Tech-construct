import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        let bgClass = 'toast-success';
        let Icon = CheckCircle2;

        if (t.type === 'error') {
          bgClass = 'toast-error';
          Icon = AlertCircle;
        } else if (t.type === 'warning') {
          bgClass = 'toast-warning';
          Icon = AlertTriangle;
        }

        return (
          <div key={t.id} className={`toast ${bgClass}`}>
            <Icon size={18} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => onClose(t.id)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

