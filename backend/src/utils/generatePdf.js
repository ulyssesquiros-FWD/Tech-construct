const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function markdownToHtml(md) {
  let html = md;

  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Re-allow basic tags or format
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Horizontal Rule
  html = html.replace(/^---$/gim, '<hr/>');

  // Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if separator line
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        continue;
      }
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (!inTable) {
        inTable = true;
        tableHtml += '<table><thead><tr>';
        cells.forEach(c => { tableHtml += `<th>${c}</th>`; });
        tableHtml += '</tr></thead><tbody>';
      } else {
        tableHtml += '<tr>';
        cells.forEach(c => { tableHtml += `<td>${c}</td>`; });
        tableHtml += '</tr>';
      }
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table>';
        newLines.push(tableHtml);
        tableHtml = '';
      }
      newLines.push(line);
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table>';
    newLines.push(tableHtml);
  }

  html = newLines.join('\n');

  // Paragraphs
  html = html.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<table') || p.startsWith('<hr') || p.startsWith('<blockquote') || p.startsWith('<ul') || p.startsWith('<ol')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

function generateReportPdf() {
  const mdPath = path.resolve(__dirname, '../../../docs/informe_quiz2.md');
  const htmlPath = path.resolve(__dirname, '../../../docs/informe_quiz2.html');
  const pdfPath = path.resolve(__dirname, '../../../docs/informe_quiz2.pdf');

  if (!fs.existsSync(mdPath)) {
    console.error('No se encontró informe_quiz2.md');
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const bodyContent = markdownToHtml(mdContent);

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Quiz #2 - Constructora Del Valle S.A.</title>
  <style>
    @page {
      size: letter;
      margin: 1.8cm 1.5cm;
    }
    body {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1e293b;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 20pt;
      color: #0f172a;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 8px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 15pt;
      color: #0369a1;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      color: #334155;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 10px;
      text-align: justify;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    code {
      font-family: 'Consolas', 'Courier New', monospace;
      background-color: #f1f5f9;
      padding: 2px 4px;
      border-radius: 4px;
      color: #0284c7;
      font-size: 9pt;
    }
    hr {
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }
    strong {
      color: #0f172a;
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  fs.writeFileSync(htmlPath, fullHtml, 'utf8');
  console.log(`HTML generado en: ${htmlPath}`);

  // Intentar generar PDF con Microsoft Edge
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(edgePath)) {
    try {
      console.log('Generando PDF mediante Microsoft Edge headless...');
      execSync(`"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${htmlPath}"`, { stdio: 'inherit' });
      console.log(`SUCCESS: PDF generado con éxito en: ${pdfPath}`);
    } catch (err) {
      console.error('Error generando PDF con Edge:', err.message);
    }
  } else {
    console.log('Microsoft Edge no disponible para conversión a PDF.');
  }
}

if (require.main === module) {
  generateReportPdf();
}

module.exports = generateReportPdf;
