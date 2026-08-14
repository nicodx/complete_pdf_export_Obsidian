import { App, Component, MarkdownRenderer, TFile } from 'obsidian';
import { extractAndProtectLatex, LatexBlock, restoreAndRenderLatexInHtml } from './latex-processor';
import { renderPropertiesHtml } from './properties-renderer';
import { buildDocumentHtml } from './template';
import { ExportOptions } from './types';

/**
 * Renderiza una nota de Obsidian completa a una cadena de texto HTML lista para PDF
 */
export async function renderNoteToFullHtml(
  app: App,
  file: TFile,
  options: ExportOptions,
  excludedProperties: string[]
): Promise<string> {
  const rawContent = await app.vault.read(file);
  const cache = app.metadataCache.getFileCache(file);
  const frontmatter = cache?.frontmatter;

  // 1. Procesar propiedades si están habilitadas
  let propertiesHtml = '';
  if (options.showProperties && frontmatter) {
    propertiesHtml = renderPropertiesHtml(frontmatter, excludedProperties);
  }

  // 2. Extraer título del documento
  let title = file.basename;
  if (frontmatter && frontmatter.title && typeof frontmatter.title === 'string') {
    title = frontmatter.title;
  }

  // 3. Procesar LaTeX en el markdown si está habilitado
  let contentToRender = rawContent;
  let latexBlocks = new Map<string, LatexBlock>();

  // Remover bloque frontmatter para que MarkdownRenderer no lo duplique
  contentToRender = stripFrontmatter(contentToRender);

  if (options.renderLatex) {
    const latexResult = extractAndProtectLatex(contentToRender);
    contentToRender = latexResult.processedContent;
    latexBlocks = latexResult.latexBlocks;
  }

  // 4. Renderizar Markdown a HTML usando el MarkdownRenderer de Obsidian
  const tempContainer = createDiv();
  const component = new Component();
  component.load();

  try {
    await MarkdownRenderer.render(
      app,
      contentToRender,
      tempContainer,
      file.path,
      component
    );
  } catch (err) {
    console.error('Error renderizando Markdown con Obsidian:', err);
  } finally {
    component.unload();
  }

  let bodyHtml = tempContainer.innerHTML;

  // 5. Restaurar y renderizar fórmulas LaTeX con KaTeX
  if (options.renderLatex && latexBlocks.size > 0) {
    bodyHtml = restoreAndRenderLatexInHtml(bodyHtml, latexBlocks);
  }

  // 6. Resolver imágenes locales a Data URIs base64
  bodyHtml = await resolveImagesToDataUri(app, bodyHtml, file.path);

  // 7. Construir HTML completo del documento con plantilla y estilos
  return buildDocumentHtml(bodyHtml, title, propertiesHtml, options);
}

/**
 * Elimina el bloque frontmatter YAML inicial (--- ... ---) del contenido
 */
function stripFrontmatter(content: string): string {
  if (content.startsWith('---')) {
    const secondIndex = content.indexOf('\n---', 3);
    if (secondIndex !== -1) {
      return content.substring(secondIndex + 4).trimStart();
    }
  }
  return content;
}

/**
 * Convierte todas las imágenes referenciadas en el vault a Data URIs en Base64
 */
async function resolveImagesToDataUri(app: App, html: string, sourcePath: string): Promise<string> {
  const imgRegex = /<img([^>]*)\ssrc="([^"]+)"([^>]*)>/gi;
  const matches = [...html.matchAll(imgRegex)];

  let result = html;

  for (const match of matches) {
    const fullTag = match[0];
    const before = match[1];
    const src = match[2];
    const after = match[3];

    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      continue;
    }

    try {
      let decodedSrc = decodeURIComponent(src);

      // Limpiar prefijo app:// o similar si existe
      if (decodedSrc.startsWith('app://')) {
        const pathPart = decodedSrc.replace(/^app:\/\/[^/]+/, '');
        decodedSrc = decodeURIComponent(pathPart);
      }

      // Buscar archivo en el vault
      let file = app.metadataCache.getFirstLinkpathDest(decodedSrc, sourcePath);
      if (!file) {
        const cleanPath = decodedSrc.replace(/^[/\\]+/, '');
        const abstractFile = app.vault.getAbstractFileByPath(cleanPath);
        if (abstractFile instanceof TFile) {
          file = abstractFile;
        }
      }

      if (file && file instanceof TFile) {
        const buffer = await app.vault.readBinary(file);
        const ext = file.extension.toLowerCase();
        const mime = getMimeType(ext);
        const base64 = bufferToBase64(buffer);
        const dataUri = `data:${mime};base64,${base64}`;

        const newImgTag = `<img${before} src="${dataUri}"${after}>`;
        result = result.replace(fullTag, newImgTag);
      }
    } catch (err) {
      console.warn(`No se pudo resolver imagen para PDF: ${src}`, err);
    }
  }

  return result;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function getMimeType(extension: string): string {
  switch (extension) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'webp': return 'image/webp';
    case 'bmp': return 'image/bmp';
    default: return 'application/octet-stream';
  }
}
