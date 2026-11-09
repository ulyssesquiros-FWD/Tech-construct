import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { CheckCircle2, XCircle, FileCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function ApprovalsPage({ showToast }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de aprobación / rechazo
  const [showModal, setShowModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isApproving, setIsApproving] = useState(true);
  const [comments, setComments] = useState('');
  const [attachedQuotes, setAttachedQuotes] = useState(1);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.getPendingApprovals();
      setApprovals(res.data || []);
    } catch (error) {
      showToast('Error cargando aprobaciones pendientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleOpenAction = (approval, approving) => {
    setSelectedApproval(approval);
    setIsApproving(approving);
    setComments('');
    setAttachedQuotes(approval.attached_quotations_count || approval.purchaseOrder?.attached_quotations_count || 1);
    setShowModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isApproving) {
        await api.approveOrder(selectedApproval.id, {
          comments: comments || 'Aprobado conforme a la matriz de adquisiciones',
          attached_quotations_count: attachedQuotes
        });
        showToast(`Orden ${selectedApproval.purchaseOrder?.po_number} aprobada con éxito.`, 'success');
      } else {
        await api.rejectOrder(selectedApproval.id, {
          comments: comments || 'Orden rechazada en revisión'
        });
        showToast(`Orden ${selectedApproval.purchaseOrder?.po_number} rechazada y cancelada.`, 'info');
      }
      setShowModal(false);
      loadApprovals();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Bandeja de Aprobaciones de Órdenes de Compra</h3>
            <p className="card-subtitle">
              Autorización escalonada según la Matriz de Compras (Jefatura Solicitante, Jefatura Compras, Gerencia Financiera, Gerencia General)
            </p>
          </div>
          <button className="btn btn-outline" onClick={loadApprovals}>
            <RefreshCw size={15} />
            Actualizar
          </button>
        </div>

        {/* Matriz de Referencia Rápida */}
        <div style={{ margin: '20px 24px 0 24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
            Escala de Autorización (Matriz Ejercicio A1):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '12px' }}>
            <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Hasta ₡250 000:</strong> Jefatura Solicitante (1 cotización)
            </div>
            <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>₡250 001 a ₡2 000 000:</strong> Jefatura de Compras (2 cotizaciones)
            </div>
            <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>₡2 000 001 a ₡10 000 000:</strong> Gerencia Financiera (3 cotizaciones)
            </div>
            <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Más de ₡10 000 000:</strong> Gerencia General (3 cotizaciones + comité)
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive" style={{ marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>N° de Orden</th>
                <th>Monto Total (₡)</th>
                <th>Proveedor</th>
                <th>Área / Solicitante</th>
                <th>Nivel Requerido</th>
                <th>Cotizaciones Mínimas</th>
                <th>Cotizaciones Adjuntas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ color: '#0284c7' }} />
                  </td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No hay aprobaciones pendientes en este momento.
                  </td>
                </tr>
              ) : (
                approvals.map((appr) => {
                  const po = appr.purchaseOrder;
                  const total = parseFloat(po?.total || 0);
                  const reqQuotes = appr.required_quotations;
                  const attQuotes = appr.attached_quotations_count || po?.attached_quotations_count || 1;
                  const quotesMet = attQuotes >= reqQuotes;

                  return (
                    <tr key={appr.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#0284c7' }}>
                        {po?.po_number}
                      </td>
                      <td className="currency" style={{ fontWeight: 800, fontSize: '15px' }}>
                        ₡{total.toLocaleString('es-CR')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{po?.supplier?.commercial_name}</td>
                      <td>{po?.requesting_department}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{appr.approval_level}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{reqQuotes}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${quotesMet ? 'badge-success' : 'badge-danger'}`}>
                          {attQuotes} / {reqQuotes}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleOpenAction(appr, true)}
                            title="Aprobar orden"
                          >
                            <CheckCircle2 size={13} />
                            Aprobar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleOpenAction(appr, false)}
                            title="Rechazar orden"
                          >
                            <XCircle size={13} />
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Procesar Aprobación / Rechazo */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isApproving ? 'Confirmar Aprobación de Orden' : 'Rechazar Orden de Compra'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button
              className={`btn ${isApproving ? 'btn-success' : 'btn-danger'}`}
              onClick={handleActionSubmit}
            >
              {isApproving ? 'Aprobar Orden' : 'Rechazar Orden'}
            </button>
          </>
        }
      >
        <form onSubmit={handleActionSubmit}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
              {selectedApproval?.purchaseOrder?.po_number} — ₡
              {parseFloat(selectedApproval?.purchaseOrder?.total || 0).toLocaleString('es-CR')}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
              <strong>Proveedor:</strong> {selectedApproval?.purchaseOrder?.supplier?.commercial_name}
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              <strong>Nivel Requerido:</strong> {selectedApproval?.approval_level}
            </div>
          </div>

          {isApproving && (
            <div className="form-group">
              <label className="form-label">Número de Cotizaciones Formales Adjuntas *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={attachedQuotes}
                onChange={(e) => setAttachedQuotes(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Requisito mínimo por matriz: {selectedApproval?.required_quotations} cotizaciones.
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Comentarios o Justificación de Decisión</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder={isApproving ? 'Indicar visto bueno presupuestario y cumplimiento de especificaciones...' : 'Indicar motivo de rechazo (falta de fondos, sobreprecio, etc.)...'}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
