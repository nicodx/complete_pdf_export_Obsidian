import { App, Modal, Setting, TFile } from 'obsidian';
import type ObsidianPdfExportPlugin from './main';
import { ColorTheme, ExportOptions, MarginOption, PageOrientation, PageSize } from './types';
import { exportNoteToPdfFile } from './pdf-generator';

export class ExportPdfModal extends Modal {
  plugin: ObsidianPdfExportPlugin;
  file: TFile;
  options: ExportOptions;

  constructor(app: App, plugin: ObsidianPdfExportPlugin, file: TFile) {
    super(app);
    this.plugin = plugin;
    this.file = file;

    // Inicializar opciones locales a partir de la configuración global
    this.options = {
      pageSize: plugin.settings.pageSize,
      pageOrientation: plugin.settings.pageOrientation,
      margins: plugin.settings.margins,
      customMarginMm: plugin.settings.customMarginMm,
      showProperties: plugin.settings.showProperties,
      showTitle: plugin.settings.showTitle,
      showPageNumbers: plugin.settings.showPageNumbers,
      showDate: plugin.settings.showDate,
      headerText: plugin.settings.headerText,
      footerText: plugin.settings.footerText,
      colorTheme: plugin.settings.colorTheme,
      openPdfAfterExport: plugin.settings.openPdfAfterExport,
      renderLatex: plugin.settings.renderLatex,
      scalePercent: plugin.settings.scalePercent
    };
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('obsidian-pdf-export-modal');

    // Encabezado del Modal
    contentEl.createEl('h2', {
      text: 'Exportar Nota a PDF',
      cls: 'pdf-export-modal-title'
    });

    const fileInfo = contentEl.createEl('div', { cls: 'pdf-export-file-info' });
    fileInfo.createEl('span', { text: 'Nota: ', cls: 'pdf-file-label' });
    fileInfo.createEl('strong', { text: `${this.file.basename}.md`, cls: 'pdf-file-name' });

    // Opciones de Página
    new Setting(contentEl)
      .setName('Tamaño de papel')
      .setDesc('Formato de la hoja')
      .addDropdown(dropdown => {
        dropdown
          .addOption('A4', 'A4 (210 × 297 mm)')
          .addOption('Letter', 'Carta / Letter (8.5 × 11 pulg.)')
          .addOption('Legal', 'Oficio / Legal (8.5 × 14 pulg.)')
          .addOption('A3', 'A3 (297 × 420 mm)')
          .addOption('A5', 'A5 (148 × 210 mm)')
          .addOption('Executive', 'Ejecutivo (7.25 × 10.5 pulg.)')
          .setValue(this.options.pageSize)
          .onChange((value: string) => {
            this.options.pageSize = value as PageSize;
          });
      });

    new Setting(contentEl)
      .setName('Orientación')
      .setDesc('Orientación de la página')
      .addDropdown(dropdown => {
        dropdown
          .addOption('portrait', 'Vertical (Portrait)')
          .addOption('landscape', 'Horizontal (Landscape)')
          .setValue(this.options.pageOrientation)
          .onChange((value: string) => {
            this.options.pageOrientation = value as PageOrientation;
          });
      });

    new Setting(contentEl)
      .setName('Márgenes')
      .setDesc('Espacio de los márgenes de página')
      .addDropdown(dropdown => {
        dropdown
          .addOption('default', 'Estándar (20 mm)')
          .addOption('narrow', 'Estrecho / Compacto (10 mm)')
          .addOption('wide', 'Amplio (30 mm)')
          .addOption('none', 'Sin márgenes (0 mm)')
          .setValue(this.options.margins)
          .onChange((value: string) => {
            this.options.margins = value as MarginOption;
          });
      });

    // Fórmulas LaTeX
    new Setting(contentEl)
      .setName('Fórmulas LaTeX')
      .setDesc('Renderizar ecuaciones $...$ y $$...$$ con KaTeX')
      .addToggle(toggle => {
        toggle
          .setValue(this.options.renderLatex)
          .onChange((value: boolean) => {
            this.options.renderLatex = value;
          });
      });

    // Propiedades
    new Setting(contentEl)
      .setName('Incluir Propiedades')
      .setDesc('Incluir tabla de metadatos/frontmatter al inicio')
      .addToggle(toggle => {
        toggle
          .setValue(this.options.showProperties)
          .onChange((value: boolean) => {
            this.options.showProperties = value;
          });
      });

    // Numeración de páginas
    new Setting(contentEl)
      .setName('Números de página')
      .setDesc('Mostrar "Pág. X de Y" en el pie de página')
      .addToggle(toggle => {
        toggle
          .setValue(this.options.showPageNumbers)
          .onChange((value: boolean) => {
            this.options.showPageNumbers = value;
          });
      });

    // Tema
    new Setting(contentEl)
      .setName('Tema de color')
      .addDropdown(dropdown => {
        dropdown
          .addOption('light', 'Claro (Papel blanco)')
          .addOption('dark', 'Oscuro')
          .addOption('sepia', 'Sepia')
          .setValue(this.options.colorTheme)
          .onChange((value: string) => {
            this.options.colorTheme = value as ColorTheme;
          });
      });

    // Abrir automáticamente
    new Setting(contentEl)
      .setName('Abrir PDF al finalizar')
      .addToggle(toggle => {
        toggle
          .setValue(this.options.openPdfAfterExport)
          .onChange((value: boolean) => {
            this.options.openPdfAfterExport = value;
          });
      });

    // Botones de acción
    const buttonContainer = contentEl.createEl('div', { cls: 'pdf-export-modal-buttons' });

    const cancelBtn = buttonContainer.createEl('button', {
      text: 'Cancelar',
      cls: 'mod-cancel'
    });
    cancelBtn.addEventListener('click', () => this.close());

    const exportBtn = buttonContainer.createEl('button', {
      text: '📄 Exportar PDF',
      cls: 'mod-cta pdf-export-btn'
    });
    exportBtn.addEventListener('click', async () => {
      this.close();
      await exportNoteToPdfFile(
        this.app,
        this.file,
        this.options,
        this.plugin.settings.excludedProperties
      );
    });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
