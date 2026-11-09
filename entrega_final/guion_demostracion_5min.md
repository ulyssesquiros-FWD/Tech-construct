# GUION TÉCNICO DE DEMOSTRACIÓN EN VIVO (MÁXIMO 5 MINUTOS)
## QUIZ #2: SISTEMA EMPRESARIAL DE GESTIÓN DE INVENTARIOS
**Empresa:** Constructora Del Valle S.A. | **Duración Estricta:** 4 minutos 45 segundos (Margen de 15 segundos)

---

### TABLA DE CRONOGRAMA DE DEMOSTRACIÓN (5 MINUTOS)

| Paso | Minuto | Módulo / Pantalla en Frontend | Acción Práctica en Vivo | Verificación de Software y Regla de Negocio |
|:---:|:---:|---|---|---|
| **1** | 0:00 - 0:25 | **Dashboard** (`/`) | Iniciar sesión y mostrar KPIs ejecutivos. | Tarjetas con valor monetario en ₡, stock global, alertas activas y compras en curso. |
| **2** | 0:25 - 0:55 | **Materiales** (`/materiales`) | Filtrar y mostrar insumos estandarizados. | Códigos normalizados `MAT-CEM-GRIS-050` y `MAT-ACE-VAR-003`, $SS$, $ROP$ y precios. |
| **3** | 0:55 - 1:30 | **Movimientos ➔ Entrada** (`/movimientos`) | Registrar Entrada de 50 sacos de Cemento en Bodega Central Coyol. | Documento `REC-DEMO-01`, inserción atómica en `inventory_movements`. Mensaje de éxito. |
| **4** | 1:30 - 2:05 | **Movimientos ➔ Salida** (`/movimientos`) | Registrar Salida de 20 sacos de Cemento hacia Obra Norte. | Documento `VAL-OBRA-101`. Comprobación de saldo disponible suficiente. |
| **5** | 2:05 - 2:35 | **Inventario por Ubicación** (`/inventario-ubicacion`) | Consultar saldo en Bodega Coyol. | Verificar saldo exacto ($Saldo = Inicial + 50 - 20 = Saldo + 30$). Sin datos estáticos. |
| **6** | 2:35 - 3:05 | **Alertas de Reorden** (`/alertas`) | Mostrar panel de alertas ROP reactivas. | Alerta Crítica en Arena fina ($Stock = 14 \le 20$) y Alerta Alta en Block ($Stock = 2800 \le 3600$). |
| **7** | 3:05 - 3:40 | **Detección de Duplicados** (`/duplicados`) | Mostrar detección de OC-1041 y OC-1042. | Mismo proveedor A, misma fecha, similitud > 90%, riesgo de sobrepago aislado de ₡1 290 000. |
| **8** | 3:40 - 4:10 | **Trazabilidad Forense** (`/trazabilidad`) | Filtrar por Cemento gris 50 kg. | Cronología completa de entradas, salidas y traslados con documentos, usuarios y fechas. |
| **9** | 4:10 - 4:35 | **Órdenes de Compra** (`/ordenes-compra`) | Crear OC por ₡3 000 000 (Construplaza S.A.). | Formulario dinámico: cálculo de subtotal, IVA del 13% y total general. |
| **10** | 4:35 - 4:50 | **Módulo Aprobaciones** (`/aprobaciones`) | Verificar regla de la Matriz de Compras. | Regla vinculante: Requiere **Gerencia Financiera** y mínimo **3 cotizaciones** formales. |

---

### LIBRETO Y DIÁLOGO TÉCNICO EN VIVO (Segundo a Segundo)

#### PASO 1: Apertura del Dashboard (0:00 - 0:25)
- **Acción:** Abrir el navegador en `http://localhost:3000`. Mostrar el Dashboard principal.
- **Voz del Demostrador:**
  > *"Iniciamos la demostración en el Dashboard gerencial de Constructora Del Valle S.A. Como observamos, todos los datos provienen en tiempo real desde MySQL. Visualizamos el valor económico total del inventario valorado en colones costarricenses, el número de materiales activos, las alertas de reorden prioritarias y las órdenes de compra en proceso, acompañadas de gráficos dinámicos de distribución por categoría."*

#### PASO 2: Catálogo Normalizado de Materiales (0:25 - 0:55)
- **Acción:** Hacer clic en **Materiales** en la barra lateral. En el buscador teclear `Cemento`.
- **Voz del Demostrador:**
  > *"Ingresamos al módulo de Materiales. Aquí vemos la aplicación de la taxonomía del ejercicio A2: el Cemento gris está normalizado bajo el código institucional `MAT-CEM-GRIS-050`, y la varilla bajo `MAT-ACE-VAR-003`. Cada ficha almacena de forma persistente su demanda diaria promedio, su tiempo de entrega de 3 días, su stock de seguridad calculado en 45 sacos y su punto de reorden de 165 sacos."*

#### PASO 3: Registro de Entrada de Material (0:55 - 1:30)
- **Acción:** Ir a **Movimientos**, clic en el botón verde **"Registrar Movimiento"**.
  - Tipo: `Entrada`.
  - Material: `Cemento gris 50 kg`.
  - Ubicación Destino: `Bodega Central Coyol`.
  - Cantidad: `50`.
  - Documento de Referencia: `REC-DEMO-01`.
  - Clic en **Guardar Movimiento**.
- **Voz del Demostrador:**
  > *"Vamos a la pestaña de Movimientos para registrar una recepción física de material. Seleccionamos Entrada para el Cemento gris en la Bodega Central Coyol por una cantidad de 50 sacos, con la guía de recepción `REC-DEMO-01`. Al presionar Guardar, el backend ejecuta un INSERT atómico en la tabla `inventory_movements`, confirmando la operación exitosamente."*

#### PASO 4: Registro de Salida hacia Obra (1:30 - 2:05)
- **Acción:** En la misma pantalla, clic en **"Registrar Movimiento"**.
  - Tipo: `Salida`.
  - Material: `Cemento gris 50 kg`.
  - Ubicación Origen: `Bodega Central Coyol`.
  - Cantidad: `20`.
  - Documento: `VAL-OBRA-101`.
  - Clic en **Guardar Movimiento**.
- **Voz del Demostrador:**
  > *"Inmediatamente registramos un despacho o Salida de 20 sacos de cemento desde Bodega Coyol para atender un colado en Obra Norte con el vale `VAL-OBRA-101`. Noten que el backend comprueba previamente la existencia disponible en esa bodega específica. Si hubiéramos solicitado más unidades de las disponibles, la transacción se abortaría de inmediato impidiendo saldos negativos."*

#### PASO 5: Verificación de Stock Actualizado por Ubicación (2:05 - 2:35)
- **Acción:** Navegar a **Inventario por Ubicación**. Seleccionar `Bodega Central Coyol`.
- **Voz del Demostrador:**
  > *"Comprobamos en tiempo real el Inventario por Ubicación en la Bodega Coyol: el sistema totaliza dinámicamente mediante el patrón Ledger sumando las entradas y restando las salidas. Vemos el incremento exacto neto de 30 unidades respecto al saldo anterior, sin campos estáticos ni valores precalculados desincronizados."*

#### PASO 6: Detección y Panel de Alertas de Reorden (2:35 - 3:05)
- **Acción:** Navegar a **Alertas** en el menú.
- **Voz del Demostrador:**
  > *"Pasamos al módulo de Alertas de Reorden. Aquí el motor reactivo evalúa permanentemente la condición de existencias contra el ROP. Observamos dos alertas críticas activas: Arena fina con solo 14 metros cúbicos frente a un punto de reorden de 20 y cobertura de 2.33 días, catalogada con urgencia Crítica; y el Block de concreto con 2 800 unidades frente a un ROP de 3 600. Por el contrario, la varilla no emite alerta falsa por hallarse en zona normal."*

#### PASO 7: Detección Heurística de Órdenes Duplicadas (3:05 - 3:40)
- **Acción:** Navegar al módulo de **Duplicados**.
- **Voz del Demostrador:**
  > *"En el módulo de Duplicados, el motor de inteligencia de compras detecta automáticamente la colisión histórica de las órdenes OC-1041 y OC-1042 emitidas el 2 de octubre al Proveedor A por 200 sacos de cemento cada una. El algoritmo reporta un índice de similitud del 95% y aísla una exposición económica de ₡1 290 000 en riesgo, permitiendo a la jefatura retener la segunda orden antes de autorizar el desembolso."*

#### PASO 8: Consulta de Trazabilidad Forense de Punta a Punta (3:40 - 4:10)
- **Acción:** Entrar a **Trazabilidad**. Seleccionar en el selector el material `Cemento gris 50 kg`.
- **Voz del Demostrador:**
  > *"En la pantalla de Trazabilidad Forense reconstruimos la historia de vida del Cemento gris. Visualizamos una línea de tiempo inmutable con cada una de las compras, recepciones, traslados entre depósitos y salidas a obras, con su fecha exacta, documento soporte, usuario responsable e impacto directo en el saldo progresivo."*

#### PASO 9: Creación de Orden de Compra por ₡3 000 000 (4:10 - 4:35)
- **Acción:** Entrar a **Órdenes de Compra**, clic en **"Nueva Orden de Compra"**.
  - Proveedor: `Construplaza S.A.`
  - Ubicación: `Obra Este`.
  - Material: `Block 12 x 20 x 40` (o Cemento).
  - Ajustar línea de detalle para que el total sume exactamente ₡3 000 000 (o seleccionar monto de ₡3 000 000).
  - Clic en **Guardar Orden**.
- **Voz del Demostrador:**
  > *"Procedemos a crear una nueva Orden de Compra formal dirigida a Construplaza S.A. para Obra Este por un valor total exacto de ₡3 000 000 colones. Al enviar el formulario, el backend recibe el payload, valida la estructura y ejecuta el servicio de la Matriz de Aprobación."*

#### PASO 10: Validación de Matriz y Cotizaciones Requeridas (4:35 - 4:50)
- **Acción:** Ir a **Aprobaciones** (o ver la tarjeta de la orden recién creada).
- **Voz del Demostrador:**
  > *"Y como vemos en la orden generada y en el panel de Aprobaciones: al superar el umbral de los ₡2 000 000, el sistema le asigna como autoridad obligatoria a la **Gerencia Financiera** y exige un mínimo estricto de **3 cotizaciones comerciales**. Si un usuario intenta aprobarla sin adjuntar las 3 cotizaciones, el backend rechaza la firma con código HTTP 403.*
  >
  > *Con esto demostramos en 4 minutos y 45 segundos la completa funcionalidad, integridad relacional y gobierno de compras de Constructora Del Valle S.A."*

---

### LISTA DE VERIFICACIÓN PREVIA A LA DEMO (Checklist)
1. Backend ejecutándose en `http://localhost:5000` (verificar con `curl http://localhost:5000/api/health`).
2. Frontend ejecutándose en `http://localhost:3000`.
3. Base de datos MySQL `gestion_inventarios` inicializada y con datos semilla.
4. Navegador abierto en pantalla completa (`F11`) en la pestaña del Dashboard.
5. Pestañas auxiliares abiertas:
   - Pestaña 1: Frontend SPA (`http://localhost:3000`).
   - Pestaña 2: Presentación interactiva (`entrega_final/presentacion_quiz2.html`).
   - Pestaña 3: Diagrama ERD interactivo (`entrega_final/diagramas/diagrama_erd.html`).

