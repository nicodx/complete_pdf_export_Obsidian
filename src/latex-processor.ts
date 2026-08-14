import katex from 'katex';
import { KATEX_CSS } from './katex-css';

export function getKatexCss(): string {
  return KATEX_CSS;
}

/**
 * Procesa fórmulas LaTeX en Markdown ($...$ y $$...$$), reemplazándolas
 * por marcadores HTML seguros que Obsidian no elimine (a diferencia de %%..%%).
 */
export function processLatexInMarkdown(markdown: string): { processedMarkdown: string; replacements: Map<string, string> } {
  const replacements = new Map<string, string>();
  let placeholderCounter = 0;

  // 1. Proteger bloques de código con ``` o ` para no alterar $ dentro de código
  const codeBlocks = new Map<string, string>();

  let protectedMd = markdown.replace(/```[\s\S]*?```/g, (match) => {
    const id = `code_block_${placeholderCounter++}`;
    codeBlocks.set(id, match);
    return `<div class="code-placeholder-block" data-code-id="${id}"></div>`;
  });

  protectedMd = protectedMd.replace(/`[^`\n]+`/g, (match) => {
    const id = `code_inline_${placeholderCounter++}`;
    codeBlocks.set(id, match);
    return `<span class="code-placeholder-inline" data-code-id="${id}"></span>`;
  });

  // 2. Procesar fórmulas de bloque: $$ ... $$
  protectedMd = protectedMd.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
    const cleanFormula = formula.trim();
    if (!cleanFormula) return '';
    const id = `latex_block_${placeholderCounter++}`;
    try {
      const rendered = katex.renderToString(cleanFormula, {
        displayMode: true,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
      replacements.set(id, `<div class="latex-block-container">${rendered}</div>`);
    } catch (err) {
      console.warn('Error renderizando bloque LaTeX con KaTeX:', err);
      replacements.set(id, `<div class="latex-block-container latex-error">$$${escapeHtml(cleanFormula)}$$</div>`);
    }
    return `\n\n<div class="latex-placeholder-block" data-latex-id="${id}"></div>\n\n`;
  });

  // 3. Procesar fórmulas inline: $ ... $
  protectedMd = protectedMd.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (_match, formula) => {
    const cleanFormula = formula.trim();
    if (!cleanFormula) return '$ $';
    const id = `latex_inline_${placeholderCounter++}`;
    try {
      const rendered = katex.renderToString(cleanFormula, {
        displayMode: false,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
      replacements.set(id, `<span class="latex-inline-container">${rendered}</span>`);
    } catch (err) {
      console.warn('Error renderizando LaTeX inline con KaTeX:', err);
      replacements.set(id, `<span class="latex-inline-container latex-error">$${escapeHtml(cleanFormula)}$</span>`);
    }
    return `<span class="latex-placeholder-inline" data-latex-id="${id}"></span>`;
  });

  // 4. Restaurar bloques de código en el Markdown antes de pasarlo al renderizador
  codeBlocks.forEach((codeContent, id) => {
    protectedMd = protectedMd.replace(
      new RegExp(`<div[^>]*class="code-placeholder-block"[^>]*data-code-id="${id}"[^>]*><\\/div>`, 'g'),
      () => `\n\n${codeContent}\n\n`
    );
    protectedMd = protectedMd.replace(
      new RegExp(`<span[^>]*class="code-placeholder-inline"[^>]*data-code-id="${id}"[^>]*><\\/span>`, 'g'),
      () => codeContent
    );
  });

  return { processedMarkdown: protectedMd, replacements };
}

/**
 * Restaura los placeholders de LaTeX en el HTML final renderizado
 */
export function restoreLatexInHtml(html: string, replacements: Map<string, string>): string {
  let result = html;

  // 1. Reemplazar placeholders de bloques e inline
  replacements.forEach((renderedHtml, id) => {
    const blockRegex = new RegExp(
      `(?:<p>\\s*)?<div[^>]*class="latex-placeholder-block"[^>]*data-latex-id="${id}"[^>]*><\\/div>(?:\\s*<\\/p>)?`,
      'g'
    );
    result = result.replace(blockRegex, renderedHtml);

    const inlineRegex = new RegExp(
      `<span[^>]*class="latex-placeholder-inline"[^>]*data-latex-id="${id}"[^>]*><\\/span>`,
      'g'
    );
    result = result.replace(inlineRegex, renderedHtml);
  });

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
