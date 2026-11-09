import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { Plus, Search, Eye, History, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function MaterialsPage({ showToast, onSelectMaterialTrace }) {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedMaterialStock, setSelectedMaterialStock] = useState(null);

  // Formulario de creación
  const [formData, setFormData] = useState({
    internal_code: '',
    name: '',
    category_id: '',
    subcategory_id: '',
    unit: 'saco',
    description: '',
    avg_daily_demand: 10,
    max_daily_demand: 15,
    lead_time_days: 3,
    standard_price: 0
  });

  const loadMaterials = async () => {
    try {
      setLoading(true);
      let query = '?';
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (selectedCategory) query += `category_id=${selectedCategory}&`;

      const [matRes, catRes] = await Promise.all([
        api.getMaterials(query),
        api.getCategories()
      ]);

      setMaterials(matRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      showToast('Error cargando catálogo de materiales', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [search, selectedCategory]);

  // Cálculos reactivos de Punto de Reorden y Stock de Seguridad para el formulario
  const avg = parseFloat(formData.avg_daily_demand) || 0;
  const max = parseFloat(formData.max_daily_demand) || avg;
  const lead = parseInt(formData.lead_time_days) || 1;
  const previewSafetyStock = Math.max(0, (max - avg) * lead);
  const previewReorderPoint = (avg * lead) + previewSafetyStock;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.internal_code || !formData.name || !formData.category_id || !formData.unit) {
        showToast('Complete todos los campos obligatorios.', 'warning');
        return;
      }

      await api.createMaterial(formData);
      showToast('Material creado con éxito. Stock de seguridad y Punto de reorden calculados automáticamente.', 'success');
      setShowCreateModal(false);
      setFormData({
        internal_code: '',
        name: '',
        category_id: '',
        subcategory_id: '',
        unit: 'saco',
        description: '',
        avg_daily_demand: 10,
        max_daily_demand: 15,
        lead_time_days: 3,
        standard_price: 0
      });
      loadMaterials();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleOpenStockDetail = async (mat) => {
    try {
      const res = await api.getMaterialStock(mat.id);
      setSelectedMaterialStock({
        material: mat,
        total_stock: res.total_stock,
        by_location: res.by_location || []
      });
      setShowStockModal(true);
    } catch (error) {
      showToast('Error consultando stock por ubicación', 'error');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Catálogo Maestro de Materiales</h3>
            <p className="card-subtitle">Administración de códigos estandarizados, demanda y parámetros de reposición</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={loadMaterials}>
              <RefreshCw size={15} />
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Nuevo Material
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Buscar por nombre o código (ej. MAT-CEM-GRIS-050)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: '220px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Material</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Stock de Seguridad</th>
                <th>Punto de Reorden</th>
                <th>Stock Actual</th>
                <th>Cobertura</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ color: '#0284c7' }} />
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No se encontraron materiales registrados
                  </td>
                </tr>
              ) : (
                materials.map((m) => {
                  const isReponer = m.stock_status === 'REPONER';
                  return (
                    <tr key={m.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#0284c7' }}>
                        {m.internal_code}
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>
                        <span className="badge badge-neutral">{m.category?.name || 'General'}</span>
                      </td>
                      <td style={{ textTransform: 'lowercase', color: '#64748b' }}>{m.unit}</td>
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>
                        {parseFloat(m.safety_stock).toFixed(0)}
                      </td>
                      <td style={{ fontWeight: 700, color: '#d97706', textAlign: 'center' }}>
                        {parseFloat(m.reorder_point).toFixed(0)}
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '14px', textAlign: 'center' }}>
                        {m.current_stock.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600, color: isReponer ? '#ef4444' : '#10b981' }}>
                          {m.coverage_days > 0 ? `${m.coverage_days} días` : '0 días'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isReponer ? 'badge-danger' : 'badge-success'}`}>
                          {isReponer ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                          {m.stock_status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            title="Ver existencias por ubicación"
                            onClick={() => handleOpenStockDetail(m)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            title="Trazabilidad histórica"
                            onClick={() => onSelectMaterialTrace(m.id)}
                          >
                            <History size={13} />
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

      {/* Modal: Crear Material */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Registrar Nuevo Material en Catálogo"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>
              Guardar Material
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Código Estandarizado *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. MAT-CEM-GRIS-050"
                value={formData.internal_code}
                onChange={(e) => setFormData({ ...formData, internal_code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unidad de Medida *</label>
              <select
                className="form-control"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="saco">Saco</option>
                <option value="varilla">Varilla</option>
                <option value="unidad">Unidad</option>
                <option value="m3">Metro Cúbico (m³)</option>
                <option value="par">Par</option>
                <option value="tubo">Tubo (6m)</option>
                <option value="kg">Kilogramo (kg)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Material *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Descripción completa del artículo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                className="form-control"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
              >
                <option value="">Seleccione categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Precio Estándar (₡)</label>
              <input
                type="number"
                className="form-control"
                value={formData.standard_price}
                onChange={(e) => setFormData({ ...formData, standard_price: e.target.value })}
              />
            </div>
          </div>

          {/* Parámetros de demanda y reposición */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
              Parámetros de Demanda y Cálculo Automático de Reposición
            </h4>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Demanda Promedio / Día</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.avg_daily_demand}
                  onChange={(e) => setFormData({ ...formData, avg_daily_demand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Demanda Máxima / Día</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.max_daily_demand}
                  onChange={(e) => setFormData({ ...formData, max_daily_demand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tiempo Entrega (Días)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.lead_time_days}
                  onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                />
              </div>
            </div>

            {/* Resultado calculado en tiempo real */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px', background: '#e0f2fe', padding: '12px 16px', borderRadius: '6px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 600 }}>STOCK DE SEGURIDAD (SS)</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0369a1' }}>
                  {previewSafetyStock} <span style={{ fontSize: '12px' }}>{formData.unit}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#0284c7' }}>({max} - {avg}) × {lead} días</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>PUNTO DE REORDEN (ROP)</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#b45309' }}>
                  {previewReorderPoint} <span style={{ fontSize: '12px' }}>{formData.unit}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#d97706' }}>({avg} × {lead}) + {previewSafetyStock}</div>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Existencias por Ubicación */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={`Existencias: ${selectedMaterialStock?.material?.name || ''}`}
        footer={
          <button className="btn btn-primary" onClick={() => setShowStockModal(false)}>
            Cerrar
          </button>
        }
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Stock Total Consolidado:</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                {selectedMaterialStock?.total_stock || 0} {selectedMaterialStock?.material?.unit}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Punto de Reorden:</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706' }}>
                {selectedMaterialStock?.material?.reorder_point} {selectedMaterialStock?.material?.unit}
              </div>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Ubicación</th>
                <th>Tipo</th>
                <th>Stock Disponible</th>
              </tr>
            </thead>
            <tbody>
              {(selectedMaterialStock?.by_location || []).map((loc) => (
                <tr key={loc.location_id}>
                  <td style={{ fontWeight: 600 }}>{loc.location_name}</td>
                  <td>
                    <span className={`badge ${loc.location_type === 'bodega' ? 'badge-info' : 'badge-neutral'}`}>
                      {loc.location_type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '14px' }}>
                    {loc.current_stock.toLocaleString()} {selectedMaterialStock?.material?.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
