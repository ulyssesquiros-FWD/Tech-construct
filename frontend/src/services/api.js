const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Error en llamada API [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Dashboard
  getDashboardSummary: () => request('/dashboard/resumen'),
  getDashboardStatistics: () => request('/dashboard/estadisticas'),

  // Materiales
  getMaterials: (params = '') => request(`/materiales${params}`),
  getMaterialById: (id) => request(`/materiales/${id}`),
  createMaterial: (data) => request('/materiales', { method: 'POST', body: JSON.stringify(data) }),
  updateMaterial: (id, data) => request(`/materiales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaterial: (id) => request(`/materiales/${id}`, { method: 'DELETE' }),
  getMaterialStock: (id) => request(`/materiales/${id}/stock`),
  getMaterialTraceability: (id) => request(`/materiales/${id}/trazabilidad`),

  // Ubicaciones
  getLocations: () => request('/ubicaciones'),
  getLocationInventory: (id) => request(`/ubicaciones/${id}/inventario`),
  createLocation: (data) => request('/ubicaciones', { method: 'POST', body: JSON.stringify(data) }),

  // Proveedores
  getSuppliers: (params = '') => request(`/proveedores${params}`),
  createSupplier: (data) => request('/proveedores', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id, data) => request(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id) => request(`/proveedores/${id}`, { method: 'DELETE' }),

  // Movimientos
  getMovements: (params = '') => request(`/movimientos${params}`),
  recordMovement: (data) => request('/movimientos', { method: 'POST', body: JSON.stringify(data) }),

  // Órdenes de Compra
  getPurchaseOrders: (params = '') => request(`/ordenes${params}`),
  getPurchaseOrderById: (id) => request(`/ordenes/${id}`),
  createPurchaseOrder: (data) => request('/ordenes', { method: 'POST', body: JSON.stringify(data) }),
  scanDuplicates: () => request('/ordenes/escanear-duplicados', { method: 'POST' }),
  getDuplicateAlerts: () => request('/ordenes/posibles-duplicados'),
  scanSplitPurchases: () => request('/ordenes/escanear-fraccionamiento', { method: 'POST' }),
  getSplitPurchases: () => request('/ordenes/fraccionamiento'),

  // Alertas
  getReorderAlerts: (status = 'activa') => request(`/alertas/reorden?status=${status}`),
  evaluateReorderAlerts: () => request('/alertas/reorden/evaluar', { method: 'POST' }),
  reviewReorderAlert: (id, data) => request(`/alertas/${id}/revisar`, { method: 'POST', body: JSON.stringify(data) }),
  reviewDuplicateAlert: (id, data) => request(`/alertas/duplicados/${id}/revisar`, { method: 'POST', body: JSON.stringify(data) }),

  // Aprobaciones
  getPendingApprovals: () => request('/aprobaciones/pendientes'),
  approveOrder: (id, data) => request(`/aprobaciones/${id}/aprobar`, { method: 'POST', body: JSON.stringify(data) }),
  rejectOrder: (id, data) => request(`/aprobaciones/${id}/rechazar`, { method: 'POST', body: JSON.stringify(data) }),

  // Categorías
  getCategories: () => request('/categorias'),
  createCategory: (data) => request('/categorias', { method: 'POST', body: JSON.stringify(data) })
};

