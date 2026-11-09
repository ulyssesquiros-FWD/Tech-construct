# SISTEMA EMPRESARIAL DE GESTIÓN DE INVENTARIOS Y ABASTECIMIENTO
## INFORME TÉCNICO, ANALÍTICO Y ARQUITECTÓNICO — QUIZ #2

---

**Institución:** Universidad Técnica / Facultad de Ingeniería Informática  
**Curso:** Desarrollo Backend y Arquitectura de Bases de Datos Relacionales  
**Empresa de Estudio:** Constructora Del Valle S.A. (Entidad y Cédula Jurídica Ficticias para Fines Académicos: 3-101-558899)  
**Caso Seleccionado:** Opción 2 — Control de Inventario para una Empresa de Construcción  
**Modalidad Tecnológica:** Camino 2 (Backend Propio: Node.js + Express + Sequelize + MySQL + React + Vite)  
**Moneda del Sistema:** Colones costarricenses (₡)  
**Fecha de Entrega:** Noviembre 2026  

---

## TABLA DE CONTENIDO (ÍNDICE)

1. [PORTADA Y DATOS DEL PROYECTO](#1-portada-y-datos-del-proyecto)
2. [OBJETIVOS EMPRESARIALES Y DEL SISTEMA](#2-objetivos-empresariales-y-del-sistema)
3. [DESCRIPCIÓN DEL PROBLEMA OPERATIVO Y FINANCIERO](#3-descripción-del-problema-operativo-y-financiero)
4. [PARTE A — ANÁLISIS DE COMPRAS E INVENTARIOS](#4-parte-a--análisis-de-compras-e-inventarios)
   - 4.1. [Ejercicio A1: Circuito de Compra y Matriz de Aprobación](#ejercicio-a1--circuito-de-compra-y-matriz-de-aprobación)
   - 4.2. [Ejercicio A2: Taxonomía y Ahorro Potencial](#ejercicio-a2--clasificación-de-categorías-de-gasto-y-ahorro-potencial)
   - 4.3. [Ejercicio A3: Análisis Financiero, Fuga de Valor y Duplicados](#ejercicio-a3--análisis-de-gasto-y-fuga-de-valor)
   - 4.4. [Ejercicio A4: Matriz Ponderada de Proveedores](#ejercicio-a4--evaluación-multicriterio-de-proveedores)
   - 4.5. [Ejercicio A5: Stock de Seguridad, ROP y Días de Cobertura](#ejercicio-a5--niveles-de-stock-punto-de-reorden-y-priorización)
5. [PARTE B — ARQUITECTURA TÉCNICA Y DESARROLLO DEL SISTEMA](#5-parte-b--arquitectura-técnica-y-desarrollo-del-sistema)
   - 5.1. [Arquitectura de Tres Capas](#51-arquitectura-de-tres-capas)
   - 5.2. [Modelo de Datos en 3NF y Principio del Ledger](#52-modelo-de-datos-en-3nf-y-principio-del-ledger)
   - 5.3. [Servicios y Motores de Reglas de Negocio](#53-servicios-y-motores-de-reglas-de-negocio)
   - 5.4. [Diagramas de Arquitectura (ERD y Circuito)](#54-diagramas-de-arquitectura)
6. [RESULTADOS Y VERIFICACIÓN DE PRUEBAS AUTOMATIZADAS](#6-resultados-y-verificación-de-pruebas-automatizadas)
7. [CONCLUSIONES Y RECOMENDACIONES ESTRATÉGICAS](#7-conclusiones-y-recomendaciones-estratégicas)

---

## 1. Portada y Datos del Proyecto

El presente proyecto entrega una solución corporativa terminada, funcional y auditable para la empresa **Constructora Del Valle S.A.**, dedicada a la edificación de obras civiles, infraestructura vial y proyectos comerciales en Costa Rica.

- **Centros de Almacenamiento y Obras Monitoreadas:**
  - *Bodega Central:* Parque Logístico Coyol, Alajuela (Centro de Distribución Primario).
  - *Bodega de Obras:* Calle Blancos, San José (Taller y Encofrados).
  - *Obra Norte:* Condominio Residencial Las Terrazas, San Isidro de Heredia.
  - *Obra Sur:* Paso a Desnivel y Puente Paso Ancho, San José.
  - *Obra Este:* Centro Comercial Multiplaza Este, Guachipelín de Escazú.
- **Entorno Técnico:** Node.js v22, Express 4.21, Sequelize 6.37, MySQL 9.6, React 18, Vite 5.4, Recharts 2.15, Jest 29.7.

---

## 2. Objetivos Empresariales y del Sistema

### 2.1. Objetivo General
Diseñar, desarrollar y desplegar una plataforma Full Stack empresarial persistida en MySQL para el control riguroso de compras, inventarios por ubicación, cálculo automático de puntos de reorden, prevención de compras duplicadas o fraccionadas y trazabilidad inmutable de materiales de construcción.

### 2.2. Objetivos Específicos
1. Formalizar y codificar el circuito de abastecimiento de 10 etapas con una matriz de firmas vinculante basada en umbrales económicos.
2. Establecer una taxonomía normalizada de dos niveles para erradicar la duplicidad de compras y capturar ₡89 000 en ahorros potenciales.
3. Cuantificar con precisión analítica la fuga de valor en compras, diferenciando los incumplimientos de contrato con el Proveedor A de las compras discrecionales a terceros y aislando la exposición por duplicidad.
4. Implementar un modelo de datos en Tercera Forma Normal (3NF) bajo la metodología de libro mayor inmutable (*ledger*), impidiendo la generación de existencias negativas.
5. Ejecutar y documentar una suite de 12 pruebas automatizadas comprobando las reglas matemáticas de stock y compras.

---

## 3. Descripción del Problema Operativo y Financiero

Constructora Del Valle S.A. enfrentaba fallas estructurales en el control de materiales que amenazaban la rentabilidad de sus contratos:
1. **Descentralización y compra desarticulada:** Los ingenieros de obra y encargados de mantenimiento adquirían insumos por cuenta propia utilizando descripciones coloquiales o códigos de proveedor no estandarizados, fragmentando el volumen de compra.
2. **Incumplimiento de tarifas pactadas:** A pesar de haber negociado un contrato marco con el Proveedor A con tarifas preferenciales fijas (₡6 300 por saco de cemento y ₡2 050 por varilla #3), se detectaron facturas aprobadas por encima del precio contractual y compras recurrentes a ferreterías locales con márgenes abusivos.
3. **Vulnerabilidad por órdenes duplicadas:** La falta de validación cruzada permitió emitir dos órdenes idénticas en la misma fecha (OC-1041 y OC-1042), exponiendo a la empresa a un sobrepago de ₡1 290 000.
4. **Quiebres de stock en faenas críticas:** Al carecer de cálculos de stock de seguridad y puntos de reorden fundamentados en demanda y tiempos de entrega, frentes de colado quedaban varados por falta de arena o bloques, provocando sobrecostos por cuadrillas ociosas y penalizaciones por atraso.

---

## 4. PARTE A — ANÁLISIS DE COMPRAS E INVENTARIOS

### EJERCICIO A1 — Circuito de Compra y Matriz de Aprobación

#### Circuito Corporativo de 10 Etapas
El flujo de abastecimiento se estructuró para garantizar segregación de funciones, control previo y control posterior:

```
[1. Requisición] ➔ [2. Aprob. Requisición] ➔ [3. Cuadro Cotizaciones] ➔ [4. Generación OC]
       ➔ [5. Aprobación OC por Matriz] ➔ [6. Recepción Física en Obra] ➔ [7. Validación Factura]
       ➔ [8. Three-Way Match Obligatorio] ➔ [9. Pago a Proveedor] ➔ [10. Asiento Atómico en Ledger]
```

1. **Requisición de Materiales:** Generada por el residente de obra con código estándar y justificación técnica.
2. **Aprobación de Requisición:** Validación técnica por la jefatura del área frente al presupuesto de la obra.
3. **Solicitud y Comparación de Cotizaciones:** Compras solicita ofertas formales cumpliendo el número mínimo según el monto.
4. **Generación de Orden de Compra (OC):** Elaboración del documento vinculante en estado borrador.
5. **Aprobación de Orden de Compra:** Autorización por la jefatura o gerencia según la matriz económica.
6. **Recepción de Materiales:** Conteo físico al 100 %, inspección de calidad e ingreso documentado con Hoja de Recepción.
7. **Validación de Factura:** Cuentas por Pagar comprueba validez tributaria y concordancia de precios.
8. **Three-Way Match (Conciliación Tripartita):** Validación cruzada obligatoria: **Orden de Compra = Recepción Física = Factura**.
9. **Pago al Proveedor:** Desembolso programado según plazos comerciales acordados.
10. **Registro y Actualización en Inventario:** Asiento inmutable en el libro mayor (`inventory_movements`) actualizando existencias.

#### Matriz de Aprobación de Compras

| Rango de Monto en Colones (₡) | Autoridad Competente | Cotizaciones Mínimas | Control y Documento Requerido |
|---|---|:---:|---|
| **Hasta ₡250 000** | Jefatura del área solicitante | 1 | Presupuesto operativo; cotización única de proveedor de catálogo. |
| **₡250 001 a ₡2 000 000** | Jefatura de Compras | 2 | Cuadro comparativo formal con 2 cotizaciones vigentes. |
| **₡2 000 001 a ₡10 000 000** | Gerencia Financiera | 3 | Análisis de liquidez y cuadro comparativo de 3 proveedores. |
| **Más de ₡10 000 000** | Gerencia General + Comité | 3 + Comité | Licitación corporativa, 3 ofertas y dictamen técnico de comité. |

#### Riesgo de Fraccionamiento y Controles Preventivos
El **fraccionamiento de compras** ocurre cuando un funcionario subdivide una adquisición en órdenes consecutivas menores para evitar escalar a una autorización superior.

**Controles implementados:**
- **Agrupador acumulativo en ventana móvil:** El backend analiza compras emitidas en un lapso de 30 días para un mismo proveedor, área y proyecto. Si la sumatoria supera ₡2 000 000 (Gerencia Financiera) o ₡250 000 (Jefatura de Compras), se dispara una `split_purchase_alert`.
- **Revisión documental:** La alerta se remite a Compras y Auditoría para justificación técnica, evitando frenar operaciones legítimas pero documentando la anomalía.

---

### EJERCICIO A2 — Clasificación de Categorías de Gasto y Ahorro Potencial

Se implementó una taxonomía jerárquica de dos niveles:
- **Nivel 1:** Categorías maestras (`MAT` Materiales, `SEG` Seguridad, `TUB` Tuberías, `HER` Herramientas).
- **Nivel 2:** Subcategorías (`MAT-CEM` Cementos, `MAT-ACE` Aceros, `MAT-BLO` Mampostería, `MAT-AGR` Agregados, `SEG-GUA` Guantes, `TUB-PVC` Tuberías).

#### Clasificación y Análisis de las 8 Líneas de Insumos

| # | Descripción Original | Área | Prov. | Cant. | Precio Unit. | Gasto Total (₡) | Código Estandarizado | Precio Mín. (₡) | Ahorro Potencial (₡) |
|---|---|---|:---:|---:|---:|---:|---|---:|---:|
| 1 | Cemento gris 50 kg | Obras | A | 200 | ₡6 450 | ₡1 290 000 | `MAT-CEM-GRIS-050` | ₡6 300 | ₡30 000 |
| 2 | Saco cemento uso general | Mantenimiento | B | 40 | ₡7 100 | ₡284 000 | `MAT-CEM-USO-GEN` | ₡6 300 | ₡32 000 |
| 3 | CEM-GRIS-50 | Bodega | A | 300 | ₡6 300 | ₡1 890 000 | `MAT-CEM-GRIS-050` | ₡6 300 | ₡0 |
| 4 | Varilla #3 grado 40 | Obras | C | 500 | ₡2 150 | ₡1 075 000 | `MAT-ACE-VAR-003` | ₡2 150 | ₡0 |
| 5 | Hierro 3/8 x 6 m | Mantenimiento | D | 60 | ₡2 600 | ₡156 000 | `MAT-ACE-VAR-003`* | ₡2 150 | ₡27 000 |
| 6 | Guantes nitrilo talla L | Bodega | E | 100 | ₡850 | ₡85 000 | `SEG-GUA-NIT-L` | ₡850 | - |
| 7 | Guantes trabajo L | Obras | F | 80 | ₡1 200 | ₡96 000 | `SEG-GUA-TRA-L` | ₡1 200 | - |
| 8 | Tubo PVC 1/2 SDR 13.5 | Mantenimiento | B | 25 | ₡2 900 | ₡72 500 | `TUB-PVC-012-SDR135`| ₡2 900 | - |
| **Totales** | | | | | | **₡4 952 500** | | | **₡89 000** |

#### Justificación y Cálculos de Ahorro
1. **Familia Cemento Gris (540 sacos):** Gasto actual de ₡3 464 000. Al precio mínimo observado de ₡6 300: $540 \times \text{₡}6\,300 = \text{₡}3\,402\,000$.  
   $$\text{Ahorro en Cemento} = \text{₡}3\,464\,000 - \text{₡}3\,402\,000 = \mathbf{\text{₡}62\,000}$$
2. **Familia Varilla / Hierro 3/8 (560 barras):** Gasto actual de ₡1 231 000. Al precio mínimo observado de ₡2 150: $560 \times \text{₡}2\,150 = \text{₡}1\,204\,000$.  
   $$\text{Ahorro en Varilla} = \text{₡}1\,231\,000 - \text{₡}1\,204\,000 = \mathbf{\text{₡}27\,000}$$
   > **Validación Técnica:** Este ahorro está condicionado a certificar que el hierro comercial de Mantenimiento cumple la norma ASTM A615 Grado 40. De lo contrario, no debe sustituir varilla estructural.
3. **No Homologación de Guantes:** Los guantes de nitrilo protegen contra químicos; los de trabajo son de carnaza para abrasión física. No procede consolidación técnica.
4. **Ahorro Consolidado Total:** $\text{₡}62\,000 + \text{₡}27\,000 = \mathbf{\text{₡}89\,000}$.

---

### EJERCICIO A3 — Análisis de Gasto y Fuga de Valor

**Condiciones Contractuales Vigentes con Proveedor A:**
- Saco Cemento gris 50 kg: **₡6 300**
- Varilla #3: **₡2 050**

#### Desagregación Analítica de las 7 Órdenes de Compra

| OC | Fecha | Área | Prov. | Artículo | Cant. | Precio Pagado | Precio Ref. | Desviación Unit. | Desviación Total (₡) | Clasificación Financiera |
|---|---|---|:---:|---|---:|---:|---:|---:|---:|---|
| **OC-1041** | 02/10 | Obras | A | Cemento gris 50 kg | 200 | ₡6 450 | ₡6 300 | +₡150 | **₡30 000** | **Incumplimiento de contrato Proveedor A** (Sospecha duplicado) |
| **OC-1042** | 02/10 | Obras | A | Cemento gris 50 kg | 200 | ₡6 450 | ₡6 300 | +₡150 | **₡30 000** | **Incumplimiento de contrato Proveedor A** (Sospecha duplicado) |
| **OC-1047** | 06/10 | Mantenimiento | B | Cemento gris 50 kg | 40 | ₡7 100 | ₡6 300 | +₡800 | **₡32 000** | **Desviación compra fuera de contrato (Prov. B)** |
| **OC-1050** | 08/10 | Obras | C | Varilla #3 | 500 | ₡2 150 | ₡2 050 | +₡100 | **₡50 000** | **Desviación compra fuera de contrato (Prov. C)** |
| **OC-1053** | 09/10 | Obras | C | Varilla #3 | 480 | ₡2 150 | ₡2 050 | +₡100 | **₡48 000** | **Desviación compra fuera de contrato (Prov. C)** |
| **OC-1058** | 13/10 | Mantenimiento | D | Varilla #3 | 60 | ₡2 600 | ₡2 050 | +₡550 | **₡33 000** | **Desviación compra spot minorista (Prov. D)** |
| **OC-1061** | 15/10 | Bodega | A | Cemento gris 50 kg | 300 | ₡6 300 | ₡6 300 | ₡0 | **₡0** | **Compra conforme a contrato marco** |

#### Subtotales Analíticos y Proyección Financiera
1. **Diferencias Respecto al Precio Contractual con Proveedor A:**  
   $$\text{Diferencia Proveedor A} = \text{₡}30\,000 (\text{OC-1041}) + \text{₡}30\,000 (\text{OC-1042}) = \mathbf{\text{₡}60\,000}$$  
   *Tratamiento analítico:* Esta variación de ₡150 por saco frente a la tarifa de referencia de ₡6 300 no debe considerarse un crédito automático ni una nota de crédito confirmada. Su recuperación efectiva queda expresamente condicionada a la revisión formal del contrato marco, la auditoría de las facturas electrónicas timbradas y la comprobación de la recepción física en obra mediante el Three-Way Match.
2. **Desviaciones por Compras Fuera de Contrato a Otros Proveedores (B, C, D):**  
   $$\text{Desviación Terceros} = \text{₡}32\,000 + \text{₡}50\,000 + \text{₡}48\,000 + \text{₡}33\,000 = \mathbf{\text{₡}163\,000}$$  
   *Acción recomendada:* Centralización de compras a través del catálogo estandarizado y eliminación de pedidos spot no autorizados.
3. **Total Consolidado de Diferencias (Fuga Mensual):** $\text{₡}60\,000 + \text{₡}163\,000 = \mathbf{\text{₡}223\,000}$.
4. **Proyección Anual Simple:** $\text{₡}223\,000 \times 12 = \mathbf{\text{₡}2\,676\,000}$.

#### Exposición Económica por Posible Compra Duplicada
- **Órdenes involucradas:** OC-1041 y OC-1042 (Mismo proveedor A, misma fecha 02/10, mismo cemento, 200 sacos cada una).
- **Monto de Exposición en Riesgo:** $200 \times \text{₡}6\,450 = \mathbf{\text{₡}1\,290\,000}$.
- **Tratamiento Técnico:** **No debe sumarse como pérdida consumada.** Representa un riesgo de liquidez y sobreabastecimiento. La auditoría física debe validar si ingresaron 400 sacos reales o si existió doble facturación por el mismo camión.

---

### EJERCICIO A4 — Evaluación Multicriterio de Proveedores

Matriz con supuestos académicos para proveedores referenciales en Costa Rica (Escala 1 a 5):

| Criterio Evaluado | Peso ($W_i$) | Novex S.A. | Construplaza S.A. | EPA S.A. |
|---|:---:|:---:|:---:|:---:|
| Precio y Descuentos por Volumen | 25 % | 4.0 (1.000) | 3.5 (0.875) | 4.5 (1.125) |
| Calidad y Certificaciones Técnicas | 25 % | 4.5 (1.125) | 4.8 (1.200) | 4.0 (1.000) |
| Cumplimiento de Plazos en Obra | 20 % | 4.0 (0.800) | 4.5 (0.900) | 3.8 (0.760) |
| Condiciones de Crédito Comercial | 10 % | 4.0 (0.400) | 4.2 (0.420) | 3.5 (0.350) |
| Servicio Posventa y Devoluciones | 10 % | 3.8 (0.380) | 4.6 (0.460) | 3.9 (0.390) |
| Cobertura Geográfica de Despacho | 5 % | 4.0 (0.200) | 4.0 (0.200) | 4.8 (0.240) |
| Riesgo de Dependencia y Capacidad | 5 % | 4.0 (0.200) | 4.5 (0.225) | 4.0 (0.200) |
| **Puntaje Ponderado Final** | **100 %** | **4.105** | **4.280** | **4.065** |

#### Conclusión Estratégica:
- **Proveedor Principal (70 % del volumen adjudicado):** **Construplaza S.A. (4.280)** por su liderazgo en calidad de concreto/acero, cumplimiento puntual de entrega y respaldo posventa en sitio.
- **Proveedor Secundario (30 % del volumen adjudicado):** **EPA S.A. (4.065)** por su alta competitividad en precios y cobertura logística mediante múltiples sucursales, reduciendo el riesgo de desabastecimiento.

---

### EJERCICIO A5 — Niveles de Stock, Punto de Reorden y Priorización

#### Fórmulas de Control:
- $\text{Stock de Seguridad } (SS) = (D_{\text{máx}} - D_{\text{prom}}) \times L$
- $\text{Punto de Reorden } (ROP) = (D_{\text{prom}} \times L) + SS$
- $\text{Días de Cobertura } (DC) = \frac{\text{Stock Actual}}{D_{\text{prom}}}$

#### Tabla Maestra de Parámetros de Stock y Cobertura

| Material | $D_{\text{prom}}$ | $D_{\text{máx}}$ | Plazo ($L$) | $SS$ | $ROP$ | Stock Actual | Cobertura ($DC$) | Estado | Prioridad |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Arena fina (m³)** | 6 | 10 | 2 días | $(10-6)\times 2 = \mathbf{8}$ | $(6\times 2)+8 = \mathbf{20}$ | 14 | **2.33 días** | **Reponer** | **1 (Crítica)** |
| **Block 12 × 20 × 40** | 600 | 900 | 4 días | $(900-600)\times 4 = \mathbf{1\,200}$ | $(600\times 4)+1200 = \mathbf{3\,600}$ | 2 800 | **4.67 días** | **Reponer** | **2 (Alta)** |
| **Cemento gris 50 kg** | 40 | 55 | 3 días | $(55-40)\times 3 = \mathbf{45}$ | $(40\times 3)+45 = \mathbf{165}$ | 190 | **4.75 días** | Normal | 3 (Monitoreo) |
| **Varilla #3 grado 40** | 120 | 160 | 5 días | $(160-120)\times 5 = \mathbf{200}$ | $(120\times 5)+200 = \mathbf{800}$ | 850 | **7.08 días** | Normal | 4 (Estable) |

#### Justificación de Prioridades Operativas:
1. **Arena fina (Prioridad 1):** Con solo **2.33 días de inventario** y un tiempo de reposición de 2 días, cualquier retraso de horas en el transporte causará desabastecimiento directo de morteros y repellos.
2. **Block de concreto (Prioridad 2):** Con **4.67 días de cobertura** y plazo de entrega de 4 días, el margen de maniobra es de 0.67 días (~16 horas laborales) antes de consumir el inventario de seguridad.

---

## 5. PARTE B — ARQUITECTURA TÉCNICA Y DESARROLLO DEL SISTEMA

### 5.1. Arquitectura de Tres Capas
- **Capa Cliente (Frontend):** SPA construida con React 18 y Vite, con componentes desacoplados, tablas responsivas, modales accesibles y gráficos con Recharts.
- **Capa Servidor (Backend):** API REST estructurada por capas (Controladores, Servicios, Modelos, Validadores, Middlewares) en Node.js y Express.
- **Capa de Persistencia (Base de Datos):** MySQL relacional en Tercera Forma Normal (3NF) gestionada a través de Sequelize ORM.

### 5.2. Modelo de Datos en 3NF y Principio del Ledger
El stock nunca se actualiza como un campo editable directo en la tabla de materiales. Todo cambio físico proviene de un movimiento inmutable en `inventory_movements`:
$$\text{Stock Actual} = \sum (\text{Entradas} + \text{Ajustes Positivos}) - \sum (\text{Salidas} + \text{Ajustes Negativos})$$

- **Estado Inicial Base (Semilla):** La carga inicial (`seed.sql`) asienta para el Cemento gris 50 kg una entrada de 250 sacos y una salida de 60 sacos, estableciendo un **saldo inicial conocido y reproducible de 190 sacos** en Bodega Central Coyol, coincidente en su totalidad con el Ejercicio A5.
- **Trazabilidad en Demostración:** Cualquier movimiento de prueba en vivo parte de esta base determinística (por ejemplo, una entrada de 50 sacos y una salida de 20 sacos produce un saldo exacto de **220 sacos**; mientras que la ejecución previa de la suite automatizada de pruebas asienta operaciones reales en MySQL que incrementan temporalmente el acumulado a 270 sacos hasta la siguiente reinicialización con `npm run db:init`).
- Las salidas y traslados verifican previamente la existencia disponible; **si la cantidad solicitada excede el saldo real, la transacción se aborta con excepción**.
- Los traslados entre bodegas se asientan como pares vinculados en una sola transacción atómica SQL mediante `transfer_group_id`.

### 5.3. Servicios y Motores de Reglas de Negocio
- `reorderService`: Evalúa reactivamente $Stock \le ROP$ y emite alertas automáticas persistentes en MySQL sin duplicar alertas abiertas.
- `approvalMatrixService`: Asigna la autoridad competente y valida que la orden cuente con las cotizaciones mínimas antes de permitir el cambio a estado `aprobada`.
- `duplicateDetectionService`: Escanea órdenes en ventana de 3 días con tolerancia de cantidad $\le 10\%$ para el mismo proveedor y material.
- `splitPurchaseService`: Detecta compras consecutivas para el mismo proyecto que acumulen montos superiores al umbral de aprobación.

### 5.4. Diagramas de Arquitectura

#### Diagrama de Flujo del Circuito de Compras (10 Etapas)
*(Ver diagrama interactivo en `entrega_final/diagramas/circuito_compras.html` y código fuente en `docs/circuito_compras.mmd`)*

#### Diagrama Entidad-Relación (14 Tablas en 3NF)
*(Ver diagrama interactivo en `entrega_final/diagramas/diagrama_erd.html` y código fuente en `docs/diagrama_erd.mmd`)*

---

## 6. RESULTADOS Y VERIFICACIÓN DE PRUEBAS AUTOMATIZADAS

Las 12 pruebas obligatorias se ejecutaron directamente contra MySQL utilizando el framework Jest (`backend/tests/businessRules.test.js`):

```
PASS tests/businessRules.test.js
  PRUEBAS EMPRESARIALES OBLIGATORIAS - QUIZ #2
    √ Prueba 1: Cálculo de stock de seguridad para Cemento gris 50 kg (45 sacos)
    √ Prueba 2: Cálculo de punto de reorden para Cemento gris 50 kg (165 sacos)
    √ Prueba 3: Material bajo punto de reorden genera alerta (Block: 2800 <= 3600)
    √ Prueba 4: Material en estado normal no genera alerta falsa (Varilla #3: 850 > 800)
    √ Prueba 5: Detección de posible compra duplicada (OC-1041 y OC-1042)
    √ Prueba 6: Movimiento de entrada aumenta existencias en ubicación (+100)
    √ Prueba 7: Movimiento de salida disminuye existencias en ubicación (-20)
    √ Prueba 8: Traslado atómico mantiene invariable el stock global
    √ Prueba 9: Validación de stock negativo rechaza la transacción con excepción
    √ Prueba 10: Orden por ₡3 000 000 asigna Gerencia Financiera y 3 cotizaciones
    √ Prueba 11: Detección de compra fraccionada agrupada por proyecto
    √ Prueba 12: Trazabilidad forense completa reconstruye el historial del material

Test Suites: 1 passed, 1 total | Tests: 12 passed, 12 total | Tiempo: 3.56 s
```

---

## 7. CONCLUSIONES Y RECOMENDACIONES ESTRATÉGICAS

1. **Ahorro Demostrado por Estandarización:** La taxonomía de 2 niveles permite capturar un ahorro directo inmediato de **₡89 000** en cemento y acero estructural.
2. **Eliminación de Fuga de Valor:** El control de contratos y centralización de compras previene sobrecostos proyectados en **₡2 676 000** anuales (fuga mensual de **₡223 000**, compuesta por **₡60 000** de diferencia contractual con Proveedor A y **₡163 000** con terceros). Se aísla además un monto de **₡1 290 000** en exposición económica por posible duplicidad de órdenes (OC-1041 y OC-1042), sujeto a la comprobación de recepción física y auditoría documental.
3. **Continuidad de Obras con Base Matemática:** La priorización por días de cobertura asegura que los recursos de compra se enfoquen primero en la **Arena fina (2.33 días)** y el **Block de concreto (4.67 días)**, blindando el avance físico de los proyectos.
4. **Solución Técnica Inviolable:** La arquitectura de tres capas implementada con Sequelize y MySQL garantiza integridad referencial, transacciones atómicas y seguridad mediante validadores de entrada y roles de usuario.

