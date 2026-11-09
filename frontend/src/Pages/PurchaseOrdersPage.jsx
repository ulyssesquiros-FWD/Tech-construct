import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { Plus, Eye, ShoppingCart, RefreshCw, CopyCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function PurchaseOrdersPage({ showToast, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Formulario de creación de orden
  const [formData, setFormData] = useState({
    supplier_id: '',
    location_id: '',
    requesting_department: 'Obras',
    project_name: '',
    attached_quotations_count: 1,
    notes: '',
    items: [{ material_id: '', quantity: 1, unit_price: 0 }]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [poRes, supRes, matRes, locRes] = await Promise.all([
        api.getPurchaseOrders(),
        api.getSuppliers(),
        api.getMaterials(),
        api.getLocations()
      ]);
      setOrders(poRes.data || []);
      setSuppliers(supRes.data || []);
      setMaterials(matRes.data || []);
      setLocations(locRes.data || []);
    } catch (error) {
      showToast('Error cargando órdenes de compra', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calcular total reactivo y nivel de aprobación según la matriz
  const totalAmount = formData.items.reduce((sum, item) => {
    const q = parseFloat(item.quantity) || 0;
    const p = parseFloat(item.unit_price) || 0;
    return sum + (q * p);
  }, 0);

  let approvalLevelPreview = 'Jefatura del área solicitante';
  let requiredQuotesPreview = 1;
  let committeeRequired = false;

  if (totalAmount <= 250000) {
    approvalLevelPreview = 'Jefatura del área solicitante';
    requiredQuotesPreview = 1;
  } else if (totalAmount <= 2000000) {
    approvalLevelPreview = 'Jefatura de Compras';
    requiredQuotesPreview = 2;
  } else if (totalAmount <= 10000000) {
    approvalLevelPreview = 'Gerencia Financiera';
    requiredQuotesPreview = 3;
  } else {
    approvalLevelPreview = 'Gerencia General';
    requiredQuotesPreview = 3;
    committeeRequired = true;
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { material_id: '', quantity: 1, unit_price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;

    // Si cambia el material, auto-rellenar con el precio estándar
    if (field === 'material_id') {
      const mat = materials.find(m => m.id === parseInt(value));
      if (mat) {
        updated[index].unit_price = parseFloat(mat.standard_price) || 0;
      }
    }

    setFormData({ ...formData, items: updated });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.supplier_id || !formData.requesting_department || !formData.items.length) {
        showToast('Complete los campos obligatorios.', 'warning');
        return;
      }
      for (const it of formData.items) {
        if (!it.material_id || parseFloat(it.quantity) <= 0) {
          showToast('Cada ítem debe tener material y cantidad válida.', 'warning');
          return;
        }
      }

      await api.createPurchaseOrder(formData);
      showToast('Orden de compra registrada y remitida a la matriz de aprobación.', 'success');
      setShowCreateModal(false);
      setFormData({
        supplier_id: '',
        location_id: '',
        requesting_department: 'Obras',
        project_name: '',
        attached_quotations_count: 1,
        notes: '',
        items: [{ material_id: '', quantity: 1, unit_price: 0 }]
      });
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleScanDuplicates = async () => {
    try {
      const res = await api.scanDuplicates();
      showToast(res.message, 'info');
      onNavigate('duplicados');
    } catch (error) {
      showToast('Error al ejecutar escaneo de duplicados', 'error');
    }
  };

  const handleScanSplit = async () => {
    try {
      const res = await api.scanSplitPurchases();
      showToast(res.message, 'info');
      loadData();
    } catch (error) {
      showToast('Error al ejecutar escaneo de fraccionamiento', 'error');
    }
  };

  const handleViewDetails = (po) => {
    setSelectedOrder(po);
    setShowDetailModal(true);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Gestión de Órdenes de Compra</h3>
            <p className="card-subtitle">Flujo corporativo con matriz de aprobación automatizada y detección de riesgos</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={handleScanDuplicates} title="Detectar compras duplicadas">
              <CopyCheck size={16} />
              Escanear Duplicados
            </button>
            <button className="btn btn-outline" onClick={handleScanSplit} title="Detectar compras fraccionadas">
              <ShieldAlert size={16} />
              Escanear Fraccionamiento
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Nueva Orden de Compra
            </button>
          </div>
        </div>

        {/* Tabla de Órdenes */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° de Orden</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Área / Solicitante</th>
                <th>Proyecto / Obra</th>
                <th>Total (₡)</th>
                <th>Nivel de Aprobación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ color: '#0284c7' }} />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No hay órdenes de compra registradas.
                  </td>
                </tr>
              ) : (
                orders.map((po) => {
                  let statusBadge = 'badge-neutral';
                  if (po.status === 'aprobada' || po.status === 'recibida') statusBadge = 'badge-success';
                  else if (po.status === 'pendiente_aprobacion') statusBadge = 'badge-warning';
                  else if (po.status === 'cancelada') statusBadge = 'badge-danger';
                  else if (po.status === 'emitida') statusBadge = 'badge-info';

                  return (
                    <tr key={po.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#0284c7' }}>
                        {po.po_number}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {po.order_date}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {po.supplier?.commercial_name}
                      </td>
                      <td>{po.requesting_department}</td>
                      <td>{po.project_name || 'General'}</td>
                      <td className="currency" style={{ fontWeight: 800, fontSize: '14px' }}>
                        ₡{parseFloat(po.total).toLocaleString('es-CR')}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          {po.required_approval_level}
                        </span>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                          Mín. {po.required_quotations} cotizaciones
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusBadge}`}>
                          {po.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleViewDetails(po)}
                          title="Ver detalle de la orden"
                        >
                          <Eye size={13} />
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

      {/* Modal: Crear Orden de Compra con Evaluación en Vivo de la Matriz */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nueva Orden de Compra"
        maxWidth="750px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>
              Registrar y Remitir a Aprobación
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Proveedor *</label>
              <select
                className="form-control"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                required
              >
                <option value="">Seleccione proveedor...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commercial_name} ({s.tax_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Área Solicitante *</label>
              <select
                className="form-control"
                value={formData.requesting_department}
                onChange={(e) => setFormData({ ...formData, requesting_department: e.target.value })}
                required
              >
                <option value="Obras">Obras Civiles</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Bodega">Logística y Bodega</option>
                <option value="Administracion">Administración</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Proyecto / Obra de Destino</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Obra Norte - Las Terrazas"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cotizaciones Adjuntas</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.attached_quotations_count}
                onChange={(e) => setFormData({ ...formData, attached_quotations_count: e.target.value })}
              />
            </div>
          </div>

          {/* Lista de Artículos */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Artículos a Solicitar *</label>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleAddItem}>
                <Plus size={13} />
                Agregar Artículo
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1.2fr auto',
                  gap: '10px',
                  alignItems: 'center',
                  marginBottom: '8px',
                  background: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}
              >
                <select
                  className="form-control"
                  value={item.material_id}
                  onChange={(e) => handleItemChange(index, 'material_id', e.target.value)}
                  required
                >
                  <option value="">Seleccione material...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.internal_code} - {m.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  placeholder="Cantidad"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  required
                />

                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Precio Unitario"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                  required
                />

                {formData.items.length > 1 && (
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    onClick={() => handleRemoveItem(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Banner de Matriz de Aprobación en Vivo */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '14px 18px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Estimado de la Orden:
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: 'JetBrains Mono' }}>
                  ₡{totalAmount.toLocaleString('es-CR')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
                  Autoridad Competente Requerida:
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>
                  {approvalLevelPreview}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Requiere mínimo {requiredQuotesPreview} cotización(es) formal(es)
                  {committeeRequired && ' + Comité'}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Justificación o Notas</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Motivo de la adquisición, destino en obra..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Detalle de Orden */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Detalle de Orden: ${selectedOrder?.po_number || ''}`}
        footer={
          <button className="btn btn-primary" onClick={() => setShowDetailModal(false)}>
            Cerrar
          </button>
        }
      >
        {selectedOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
              <div><strong>Proveedor:</strong> {selectedOrder.supplier?.commercial_name}</div>
              <div><strong>Fecha:</strong> {selectedOrder.order_date}</div>
              <div><strong>Área:</strong> {selectedOrder.requesting_department}</div>
              <div><strong>Proyecto:</strong> {selectedOrder.project_name}</div>
              <div><strong>Nivel Requerido:</strong> {selectedOrder.required_approval_level}</div>
              <div><strong>Cotizaciones:</strong> {selectedOrder.attached_quotations_count} de {selectedOrder.required_quotations} mínimas</div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Líneas de la Orden:</h4>
            <table className="data-table" style={{ marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(selectedOrder.details || []).map((det) => (
                  <tr key={det.id}>
                    <td>{det.material?.name}</td>
                    <td>{det.quantity} {det.material?.unit}</td>
                    <td className="currency">₡{parseFloat(det.unit_price).toLocaleString('es-CR')}</td>
                    <td className="currency" style={{ fontWeight: 700 }}>₡{parseFloat(det.subtotal).toLocaleString('es-CR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Total: ₡{parseFloat(selectedOrder.total).toLocaleString('es-CR')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

