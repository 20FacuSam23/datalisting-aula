const test = require('node:test');
const assert = require('node:assert/strict');
const {expiry, isExpired} = require('../assets/a-remarla-vigencia.js');
const published = '2026-11-23T18:00:00+00:00';
const until = caption => expiry({caption, published_at: published});

test('rangos y fechas en español vencen al terminar el último día en Argentina', () => {
  assert.equal(until('CYBER WEEK · Del 2 al 4 de noviembre de 2026'), '2026-11-05T02:59:59.999Z');
  assert.equal(until('Salida domingo 29 de noviembre, 10 a 13 hs'), '2026-11-30T02:59:59.999Z');
  assert.equal(until('Oferta hasta el viernes 27/11/26 inclusive'), '2026-11-28T02:59:59.999Z');
  assert.equal(until('Promo: del 28/11 al 02/12'), '2026-12-03T02:59:59.999Z');
  assert.equal(until('Descuento hasta 2026-11-25'), '2026-11-26T02:59:59.999Z');
});
test('el cierre de inscripción prevalece sobre la fecha de la actividad', () => {
  assert.equal(until('Travesía 29 de noviembre. Inscripciones hasta el 27 de noviembre.'), '2026-11-28T02:59:59.999Z');
});
test('sin año usa la fecha de publicación, también al cruzar diciembre', () => {
  assert.equal(expiry({caption:'Promo hasta el 5 de enero',published_at:'2026-12-29T14:00:00Z'}), '2027-01-06T02:59:59.999Z');
});
test('no asigna vencimiento a las novedades actuales ni inventa fechas ambiguas', () => {
  for (const caption of [
    '▶️ Isla Puente sumegida! Lagunas interiores!',
    '▶️ La clase de los sábados por la mañana con un día soñado!',
    'Promo 2/1 y 50% OFF. Cupos limitados.',
    'Promoción hasta el 31/02/2026',
    'Oferta este fin de semana, fecha a confirmar'
  ]) assert.equal(until(caption), null, caption);
});
test('hoy y mañana se anclan a la publicación y no se renuevan al visitar', () => {
  assert.equal(until('Descuento solo por hoy'), '2026-11-24T02:59:59.999Z');
  assert.equal(until('Promo hasta mañana'), '2026-11-25T02:59:59.999Z');
});
test('vencimiento explícito y límites de horario', () => {
  assert.equal(expiry({caption:'Sin fecha',expires_at:'2026-11-27'}), '2026-11-28T02:59:59.999Z');
  const end = '2026-11-28T02:59:59.999Z';
  assert.equal(isExpired(end, Date.parse(end)), false);
  assert.equal(isExpired(end, Date.parse(end) + 1), true);
  assert.equal(isExpired(null, Date.parse(end)), false);
});
