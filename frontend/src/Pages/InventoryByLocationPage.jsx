import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../Components/Modal';
import { Warehouse, Plus, RefreshCw, MapPin, Package } from 'lucide-react';

export default function InventoryByLocationPage({ showToast }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'obra',
    address: ''
  });

  const loadLocations = async () => {
    try {
      setLoading(true);
      const res = await api.getLocations();
      const locs = res.data || [];
      setLocations(locs);
      if (locs.length > 0 && !selectedLocation) {
        selectLocation(locs[0]);
      }
    } catch (error) {
      showToast('Error cargando ubicaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = async (loc) => {
    setSelectedLocation(loc);
    try {
      setLoadingItems(true);
      const res = await api.getLocationInventory(loc.id);
      setInventoryItems(res.items || []);
    } catch (error) {
      showToast(`Error al consultar inventario de ${loc.name}`, 'error');
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.code || !formData.name) {
        showToast('Código y nombre son obligatorios', 'warning');
        return;
      }
      await api.createLocation(formData);
      showToast('Ubicación creada con éxito.', 'success');
      setShowCreateModal(false);
      setFormData({ code: '', name: '', type: 'obra', address: '' });
      loadLocations();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Calcular valor total del inventario en la ubicación seleccionada
  const totalValorUbicacion = inventoryItems.reduce((acc, curr) => acc + (parseFloat(curr.valor_total_estimado) || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Control de Inventario por Bodega y Obra</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Supervisión de stock in-situ en frentes de trabajo y bodegas centrales</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          Nueva Ubicación
        </button>
      </div>

      {/* Selector de ubicaciones en forma de tarjetas/pestañas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {locations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          return (
            <div
              key={loc.id}
              onClick={() => selectLocation(loc)}
              style={{
                background: isSelected ? '#0284c7' : '#ffffff',
                color: isSelected ? '#ffffff' : '#0f172a',
                border: `1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(2,132,199,0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, opacity: isSelected ? 0.9 : 0.6, textTransform: 'uppercase' }}>
                  {loc.type}
                </span>
                <Warehouse size={18} style={{ opacity: isSelected ? 1 : 0.5 }} />
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '4px' }}>{loc.name}</div>
              <div style={{ fontSize: '12px', opacity: isSelected ? 0.9 : 0.6 }}>
                {loc.stats?.total_units?.toLocaleString() || 0} unidades ({loc.stats?.distinct_materials || 0} materiales)
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalle de existencias de la ubicación seleccionada */}
      {selectedLocation && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Existencias en: {selectedLocation.name}</h3>
              <p className="card-subtitle">
                <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                {selectedLocation.address || 'Sin dirección registrada'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>Valor Total Estimado en Ubicación:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', fontFamily: 'JetBrains Mono' }}>
                ₡{totalValorUbicacion.toLocaleString('es-CR')}
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Material</th>
                  <th>Stock en Obra / Bodega</th>
                  <th>Unidad</th>
                  <th>Precio Unitario Estándar</th>
                  <th>Valor Total en Sitio</th>
                  <th>Punto de Reorden Global</th>
                </tr>
              </thead>
              <tbody>
                {loadingItems ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                      <RefreshCw className="animate-spin" size={24} style={{ color: '#0284c7' }} />
                    </td>
                  </tr>
                ) : inventoryItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      No hay materiales con existencias registradas en esta ubicación.
                    </td>
                  </tr>
                ) : (
                  inventoryItems.map((item) => (
                    <tr key={item.material_id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#0284c7' }}>
                        {item.internal_code}
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.material_name}</td>
                      <td style={{ fontWeight: 800, fontSize: '15px' }}>
                        {item.stock_actual.toLocaleString()}
                      </td>
                      <td style={{ color: '#64748b' }}>{item.unit}</td>
                      <td className="currency" style={{ color: '#475569' }}>
                        ₡{parseFloat(item.standard_price).toLocaleString('es-CR')}
                      </td>
                      <td className="currency" style={{ fontWeight: 700, color: '#059669' }}>
                        ₡{item.valor_total_estimado.toLocaleString('es-CR')}
                      </td>
                      <td style={{ color: '#d97706', fontWeight: 600 }}>
                        {parseFloat(item.reorder_point).toFixed(0)} {item.unit}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Crear Ubicación */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Registrar Nueva Bodega u Obra"
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
              <label className="form-label">Código Interno *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. OBR-OESTE"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Ubicación *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="obra">Obra en Construcción</option>
                <option value="bodega">Bodega de Almacenamiento</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre de la Ubicación / Proyecto *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. Obra Oeste - Torre Sabana Norte"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dirección Física o Ubicación Geográfica</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Provincia, cantón, señas exactas del frente de obra..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

