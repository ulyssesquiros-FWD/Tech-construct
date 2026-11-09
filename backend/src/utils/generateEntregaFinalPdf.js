const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownToProfessionalHtml(md) {
  // Extract cover lines
  const lines = md.split('\n');
  let inTable = false;
  let tableHtml = '';
  let inCodeBlock = false;
  let codeBlockContent = '';
  let htmlLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks ```
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = '';
        continue;
      } else {
        inCodeBlock = false;
        htmlLines.push(`<pre><code>${escapeHtml(codeBlockContent.trim())}</code></pre>`);
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }

    // Tables
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        continue; // separator
      }
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      if (!inTable) {
        inTable = true;
        tableHtml = '<div class="table-container"><table><thead><tr>';
        cells.forEach(c => {
          let cellFormatted = formatInline(c);
          tableHtml += `<th>${cellFormatted}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
      } else {
        tableHtml += '<tr>';
        cells.forEach(c => {
          let cellFormatted = formatInline(c);
          tableHtml += `<td>${cellFormatted}</td>`;
        });
        tableHtml += '</tr>';
      }
      continue;
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table></div>';
        htmlLines.push(tableHtml);
        tableHtml = '';
      }
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      htmlLines.push(`<h3>${formatInline(trimmed.substring(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      htmlLines.push(`<h2>${formatInline(trimmed.substring(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      htmlLines.push(`<h1>${formatInline(trimmed.substring(2))}</h1>`);
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      htmlLines.push(`<blockquote>${formatInline(trimmed.substring(2))}</blockquote>`);
      continue;
    }

    // Horizontal rule
    if (trimmed === '---') {
      htmlLines.push('<hr/>');
      continue;
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      htmlLines.push(`<div class="bullet-item">• ${formatInline(trimmed.substring(2))}</div>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      htmlLines.push(`<div class="numbered-item"><span class="item-num">${match[1]}.</span> ${formatInline(match[2])}</div>`);
      continue;
    }

    // Empty line
    if (!trimmed) {
      continue;
    }

    // Normal paragraph
    htmlLines.push(`<p>${formatInline(trimmed)}</p>`);
  }

  if (inTable) {
    tableHtml += '</tbody></table></div>';
    htmlLines.push(tableHtml);
  }

  return htmlLines.join('\n');
}

function formatInline(text) {
  let s = text;
  // bold & italic
  s = s.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // code
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // math formatting
  s = s.replace(/\$\$([^$]+)\$\$/g, '<div class="math-display">$1</div>');
  s = s.replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>');
  return s;
}

function generateEntregaPdf() {
  const rootDir = path.resolve(__dirname, '../../../');
  const mdPath = path.join(rootDir, 'entrega_final', 'informe_quiz2.md');
  const htmlPath = path.join(rootDir, 'entrega_final', 'informe_quiz2.html');
  const pdfPath = path.join(rootDir, 'entrega_final', 'informe_quiz2.pdf');

  if (!fs.existsSync(mdPath)) {
    console.error('No se encontró entrega_final/informe_quiz2.md');
    return;
  }

  const rawMd = fs.readFileSync(mdPath, 'utf8');

  // Generate body html
  const bodyHtml = markdownToProfessionalHtml(rawMd);

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Final Quiz #2 - Constructora Del Valle S.A.</title>
  <style>
    @page {
      size: letter;
      margin: 1.6cm 1.5cm 1.6cm 1.5cm;
      @bottom-right {
        content: counter(page);
      }
    }
    @page :first {
      margin: 0;
      @bottom-right {
        content: normal;
      }
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.45;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    
    /* Cover Page */
    .cover-page {
      page-break-after: always;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3.5cm 2.5cm 2.5cm;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%);
      color: #ffffff;
      box-sizing: border-box;
    }
    .cover-top {
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 20px;
    }
    .cover-institution {
      font-size: 13pt;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #38bdf8;
      margin-bottom: 6px;
    }
    .cover-faculty {
      font-size: 10.5pt;
      color: #94a3b8;
    }
    .cover-middle {
      margin-top: 40px;
    }
    .cover-badge {
      display: inline-block;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid #38bdf8;
      color: #38bdf8;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 9.5pt;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    .cover-title {
      font-size: 24pt;
      font-weight: 800;
      line-height: 1.2;
      color: #ffffff;
      margin: 0 0 12px 0;
    }
    .cover-subtitle {
      font-size: 13pt;
      color: #cbd5e1;
      font-weight: 400;
      margin: 0 0 24px 0;
      line-height: 1.4;
    }
    .cover-meta-grid {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 16px 20px;
      font-size: 9.5pt;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
    }
    .cover-meta-item strong {
      color: #38bdf8;
      display: block;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .cover-meta-item span {
      color: #f1f5f9;
    }
    .cover-footer {
      font-size: 9pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 14px;
    }

    /* Content styling */
    .content-body {
      padding: 0 5px;
    }
    h1 {
      font-size: 17pt;
      color: #0f172a;
      border-bottom: 2.5px solid #0284c7;
      padding-bottom: 6px;
      margin-top: 26px;
      margin-bottom: 14px;
      page-break-after: avoid;
    }
    h2 {
      font-size: 13pt;
      color: #0369a1;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      color: #334155;
      margin-top: 16px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 8px 0;
      text-align: justify;
      color: #334155;
    }
    strong {
      color: #0f172a;
    }
    .bullet-item, .numbered-item {
      margin-bottom: 4px;
      text-align: justify;
      color: #334155;
    }
    .item-num {
      font-weight: bold;
      color: #0284c7;
    }
    blockquote {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9pt;
      color: #166534;
      border-radius: 0 6px 6px 0;
    }
    .table-container {
      margin: 12px 0;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      line-height: 1.35;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    code {
      font-family: 'Consolas', 'Courier New', monospace;
      background-color: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      color: #0284c7;
      font-size: 8.5pt;
    }
    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 8pt;
      line-height: 1.35;
      overflow-x: auto;
      margin: 10px 0;
      page-break-inside: avoid;
    }
    pre code {
      background: transparent;
      color: #f8fafc;
      padding: 0;
    }
    .math-display {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 6px 12px;
      margin: 8px 0;
      font-family: 'Cambria Math', 'Times New Roman', serif;
      font-size: 10pt;
      text-align: center;
      color: #0f172a;
    }
    .math-inline {
      font-family: 'Cambria Math', 'Times New Roman', serif;
      font-weight: 600;
      color: #0f172a;
    }
    hr {
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 16px 0;
    }
    .diagram-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      margin: 12px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    .diagram-title {
      font-weight: 700;
      font-size: 9.5pt;
      color: #0369a1;
      margin-bottom: 6px;
    }
    .diagram-caption {
      font-size: 8pt;
      color: #64748b;
      margin-top: 4px;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-top">
      <div class="cover-institution">Universidad Técnica / Facultad de Ingeniería Informática</div>
      <div class="cover-faculty">Curso: Desarrollo Backend y Arquitectura de Bases de Datos Relacionales</div>
    </div>
    
    <div class="cover-middle">
      <div class="cover-badge">EVALUACIÓN ACADÉMICA Y TÉCNICA — QUIZ #2</div>
      <div class="cover-title">Sistema Empresarial de Gestión de Inventarios y Abastecimiento</div>
      <div class="cover-subtitle">Control de compras por obra, cálculo automático de reorden, prevención de fraude/duplicados y trazabilidad atómica en MySQL</div>
      
      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <strong>Empresa Evaluada</strong>
          <span>Constructora Del Valle S.A. (Cédula: 3-101-558899)</span>
        </div>
        <div class="cover-meta-item">
          <strong>Modalidad Arquitectónica</strong>
          <span>Camino 2: Backend Propio (Node.js + Express + Sequelize + MySQL)</span>
        </div>
        <div class="cover-meta-item">
          <strong>Frontend & Visualización</strong>
          <span>React 18 + Vite + Recharts + Lucide Icons</span>
        </div>
        <div class="cover-meta-item">
          <strong>Base de Datos</strong>
          <span>MySQL 9.6 (3NF, Ledger Inmutable, 14 Tablas)</span>
        </div>
        <div class="cover-meta-item">
          <strong>Moneda Oficial</strong>
          <span>Colones costarricenses (₡)</span>
        </div>
        <div class="cover-meta-item">
          <strong>Estado de Verificación</strong>
          <span>12/12 Pruebas Unitarias & Integración Aprobadas (100%)</span>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>San José, Costa Rica</span>
      <span>Noviembre 2026 — Versión Final Certificada</span>
    </div>
  </div>

  <!-- Content Section -->
  <div class="content-body">
    ${bodyHtml}
  </div>

</body>
</html>`;

  fs.writeFileSync(htmlPath, fullHtml, 'utf8');
  console.log(`HTML compilado con éxito en: ${htmlPath}`);

  // Intentar compilar a PDF con Microsoft Edge
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(edgePath)) {
    try {
      console.log('Compilando PDF con Microsoft Edge...');
      execSync(`"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${htmlPath}"`, { stdio: 'inherit' });
      const stats = fs.statSync(pdfPath);
      console.log(`SUCCESS: PDF generado en ${pdfPath} (${stats.size} bytes)`);
    } catch (err) {
      console.error('Error al generar PDF con Edge:', err.message);
    }
  } else {
    console.warn('Microsoft Edge no encontrado en la ruta esperada.');
  }
}

if (require.main === module) {
  generateEntregaPdf();
}

module.exports = generateEntregaPdf;

