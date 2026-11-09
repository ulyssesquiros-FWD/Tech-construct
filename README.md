# Sistema Empresarial de Gestión de Inventarios — Constructora Del Valle S.A.

> **QUIZ #2 — Gestión de Inventarios y Cadena de Suministros**  
> **Caso Seleccionado:** Opción 2 — Control de inventario para una empresa de construcción.  
> **Arquitectura:** Camino 2 (Backend Propio: Node.js + Express + Sequelize + MySQL + React + Vite).  

---

## 1. Visión General del Sistema

El sistema es una solución empresarial de tres capas desarrollada para **Constructora Del Valle S.A.** Permite controlar los materiales de construcción por bodega y obra, registrar compras y movimientos en un libro mayor (*ledger*) inmutable, calcular automáticamente los puntos de reorden, detectar compras duplicadas o fraccionadas y consultar la trazabilidad forense de cada material.

### Tecnologías Utilizadas
- **Frontend:** React 18, Vite, Recharts, Lucide Icons, CSS moderno y responsive.
- **Backend:** Node.js v22, Express 4.21, Sequelize ORM 6.37.
- **Base de Datos:** MySQL 8.0+ / 9.0+ (`gestion_inventarios`).
- **Pruebas Automatizadas:** Jest + Supertest (12 de 12 pruebas de negocio aprobadas).
- **Moneda Base:** Colones costarricenses (₡).

---

## 2. Estructura del Repositorio

```
Quiz2/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexión Sequelize y scripts de BD
│   │   ├── controllers/     # Controladores REST
│   │   ├── models/          # 14 Modelos Sequelize en 3NF
│   │   ├── routes/          # Definición de rutas Express
│   │   ├── seeders/         # Datos semilla
│   │   ├── services/        # Lógica de negocio (Stock, ROP, Matriz, Duplicados)
│   │   └── app.js           # Configuración de Express y middlewares
│   ├── tests/
│   │   └── businessRules.test.js # Suite de 12 pruebas obligatorias
│   ├── server.js            # Punto de entrada del backend (puerto 5000)
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── Components/      # Navbar, Sidebar, Modal, StatCard, Toast
│   │   ├── Pages/           # 12 Módulos de la aplicación
│   │   ├── services/        # Cliente API REST
│   │   ├── styles/          # Estilos corporativos CSS
│   │   ├── App.jsx          # Enrutador principal
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js       # Proxy y puerto 3000
│   └── index.html
│
├── database/
│   ├── schema.sql           # Esquema relacional en 3NF y vista
│   └── seed.sql             # Datos de prueba (Ejercicios A2, A3, A5)
│
├── docs/
│   ├── informe_quiz2.md     # Informe escrito técnico completo
│   ├── modelo_entidad_relacion.md # Diccionario y justificación 3NF
│   ├── diagrama_erd.mmd     # Diagrama Entidad-Relación (Mermaid)
│   ├── circuito_compras.mmd # Circuito de compras de 10 etapas (Mermaid)
│   ├── manual_usuario.md    # Manual operativo de los 12 módulos
│   ├── pruebas.md           # Informe de resultados de las 12 pruebas
│   ├── guion_demo.md        # Guion para demo en vivo (≤ 5 min)
│   └── guion_presentacion.md# Guion de presentación ejecutiva (10 min)
│
├── README.md
└── .gitignore
```

---

## 3. Requisitos Previos

- **Node.js:** Versión 18.0 o superior (verificado en v22.18.0).
- **npm:** Versión 9.0 o superior.
- **MySQL Server:** Versión 8.0 o 9.0 (ejecutándose en `localhost:3306`).

---

## 4. Configuración de Base de Datos y Variables de Entorno

### 4.1. Crear la Base de Datos en MySQL
Abra una consola MySQL o MySQL Workbench y cree la base de datos independiente:

```sql
CREATE DATABASE IF NOT EXISTS gestion_inventarios 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

### 4.2. Configurar el Archivo `.env` del Backend
En la carpeta `backend/`, copie el archivo de ejemplo o cree `.env`:

```bash
cd backend
cp .env.example .env
```

Contenido del archivo `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Conexión Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gestion_inventarios
DB_USER=root
DB_PASSWORD=1234
DB_DIALECT=mysql

# Reglas de negocio configurables
DUPLICATE_TIME_WINDOW_DAYS=3
DUPLICATE_QTY_TOLERANCE_PCT=10
SPLIT_PURCHASE_TIME_WINDOW_DAYS=30
SPLIT_PURCHASE_THRESHOLD_AMOUNT=2000000

# Seguridad
JWT_SECRET=constructora_del_valle_super_secret_key_2026
```

---

## 5. Instalación y Puesta en Marcha

### Paso 1: Instalar Dependencias
```bash
# Dependencias del Backend
cd backend
npm install

# Dependencias del Frontend
cd ../frontend
npm install
```

### Paso 2: Inicializar el Esquema y Cargar Datos Semilla
El comando automatizado ejecuta `database/schema.sql` y `database/seed.sql` en MySQL:

```bash
cd backend
npm run db:init
```

> **Verificación:** Este comando sincroniza las 14 tablas en 3NF, crea la vista `vw_current_inventory` y precarga todos los materiales, proveedores, órdenes y movimientos de los Ejercicios A2, A3 y A5.

### Paso 3: Iniciar el Servidor Backend
```bash
cd backend
npm start
# O para modo desarrollo con auto-reload:
npm run dev
```
El backend quedará escuchando en: `http://localhost:5000`  
Verifique la salud de la API en: `http://localhost:5000/api/health`

### Paso 4: Iniciar el Cliente Web Frontend
En otra terminal:
```bash
cd frontend
npm run dev
```
Abra en su navegador: `http://localhost:3000`

---

## 6. Usuarios de Demostración Disponibles

| Usuario | Correo Electrónico | Rol Corporativo | Facultad de Autorización |
|---|---|---|---|
| **Carlos Monge Abarca** | `admin@constructoradelvalle.cr` | Administrador del Sistema | Acceso total y auditoría forense |
| **Ing. Roberto Méndez** | `obras@constructoradelvalle.cr` | Jefatura de Obras | Aprueba requisiciones de obra |
| **Lic. Esteban Solís** | `compras@constructoradelvalle.cr` | Jefatura de Compras | Autoriza compras de ₡250 001 a ₡2 000 000 |
| **Licda. Mariana Cordero** | `financiera@constructoradelvalle.cr` | Gerencia Financiera | Autoriza compras de ₡2 000 001 a ₡10 000 000 |
| **Ing. Fernando Del Valle** | `gerencia@constructoradelvalle.cr` | Gerencia General | Autoriza compras mayores a ₡10 000 000 |
| **Jorge Ramírez Soto** | `bodega@constructoradelvalle.cr` | Encargado de Bodega | Registro de movimientos y recepciones |

*(Contraseña estándar de demostración: `123456`)*

---

## 7. Ejecución de Pruebas Automatizadas Obligatorias

El proyecto cuenta con una suite completa de 12 pruebas unitarias y de integración que comprueban las reglas de negocio exigidas en la rúbrica:

```bash
cd backend
npm test
```

### Lista de Casos Verificados:
1. `Prueba 1:` Cálculo de stock de seguridad para Cemento gris 50 kg ($SS = 45$).
2. `Prueba 2:` Cálculo de punto de reorden para Cemento gris 50 kg ($ROP = 165$).
3. `Prueba 3:` Material bajo punto de reorden genera alerta persistente (Block de concreto: 2 800 $\le$ 3 600).
4. `Prueba 4:` Material en nivel normal no genera alerta falsa (Varilla #3: 850 > 800).
5. `Prueba 5:` Detección automática de compra duplicada entre OC-1041 y OC-1042.
6. `Prueba 6:` Movimiento de entrada aumenta existencias en ubicación seleccionada (+100).
7. `Prueba 7:` Movimiento de salida disminuye existencias en ubicación (-20).
8. `Prueba 8:` Traslado inter-bodegas atómico mantiene invariable el stock global.
9. `Prueba 9:` Validación de stock negativo rechaza la transacción con excepción.
10. `Prueba 10:` Matriz de aprobación asigna Gerencia Financiera y 3 cotizaciones para ₡3 000 000.
11. `Prueba 11:` Detección preventiva de compras fraccionadas (*split purchases*).
12. `Prueba 12:` Trazabilidad forense completa reconstruye el ciclo de vida del material.

---

## 8. Catálogo de Endpoints de la API REST

### Materiales
- `GET /api/materiales` — Catálogo con stock actual y cobertura en días.
- `POST /api/materiales` — Registro con cálculo automático de $SS$ y $ROP$.
- `GET /api/materiales/:id` — Detalle y desglose de existencias por ubicación.
- `PUT /api/materiales/:id` — Actualización y reevaluación de alertas.
- `DELETE /api/materiales/:id` — Desactivación lógica de material.
- `GET /api/materiales/:id/stock` — Balance actual consolidado y por bodega.
- `GET /api/materiales/:id/trazabilidad` — Línea de tiempo completa.

### Ubicaciones
- `GET /api/ubicaciones` — Lista de bodegas y obras con total de unidades.
- `GET /api/ubicaciones/:id/inventario` — Materiales y valorización en ₡ en sitio.
- `POST /api/ubicaciones` — Alta de nueva bodega u obra.

### Movimientos de Inventario
- `GET /api/movimientos` — Libro mayor filtrado por tipo, material y fecha.
- `POST /api/movimientos` — Registro con validación preventiva de stock negativo y traslados atómicos.

### Órdenes de Compra y Duplicados
- `GET /api/ordenes` — Listado corporativo de órdenes.
- `POST /api/ordenes` — Creación con asignación automática de nivel de aprobación.
- `GET /api/ordenes/posibles-duplicados` — Listado de coincidencias detectadas.
- `POST /api/ordenes/escanear-duplicados` — Ejecución de escaneo heurístico.
- `GET /api/ordenes/fraccionamiento` — Alertas de compras fraccionadas.
- `POST /api/ordenes/escanear-fraccionamiento` — Análisis de acumulación por proyecto.

### Alertas y Aprobaciones
- `GET /api/alertas/reorden` — Alertas de materiales bajo punto de reorden.
- `POST /api/alertas/reorden/evaluar` — Reevaluación global de inventarios.
- `POST /api/alertas/:id/revisar` — Gestión de estado de alerta.
- `POST /api/alertas/duplicados/:id/revisar` — Dictamen de auditoría.
- `GET /api/aprobaciones/pendientes` — Bandeja de órdenes pendientes.
- `POST /api/aprobaciones/:id/aprobar` — Aprobación validando cotizaciones mínimas.
- `POST /api/aprobaciones/:id/rechazar` — Rechazo formal con justificación.

### Dashboard y Categorías
- `GET /api/dashboard/resumen` — KPIs y movimientos recientes.
- `GET /api/dashboard/estadisticas` — Datos para gráficos de Recharts.
- `GET /api/categorias` — Taxonomía de 2 niveles y familias de insumos.

---

## 9. Mapeo de Entregables del Quiz

| Entregable | Archivo en Repositorio | Descripción |
|---|---|---|
| **Entregable 1 (Informe Escrito)** | `docs/informe_quiz2.md` | Informe formal de 15 páginas con resolución detallada de A1 a A5, diagramas, arquitectura y conclusiones. |
| **Entregable 2 (Código & BD)** | `backend/`, `frontend/`, `database/` | Código fuente completo, migraciones, scripts SQL y suite de pruebas. |
| **Entregable 3 (Guion Demo 5 min)** | `docs/guion_demo.md` | Guion paso a paso con minutaje y acciones para la demostración en vivo. |
| **Entregable 4 (Guion Presentación 10 min)** | `docs/guion_presentacion.md` | Estructura de 9 puntos para la defensa ejecutiva ante el docente. |
| **Diagramas de Arquitectura** | `docs/diagrama_erd.mmd` y `docs/circuito_compras.mmd` | Diagramas en Mermaid para visualización en GitHub y herramientas de diseño. |

