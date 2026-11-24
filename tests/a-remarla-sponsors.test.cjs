const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/a-remarla-sponsors-core.js');
const base = 'https://20facusam23.github.io/datalisting-aula/a-remarla/data/sponsors.json';
const sponsor = (changes = {}) => ({ id: 'marca-prueba', published: true, name: 'Marca de prueba', placements: ['home', 'sponsors'], starts_on: '2026-11-24', ends_on: '2026-11-25', logo: '../../assets/marca.png', url: 'https://example.org/', ...changes });
const active = (items, time, placement = 'home') => core.activeSponsors({ version: 1, sponsors: items }, Date.parse(time), base, placement);

test('solo publica sponsors habilitados, en su espacio y en los días acordados en Argentina', () => {
  assert.equal(active([sponsor()], '2026-11-24T02:59:59Z').length, 0);
  assert.equal(active([sponsor()], '2026-11-24T03:00:00Z').length, 1);
  assert.equal(active([sponsor()], '2026-11-26T02:59:59.999Z').length, 1);
  assert.equal(active([sponsor()], '2026-11-26T03:00:00Z').length, 0);
  assert.equal(active([sponsor({ published: false })], '2026-11-24T12:00:00Z').length, 0);
  assert.equal(active([sponsor({ placements: ['sponsors'] })], '2026-11-24T12:00:00Z').length, 0);
});
test('rechaza fechas inexistentes, rangos invertidos y datos incompatibles', () => {
  for (const changes of [{ starts_on: '2026-02-30' }, { ends_on: '2026-11-23' }, { starts_on: 'mañana' }, { ends_on: 123 }, { placements: null }, { id: '<script>' }]) {
    assert.equal(active([sponsor(changes)], '2026-11-24T12:00:00Z').length, 0);
  }
  assert.equal(core.activeSponsors({}, Date.now(), base, 'home').length, 0);
  assert.equal(core.activeSponsors({ version: 2, sponsors: [sponsor()] }, Date.now(), base, 'home').length, 0);
  assert.equal(active([sponsor({ starts_on: '', ends_on: '' })], '2026-11-24T12:00:00Z').length, 1);
});
test('deduplica y ordena marcas sin inventar espacios ni enlaces', () => {
  const items = [sponsor({ id: 'b', order: 20 }), sponsor({ id: 'a', order: 1 }), sponsor({ id: 'a', name: 'Duplicado' })];
  assert.deepEqual(active(items, '2026-11-24T12:00:00Z').map(x => x.id), ['a', 'b']);
});
test('rechaza protocolos ejecutables, credenciales y logos de terceros', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,bad', 'http://example.org', 'https://user:pass@example.org', '//user:pass@example.org']) assert.equal(core.safeUrl(url, base), null);
  assert.equal(core.safeUrl('https://example.org/logo.png', base, true), null);
  assert.equal(core.safeUrl('../../assets/marca.png', base, true), 'https://20facusam23.github.io/datalisting-aula/assets/marca.png');
  const item = active([sponsor({ logo: 'javascript:bad', url: 'javascript:bad' })], '2026-11-24T12:00:00Z')[0];
  assert.equal(item.logo, null); assert.equal(item.url, null);
});
test('la consulta va al WhatsApp de Guille y conserva el contenido del cliente como texto', () => {
  const result = core.enquiryUrl({ brand: 'Café & Río', name: 'Lucía', interest: 'Campañas y actividades', space: 'Historia para redes', message: 'Una salida + beneficio / 20%' });
  const url = new URL(result);
  assert.equal(url.hostname, 'wa.me'); assert.equal(url.pathname, '/5493434461280');
  const message = url.searchParams.get('text');
  for (const text of ['Café & Río', 'Lucía', 'Campañas y actividades', 'Historia para redes', 'Una salida + beneficio / 20%']) assert.ok(message.includes(text));
  assert.equal(core.enquiryUrl({ brand: ' ', name: 'Lucía' }), null);
  assert.equal(core.enquiryUrl({ brand: 'Marca', name: '' }), null);
});
test('los sponsors empiezan vacíos; la propuesta no presenta marcas como acuerdos reales', () => {
  const data = require('../a-remarla/data/sponsors.json');
  assert.deepEqual(core.activeSponsors(data, Date.now(), base, 'home'), []);
  assert.deepEqual(core.activeSponsors(data, Date.now(), base, 'sponsors'), []);
});
