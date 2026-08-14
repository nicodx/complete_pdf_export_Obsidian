/**
 * Formatea y renderiza las propiedades (Frontmatter / YAML metadata) de una nota de Obsidian
 * en una tabla o tarjeta visual elegante para incluir al inicio del documento PDF.
 */

export function renderPropertiesHtml(
  frontmatter: Record<string, any> | undefined | null,
  excludedKeys: string[] = []
): string {
  if (!frontmatter || typeof frontmatter !== 'object') {
    return '';
  }

  const excluded = new Set([
    'position', // interno de Obsidian
    ...excludedKeys.map(k => k.trim().toLowerCase())
  ]);

  const entries = Object.entries(frontmatter).filter(([key, val]) => {
    if (excluded.has(key.toLowerCase())) return false;
    if (val === undefined || val === null) return false;
    if (typeof val === 'string' && val.trim() === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  });

  if (entries.length === 0) {
    return '';
  }

  const rowsHtml = entries.map(([key, value]) => {
    const formattedKey = escapeHtml(formatKeyName(key));
    const formattedValue = renderPropertyValue(key, value);
    return `
      <tr class="property-row">
        <td class="property-key">${formattedKey}</td>
        <td class="property-value">${formattedValue}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="properties-container">
      <div class="properties-header">
        <svg class="properties-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span>Propiedades</span>
      </div>
      <table class="properties-table">
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function formatKeyName(key: string): string {
  // Reemplazar guiones bajos o guiones por espacios y capitalizar
  return key
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function renderPropertyValue(key: string, value: any): string {
  const lowerKey = key.toLowerCase();

  // Caso 1: Tags
  if (lowerKey === 'tags' || lowerKey === 'tag') {
    const tagsArray = Array.isArray(value) ? value : String(value).split(',').map(t => t.trim());
    return tagsArray
      .filter(t => t.length > 0)
      .map(t => {
        const cleanTag = t.startsWith('#') ? t.substring(1) : t;
        return `<span class="property-tag">#${escapeHtml(cleanTag)}</span>`;
      })
      .join(' ');
  }

  // Caso 2: Arrays / Listas
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return `<div class="property-list">${value.map(item => `<span class="property-pill">${escapeHtml(String(item))}</span>`).join(' ')}</div>`;
  }

  // Caso 3: Booleanos
  if (typeof value === 'boolean') {
    return value
      ? `<span class="property-bool property-bool-true">✓ Sí</span>`
      : `<span class="property-bool property-bool-false">✗ No</span>`;
  }

  // Caso 4: Enlaces internos tipo [[Nota]]
  if (typeof value === 'string' && value.startsWith('[[') && value.endsWith(']]')) {
    const linkContent = value.slice(2, -2);
    const [target, alias] = linkContent.split('|');
    return `<span class="property-link">${escapeHtml(alias || target)}</span>`;
  }

  // Caso 5: Objetos genéricos
  if (typeof value === 'object') {
    return `<pre class="property-json">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
  }

  // Caso 6: Texto o números normales
  return escapeHtml(String(value));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
