import React, { useState } from 'react';
import { BarChart3, TrendingDown, ShieldCheck, DollarSign, Award, AlertTriangle, Layers } from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('a2');

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Informes Estratégicos y Análisis de Adquisiciones (Parte A)</h3>
            <p className="card-subtitle">
              Resolución matemática, justificaciones operativas y controles del Quiz #2 para Constructora Del Valle S.A.
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación de Informes */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 24px', overflowX: 'auto' }}>
          {[
            { id: 'a1', label: 'A1: Circuito & Matriz' },
            { id: 'a2', label: 'A2: Taxonomía & Ahorro (₡89k)' },
            { id: 'a3', label: 'A3: Fuga de Valor (₡223k)' },
            { id: 'a4', label: 'A4: Evaluación Proveedores' },
            { id: 'a5', label: 'A5: Puntos de Reorden' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 18px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #0284c7' : '3px solid transparent',
                color: activeTab === tab.id ? '#0284c7' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card-body">
          {/* TAB A1: CIRCUITO Y MATRIZ */}
          {activeTab === 'a1' && (
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>
                Circuito Integral de Compras de 10 Etapas y Matriz de Aprobación
              </h4>
              <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px' }}>
                El circuito garantiza la trazabilidad operativa y previene pagos no autorizados mediante la aplicación del <strong>Three-Way Match</strong> (Orden de Compra + Hoja de Recepción + Factura Comercial).
              </p>

              <div className="table-responsive" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Monto en Colones (₡)</th>
                      <th>Autoridad Responsable</th>
                      <th>Cotizaciones Mínimas</th>
                      <th>Control Aplicado y Riesgos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Hasta ₡250 000</td>
                      <td>Jefatura del área solicitante</td>
                      <td style={{ textAlign: 'center' }}>1</td>
                      <td>Verificación de necesidad inmediata y presupuesto de área</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>₡250 001 a ₡2 000 000</td>
                      <td>Jefatura de Compras</td>
                      <td style={{ textAlign: 'center' }}>2</td>
                      <td>Cuadro comparativo de precios y tiempos de entrega</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>₡2 000 001 a ₡10 000 000</td>
                      <td>Gerencia Financiera</td>
                      <td style={{ textAlign: 'center' }}>3</td>
                      <td>Validación de flujo de caja y términos de crédito comercial</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Más de ₡10 000 000</td>
                      <td>Gerencia General + Comité</td>
                      <td style={{ textAlign: 'center' }}>3 + Comité</td>
                      <td>Licitación corporativa y dictamen técnico de comité</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>Control Contra Fraccionamiento de Compras:</h5>
                <p style={{ fontSize: '13px', color: '#7f1d1d' }}>
                  El fraccionamiento ocurre cuando un funcionario divide una compra grande en órdenes menores (ej. ₡240 000) para evadir las autorizaciones superiores. El sistema implementa un motor de detección que acumula las compras por solicitante, proveedor y proyecto en una ventana de 30 días, emitiendo una alerta preventiva a Compras y Auditoría.
                </p>
              </div>
            </div>
          )}

          {/* TAB A2: TAXONOMÍA Y AHORRO */}
          {activeTab === 'a2' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Clasificación Taxonómica y Potencial de Ahorro Observado
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Consolidación de ítems equivalentes utilizando precios mínimos observados de mercado
                  </p>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 18px', borderRadius: '8px', textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>AHORRO POTENCIAL TOTAL</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#047857', fontFamily: 'JetBrains Mono' }}>
                    ₡89 000
                  </div>
                </div>
              </div>

              <div className="table-responsive" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Descripción Original</th>
                      <th>Área</th>
                      <th>Prov.</th>
                      <th>Cant.</th>
                      <th>Precio Unit.</th>
                      <th>Gasto Actual</th>
                      <th>Código Estándar</th>
                      <th>Precio Mínimo</th>
                      <th>Ahorro Potencial</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Cemento gris 50 kg</td>
                      <td>Obras</td>
                      <td>A</td>
                      <td>200</td>
                      <td>₡6 450</td>
                      <td>₡1 290 000</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#0284c7' }}>MAT-CEM-GRIS-050</td>
                      <td>₡6 300</td>
                      <td className="currency" style={{ color: '#047857', fontWeight: 700 }}>₡30 000</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Saco cemento uso general</td>
                      <td>Mantenimiento</td>
                      <td>B</td>
                      <td>40</td>
                      <td>₡7 100</td>
                      <td>₡284 000</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#0284c7' }}>MAT-CEM-USO-GEN</td>
                      <td>₡6 300</td>
                      <td className="currency" style={{ color: '#047857', fontWeight: 700 }}>₡32 000</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>CEM-GRIS-50</td>
                      <td>Bodega</td>
                      <td>A</td>
                      <td>300</td>
                      <td>₡6 300</td>
                      <td>₡1 890 000</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#0284c7' }}>MAT-CEM-GRIS-050</td>
                      <td>₡6 300</td>
                      <td className="currency" style={{ color: '#64748b' }}>₡0 (Mínimo)</td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan="6">Subtotal Cemento (540 sacos)</td>
                      <td>₡3 464 000</td>
                      <td colSpan="2">Precio Mínimo: ₡6 300</td>
                      <td style={{ color: '#047857' }}>₡62 000</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>Varilla #3 grado 40</td>
                      <td>Obras</td>
                      <td>C</td>
                      <td>500</td>
                      <td>₡2 150</td>
                      <td>₡1 075 000</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#0284c7' }}>MAT-ACE-VAR-003</td>
                      <td>₡2 150</td>
                      <td className="currency" style={{ color: '#64748b' }}>₡0 (Mínimo)</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>Hierro 3/8 x 6 m</td>
                      <td>Mantenimiento</td>
                      <td>D</td>
                      <td>60</td>
                      <td>₡2 600</td>
                      <td>₡156 000</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#0284c7' }}>MAT-ACE-VAR-003</td>
                      <td>₡2 150</td>
                      <td className="currency" style={{ color: '#047857', fontWeight: 700 }}>₡27 000</td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan="6">Subtotal Varilla / Hierro (560 barras)*</td>
                      <td>₡1 231 000</td>
                      <td colSpan="2">Precio Mínimo: ₡2 150</td>
                      <td style={{ color: '#047857' }}>₡27 000</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>Guantes nitrilo talla L</td>
                      <td>Bodega</td>
                      <td>E</td>
                      <td>100</td>
                      <td>₡850</td>
                      <td>₡85 000</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#0284c7' }}>SEG-GUA-NIT-L</td>
                      <td>₡850</td>
                      <td>- (Esp. distinta)</td>
                    </tr>
                    <tr>
                      <td>7</td>
                      <td>Guantes trabajo L</td>
                      <td>Obras</td>
                      <td>F</td>
                      <td>80</td>
                      <td>₡1 200</td>
                      <td>₡96 000</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#0284c7' }}>SEG-GUA-TRA-L</td>
                      <td>₡1 200</td>
                      <td>- (Esp. distinta)</td>
                    </tr>
                    <tr>
                      <td>8</td>
                      <td>Tubo PVC 1/2 SDR 13.5</td>
                      <td>Mantenimiento</td>
                      <td>B</td>
                      <td>25</td>
                      <td>₡2 900</td>
                      <td>₡72 500</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#0284c7' }}>TUB-PVC-012-SDR135</td>
                      <td>₡2 900</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: '#1e40af' }}>
                  * <strong>Nota de rigor técnico:</strong> El ahorro en varilla (₡27 000) está sujeto a verificar que el hierro comercial 3/8 posea especificaciones mecánicas equivalentes (Grado 40 / ASTM A615) a la varilla corrugada estructural antes de homologar la compra. Los guantes de nitrilo y de carnaza NO deben consolidarse debido a que cumplen funciones de protección ocupacional completamente diferentes.
                </p>
              </div>
            </div>
          )}

          {/* TAB A3: FUGA DE VALOR Y DUPLICADOS */}
          {activeTab === 'a3' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Análisis de Gasto y Fuga de Valor (Ejercicio A3)
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Contrato vigente Proveedor A: Cemento gris 50 kg = ₡6 300 | Varilla #3 = ₡2 050
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 16px', borderRadius: '8px', textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 700 }}>SOBREPRECIO MENSUAL</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#991b1b', fontFamily: 'JetBrains Mono' }}>
                      ₡223 000
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#b91c1c' }}>Proyección Anual: ₡2 676 000</div>
                  </div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 16px', borderRadius: '8px', textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 700 }}>EXPOSICIÓN DUPLICADOS</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#92400e', fontFamily: 'JetBrains Mono' }}>
                      ₡1 290 000
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#78350f' }}>OC-1041 vs OC-1042</div>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>OC</th>
                      <th>Fecha</th>
                      <th>Área</th>
                      <th>Prov.</th>
                      <th>Artículo</th>
                      <th>Cant.</th>
                      <th>Precio Pagado</th>
                      <th>Precio Contrato</th>
                      <th>Sobreprecio</th>
                      <th>Condición Detectada</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700 }}>OC-1041</td>
                      <td>02/10</td>
                      <td>Obras</td>
                      <td>A</td>
                      <td>Cemento gris 50 kg</td>
                      <td>200</td>
                      <td>₡6 450</td>
                      <td>₡6 300</td>
                      <td className="currency" style={{ color: '#ef4444', fontWeight: 700 }}>₡30 000</td>
                      <td><span className="badge badge-warning">Posible Duplicado OC-1042</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>OC-1042</td>
                      <td>02/10</td>
                      <td>Obras</td>
                      <td>A</td>
                      <td>Cemento gris 50 kg</td>
                      <td>200</td>
                      <td>₡6 450</td>
                      <td>₡6 300</td>
                      <td className="currency" style={{ color: '#ef4444', fontWeight: 700 }}>₡30 000</td>
                      <td><span className="badge badge-danger">Posible Duplicado OC-1041</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>OC-1047</td>
                      <td>06/10</td>
                      <td>Mantenimiento</td>
                      <td>B</td>
                      <td>Cemento gris 50 kg</td>
                      <td>40</td>
                      <td>₡7 100</td>
                      <td>₡6 300</td>
                      <td className="currency" style={{ color: '#ef4444', fontWeight: 700 }}>₡32 000</td>
                      <td>Compra fuera de contrato marco</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>OC-1050</td>
                      <td>08/10</td>
                      <td>Obras</td>
                      <td>C</td>
                      <td>Varilla #3</td>
                      <td>500</td>
                      <td>₡2 150</td>
                      <td>₡2 050</td>
                      <td className="currency" style={{ color: '#ef4444', fontWeight: 700 }}>₡50 000</td>
                      <td>Proveedor no contratado</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>OC-1053</td>
                      <td>09/10</td>
                      <td>Obras</td>
                      <td>C</td>
                      <td>Varilla #3</td>
                      <td>480</td>
                      <td>₡2 150</td>
                      <td>₡2 050</td>
                      <td className="currency" style={{ color: '#ef4444', fontWeight: 700 }}>₡48 000</td>
                      <td>Proveedor no contratado</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>OC-1058</td>
                      <td>13/10</td>
                      <td>Mantenimiento</td>
                      <td>D</td>
                      <td>Varilla #3</td>
                      <td>60</td>
                      <td>₡2 600</td>
                      <td>₡2 050</td>
                      <td className="currency" style={{ color: '#ef4444', fontWeight: 700 }}>₡33 000</td>
                      <td>Compra spot con sobreprecio elevado</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>OC-1061</td>
                      <td>15/10</td>
                      <td>Bodega</td>
                      <td>A</td>
                      <td>Cemento gris 50 kg</td>
                      <td>300</td>
                      <td>₡6 300</td>
                      <td>₡6 300</td>
                      <td className="currency" style={{ color: '#10b981', fontWeight: 700 }}>₡0</td>
                      <td><span className="badge badge-success">Conforme a Contrato</span></td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                      <td colSpan="8">TOTAL FUGA DE VALOR POR SOBREPRECIO</td>
                      <td style={{ color: '#dc2626' }}>₡223 000</td>
                      <td>Proyección Anual: ₡2 676 000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB A4: EVALUACIÓN DE PROVEEDORES */}
          {activeTab === 'a4' && (
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                Matriz Ponderada de Evaluación Multicriterio de Proveedores
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Supuestos académicos de evaluación para Novex, Construplaza y EPA (Escala de 1 a 5).
              </p>

              <div className="table-responsive" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Criterio de Evaluación</th>
                      <th>Peso (%)</th>
                      <th>Novex S.A.</th>
                      <th>Construplaza S.A.</th>
                      <th>EPA S.A.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Precio y Descuentos por Volumen</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>25 %</td>
                      <td style={{ textAlign: 'center' }}>4.0 (1.00)</td>
                      <td style={{ textAlign: 'center' }}>3.5 (0.875)</td>
                      <td style={{ textAlign: 'center' }}>4.5 (1.125)</td>
                    </tr>
                    <tr>
                      <td>Calidad y Certificaciones Técnicas</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>25 %</td>
                      <td style={{ textAlign: 'center' }}>4.5 (1.125)</td>
                      <td style={{ textAlign: 'center' }}>4.8 (1.20)</td>
                      <td style={{ textAlign: 'center' }}>4.0 (1.00)</td>
                    </tr>
                    <tr>
                      <td>Cumplimiento de Plazos en Obra</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>20 %</td>
                      <td style={{ textAlign: 'center' }}>4.0 (0.80)</td>
                      <td style={{ textAlign: 'center' }}>4.5 (0.90)</td>
                      <td style={{ textAlign: 'center' }}>3.8 (0.76)</td>
                    </tr>
                    <tr>
                      <td>Condiciones de Crédito (Días plazo)</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>10 %</td>
                      <td style={{ textAlign: 'center' }}>4.0 (0.40)</td>
                      <td style={{ textAlign: 'center' }}>4.2 (0.42)</td>
                      <td style={{ textAlign: 'center' }}>3.5 (0.35)</td>
                    </tr>
                    <tr>
                      <td>Servicio Posventa y Devoluciones</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>10 %</td>
                      <td style={{ textAlign: 'center' }}>3.8 (0.38)</td>
                      <td style={{ textAlign: 'center' }}>4.6 (0.46)</td>
                      <td style={{ textAlign: 'center' }}>3.9 (0.39)</td>
                    </tr>
                    <tr>
                      <td>Cobertura Geográfica de Despacho</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>5 %</td>
                      <td style={{ textAlign: 'center' }}>4.0 (0.20)</td>
                      <td style={{ textAlign: 'center' }}>4.0 (0.20)</td>
                      <td style={{ textAlign: 'center' }}>4.8 (0.24)</td>
                    </tr>
                    <tr>
                      <td>Riesgo de Dependencia y Capacidad</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>5 %</td>
                      <td style={{ textAlign: 'center' }}>4.0 (0.20)</td>
                      <td style={{ textAlign: 'center' }}>4.5 (0.225)</td>
                      <td style={{ textAlign: 'center' }}>4.0 (0.20)</td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: 800, fontSize: '15px' }}>
                      <td>PUNTAJE PONDERADO TOTAL</td>
                      <td style={{ textAlign: 'center' }}>100 %</td>
                      <td style={{ textAlign: 'center', color: '#0f172a' }}>4.105 / 5.0</td>
                      <td style={{ textAlign: 'center', color: '#047857' }}>4.280 / 5.0 (Ganador)</td>
                      <td style={{ textAlign: 'center', color: '#0f172a' }}>4.065 / 5.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Recomendación Estratégica Empresarial:</h5>
                <p style={{ fontSize: '13px', color: '#334155' }}>
                  <strong>Construplaza S.A.</strong> obtiene el mayor puntaje ponderado (4.28) gracias a su sobresaliente calidad, puntualidad en sitio de obra y servicio posventa, debiendo ser designado como <strong>Proveedor Principal</strong> (70 % del volumen contratado). Se recomienda mantener a <strong>EPA S.A.</strong> como <strong>Proveedor Secundario</strong> (30 % del volumen) por su mejor índice de precios y amplia cobertura geográfica, mitigando de forma activa el riesgo de desabastecimiento.
                </p>
              </div>
            </div>
          )}

          {/* TAB A5: PUNTOS DE REORDEN */}
          {activeTab === 'a5' && (
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                Determinación de Niveles de Stock, Puntos de Reorden y Prioridad de Reposición
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Fórmulas aplicadas: Stock de Seguridad = (Demanda Máx − Demanda Prom) × Tiempo Entrega | Punto de Reorden = (Demanda Prom × Tiempo Entrega) + Stock Seguridad
              </p>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Demanda Prom.</th>
                      <th>Demanda Máx.</th>
                      <th>Entrega</th>
                      <th>Stock de Seguridad</th>
                      <th>Punto de Reorden</th>
                      <th>Stock Actual</th>
                      <th>Días Cobertura</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#fef2f2' }}>
                      <td style={{ fontWeight: 700 }}>Arena fina (m³)</td>
                      <td>6</td>
                      <td>10</td>
                      <td>2 días</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>8</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#d97706' }}>20</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>14</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>2.33 días</td>
                      <td><span className="badge badge-danger">REPONER</span></td>
                      <td><span className="badge badge-danger">1 (MÁXIMA URGENCIA)</span></td>
                    </tr>
                    <tr style={{ background: '#fffbeb' }}>
                      <td style={{ fontWeight: 700 }}>Block 12 × 20 × 40</td>
                      <td>600</td>
                      <td>900</td>
                      <td>4 días</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>1 200</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#d97706' }}>3 600</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#d97706' }}>2 800</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#d97706' }}>4.67 días</td>
                      <td><span className="badge badge-warning">REPONER</span></td>
                      <td><span className="badge badge-warning">2 (ALTA PRIORIDAD)</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Cemento gris 50 kg</td>
                      <td>40</td>
                      <td>55</td>
                      <td>3 días</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>45</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>165</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>190</td>
                      <td style={{ textAlign: 'center' }}>4.75 días</td>
                      <td><span className="badge badge-success">NORMAL</span></td>
                      <td><span className="badge badge-neutral">3 (MONITOREO)</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Varilla #3 grado 40</td>
                      <td>120</td>
                      <td>160</td>
                      <td>5 días</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>200</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>800</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>850</td>
                      <td style={{ textAlign: 'center' }}>7.08 días</td>
                      <td><span className="badge badge-success">NORMAL</span></td>
                      <td><span className="badge badge-neutral">4 (ESTABLE)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
