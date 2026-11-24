/* Presentación pública de A Remarla Paraná. Conserva los módulos y la sesión del aula. */
(() => {
  'use strict';
  const body = document.body;
  if (!body.classList.contains('ar-club')) return;
  const main = document.getElementById('contenido');
  const ids = ['club-inicio', 'club-ribbon', 'club-propuestas', 'campanas-remarla', 'club-comunidad', 'club-sponsors', 'club-lugar', 'club-contacto'];
  // escuela.js conserva su lógica de cursos; esta portada define su propio orden.
  for (const id of [...ids].reverse()) {
    const section = document.getElementById(id);
    if (section) main.prepend(section);
  }
  const campaigns = document.getElementById('campanas-remarla');
  if (campaigns) {
    const intro = document.createElement('div'); intro.className = 'club-news-head';
    const eyebrow = document.createElement('p'); eyebrow.className = 'club-eyebrow'; eyebrow.textContent = 'EL CLUB EN MOVIMIENTO';
    const title = document.createElement('h2'); title.textContent = 'Lo que pasa en el río.';
    const description = document.createElement('p'); description.textContent = 'Novedades, actividades y momentos de A Remarla. Deslizá las imágenes y tocá una para ver la publicación completa.';
    const source = document.createElement('a'); source.href = 'https://www.instagram.com/kayak_parana_club/'; source.target = '_blank'; source.rel = 'noopener noreferrer'; source.textContent = 'Todas las novedades en Instagram';
    intro.append(eyebrow, title, description, source); campaigns.prepend(intro);
    // Conserva cada afiche completo; los puntos quedan debajo de las imágenes.
    const track = campaigns.querySelector('.cp-track'), dots = campaigns.querySelector('.cp-dots');
    if (track && dots) campaigns.append(track, dots);
  }
  function goTo(id) {
    if (typeof show === 'function') show('inicio');
    let target = document.getElementById(id);
    if (id === 'campanas-remarla' && (!target || target.hidden)) target = document.getElementById('club-propuestas');
    const behavior = (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.readingMotion === 'reduced') ? 'auto' : 'smooth';
    target?.scrollIntoView({ behavior, block: 'start' });
    if (target) {
      const focus = target.querySelector('h1,h2') || target;
      focus.setAttribute('tabindex', '-1'); focus.focus({ preventScroll: true });
    }
  }
  document.querySelectorAll('[data-club-scroll]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); goTo(link.dataset.clubScroll);
  }));
  const nav = document.querySelector('.topbar > nav');
  if (nav) {
    // El botón de administración conserva sus permisos y su manejador original.
    [...nav.children].filter(node => !node.hasAttribute('data-manager-only')).forEach(node => node.remove());
    for (const [label, target] of [['El club', 'club-inicio'], ['Actividades', 'campanas-remarla'], ['El lugar', 'club-lugar']]) {
      const link = document.createElement('a'); link.href = '#' + target; link.className = 'nav'; link.textContent = label;
      link.addEventListener('click', event => { event.preventDefault(); goTo(target); }); nav.append(link);
    }
    const sponsors = document.createElement('a'); sponsors.href = 'sponsors/'; sponsors.className = 'nav'; sponsors.textContent = 'Sponsors'; nav.append(sponsors);
  }
  function setTitle() { const expected = body.dataset.aulaPrivate ? 'Aula | A Remarla Paraná' : 'A Remarla Paraná | Club del Río'; if (document.title !== expected) document.title = expected; }
  window.addEventListener('aula-brand', () => queueMicrotask(setTitle));
  new MutationObserver(setTitle).observe(body, { attributes: true, attributeFilter: ['data-aula-private'] });
  const titleElement = document.querySelector('title');
  if (titleElement) new MutationObserver(setTitle).observe(titleElement, { childList: true });
  setTitle();
  const profile = document.getElementById('profileButton'), name = document.getElementById('profileName');
  if (profile && name) {
    const describe = () => { profile.setAttribute('aria-label', name.textContent === 'Ingresar' ? 'Ingresar al aula del club' : 'Cuenta del club: ' + name.textContent); };
    new MutationObserver(describe).observe(name, { childList: true, subtree: true, characterData: true }); describe();
  }
})();
