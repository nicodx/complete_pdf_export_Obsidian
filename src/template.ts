import { ExportOptions, PageSize, PageOrientation, MarginOption } from './types';
import { getKatexCss } from './latex-processor';

/**
 * Genera el documento HTML completo listo para impresión a PDF
 */
export function buildDocumentHtml(
  bodyHtml: string,
  title: string,
  propertiesHtml: string,
  options: ExportOptions
): string {
  const pageCss = getPageCss(options.pageSize, options.pageOrientation, options.margins, options.customMarginMm);
  const themeCss = getThemeCss(options.colorTheme);
  const katexCss = options.renderLatex ? getKatexCss() : '';
  const baseCss = getBaseCss();

  const titleHtml = options.showTitle ? `<h1 class="document-title">${escapeHtml(title)}</h1>` : '';
  const propsHtml = options.showProperties && propertiesHtml ? propertiesHtml : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    /* Reglas de Página para Impresión */
    ${pageCss}

    /* Estilos KaTeX Embebidos */
    ${katexCss}

    /* Estilos Base del Documento */
    ${baseCss}

    /* Estilos de Tema */
    ${themeCss}
  </style>
</head>
<body class="theme-${options.colorTheme}">
  <div class="print-container">
    ${titleHtml}
    ${propsHtml}
    <div class="markdown-rendered-content">
      ${bodyHtml}
    </div>
  </div>
</body>
</html>`;
}

function getPageCss(
  pageSize: PageSize,
  orientation: PageOrientation,
  margins: MarginOption,
  customMarginMm: number
): string {
  let marginStr = '20mm';
  if (margins === 'narrow') marginStr = '10mm';
  else if (margins === 'wide') marginStr = '30mm';
  else if (margins === 'none') marginStr = '0mm';
  else if (customMarginMm > 0) marginStr = `${customMarginMm}mm`;

  return `
    @page {
      size: ${pageSize} ${orientation};
      margin: ${marginStr};
    }
  `;
}

function getBaseCss(): string {
  return `
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
      font-size: 14px;
      line-height: 1.65;
      color: #1f2328;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }

    /* Título principal */
    .document-title {
      font-size: 2.1em;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 0.8em;
      padding-bottom: 0.3em;
      border-bottom: 2px solid #e1e4e8;
      color: #0969da;
      page-break-after: avoid;
    }

    /* Encabezados */
    h1, h2, h3, h4, h5, h6 {
      color: #1f2328;
      font-weight: 600;
      line-height: 1.3;
      margin-top: 1.5em;
      margin-bottom: 0.6em;
      page-break-after: avoid;
      break-after: avoid;
    }

    h1 { font-size: 1.75em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.45em; border-bottom: 1px solid #f0f2f5; padding-bottom: 0.25em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1.0em; }
    h6 { font-size: 0.9em; color: #57606a; }

    p {
      margin-top: 0;
      margin-bottom: 0.9em;
    }

    a {
      color: #0969da;
      text-decoration: none;
    }

    strong {
      font-weight: 600;
    }

    /* Párrafos e imágenes */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 0.5em 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Listas */
    ul, ol {
      margin-top: 0;
      margin-bottom: 0.9em;
      padding-left: 2em;
    }

    li {
      margin-bottom: 0.3em;
    }

    /* Listas de tareas */
    ul.contains-task-list {
      list-style-type: none;
      padding-left: 0.5em;
    }

    .task-list-item {
      display: flex;
      align-items: baseline;
      margin-bottom: 0.3em;
    }

    .task-list-item-checkbox {
      margin-right: 0.6em;
      accent-color: #0969da;
    }

    /* Citas (Blockquotes) */
    blockquote {
      margin: 0.8em 0;
      padding: 0.6em 1em;
      color: #57606a;
      background-color: #f6f8fa;
      border-left: 4px solid #0969da;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Tablas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 0.95em;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th, td {
      padding: 8px 12px;
      border: 1px solid #d0d7de;
      text-align: left;
    }

    th {
      background-color: #f6f8fa;
      font-weight: 600;
      color: #1f2328;
    }

    tr:nth-child(even) td {
      background-color: #fcfdfe;
    }

    /* Código */
    code {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 0.88em;
      padding: 0.2em 0.4em;
      background-color: rgba(175, 184, 193, 0.2);
      border-radius: 4px;
      color: #24292f;
    }

    pre {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 0.85em;
      padding: 12px 16px;
      background-color: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      overflow-x: auto;
      margin: 0.9em 0;
      line-height: 1.45;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    pre code {
      padding: 0;
      background-color: transparent;
      border-radius: 0;
      font-size: inherit;
    }

    /* Callouts / Destacados de Obsidian */
    .callout {
      margin: 1em 0;
      padding: 12px 16px;
      border-left: 4px solid #0969da;
      border-radius: 0 6px 6px 0;
      background-color: #f0f7ff;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .callout-title {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      color: #0969da;
    }

    .callout[data-callout="warning"], .callout[data-callout="caution"] {
      border-left-color: #9a6700;
      background-color: #fff8c5;
    }
    .callout[data-callout="warning"] .callout-title, .callout[data-callout="caution"] .callout-title {
      color: #9a6700;
    }

    .callout[data-callout="danger"], .callout[data-callout="error"] {
      border-left-color: #cf222e;
      background-color: #ffebe9;
    }
    .callout[data-callout="danger"] .callout-title, .callout[data-callout="error"] .callout-title {
      color: #cf222e;
    }

    .callout[data-callout="success"], .callout[data-callout="tip"] {
      border-left-color: #1a7f37;
      background-color: #dafbe1;
    }
    .callout[data-callout="success"] .callout-title, .callout[data-callout="tip"] .callout-title {
      color: #1a7f37;
    }

    /* Tarjeta de Propiedades (Frontmatter) */
    .properties-container {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 1.5em;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .properties-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8em;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #edf2f7;
    }

    .properties-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      font-size: 0.88em;
    }

    .properties-table td {
      border: none;
      padding: 4px 8px;
      vertical-align: top;
    }

    .properties-table tr:nth-child(even) td {
      background-color: transparent;
    }

    .property-key {
      width: 25%;
      font-weight: 500;
      color: #475569;
    }

    .property-value {
      width: 75%;
      color: #1e293b;
    }

    .property-tag {
      display: inline-block;
      background-color: #e0f2fe;
      color: #0369a1;
      padding: 1px 7px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 500;
      margin-right: 4px;
      margin-bottom: 2px;
    }

    .property-pill {
      display: inline-block;
      background-color: #f1f5f9;
      color: #334155;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 0.85em;
      margin-right: 4px;
      margin-bottom: 2px;
      border: 1px solid #e2e8f0;
    }

    .property-bool {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 600;
    }

    .property-bool-true {
      background-color: #dcfce7;
      color: #15803d;
    }

    .property-bool-false {
      background-color: #fee2e2;
      color: #b91c1c;
    }

    .property-link {
      color: #0284c7;
      font-weight: 500;
    }

    /* Fórmulas LaTeX */
    .latex-block-container {
      margin: 1.2em 0;
      padding: 8px 0;
      text-align: center;
      overflow-x: auto;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .latex-inline-container {
      display: inline;
    }

    .katex-display {
      margin: 0.5em 0 !important;
    }

    .latex-error {
      color: #d1242f;
      background-color: #fff0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
    }

    /* Control de saltos de página */
    .page-break {
      page-break-after: always;
      break-after: page;
    }
  `;
}

function getThemeCss(theme: string): string {
  if (theme === 'dark') {
    return `
      body.theme-dark {
        background-color: #1e1e2e;
        color: #cdd6f4;
      }
      body.theme-dark .document-title {
        color: #89b4fa;
        border-bottom-color: #313244;
      }
      body.theme-dark h1, body.theme-dark h2, body.theme-dark h3, body.theme-dark h4 {
        color: #cdd6f4;
      }
      body.theme-dark h1, body.theme-dark h2 {
        border-bottom-color: #313244;
      }
      body.theme-dark blockquote {
        background-color: #181825;
        color: #a6adc8;
        border-left-color: #89b4fa;
      }
      body.theme-dark table th {
        background-color: #313244;
        color: #cdd6f4;
      }
      body.theme-dark table td, body.theme-dark table th {
        border-color: #45475a;
      }
      body.theme-dark table tr:nth-child(even) td {
        background-color: #181825;
      }
      body.theme-dark pre {
        background-color: #181825;
        border-color: #313244;
        color: #cdd6f4;
      }
      body.theme-dark code {
        background-color: #313244;
        color: #f38ba8;
      }
      body.theme-dark .properties-container {
        background-color: #181825;
        border-color: #313244;
      }
      body.theme-dark .properties-header {
        color: #9399b2;
        border-bottom-color: #313244;
      }
      body.theme-dark .property-key {
        color: #bac2de;
      }
      body.theme-dark .property-value {
        color: #cdd6f4;
      }
      body.theme-dark .property-tag {
        background-color: #1e3a5f;
        color: #7dd3fc;
      }
      body.theme-dark .property-pill {
        background-color: #313244;
        color: #cdd6f4;
        border-color: #45475a;
      }
    `;
  }

  if (theme === 'sepia') {
    return `
      body.theme-sepia {
        background-color: #fbf0d9;
        color: #5f4b32;
      }
      body.theme-sepia .document-title {
        color: #8c4b18;
        border-bottom-color: #dec8ab;
      }
      body.theme-sepia h1, body.theme-sepia h2, body.theme-sepia h3 {
        color: #5f4b32;
        border-bottom-color: #dec8ab;
      }
      body.theme-sepia blockquote {
        background-color: #f2e3c6;
        border-left-color: #b0703c;
      }
      body.theme-sepia table th {
        background-color: #ebd8b7;
      }
      body.theme-sepia table td, body.theme-sepia table th {
        border-color: #d5be9b;
      }
      body.theme-sepia pre {
        background-color: #f2e3c6;
        border-color: #dec8ab;
      }
      body.theme-sepia .properties-container {
        background-color: #f2e3c6;
        border-color: #dec8ab;
      }
    `;
  }

  return '';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
