# Complete PDF Export

[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-purple.svg)](https://obsidian.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donate-orange.svg)](https://buymeacoffee.com/nicodx)

**Complete PDF Export** es un plugin para [Obsidian](https://obsidian.md) pensado especialmente para exportar notas a PDF integrando las **propiedades del documento (frontmatter / metadatos)** y **fórmulas matemáticas renderizadas en LaTeX** en alta calidad vectorial.

> **English:** **Complete PDF Export** is an Obsidian plugin designed to export notes to PDF with full support for **note properties (YAML frontmatter metadata)** and **rendered LaTeX mathematical equations**, along with customizable page sizes, orientations, and margins.

---

## ☕ Apoyar el Proyecto / Support

Si este plugin te resulta de utilidad para tus notas, apuntes o trabajo diario, puedes colaborar conmigo para apoyar su mantenimiento y nuevas mejoras:

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/nicodx)

👉 **[Puedes colaborar conmigo en Buy Me a Coffee](https://buymeacoffee.com/nicodx)**

---

## ✨ Características Principales / Features

- 🧮 **Fórmulas y Ecuaciones LaTeX**: Renderizado perfecto de fórmulas tanto en línea (`$E = mc^2$`) como en bloque (`$$\int_0^\infty ...$$`), matrices, integrales, fracciones y símbolos griegos gracias a KaTeX integrado con fuentes vectoriales embebidas (100% autónomo, sin necesidad de conexión a internet).
- 📋 **Integración de Propiedades (Frontmatter)**: Genera una tarjeta de metadatos limpia al inicio del PDF con tags (etiquetas visuales), fechas, autor, enlaces internos, booleanos y campos personalizados.
- 📐 **Configuración de Página Flexible**:
  - **Tamaño de hoja**: A4, Carta (Letter), Oficio / Legal, A3, A5, Ejecutivo.
  - **Orientación**: Vertical (Portrait) u Horizontal (Landscape).
  - **Márgenes**: Estándar (20 mm), Estrecho (10 mm), Amplio (30 mm) o Sin márgenes.
- 🏷️ **Paginación y Encabezados**: Numeración automática ("Pág. 1 de 5") y textos de encabezado/pie configurables.
- 🎨 **Temas de Color**: Tema Claro (impresión en papel), Oscuro (lectura digital) y Sepia.
- 🖼️ **Soporte Multimedia y Markdown Completo**: Tablas, callouts (`[!NOTE]`, `[!WARNING]`, `[!TIP]`), bloques de código, listas de tareas y resolución automática de imágenes locales del vault.

---

## 🚀 Instalación / Installation

### Desde Obsidian Community Plugins (Próximamente)
1. Abre Obsidian -> **Ajustes** -> **Plugins de la comunidad**.
2. Busca **Complete PDF Export**.
3. Haz clic en **Instalar** y luego en **Activar**.

### Instalación Manual
1. Descarga el último release desde la pestaña [Releases](https://github.com/nicodx/complete-pdf-export/releases).
2. Extrae los archivos (`main.js`, `manifest.json`, `styles.css`) en la carpeta:
   `TU_VAULT/.obsidian/plugins/complete-pdf-export/`
3. En Obsidian, recarga los plugins en **Ajustes** -> **Plugins de la comunidad** y activa **Complete PDF Export**.

---

## 📖 Cómo Usar / How to Use

1. Abre cualquier nota en Obsidian.
2. Abre la ventana de exportación mediante:
   - **Paleta de Comandos** (`Ctrl+P` o `Cmd+P`) -> `Complete PDF Export: Exportar nota actual a PDF`.
   - El icono de **descarga** en la barra lateral izquierda (Ribbon).
   - Clic derecho sobre la nota en el explorador de archivos -> `Complete PDF Export (LaTeX y Propiedades)`.
3. Ajusta las opciones de página, propiedades o tema y presiona **Exportar PDF**.

---

## ⚙️ Opciones de Configuración

| Opción | Descripción |
|---|---|
| **Tamaño de papel** | A4, Carta, Legal, A3, A5, Ejecutivo |
| **Orientación** | Vertical (Portrait) / Horizontal (Landscape) |
| **Márgenes** | Estándar (20mm), Estrecho (10mm), Amplio (30mm), Ninguno |
| **Renderizar fórmulas LaTeX** | Activa/desactiva el renderizado KaTeX |
| **Incluir propiedades** | Activa/desactiva la tarjeta de metadatos al inicio |
| **Propiedades a excluir** | Lista separada por comas (ej. `cssclasses, publish, draft`) |
| **Números de página** | Paginación en el pie de página |
| **Tema de color** | Claro, Oscuro, Sepia |
| **Abrir PDF automáticamente** | Abre el visor de PDF al terminar la exportación |

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
