# Manual de Usuario del Sistema

**Sistema:** Sistema Empresarial de Gestión de Inventarios y Abastecimiento  
**Empresa:** Constructora Del Valle S.A.  
**Versión:** 1.0.0 Corporativa  
**Idioma:** Español | **Moneda:** Colones Costarricenses (₡)  

---

## 1. Introducción y Acceso al Sistema

El sistema ha sido diseñado para gestionar de manera integral el inventario de materiales de construcción distribuidos entre la Bodega Central y los distintos frentes de obra (Obra Norte, Obra Sur, Obra Este, Bodega de Obras).

### 1.1. Arquitectura de Navegación
La aplicación cuenta con una barra de navegación lateral izquierda que da acceso permanente a los 12 módulos funcionales del sistema, acompañada de indicadores numéricos (badges) que alertan en tiempo real sobre órdenes pendientes de aprobación, materiales bajo punto de reorden y posibles compras duplicadas.

---

## 2. Guía Operativa por Módulo

### Módulo 1 — Dashboard Estratégico
- **Propósito:** Supervisión ejecutiva y operativa en tiempo real del estado general del inventario.
- **Indicadores Clave (KPIs):**
  - *Materiales Registrados:* Cantidad de artículos activos en el catálogo maestro.
  - *Unidades en Existencia:* Suma física de existencias en todas las ubicaciones.
  - *Bajo Punto de Reorden:* Artículos cuyo stock actual es inferior o igual al mínimo operacional.
  - *Órdenes de Compra y Duplicados:* Conteo de compras y alertas preventivas.
- **Gráficos Interactivos (Recharts):**
  - *Stock vs. Punto de Reorden:* Comparativa de barras para identificar rápidamente déficits de materiales.
  - *Distribución por Categoría:* Gráfico circular que muestra la concentración física del inventario.
  - *Evolución de Entradas y Salidas:* Flujo histórico de recepciones y despachos a obra.

---

### Módulo 2 — Gestión de Materiales
- **Propósito:** Catálogo maestro de artículos con control automático de reabastecimiento.
- **Acciones Disponibles:**
  1. **Búsqueda y Filtrado:** Localice materiales por nombre, código estandarizado (ej. `MAT-CEM-GRIS-050`) o categoría.
  2. **Nuevo Material:** Haga clic en el botón *Nuevo Material* y complete:
     - Código estandarizado corporativo.
     - Nombre técnico y unidad de medida.
     - Demanda promedio diaria, demanda máxima y tiempo de entrega en días.
     > **Nota Técnica:** El formulario calcula en tiempo real el Stock de Seguridad ($SS$) y el Punto de Reorden ($ROP$) antes de guardar, asegurando que ningún usuario digite estos valores manualmente.
  3. **Stock por Ubicación:** Haga clic en el icono del ojo () para ver el desglose de existencias en cada bodega y obra.
  4. **Trazabilidad:** Haga clic en el icono de reloj () para navegar directamente a la historia de ese material.

---

### Módulo 3 — Categorías y Taxonomía
- **Propósito:** Estructuración del catálogo en 2 niveles (Categoría Padre $\to$ Subcategoría).
- **Uso:**
  - Permite visualizar familias estandarizadas como *Materiales de Construcción (MAT)* con sus subdivisiones *Cementos (MAT-CEM)*, *Aceros (MAT-ACE)*, *Bloques (MAT-BLO)* y *Agregados (MAT-AGR)*.
  - Facilita la consolidación de volúmenes de compra y la negociación de descuentos corporativos.

---

### Módulo 4 — Inventario por Ubicación
- **Propósito:** Monitoreo del inventario presente físicamente en cada frente de trabajo.
- **Uso:**
  - Seleccione la pestaña correspondiente a *Bodega Central*, *Bodega de Obras*, *Obra Norte*, *Obra Sur* u *Obra Este*.
  - El sistema desplegará los materiales almacenados en esa ubicación, sus unidades físicas y la valorización monetaria estimada en colones (₡).
  - Permite registrar nuevas obras o bodegas mediante el botón *Nueva Ubicación*.

---

### Módulo 5 — Registro de Movimientos de Inventario
- **Propósito:** Asentar entradas, salidas, traslados y ajustes directamente en el libro mayor.
- **Flujo para Registrar un Movimiento:**
  1. Presione el botón **Registrar Movimiento**.
  2. Seleccione el *Tipo de Movimiento*:
     - **Entrada:** Recepción de materiales provenientes de un proveedor u orden de compra.
     - **Salida:** Despacho de materiales a una cuadrilla o frente de trabajo.
     - **Traslado:** Transferencia atómica entre dos ubicaciones (origen y destino).
     - **Ajuste Positivo / Negativo:** Correcciones autorizadas por auditoría física.
  3. Seleccione el *Material* y la *Ubicación Origen*.
  4. El sistema mostrará de inmediato la **existencia disponible actual** en esa ubicación.
  5. Ingrese la *Cantidad* y el *Documento de Origen* (ej. Requisición, Factura).
  6. Presione **Confirmar y Asentar en Ledger**.
  > **Control de Seguridad:** Si un usuario intenta registrar una salida o traslado superior al stock disponible, el sistema rechazará la transacción indicando que provocará existencia negativa.

---

### Módulo 6 — Órdenes de Compra
- **Propósito:** Emisión y control de compras corporativas.
- **Creación de una Orden:**
  1. Haga clic en **Nueva Orden de Compra**.
  2. Seleccione el proveedor, área solicitante y proyecto de destino.
  3. Agregue los artículos indicando cantidad y precio unitario.
  4. Observe cómo el sistema totaliza el importe en colones (₡) y despliega automáticamente la **Autoridad Competente** requerida según la matriz de aprobación (Jefatura de Área, Jefatura de Compras, Gerencia Financiera o Gerencia General) y el número mínimo de cotizaciones.
  5. Guarde la orden; esta quedará en estado `pendiente_aprobacion`.
- **Botones de Auditoría:**
  - *Escanear Duplicados:* Analiza las órdenes para detectar compras duplicadas en ventana de 3 días.
  - *Escanear Fraccionamiento:* Revisa si existen compras fraccionadas para evadir autorizaciones.

---

### Módulo 7 — Directorio de Proveedores
- **Propósito:** Administración de proveedores comerciales y contratos marco.
- **Uso:**
  - Consulta de razón social, cédula jurídica, teléfono, correo de contacto y condiciones comerciales.
  - Creación de nuevos proveedores mediante formulario validado.

---

### Módulo 8 — Alertas de Punto de Reorden
- **Propósito:** Gestión de materiales en riesgo de desabastecimiento.
- **Uso:**
  - Lista todos los materiales cuyo stock actual es inferior o igual a su punto de reorden.
  - Muestra el stock físico actual, el punto de reorden y el déficit de unidades a reponer.
  - Permite hacer clic en **Revisar** para actualizar la gestión (marcar en revisión o resuelta).
  - Incluye el botón **Reevaluar Stock vs ROP** para forzar un reanálisis global.

---

### Módulo 9 — Auditoría de Compras Duplicadas
- **Propósito:** Prevención de doble facturación y sobreabastecimiento.
- **Uso:**
  - Muestra las órdenes coincidentes (ej. OC-1041 y OC-1042 del ejercicio A3).
  - Identifica el motivo de coincidencia (mismo proveedor, material, fecha y cantidad idéntica).
  - Permite al auditor hacer clic en **Auditar** para dictaminar si se trata de un duplicado confirmado o si corresponde a una compra no duplicada justificada.

---

### Módulo 10 — Trazabilidad y Línea de Tiempo
- **Propósito:** Auditoría forense de cualquier material registrado en la empresa.
- **Uso:**
  - Seleccione cualquier material en la lista desplegable superior.
  - El sistema reconstruirá su línea de tiempo cronológica, mostrando cada entrada, salida, traslado y ajuste, indicando:
    - Fecha y hora exacta.
    - Usuario responsable del movimiento.
    - Bodega u obra afectada.
    - Saldo resultante después de la transacción.
    - Documento de respaldo y orden de compra asociada.

---

### Módulo 11 — Bandeja de Aprobaciones
- **Propósito:** Autorización escalonada de órdenes de compra.
- **Uso:**
  - Lista las órdenes que requieren aprobación según la matriz de compras.
  - Muestra si se cumple el requisito de cotizaciones adjuntas.
  - Permite a la jefatura o gerencia hacer clic en **Aprobar** o **Rechazar**, registrando comentarios de justificación obligatorios.

---

### Módulo 12 — Informes Estratégicos (Resolución Parte A)
- **Propósito:** Consulta de los resultados analíticos del Quiz #2.
- **Pestañas Disponibles:**
  - *A1: Circuito & Matriz:* Flujo de 10 etapas y controles contra fraccionamiento.
  - *A2: Taxonomía & Ahorro:* Clasificación de las 8 líneas y cálculo de ₡89 000 de ahorro potencial.
  - *A3: Fuga de Valor:* Sobreprecio de ₡223 000 en 7 órdenes, proyección de ₡2 676 000 y exposición de duplicados de ₡1 290 000.
  - *A4: Evaluación de Proveedores:* Matriz multicriterio ponderada (Construplaza 4.28, Novex 4.10, EPA 4.06).
  - *A5: Puntos de Reorden:* Cálculo de stock de seguridad, ROP y prioridad por cobertura (Arena 2.33 días, Block 4.67 días).

