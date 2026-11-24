(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AremarlaSponsors = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CONTACT = '5493434461280';
  const COLORS = Object.freeze({ rosa: '#ef83c9', lima: '#d4ef87', cielo: '#9bd9f2' });
  function cleanText(value, max = 160) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';
  }
  function safeUrl(value, base, localOnly = false) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim(), base);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      if (localOnly && url.origin !== new URL(base).origin) return null;
      return url.href;
    } catch (_) { return null; }
  }
  // Campaign dates are inclusive calendar days in Argentina, not the viewer's timezone.
  function boundary(value, end) {
    if (value === undefined || value === null || value === '') return end ? Infinity : -Infinity;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
    const [year, month, day] = value.split('-').map(Number);
    if (year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) return NaN;
    const calendar = new Date(Date.UTC(year, month - 1, day));
    if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return NaN;
    return Date.parse(value + (end ? 'T23:59:59.999-03:00' : 'T00:00:00-03:00'));
  }
  function activeSponsors(data, now, base, placement) {
    if (data?.version !== 1 || !Array.isArray(data.sponsors) || !Number.isFinite(now)) return [];
    const ids = new Set();
    return data.sponsors.filter(item => {
      if (!item || item.published !== true || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(item.id || '') || ids.has(item.id)) return false;
      if (!cleanText(item.name, 80) || !Array.isArray(item.placements) || !item.placements.includes(placement)) return false;
      const start = boundary(item.starts_on, false), end = boundary(item.ends_on, true);
      if (Number.isNaN(start) || Number.isNaN(end) || start > end || now < start || now > end) return false;
      ids.add(item.id);
      return true;
    }).map(item => ({
      id: item.id, name: cleanText(item.name, 80), description: cleanText(item.description, 240),
      label: cleanText(item.label, 60) || 'Sponsor de A Remarla',
      logo: safeUrl(item.logo, base, true), url: safeUrl(item.url, base),
      cta: cleanText(item.cta, 40) || 'Conocer la marca',
      order: Number.isFinite(item.order) ? Math.max(-1000, Math.min(1000, item.order)) : 0
    })).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es'));
  }
  function enquiryUrl(fields) {
    const brand = cleanText(fields.brand, 80), name = cleanText(fields.name, 80);
    if (!brand || !name) return null;
    const lines = ['Hola Guille, me interesa ser sponsor de A Remarla.', '', 'Marca o negocio: ' + brand, 'Mi nombre: ' + name,
      'Propuesta: ' + (cleanText(fields.interest, 80) || 'Quiero conocer las opciones')];
    const space = cleanText(fields.space, 60), idea = cleanText(fields.message, 1000);
    if (space) lines.push('Espacio que estuve probando: ' + space);
    if (idea) lines.push('', 'Mi idea: ' + idea);
    return 'https://wa.me/' + CONTACT + '?text=' + encodeURIComponent(lines.join('\n'));
  }
  return Object.freeze({ CONTACT, COLORS, cleanText, safeUrl, boundary, activeSponsors, enquiryUrl });
});
