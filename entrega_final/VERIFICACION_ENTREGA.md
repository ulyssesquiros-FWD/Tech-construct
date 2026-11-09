# REPORTE DE REVISIÓN FINAL DE CONSISTENCIA Y AUDITORÍA TÉCNICA
## QUIZ #2: SISTEMA EMPRESARIAL DE GESTIÓN DE INVENTARIOS Y ABASTECIMIENTO
**Entidad Evaluada:** Constructora Del Valle S.A. (Entidad Ficticia para Fines Académicos)  
**Fecha de Certificación:** Noviembre 2026  
**Resultado Global:** Aprobado al 100% — Consistencia Técnica, Matemática y Documental Verificada

---

### 1. RESUMEN EJECUTIVO DE AJUSTES REALIZADOS

En cumplimiento de los requerimientos de la revisión final de consistencia, se auditó exhaustivamente el repositorio, la base de datos MySQL, los scripts de prueba y todos los documentos alojados en `entrega_final/`.

| Área Evaluada | Hallazgo / Inconsistencia Previa | Ajuste Aplicado | Estado de Verificación |
|---|---|---|:---:|
| **1. Saldo de Cemento** | Confusión entre el valor del Ejercicio A5 (190 sacos) y el valor mostrado tras tests (270 sacos). | Identificada la causa: la suite `npm test` asienta registros reales en MySQL (+100, -20 = +80 sacos). Se aclaró el baseline de 190 en semilla y el flujo demo (+50 -20 = 220). | **CONCILIADO Y COMPROBADO** |
| **2. Reproducibilidad Demo** | Escenario ejecutaba salidas variables (+50 -10 vs +50 -20). | Estandarizado en Entrada: +50 sacos, Salida: -20 sacos, arrojando saldo de 220 sacos sobre semilla limpia. | **VERIFICADO 10/10** |
| **3. Cifras de Ejercicio A3** | Verificación de subtotales contractuales y compras a terceros. | Confirmada la distribución: ₡60 000 (Prov A), ₡163 000 (Terceros), ₡223 000 (Total mensual), ₡1 290 000 (Exposición duplicado). | **100% CONSISTENTE** |
| **4. Tratamiento Legal A3** | Existían frases afirmando "crédito líquido y exigible" o "nota de crédito confirmada". | Reemplazado por conclusión formal condicionada a revisión de contrato, facturas y recepción física (Three-Way Match). | **CORREGIDO Y AUDITADO** |
| **5. Identificación Jurídica** | Cédula 3-101-558899 figuraba como dato formal sin advertencia. | Modificado en todos los documentos para marcar expresamente que Constructora Del Valle y su identificación son ficticias con fines académicos. | **ACTUALIZADO** |
| **6. Límite de Páginas PDF** | Exigencia de no rebasar 15 páginas. | Recompilado con Microsoft Edge headless: exactamente **9 páginas**, portada formal y diagramas integrados. | **9 PÁGINAS (CUMPLE)** |
| **7. Sincronización Global** | Concordancia entre presentación, guiones y guía de preguntas. | Actualizados `presentacion_quiz2.html`, `.md`, guion de 10 min, guion de 5 min y guía de 24 preguntas. | **SINCRONIZADO** |

---

### 2. CONCILIACIÓN TÉCNICA DEL SALDO DE CEMENTO GRIS 50 KG

#### Causa Raíz de la Diferencia (190 vs. 270 vs. 220 sacos)
1. **Estado Inicial de Semilla (`database/seed.sql`):**
   - Movimiento 1 (`MOV-2026-0001`): Entrada inicial de **250 sacos** en Bodega Central Coyol.
   - Movimiento 2 (`MOV-2026-0002`): Salida de **60 sacos** para obras menores.
   - **Saldo Inicial Semilla Base:** $250 - 60 = \mathbf{190\text{ sacos}}$.
   - Este valor coincide exactamente con la tabla maestra del **Ejercicio A5** ($SS = 45$, $ROP = 165$, $Stock = 190$, $DC = 4.75\text{ días}$, Estado: Normal).

2. **Impacto de la Suite de Pruebas Automatizadas (`npm test`):**
   - La suite `businessRules.test.js` se ejecuta directamente contra la base de datos real MySQL (propiedad ACID).
   - La Prueba 6 asienta una Entrada real de **+100 sacos**.
   - La Prueba 7 asienta una Salida real de **-20 sacos**.
   - La Prueba 8 asienta un Traslado de 15 sacos (-15 en origen, +15 en destino $\implies$ neto 0).
   - Efecto neto de los tests sobre Bodega Central: $+100 - 20 = \mathbf{+80\text{ sacos}}$.
   - Como consecuencia, si se consulta la base de datos inmediatamente después de `npm test`, el saldo registrado en MySQL asciende a:
     $$190 + 80 = \mathbf{270\text{ sacos}}$$

3. **Flujo de Demostración en Vivo (5 Minutos):**
   - **Partiendo de Base Semilla Limpia (tras `npm run db:init`):**
     - Stock inicial en Bodega Central: **190 sacos**.
     - Paso 3: Entrada de 50 sacos $\implies 190 + 50 = \mathbf{240\text{ sacos}}$.
     - Paso 4: Salida de 20 sacos $\implies 240 - 20 = \mathbf{220\text{ sacos}}$.
     - Incremento neto comprobado: **+30 sacos**.
   - **Partiendo de Base Post-Test (sin re-sembrar):**
     - Stock inicial en Bodega Central: **270 sacos**.
     - Tras Entrada (+50) y Salida (-20): saldo resultante de **300 sacos** ($270 + 30 = 300$).
   - **Conclusión de Integridad:** Ambos escenarios son perfectamente válidos y demuestran el funcionamiento del **Ledger Inmutable** en MySQL: el sistema no lee variables fijas en memoria, sino que suma y resta asientos físicos reales. La base de datos queda entregada en su estado prístino de **190 sacos**.

---

### 3. AUDITORÍA FINANCIERA DEL EJERCICIO A3

Se certifica que todas las tablas, reportes, presentaciones y guiones mantienen la distribución analítica requerida:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DESGLOSE FINANCIERO CONSOLIDADO (EJERCICIO A3)                  │
├────────────────────────────────────────┬─────────────┬─────────────────────────────────┤
│ Categoría Contable / Legal             │ Monto (₡)   │ Órdenes Involucradas            │
├────────────────────────────────────────┼─────────────┼─────────────────────────────────┤
│ 1. Diferencia Contrato Proveedor A     │  ₡60 000    │ OC-1041 (₡30k) + OC-1042 (₡30k) │
│ 2. Desviaciones Compras a Terceros     │ ₡163 000    │ OC-1047, 1050, 1053, 1058       │
├────────────────────────────────────────┼─────────────┼─────────────────────────────────┤
│ TOTAL CONSOLIDADO DE DIFERENCIAS (MES) │ ₡223 000    │ 7 Órdenes Analizadas            │
│ Proyección Anual Simple (×12 meses)    │ ₡2 676 000  │ Proyección anual de ahorro      │
├────────────────────────────────────────┼─────────────┼─────────────────────────────────┤
│ EXPOSICIÓN RIESGO DUPLICADO (OC-1041/2)│ ₡1 290 000  │ 200 sacos × ₡6 450 (Aislado)    │
└────────────────────────────────────────┴─────────────┴─────────────────────────────────┘
```

#### Criterio Legal y Contable Aplicado:
- Se eliminó cualquier calificación de los ₡60 000 como un *"crédito líquido y exigible automático"* o una *"nota de crédito confirmada"*.
- Quedó expresamente redactado como una **desviación respecto al precio de referencia marco, cuya recuperación o reclamo formal queda condicionada a:**
  1. Revisión jurídica del contrato marco y sus cláusulas de ajuste.
  2. Auditoría y cotejo de las facturas electrónicas timbradas ante la administración tributaria.
  3. Comprobación física de la recepción de materiales en obra mediante la conciliación tripartita (**Three-Way Match**).
- Los **₡1 290 000** de las órdenes gemelas OC-1041 y OC-1042 se mantienen estrictamente aislados como **exposición económica y riesgo de liquidez/sobreabastecimiento**, impidiendo su cómputo erróneo como pérdida consumada.

---

### 4. IDENTIFICACIÓN JURÍDICA DE LA EMPRESA

- En todos los encabezados, portadas y metadatos se eliminó cualquier insinuación de que el número `3-101-558899` corresponda a una empresa real del Registro Nacional.
- Se fijó la leyenda formal:  
  **`Constructora Del Valle S.A. (Entidad y Cédula Ficticias para Fines Académicos)`**.

---

### 5. VERIFICACIÓN DEL INFORME PDF OFICIAL

- **Archivo:** `entrega_final/informe_quiz2.pdf`.
- **Compilador utilizado:** Microsoft Edge Application Headless con motor Chromium sobre `informe_quiz2.html`.
- **Tamaño de archivo:** 456 075 bytes (~445 KB).
- **Conteo exacto de páginas:** **9 páginas**.
- **Cumplimiento del límite de páginas:** **CUMPLE** (Límite máximo permitido: 15 páginas; utilizado: 9 páginas).
- **Contenido verificado:** Portada corporativa con gradiente azul pizarra, tabla de contenido formal, ejercicios A1 al A5 completamente desarrollados con tablas y fórmulas KaTeX/HTML, arquitectura relacional 3NF, resumen de pruebas Jest y conclusiones estratégicas.
- **Apertura:** Verificado sin errores de renderizado ni fuentes cortadas.

---

### 6. VERIFICACIÓN DE ENTREGABLES DE PRESENTACIÓN Y DEFENSA

1. **Presentación de Diapositivas Interactiva (`presentacion_quiz2.html`):**
   - 10 diapositivas animadas completas.
   - Navegación probada mediante teclado (`Left`, `Right`, `Space`, `Home`, `End`).
   - Modo pantalla completa activable con tecla `F`.
   - Cifras financieras sincronizadas: ₡89k ahorro A2, ₡60k diferencia Prov A, ₡163k terceros, ₡223k fuga mensual, ₡1.29M riesgo duplicado.
2. **Guion de Exposición de 10 Minutos (`guion_presentacion_10min.md`):**
   - Pacing tracker cronometrado minuto a minuto (0:00 a 10:00).
   - Libreto verbal en tono técnico y formal, adaptado a los criterios condicionados de auditoría.
3. **Guion Técnico de Demostración de 5 Minutos (`guion_demostracion_5min.md`):**
   - 10 pasos estructurados para completarse en 4:45.
   - Detalle exacto de acciones en vivo: Dashboard, Materiales, Entrada (+50), Salida (-20), Saldo (220 sacos), Alertas ROP, Detección de Duplicados, Trazabilidad Forense, Creación de OC por ₡3 000 000 y Aprobación Gerencia Financiera con 3 cotizaciones.
4. **Guía Maestra de Defensa Técnica (`guia_preguntas_defensa.md`):**
   - 24 preguntas técnicas profundas que cubren exhaustivamente: Node.js, Express, React, Vite, MySQL, Sequelize, 3NF, REST, CRUD, Stock de Seguridad, ROP, Transacciones ACID, Ledger, Duplicados, Fraccionamiento, Matriz de Aprobación y RBAC.
   - Pregunta 21 actualizada con la justificación del tratamiento condicionado de la diferencia de ₡60 000 y el aislamiento de los ₡1 290 000 de duplicidad.
5. **Diagramas de Arquitectura (`entrega_final/diagramas/`):**
   - `circuito_compras.html` y `circuito_compras.svg`: Flujo corporativo de 10 etapas con matriz económica y Three-Way Match.
   - `diagrama_erd.html` y `diagrama_erd.svg`: Modelo de datos en 3NF con 14 tablas relacionales agrupadas por dominio.

---

### 7. VERIFICACIÓN DE PRUEBAS DE SOFTWARE Y SCRIPT DEMO

#### A. Suite de Pruebas Automatizadas (`cd backend; npm test`):
```
PASS tests/businessRules.test.js
  PRUEBAS EMPRESARIALES OBLIGATORIAS - QUIZ #2
    √ Prueba 1: Cálculo de stock de seguridad para Cemento gris 50 kg (Resultado esperado: 45) (3 ms)
    √ Prueba 2: Cálculo de punto de reorden para Cemento gris 50 kg (Resultado esperado: 165) (1 ms)
    √ Prueba 3: Material bajo punto de reorden genera alerta (Block: 2800 <= 3600) (69 ms)
    √ Prueba 4: Material en estado normal no genera alerta de reposición (Varilla #3: 850 > 800) (25 ms)
    √ Prueba 5: Detección de posible compra duplicada (OC-1041 y OC-1042) (70 ms)
    √ Prueba 6: Movimiento de entrada aumenta existencias en ubicación seleccionada (65 ms)
    √ Prueba 7: Movimiento de salida disminuye existencias en 20 unidades (46 ms)
    √ Prueba 8: Traslado mantiene invariable el stock global y actualiza ambas ubicaciones (74 ms)
    √ Prueba 9: Validación de stock negativo rechaza la transacción con error explícito (38 ms)
    √ Prueba 10: Orden por ₡3 000 000 requiere Gerencia Financiera y 3 cotizaciones (2 ms)
    √ Prueba 11: Detección de posible compra fraccionada (split purchase) (22 ms)
    √ Prueba 12: Trazabilidad completa reconstruye el historial y saldo del material (17 ms)

Test Suites: 1 passed, 1 total | Tests: 12 passed, 12 total | Tiempo: 2.51 s (100% exitosas)
```

#### B. Script de Verificación de Demostración (`node src/utils/verifyDemoScenario.js`):
```
=== VERIFICANDO ESCENARIO DE DEMOSTRACIÓN (10 PASOS) ===
Paso 1: Dashboard y KPIs iniciales... (10 materiales, 5 ubicaciones activas)
Paso 2: Consultando Cemento gris 50 kg... (Stock actual: 190 sacos, ROP: 165 sacos)
Paso 3: Registrando entrada de 50 sacos de cemento en Bodega Central... (Exitoso)
Paso 4: Registrando salida de 20 sacos para obra... (Exitoso)
Paso 5: Verificando nuevo stock calculado... (190 -> Saldo tras (+50 -20): 220 sacos)
Paso 6: Consultando alertas activas de reorden... (Block 2800 <= 3600 y Arena 14 <= 20)
Paso 7: Verificando detección de posible compra duplicada... (OC-1041 vs OC-1042, riesgo ₡1 290 000)
Paso 8: Consultando trazabilidad histórica del Cemento... (Movimientos: 4, Saldo: 220 sacos)
Paso 9 y 10: Evaluando orden de ₡3 000 000 con matriz... (Gerencia Financiera, 3 cotizaciones)
=== ESCENARIO DE DEMOSTRACIÓN VERIFICADO 10/10 CON ÉXITO ===
```

#### C. Estado Final de la Base de Datos MySQL:
- Ejecutada la inicialización limpia con `node src/config/initDb.js`.
- Base de datos `gestion_inventarios` sincronizada en su estado semilla prístino:
  - Cemento gris 50 kg: **190 sacos**.
  - Varilla #3: **850 barras**.
  - Block 12×20×40: **2 800 unidades** (Alerta reorden activa).
  - Arena fina: **14 m³** (Alerta crítica activa).

---

### 8. ASPECTOS PENDIENTES Y RECOMENDACIONES PARA LA PRESENTACIÓN

- **Aspectos Técnicos Pendientes:** **NINGUNO.** El sistema, la base de datos, el backend, el frontend, la documentación y los scripts se encuentran al 100% integrados y funcionales.
- **Recomendación para la Demostración:**
  1. Mantener la terminal del backend corriendo en un terminal separado (`cd backend; npm run dev`).
  2. Mantener el frontend corriendo en otro terminal (`cd frontend; npm run dev`).
  3. Si se ejecutan los tests de Jest antes de la presentación, recordar que estos añadirán movimientos de prueba a MySQL. Para iniciar la demo desde el valor base de 190 sacos, ejecutar previamente:
     ```bash
     cd backend
     npm run db:init
     ```
  4. Tener abierta en el navegador la pestaña del frontend (`http://localhost:3000`), la presentación (`entrega_final/presentacion_quiz2.html`) y el PDF (`entrega_final/informe_quiz2.pdf`) como respaldo visual inmediato.

