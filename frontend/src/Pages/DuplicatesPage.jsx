import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { CopyCheck, ShieldAlert, CheckCircle2, XCircle, RefreshCw, Eye, Edit3 } from 'lucide-react';

export default function DuplicatesPage({ showToast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('confirmada');
  const [reviewNotes, setReviewNotes] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getDuplicateAlerts();
      setAlerts(res.data || []);
    } catch (error) {
      showToast('Error cargando alertas de compras duplicadas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleScanNow = async () => {
    try {
      setLoading(true);
      const res = await api.scanDuplicates();
      showToast(res.message, 'success');
      loadAlerts();
    } catch (error) {
      showToast('Error ejecutando detección de duplicados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (alert) => {
    setSelectedAlert(alert);
    setReviewStatus(alert.status === 'pendiente_revision' ? 'confirmada' : alert.status);
    setReviewNotes(alert.review_notes || '');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.reviewDuplicateAlert(selectedAlert.id, {
        status: reviewStatus,
        notes: reviewNotes,
        reviewed_by: 1
      });
      showToast('Dictamen de auditoría de compra duplicada guardado.', 'success');
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
            <h3 className="card-title">Detección y Auditoría de Compras Duplicadas</h3>
            <p className="card-subtitle">
              Identificación heurística de órdenes coincidentes (mismo proveedor, artículo, fecha ≤ 3 días, cantidades ± 10%)
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleScanNow}>
            <RefreshCw size={15} />
            Ejecutar Escaneo de Duplicados
          </button>
        </div>

        {/* Banner Informativo Caso A3 */}
        <div style={{ margin: '20px 24px 0 24px', background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldAlert size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '14px' }}>
                Exposición Económica por Posibles Duplicados (Ejercicio A3)
              </div>
              <p style={{ fontSize: '12.5px', color: '#78350f', marginTop: '4px' }}>
                Una coincidencia de compra genera una <strong>alerta preventiva para revisión documental</strong>, no una declaración automática de fraude.
                La duplicidad debe analizarse por separado del sobreprecio contractual, representando un riesgo de sobrecompra o pago doble que requiere verificar física y contablemente la recepción de los materiales.
              </p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive" style={{ marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Órdenes en Conflicto</th>
                <th>Proveedor</th>
                <th>Material</th>
                <th>Cantidades</th>
                <th>Fechas</th>
                <th>Nivel de Riesgo</th>
                <th>Motivo de Coincidencia</th>
                <th>Estado Revisión</th>
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
                    No se detectan compras duplicadas pendientes.
                  </td>
                </tr>
              ) : (
                alerts.map((al) => {
                  let riskBadge = 'badge-warning';
                  if (al.risk_level === 'critico') riskBadge = 'badge-danger';

                  return (
                    <tr key={al.id}>
                      <td>
                        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#0284c7' }}>
                          {al.order1?.po_number}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#d97706' }}>
                          {al.order2?.po_number}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {al.supplier?.commercial_name}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {al.material?.name}
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono' }}>
                        <div>{al.qty_1} {al.material?.unit}</div>
                        <div>{al.qty_2} {al.material?.unit}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        <div>{al.date_1}</div>
                        <div>{al.date_2}</div>
                      </td>
                      <td>
                        <span className={`badge ${riskBadge}`}>
                          {al.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', maxWidth: '300px' }}>
                        {al.match_reason}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            al.status === 'confirmada'
                              ? 'badge-danger'
                              : al.status === 'no_duplicada'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {al.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenReview(al)}
                          title="Auditar compra duplicada"
                        >
                          <Edit3 size={13} />
                          Auditar
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

      {/* Modal: Dictamen de Auditoría */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Dictamen de Auditoría de Compra Duplicada"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowReviewModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleReviewSubmit}>
              Guardar Dictamen
            </button>
          </>
        }
      >
        <form onSubmit={handleReviewSubmit}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Órdenes Comparadas: {selectedAlert?.order1?.po_number} vs {selectedAlert?.order2?.po_number}
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              <strong>Proveedor:</strong> {selectedAlert?.supplier?.commercial_name}
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              <strong>Material:</strong> {selectedAlert?.material?.name} ({selectedAlert?.qty_1} {selectedAlert?.material?.unit})
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Resolución de Auditoría *</label>
            <select
              className="form-control"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              required
            >
              <option value="pendiente_revision">Pendiente de Revisión Física</option>
              <option value="confirmada">Confirmada Duplicada (Bloquear o Cancelar Orden)</option>
              <option value="no_duplicada">No Duplicada (Justificada por Requerimiento Técnico)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Justificación Documental de Auditoría</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Indicar si se verificó con el bodeguero, si hubo doble facturación o si correspondía a frentes de obra distintos..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
