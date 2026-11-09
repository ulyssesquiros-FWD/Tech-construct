# INFORME TÉCNICO Y EMPRESARIAL — QUIZ #2: SISTEMA EMPRESARIAL DE GESTIÓN DE INVENTARIOS

**Caso Seleccionado:** Opción 2 — Control de Inventario para una Empresa de Construcción  
**Empresa:** Constructora Del Valle S.A.  
**Arquitectura:** Camino 2 (Backend Propio: Node.js + Express + Sequelize + MySQL + React + Vite)  
**Autor:** Equipo de Desarrollo y Arquitectura Full Stack  
**Fecha:** Noviembre 2026  

---

## 1. Portada y Datos del Proyecto

- **Nombre del Sistema:** Plataforma Corporativa de Gestión de Inventarios, Abastecimiento y Trazabilidad de Materiales.
- **Empresa Ficticia:** Constructora Del Valle S.A. (Cédula Jurídica: 3-101-558899).
- **Alcance Operativo:** Sede Central Alajuela, Bodega Central Coyol, Bodega de Obras Calle Blancos, Obra Norte (Condominio Las Terrazas), Obra Sur (Puente Paso Ancho) y Obra Este (Centro Comercial Escazú).
- **Moneda Base:** Colones costarricenses (₡).

---

## 2. Objetivos del Proyecto

### 2.1. Objetivo General
Desarrollar una solución empresarial integral, funcional y persistente que automatice el control de materiales de construcción entre bodegas y obras, calcule científicamente los puntos de reorden, prevenga compras duplicadas o fraccionadas y garantice la trazabilidad física y documental inmutable de cada insumo.

### 2.2. Objetivos Específicos
1. Documentar y automatizar el circuito de compras de 10 etapas incorporando una matriz de autorización escalonada por montos.
2. Definir una taxonomía corporativa estandarizada de dos niveles para homogeneizar la denominación de materiales y capturar ahorros potenciales por consolidación de volumen.
3. Analizar la fuga de valor en compras fuera de contrato marco y parametrizar un motor de detección preventiva de órdenes duplicadas.
4. Evaluar proveedores mediante matrices multicriterio ponderadas para balancear precio, calidad, cobertura y mitigación de dependencia.
5. Calcular matemáticamente stocks de seguridad y puntos de reorden, priorizando el abastecimiento mediante el indicador de días de cobertura.
6. Construir y verificar una arquitectura full stack profesional (React + Express + MySQL en 3NF) validada con 12 pruebas automatizadas.

---

## 3. Descripción del Problema Empresarial

Constructora Del Valle S.A. experimentaba fricciones operativas y sobrecostos recurrentes derivados de la gestión descentralizada de sus compras y materiales:
- **Dispersión de compras:** Cada frente de obra y taller de mantenimiento solicitaba materiales de forma aislada, utilizando denominaciones ambiguas (por ejemplo: `Cemento gris 50 kg`, `Saco cemento uso general` o `CEM-GRIS-50`), perdiendo el poder de negociación por volumen corporativo.
- **Fuga de valor contractual:** Pese a contar con contratos marco con precios preferenciales (ejemplo: saco de cemento a ₡6 300 con Proveedor A), diversas áreas adquirían el mismo insumo a proveedores secundarios o ferreterías locales a precios de hasta ₡7 100, generando sobrecostos acumulados.
- **Riesgo de duplicidad y pagos dobles:** La falta de cruce de información en compras permitió el ingreso de órdenes idénticas emitidas en la misma fecha (OC-1041 y OC-1042), exponiendo a la empresa a sobreabastecimiento o riesgo de doble facturación.
- **Paralización de obras por quiebre de stock:** La falta de cálculo formal del stock de seguridad y punto de reorden provocaba desabastecimiento repentino de agregados y mampostería, deteniendo cuadrillas y generando sobrecostos por tiempos muertos.

---

## 4. PARTE A — ANÁLISIS DE COMPRAS E INVENTARIO

### EJERCICIO A1 — Circuito de Compra y Matriz de Aprobación

#### Circuito Corporativo de 10 Etapas
1. **Requisición de Materiales:**
   - *Responsable:* Ingeniero residente de obra o encargado de bodega.
   - *Documento Generado:* Requisición Interna de Materiales (RIM).
   - *Control Aplicado:* Verificación de que los materiales correspondan al presupuesto de la obra y no existan en inventario central disponible.
   - *Resultado Esperado:* Solicitud formal justificada y clasificada con código taxonómico.
2. **Aprobación de Requisición:**
   - *Responsable:* Jefatura del área solicitante.
   - *Documento Generado:* Requisición Aprobada (RIM-OK).
   - *Control Aplicado:* Validación contra cronograma de avance y presupuesto asignado.
   - *Resultado Esperado:* Autorización técnica y presupuestaria antes de enviar a Compras.
3. **Solicitud y Comparación de Cotizaciones:**
   - *Responsable:* Departamento de Adquisiciones / Compras.
   - *Documento Generado:* Cuadro Comparativo de Ofertas (CCO).
   - *Control Aplicado:* Comprobación de que la cantidad de cotizaciones cumpla el mínimo fijado por la matriz según el monto estimado.
   - *Resultado Esperado:* Selección transparente de la mejor oferta técnico-económica.
4. **Generación de Orden de Compra (OC):**
   - *Responsable:* Analista de Compras.
   - *Documento Generado:* Orden de Compra en Borrador (OC).
   - *Control Aplicado:* Parametrización en el sistema con precios acordados, condiciones de pago y plazos de entrega en obra.
   - *Resultado Esperado:* Documento vinculante emitido pendiente de autorización formal.
5. **Aprobación de Orden de Compra:**
   - *Responsable:* Autoridad competente según matriz por monto (Jefatura de Compras, Gerencia Financiera o Gerencia General).
   - *Documento Generado:* Orden de Compra Aprobada y Emitida.
   - *Control Aplicado:* Verificación de cotizaciones adjuntas, flujo de fondos y ausencia de fraccionamiento.
   - *Resultado Esperado:* Transmisión formal de la orden al proveedor adjudicado.
6. **Recepción Física de Materiales en Sitio/Bodega:**
   - *Responsable:* Encargado de bodega o receptor de obra.
   - *Documento Generado:* Hoja de Recepción de Materiales (HRM) / Conduce de Entrega.
   - *Control Aplicado:* Conteo físico al 100 %, verificación de empaque, inspección visual de calidad y cotejo contra la OC.
   - *Resultado Esperado:* Aceptación o rechazo documentado en destino.
7. **Validación de Factura Electrónica:**
   - *Responsable:* Departamento de Cuentas por Pagar.
   - *Documento Generado:* Registro Contable de Pasivo y Validación XML Tributaria.
   - *Control Aplicado:* Verificación de datos fiscales, plazo de crédito y precios unitarios.
   - *Resultado Esperado:* Factura validada pendiente de conciliación.
8. **Three-Way Match (Cruce Tripartito Obligatorio):**
   - *Responsable:* Analista de Cuentas por Pagar y Auditoría Interna.
   - *Documento Generado:* Certificado de Conciliación Tripartita (3WM).
   - *Control Aplicado:* Cotejo estricto de que los artículos, cantidades y precios coincidan al 100 % entre la Orden de Compra, la Hoja de Recepción Física y la Factura Comercial.
   - *Resultado Esperado:* Visto bueno para desembolso financiero; bloqueo inmediato ante cualquier discrepancia.
9. **Programación y Pago al Proveedor:**
   - *Responsable:* Tesorería y Gerencia Financiera.
   - *Documento Generado:* Comprobante de Transferencia Bancaria y Recibo de Cancelación.
   - *Control Aplicado:* Cumplimiento de políticas de crédito acordadas (30 a 60 días) aprovechando descuentos por pronto pago.
   - *Resultado Esperado:* Extinción de la obligación financiera en tiempo y forma.
10. **Registro y Actualización Atómica del Inventario:**
    - *Responsable:* Sistema Transaccional / Encargado de Bodega.
    - *Documento Generado:* Asiento de Entrada en Libro Mayor de Inventario (`inventory_movements`).
    - *Control Aplicado:* Incremento automático del stock por ubicación, actualización del saldo y reevaluación del estado de punto de reorden.
    - *Resultado Esperado:* Disponibilidad inmediata de materiales para su uso en obra.

#### Matriz de Aprobación Corporativa

| Rango de Monto en Colones | Autoridad Responsable | Cotizaciones Mínimas Requeridas | Alcance y Controles Específicos |
|---|---|:---:|---|
| **Hasta ₡250 000** | Jefatura del área solicitante | 1 | Compras menores operativas; verificación de presupuesto del área. |
| **₡250 001 a ₡2 000 000** | Jefatura de Compras | 2 | Compras medianas de reposición; cuadro comparativo de 2 ofertas. |
| **₡2 000 001 a ₡10 000 000** | Gerencia Financiera | 3 | Suministros significativos de obra; cuadro de 3 ofertas y validación de liquidez. |
| **Más de ₡10 000 000** | Gerencia General + Comité | 3 + Comité | Licitaciones mayores corporativas; 3 ofertas y acta técnica de comité. |

#### Riesgo de Fraccionamiento de Compras y Controles Preventivos
El **fraccionamiento de compras** (o *smurfing* de adquisiciones) consiste en dividir deliberadamente una necesidad global de compra en múltiples órdenes menores para mantenerse por debajo de los umbrales de aprobación superior, evitando el escrutinio de Compras, la exigencia de múltiples cotizaciones o la autorización de la Gerencia Financiera.

**Controles implementados en el sistema:**
1. *Agrupación acumulativa:* El backend analiza en una ventana móvil de 30 días las órdenes emitidas para el mismo solicitante, proveedor, categoría y proyecto. Si la sumatoria supera un umbral superior (por ejemplo, dos órdenes de ₡1 050 000 que sumadas superan los ₡2 000 000 de Gerencia Financiera), el sistema genera una `split_purchase_alert`.
2. *Alerta preventiva sin bloqueo arbitrario:* La alerta no detiene transacciones operativas urgentes de obra legítimas, pero remite un informe automático a la Jefatura de Compras y Auditoría para su justificación formal.
3. *Auditoría de compras repetitivas:* Supervisión de pedidos de un mismo código taxonómico emitidos en intervalos inferiores a 5 días laborales.

---

### EJERCICIO A2 — Clasificación de Categorías de Gasto y Ahorro Potencial

#### Taxonomía Estandarizada de 2 Niveles
Se diseñó la siguiente taxonomía corporativa:
- **Nivel 1 (Categoría):**
  - `MAT`: Materiales de Construcción
  - `SEG`: Seguridad y Protección Ocupacional
  - `TUB`: Tuberías y Conexiones
  - `HER`: Herramientas Menores
- **Nivel 2 (Subcategoría):**
  - `MAT-CEM`: Cementos y Conglomerantes
  - `MAT-ACE`: Aceros y Perfiles Estructurales
  - `MAT-BLO`: Mampostería y Bloques
  - `MAT-AGR`: Agregados y Arenas
  - `SEG-GUA`: Guantes y Protección de Manos
  - `TUB-PVC`: Tuberías de PVC y Accesorios

#### Clasificación y Análisis de las 8 Líneas de Gasto

| # | Descripción Original | Área | Prov. | Cant. | Precio Unit. | Gasto Actual (₡) | Código Estándar | Categoría / Subcategoría | Precio Mín. (₡) |
|---|---|---|:---:|---:|---:|---:|---|---|---:|
| 1 | Cemento gris 50 kg | Obras | A | 200 | ₡6 450 | ₡1 290 000 | `MAT-CEM-GRIS-050` | MAT / MAT-CEM | ₡6 300 |
| 2 | Saco cemento uso general | Mantenimiento | B | 40 | ₡7 100 | ₡284 000 | `MAT-CEM-USO-GEN` | MAT / MAT-CEM | ₡6 300 |
| 3 | CEM-GRIS-50 | Bodega | A | 300 | ₡6 300 | ₡1 890 000 | `MAT-CEM-GRIS-050` | MAT / MAT-CEM | ₡6 300 |
| 4 | Varilla #3 grado 40 | Obras | C | 500 | ₡2 150 | ₡1 075 000 | `MAT-ACE-VAR-003` | MAT / MAT-ACE | ₡2 150 |
| 5 | Hierro 3/8 x 6 m | Mantenimiento | D | 60 | ₡2 600 | ₡156 000 | `MAT-ACE-VAR-003`* | MAT / MAT-ACE | ₡2 150 |
| 6 | Guantes nitrilo talla L | Bodega | E | 100 | ₡850 | ₡85 000 | `SEG-GUA-NIT-L` | SEG / SEG-GUA | ₡850 |
| 7 | Guantes trabajo L | Obras | F | 80 | ₡1 200 | ₡96 000 | `SEG-GUA-TRA-L` | SEG / SEG-GUA | ₡1 200 |
| 8 | Tubo PVC 1/2 SDR 13.5 | Mantenimiento | B | 25 | ₡2 900 | ₡72 500 | `TUB-PVC-012-SDR135`| TUB / TUB-PVC | ₡2 900 |
| **Total** | | | | | | **₡4 952 500** | | | |

#### Análisis de Equivalencias Técnicas y Cálculo de Ahorro Potencial

1. **Familia Cemento Gris (Líneas 1, 2 y 3):**
   - *Total de unidades:* $200 + 40 + 300 = 540\text{ sacos}$.
   - *Gasto observado actual:* $\text{₡}1\,290\,000 + \text{₡}284\,000 + \text{₡}1\,890\,000 = \text{₡}3\,464\,000$.
   - *Precio mínimo observado (Línea 3):* ₡6 300 por saco.
   - *Gasto al precio mínimo:* $540 \times \text{₡}6\,300 = \text{₡}3\,402\,000$.
   - **Ahorro potencial en cemento:**
     $$\text{Ahorro}_{\text{cemento}} = \text{₡}3\,464\,000 - \text{₡}3\,402\,000 = \mathbf{\text{₡}62\,000}$$

2. **Familia Varilla / Hierro 3/8 (Líneas 4 y 5):**
   - *Total de unidades:* $500 + 60 = 560\text{ barras}$.
   - *Gasto observado actual:* $\text{₡}1\,075\,000 + \text{₡}156\,000 = \text{₡}1\,231\,000$.
   - *Precio mínimo observado (Línea 4):* ₡2 150 por barra.
   - *Gasto al precio mínimo:* $560 \times \text{₡}2\,150 = \text{₡}1\,204\,000$.
   - **Ahorro potencial en varilla:**
     $$\text{Ahorro}_{\text{varilla}} = \text{₡}1\,231\,000 - \text{₡}1\,204\,000 = \mathbf{\text{₡}27\,000}$$
   > **Validación Técnica Obligatoria:** La homologación de la línea 5 está estrictamente sujeta a comprobar en laboratorio o ficha técnica que el "Hierro 3/8 x 6 m" adquirido por Mantenimiento cumple con las especificaciones de acero corrugado estructural Grado 40 (norma ASTM A615). De no ser estructuralmente idéntico, no debe mezclarse con la varilla de obra.

3. **Líneas 6 y 7 (Guantes de Seguridad):**
   - Aunque ambos son guantes de protección talla L, **NO deben considerarse equivalentes**. Los guantes de nitrilo (`SEG-GUA-NIT-L`) ofrecen resistencia química a solventes y fluidos, mientras que los guantes de trabajo (`SEG-GUA-TRA-L`) son de carnaza/cuero para protección contra abrasión mecánica en obra pesada. No procede consolidación económica forzada.

4. **Ahorro Potencial Total Consolidado:**
   $$\text{Ahorro Total} = \text{₡}62\,000 + \text{₡}27\,000 = \mathbf{\text{₡}89\,000}$$

#### ¿Por qué una Taxonomía Estándar Aumenta el Poder de Negociación?
Cuando una organización no cuenta con códigos homogéneos, los proveedores perciben a cada departamento como un comprador pequeño e inconexo, aplicando precios minoristas o compras spot. La taxonomía estándar permite consolidar el volumen global de demanda de toda la empresa en licitaciones marco, eliminando sobrecostos, simplificando la gestión de inventarios y habilitando contratos de suministro con precios fijos descontados.

---

### EJERCICIO A3 — Análisis de Gasto y Fuga de Valor

**Condiciones Contractuales Vigentes con Proveedor A:**
- Cemento gris 50 kg: **₡6 300** por saco.
- Varilla #3: **₡2 050** por barra.

#### Análisis Detallado de las 7 Órdenes de Compra

| OC | Fecha | Área | Prov. | Artículo | Cant. | Precio Pagado | Precio Contrato | Sobreprecio Unit. | Sobreprecio Total | Condición Operativa |
|---|---|---|:---:|---|---:|---:|---:|---:|---:|---|
| **OC-1041** | 02/10 | Obras | A | Cemento gris 50 kg | 200 | ₡6 450 | ₡6 300 | ₡150 | **₡30 000** | Facturado sobre precio pactado. |
| **OC-1042** | 02/10 | Obras | A | Cemento gris 50 kg | 200 | ₡6 450 | ₡6 300 | ₡150 | **₡30 000** | Posible duplicada con OC-1041. |
| **OC-1047** | 06/10 | Mantenimiento | B | Cemento gris 50 kg | 40 | ₡7 100 | ₡6 300 | ₡800 | **₡32 000** | Compra fuera de contrato a Prov. B. |
| **OC-1050** | 08/10 | Obras | C | Varilla #3 | 500 | ₡2 150 | ₡2 050 | ₡100 | **₡50 000** | Adquisición a Proveedor C no contratado. |
| **OC-1053** | 09/10 | Obras | C | Varilla #3 | 480 | ₡2 150 | ₡2 050 | ₡100 | **₡48 000** | Adquisición a Proveedor C no contratado. |
| **OC-1058** | 13/10 | Mantenimiento | D | Varilla #3 | 60 | ₡2 600 | ₡2 050 | ₡550 | **₡33 000** | Compra spot a ferretería con alto margen. |
| **OC-1061** | 15/10 | Bodega | A | Cemento gris 50 kg | 300 | ₡6 300 | ₡6 300 | ₡0 | **₡0** | Compra conforme a contrato. |
| **Totales** | | | | | | | | | **₡223 000** | |

#### Cálculos y Fuga de Valor
- **Sobreprecio Total Mensual:**
  $$\text{Fuga Total} = 30\,000 + 30\,000 + 32\,000 + 50\,000 + 48\,000 + 33\,000 + 0 = \mathbf{\text{₡}223\,000}$$
- **Proyección Anual Simple:**
  $$\text{Fuga Anual} = \text{₡}223\,000 \times 12 = \mathbf{\text{₡}2\,676\,000}$$

#### Exposición Económica por Posible Compra Duplicada (OC-1041 y OC-1042)
Las órdenes **OC-1041** y **OC-1042** comparten fecha de emisión (02/10), proveedor (Proveedor A), artículo (Cemento gris 50 kg) y cantidad idéntica (200 sacos).
- *Exposición económica en riesgo:*
  $$\text{Exposición} = 200 \times \text{₡}6\,450 = \mathbf{\text{₡}1\,290\,000}$$
- **Tratamiento Financiero y Auditoría:**
  No se debe sumar automáticamente el valor completo de la orden al sobreprecio de ₡223 000. La posible duplicidad representa un **riesgo de liquidez y sobreabastecimiento** de ₡1 290 000 que requiere auditar la recepción física en obra, validar si existió doble facturación del proveedor y determinar si correspondía a un frente de colado extraordinario o a un error humano de digitación.

#### Diferenciación Conceptual Rigurosa
1. **Precio superior al precio contractual:** Facturación del proveedor contratado (Proveedor A) por encima de la tarifa pactada (₡6 450 vs ₡6 300). Aplica nota de crédito inmediata.
2. **Compra realizada a un proveedor diferente:** Compra a proveedores no homologados (B, C, D) por falta de previsión o fallas logísticas del proveedor principal.
3. **Posible compra duplicada:** Órdenes simultáneas idénticas que ameritan revisión documental y verificación física de ingreso.
4. **Compra que requiere revisión documental:** Despachos de urgencia donde la factura carece de hoja de recepción formal en obra.

---

### EJERCICIO A4 — Evaluación de Proveedores

Construcción de matriz multicriterio ponderada con supuestos académicos para tres proveedores referenciales del mercado costarricense: **Novex S.A.**, **Construplaza S.A.** y **EPA S.A.** (Escala 1 a 5).

#### Matriz Ponderada de Evaluación

| Criterio de Selección | Peso | Novex S.A. | Construplaza S.A. | EPA S.A. |
|---|:---:|:---:|:---:|:---:|
| **Precio y Condiciones de Descuento** | 25 % | 4.0 (1.000) | 3.5 (0.875) | 4.5 (1.125) |
| **Calidad de Materiales y Certificaciones** | 25 % | 4.5 (1.125) | 4.8 (1.200) | 4.0 (1.000) |
| **Cumplimiento de Plazos en Obra** | 20 % | 4.0 (0.800) | 4.5 (0.900) | 3.8 (0.760) |
| **Condiciones de Crédito Comercial** | 10 % | 4.0 (0.400) | 4.2 (0.420) | 3.5 (0.350) |
| **Servicio Posventa y Devoluciones** | 10 % | 3.8 (0.380) | 4.6 (0.460) | 3.9 (0.390) |
| **Cobertura Geográfica y Logística** | 5 % | 4.0 (0.200) | 4.0 (0.200) | 4.8 (0.240) |
| **Riesgo de Dependencia y Capacidad** | 5 % | 4.0 (0.200) | 4.5 (0.225) | 4.0 (0.200) |
| **Puntaje Ponderado Total** | **100 %** | **4.105** | **4.280** | **4.065** |

#### Fórmula de Puntuación Ponderada
$$P_j = \sum_{i=1}^{n} (W_i \times C_{ij})$$
Donde $W_i$ es el peso del criterio $i$ y $C_{ij}$ es la calificación del proveedor $j$ en dicho criterio.

#### Conclusión Empresarial y Estrategia de Mitigación de Riesgos
- **Proveedor Principal (70 % de asignación): Construplaza S.A. (4.280 pts).**
  Presenta el mejor desempeño en los criterios más críticos para obras de infraestructura: calidad técnica garantizada, puntualidad en descarga en frente de obra y un sistema ágil de posventa para reposición de piezas defectuosas.
- **Proveedor Secundario (30 % de asignación): EPA S.A. (4.065 pts).**
  Posee la mayor calificación en precios competitivos y cobertura logística gracias a sus múltiples centros de distribución en el GAM.
- **Razón Estratégica:** Asignar el 100 % a un solo proveedor generaría un riesgo severo de dependencia y vulnerabilidad ante huelgas, problemas de importación o escasez de materia prima. La estrategia 70/30 mantiene presión competitiva sobre los precios y asegura disponibilidad continua para las obras.

---

### EJERCICIO A5 — Niveles de Stock, Punto de Reorden y Prioridad de Reposición

#### Fórmulas de Gestión de Inventarios
- **Stock de Seguridad ($SS$):**
  $$SS = (D_{\text{máx}} - D_{\text{prom}}) \times L$$
- **Punto de Reorden ($ROP$):**
  $$ROP = (D_{\text{prom}} \times L) + SS$$
- **Días de Cobertura ($DC$):**
  $$DC = \frac{\text{Stock Actual}}{D_{\text{prom}}}$$

#### Resultados de Referencia Calculados

| Material | $D_{\text{prom}}$ | $D_{\text{máx}}$ | Entrega ($L$) | Stock Seguridad ($SS$) | Punto Reorden ($ROP$) | Stock Actual | Días Cobertura | Estado Operativo | Prioridad |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Cemento gris 50 kg** | 40 | 55 | 3 días | $(55-40)\times 3 = \mathbf{45}$ | $(40\times 3)+45 = \mathbf{165}$ | 190 | 4.75 días | Normal ($190 > 165$) | 3 (Monitoreo) |
| **Varilla #3 grado 40** | 120 | 160 | 5 días | $(160-120)\times 5 = \mathbf{200}$ | $(120\times 5)+200 = \mathbf{800}$ | 850 | 7.08 días | Normal ($850 > 800$) | 4 (Estable) |
| **Block 12 × 20 × 40** | 600 | 900 | 4 días | $(900-600)\times 4 = \mathbf{1\,200}$ | $(600\times 4)+1200 = \mathbf{3\,600}$ | 2 800 | 4.67 días | **Reponer** ($2\,800 \le 3\,600$) | 2 (Alta) |
| **Arena fina (m³)** | 6 | 10 | 2 días | $(10-6)\times 2 = \mathbf{8}$ | $(6\times 2)+8 = \mathbf{20}$ | 14 | 2.33 días | **Reponer** ($14 \le 20$) | **1 (Crítica)** |

#### Análisis de Priorización de la Reposición
Aunque tanto el Block de concreto como la Arena fina se encuentran bajo su punto de reorden, **la Arena fina representa la máxima urgencia operativa**:
1. **Arena fina (2.33 días de inventario restante):** Con un tiempo de entrega de 2 días y solo 2.33 días de cobertura, si la orden de compra no se emite de inmediato, cualquier incremento en el consumo o retraso menor del transportista paralizará las cuadrillas de mortero y repello.
2. **Block de concreto (4.67 días de inventario restante):** Con un tiempo de entrega de 4 días y 4.67 días de cobertura, existe un margen de maniobra de apenas 0.67 días (~16 horas laborales) antes de agotar el inventario de seguridad. Debe colocarse el pedido en el transcurso del día.

#### Trazabilidad Requerida en el Ciclo Físico
- **Entradas:** Registro inmutable del número de orden de compra, proveedor, lote, factura comercial, cantidad recibida y bodega de ingreso.
- **Salidas:** Identificación de la cuadrilla, subcontratista o frente de obra, número de requisición y justificación técnica.
- **Traslados:** Operación atómica con enlace bidireccional mediante `transfer_group_id` para garantizar que la disminución en bodega de origen y el incremento en bodega de destino coincidan exactamente.
- **Ajustes:** Registro de actas de conteo físico indicando motivo de merma o sobrante, usuario auditor y balance resultante.

---

## 5. PARTE B — DESCRIPCIÓN DE LA SOLUCIÓN Y ARQUITECTURA TÉCNICA

### 5.1. Arquitectura del Sistema
El sistema se implementó siguiendo una arquitectura desacoplada Full Stack de tres capas:
1. **Capa de Presentación (Frontend):**
   - Single Page Application (SPA) desarrollada con **React 18** y **Vite**.
   - Gráficos empresariales en tiempo real con **Recharts** (barras comparativas de $Stock$ vs $ROP$, distribución de categorías y evolución temporal de movimientos).
   - Componentes modulares y reutilizables con feedback interactivo (toasts, modales accesibles y validación en vivo de formularios).
2. **Capa de Servicios y Negocio (Backend):**
   - Servidor **Node.js** con framework **Express 4.21**.
   - Arquitectura por capas: Controladores $\to$ Servicios de Negocio $\to$ Modelos Sequelize $\to$ Validadores.
   - Motores de negocio especializados: `reorderService`, `approvalMatrixService`, `duplicateDetectionService`, `splitPurchaseService`, `inventoryService` y `traceabilityService`.
3. **Capa de Persistencia de Datos (MySQL):**
   - Base de datos relacional independiente `gestion_inventarios`.
   - Normalización estricta en **Tercera Forma Normal (3NF)**.
   - Enfoque de **Libro Mayor Inmutable (Ledger)** para asegurar que el inventario nunca se desincronice.

### 5.2. Reglas de Negocio Implementadas
- **Cálculo de Punto de Reorden en Backend:** Ningún usuario puede ingresar o alterar manualmente el punto de reorden en la base de datos; este se calcula a través de hooks de Sequelize en el modelo `Material`.
- **Prevención de Stock Negativo:** Antes de procesar cualquier salida o traslado, el servicio `inventoryService` consulta el balance del ledger; si la cantidad solicitada supera las existencias físicas en la ubicación, la transacción es rechazada de inmediato.
- **Transacciones ACID en Traslados:** Los traslados entre bodegas ejecutan la salida de origen y la entrada de destino de forma indivisible. Si ocurre algún error en el proceso, se ejecuta un rollback total.
- **Matriz de Autorización Vinculante:** Ninguna orden de compra puede avanzar a estado `aprobada` o `emitida` si no cumple con las firmas correspondientes al monto o no adjunta el número mínimo de cotizaciones.
- **Detección Automática de Duplicados:** Escaneo cruzado de órdenes que evalúa igualdad de proveedor, artículo, tolerancia de cantidad $\le 10\%$ y ventana temporal $\le 3$ días.

---

## 6. RESULTADOS DE LAS PRUEBAS AUTOMATIZADAS

Se diseñó e implementó una suite integral de 12 pruebas automatizadas en Jest (`backend/tests/businessRules.test.js`) ejecutadas directamente contra la base de datos MySQL:

| # | Prueba Obligatoria | Entradas / Escenario | Resultado Obtenido | Estado |
|---|---|---|---|:---:|
| 1 | Cálculo Stock Seguridad | Cemento: Demanda máx 55, prom 40, entrega 3 días | 45 sacos exactos | **PASADO** |
| 2 | Cálculo Punto Reorden | Cemento: Demanda prom 40, entrega 3, SS 45 | 165 sacos exactos | **PASADO** |
| 3 | Material Bajo ROP | Block: Stock 2 800 vs ROP 3 600 | Alerta activa generada en MySQL | **PASADO** |
| 4 | Material Normal | Varilla: Stock 850 vs ROP 800 | Estado 'NORMAL', sin alerta | **PASADO** |
| 5 | Compra Duplicada | OC-1041 y OC-1042 (Proveedor A, Cemento, 200 cant) | Alerta con riesgo crítico y ₡1 290 000 | **PASADO** |
| 6 | Movimiento Entrada | Entrada de 100 sacos de cemento en Bodega Central | Stock incrementó exactamente en 100 | **PASADO** |
| 7 | Movimiento Salida | Salida de 20 sacos de cemento en Bodega Central | Stock disminuyó exactamente en 20 | **PASADO** |
| 8 | Traslado Atómico | Traslado de 15 sacos de Bodega Central a Obra Norte | Origen -15, Destino +15, Global invariable | **PASADO** |
| 9 | Validación Stock Negativo | Retiro de existencias superiores al stock disponible | Transacción rechazada con excepción | **PASADO** |
| 10 | Matriz de Aprobación | Orden por ₡3 000 000 | Asignada a Gerencia Financiera (3 cotizaciones) | **PASADO** |
| 11 | Compra Fraccionada | Órdenes que individualmente < ₡2M pero sumadas > ₡2M | Alerta de fraccionamiento generada | **PASADO** |
| 12 | Trazabilidad Integral | Historial cronológico de Cemento gris | Reconstrucción completa con documentos y saldos | **PASADO** |

---

## 7. CONCLUSIONES GENERALES

1. **Gobernanza y Ahorro Comprobado:** La estandarización taxonómica demostró un potencial de ahorro directo de **₡89 000** en insumos de alta rotación, mientras que el control de contratos previene una fuga de valor proyectada en **₡2 676 000** anuales.
2. **Integridad Transaccional Inviolable:** Al adoptar el modelo de libro mayor (ledger) con transacciones ACID, se eliminó la posibilidad de que existan stocks negativos o saldos huérfanos sin documento de respaldo.
3. **Continuidad Operativa Garantizada:** El cálculo científico de stocks de seguridad y puntos de reorden, junto con el análisis de días de cobertura, proporciona a la gerencia la capacidad de anticiparse a quiebres de inventario, protegiendo el avance físico y financiero de las obras de construcción.
4. **Cumplimiento Integral de Criterios:** El software entregado es 100 % funcional, persistente en MySQL, robusto y verificable en todas sus capas, cumpliendo a cabalidad con la totalidad de los requisitos del **Quiz #2**.
