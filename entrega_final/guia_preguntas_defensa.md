# GUÍA MAESTRA DE PREGUNTAS Y RESPUESTAS PARA LA DEFENSA TÉCNICA
## QUIZ #2: SISTEMA EMPRESARIAL DE GESTIÓN DE INVENTARIOS
**Empresa:** Constructora Del Valle S.A. | **Total de Preguntas:** 24 Preguntas Técnicas y Arquitectónicas

---

### ÍNDICE TEMÁTICO DE PREGUNTAS

1. [Node.js & Asincronía](#1-nodejs--asincronía)
2. [Express & Middlewares](#2-express--arquitectura-de-servidor)
3. [React 18 & Estado](#3-react-18--gestión-de-estado-y-componentes)
4. [Vite & Rendimiento Frontend](#4-vite--herramienta-de-construcción-y-bundling)
5. [MySQL & Motor InnoDB](#5-mysql--motor-relacional-y-acid)
6. [Sequelize ORM & Mapeo Objeto-Relacional](#6-sequelize-orm--abstracción-y-consultas)
7. [Relaciones de Bases de Datos & Integridad Referencial](#7-relaciones-de-bases-de-datos--foreign-keys)
8. [Normalización & Tercera Forma Normal (3NF)](#8-normalización--3nf-y-cero-redundancias)
9. [API REST & Códigos de Estado HTTP](#9-api-rest--diseño-de-endpoints-y-semántica-http)
10. [CRUD & Validaciones en Capas](#10-operaciones-crud--validación-de-datos)
11. [Stock de Seguridad (SS) & Demanda Estocástica](#11-cálculo-de-stock-de-seguridad-ss)
12. [Punto de Reorden (ROP) & Días de Cobertura](#12-punto-de-reorden-rop-y-cobertura)
13. [Transacciones SQL Atómicas & Bloqueo de Stock Negativo](#13-transacciones-sql-atómicas--bloqueo-de-stock-negativo)
14. [Trazabilidad Forense & Principio del Ledger](#14-trazabilidad-forense--patrón-libro-mayor-ledger)
15. [Motor Heurístico de Detección de Duplicados](#15-motor-heurístico-de-detección-de-compras-duplicadas)
16. [Detección de Fraccionamiento (Split Purchases)](#16-detección-de-compras-fraccionadas)
17. [Matriz de Aprobación Vinculante por Monto](#17-matriz-de-aprobación-vinculante)
18. [Control de Acceso Basado en Roles (RBAC)](#18-control-de-acceso-por-roles-rbac)
19. [Seguridad, Hashing y Manejo de Variables de Entorno](#19-seguridad-hashing-bcrypt-y-variables-de-entorno)
20. [Conciliación Tripartita (Three-Way Match)](#20-three-way-match-en-compras)
21. [Diferenciación Financiera en Ejercicio A3](#21-diferenciación-financiera-en-el-ejercicio-a3)
22. [Criterio de Ingeniería en A2 (Homologación Condicionada)](#22-criterio-técnico-de-homologación-en-el-ejercicio-a2)
23. [Manejo de Errores Centralizado y Transaccional](#23-manejo-de-errores-centralizado-y-rollback)
24. [Estrategia de Pruebas Automatizadas con Jest](#24-estrategia-de-pruebas-automatizadas-con-jest)

---

### 1. Node.js & Asincronía

#### Pregunta 1: ¿Por qué se seleccionó Node.js para el backend y cómo gestiona las operaciones asíncronas de base de datos sin bloquear el hilo principal de ejecución?
**Respuesta Técnica:**
Node.js opera sobre un modelo de ejecución monohilo (*single-threaded*) no bloqueante gobernado por el **Event Loop** de la librería `libuv`.
En nuestro sistema de inventarios, cada vez que un usuario consulta el stock o registra un movimiento, la llamada a la base de datos MySQL a través de Sequelize no bloquea el hilo principal. Node.js delega la operación de Entrada/Salida (*I/O polling* en sockets de red) al sistema operativo o a su grupo de hilos auxiliares (*thread pool*). 

Utilizamos la sintaxis moderna **`async/await`** (sustentada sobre Promesas de ECMAScript), lo cual nos permite escribir código transaccional secuencial y legible mientras el Event Loop continúa despachando otras peticiones concurrentes. Por ejemplo, en `movementService.js`:
```javascript
const transaction = await sequelize.transaction();
try {
  // Las operaciones I/O hacia MySQL se esperan de forma asíncrona
  const material = await Material.findByPk(material_id, { transaction });
  await InventoryMovement.create({ ... }, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

### 2. Express & Arquitectura de Servidor

#### Pregunta 2: ¿Cómo está estructurada la arquitectura en capas dentro de Express y qué rol juegan los middlewares?
**Respuesta Técnica:**
Express se organiza siguiendo el principio de **Separación de Responsabilidades** (*Separation of Concerns*):
1. **Rutas (`/routes`):** Mapean los verbos y endpoints HTTP hacia los controladores correspondientes (ej. `materialRoutes.js`).
2. **Validadores (`/validators`):** Middlewares que verifican el cuerpo de la solicitud (`express-validator` o Joi) antes de permitir el paso al controlador.
3. **Controladores (`/controllers`):** Extraen parámetros de `req.params`, `req.query` o `req.body`, coordinan la lógica y devuelven la respuesta formateada con `res.status().json()`.
4. **Servicios (`/services`):** Contienen las reglas de negocio puras, cálculos matemáticos de reorden y transacciones de base de datos, manteniéndose agnósticos del objeto `req/res`.
5. **Middlewares:** Funciones que interceptan la tubería (*pipeline*) de ejecución. Implementamos middlewares globales (`cors`, `express.json()`), middlewares de seguridad (`authMiddleware`, `roleMiddleware`) y un middleware final centralizado para captura y formateo uniforme de excepciones (`errorHandler.js`).

---

### 3. React 18 & Gestión de Estado y Componentes

#### Pregunta 3: ¿Qué ventajas aporta React 18 en este proyecto y cómo se manejan los estados compartidos y el ciclo de vida de los componentes?
**Respuesta Técnica:**
React 18 ofrece un renderizado eficiente mediante su algoritmo de reconciliación basado en el **Virtual DOM** y el loteo automático de actualizaciones (*Automatic Batching*), lo que reduce drásticamente los re-renderizados innecesarios cuando se actualizan múltiples estados a la vez.

En nuestro frontend:
- Utilizamos **Hooks nativos**: `useState` para el manejo de estados locales (filtros, valores de formularios, visibilidad de modales), `useEffect` para la sincronización con la API REST (carga de datos inicial y trasmutaciones), y `useMemo` o `useCallback` para optimizar cálculos pesados de totales.
- La comunicación con el backend se centraliza en módulos de servicios (`api.js`), desacoplando la capa de presentación de la lógica de red.
- Tras registrar un movimiento de entrada o salida, el estado local no se modifica manualmente mediante mutación directa: se invoca de nuevo la función de fetch para sincronizar los datos reales emitidos por MySQL, garantizando consistencia absoluta con la base de datos.

---

### 4. Vite & Herramienta de Construcción y Bundling

#### Pregunta 4: ¿Por qué se utilizó Vite en lugar del tradicional Create React App (CRA) y cómo beneficia el entorno de producción?
**Respuesta Técnica:**
Vite revoluciona el desarrollo frontend al aprovechar los módulos nativos de ECMAScript (**ES Modules / ESM**) en el navegador. 
- **En desarrollo:** A diferencia de Webpack o CRA, que requieren empaquetar toda la aplicación antes de servirla, Vite procesa únicamente el código bajo demanda (*on-demand compilation*), logrando un tiempo de inicio del servidor en milisegundos y reemplazo de módulos en caliente (*Hot Module Replacement - HMR*) instantáneo.
- **En producción:** Emplea **Rollup** para generar un empaquetado altamente optimizado con división de código por rutas (*code-splitting*), eliminación de código muerto (*tree-shaking*) y minificación de CSS y JavaScript. El comando `npm run build` genera la carpeta `dist/` con cero dependencias externas y óptimo rendimiento.

---

### 5. MySQL & Motor InnoDB

#### Pregunta 5: ¿Por qué se seleccionó MySQL con motor de almacenamiento InnoDB y qué significan las propiedades ACID en la gestión de inventarios?
**Respuesta Técnica:**
Para un sistema empresarial que controla activos financieros y físicos, es obligatorio un motor relacional que garantice las propiedades **ACID**:
- **A (Atomicidad):** Una operación transaccional se ejecuta por completo o no se ejecuta nada. En un traslado de 50 sacos de cemento entre Bodega Coyol y Obra Norte, si la inserción de la entrada falla, la salida se reversa automáticamente mediante `ROLLBACK`.
- **C (Consistencia):** La base de datos transita siempre de un estado válido a otro válido, respetando llaves foráneas, tipos de datos y restricciones de unicidad (`CHECK`, `UNIQUE`, `NOT NULL`).
- **I (Aislamiento):** Las transacciones concurrentes no interfieren entre sí. InnoDB implementa bloqueos a nivel de fila (*row-level locking*) y soporte para control de concurrencia multiversión (**MVCC**).
- **D (Durabilidad):** Una vez que una transacción hace `COMMIT`, los datos quedan permanentemente grabados en el disco a través del *Redo Log* de InnoDB, resistiendo caídas de energía o fallos del servidor.

---

### 6. Sequelize ORM & Mapeo Objeto-Relacional

#### Pregunta 6: ¿Qué rol desempeña Sequelize ORM en el proyecto y cómo previene ataques de inyección SQL?
**Respuesta Técnica:**
Sequelize actúa como la capa de abstracción entre la lógica orientada a objetos de Node.js y el motor relacional de MySQL.
1. **Mapeo:** Modela las entidades (`Material`, `PurchaseOrder`, `InventoryMovement`, etc.) como clases con tipos de datos, validaciones y métodos auxiliares.
2. **Definición de Asociaciones:** Permite establecer relaciones `hasMany`, `belongsTo` y `belongsToMany` con carga perezosa (*lazy loading*) o carga impaciente (*eager loading*) mediante `include`.
3. **Prevención de Inyección SQL:** Sequelize utiliza internamente **consultas parametrizadas y declaraciones preparadas** (*prepared statements*). Cualquier valor suministrado por el usuario se envía al motor de base de datos como dato puro, nunca como código ejecutable concatenado a la cadena SQL. Por ejemplo:
```javascript
// La variable search nunca se concatena en la consulta cruda:
await Material.findAll({
  where: {
    name: { [Op.like]: `%${search}%` }
  }
});
```

---

### 7. Relaciones de Bases de Datos & Foreign Keys

#### Pregunta 7: ¿Cuáles son las relaciones relacionales más importantes implementadas en el esquema de 14 tablas?
**Respuesta Técnica:**
El esquema relacional implementa tres tipos de relaciones con integridad referencial estricta:
1. **Uno a Muchos (1:N):**
   - `roles` ➔ `users`: Un rol agrupa múltiples usuarios.
   - `categories` ➔ `categories`: Relación recursiva (categoría padre ➔ subcategorías).
   - `categories` ➔ `materials`: Una categoría clasifica múltiples materiales.
   - `suppliers` ➔ `purchase_orders`: Un proveedor recibe múltiples órdenes de compra.
   - `locations` ➔ `inventory_movements`: Una ubicación participa como origen o destino de movimientos.
2. **Muchos a Muchos (M:N) resuelta con tabla intermedia:**
   - `purchase_orders` y `materials`: Se resuelve mediante la tabla de asociación `purchase_order_details`, la cual añade atributos específicos de la transacción (`quantity`, `unit_price`, `subtotal`, `received_quantity`).
3. **Uno a Muchos Polimórfica/Autónoma en Alertas:**
   - `purchase_orders` ➔ `duplicate_purchase_alerts`: Se relaciona dos veces con la misma tabla (`purchase_order_id_1` y `purchase_order_id_2`) para modelar la colisión de órdenes.

Todas las claves foráneas están configuradas con `ON UPDATE CASCADE` y `ON DELETE RESTRICT`, impidiendo la eliminación huérfana de materiales o proveedores que tengan registros históricos.

---

### 8. Normalización & 3NF y Cero Redundancias

#### Pregunta 8: ¿Cómo se demuestra que la base de datos cumple con la Tercera Forma Normal (3NF)?
**Respuesta Técnica:**
El esquema cumple con los principios de normalización relacional:
1. **Primera Forma Normal (1NF):** Cada columna contiene valores atómicos e indivisibles. No existen campos multivaluados ni arreglos JSON almacenando listas de materiales dentro de la cabecera de la orden. Se eliminan los grupos repetitivos creando `purchase_order_details`.
2. **Segunda Forma Normal (2NF):** Cumple con 1NF y todos los atributos que no forman parte de la clave primaria tienen dependencia funcional completa de ella. En `purchase_order_details` (donde la clave compuesta lógica es `order_id + material_id`), el precio unitario y cantidad dependen estrictamente de esa combinación, mientras que los datos del proveedor o descripción del material están en sus tablas maestras.
3. **Tercera Forma Normal (3NF):** Cumple con 2NF y **no existen dependencias transitivas** entre atributos no clave. Por ejemplo:
   - La tabla `materials` no almacena el nombre del proveedor preferente ni la descripción de la categoría; únicamente almacena las claves foráneas `category_id` y `subcategory_id`.
   - La tabla `purchase_orders` no calcula ni almacena estáticamente los nombres de los materiales solicitados.
   - El stock no se almacena como un valor redundante y mutable en `materials`, eliminando anomalías de actualización.

---

### 9. API REST & Semántica HTTP

#### Pregunta 9: ¿Cómo se diseñó la API REST del sistema y qué códigos de estado HTTP se devuelven en cada caso?
**Respuesta Técnica:**
La API se adhiere a los principios de arquitectura REST (*Representational State Transfer*):
- **Sustantivos en plural y URIs jerárquicas:** `/api/materials`, `/api/purchase-orders`, `/api/inventory/movements`, `/api/alerts/reorder`.
- **Verbos HTTP semánticos:**
  - `GET`: Para consultar listas o registros individuales por ID (idempotente y seguro).
  - `POST`: Para crear nuevos recursos o asentar movimientos inmutables.
  - `PUT` / `PATCH`: Para actualizar campos específicos o cambiar estados de órdenes.
  - `DELETE`: Para desactivar entidades mediante borrado lógico (*soft delete*).
- **Códigos de Estado HTTP utilizados:**
  - `200 OK`: Consulta o actualización exitosa.
  - `201 Created`: Recurso creado exitosamente (ej. nueva orden de compra o movimiento).
  - `400 Bad Request`: Error de validación en los datos de entrada o intento de stock negativo.
  - `401 Unauthorized`: Falta de token o credencial de autenticación.
  - `403 Forbidden`: Usuario autenticado sin los permisos o rol requerido por la matriz.
  - `404 Not Found`: Recurso no encontrado en MySQL.
  - `500 Internal Server Error`: Falla no controlada capturada por el middleware de errores.

---

### 10. Operaciones CRUD & Validación de Datos

#### Pregunta 10: ¿Cómo se estructuraron las operaciones CRUD y en qué capa se validan los datos entrantes?
**Respuesta Técnica:**
Las operaciones CRUD implementan el principio de **Defensa en Profundidad**:
1. **Capa 1: Validación en Frontend:** Formularios con control de tipos, campos requeridos y restricciones HTML5 para una experiencia de usuario inmediata.
2. **Capa 2: Validación en Ruta (Middlewares con Express-Validator):** Antes de invocar al controlador, se intercepta la petición verificando que `quantity` sea un número positivo, que `unit_price` no sea negativo y que los correos electrónicos tengan formato RFC 5322. Si falla, se retorna `400 Bad Request` con el listado detallado de errores.
3. **Capa 3: Validación en Servicio:** Reglas complejas de negocio que requieren consultas a la base de datos (ej. comprobar que el proveedor exista, verificar saldo disponible en la bodega antes de una salida).
4. **Capa 4: Restricciones en Base de Datos:** `NOT NULL`, `CHECK (quantity > 0)`, tipos numéricos precisos `DECIMAL(12,2)`.

---

### 11. Cálculo de Stock de Seguridad (SS)

#### Pregunta 11: ¿Cuál es la fórmula matemática del Stock de Seguridad, qué variables intervienen y cuál fue su resultado para el cemento?
**Respuesta Técnica:**
El Stock de Seguridad ($SS$) amortigua las fluctuaciones imprevisibles de la demanda durante el tiempo que tarda el proveedor en despachar.
- **Fórmula aplicada:**
  $$SS = (D_{\text{máx}} - D_{\text{prom}}) \times L$$
  Donde:
  - $D_{\text{máx}}$: Demanda diaria máxima observada.
  - $D_{\text{prom}}$: Demanda diaria promedio.
  - $L$: Plazo de entrega del proveedor en días (*Lead Time*).

- **Caso Cemento Gris 50 kg:**
  - $D_{\text{máx}} = 55\text{ sacos/día}$
  - $D_{\text{prom}} = 40\text{ sacos/día}$
  - $L = 3\text{ días}$
  $$SS = (55 - 40) \times 3 = 15 \times 3 = \mathbf{45\text{ sacos}}$$
  El sistema garantiza que siempre existan al menos 45 sacos de reserva para absorber picos de consumo sin caer en quiebre de stock.

---

### 12. Punto de Reorden (ROP) y Cobertura

#### Pregunta 12: ¿Cómo se calcula el Punto de Reorden (ROP), cómo se determinan los Días de Cobertura y por qué la arena fina es la prioridad operativa número 1?
**Respuesta Técnica:**
- **Fórmula del Punto de Reorden:**
  $$ROP = (D_{\text{prom}} \times L) + SS$$
  Para el cemento: $(40 \times 3) + 45 = 120 + 45 = \mathbf{165\text{ sacos}}$. Cuando las existencias caen a 165 sacos o menos, se dispara automáticamente la necesidad de reponer.

- **Fórmula de Días de Cobertura ($DC$):**
  $$DC = \frac{\text{Stock Actual}}{D_{\text{prom}}}$$

- **Priorización de la Arena Fina:**
  - $D_{\text{prom}} = 6\text{ m³/día}$, $D_{\text{máx}} = 10\text{ m³/día}$, $L = 2\text{ días}$.
  - $SS = (10 - 6) \times 2 = 8\text{ m³}$.
  - $ROP = (6 \times 2) + 8 = \mathbf{20\text{ m³}}$.
  - Stock Actual = $14\text{ m³}$.
  - Días de Cobertura: $14 / 6 = \mathbf{2.33\text{ días}}$.
  **Justificación de Prioridad 1:** Con un plazo de entrega del proveedor de 2 días completos y una cobertura de 2.33 días, Constructora Del Valle tiene un margen de seguridad de apenas 0.33 días (~8 horas laborales). Cualquier atasco o demora logística provocará un quiebre de stock que paralizaría de inmediato las cuadrillas de repellos y mampostería.

---

### 13. Transacciones SQL Atómicas & Bloqueo de Stock Negativo

#### Pregunta 13: ¿Cómo asegura el backend que un traslado entre dos bodegas no duplique ni pierda existencias y cómo se evita físicamente el stock negativo?
**Respuesta Técnica:**
En `movementService.js`, cada traslado se ejecuta bajo una **Transacción Gestionada de Sequelize** ligada a la conexión MySQL:
1. **Comprobación de Saldo:** Se ejecuta una consulta agregada con función `SUM` sobre `inventory_movements` para el material en la ubicación de origen:
   $$\text{Saldo Disponible} = \sum \text{Entradas} - \sum \text{Salidas}$$
2. **Validación Preventiva:** Si $\text{Saldo Disponible} < \text{Cantidad Solicitada}$, el servicio lanza inmediatamente un error de negocio (`INSUFFICIENT_STOCK`) y aborta la petición. Ningún asiento llega a insertarse.
3. **Registro Atómico Doble:** Si hay existencia suficiente, se generan **dos asientos** con el mismo identificador UUID `transfer_group_id`:
   - Asiento 1: Movimiento tipo `traslado`, `origin_location_id = Origen`, cantidad positiva (que resta en el balance del origen).
   - Asiento 2: Movimiento tipo `traslado`, `destination_location_id = Destino`, misma cantidad positiva (que suma en el balance del destino).
4. **Commit:** Ambos registros se confirman atómicamente con `await transaction.commit()`. La suma neta a nivel corporativo permanece exactamente constante ($+X - X = 0$).

---

### 14. Trazabilidad Forense & Patrón Libro Mayor (Ledger)

#### Pregunta 14: ¿En qué consiste el principio del Ledger Inmutable y cómo permite auditar la historia de un material?
**Respuesta Técnica:**
En el desarrollo de software contable y de inventarios de misión crítica, **el estado actual de un recurso es el resultado acumulativo de todos sus eventos históricos**, no una propiedad editable.
- La tabla `materials` contiene parámetros operativos ($SS, ROP, L$), pero **no** posee una columna `stock_qty` que pueda alterarse con un `UPDATE materials SET stock = X`.
- Cada operación física (recepción de compra, vale de salida a obra, traslado entre depósitos o merma por ajuste) se inserta como una fila inmutable en `inventory_movements`.
- **Trazabilidad Forense:** La pantalla de trazabilidad consulta los movimientos cronológicos de un material mediante `ORDER BY created_at ASC`, calculando un saldo acumulativo continuo. La auditoría puede verificar qué usuario ejecutó la acción, con qué documento de soporte (`reference_document`), en qué fecha y bajo qué IP (registrado en `audit_logs`).

---

### 15. Motor Heurístico de Detección de Compras Duplicadas

#### Pregunta 15: ¿Cómo funciona el algoritmo de detección de órdenes duplicadas y cómo detectó las órdenes OC-1041 y OC-1042?
**Respuesta Técnica:**
El servicio `duplicateDetectionService.js` implementa un motor heurístico que evalúa tres dimensiones de similitud entre órdenes de compra:
1. **Mismo Proveedor y Mismo Material:** Clave de coincidencia estricta (`supplier_id` idéntico y líneas de detalle con el mismo `material_id`).
2. **Ventana Temporal Corta:** Evalúa si la diferencia entre las fechas de emisión es menor o igual a **3 días** ($|\text{fecha}_1 - \text{fecha}_2| \le 3\text{ días}$).
3. **Tolerancia de Cantidad $\le 10\%$:** Evalúa si $|\text{cant}_1 - \text{cant}_2| / \text{cant}_1 \le 0.10$.

- **Caso OC-1041 y OC-1042:**
  - Ambas dirigidas al Proveedor A.
  - Ambas emitidas en la misma fecha (02/10).
  - Ambas por 200 sacos de Cemento gris 50 kg a ₡6 450.
  - Similitud calculada: **95%**.
  - El sistema crea un registro en `duplicate_purchase_alerts`, alertando sobre una **exposición de riesgo de ₡1 290 000**, bloqueando el paso a pago hasta que auditoría física confirme si ingresaron 400 sacos reales o si existió una doble facturación.

---

### 16. Detección de Compras Fraccionadas

#### Pregunta 16: ¿Qué es el fraccionamiento de compras y cómo lo detecta el software?
**Respuesta Técnica:**
El **fraccionamiento de compras** (*split purchases*) es una práctica indebida en la cual un solicitante fragmenta una compra grande en múltiples órdenes pequeñas consecutivas para eludir los umbrales de aprobación superior (por ejemplo, emitir tres órdenes de ₡800 000 en lugar de una sola de ₡2 400 000 para no requerir la firma de la Gerencia Financiera).

- **Mecanismo de detección en `splitPurchaseService.js`:**
  El sistema corre un agrupador que totaliza las compras aprobadas o en trámite en una **ventana móvil de 30 días** agrupando por:
  - Mismo Proveedor.
  - Misma Categoría de insumos.
  - Mismo Proyecto o Departamento solicitante.
  Si el monto acumulado supera el umbral del nivel inmediato superior (₡250 000 o ₡2 000 000) en ese período, se dispara una `split_purchase_alert` que remite el expediente a Auditoría Interna.

---

### 17. Matriz de Aprobación Vinculante

#### Pregunta 17: ¿Cómo valida el backend que una orden de compra cumpla con la autoridad y las cotizaciones mínimas antes de aprobarse?
**Respuesta Técnica:**
En el momento de creación o modificación de una orden (`purchaseOrderController.js` y `approvalMatrixService.js`), el sistema calcula el total de la orden en colones:
- $\le$ ₡250 000: asigna `jefe_area` y exige 1 cotización.
- ₡250 001 a ₡2 000 000: asigna `jefe_compras` y exige 2 cotizaciones.
- ₡2 000 001 a ₡10 000 000: asigna `gerente_financiero` y exige 3 cotizaciones.
- \> ₡10 000 000: asigna `gerente_general` y exige 3 cotizaciones más acta de comité.

Al recibir la petición de aprobación (`POST /api/purchase-orders/:id/approve`):
1. Se verifica el rol del usuario autenticado frente a `required_approver_role`.
2. Se verifica que `quotations_count >= required_quotes`.
3. Si alguna condición no se cumple, la API deniega la operación con código `403 Forbidden` indicando exactamente el requisito faltante (ej. *"Se requieren al menos 3 cotizaciones para órdenes superiores a ₡2 000 000"*).

---

### 18. Control de Acceso Basado en Roles (RBAC)

#### Pregunta 18: ¿Cómo se implementa el control de acceso por roles (RBAC) en el backend y cómo protege las rutas sensibles?
**Respuesta Técnica:**
Implementamos RBAC a través de dos middlewares encadenados:
1. `authMiddleware.js`: Extrae y valida la identidad del usuario y adjunta el objeto `req.user` a la solicitud.
2. `roleMiddleware.js`: Es una función de orden superior (*higher-order function*) que recibe una lista de roles autorizados:
```javascript
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Acceso denegado: rol no autorizado para esta acción' 
      });
    }
    next();
  };
};
```
Por ejemplo, la ruta de aprobación está protegida con `authorize(['gerente_financiero', 'gerente_general', 'jefe_compras'])`, impidiendo que un bodeguero o asistente modifique estados de autorización.

---

### 19. Seguridad, Hashing (Bcrypt) y Variables de Entorno

#### Pregunta 19: ¿Cómo se protegen las credenciales de los usuarios y cómo se maneja la configuración sensible del sistema?
**Respuesta Técnica:**
1. **Hashing Criptográfico con Salt:** Las contraseñas nunca se almacenan en texto plano. Se procesan mediante la librería **bcrypt** aplicando un factor de costo (*work factor*) de 10 rondas de salting. Esto genera un hash unidireccional resistente a ataques de diccionario y tablas arcoíris (*rainbow tables*). Al autenticar, `bcrypt.compare()` valida la contraseña en tiempo constante contra ataques de temporización (*timing attacks*).
2. **Variables de Entorno (`.env`):** Parámetros confidenciales como `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` y `JWT_SECRET` se inyectan en tiempo de ejecución a través de `dotenv`.
3. **Control de Versiones (`.gitignore`):** El archivo `.env` está expresamente excluido de Git para impedir filtraciones en repositorios públicos. Se provee un archivo plantilla `.env.example` con variables documentadas y sin secretos.

---

### 20. Three-Way Match en Compras

#### Pregunta 20: ¿En qué consiste el principio Three-Way Match y cómo evita pérdidas económicas?
**Respuesta Técnica:**
El **Three-Way Match** (Conciliación de Tres Vías) es el control interno por excelencia en compras empresariales:
Cruza de forma obligatoria tres documentos antes de autorizar cualquier desembolso:
1. **Orden de Compra Autorizada:** Especifica qué se pidió, a qué precio pactado y en qué condiciones.
2. **Hoja de Recepción de Materiales:** Certifica qué ingresó físicamente a la bodega u obra, qué cantidad real llegó y con qué visto bueno de calidad.
3. **Factura Comercial del Proveedor:** Indica qué está cobrando el suplidor.

Si la factura cobra ₡6 450 pero la OC aprobada estipula ₡6 300, o si se facturaron 200 sacos pero la recepción física registró solo 100, el sistema congela el pago e instruye a Cuentas por Pagar a emitir una Nota de Débito o retención cautelar.

---

### 21. Diferenciación Financiera en el Ejercicio A3

#### Pregunta 21: ¿Por qué fue crucial en el ejercicio A3 separar los incumplimientos del Proveedor A de las compras a terceros y no sumar la posible compra duplicada como pérdida consumada?
**Respuesta Técnica:**
Desde la perspectiva contable, jurídica y de auditoría forense, mezclar estos conceptos distorsiona los estados financieros:
1. **Incumplimiento Directo del Proveedor A (₡60 000):** Existe un contrato legal vigente que fija precios en ₡6 300 (cemento) y ₡2 050 (acero). Las órdenes OC-1041 y OC-1042 cobraron ₡6 450 (+₡150 c/u por 400 sacos). Esto constituye una violación contractual líquida y exigible mediante reclamo legal inmediato o retención de facturas.
2. **Desviaciones por Compras Fuera de Contrato (₡163 000):** Son compras realizadas a proveedores no contratados (B, C y D) con sobrecostos frente al precio de referencia corporativo. Representan una falla de disciplina interna y gobernanza de compras.
3. **Exposición por Compra Duplicada (₡1 290 000):** Las órdenes gemelas OC-1041 y OC-1042 representan 200 sacos adicionales en riesgo. Si el material entró a la obra y se utilizó en colados, no hay pérdida de dinero (se tiene el activo físico), sino un problema de liquidez anticipada y sobrestock. Si el proveedor facturó dos veces un solo viaje de 200 sacos, entonces sí existiría cobro indebido. Por ello, la técnica contable exige **aislarlo como exposición contingente sujeta a auditoría física**.

---

### 22. Criterio Técnico de Homologación en el Ejercicio A2

#### Pregunta 22: ¿Por qué en el ejercicio A2 se condicionó el ahorro de ₡27 000 en varilla y por qué se rechazó la homologación de los guantes?
**Respuesta Técnica:**
Un sistema informático empresarial para el sector construcción no puede optimizar costos comprometiendo la seguridad estructural ni la salud ocupacional:
1. **Varilla de Acero:** La homologación entre *"Hierro 3/8 x 6 m"* y *"Varilla #3 grado 40"* genera un ahorro teórico de ₡27 000. Sin embargo, el hierro comercial de mantenimiento puede carecer del límite de fluencia de $40\text{ ksi}$ ($280\text{ MPa}$) exigido para elementos sismorresistentes por el Código Sísmico de Costa Rica. Por tanto, el ahorro se condicionó estrictamente a la presentación del certificado de calidad de fábrica bajo la norma **ASTM A615 Grado 40**.
2. **Guantes de Protección:** Los guantes de nitrilo (`SEG-GUA-NIT-L`) brindan impermeabilidad y resistencia contra sustancias químicas y solventes en talleres; los guantes de trabajo (`SEG-GUA-TRA-L`) son de carnaza reforzada para abrasión mecánica y manipulación de acero o block. Consolidarlos bajo un mismo código pondría en riesgo la integridad física de los operarios.

---

### 23. Manejo de Errores Centralizado y Rollback

#### Pregunta 23: ¿Cómo maneja el backend las excepciones inesperadas y cómo asegura que la base de datos no quede en un estado corrupto si falla una sentencia?
**Respuesta Técnica:**
1. **Bloques `try/catch` con `transaction.rollback()`:** En todos los servicios que modifican múltiples tablas o ejecutan validaciones condicionales, la transacción se inicializa explícitamente. Si ocurre cualquier error o excepción, el bloque `catch` invoca `await transaction.rollback()`, restaurando el estado original de la base de datos en InnoDB sin dejar registros parciales.
2. **Middleware Centralizado de Errores (`errorHandler.js`):** Ubicado al final del pipeline de Express con 4 argumentos `(err, req, res, next)`. Captura errores de Sequelize (`SequelizeValidationError`, `SequelizeUniqueConstraintError`), errores de base de datos (`ER_ROW_IS_REFERENCED_2`) y excepciones personalizadas de negocio, transformándolos en respuestas JSON amigables y estandarizadas con el código de estado correspondiente, ocultando trazas internas de pila (*stack traces*) en producción por seguridad.

---

### 24. Estrategia de Pruebas Automatizadas con Jest

#### Pregunta 24: ¿Qué pruebas contiene la suite automatizada `businessRules.test.js` y por qué se ejecutan directamente contra MySQL?
**Respuesta Técnica:**
La suite de Jest consta de **12 pruebas obligatorias** diseñadas para verificar el cumplimiento matemático, lógico y de persistencia:
1. Comprobación matemática exacta del $SS$ para el cemento (45 sacos).
2. Comprobación matemática exacta del $ROP$ para el cemento (165 sacos).
3. Activación de alerta reactiva de reorden para el block de concreto ($2800 \le 3600$).
4. Comprobación de silencio de alerta para la varilla ($850 > 800$).
5. Detección heurística de colisión de compras duplicadas entre OC-1041 y OC-1042.
6. Verificación de incremento físico de stock por movimiento de entrada (+100 unidades).
7. Verificación de decremento físico de stock por movimiento de salida (-20 unidades).
8. Verificación de que un traslado atómico entre depósitos mantiene constante el inventario global.
9. Validación de bloqueo y lanzamiento de excepción ante intento de salida con saldo insuficiente.
10. Asignación automática por la matriz de Gerencia Financiera y 3 cotizaciones para órdenes de ₡3 000 000.
11. Detección de compra fraccionada agrupada en ventana móvil de 30 días.
12. Consulta de trazabilidad forense completa de un material.

Se ejecutan directamente contra la base de datos MySQL real para garantizar fidelidad transaccional absoluta, validando que los disparadores, claves foráneas, restricciones de integridad y transacciones funcionen exactamente igual que en producción.

