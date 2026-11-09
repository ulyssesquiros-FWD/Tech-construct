# PRESENTACIÓN DEFENSA DE PROYECTO — QUIZ #2
## SISTEMA EMPRESARIAL DE GESTIÓN DE INVENTARIOS Y ABASTECIMIENTO
**Tech-Construct S.A.** | Administrador del Sistema: **Ulysses** | Duración: 10 Minutos

---

### DIAPOSITIVA 1: Portada y Contexto Empresarial (0:00 - 1:00)
- **Empresa:** Tech-Construct S.A. (Infraestructura civil y edificación comercial).
- **Liderazgo del Proyecto:** Ulysses (Administrador General del Sistema).
- **Centros de Operación:** Bodega Central Coyol, Taller Calle Blancos, Obra Norte, Obra Sur y Obra Este.
- **Camino Tecnológico 2:** Backend Propio (Node.js + Express + Sequelize + MySQL + React + Vite).
- **Cifras Clave:**
  - ₡89 000 en ahorro inmediato (A2).
  - ₡223 000 de fuga de valor mensual frenada (A3).
  - ₡1 290 000 en riesgo de duplicidad neutralizado (OC-1041 y OC-1042).
  - 100% de pruebas unitarias e integración aprobadas (12/12 en Jest).

---

### DIAPOSITIVA 2: Diagnóstico y Gobernanza Digital (1:00 - 2:00)
- **Problemas Iniciales:**
  1. Compras desarticuladas con descripciones coloquiales y compras spot en ferreterías.
  2. Facturas tramitadas por encima de la tarifa contractual negociada con Proveedor A.
  3. Órdenes simultáneas idénticas sin validación de colisión.
  4. Quiebres de stock en faenas críticas de colado por falta de modelos matemáticos.
- **Solución Desplegada:**
  1. Circuito de 10 etapas con segregación estricta de funciones y Three-Way Match.
  2. Matriz de aprobación por software según montos económicos en colones.
  3. Motores analíticos de prevención de duplicados y fraccionamiento.
  4. Reposición basada en Stock de Seguridad ($SS$) y Punto de Reorden ($ROP$).

---

### DIAPOSITIVA 3: Circuito de Abastecimiento (10 Etapas) & Matriz (2:00 - 3:00)
- **Flujo:** Requisición ➔ Aprobación Requisición ➔ Cuadro Cotizaciones ➔ Generación OC ➔ Matriz de Aprobación ➔ Recepción Física ➔ Factura Electrónica ➔ Three-Way Match ➔ Pago Tesorería ➔ Asiento Atómico en Ledger.
- **Matriz de Firmas:**
  - $\le$ ₡250 000: Jefatura de Área (1 cotización).
  - ₡250 001 a ₡2 000 000: Jefatura de Compras (2 cotizaciones).
  - ₡2 000 001 a ₡10 000 000: Gerencia Financiera (3 cotizaciones).
  - \> ₡10 000 000: Gerencia General + Comité (3 cotizaciones + Acta).
- **Control Anti-Fraccionamiento:** Ventana móvil de 30 días detecta compras fragmentadas hacia un mismo proveedor o proyecto.

---

### DIAPOSITIVA 4: Taxonomía y Ahorro Directo (A2) (3:00 - 4:00)
- **Taxonomía Jerárquica de 2 Niveles:** `MAT` (Materiales) y Subfamilias (`MAT-CEM`, `MAT-ACE`).
- **Cemento Gris (540 sacos):** Consolidación bajo `MAT-CEM-GRIS-050` al precio mínimo de ₡6 300 $\implies$ **Ahorro de ₡62 000**.
- **Acero Estructural (560 barras):** Homologación bajo `MAT-ACE-VAR-003` a ₡2 150 $\implies$ **Ahorro de ₡27 000** (condicionado a certificación ASTM A615 Grado 40).
- **Guantes de Protección:** Diferenciación funcional: nitrilo (químico) vs. carnaza (abrasión). **No se consolidan por criterio de seguridad laboral**.
- **Ahorro Total Consolidado:** **₡89 000**.

---

### DIAPOSITIVA 5: Auditoría Forense de Gasto (A3) (4:00 - 5:15)
- **1. Diferencia Respecto al Contrato de Proveedor A:** ₡60 000 de variación en OC-1041 y OC-1042 (₡150 extra por cada uno de los 400 sacos). *Tratamiento: Condicionado a revisión legal de contrato marco, facturas y recepción física en obra (Three-Way Match).*
- **2. Compras Fuera de Contrato (Proveedores B, C, D):** ₡163 000 de sobrecosto por adquisiciones dispersas a tarifas minoristas.
- **3. Fuga Mensual Real:** $\text{₡}60 000 + \text{₡}163 000 = \mathbf{\text{₡}223 000}$ ($\implies \mathbf{\text{₡}2 676 000}$ proyección anual simple).
- **4. Exposición por Compra Duplicada (OC-1041 y OC-1042):** $\mathbf{\text{₡}1 290 000}$ aislados como riesgo de sobreabastecimiento/liquidez, no como pérdida consumada.

---

### DIAPOSITIVA 6: Matriz Multicriterio de Proveedores (A4) (5:15 - 6:00)
- **Criterios Ponderados:** Precio (25%), Calidad (25%), Plazos (20%), Crédito (10%), Posventa y Cobertura (20%).
- **Resultados:**
  - 🥇 **Construplaza S.A. (4.280):** Adjudicación del **70%** del volumen por liderazgo técnico y puntualidad en obra.
  - 🥈 **EPA S.A. (4.065):** Adjudicación del **30%** del volumen por ventaja en precios y red de sucursales.
  - Novex S.A. (4.105): Tercer lugar competitivo.

---

### DIAPOSITIVA 7: Reposición Matemática de Stock (A5) (6:00 - 7:00)
- **Fórmulas:**
  - $SS = (D_{\text{máx}} - D_{\text{prom}}) \times L$
  - $ROP = (D_{\text{prom}} \times L) + SS$
  - $DC = \text{Stock Actual} / D_{\text{prom}}$
- **Prioridades Operativas:**
  - 🚨 **Prioridad 1 (Crítica): Arena fina:** $DC = \mathbf{2.33\text{ días}}$ ($Stock = 14 \le ROP = 20$). Riesgo inmediato de paro de colados.
  - ⚠️ **Prioridad 2 (Alta): Block 12×20×40:** $DC = \mathbf{4.67\text{ días}}$ ($Stock = 2800 \le ROP = 3600$).
  - Cemento ($DC = 4.75$) y Varilla ($DC = 7.08$): Niveles normales en monitoreo preventivo.

---

### DIAPOSITIVA 8: Arquitectura 3NF y Ledger Inmutable (7:00 - 8:00)
- **Base de Datos:** MySQL relacional con 14 tablas en 3NF.
- **Principio del Libro Mayor (Ledger):**
  - El stock no es un campo modificable directo: se calcula dinámicamente de asientos en `inventory_movements`.
  - Los traslados registran salida y entrada vinculadas por `transfer_group_id` en una sola transacción atómica SQL.
  - Se bloquean con excepción transaccional cualquier intento de generar existencias negativas.

---

### DIAPOSITIVA 9: Verificación de Pruebas Automatizadas (8:00 - 9:00)
- **Suite Jest en `backend/tests/businessRules.test.js`:**
  - 12 pruebas obligatorias ejecutadas de forma automatizada.
  - Cálculos matemáticos de $SS$, $ROP$, generación y descarte de alertas.
  - Transacciones atómicas de inventario y rechazo estricto de stock negativo.
  - Matriz de aprobaciones, detección de compras duplicadas y fraccionadas.
  - Reconstrucción forense de trazabilidad de punta a punta.
  - Resultado: **12 passed, 100% exitosas**.

---

### DIAPOSITIVA 10: Conclusiones Estratégicas y Demostración (9:00 - 10:00)
- **Retorno Operativo y Financiero:** Recuperación inmediata de liquidez, erradicación de compras duplicadas y blindaje de la cadena de suministro.
- **Madurez de Software:** Sistema Full Stack desacoplado, escalable y persistido íntegramente en base de datos.
- **Liderazgo Técnico:** Expuesto por **Ulysses**, Administrador del Sistema Tech-Construct.
- **Paso Siguiente:** Demostración práctica en vivo de 5 minutos recorriendo el circuito operativo en tiempo real.

