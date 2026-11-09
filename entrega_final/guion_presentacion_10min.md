# GUION DE PRESENTACIÓN — DEFENSA TÉCNICA (10 MINUTOS)
## QUIZ #2: SISTEMA EMPRESARIAL DE GESTIÓN DE INVENTARIOS
**Empresa:** Tech-Construct S.A. | **Expositor y Administrador:** Ulysses | **Duración:** 10 Minutos

---

### RESUMEN DEL CONTROL DE TIEMPOS (Pacing Tracker)

| Diapositiva | Minuto Inicio | Minuto Fin | Tema Clave a Defender |
|:---:|:---:|:---:|---|
| **D1** | 0:00 | 1:00 | Portada, contexto corporativo de Tech-Construct y resumen de impacto. |
| **D2** | 1:00 | 2:00 | Diagnóstico operativo: las 4 vulnerabilidades vs. gobernanza digital. |
| **D3** | 2:00 | 3:00 | Circuito de 10 etapas, segregación funcional y matriz económica. |
| **D4** | 3:00 | 4:00 | Taxonomía de 2 niveles y captura demostrada de ₡89 000 en ahorros. |
| **D5** | 4:00 | 5:15 | Auditoría financiera: incumplimiento Proveedor A vs. compras fuera de contrato y riesgo duplicado. |
| **D6** | 5:15 | 6:00 | Selección multicriterio: Construplaza (70%) + EPA (30%). |
| **D7** | 6:00 | 7:00 | Reposición matemática: SS, ROP y días de cobertura (foco en Arena). |
| **D8** | 7:00 | 8:00 | Persistencia relacional 3NF y principio de libro mayor inmutable (Ledger). |
| **D9** | 8:00 | 9:00 | Certificación de calidad: 12/12 pruebas automatizadas en Jest. |
| **D10** | 9:00 | 10:00 | Conclusiones estratégicas, retorno de inversión y paso a demo. |

---

### GUION VERBAL PASO A PASO

#### DIAPOSITIVA 1: Portada y Contexto Empresarial (0:00 - 1:00)
> *"Buenos días profesor y compañeros. Mi nombre es **Ulysses**, Administrador del Sistema y desarrollador del proyecto. Hoy presento la solución integral empresarial desarrollada para el Quiz #2 de Gestión de Inventarios y Abastecimiento para la compañía **Tech-Construct S.A.**, empresa especializada en obras civiles, puentes y proyectos de edificación comercial.*
>
> *Para este proyecto adoptamos el **Camino 2: desarrollo de un backend propio**, estructurando una arquitectura desacoplada con Node.js, Express y Sequelize en el backend, una base de datos MySQL relacional en Tercera Forma Normal, y una Single Page Application moderna con React y Vite.*
>
> *Como resultado integral, no solo entregamos un software corporativo plenamente funcional, sino una solución analítica que demuestra una captura de **₡89 000** en ahorros inmediatos por estandarización, frena una fuga de valor mensual de **₡223 000**, neutraliza una exposición por compras duplicadas de **₡1 290 000** y valida al 100% sus reglas de negocio mediante una suite de 12 pruebas automatizadas."*

---

#### DIAPOSITIVA 2: Diagnóstico Inicial y Gobernanza Digital (1:00 - 2:00)
> *"Al analizar la operativa previa de Constructora Del Valle, identificamos cuatro vulnerabilidades críticas que ponían en jaque sus márgenes financieros y el avance físico de sus obras:*
>
> *Primero, una **compra desarticulada**, donde ingenieros en sitio realizaban adquisiciones directas en ferreterías con descripciones coloquiales y márgenes minoristas abusivos.*
> *Segundo, una **fuga sistemática de valor contractual**: pese a contar con un contrato marco con el Proveedor A con precios preferenciales fijados en ₡6 300 por saco de cemento y ₡2 050 por varilla, se aprobaron facturas con sobreprecios indebidos.*
> *Tercero, una **alta vulnerabilidad por compras duplicadas**, como ocurrió con las órdenes OC-1041 y OC-1042 emitidas el mismo día sin control cruzado.*
> *Y cuarto, **parálisis de frentes de obra** debido a quiebres de inventario de arena y blocks por carecer de modelos cuantitativos de reposición.*
>
> *Nuestra solución transforma esta realidad implementando gobernanza digital: un circuito formal de 10 etapas, una matriz de firmas blindada por software, motores heurísticos de detección preventiva y reposición matemática de existencias."*

---

#### DIAPOSITIVA 3: Circuito de Abastecimiento de 10 Etapas y Matriz de Aprobación (2:00 - 3:00)
> *"El corazón operativo del abastecimiento es nuestro circuito estructurado de diez etapas, diseñado bajo el principio de segregación estricta de funciones:*
> *Inicia con la Requisición del residente de obra, pasa por la aprobación técnica del área, el cuadro comparativo de Compras y la emisión de la Orden de Compra.*
>
> *En este punto actúa la **Matriz de Aprobación vinculante**, implementada a nivel de código y base de datos con cuatro niveles claros:*
> *1. Hasta ₡250 000: requiere firma de Jefatura de Área y 1 cotización.*
> *2. De ₡250 001 a ₡2 000 000: escala a Jefatura de Compras con un mínimo de 2 cotizaciones.*
> *3. De ₡2 000 001 a ₡10 000 000: requiere autorización de la Gerencia Financiera y 3 cotizaciones.*
> *4. Y montos superiores a ₡10 000 000: exigen dictamen de Gerencia General junto con el Comité de Adquisiciones.*
>
> *Tras la recepción física en obra, el sistema exige un **Three-Way Match obligatorio**: si la Orden, la Hoja de Recepción y la Factura no coinciden al 100%, el pago se retiene de forma automática antes de que el motor transaccional asiente la entrada en el libro mayor."*

---

#### DIAPOSITIVA 4: Taxonomía y Captura de Ahorro Directo (A2) (3:00 - 4:00)
> *"En el ejercicio A2 normalizamos el catálogo disperso mediante una taxonomía jerárquica de dos niveles: categorías mayores y subcategorías estandarizadas.*
>
> *Esto nos permitió auditar ocho líneas de compra y consolidar la demanda:*
> *En la familia del **Cemento Gris (540 sacos)**, unificamos las descripciones bajo el código `MAT-CEM-GRIS-050` al precio mínimo de ₡6 300, capturando un ahorro directo de **₡62 000**.*
> *En la familia del **Acero Estructural (560 barras)**, homologamos el hierro comercial de mantenimiento con la varilla estructural bajo el código `MAT-ACE-VAR-003` al precio de ₡2 150, logrando un ahorro de **₡27 000**.*
>
> *Queremos resaltar un criterio de ingeniería crítico: este ahorro en acero está explícitamente condicionado a que el material cuente con la certificación de norma ASTM A615 Grado 40. Si no cumple la norma, no puede ingresar a frentes estructurales.*
> *Asimismo, rechazamos la homologación de guantes de nitrilo con guantes de carnaza, pues responden a funciones de seguridad laboral mutuamente excluyentes. El ahorro directo capturado totaliza **₡89 000**."*

---

#### DIAPOSITIVA 5: Auditoría Forense de Gasto (A3) (4:00 - 5:15)
> *"El análisis del ejercicio A3 requirió una rigurosa separación analítica que distingue la naturaleza legal y contable de cada desviación:*
>
> *Primero, aislamos las **Diferencias Respecto al Precio Contractual del Proveedor A**: las órdenes OC-1041 y OC-1042 se facturaron a ₡6 450 existiendo un precio de referencia firmado a ₡6 300. Esta variación de ₡150 por saco representa una diferencia de **₡60 000**, la cual, bajo criterios rigurosos de auditoría, queda formalmente condicionada a la revisión del contrato marco, a la verificación de facturas electrónicas y a la comprobación de la recepción física en obra antes de tramitar cualquier reclamo o nota de crédito.*
>
> *Segundo, cuantificamos las **Desviaciones por Compras Fuera de Contrato**: adquisiciones no centralizadas a los proveedores B, C y compras spot minoristas al Proveedor D, sumando **₡163 000** en sobrecostos evitables. Con ello, la fuga de valor mensual real asciende a **₡223 000**, lo que representa **₡2 676 000** anualizados.*
>
> *Y en tercer lugar, aislamos con total rigor técnico la **Exposición Económica por la Posible Duplicidad** de OC-1041 y OC-1042 por **₡1 290 000**. No la contabilizamos como una pérdida consumada, sino como un riesgo de capital de trabajo y sobrestock sujeto a auditoría de recepción física en obra."*

---

#### DIAPOSITIVA 6: Selección Multicriterio de Proveedores (A4) (5:15 - 6:00)
> *"Para garantizar un suministro confiable, en el ejercicio A4 formulamos una matriz multicriterio con siete dimensiones ponderadas, destacando precio con 25%, calidad técnica con 25% y cumplimiento de plazos con 20%.*
>
> *Los resultados ponderados determinaron:*
> *En primer lugar, **Construplaza S.A. con una calificación de 4.280**, a quien adjudicamos el **70% del volumen como Proveedor Principal**, sustentado en sus certificaciones estructurales y garantía de entrega puntual en frentes de obra.*
> *Y en segundo lugar, **EPA S.A. con 4.065**, a quien asignamos el **30% como Proveedor Secundario**, aprovechando su competitividad en precios de oportunidad y su amplia red de sucursales para soporte logístico inmediato."*

---

#### DIAPOSITIVA 7: Reposición Matemática de Stock y Prioridades (A5) (6:00 - 7:00)
> *"En el ejercicio A5 abandonamos los pedidos por intuición e implementamos modelos dinámicos de reposición basados en la demanda promedio, demanda máxima y tiempo de entrega:*
> *Calculamos el Stock de Seguridad ($SS$), el Punto de Reorden ($ROP$) y los Días de Cobertura ($DC$).*
>
> *El diagnóstico de inventario reveló dos prioridades urgentes:*
> *La **Prioridad 1 y de máxima criticidad es la Arena Fina**, con solo **2.33 días de cobertura** frente a un tiempo de reposición de 2 días. Cualquier demora de medio día en el flete dejaría paralizada la elaboración de morteros y repellos.*
> *La **Prioridad 2 es el Block de Concreto 12x20x40**, con **4.67 días de cobertura** frente a un plazo de 4 días y existencias de 2 800 unidades, por debajo del ROP de 3 600.*
> *Mientras tanto, el cemento con 4.75 días y la varilla con 7.08 días se mantienen en zonas seguras de monitoreo."*

---

#### DIAPOSITIVA 8: Arquitectura 3NF y Principio del Ledger Inmutable (7:00 - 8:00)
> *"Pasando a la arquitectura técnica del sistema, diseñamos un modelo de datos en **Tercera Forma Normal compuesto por 14 tablas relacionales**, con claves foráneas e integridad referencial estricta.*
>
> *El principio arquitectónico fundamental del inventario es el **Patrón Libro Mayor o Ledger Inmutable**: el stock disponible no es una columna arbitraria que cualquier usuario pueda editar con un comando UPDATE. El stock físico se calcula como la sumatoria neta de asientos en la tabla `inventory_movements`.*
>
> *Esto nos otorga tres garantías inquebrantables:*
> *1. **Transacciones Atómicas ACID:** Los traslados entre dos bodegas se registran como pares vinculados mediante `transfer_group_id` en una misma transacción SQL.*
> *2. **Bloqueo Absoluto de Stock Negativo:** Antes de procesar cualquier salida o traslado, el backend verifica el saldo real en la ubicación; si la cantidad solicitada supera la existencia física, la base de datos aborta con error 400 y reversa la operación.*
> *3. **Trazabilidad Forense:** Cada movimiento queda sellado con usuario, documento de referencia, fecha, hora e IP en la tabla de auditoría."*

---

#### DIAPOSITIVA 9: Verificación de Pruebas Automatizadas (8:00 - 9:00)
> *"Para certificar que el sistema cumple con todas las especificaciones sin margen de error humano, implementamos una suite automatizada de pruebas unitarias y de integración con el framework **Jest** en `backend/tests/businessRules.test.js`.*
>
> *Estas 12 pruebas obligatorias se ejecutan directamente contra el motor MySQL:*
> *Comprueban las fórmulas de $SS$ y $ROP$, verifican la activación reactiva de alertas para el block y el silencio para la varilla, certifican la detección heurística de compras duplicadas entre OC-1041 y OC-1042, y comprueban el incremento y decremento correcto de stock por ubicación.*
> *Asimismo, verifican el traslado atómico que mantiene constante el inventario global, la excepción por saldo negativo, la asignación automática de la Gerencia Financiera con 3 cotizaciones para órdenes de ₡3 000 000, la alerta de compra fraccionada y la trazabilidad forense.*
> *El resultado es contundente: **12 pruebas pasadas de 12 ejecutadas en 3.56 segundos, con 100% de éxito**."*

---

#### DIAPOSITIVA 10: Conclusiones Estratégicas y Paso a la Demostración (9:00 - 10:00)
> *"En conclusión, este proyecto demuestra que la ingeniería de software aplicada con rigor metodológico resuelve problemas empresariales reales:*
> *Entrega un software Full Stack robusto, persistido en MySQL, respaldado por un código limpio, modular y completamente auditable.*
>
> *Protegemos el patrimonio de Tech-Construct S.A. ahorrando **₡89 000**, previniendo fugas anuales por **₡2 676 000**, blindando **₡1 290 000** contra fraudes o duplicidades y garantizando que ninguna obra se detenga por desabastecimiento de materiales.*
>
> *Muchas gracias por su atención. A continuación, iniciaremos la demostración técnica en vivo de 5 minutos recorriendo el sistema en tiempo real y quedamos a su entera disposición para responder las preguntas de la defensa."*

