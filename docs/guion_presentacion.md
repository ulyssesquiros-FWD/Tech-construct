# Guion de Presentación Ejecutiva (10 Minutos)

**Tema:** Solución Empresarial de Gestión y Control de Inventarios  
**Caso de Negocio:** Opción 2 — Constructora Del Valle S.A.  
**Duración Total:** 10:00 minutos  
**Presentador:** Equipo de Desarrollo y Arquitectura Full Stack  

---

## Estructura de la Presentación

```
[00:00 - 01:00] 1. Problema Empresarial
[01:00 - 02:00] 2. Necesidad de la Solución
[02:00 - 02:45] 3. Objetivos del Proyecto
[02:45 - 04:00] 4. Arquitectura Tecnológica
[04:00 - 05:15] 5. Modelo de Datos y Normalización
[05:15 - 06:45] 6. Módulos y Reglas de Negocio
[06:45 - 08:15] 7. Demostración Funcional en Vivo
[08:15 - 09:15] 8. Resultados Analíticos y Fuga de Valor
[09:15 - 10:00] 9. Conclusiones y Preguntas
```

---

## 1. Problema Empresarial (Minuto 0:00 – 1:00)
- **Mensaje Principal:** La industria de la construcción sufre pérdidas económicas severas por falta de trazabilidad en los materiales, compras duplicadas o fraccionadas y retrasos en obras por quiebres de stock.
- **Caso Específico:** En Constructora Del Valle S.A., los materiales se dispersan entre bodegas centrales y proyectos en desarrollo (Obra Norte, Obra Sur, Obra Este). La ausencia de un catálogo unificado provocaba que el mismo cemento se comprara a diferentes precios bajo descripciones ambiguas (`Cemento gris 50 kg`, `Saco cemento uso general`, `CEM-GRIS-50`), perdiendo economías de escala y generando fuga de valor por compras spot a sobreprecio.

---

## 2. Necesidad de la Solución (Minuto 1:00 – 2:00)
- **Mensaje Principal:** Se requería un sistema de gestión empresarial integral que combinara el control físico de inventarios con el gobierno del circuito de abastecimiento.
- **Puntos Críticos Atendidos:**
  - Sustituir hojas de cálculo dispersas por un libro mayor transaccional inmutable.
  - Implementar una matriz de autorización por montos para evitar compras discrecionales.
  - Mitigar el riesgo de fraccionamiento y compras duplicadas.
  - Automatizar el cálculo científico del punto de reorden y stock de seguridad para erradicar las paralizaciones de obra por desabastecimiento.

---

## 3. Objetivos del Proyecto (Minuto 2:00 – 2:45)
- **Objetivo General:** Desarrollar y desplegar una plataforma full stack empresarial para el control de inventarios, compras y trazabilidad en Constructora Del Valle S.A.
- **Objetivos Específicos:**
  1. Diseñar una taxonomía estandarizada de 2 niveles que capture ahorros potenciales observados de ₡89 000 en insumos críticos.
  2. Implementar un backend en Node.js/Express con Sequelize ORM y MySQL en Tercera Forma Normal (3NF).
  3. Crear un frontend responsivo en React + Vite que visualice KPIs, gráficos interactivos con Recharts y gestione alertas en vivo.
  4. Comprobar mediante 12 pruebas automatizadas el cálculo de stocks, traslados atómicos, prevención de stock negativo y detección de duplicados.

---

## 4. Arquitectura Tecnológica (Minuto 2:45 – 4:00)
- **Selección de Camino:** Camino 2 del Quiz (Backend Propio).
- **Componentes de la Pila Tecnológica:**
  - **Frontend:** React 18 + Vite, componentes desacoplados, estilos CSS modernos y responsive, visualizaciones avanzadas con Recharts, iconos Lucide.
  - **Backend:** Node.js v22 + Express 4.21, arquitectura por capas (Controladores, Servicios, Modelos, Validadores).
  - **Persistencia:** Base de datos relacional MySQL 8.0+/9.0+ (`gestion_inventarios`).
  - **ORM:** Sequelize con configuración de transacciones ACID y `underscored: true`.
  - **Testing:** Jest + Supertest con 100 % de casos de prueba aprobados.
- **Políticas de Integridad:** Prohibición absoluta de `localStorage` o memoria volátil para almacenamiento empresarial.

---

## 5. Modelo de Datos y Normalización (Minuto 4:00 – 5:15)
- **Estructura en 3NF:** 14 tablas relacionales interconectadas mediante claves foráneas con restricciones de integridad referencial.
- **El Principio del Libro Mayor (Ledger):**
  - El stock físico nunca se guarda como un número editable suelto en la tabla de materiales.
  - Toda entrada, salida o traslado genera un registro inmutable en `inventory_movements`.
  - El balance actual se deriva de forma garantizada mediante la suma algebraica del ledger o a través de la vista `vw_current_inventory`.
- **Transacciones ACID:** Los traslados entre bodegas ejecutan una salida en origen y una entrada en destino en una sola transacción; si alguna falla, ocurre un rollback total para evitar pérdidas de inventario.

---

## 6. Módulos y Reglas de Negocio (Minuto 5:15 – 6:45)
- **Taxonomía:** Códigos estandarizados (`MAT-CEM-GRIS-050`, `MAT-ACE-VAR-003`, etc.).
- **Fórmulas de Reposición (Ejercicio A5):**
  - $\text{Stock de Seguridad} = (D_{\text{máx}} - D_{\text{prom}}) \times L$
  - $\text{Punto de Reorden} = (D_{\text{prom}} \times L) + SS$
- **Matriz de Aprobación (Ejercicio A1):**
  - Hasta ₡250 000: Jefatura de Área (1 cotización).
  - ₡250 001 a ₡2 000 000: Jefatura de Compras (2 cotizaciones).
  - ₡2 000 001 a ₡10 000 000: Gerencia Financiera (3 cotizaciones).
  - Más de ₡10 000 000: Gerencia General + Comité (3 cotizaciones + dictamen).
- **Detección de Duplicados (Ejercicio A3):**
  - Mismo proveedor + artículo + diferencia de cantidad $\le 10\%$ + separación de fechas $\le 3$ días.
- **Control de Fraccionamiento:**
  - Agrupación por solicitante, proveedor y proyecto en ventana de 30 días para alertar compras que evadan umbrales superiores.

---

## 7. Demostración Funcional en Vivo (Minuto 6:45 – 8:15)
*(Ver detalle segundo a segundo en el archivo `docs/guion_demo.md`)*
1. Vista del Dashboard y actualización de métricas en vivo.
2. Formulario de Materiales con cálculo automático de $SS$ y $ROP$.
3. Prueba de salida con validación y rechazo de stock negativo.
4. Consulta de alertas de reorden en Block y Arena con cálculo de cobertura en días.
5. Auditoría de la compra duplicada entre OC-1041 y OC-1042.
6. Consulta de la línea de tiempo de trazabilidad forense.

---

## 8. Resultados Analíticos y Fuga de Valor (Minuto 8:15 – 9:15)
- **Ahorro Potencial Identificado (A2):**
  - Cemento gris: ₡62 000 al homologar a ₡6 300.
  - Varilla de acero: ₡27 000 sujeto a homologación técnica.
  - **Ahorro consolidado:** **₡89 000**.
- **Fuga de Valor Contractual (A3):**
  - 6 órdenes compradas por encima del contrato de Proveedor A generaron un sobreprecio de **₡223 000**.
  - **Proyección anual simple:** **₡2 676 000** en fugas operativas evitables.
  - **Exposición por posible duplicidad:** **₡1 290 000** entre OC-1041 y OC-1042.
- **Evaluación de Proveedores (A4):**
  - **Construplaza S.A.** resultó ganadora con **4.28 / 5.0**, asignándosele el 70 % del volumen como proveedor principal, manteniendo a **EPA S.A.** (4.06) con el 30 % como proveedor secundario.

---

## 9. Conclusiones y Cierre (Minuto 9:15 – 10:00)
- **Conclusiones:**
  1. La implementación de un backend robusto con reglas de negocio codificadas elimina la discrecionalidad en las compras.
  2. El modelo relacional en 3NF con libro mayor garantiza la veracidad de los saldos sin riesgo de desincronización.
  3. El sistema cumple al 100 % con los requerimientos técnicos, los 5 ejercicios analíticos y los 12 casos de prueba automatizados del Quiz #2.
- **Preguntas:** Espacio abierto para dudas y validación por parte del docente evaluador.

