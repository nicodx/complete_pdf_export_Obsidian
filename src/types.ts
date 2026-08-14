export type PageSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'Executive';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginOption = 'default' | 'narrow' | 'wide' | 'none';
export type ColorTheme = 'light' | 'dark' | 'sepia';

export interface PluginSettings {
  pageSize: PageSize;
  pageOrientation: PageOrientation;
  margins: MarginOption;
  customMarginMm: number;
  showProperties: boolean;
  excludedProperties: string[];
  showTitle: boolean;
  showPageNumbers: boolean;
  showDate: boolean;
  headerText: string;
  footerText: string;
  colorTheme: ColorTheme;
  openPdfAfterExport: boolean;
  defaultOutputDir: string;
  renderLatex: boolean;
  scalePercent: number;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  pageSize: 'A4',
  pageOrientation: 'portrait',
  margins: 'default',
  customMarginMm: 15,
  showProperties: true,
  excludedProperties: ['cssclasses', 'publish', 'draft'],
  showTitle: true,
  showPageNumbers: true,
  showDate: false,
  headerText: '',
  footerText: '',
  colorTheme: 'light',
  openPdfAfterExport: true,
  defaultOutputDir: '',
  renderLatex: true,
  scalePercent: 100
};

export interface ExportOptions {
  pageSize: PageSize;
  pageOrientation: PageOrientation;
  margins: MarginOption;
  customMarginMm: number;
  showProperties: boolean;
  showTitle: boolean;
  showPageNumbers: boolean;
  showDate: boolean;
  headerText: string;
  footerText: string;
  colorTheme: ColorTheme;
  openPdfAfterExport: boolean;
  renderLatex: boolean;
  scalePercent: number;
}
