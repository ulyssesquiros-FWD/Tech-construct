import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { Plus, ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function MovementsPage({ showToast }) {
  const [movements, setMovements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterType, setFilterType] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [availableStockInOrigin, setAvailableStockInOrigin] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const [formData, setFormData] = useState({
    material_id: '',
    location_id: '',
    movement_type: 'entrada',
    quantity: '',
    unit_cost: '',
    destination_location_id: '',
    source_document_type: 'requisicion',
    source_document_id: '',
    notes: ''
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      let query = '?';
      if (filterType) query += `movement_type=${filterType}&`;
      if (filterMaterial) query += `material_id=${filterMaterial}&`;

      const [movRes, matRes, locRes] = await Promise.all([
        api.getMovements(query),
        api.getMaterials(),
        api.getLocations()
      ]);

      setMovements(movRes.data || []);
      setMaterials(matRes.data || []);
      setLocations(locRes.data || []);
    } catch (error) {
      showToast('Error cargando movimientos de inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [filterType, filterMaterial]);

  // Verificar stock disponible en origen cuando se selecciona material o ubicación origen
  useEffect(() => {
    const fetchOriginStock = async () => {
      if (formData.material_id && formData.location_id) {
        setCheckingStock(true);
        try {
          const res = await api.getMaterialStock(formData.material_id);
          const locStock = (res.by_location || []).find(l => parseInt(l.location_id) === parseInt(formData.location_id));
          setAvailableStockInOrigin(locStock ? locStock.current_stock : 0);
        } catch (err) {
          setAvailableStockInOrigin(0);
        } finally {
          setCheckingStock(false);
        }
      } else {
        setAvailableStockInOrigin(null);
      }
    };
    fetchOriginStock();
  }, [formData.material_id, formData.location_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const qty = parseFloat(formData.quantity);
      if (!formData.material_id || !formData.location_id || !qty || qty <= 0) {
        showToast('Complete los campos obligatorios con valores positivos.', 'warning');
        return;
      }

      // Validación preventiva en cliente para salidas y traslados
      if (['salida', 'traslado', 'ajuste_negativo'].includes(formData.movement_type)) {
        if (availableStockInOrigin !== null && qty > availableStockInOrigin) {
          showToast(`Stock insuficiente. Disponible en origen: ${availableStockInOrigin}, solicitado: ${qty}.`, 'error');
          return;
        }
      }

      if (formData.movement_type === 'traslado' && !formData.destination_location_id) {
        showToast('Especifique la ubicación destino del traslado.', 'warning');
        return;
      }

      await api.recordMovement(formData);
      showToast('Movimiento registrado con éxito en el libro mayor de MySQL.', 'success');
      setShowModal(false);
      setFormData({
        material_id: '',
        location_id: '',
        movement_type: 'entrada',
        quantity: '',
        unit_cost: '',
        destination_location_id: '',
        source_document_type: 'requisicion',
        source_document_id: '',
        notes: ''
      });
      loadInitialData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Libro Mayor de Movimientos de Inventario</h3>
            <p className="card-subtitle">Registro cronológico inmutable de entradas, salidas, traslados inter-obra y ajustes</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={loadInitialData}>
              <RefreshCw size={15} />
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              Registrar Movimiento
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ width: '220px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Todos los tipos de movimiento</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="traslado">Traslados</option>
            <option value="ajuste_positivo">Ajustes Positivos</option>
            <option value="ajuste_negativo">Ajustes Negativos</option>
          </select>

          <select
            className="form-control"
            style={{ width: '260px' }}
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
          >
            <option value="">Todos los materiales</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.internal_code} - {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla de Movimientos */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Movimiento</th>
                <th>Fecha y Hora</th>
                <th>Tipo</th>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Ubicación</th>
                <th>Saldo Resultante</th>
                <th>Doc. Origen</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ color: '#0284c7' }} />
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No se registran movimientos con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const isEntry = ['entrada', 'ajuste_positivo'].includes(mov.movement_type);
                  const isExit = ['salida', 'ajuste_negativo'].includes(mov.movement_type);

                  return (
                    <tr key={mov.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 600 }}>
                        {mov.movement_number}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(mov.movement_date).toLocaleString('es-CR')}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isEntry
                              ? 'badge-success'
                              : isExit
                              ? 'badge-danger'
                              : 'badge-info'
                          }`}
                        >
                          {mov.movement_type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{mov.material?.name}</td>
                      <td style={{ fontWeight: 700, fontSize: '14px' }}>
                        {isEntry ? '+' : isExit ? '-' : ''}
                        {mov.quantity} {mov.material?.unit}
                      </td>
                      <td>{mov.location?.name}</td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        {mov.balance_after} {mov.material?.unit}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        <span style={{ fontWeight: 600 }}>{mov.source_document_type}</span>
                        {mov.source_document_id && (
                          <div style={{ color: '#64748b', fontSize: '11px' }}>{mov.source_document_id}</div>
                        )}
                      </td>
                      <td style={{ fontSize: '12px' }}>{mov.user?.full_name || 'Sistema'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Movimiento */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Movimiento de Inventario"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Confirmar y Asentar en Ledger
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Tipo de Movimiento *</label>
              <select
                className="form-control"
                value={formData.movement_type}
                onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                required
              >
                <option value="entrada">Entrada (Recepción de compra / proveedor)</option>
                <option value="salida">Salida (Despacho a cuadrilla de obra)</option>
                <option value="traslado">Traslado (Transferencia entre bodegas / obras)</option>
                <option value="ajuste_positivo">Ajuste Positivo (Sobrante físico verificado)</option>
                <option value="ajuste_negativo">Ajuste Negativo (Merma / daño verificado)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Material *</label>
              <select
                className="form-control"
                value={formData.material_id}
                onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
                required
              >
                <option value="">Seleccione material...</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.internal_code} - {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Ubicación Origen *</label>
              <select
                className="form-control"
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                required
              >
                <option value="">Seleccione ubicación...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {formData.movement_type === 'traslado' ? (
              <div className="form-group">
                <label className="form-label">Ubicación Destino *</label>
                <select
                  className="form-control"
                  value={formData.destination_location_id}
                  onChange={(e) => setFormData({ ...formData, destination_location_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione destino...</option>
                  {locations
                    .filter((l) => parseInt(l.id) !== parseInt(formData.location_id))
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.type.toUpperCase()})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Costo Unitario (₡ Opcional)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Precio de compra o costo contable"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Banner de Stock Disponible en Origen */}
          {formData.material_id && formData.location_id && (
            <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>
                Existencia disponible actual en origen:
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: availableStockInOrigin > 0 ? '#059669' : '#dc2626' }}>
                {checkingStock ? 'Consultando...' : `${availableStockInOrigin} unidades`}
              </span>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Cantidad a Mover *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                placeholder="Cantidad numérica"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo Documento Origen</label>
              <select
                className="form-control"
                value={formData.source_document_type}
                onChange={(e) => setFormData({ ...formData, source_document_type: e.target.value })}
              >
                <option value="requisicion">Requisición Interna de Obra</option>
                <option value="orden_compra">Orden de Compra / Factura Proveedor</option>
                <option value="traslado">Boleta de Traslado</option>
                <option value="ajuste_inventario">Acta de Conteo Físico / Auditoría</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">N° de Documento Origen / Referencia</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. REQ-OBRA-2026-44 o FACT-99881"
              value={formData.source_document_id}
              onChange={(e) => setFormData({ ...formData, source_document_id: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones y Justificación Técnica</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Detalles del despacho, motivo de ajuste o responsable que retira..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

