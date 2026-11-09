import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { AlertTriangle, CheckCircle, RefreshCw, Eye, Edit3 } from 'lucide-react';

export default function ReorderAlertsPage({ showToast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('activa');

  // Modal de revisión
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState('en_revision');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getReorderAlerts(statusFilter);
      setAlerts(res.data || []);
    } catch (error) {
      showToast('Error cargando alertas de reorden', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter]);

  const handleEvaluateAll = async () => {
    try {
      setLoading(true);
      const res = await api.evaluateReorderAlerts();
      showToast(res.message, 'success');
      loadAlerts();
    } catch (error) {
      showToast('Error al evaluar alertas de reorden', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (alert) => {
    setSelectedAlert(alert);
    setNewStatus(alert.status);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.reviewReorderAlert(selectedAlert.id, {
        status: newStatus,
        notes: reviewNotes
      });
      showToast('Alerta de reorden actualizada.', 'success');
      setShowReviewModal(false);
      loadAlerts();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Alertas de Punto de Reorden y Reposición</h3>
            <p className="card-subtitle">Materiales con existencias menores o iguales al punto de reorden calculado automáticamente</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={handleEvaluateAll} title="Escanear y actualizar alertas">
              <RefreshCw size={15} />
              Reevaluar Stock vs ROP
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px' }}>
          <select
            className="form-control"
            style={{ width: '200px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="activa">Alertas Activas</option>
            <option value="en_revision">En Revisión</option>
            <option value="resuelta">Resueltas</option>
            <option value="todas">Todas las alertas</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Ubicación</th>
                <th>Stock Actual</th>
                <th>Punto de Reorden</th>
                <th>Stock Seguridad</th>
                <th>Déficit Reposición</th>
                <th>Fecha Alerta</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ color: '#0284c7' }} />
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No hay alertas activas de reposición con el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                alerts.map((al) => {
                  const stock = parseFloat(al.current_stock);
                  const rop = parseFloat(al.reorder_point);
                  const deficit = Math.max(0, rop - stock);

                  return (
                    <tr key={al.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{al.material?.name}</div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0284c7' }}>
                          {al.material?.internal_code}
                        </div>
                      </td>
                      <td>{al.location?.name || 'Consolidado General'}</td>
                      <td style={{ fontWeight: 800, fontSize: '15px', color: '#ef4444' }}>
                        {stock.toLocaleString()} {al.material?.unit}
                      </td>
                      <td style={{ fontWeight: 700, color: '#d97706' }}>
                        {rop.toLocaleString()} {al.material?.unit}
                      </td>
                      <td style={{ color: '#475569' }}>
                        {parseFloat(al.safety_stock).toLocaleString()} {al.material?.unit}
                      </td>
                      <td style={{ fontWeight: 700, color: '#dc2626' }}>
                        +{deficit.toLocaleString()} {al.material?.unit}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(al.alert_date).toLocaleDateString('es-CR')}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            al.status === 'activa'
                              ? 'badge-danger'
                              : al.status === 'en_revision'
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {al.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenReview(al)}
                          title="Gestionar estado de alerta"
                        >
                          <Edit3 size={13} />
                          Revisar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Revisar Alerta */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`Gestionar Alerta: ${selectedAlert?.material?.name || ''}`}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowReviewModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleReviewSubmit}>
              Guardar Gestión
            </button>
          </>
        }
      >
        <form onSubmit={handleReviewSubmit}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
              Detalle Automático de la Alerta:
            </div>
            <p style={{ fontSize: '12.5px', color: '#7f1d1d', marginTop: '4px' }}>
              {selectedAlert?.notes}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Estado de la Gestión *</label>
            <select
              className="form-control"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
            >
              <option value="activa">Activa (Pendiente de compra)</option>
              <option value="en_revision">En Revisión (Requisición en trámite)</option>
              <option value="resuelta">Resuelta (Material ingresado a bodega)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notas de Auditoría / Gestión de Compras</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Indicar número de requisición generada o motivo de resolución..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

