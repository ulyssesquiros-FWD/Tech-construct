import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { Plus, Layers, FolderTree, RefreshCw } from 'lucide-react';

export default function CategoriesPage({ showToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parent_id: ''
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      showToast('Error cargando taxonomía de categorías', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.code || !formData.name) {
        showToast('Código y nombre son obligatorios', 'warning');
        return;
      }
      await api.createCategory(formData);
      showToast('Categoría creada exitosamente.', 'success');
      setShowCreateModal(false);
      setFormData({ code: '', name: '', description: '', parent_id: '' });
      loadCategories();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Taxonomía Empresarial de Gastos e Inventarios</h3>
            <p className="card-subtitle">Estructura jerárquica estandarizada de 2 niveles (Categoría → Subcategoría) para consolidación y negociación</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={loadCategories}>
              <RefreshCw size={15} />
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Nueva Categoría
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <RefreshCw className="animate-spin" size={24} style={{ color: '#0284c7' }} />
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <FolderTree size={40} />
              <h4>No hay categorías registradas</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '20px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          backgroundColor: '#0284c7',
                          color: '#fff',
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '13px'
                        }}
                      >
                        {cat.code}
                      </span>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{cat.name}</h4>
                    </div>
                    <span className="badge badge-neutral">
                      {(cat.subcategories?.length || 0)} subcategorías
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    {cat.description || 'Sin descripción detallada'}
                  </p>

                  {/* Subcategorías de Nivel 2 */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                        Subcategorías Estandarizadas (Nivel 2)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                        {cat.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            style={{
                              background: '#ffffff',
                              padding: '10px 14px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 600, color: '#0369a1', marginRight: '8px' }}>
                                {sub.code}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 500 }}>{sub.name}</span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {(sub.materials?.length || 0)} materiales
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Crear Categoría */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Categoría o Subcategoría"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>
              Guardar
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Código (Prefijo) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. MAT-ELE"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría Padre (Opcional)</label>
              <select
                className="form-control"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              >
                <option value="">Ninguna (Es Categoría Principal Nivel 1)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre de la Categoría *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. Materiales Eléctricos e Iluminación"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Detalle de materiales agrupados bajo esta clasificación..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
