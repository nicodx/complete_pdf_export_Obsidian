import { App, FileSystemAdapter, Notice, TFile } from 'obsidian';
import { ExportOptions } from './types';
import { renderNoteToFullHtml } from './markdown-parser';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface ElectronDialogResult {
  canceled: boolean;
  filePath?: string;
}

interface ElectronDialog {
  showSaveDialog(options: Record<string, unknown>): Promise<ElectronDialogResult>;
}

interface ElectronWebContents {
  executeJavaScript(code: string): Promise<unknown>;
  printToPDF(options: Record<string, unknown>): Promise<Uint8Array>;
}

interface ElectronBrowserWindow {
  loadFile(filePath: string): Promise<void>;
  webContents: ElectronWebContents;
  destroy(): void;
}

interface ElectronShell {
  openPath(path: string): Promise<string>;
}

interface ElectronModule {
  dialog?: ElectronDialog;
  BrowserWindow?: new (options: Record<string, unknown>) => ElectronBrowserWindow;
  shell?: ElectronShell;
}

function getElectron(): ElectronModule | null {
  try {
    const customWindow: Record<string, unknown> = window as unknown as Record<string, unknown>;
    const requireFn: unknown = customWindow['require'];
    if (typeof requireFn === 'function') {
      const electron: ElectronModule = (requireFn as (moduleName: string) => ElectronModule)('electron');
      return electron || null;
    }
  } catch (err: unknown) {
    console.error('No se pudo cargar Electron:', err);
  }
  return null;
}

export function getVaultBasePath(app: App): string {
  const adapter: unknown = app.vault.adapter;
  if (adapter instanceof FileSystemAdapter) {
    return adapter.getBasePath();
  }
  return '';
}

/**
 * Abre el diálogo nativo para seleccionar dónde guardar el PDF
 */
export async function promptSavePath(app: App, file: TFile, defaultDir?: string): Promise<string | null> {
  const electron: ElectronModule | null = getElectron();
  if (!electron || !electron.dialog) {
    // Fallback: guardar en la misma carpeta que la nota
    const vaultPath: string = getVaultBasePath(app);
    const folder: string = file.parent ? file.parent.path : '';
    const fallbackPath: string = path.join(vaultPath, folder, `${file.basename}.pdf`);
    return String(fallbackPath);
  }

  const initialDir: string = defaultDir && fs.existsSync(defaultDir)
    ? defaultDir
    : path.join(getVaultBasePath(app), file.parent ? file.parent.path : '');

  const defaultPath: string = path.join(initialDir, `${file.basename}.pdf`);

  const result: ElectronDialogResult = await electron.dialog.showSaveDialog({
    title: 'Exportar Nota como PDF',
    defaultPath: defaultPath,
    filters: [
      { name: 'Documento PDF (*.pdf)', extensions: ['pdf'] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return String(result.filePath);
}

/**
 * Genera el archivo PDF a partir del archivo Markdown de Obsidian
 */
export async function exportNoteToPdfFile(
  app: App,
  file: TFile,
  options: ExportOptions,
  excludedProperties: string[],
  customOutputPath?: string
): Promise<string | null> {
  const notice: Notice = new Notice('Generando PDF con fórmulas LaTeX...', 0);

  try {
    // 1. Obtener la ruta de destino si no fue provista
    let outputPath: string | undefined = customOutputPath;
    if (!outputPath) {
      const prompted: string | null = await promptSavePath(app, file);
      if (!prompted) {
        notice.hide();
        return null;
      }
      outputPath = prompted;
    }

    // 2. Generar el documento HTML completo
    const fullHtml: string = await renderNoteToFullHtml(app, file, options, excludedProperties);

    // 3. Escribir archivo temporal HTML
    const tempDir: string = os.tmpdir();
    const tempFile: string = path.join(tempDir, `obsidian-pdf-export-${Date.now()}.html`);
    fs.writeFileSync(tempFile, fullHtml, 'utf-8');

    // 4. Crear ventana headless de Electron para renderizar e imprimir
    const electron: ElectronModule | null = getElectron();
    if (!electron || !electron.BrowserWindow) {
      throw new Error('Electron no está disponible en este entorno.');
    }

    const win: ElectronBrowserWindow = new electron.BrowserWindow({
      show: false,
      width: 1024,
      height: 768,
      webPreferences: {
        javascript: true,
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    try {
      await win.loadFile(tempFile);

      // Esperar a que las fuentes y KaTeX terminen de renderizarse
      await win.webContents.executeJavaScript(`
        (async () => {
          if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
          }
          return true;
        })()
      `);

      // Pequeño retardo de seguridad para asegurar el layout final
      await sleep(250);

      // Configurar opciones de impresión
      const printOptions: Record<string, unknown> = {
        printBackground: true,
        preferCSSPageSize: true,
        landscape: options.pageOrientation === 'landscape',
        pageSize: options.pageSize,
        margins: {
          marginType: 'default'
        }
      };

      if (options.scalePercent && options.scalePercent !== 100) {
        printOptions['scale'] = options.scalePercent / 100;
      }

      // Encabezados y pies de página si están configurados
      if (options.showPageNumbers || options.headerText || options.footerText) {
        printOptions['displayHeaderFooter'] = true;
        printOptions['headerTemplate'] = `
          <div style="font-size: 8px; width: 100%; text-align: right; padding: 0 20px; color: #888;">
            <span>${escapeHtml(options.headerText || '')}</span>
          </div>
        `;
        printOptions['footerTemplate'] = `
          <div style="font-size: 8px; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; color: #888;">
            <span>${escapeHtml(options.footerText || '')}</span>
            ${options.showPageNumbers ? '<span>Pág. <span class="pageNumber"></span> de <span class="totalPages"></span></span>' : ''}
          </div>
        `;
      }

      const pdfData: Uint8Array = await win.webContents.printToPDF(printOptions);

      // Asegurar que el directorio de salida existe
      const targetDir: string = path.dirname(outputPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, Buffer.from(pdfData));

      // 5. Abrir el archivo PDF automáticamente si está habilitado
      if (options.openPdfAfterExport && electron.shell) {
        void electron.shell.openPath(outputPath);
      }

      notice.hide();
      new Notice(`✅ PDF exportado con éxito: ${path.basename(outputPath)}`, 5000);
      return String(outputPath);

    } finally {
      win.destroy();
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch {
        // Ignorar error al limpiar temporal
      }
    }

  } catch (err: unknown) {
    notice.hide();
    console.error('Error al exportar PDF:', err);
    new Notice(`❌ Error al exportar PDF: ${err instanceof Error ? err.message : String(err)}`, 7000);
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
