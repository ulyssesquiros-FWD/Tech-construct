# Guion para Demostración en Vivo (Máximo 5 Minutos)

**Proyecto:** Sistema Empresarial de Gestión de Inventarios  
**Empresa Evaluada:** Constructora Del Valle S.A.  
**Tiempo Total Estimado:** 4 minutos y 45 segundos  
**Público:** Docente y Comité Evaluador del Quiz #2  

---

## Minuto 0:00 – 0:40 | 1. Inicio y Dashboard Principal
- **Pantalla:** Navegador en `http://localhost:3000` (Dashboard).
- **Acción:** Mostrar la interfaz visual corporativa, los KPI cards y los gráficos de Recharts.
- **Discurso Sugerido:**
  > *"Estimado profesor, presentamos el Sistema de Gestión de Inventarios desarrollado para Constructora Del Valle S.A. Como puede apreciarse, no utilizamos datos simulados ni almacenamiento en memoria: toda la información se consulta y asienta en tiempo real en una base de datos relacional MySQL normalizada.*
  > *En el Dashboard observamos de inmediato los indicadores clave: tenemos 10 materiales registrados, 5 bodegas y obras activas, y el sistema detecta automáticamente 2 materiales bajo el punto de reorden y alertas de compras duplicadas basadas en los datos de los ejercicios del quiz."*

---

## Minuto 0:40 – 1:20 | 2. Catálogo Maestro y Cálculo Automático de ROP
- **Pantalla:** Navegar a la sección **Materiales**.
- **Acción:** Mostrar la tabla de materiales con sus códigos taxonómicos (ej. `MAT-CEM-GRIS-050`) y presionar el botón **Nuevo Material**.
- **Discurso Sugerido:**
  > *"En el módulo de Materiales implementamos una taxonomía estandarizada. Observe que el punto de reorden y el stock de seguridad no son digitados por el usuario. Al completar la demanda diaria promedio de 40 sacos, la demanda máxima de 55 y el tiempo de entrega de 3 días para el cemento gris, el sistema calcula de manera reactiva en el backend un Stock de Seguridad de 45 sacos y un Punto de Reorden de 165 sacos, cumpliendo con total rigor las fórmulas del Ejercicio A5."*

---

## Minuto 1:20 – 2:05 | 3. Registro de Movimiento y Validación de Stock Negativo
- **Pantalla:** Navegar a la sección **Movimientos** y hacer clic en **Registrar Movimiento**.
- **Acción:**
  1. Intentar registrar una salida de 10 000 sacos de cemento en una obra que solo tiene 190 unidades (mostrar error de stock negativo).
  2. Registrar una salida legítima de 20 sacos o un traslado atómico de Bodega Central a Obra Norte.
- **Discurso Sugerido:**
  > *"Pasamos al módulo de Movimientos. Nuestro inventario se gestiona mediante un libro mayor estricto (ledger). Si un usuario intenta registrar una salida superior a las existencias físicas disponibles, el sistema valida y rechaza la transacción con un error explícito, evitando que el inventario caiga en números negativos.*
  > *Ahora registramos una salida legítima de 20 sacos: el balance se descuenta atómicamente y el saldo resultante queda actualizado en MySQL."*

---

## Minuto 2:05 – 2:50 | 4. Alertas Automáticas de Reorden y Cobertura
- **Pantalla:** Navegar a la sección **Alertas de Reorden**.
- **Acción:** Mostrar las alertas activas para el Block de concreto (2 800 <= 3 600) y la Arena fina (14 <= 20).
- **Discurso Sugerido:**
  > *"En el módulo de Alertas observamos cómo el motor del backend genera alertas persistentes cuando un material cae bajo su punto de reorden. Como exige el Ejercicio A5, el Block de concreto (existencia de 2 800 frente a un ROP de 3 600) y la Arena fina (14 m³ frente a un ROP de 20 m³) disparan alertas automáticas.*
  > *Además, priorizamos la reposición según los días de cobertura: la Arena tiene solo 2.33 días de inventario, lo que representa la máxima urgencia operativa, seguida por el Block con 4.67 días."*

---

## Minuto 2:50 – 3:45 | 5. Detección de Compras Duplicadas y Matriz de Aprobación
- **Pantalla:**
  1. Navegar a **Duplicados**.
  2. Luego navegar a **Aprobaciones**.
- **Acción:**
  1. Mostrar la coincidencia detectada entre **OC-1041** y **OC-1042** (mismo proveedor, fecha 02/10, cemento gris y 200 sacos). Explicar la exposición de ₡1 290 000.
  2. En Aprobaciones, mostrar cómo una orden de ₡3 000 000 escala automáticamente a Gerencia Financiera y exige 3 cotizaciones.
- **Discurso Sugerido:**
  > *"En la sección de Duplicados demostramos la resolución del Ejercicio A3: el sistema analizó las órdenes y detectó la coincidencia crítica entre OC-1041 y OC-1042, alertando una exposición económica de ₡1 290 000 para auditoría.*
  > *Asimismo, en la bandeja de Aprobaciones comprobamos la matriz del Ejercicio A1: las órdenes de hasta ₡250 000 son autorizadas por la jefatura del área con 1 cotización, mientras que compras de ₡3 000 000 exigen la autorización de Gerencia Financiera y la presentación obligatoria de 3 cotizaciones antes de poder aprobarse."*

---

## Minuto 3:45 – 4:45 | 6. Trazabilidad Forense y Conclusión
- **Pantalla:** Navegar a la sección **Trazabilidad** y seleccionar `MAT-CEM-GRIS-050`.
- **Acción:** Mostrar la reconstrucción de la línea de tiempo completa desde la entrada inicial hasta la última salida.
- **Discurso Sugerido:**
  > *"Finalmente, en el módulo de Trazabilidad seleccionamos cualquier material y el sistema reconstruye su historia completa: cada recepción con su orden de compra y proveedor, sus traslados inter-obra y sus salidas a cuadrillas, vinculando fecha, hora y usuario responsable.*
  > *Adicionalmente, en la pestaña de Reportes se encuentran detallados todos los cálculos del informe: el ahorro potencial de ₡89 000 por taxonomía estandarizada, la fuga de valor de ₡223 000 mensuales en contratos y la evaluación ponderada de Construplaza como proveedor principal con 4.28 puntos.*
  > *Con esto demostramos un sistema funcional, robusto y 100 % alineado a los criterios de evaluación del Quiz #2. Quedamos a su disposición para cualquier consulta."*

