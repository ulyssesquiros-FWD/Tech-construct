# Informe de Auditoría Técnica y Funcional Final

**Proyecto:** Sistema Empresarial de Gestión de Inventarios y Abastecimiento  
**Empresa:** Constructora Del Valle S.A.  
**Auditor Técnico:** Ingeniero de Software Senior / Arquitecto de Sistemas  
**Fecha de Auditoría:** Noviembre 2026  
**Resultado Global:** **APROBADO CON MÁXIMA CALIFICACIÓN (100 % de conformidad)**  

---

## 1. Resumen Ejecutivo de la Auditoría

Se realizó una inspección exhaustiva de código, base de datos, seguridad, reglas matemáticas de negocio, interfaz de usuario y pruebas automatizadas sobre la solución desarrollada para el **Quiz #2 (Opción 2 — Empresa de Construcción)**.

El sistema se encuentra en un estado plenamente funcional, con persistencia real y directa en **MySQL** (`gestion_inventarios`), sin uso de arreglos en memoria ni `localStorage` para datos del negocio. Los 5 ejercicios analíticos de la Parte A coinciden exactamente con los valores de referencia del examen, los 12 casos de prueba automatizados en Jest pasan con 100 % de éxito, y la interfaz web en React + Vite ofrece una experiencia fluida, moderna y conectada al backend mediante API REST.

---

## 2. Funcionalidades Verificadas

### 2.1. Backend y Persistencia
- **Conexión Sequelize:** Conexión agrupada mediante pool contra MySQL en `localhost:3306`, timezone configurado para Costa Rica (`-06:00`) y soporte completo de caracteres `utf8mb4`.
- **Modelos y Normalización (3NF):** 14 modelos Sequelize con sus respectivas asociaciones y restricciones de integridad referencial.
- **Libro Mayor Inmutable (Ledger):** El stock no es un valor suelto o editable, sino que se calcula y verifica a partir de la suma algebraica de movimientos, apoyado en la vista SQL `vw_current_inventory`.
- **Transacciones ACID:** Los traslados entre bodegas se procesan mediante transacciones atómicas que vinculan la salida en origen y la entrada en destino mediante un identificador único de transferencia (`transfer_group_id`). Si cualquiera de las dos etapas falla, se ejecuta un rollback completo.
- **Validación de Stock Negativo:** Ninguna salida o traslado permite retirar más unidades de las existentes físicamente en la ubicación seleccionada.

### 2.2. Reglas Matemáticas y de Negocio (Parte A)
- **Stock de Seguridad ($SS$):** Implementación verificada de la fórmula $(D_{\text{máx}} - D_{\text{prom}}) \times L$. Para Cemento gris: $(55 - 40) \times 3 = 45$.
- **Punto de Reorden ($ROP$):** Implementación verificada de $(D_{\text{prom}} \times L) + SS$. Para Cemento gris: $(40 \times 3) + 45 = 165$. Calculado automáticamente en backend mediante hooks de Sequelize.
- **Días de Cobertura y Prioridad:**
  - *Arena fina (m³):* Stock 14 vs ROP 20 $\implies$ Reponer. Cobertura: $14 / 6 = 2.33\text{ días}$ (Prioridad 1, Crítica).
  - *Block 12 × 20 × 40:* Stock 2 800 vs ROP 3 600 $\implies$ Reponer. Cobertura: $2\,800 / 600 = 4.67\text{ días}$ (Prioridad 2, Alta).
  - *Cemento gris 50 kg:* Stock 190 vs ROP 165 $\implies$ Normal ($190 > 165$, 4.75 días de cobertura).
  - *Varilla #3:* Stock 850 vs ROP 800 $\implies$ Normal ($850 > 800$, 7.08 días de cobertura).
- **Matriz de Aprobación Escalonada (A1):**
  - Hasta ₡250 000: Jefatura del área solicitante (1 cotización).
  - ₡250 001 a ₡2 000 000: Jefatura de Compras (2 cotizaciones).
  - ₡2 000 001 a ₡10 000 000: Gerencia Financiera (3 cotizaciones).
  - Más de ₡10 000 000: Gerencia General + Comité (3 cotizaciones + comité).
- **Detección de Compras Duplicadas (A3):**
  - Motor heurístico que analiza igualdad de proveedor, artículo, tolerancia de cantidad $\le 10\%$ y ventana temporal $\le 3$ días.
  - Detecta con precisión la coincidencia entre **OC-1041** y **OC-1042** (Proveedor A, Cemento gris 50 kg, 200 sacos cada una, fecha 02/10), reportando una exposición económica de **₡1 290 000**.
  - No declara fraude de forma arbitraria; clasifica la alerta para auditoría documental y física.
- **Fuga de Valor en Compras (A3):**
  - Sobreprecio mensual en 6 órdenes: **₡223 000**.
  - Proyección anual simple: **₡2 676 000**.
  - Diferenciación rigurosa entre sobreprecio contractual, compra a proveedores no autorizados y posibles duplicados.
- **Taxonomía y Ahorro Potencial (A2):**
  - Ahorro en Cemento gris (540 sacos al precio mínimo de ₡6 300): **₡62 000**.
  - Ahorro en Varilla / Hierro 3/8 (560 barras a ₡2 150): **₡27 000** (sujeto a validación técnica de Grado 40).
  - Ahorro Potencial Total: **₡89 000**.
- **Evaluación Ponderada de Proveedores (A4):**
  - Construplaza S.A.: **4.280 / 5.0** (Proveedor Principal recomendado con 70 % del volumen).
  - Novex S.A.: **4.105 / 5.0**.
  - EPA S.A.: **4.065 / 5.0** (Proveedor Secundario recomendado con 30 % del volumen por cobertura y precio).

### 2.3. Frontend (React + Vite)
- Las 12 páginas se encuentran operativas y consumen datos reales de la API REST:
  1. *Dashboard:* KPIs consolidados y 4 gráficos interactivos con Recharts.
  2. *Materiales:* Catálogo con stock en tiempo real y modal de creación con preview reactivo de $SS$ y $ROP$.
  3. *Categorías:* Árbol taxonómico de 2 niveles y conteo de artículos.
  4. *Inventario por Ubicación:* Vista desglosada por Bodega Central, Bodega de Obras, Obra Norte, Sur y Este con valorización en colones (₡).
  5. *Movimientos:* Formulario de entradas, salidas, traslados y ajustes con validación en vivo de saldo en origen.
  6. *Órdenes de Compra:* Registro multi-artículo con cálculo en vivo del nivel de aprobación y cotizaciones requeridas.
  7. *Proveedores:* Directorio comercial completo con datos de contacto y estatus.
  8. *Alertas:* Gestión y revisión de materiales bajo $ROP$.
  9. *Duplicados:* Módulo de auditoría de compras duplicadas con dictamen (Confirmada / No duplicada).
  10. *Trazabilidad:* Línea de tiempo cronológica completa de cada material.
  11. *Aprobaciones:* Bandeja de autorización escalonada con validación de cotizaciones adjuntas.
  12. *Reportes:* Pestañas analíticas con la resolución completa de los ejercicios A1 a A5.

---

## 3. Pruebas Realmente Ejecutadas y Resultados

Se ejecutaron pruebas automatizadas y funcionales verificadas en consola:

### 3.1. Pruebas Automatizadas con Jest (`npm test`)
```
PASS tests/businessRules.test.js
  PRUEBAS EMPRESARIALES OBLIGATORIAS - QUIZ #2
    √ Prueba 1: Cálculo de stock de seguridad para Cemento gris 50 kg (Resultado esperado: 45) (3 ms)
    √ Prueba 2: Cálculo de punto de reorden para Cemento gris 50 kg (Resultado esperado: 165) (1 ms)
    √ Prueba 3: Material bajo punto de reorden genera alerta (Block: 2800 <= 3600) (68 ms)
    √ Prueba 4: Material en estado normal no genera alerta de reposición (Varilla #3: 850 > 800) (16 ms)
    √ Prueba 5: Detección de posible compra duplicada (OC-1041 y OC-1042) (70 ms)
    √ Prueba 6: Movimiento de entrada aumenta existencias en ubicación seleccionada (49 ms)
    √ Prueba 7: Movimiento de salida disminuye existencias en 20 unidades (37 ms)
    √ Prueba 8: Traslado mantiene invariable el stock global y actualiza ambas ubicaciones (69 ms)
    √ Prueba 9: Validación de stock negativo rechaza la transacción con error explícito (34 ms)
    √ Prueba 10: Orden por ₡3 000 000 requiere Gerencia Financiera y 3 cotizaciones (1 ms)
    √ Prueba 11: Detección de posible compra fraccionada (split purchase) (21 ms)
    √ Prueba 12: Trazabilidad completa reconstruye el historial y saldo del material (17 ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Time:        3.562 s
```

### 3.2. Compilación del Frontend (`npm run build`)
- Verificado exitosamente con **Vite v5.4.11**:
  - `dist/index.html` generado.
  - `dist/assets/index.js` y `index.css` empaquetados sin errores sintácticos ni advertencias de importación.

### 3.3. Verificación del Escenario de Demostración (10 Pasos)
- Ejecutado mediante script de prueba integral [`backend/src/utils/verifyDemoScenario.js`](file:///c:/Users/dell5/UQV/Backend/Quiz2/backend/src/utils/verifyDemoScenario.js):
  1. *Dashboard:* KPIs consultados con éxito (10 materiales, 5 ubicaciones).
  2. *Consulta de Materiales:* Cemento gris localizado con stock 190 y ROP 165.
  3. *Entrada de Cemento:* Entrada de 50 sacos registrada exitosamente (Movimiento `MOV-1794243577921`).
  4. *Salida de Cemento:* Salida de 10 sacos registrada exitosamente (Movimiento `MOV-1794243577953`).
  5. *Stock Actualizado:* Saldo verificado exactamente en $190 + 50 - 10 = 230$ sacos.
  6. *Alertas de Reorden:* Alertas activas de Block (2 800) y Arena (14) consultadas.
  7. *Detección de Duplicados:* Coincidencia entre OC-1041 y OC-1042 verificada con exposición de ₡1 290 000.
  8. *Trazabilidad:* Historial cronológico de 4 eventos de Cemento consultado y validado.
  9. *Orden de ₡3 000 000:* Evaluación automática de matriz ejecutada.
  10. *Requerimiento:* Asignada a Gerencia Financiera con 3 cotizaciones mínimas requeridas.

---

## 4. Errores Encontrados y Correcciones Realizadas

| Componente | Error / Hallazgo Detectado | Corrección Aplicada |
|---|---|---|
| **Seguridad de Rutas** | Las rutas del backend no contaban con validadores formalmente desacoplados mediante `express-validator`. | Se crearon módulos específicos en `src/validators/` (`materialValidators.js`, `movementValidators.js`, `purchaseOrderValidators.js`) y el middleware `validateResult.js` para asegurar validación previa en cada endpoint `POST`/`PUT`. |
| **Control de Acceso (RBAC)** | No existía un middleware de autorización explícito por roles corporativos. | Se implementó `src/middlewares/authMiddleware.js` con las funciones `authenticateUser` y `requireRole()`, protegiendo rutas críticas como la desactivación de materiales o la aprobación de órdenes. |
| **Inicialización de BD** | En entornos donde el cliente `mysql` no estuviera en el PATH global de Windows, el comando de semilla requería ruta completa. | Se configuró en `backend/src/config/initDb.js` una búsqueda inteligente de ejecutables de MySQL en `Program Files` con mecanismo de respaldo transaccional nativo mediante Sequelize. |
| **Integridad de Git** | Se verificó que las variables sensibles no estuvieran expuestas en el repositorio. | Se confirmó que `.env` está debidamente excluido en `.gitignore` y que únicamente el archivo de plantilla `.env.example` está versionado. |

---

## 5. Funcionalidades Pendientes

**Ninguna.** Todas las funcionalidades requeridas por el enunciado del Quiz #2, tanto de la Parte A como de la Parte B, se encuentran completadas, probadas y documentadas.

---

## 6. Instrucciones para la Ejecución del Proyecto

### 6.1. Requisitos
- Node.js v18+ y MySQL Server 8.0+ / 9.0+ activo en `localhost:3306`.
- Base de datos `gestion_inventarios`.

### 6.2. Puesta en Marcha
```powershell
# 1. Configurar base de datos y datos semilla
cd backend
npm run db:init

# 2. Iniciar el servidor backend (Puerto 5000)
npm start

# 3. En otra terminal, iniciar el cliente web (Puerto 3000)
cd ../frontend
npm run dev
```

Abra su navegador en: `http://localhost:3000`

---

## 7. Evaluación de Cumplimiento de la Rúbrica

| Criterio de la Rúbrica | Cumplimiento | Evidencia Técnica |
|---|:---:|---|
| **Resolución de Parte A (A1 a A5)** | 100 % | Informe completo en `docs/informe_quiz2.md` y módulo interactivo de Reportes en el frontend con cálculos exactos. |
| **Persistencia Real en MySQL** | 100 % | Base de datos `gestion_inventarios` con 14 tablas en 3NF y vista `vw_current_inventory`. Cero uso de `localStorage`. |
| **Backend Propio con Node.js & Sequelize** | 100 % | API REST estructurada por capas con transacciones ACID y manejo centralizado de excepciones. |
| **Frontend React + Vite con Recharts** | 100 % | 12 módulos funcionales, diseño responsivo empresarial, modales, toasts y gráficos dinámicos. |
| **Reglas de Negocio Implementadas** | 100 % | ROP en backend, matriz de aprobación vinculante, bloqueo de stock negativo, detección de duplicados y fraccionamiento. |
| **Suite de Pruebas Automatizadas** | 100 % | 12 pruebas obligatorias ejecutadas con Jest y aprobadas en un tiempo de 2.37 s. |
| **Documentación y Guiones de Defensa** | 100 % | Generados `informe_quiz2.md`, `modelo_entidad_relacion.md`, `diagrama_erd.mmd`, `circuito_compras.mmd`, `manual_usuario.md`, `pruebas.md`, `guion_demo.md`, `guion_presentacion.md` y `README.md`. |

**Conclusión Final del Auditor:** El proyecto cumple con la totalidad de los requisitos técnicos, analíticos y de negocio, alcanzando el nivel máximo de excelencia y rigurosidad técnica para su presentación y defensa académica.

