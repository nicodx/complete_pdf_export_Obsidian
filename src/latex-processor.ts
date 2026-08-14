import katex from 'katex';
import { KATEX_CSS } from './katex-css';

export interface LatexBlock {
  id: string;
  math: string;
  displayMode: boolean;
}

export function getKatexCss(): string {
  return KATEX_CSS;
}

/**
 * Extrae y protege fórmulas LaTeX ($...$ y $$...$$) reemplazándolas
 * por tokens de texto seguros antes de renderizar el markdown con Obsidian.
 */
export function extractAndProtectLatex(content: string): {
  processedContent: string;
  latexBlocks: Map<string, LatexBlock>;
} {
  const latexBlocks = new Map<string, LatexBlock>();
  let blockIndex = 0;

  // 1. Proteger bloques de código con ``` o ` para no alterar $ dentro de código
  const codeBlocks = new Map<string, string>();

  let protectedContent = content.replace(/```[\s\S]*?```/g, (match: string): string => {
    const id = `CODEBLOCKTOKEN${blockIndex++}END`;
    codeBlocks.set(id, match);
    return id;
  });

  protectedContent = protectedContent.replace(/`[^`\n]+`/g, (match: string): string => {
    const id = `CODEINLINETOKEN${blockIndex++}END`;
    codeBlocks.set(id, match);
    return id;
  });

  // 2. Procesar fórmulas de bloque: $$ ... $$
  protectedContent = protectedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_match: string, math: string): string => {
    const cleanFormula: string = math.trim();
    if (!cleanFormula) return '';
    const id = `LATEXBLOCKTOKEN${blockIndex++}END`;
    latexBlocks.set(id, {
      id,
      math: cleanFormula,
      displayMode: true,
    });
    return `\n\n${id}\n\n`;
  });

  // 3. Procesar fórmulas inline: $ ... $
  protectedContent = protectedContent.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (match: string, math: string): string => {
    const cleanFormula: string = math.trim();
    if (!cleanFormula) return match;
    const id = `LATEXINLINETOKEN${blockIndex++}END`;
    latexBlocks.set(id, {
      id,
      math: cleanFormula,
      displayMode: false,
    });
    return id;
  });

  // 4. Restaurar bloques de código
  codeBlocks.forEach((codeContent: string, id: string): void => {
    protectedContent = protectedContent.split(id).join(codeContent);
  });

  return { processedContent: protectedContent, latexBlocks };
}

/**
 * Restaura y renderiza las fórmulas LaTeX con KaTeX en el HTML final
 */
export function restoreAndRenderLatexInHtml(
  htmlContent: string,
  latexBlocks: Map<string, LatexBlock>
): string {
  let result = htmlContent;

  for (const [id, block] of latexBlocks.entries()) {
    try {
      const rendered: string = katex.renderToString(block.math, {
        displayMode: block.displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });

      const wrapper: string = block.displayMode
        ? `<div class="latex-block-container katex-display-wrapper">${rendered}</div>`
        : `<span class="latex-inline-container katex-inline-wrapper">${rendered}</span>`;

      const pPattern = new RegExp(`<p>\\s*${id}\\s*<\\/p>`, 'g');
      if (pPattern.test(result)) {
        result = result.replace(pPattern, wrapper);
      } else {
        result = result.split(id).join(wrapper);
      }
    } catch (e: unknown) {
      console.warn(`Error renderizando KaTeX para la fórmula: ${block.math}`, e);
      const fallback: string = `<span class="latex-error">${escapeHtml(block.math)}</span>`;
      result = result.split(id).join(fallback);
    }
  }

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
