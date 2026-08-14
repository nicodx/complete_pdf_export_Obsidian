import { App, PluginSettingTab, Setting } from 'obsidian';
import type ObsidianPdfExportPlugin from './main';
import { ColorTheme, MarginOption, PageOrientation, PageSize } from './types';

export class PdfExportSettingTab extends PluginSettingTab {
  plugin: ObsidianPdfExportPlugin;

  constructor(app: App, plugin: ObsidianPdfExportPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Configuración general')
      .setHeading();

    const introEl = containerEl.createDiv({ cls: 'setting-item-description' });
    const p = introEl.createEl('p');
    p.createEl('strong', { text: 'Complete PDF Export' });
    p.appendText(' está especialmente pensado para exportar notas a PDF integrando las ');
    p.createEl('strong', { text: 'propiedades del documento (frontmatter / metadatos)' });
    p.appendText(' y ');
    p.createEl('strong', { text: 'fórmulas matemáticas renderizadas en LaTeX' });
    p.appendText(', con total control sobre el tamaño de hoja, orientación y diseño.');

    // --- SECCIÓN: COLABORAR / BUY ME A COFFEE ---
    new Setting(containerEl)
      .setName('☕ Apoyar el Proyecto')
      .setHeading();

    new Setting(containerEl)
      .setName('Puedes colaborar conmigo')
      .setDesc('Si este plugin te resulta de utilidad para tu trabajo o estudio, puedes colaborar invitándome un café para apoyar el desarrollo continuo.')
      .addButton(button => {
        button
          .setButtonText('☕ Invitar un café (Buy Me a Coffee)')
          .setCta()
          .onClick(() => {
            window.open('https://buymeacoffee.com/nicodx', '_blank');
          });
      });

    // --- SECCIÓN: FORMATO DE PÁGINA ---
    new Setting(containerEl)
      .setName('📄 Formato de Página')
      .setHeading();

    new Setting(containerEl)
      .setName('Tamaño de papel')
      .setDesc('Selecciona el tamaño de hoja predeterminado para el PDF.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('A4', 'A4 (210 × 297 mm)')
          .addOption('Letter', 'Carta / Letter (8.5 × 11 pulg.)')
          .addOption('Legal', 'Oficio / Legal (8.5 × 14 pulg.)')
          .addOption('A3', 'A3 (297 × 420 mm)')
          .addOption('A5', 'A5 (148 × 210 mm)')
          .addOption('Executive', 'Ejecutivo (7.25 × 10.5 pulg.)')
          .setValue(this.plugin.settings.pageSize)
          .onChange(async (value: string) => {
            this.plugin.settings.pageSize = value as PageSize;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Orientación de la página')
      .setDesc('Elige si la hoja debe ser Vertical (Portrait) u Horizontal (Landscape).')
      .addDropdown(dropdown => {
        dropdown
          .addOption('portrait', 'Vertical (Portrait)')
          .addOption('landscape', 'Horizontal (Landscape)')
          .setValue(this.plugin.settings.pageOrientation)
          .onChange(async (value: string) => {
            this.plugin.settings.pageOrientation = value as PageOrientation;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Márgenes de página')
      .setDesc('Espacio alrededor del contenido en cada hoja.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('default', 'Estándar (20 mm)')
          .addOption('narrow', 'Estrecho / Compacto (10 mm)')
          .addOption('wide', 'Amplio (30 mm)')
          .addOption('none', 'Sin márgenes (0 mm)')
          .setValue(this.plugin.settings.margins)
          .onChange(async (value: string) => {
            this.plugin.settings.margins = value as MarginOption;
            await this.plugin.saveSettings();
          });
      });

    // --- SECCIÓN: CONTENIDO Y FÓRMULAS ---
    new Setting(containerEl)
      .setName('🧮 Fórmulas LaTeX y Propiedades')
      .setHeading();

    new Setting(containerEl)
      .setName('Renderizar fórmulas LaTeX')
      .setDesc('Convierte automáticamente fórmulas $...$ (inline) y $$...$$ (bloque) usando KaTeX con fuentes vectoriales.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.renderLatex)
          .onChange(async (value: boolean) => {
            this.plugin.settings.renderLatex = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Incluir propiedades de la nota (Frontmatter)')
      .setDesc('Muestra una tarjeta estilizada con las propiedades (metadatos, tags, fechas, autor) al inicio del PDF.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.showProperties)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showProperties = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Propiedades a excluir')
      .setDesc('Nombres de propiedades a ocultar del PDF, separados por comas (ejemplo: cssclasses, publish, draft).')
      .addText(text => {
        text
          .setPlaceholder('cssclasses, publish, draft')
          .setValue(this.plugin.settings.excludedProperties.join(', '))
          .onChange(async (value: string) => {
            this.plugin.settings.excludedProperties = value
              .split(',')
              .map(p => p.trim())
              .filter(p => p.length > 0);
            await this.plugin.saveSettings();
          });
      });

    // --- SECCIÓN: ENCABEZADOS Y PIE DE PÁGINA ---
    new Setting(containerEl)
      .setName('🏷️ Título, Encabezado y Pie de Página')
      .setHeading();

    new Setting(containerEl)
      .setName('Mostrar título principal')
      .setDesc('Incluye el nombre de la nota como título H1 al comienzo del documento.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.showTitle)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showTitle = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Mostrar numeración de páginas')
      .setDesc('Agrega "Pág. X de Y" en el pie de página del PDF.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.showPageNumbers)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showPageNumbers = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Texto personalizado en encabezado')
      .setDesc('Texto opcional que aparecerá en la parte superior derecha de cada página.')
      .addText(text => {
        text
          .setPlaceholder('Ej: Confidencial / Documento de Estudio')
          .setValue(this.plugin.settings.headerText)
          .onChange(async (value: string) => {
            this.plugin.settings.headerText = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Texto personalizado en pie de página')
      .setDesc('Texto opcional que aparecerá en la parte inferior izquierda de cada página.')
      .addText(text => {
        text
          .setPlaceholder('Ej: Autor / Proyecto')
          .setValue(this.plugin.settings.footerText)
          .onChange(async (value: string) => {
            this.plugin.settings.footerText = value;
            await this.plugin.saveSettings();
          });
      });

    // --- SECCIÓN: TEMA Y APARIENCIA ---
    new Setting(containerEl)
      .setName('🎨 Tema y Visualización')
      .setHeading();

    new Setting(containerEl)
      .setName('Tema de color')
      .setDesc('Tema de color para el documento PDF generado.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('light', 'Claro (Óptimo para impresión en papel)')
          .addOption('dark', 'Oscuro (Lectura digital)')
          .addOption('sepia', 'Sepia (Tono cálido)')
          .setValue(this.plugin.settings.colorTheme)
          .onChange(async (value: string) => {
            this.plugin.settings.colorTheme = value as ColorTheme;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Abrir PDF automáticamente')
      .setDesc('Abre el PDF en el visor predeterminado del sistema una vez exportado.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.openPdfAfterExport)
          .onChange(async (value: boolean) => {
            this.plugin.settings.openPdfAfterExport = value;
            await this.plugin.saveSettings();
          });
      });
  }

  hide(): void {
    const { containerEl } = this;
    containerEl.empty();
  }
}
