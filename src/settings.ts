import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import type ObsidianPdfExportPlugin from './main';
import { ColorTheme, MarginOption, PageOrientation, PageSize } from './types';

export class PdfExportSettingTab extends PluginSettingTab {
  plugin: ObsidianPdfExportPlugin;

  constructor(app: App, plugin: ObsidianPdfExportPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Declarative settings definition API (introduced in Obsidian 1.13.0).
   * Enables settings search indexing and declarative UI rendering.
   */
  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: 'group',
        heading: 'Apoyar el proyecto',
        items: [
          {
            name: 'Puedes colaborar conmigo',
            desc: 'Si este plugin te resulta de utilidad para tu trabajo o estudio, puedes colaborar invitándome un café para apoyar el desarrollo continuo.',
            render: (setting: Setting) => {
              setting.addButton(button => {
                button
                  .setButtonText('☕ Invitar un café (Buy Me a Coffee)')
                  .setCta()
                  .onClick(() => {
                    window.open('https://buymeacoffee.com/nicodx', '_blank');
                  });
              });
            }
          }
        ]
      },
      {
        type: 'group',
        heading: 'Formato de página',
        items: [
          {
            name: 'Tamaño de papel',
            desc: 'Selecciona el tamaño de hoja predeterminado para el PDF.',
            control: {
              type: 'dropdown',
              key: 'pageSize',
              options: {
                A4: 'A4 (210 × 297 mm)',
                Letter: 'Carta / Letter (8.5 × 11 pulg.)',
                Legal: 'Oficio / Legal (8.5 × 14 pulg.)',
                A3: 'A3 (297 × 420 mm)',
                A5: 'A5 (148 × 210 mm)',
                Executive: 'Ejecutivo (7.25 × 10.5 pulg.)'
              }
            }
          },
          {
            name: 'Orientación de la página',
            desc: 'Elige si la hoja debe ser vertical (portrait) u horizontal (landscape).',
            control: {
              type: 'dropdown',
              key: 'pageOrientation',
              options: {
                portrait: 'Vertical (Portrait)',
                landscape: 'Horizontal (Landscape)'
              }
            }
          },
          {
            name: 'Márgenes de página',
            desc: 'Espacio alrededor del contenido en cada hoja.',
            control: {
              type: 'dropdown',
              key: 'margins',
              options: {
                default: 'Estándar (20 mm)',
                narrow: 'Estrecho / Compacto (10 mm)',
                wide: 'Amplio (30 mm)',
                none: 'Sin márgenes (0 mm)'
              }
            }
          }
        ]
      },
      {
        type: 'group',
        heading: 'Fórmulas LaTeX y propiedades',
        items: [
          {
            name: 'Renderizar fórmulas LaTeX',
            desc: 'Convierte automáticamente fórmulas $...$ (inline) y $$...$$ (bloque) usando KaTeX con fuentes vectoriales.',
            control: {
              type: 'toggle',
              key: 'renderLatex'
            }
          },
          {
            name: 'Incluir propiedades de la nota (Frontmatter)',
            desc: 'Muestra una tarjeta estilizada con las propiedades (metadatos, tags, fechas, autor) al inicio del PDF.',
            control: {
              type: 'toggle',
              key: 'showProperties'
            }
          },
          {
            name: 'Propiedades a excluir',
            desc: 'Nombres de propiedades a ocultar del PDF, separados por comas (ejemplo: cssclasses, publish, draft).',
            control: {
              type: 'text',
              key: 'excludedProperties',
              placeholder: 'cssclasses, publish, draft'
            }
          }
        ]
      },
      {
        type: 'group',
        heading: 'Título, encabezado y pie de página',
        items: [
          {
            name: 'Mostrar título principal',
            desc: 'Incluye el nombre de la nota como título H1 al comienzo del documento.',
            control: {
              type: 'toggle',
              key: 'showTitle'
            }
          },
          {
            name: 'Mostrar numeración de páginas',
            desc: 'Agrega "Pág. X de Y" en el pie de página del PDF.',
            control: {
              type: 'toggle',
              key: 'showPageNumbers'
            }
          },
          {
            name: 'Texto personalizado en encabezado',
            desc: 'Texto opcional que aparecerá en la parte superior derecha de cada página.',
            control: {
              type: 'text',
              key: 'headerText',
              placeholder: 'Ej: Confidencial / Documento de estudio'
            }
          },
          {
            name: 'Texto personalizado en pie de página',
            desc: 'Texto opcional que aparecerá en la parte inferior izquierda de cada página.',
            control: {
              type: 'text',
              key: 'footerText',
              placeholder: 'Ej: Autor / Proyecto'
            }
          }
        ]
      },
      {
        type: 'group',
        heading: 'Tema y visualización',
        items: [
          {
            name: 'Tema de color',
            desc: 'Tema de color para el documento PDF generado.',
            control: {
              type: 'dropdown',
              key: 'colorTheme',
              options: {
                light: 'Claro (Óptimo para impresión en papel)',
                dark: 'Oscuro (Lectura digital)',
                sepia: 'Sepia (Tono cálido)'
              }
            }
          },
          {
            name: 'Abrir PDF automáticamente',
            desc: 'Abre el PDF en el visor predeterminado del sistema una vez exportado.',
            control: {
              type: 'toggle',
              key: 'openPdfAfterExport'
            }
          }
        ]
      }
    ];
  }

  getControlValue(key: string): unknown {
    if (key === 'excludedProperties') {
      return this.plugin.settings.excludedProperties.join(', ');
    }
    return (this.plugin.settings as unknown as Record<string, unknown>)[key];
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key === 'excludedProperties') {
      const raw = typeof value === 'string' ? value : '';
      this.plugin.settings.excludedProperties = raw
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      await this.plugin.saveSettings();
      return;
    }
    (this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
    await this.plugin.saveSettings();
  }

  /**
   * Fallback imperative display method for Obsidian versions older than 1.13.0.
   */
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

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
      .setName('☕ Apoyar el proyecto')
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
      .setName('📄 Formato de página')
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
      .setDesc('Elige si la hoja debe ser vertical (portrait) u horizontal (landscape).')
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
      .setName('🧮 Fórmulas LaTeX y propiedades')
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
      .setName('🏷️ Título, encabezado y pie de página')
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
          .setPlaceholder('Ej: Confidencial / Documento de estudio')
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
      .setName('🎨 Tema y visualización')
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
