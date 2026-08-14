import { Notice, Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings } from './types';
import { PdfExportSettingTab } from './settings';
import { ExportPdfModal } from './modal';
import { exportNoteToPdfFile } from './pdf-generator';

export default class ObsidianPdfExportPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    // 1. Icono en la barra lateral izquierda (Ribbon)
    this.addRibbonIcon('file-down', 'Exportar nota actual a PDF con LaTeX', () => {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile || activeFile.extension !== 'md') {
        new Notice('Por favor abre una nota en formato Markdown (.md) primero.');
        return;
      }
      new ExportPdfModal(this.app, this, activeFile).open();
    });

    // 2. Comando principal en la paleta de comandos (Ctrl+P / Cmd+P)
    this.addCommand({
      id: 'export-note-pdf',
      name: 'Exportar nota actual a PDF (abrir opciones)',
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile || activeFile.extension !== 'md') {
          return false;
        }
        if (!checking) {
          new ExportPdfModal(this.app, this, activeFile).open();
        }
        return true;
      }
    });

    // 3. Comando de exportación rápida con valores predeterminados
    this.addCommand({
      id: 'export-note-pdf-quick',
      name: 'Exportar nota actual a PDF rápido (ajustes predeterminados)',
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile || activeFile.extension !== 'md') {
          return false;
        }
        if (!checking) {
          void exportNoteToPdfFile(
            this.app,
            activeFile,
            this.settings,
            this.settings.excludedProperties
          );
        }
        return true;
      }
    });

    // 4. Integración en el menú contextual de archivos (clic derecho en una nota)
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem(item => {
            item
              .setTitle('Exportar a PDF (LaTeX y Propiedades)')
              .setIcon('file-down')
              .onClick(() => {
                new ExportPdfModal(this.app, this, file).open();
              });
          });
        }
      })
    );

    // 5. Registrar pestaña de configuración
    this.addSettingTab(new PdfExportSettingTab(this.app, this));
  }

  onunload(): void {
    // Limpieza si fuera necesaria
  }

  async loadSettings(): Promise<void> {
    const data: unknown = await this.loadData();
    if (data && typeof data === 'object') {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, data as Partial<PluginSettings>);
    } else {
      this.settings = Object.assign({}, DEFAULT_SETTINGS);
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
