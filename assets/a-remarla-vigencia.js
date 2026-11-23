/* Fechas de promociones: mismo criterio en GitHub Pages y en Hostinger. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ARemarlaVigencia = factory();
})(typeof window === 'undefined' ? this : window, function () {
  'use strict';
  var months = {
    enero: 1, ene: 1, febrero: 2, feb: 2, marzo: 3, mar: 3,
    abril: 4, abr: 4, mayo: 5, may: 5, junio: 6, jun: 6,
    julio: 7, jul: 7, agosto: 8, ago: 8, septiembre: 9, setiembre: 9,
    sep: 9, sept: 9, set: 9, octubre: 10, oct: 10,
    noviembre: 11, nov: 11, diciembre: 12, dic: 12
  };
  var weekday = '(?:lunes|martes|miercoles|jueves|viernes|sabado|domingo)';
  var dateLead = new RegExp('(?:\\b(?:hasta|vence|vencimiento|fecha|el|del|al|desde|dia)|\\b' + weekday + ')\\s*(?:(?:el|este|dia)\\s+)?(?:' + weekday + '\\s*)?$');
  var deadlineLead = new RegExp('\\b(?:hasta|vence|vencimiento|ultimo dia|finaliza|termina|cierre(?: de inscripciones)?)\\s*:?\\s*(?:(?:el|este|dia)\\s+)?(?:' + weekday + '\\s*)?$');

  function normalize(text) {
    return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
  }
  function validDate(year, month, day) {
    var date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }
  function localDay(timestamp) {
    var value = Date.parse(timestamp);
    return Number.isFinite(value) ? new Date(value - 3 * 3600000) : null;
  }
  function endOfDay(year, month, day) {
    return Date.UTC(year, month - 1, day + 1, 3) - 1;
  }
  function dateValue(day, month, year, published) {
    if (!year) {
      if (!published) return null;
      var base = published.getUTCFullYear();
      var candidates = [base - 1, base, base + 1].filter(function (y) { return validDate(y, month, day); });
      candidates.sort(function (a, b) {
        return Math.abs(Date.UTC(a, month - 1, day) - published.getTime()) - Math.abs(Date.UTC(b, month - 1, day) - published.getTime());
      });
      year = candidates[0];
    }
    return year && validDate(year, month, day) ? endOfDay(year, month, day) : null;
  }
  function expiry(post) {
    if (typeof post.expires_at === 'string') {
      var explicit = /^\d{4}-\d{2}-\d{2}$/.test(post.expires_at)
        ? dateValue(Number(post.expires_at.slice(8)), Number(post.expires_at.slice(5, 7)), Number(post.expires_at.slice(0, 4)), null)
        : Date.parse(post.expires_at);
      if (Number.isFinite(explicit)) return new Date(explicit).toISOString();
    }
    var text = normalize(post.caption);
    var published = localDay(post.published_at);
    var promotional = /\b(?:promo(?:cion(?:es)?|s)?|ofertas?|descuentos?|off|cyber\s*(?:week|monday)|black\s*friday|inscripci(?:on|ones)|reservas?|reservar|salidas?|travesias?|paseos?|excursi(?:on|ones)|encuentros?|penas?|eventos?|taller(?:es)?|cursos?|clases?|valid[oa]|vigente|sumate|anotate|cupos?|te esperamos)\b/.test(text)
      || new RegExp('\\b' + weekday + '\\b').test(text)
      || /\b(?:del?|desde)\s+\d{1,2}\s*(?:al?|y|hasta)\s+\d{1,2}\b/.test(text);
    var dates = [], deadlines = [];
    function add(day, month, year, index, numeric) {
      var prefix = text.slice(Math.max(0, index - 70), index);
      var deadline = deadlineLead.test(prefix);
      if (!promotional && !deadline) return;
      // Ratios such as "promo 2/1" are not dates without a date label or year.
      if (numeric && day <= 12 && !year && !dateLead.test(prefix)) return;
      var value = dateValue(day, month, year, published);
      if (value == null) return;
      dates.push(value);
      if (deadline) deadlines.push(value);
    }
    var named = /\b(\d{1,2})\s*(?:de\s+)?(enero|ene|febrero|feb|marzo|mar|abril|abr|mayo|may|junio|jun|julio|jul|agosto|ago|septiembre|setiembre|sept|sep|set|octubre|oct|noviembre|nov|diciembre|dic)\b\.?(?:\s*(?:del?\s+)?(20\d{2}))?/g;
    var numeric = /\b(\d{1,2})[/.\-](\d{1,2})(?:[/.\-](20\d{2}|\d{2}))?\b/g;
    var iso = /\b(20\d{2})-(\d{2})-(\d{2})\b/g;
    var match;
    while ((match = named.exec(text))) add(Number(match[1]), months[match[2]], match[3] ? Number(match[3]) : null, match.index, false);
    while ((match = numeric.exec(text))) add(Number(match[1]), Number(match[2]), match[3] ? (Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3])) : null, match.index, true);
    while ((match = iso.exec(text))) add(Number(match[3]), Number(match[2]), Number(match[1]), match.index, false);
    if (published) {
      var relative = /\b(?:solo por hoy|promo de hoy|hasta hoy|hasta manana)\b/.exec(text);
      if (relative) {
        var day = new Date(published);
        if (relative[0] === 'hasta manana') day.setUTCDate(day.getUTCDate() + 1);
        deadlines.push(endOfDay(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()));
      }
    }
    // An explicit booking/promotion deadline takes precedence over an event date.
    var choices = deadlines.length ? deadlines : dates;
    return choices.length ? new Date(Math.max.apply(null, choices)).toISOString() : null;
  }
  function isExpired(expires, now) {
    var value = Date.parse(expires);
    return Number.isFinite(value) && (now == null ? Date.now() : now) > value;
  }
  return { expiry: expiry, isExpired: isExpired };
});
