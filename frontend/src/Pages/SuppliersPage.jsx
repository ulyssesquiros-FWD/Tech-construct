import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { Plus, Search, Truck, Mail, Phone, MapPin, RefreshCw, UserCheck } from 'lucide-react';

export default function SuppliersPage({ showToast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    commercial_name: '',
    legal_name: '',
    tax_id: '',
    phone: '',
    email: '',
    address: '',
    contact_person: ''
  });

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.getSuppliers(query);
      setSuppliers(res.data || []);
    } catch (error) {
      showToast('Error cargando catálogo de proveedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.code || !formData.commercial_name || !formData.tax_id) {
        showToast('Código, nombre comercial y cédula jurídica son requeridos.', 'warning');
        return;
      }
      await api.createSupplier(formData);
      showToast('Proveedor registrado con éxito.', 'success');
      setShowCreateModal(false);
      setFormData({
        code: '',
        commercial_name: '',
        legal_name: '',
        tax_id: '',
        phone: '',
        email: '',
        address: '',
        contact_person: ''
      });
      loadSuppliers();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Gestión y Registro de Proveedores</h3>
            <p className="card-subtitle">Directorio de proveedores comerciales, contratos marco y condiciones de crédito</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={loadSuppliers}>
              <RefreshCw size={15} />
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Nuevo Proveedor
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative', maxWidth: '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Buscar por nombre, cédula o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre Comercial</th>
                <th>Cédula Jurídica</th>
                <th>Contacto Clave</th>
                <th>Teléfono</th>
                <th>Correo Electrónico</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ color: '#0284c7' }} />
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No se encontraron proveedores registrados.
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#0284c7' }}>
                      {sup.code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{sup.commercial_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{sup.legal_name}</div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{sup.tax_id}</td>
                    <td style={{ fontSize: '13px' }}>{sup.contact_person || 'No asignado'}</td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{sup.phone || 'S/T'}</td>
                    <td style={{ fontSize: '12px', color: '#0284c7' }}>{sup.email || 'S/C'}</td>
                    <td>
                      <span className={`badge ${sup.status === 'activo' ? 'badge-success' : 'badge-neutral'}`}>
                        {sup.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Crear Proveedor */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Registrar Nuevo Proveedor Comercial"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>
              Guardar Proveedor
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Código Proveedor *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. PROV-HOLCIM"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cédula Jurídica / Tributaria *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. 3-101-778844"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre Comercial *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nombre con el que opera en el mercado"
              value={formData.commercial_name}
              onChange={(e) => setFormData({ ...formData, commercial_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Razón Social Legal</label>
            <input
              type="text"
              className="form-control"
              placeholder="Razón social registrada"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contacto Clave / Vendedor</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del ejecutivo de cuenta"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input
                type="text"
                className="form-control"
                placeholder="+506 2200-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="pedidos@proveedor.cr"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dirección / Sucursal Principal</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Ubicación de centros de distribución o tiendas..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

