import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../Components/StatCard';
import {
  Package,
  Boxes,
  Warehouse,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  CopyCheck,
  Split,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function DashboardPage({ onNavigate, showToast }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, statRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardStatistics()
      ]);
      setSummary(sumRes.data);
      setStats(statRes.data);
    } catch (error) {
      showToast('Error cargando indicadores del Dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !summary) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: '#0284c7' }} />
        <p style={{ marginTop: '12px', color: '#64748b' }}>Cargando métricas empresariales desde MySQL...</p>
      </div>
    );
  }

  const kpis = summary?.kpis || {};
  const recentMovements = summary?.recent_movements || [];

  return (
    <div>
      {/* Barra de Acciones Rápidas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Panel de Control Estratégico</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Monitoreo en tiempo real de existencias, puntos de reorden y circuito de adquisiciones</p>
        </div>
        <button className="btn btn-outline" onClick={loadData}>
          <RefreshCw size={15} />
          Actualizar Datos
        </button>
      </div>

      {/* Grid de KPIs principales */}
      <div className="kpi-grid">
        <StatCard
          title="Materiales Registrados"
          value={kpis.total_materials || 0}
          footer="Ítems activos en catálogo"
          icon={Package}
          color="#0284c7"
          bgLight="#e0f2fe"
        />
        <StatCard
          title="Unidades en Existencia"
          value={(kpis.total_units_in_stock || 0).toLocaleString()}
          footer="Total acumulado en bodegas y obras"
          icon={Boxes}
          color="#059669"
          bgLight="#ecfdf5"
        />
        <StatCard
          title="Bajo Punto de Reorden"
          value={kpis.materials_under_rop || 0}
          footer={
            <span style={{ color: kpis.materials_under_rop > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
              {kpis.materials_under_rop > 0 ? 'Requieren compra urgente' : 'Niveles óptimos'}
            </span>
          }
          icon={AlertTriangle}
          color="#ef4444"
          bgLight="#fef2f2"
        />
        <StatCard
          title="Stock en Nivel Normal"
          value={kpis.materials_normal || 0}
          footer="Materiales con cobertura segura"
          icon={CheckCircle}
          color="#10b981"
          bgLight="#ecfdf5"
        />
      </div>

      <div className="kpi-grid" style={{ marginBottom: '28px' }}>
        <StatCard
          title="Bodegas y Obras"
          value={kpis.total_locations || 0}
          footer="Centros de almacenamiento activos"
          icon={Warehouse}
          color="#6366f1"
          bgLight="#e0e7ff"
        />
        <StatCard
          title="Órdenes de Compra"
          value={kpis.total_purchase_orders || 0}
          footer={`${kpis.pending_approvals || 0} pendientes de aprobación`}
          icon={ShoppingCart}
          color="#8b5cf6"
          bgLight="#ede9fe"
        />
        <StatCard
          title="Posibles Duplicados"
          value={kpis.potential_duplicate_alerts || 0}
          footer="Coincidencias en revisión de compras"
          icon={CopyCheck}
          color="#f59e0b"
          bgLight="#fffbeb"
        />
        <StatCard
          title="Total Alertas Abiertas"
          value={kpis.total_pending_alerts || 0}
          footer="Reorden + Duplicados + Fraccionamiento"
          icon={AlertTriangle}
          color="#d97706"
          bgLight="#fef3c7"
        />
      </div>

      {/* Gráficos Recharts */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Gráfico 1: Stock Actual vs Punto de Reorden */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Stock Actual vs. Punto de Reorden</div>
              <div className="card-subtitle">Comparativa para la toma de decisiones de reabastecimiento</div>
            </div>
          </div>
          <div className="card-body" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.stock_vs_reorder || []} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    `${val.toLocaleString()} unidades`,
                    name === 'current_stock' ? 'Stock Actual' : 'Punto de Reorden'
                  ]}
                />
                <Legend
                  formatter={(val) => (val === 'current_stock' ? 'Stock Actual' : 'Punto de Reorden')}
                />
                <Bar dataKey="current_stock" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reorder_point" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribución de Inventario por Categoría */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Distribución por Categoría</div>
              <div className="card-subtitle">Volumen de unidades según taxonomía estandarizada</div>
            </div>
          </div>
          <div className="card-body" style={{ height: '320px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.category_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="total_units"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(stats?.category_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toLocaleString()} unidades`, 'Existencia']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico 3 y Tabla de Movimientos Recientes */}
      <div className="grid-2">
        {/* Evolución de Entradas y Salidas */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Evolución de Entradas y Salidas</div>
              <div className="card-subtitle">Flujo diario de recepciones y despachos a obra</div>
            </div>
          </div>
          <div className="card-body" style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.movement_evolution || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="entradas" stroke="#10b981" fillOpacity={1} fill="url(#colorEntradas)" />
                <Area type="monotone" dataKey="salidas" stroke="#ef4444" fillOpacity={1} fill="url(#colorSalidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Movimientos Recientes */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Movimientos Recientes en Libro Mayor</div>
              <div className="card-subtitle">Últimas transacciones registradas en MySQL</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('movimientos')}>
              Ver Todos
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Ubicación</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No hay movimientos registrados
                      </td>
                    </tr>
                  ) : (
                    recentMovements.map((mov) => {
                      const isEntry = ['entrada', 'ajuste_positivo'].includes(mov.movement_type);
                      const isExit = ['salida', 'ajuste_negativo'].includes(mov.movement_type);
                      return (
                        <tr key={mov.id}>
                          <td style={{ fontWeight: 600 }}>{mov.material?.name}</td>
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
                          <td style={{ fontWeight: 700 }}>
                            {mov.quantity} {mov.material?.unit}
                          </td>
                          <td>{mov.location?.name}</td>
                          <td style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {new Date(mov.movement_date).toLocaleDateString('es-CR')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

