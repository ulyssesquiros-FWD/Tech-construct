# ENTREGA FINAL Y DEFENSA DE PROYECTO — QUIZ #2
## SISTEMA EMPRESARIAL DE GESTIÓN DE INVENTARIOS Y ABASTECIMIENTO
**Constructora Del Valle S.A.** | **Cédula Jurídica:** 3-101-558899

---

### 1. MAPA Y LISTADO DE ENTREGABLES

Todos los documentos, código y recursos para la defensa académica y técnica se encuentran organizados dentro de esta carpeta `entrega_final/`:

| Archivo / Carpeta | Tipo de Documento | Descripción y Propósito |
|---|:---:|---|
| **`informe_quiz2.pdf`** | Documento PDF (9 páginas) | **Informe oficial compilado con portada formal, índice, ejercicios A1 a A5, arquitectura, pruebas y conclusiones.** |
| **`informe_quiz2.md`** | Markdown | Documento fuente completo del informe con todas las tablas financieras y cálculos analíticos. |
| **`informe_quiz2.html`** | HTML Ejecutivo | Versión HTML estilizada para lectura web o impresión local. |
| **`presentacion_quiz2.html`** | Aplicación Web Interactiva | **Presentación de diapositivas interactiva (10 diapositivas) para la defensa de 10 minutos con controles de teclado (`Left`/`Right`, `Space`, `F` para fullscreen).** |
| **`presentacion_quiz2.md`** | Markdown | Guía resumida de diapositivas en texto estructurado. |
| **`guion_presentacion_10min.md`** | Guion de Expositor | Pacing tracker y libreto verbal segundo a segundo (0:00 a 10:00) para el expositor. |
| **`guion_demostracion_5min.md`** | Guion de Demostración | **Guion técnico de 10 pasos para realizar la demostración en vivo del software en 4 min 45 s.** |
| **`guia_preguntas_defensa.md`** | Guía de Preguntas (24) | **24 preguntas técnicas profundas y respuestas modelo sobre Node.js, Express, React, Vite, MySQL, Sequelize, 3NF, transacciones, ROP, Ledger y seguridad.** |
| **`diagramas/`** | Directorio de Diagramas | Carpeta con diagramas arquitectónicos de alta legibilidad en formatos SVG, HTML interactivo y MMD: |
| ├── `circuito_compras.html` | Visualizador HTML | Circuito de abastecimiento interactivo de 10 etapas con matriz económica y Three-Way Match. |
| ├── `circuito_compras.svg` | Gráfico Vectorial | Diagrama de flujo vectorial independiente y de alta resolución. |
| ├── `circuito_compras.mmd` | Mermaid | Código fuente Mermaid del circuito. |
| ├── `diagrama_erd.html` | Visualizador HTML | Diagrama Entidad-Relación interactivo de 14 tablas en 3NF con tarjetas de atributos. |
| ├── `diagrama_erd.svg` | Gráfico Vectorial | Diagrama ERD vectorial con relaciones, dominios y claves PK/FK. |
| └── `diagrama_erd.mmd` | Mermaid | Código fuente Mermaid del ERD. |

---

### 2. RESUMEN DE CÁLCULOS ANALÍTICOS Y FINANCIEROS (PARTE A)

#### Ejercicio A1: Circuito de Abastecimiento y Matriz de Aprobación
- Circuito de 10 etapas: Requisición ➔ Aprobación ➔ Cuadro Cotizaciones ➔ Generación OC ➔ Matriz de Firmas ➔ Recepción Física ➔ Factura Electrónica ➔ Three-Way Match ➔ Pago Tesorería ➔ Asiento Atómico en Ledger.
- Umbrales vinculantes:
  - $\le$ ₡250 000: Jefatura de Área (1 cotización).
  - ₡250 001 a ₡2 000 000: Jefatura de Compras (2 cotizaciones).
  - ₡2 000 001 a ₡10 000 000: Gerencia Financiera (3 cotizaciones).
  - \> ₡10 000 000: Gerencia General + Comité (3 cotizaciones + Acta formal).
- Detección de fraccionamiento: ventana móvil de 30 días acumulada por proveedor y proyecto.

#### Ejercicio A2: Taxonomía y Ahorro Directo
- Taxonomía normalizada de 2 niveles: Familias maestras (`MAT`, `SEG`, `TUB`, `HER`) y subfamilias estandarizadas.
- Familia Cemento: Consolidación bajo `MAT-CEM-GRIS-050` al precio mínimo de ₡6 300 $\implies$ **Ahorro de ₡62 000**.
- Familia Acero: Homologación bajo `MAT-ACE-VAR-003` al precio de ₡2 150 $\implies$ **Ahorro de ₡27 000** (condicionado a certificación ASTM A615 Grado 40).
- Guantes de Protección: Nitrilo vs. carnaza no se consolidan por razones de salud y seguridad laboral.
- **Ahorro Total Directo:** **₡89 000**.

#### Ejercicio A3: Desglose Riguroso de Gasto y Fuga de Valor
- **1. Incumplimiento Directo Contrato Proveedor A:** OC-1041 y OC-1042 cobradas a ₡6 450 (+₡150 c/u por 400 sacos) $\implies$ **₡60 000** (Reclamo y Nota de Crédito inmediata).
- **2. Desviaciones por Compras a Terceros (Prov. B, C, D):** Sobrecostos por compras dispersas fuera de contrato marco $\implies$ **₡163 000**.
- **3. Fuga Real Mensual Consolidada:** $\text{₡}60 000 + \text{₡}163 000 = \mathbf{\text{₡}223 000}$ ($\implies \mathbf{\text{₡}2 676 000}$ al año).
- **4. Exposición Económica por Posible Duplicidad (OC-1041 / OC-1042):** $\mathbf{\text{₡}1 290 000}$ (Aislado como riesgo de liquidez y sobreabastecimiento sujeto a auditoría física, **no** como pérdida confirmada).

#### Ejercicio A4: Selección Multicriterio de Proveedores
- Matriz ponderada de 7 criterios:
  - 🥇 **Construplaza S.A. (4.280):** Adjudicación del **70%** (Proveedor Principal) por calidad técnica y cumplimiento de plazos.
  - 🥈 **EPA S.A. (4.065):** Adjudicación del **30%** (Proveedor Secundario) por precios de oportunidad y red logística capilar.
  - Novex S.A. (4.105): Tercer lugar competitivo.

#### Ejercicio A5: Reposición Matemática y Días de Cobertura
- Fórmulas: $SS = (D_{\text{máx}} - D_{\text{prom}}) \times L$; $ROP = (D_{\text{prom}} \times L) + SS$; $DC = \text{Stock Actual} / D_{\text{prom}}$.
- 🚨 **Prioridad 1 (Crítica): Arena fina:** $DC = \mathbf{2.33\text{ días}}$ (Stock = 14 m³ $\le ROP = 20\text{ m³}$). Urgencia máxima para evitar paro de colados.
- ⚠️ **Prioridad 2 (Alta): Block 12×20×40:** $DC = \mathbf{4.67\text{ días}}$ (Stock = 2 800 un. $\le ROP = 3 600\text{ un.}$).
- Cemento ($DC = 4.75$) y Varilla ($DC = 7.08$): Normales en monitoreo preventivo.

---

### 3. ARQUITECTURA TÉCNICA Y PERSISTENCIA (PARTE B)

- **Tecnologías:**
  - Frontend: React 18, Vite 5.4, Recharts 2.15, Lucide Icons, CSS responsivo.
  - Backend: Node.js 22, Express 4.21, Sequelize 6.37, express-validator.
  - Base de Datos: MySQL 9.6 (`gestion_inventarios`).
- **Persistencia en 3NF y Patrón Ledger:**
  - 14 tablas relacionales con restricciones de clave foránea (`ON DELETE RESTRICT`).
  - El inventario físico se calcula como suma de asientos inmutables en `inventory_movements`.
  - Traslados atómicos vinculados mediante `transfer_group_id` en una sola transacción SQL.
  - Bloqueo preventivo de stock negativo: las salidas rechazan la transacción si no hay saldo suficiente en la ubicación.

---

### 4. INSTRUCCIONES DE EJECUCIÓN Y PRUEBAS

#### A. Inicializar Base de Datos MySQL (si es requerida una reinstalación limpia)
```bash
cd backend
npm run db:init
```

#### B. Ejecutar Suite de Pruebas Automatizadas (12/12 Pruebas en Jest)
```bash
cd backend
npm test
```
*Resultado verificado: 12 passed de 12 pruebas en ~3.5 segundos.*

#### C. Iniciar Backend (API REST en puerto 5000)
```bash
cd backend
npm run dev
# Disponible en: http://localhost:5000 (Healthcheck: http://localhost:5000/api/health)
```

#### D. Iniciar Frontend (React + Vite en puerto 3000)
```bash
cd frontend
npm run dev
# Disponible en: http://localhost:3000
```

#### E. Abrir Entregables y Presentaciones
- **Informe PDF:** Abrir `entrega_final/informe_quiz2.pdf` con cualquier visor de PDF o navegador web.
- **Presentación Interactiva de Diapositivas:** Abrir `entrega_final/presentacion_quiz2.html` en el navegador. Navegar con las flechas del teclado o presionar `F` para pantalla completa.
- **Diagramas Interactivos:** Abrir `entrega_final/diagramas/circuito_compras.html` y `entrega_final/diagramas/diagrama_erd.html`.

