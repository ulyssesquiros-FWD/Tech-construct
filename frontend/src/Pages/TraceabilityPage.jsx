import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, FileText, ShoppingCart, UserCheck, RefreshCw } from 'lucide-react';

export default function TraceabilityPage({ showToast, preselectedMaterialId }) {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(preselectedMaterialId || '');
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.getMaterials();
        setMaterials(res.data || []);
        if (!selectedMaterialId && res.data && res.data.length > 0) {
          setSelectedMaterialId(res.data[0].id);
        }
      } catch (err) {
        showToast('Error cargando lista de materiales', 'error');
      }
    };
    fetchMaterials();
  }, []);

  const loadTraceability = async (materialId) => {
    if (!materialId) return;
    try {
      setLoading(true);
      const res = await api.getMaterialTraceability(materialId);
      setTraceData(res.data || null);
    } catch (error) {
      showToast('Error al consultar trazabilidad histórica', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMaterialId) {
      loadTraceability(selectedMaterialId);
    }
  }, [selectedMaterialId]);

  const summary = traceData?.summary || {};
  const timeline = traceData?.timeline || [];
  const material = traceData?.material || {};

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Trazabilidad Integral y Cadena de Custodia</h3>
            <p className="card-subtitle">
              Reconstrucción de la historia completa del material desde su recepción por compra hasta su consumo en obra
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Seleccionar Material:</label>
            <select
              className="form-control"
              style={{ width: '320px' }}
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.internal_code} - {m.name}
                </option>
              ))}
            </select>
            <button className="btn btn-outline" onClick={() => loadTraceability(selectedMaterialId)}>
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Resumen del Material */}
        {traceData && (
          <div style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CÓDIGO INTERNO</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7', fontFamily: 'JetBrains Mono' }}>
                  {material.code}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>TOTAL ENTRADAS</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                  +{(summary.total_entradas || 0).toLocaleString()} {material.unit}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>TOTAL SALIDAS</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>
                  -{(summary.total_salidas || 0).toLocaleString()} {material.unit}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>TRASLADOS INTER-OBRA</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7' }}>
                  {(summary.total_traslados || 0).toLocaleString()} {material.unit}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600 }}>STOCK ACTUAL CALCULADO</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                  {(summary.current_calculated_stock || 0).toLocaleString()} {material.unit}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Línea de Tiempo de Movimientos */}
        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <RefreshCw className="animate-spin" size={28} style={{ color: '#0284c7' }} />
            </div>
          ) : timeline.length === 0 ? (
            <div className="empty-state">
              <History size={40} />
              <h4>No se registran movimientos para este material</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {timeline.map((mov, idx) => {
                const isEntry = ['entrada', 'ajuste_positivo'].includes(mov.movement_type);
                const isExit = ['salida', 'ajuste_negativo'].includes(mov.movement_type);
                const isTransfer = mov.movement_type === 'traslado';

                let iconColor = '#059669';
                let IconComponent = ArrowDownLeft;
                if (isExit) {
                  iconColor = '#dc2626';
                  IconComponent = ArrowUpRight;
                } else if (isTransfer) {
                  iconColor = '#0284c7';
                  IconComponent = ArrowLeftRight;
                }

                return (
                  <div
                    key={mov.id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '18px',
                      position: 'relative'
                    }}
                  >
                    {/* Icono de tipo */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: `${iconColor}15`,
                        color: iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <IconComponent size={20} />
                    </div>

                    {/* Contenido */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            className={`badge ${
                              isEntry ? 'badge-success' : isExit ? 'badge-danger' : 'badge-info'
                            }`}
                          >
                            {mov.movement_type.toUpperCase()}
                          </span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: 700 }}>
                            {mov.movement_number}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(mov.movement_date).toLocaleString('es-CR')}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '10px', fontSize: '13px' }}>
                        <div>
                          <strong>Cantidad Movida:</strong>{' '}
                          <span style={{ fontWeight: 800, color: iconColor }}>
                            {isEntry ? '+' : isExit ? '-' : ''}
                            {mov.quantity} {mov.unit}
                          </span>
                        </div>

                        <div>
                          <strong>Saldo en Sitio Resultante:</strong>{' '}
                          <span style={{ fontWeight: 800 }}>
                            {mov.balance_after} {mov.unit}
                          </span>
                        </div>

                        <div>
                          <strong>Ubicación:</strong> {mov.location?.name}
                          {mov.destination_location && (
                            <span style={{ color: '#0284c7' }}> → {mov.destination_location.name}</span>
                          )}
                        </div>

                        <div>
                          <strong>Responsable:</strong> {mov.user?.name || 'Sistema'} ({mov.user?.department || 'General'})
                        </div>

                        <div>
                          <strong>Documento Origen:</strong> {mov.source_document_type}{' '}
                          {mov.source_document_id && `(#${mov.source_document_id})`}
                        </div>

                        {mov.related_purchase_order && (
                          <div style={{ color: '#0284c7' }}>
                            <strong>Orden Compra Vinculada:</strong> {mov.related_purchase_order.po_number} (
                            {mov.related_purchase_order.supplier})
                          </div>
                        )}
                      </div>

                      {mov.notes && (
                        <div style={{ marginTop: '10px', fontSize: '12.5px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                          {mov.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
