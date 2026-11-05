/* A Remarla · Campañas temporales | Afiches originales sin retoques. */
(function () {
  'use strict';
  var previous = document.getElementById('cyberweek-sup');
  var main = document.getElementById('contenido');
  if (!previous || !main || document.getElementById('campanas-remarla')) return;

  var pictureCyber = '../assets/a-remarla-cybersup-redes-2026.jpg?v=20261103-final';
  var picturePena = '../assets/a-remarla-pena-rio-nos-une-2026.jpg';
  var campaigns = [
    { id: 'cyberweek', title: 'Cyber Week · Curso SUP', type: 'Promoción', starts: '2026-11-02T00:00:00-03:00', expires: '2026-11-04T23:59:59-03:00', date: 'Del 2 al 4 de noviembre', photo: pictureCyber, file: 'a-remarla-cybersup-redes-2026.jpg' },
    { id: 'pena-rio-nos-une', title: 'Peña · El Río Nos Une', type: 'Evento', starts: '2026-11-04T00:00:00-03:00', expires: '2026-11-13T23:59:59-03:00', date: 'Viernes 13 de noviembre · 19:00', photo: picturePena, file: 'a-remarla-pena-rio-nos-une-2026.jpg' },
    { id: 'arroyo-las-conchas', title: 'Paseo guiado · Arroyo Las Conchas', type: 'Evento', starts: '2026-11-05T00:00:00-03:00', expires: '2026-11-09T23:59:59-03:00', date: 'Lunes 9 de noviembre · 10:00 a 13:00', photo: null, file: null }
  ];
  var now = function () { return Date.now(); };
  var active = function (item) { return now() >= Date.parse(item.starts) && now() <= Date.parse(item.expires); };
  var expired = function (item) { return now() > Date.parse(item.expires); };
  var site = new URL('./', window.location.href.split('#')[0]).href;
  var selected = null;
  var lastFocus = null;
  var tab = 'active';

  function el(tag, cls, content) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (content != null) n.textContent = content;
    return n;
  }
  function button(label, cb, cls) {
    var n = el('button', cls, label);
    n.type = 'button';
    n.addEventListener('click', cb);
    return n;
  }
  function announce(container, message) {
    var s = container.querySelector('[data-cp-status]');
    if (s) s.textContent = message;
  }
  var section = el('section', 'section view');
  section.id = 'campanas-remarla';
  section.setAttribute('data-section', 'inicio');
  section.setAttribute('aria-label', 'Campañas de A Remarla');
  var heading = el('div', 'cp-heading');
  var headingLeft = el('div');
  headingLeft.append(el('span', 'cp-eyebrow', 'A REMARLA · NOVEDADES'), el('h2', '', 'Eventos y promociones'), el('p', 'cp-description', 'Elegí una campaña para ver su información, consultar y compartir el afiche.'));
  heading.append(headingLeft);
  section.append(heading);

  var controls = el('div', 'cp-controls');
  var tabs = el('div', 'cp-tabs');
  var activeBtn = button('Vigentes', function () { tab = 'active'; render(); });
  var expiredBtn = button('Anteriores', function () { tab = 'expired'; render(); });
  activeBtn.setAttribute('aria-pressed', 'true');
  expiredBtn.setAttribute('aria-pressed', 'false');
  tabs.append(activeBtn, expiredBtn);
  var nav = el('div', 'cp-nav');
  var track = el('div', 'cp-track');
  track.setAttribute('aria-label', 'Carrusel de campañas');
  nav.append(
    button('←', function () { track.scrollBy({ left: -300, behavior: 'smooth' }); }),
    button('→', function () { track.scrollBy({ left: 300, behavior: 'smooth' }); })
  );
  controls.append(tabs, nav);
  section.append(controls, track);
  main.insertBefore(section, previous);

  var overlay = el('div');
  overlay.id = 'campaign-overlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'presentation');
  var dialog = el('div');
  dialog.id = 'campaign-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Campaña de A Remarla');
  var head = el('div', 'cp-dialog-head');
  var headingTitle = el('strong', '', 'A Remarla');
  var actions = el('div');
  actions.style.display = 'flex';
  actions.style.gap = '6px';
  var backBtn = button('← Ofertas', function () { closeModal(); section.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  var schoolBtn = button('La escuela', function () {
    closeModal();
    var hero = main.querySelector('.hero[data-section="inicio"]');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  var closeBtn = button('✕', closeModal);
  closeBtn.setAttribute('aria-label', 'Cerrar promoción');
  actions.append(backBtn, schoolBtn, closeBtn);
  head.append(headingTitle, actions);
  var content = el('div', 'cp-dialog-content');
  dialog.append(head, content);
  overlay.append(dialog);
  document.body.append(overlay);
  overlay.addEventListener('click', function (event) { if (event.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (event) {
    if (overlay.hidden) return;
    if (event.key === 'Escape') { closeModal(); return; }
    if (event.key === 'Tab') {
      var list = Array.from(dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')).filter(function (node) { return node.getClientRects().length; });
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  previous.classList.remove('view');
  previous.removeAttribute('data-section');
  previous.style.display = '';
  // Mantener exactamente el formulario original y su lógica, moviendo el mismo nodo.
  var cyberHolder = el('div');
  cyberHolder.append(previous);
  var cyberForm = previous.querySelector('#cyberweek-form');
  if (cyberForm) cyberForm.addEventListener('submit', function (event) {
    if (expired(campaigns[0])) {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert('Esta promoción finalizó el 4 de noviembre de 2026.');
    }
  }, true);
  var penaHolder = el('div', 'cp-pena');
  var imageCol = el('div');
  var penaImage = el('img');
  penaImage.src = picturePena;
  penaImage.alt = 'Afiche original de Peña El Río Nos Une, viernes 13 de noviembre a las 19:00';
  imageCol.append(penaImage);
  var infoCol = el('div');
  infoCol.append(el('span', 'cp-eyebrow', 'PRÓXIMO EVENTO'), el('h2', '', 'Peña · El Río Nos Une'));
  infoCol.append(el('p', '', 'Viernes 13 de noviembre de 2026 · 19:00 hs · Thompson, Paraná.'));
  infoCol.append(el('p', '', 'Música en vivo, muestra del taller de palas groenlandesas y servicio de cantina.'));
  var form = el('form');
  var statusLine = el('p', 'cp-status');
  statusLine.setAttribute('data-cp-status', '');
  statusLine.setAttribute('role', 'status');
  function field(label, name, required, kind) {
    var wrapper = el('label', 'cp-field', label);
    var input = el(kind === 'textarea' ? 'textarea' : 'input');
    input.name = name;
    if (kind !== 'textarea') input.type = kind || 'text';
    input.required = !!required;
    if (name === 'telefono') input.autocomplete = 'tel';
    if (name === 'nombre') input.autocomplete = 'name';
    if (name === 'telefono') input.inputMode = 'tel';
    wrapper.append(input);
    return wrapper;
  }
  var fields = el('div', 'cp-two');
  fields.append(field('Nombre y apellido', 'nombre', true), field('WhatsApp de contacto', 'telefono', true, 'tel'));
  form.append(fields, field('Consulta (opcional)', 'consulta', false, 'textarea'));
  var send = el('button', 'cp-submit', 'Consultar por WhatsApp');
  send.type = 'submit';
  form.append(send);
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (expired(campaigns[1])) { announce(infoCol, 'El evento ya finalizó.'); return; }
    var data = new FormData(form);
    var lines = ['Hola Guille, quiero consultar por la Peña El Río Nos Une del 13 de noviembre a las 19:00 en Thompson, Paraná.', 'Nombre: ' + String(data.get('nombre') || '').trim(), 'WhatsApp: ' + String(data.get('telefono') || '').trim()];
    var query = String(data.get('consulta') || '').trim();
    if (query) lines.push('Consulta: ' + query);
    window.location.href = 'https://wa.me/5493434461280?text=' + encodeURIComponent(lines.join('\n'));
  });
  infoCol.append(form);
  var share = el('div', 'cp-share');
  share.append(el('strong', '', 'Compartir este evento'));
  var shareActions = el('div', 'cp-share-actions');
  shareActions.append(button('Compartir imagen', function () { sharePicture(campaigns[1], infoCol); }));
  shareActions.append(button('Copiar enlace', function () { copyLink(campaigns[1], infoCol); }));
  var openImage = el('a', '', 'Ver afiche');
  openImage.href = picturePena;
  openImage.target = '_blank';
  openImage.rel = 'noopener';
  shareActions.append(openImage);
  share.append(shareActions, statusLine);
  infoCol.append(share);
  penaHolder.append(imageCol, infoCol);
  // Paseo guiado. No se añade una imagen ficticia: el afiche original puede incorporarse cuando se reciba.
  var arroyoHolder = el('div', 'cp-pena');
  var arroyoInfo = el('div');
  arroyoInfo.append(el('span', 'cp-eyebrow', 'PASEO GUIADO · KAYAK Y SUP'), el('h2', '', 'Arroyo Las Conchas'));
  arroyoInfo.append(el('p', '', 'Lunes 9 de noviembre de 2026 · 10:00 a 13:00 hs · Parque General San Martín, Paraná.'));
  arroyoInfo.append(el('p', '', 'Punto de encuentro: camino de acceso a la playa del camping del Parque.'));
  arroyoInfo.append(el('p', '', 'Recorrido por el arroyo, sus recodos, afluentes y correderas, con una pausa para descansar y compartir en la costa.'));
  var prices = el('ul');
  [
    'General: $25.000 por persona',
    'Alumnos A Remarla: $20.000 por persona',
    'Con kayak propio: $20.000 por persona',
    'Incluye kayak y equipo, guiado y asistencia, y traslado de kayaks.',
    'No incluye entrada al parque ni traslado hasta el parque.',
    'Llevar ropa cómoda, protector solar, repelente, mate y algo para compartir.'
  ].forEach(function (line) { prices.append(el('li', '', line)); });
  arroyoInfo.append(prices);
  var arroyoForm = el('form');
  arroyoForm.id = 'arroyo-reserva';
  var arroyoFields = el('div', 'cp-two');
  arroyoFields.append(field('Nombre y apellido', 'nombre', true), field('WhatsApp de contacto', 'telefono', true, 'tel'));
  arroyoForm.append(arroyoFields);
  var modality = el('label', 'cp-field', 'Modalidad');
  var modalitySelect = el('select');
  modalitySelect.name = 'modalidad';
  ['General · $25.000', 'Alumno AR · $20.000', 'Kayak propio · $20.000'].forEach(function (value) {
    var option = el('option', '', value); option.value = value; modalitySelect.append(option);
  });
  modality.append(modalitySelect);
  arroyoForm.append(modality, field('Consulta (opcional)', 'consulta', false, 'textarea'));
  var arroyoSend = el('button', 'cp-submit', 'Solicitar reserva por WhatsApp');
  arroyoSend.type = 'submit'; arroyoForm.append(arroyoSend);
  var arroyoStatus = el('p', 'cp-status'); arroyoStatus.setAttribute('data-cp-status', '');
  arroyoInfo.append(arroyoForm, arroyoStatus);
  arroyoHolder.append(arroyoInfo);
  arroyoForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!arroyoForm.reportValidity()) return;
    if (expired(campaigns[2])) { announce(arroyoInfo, 'Este evento ya finalizó.'); return; }
    var data = new FormData(arroyoForm);
    var lines = [
      'Hola Guille, quiero reservar para el Paseo Guiado Arroyo Las Conchas del lunes 9 de noviembre, de 10 a 13 hs.',
      'Nombre: ' + String(data.get('nombre') || '').trim(),
      'WhatsApp: ' + String(data.get('telefono') || '').trim(),
      'Modalidad: ' + String(data.get('modalidad') || ''),
      'Consulta: ' + String(data.get('consulta') || '').trim()
    ];
    window.location.href = 'https://wa.me/5493434461280?text=' + encodeURIComponent(lines.filter(Boolean).join('\n'));
  });
  var holders = { cyberweek: cyberHolder, 'pena-rio-nos-une': penaHolder, 'arroyo-las-conchas': arroyoHolder };

  function render() {
    track.replaceChildren();
    activeBtn.setAttribute('aria-pressed', String(tab === 'active'));
    expiredBtn.setAttribute('aria-pressed', String(tab === 'expired'));
    var results = campaigns.filter(function (item) { return tab === 'expired' ? expired(item) : active(item); });
    results.forEach(function (item) {
      var card = el('article', 'cp-card');
      var action = button('', function () { openModal(item); });
      action.setAttribute('aria-label', 'Ver ' + item.title);
      var img = el('img');
      if (item.photo) { img.src = item.photo; img.alt = 'Afiche original: ' + item.title; img.loading = 'lazy'; }
      else { img.hidden = true; img.alt = ''; var description = el('div', 'cp-image-pending', 'Paseo guiado · Kayak y SUP'); action.append(description); }
      var meta = el('span', 'cp-card-meta');
      var badge = el('span', 'cp-badge' + (expired(item) ? ' cp-expired' : ''), expired(item) ? 'Finalizada' : item.type);
      meta.append(badge, el('strong', '', item.title), el('small', '', item.date), el('span', 'cp-cta', 'Ver detalles →'));
      if (item.photo) action.append(img);
      action.append(meta);
      card.append(action);
      track.append(card);
    });
    if (!results.length) track.append(el('p', 'cp-empty', tab === 'expired' ? 'Todavía no hay campañas finalizadas.' : 'No hay campañas activas por el momento.'));
    nav.hidden = results.length <= 1;
  }
  function openModal(item) {
    selected = item;
    lastFocus = document.activeElement;
    headingTitle.textContent = item.title;
    content.replaceChildren(holders[item.id]);
    overlay.hidden = false;
    document.body.classList.add('cp-modal-open');
    dialog.scrollTop = 0;
    content.scrollTop = 0;
    if (item.id === 'cyberweek' && cyberForm) {
      var ended = expired(item);
      Array.from(cyberForm.querySelectorAll('input,select,button.cw-book')).forEach(function (input) { input.disabled = ended; });
      var notice = previous.querySelector('[data-cp-expiry]');
      if (!notice) { notice = el('p', 'cw-note'); notice.setAttribute('data-cp-expiry', ''); cyberForm.insertBefore(notice, cyberForm.firstChild); }
      notice.textContent = ended ? 'Promoción finalizada el 4 de noviembre de 2026. El afiche sigue disponible para consultar y compartir.' : '';
      notice.hidden = !ended;
    }
    if (item.id === 'arroyo-las-conchas') {
      var endedArroyo = expired(item);
      Array.from(arroyoForm.querySelectorAll('input,select,textarea,button[type=submit]')).forEach(function (input) { input.disabled = endedArroyo; });
      announce(arroyoInfo, endedArroyo ? 'Este paseo ya finalizó.' : '');
    }
    if (item.id === 'pena-rio-nos-une') {
      var endedPena = expired(item);
      Array.from(form.querySelectorAll('input,textarea,button[type=submit]')).forEach(function (input) { input.disabled = endedPena; });
      announce(infoCol, endedPena ? 'Este evento ya finalizó.' : '');
    }
    if (window.location.hash !== '#campana-' + item.id) history.replaceState(null, '', '#campana-' + item.id);
    closeBtn.focus();
  }
  function closeModal() {
    overlay.hidden = true;
    document.body.classList.remove('cp-modal-open');
    if (selected && selected.id === 'cyberweek') cyberHolder.append(previous);
    else if (selected && selected.id === 'pena-rio-nos-une') penaHolder.append(imageCol, infoCol);
    else if (selected && selected.id === 'arroyo-las-conchas') arroyoHolder.append(arroyoInfo);
    content.replaceChildren();
    selected = null;
    if (window.location.hash.startsWith('#campana-')) history.replaceState(null, '', site);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  async function copyLink(item, context) {
    var url = site + '#campana-' + item.id;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url);
      else {
        var input = el('textarea');
        input.value = url;
        document.body.append(input);
        input.select();
        var worked = document.execCommand('copy');
        input.remove();
        if (!worked) throw new Error('copy failed');
      }
      announce(context, 'Enlace copiado.');
    } catch (error) { announce(context, 'No se pudo copiar el enlace.'); }
  }
  function downloadFile(file, filename) {
    var url = URL.createObjectURL(file);
    var a = el('a');
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 15000);
  }
  async function sharePicture(item, context) {
    try {
      var response = await fetch(item.photo, { cache: 'no-cache' });
      if (!response.ok) throw new Error('image unavailable');
      var data = await response.blob();
      var file = new File([data], item.file, { type: data.type || 'image/jpeg' });
      if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); announce(context, 'Elegí WhatsApp, Instagram u otra aplicación.'); }
        catch (e) { if (e.name !== 'AbortError') { downloadFile(file, item.file); announce(context, 'Imagen original guardada para compartir.'); } }
      } else {
        downloadFile(file, item.file);
        announce(context, 'Imagen original guardada para compartir desde la galería.');
      }
    } catch (error) { announce(context, 'La imagen no está disponible para compartir.'); }
  }
  render();
  document.documentElement.classList.add('cp-campaign-ready');
  var fragment = window.location.hash.slice(1);
  var linked = campaigns.find(function (item) { return fragment === 'campana-' + item.id; });
  if (linked) openModal(linked);
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.slice(1);
    var target = campaigns.find(function (item) { return hash === 'campana-' + item.id; });
    if (target && (!selected || selected.id !== target.id)) openModal(target);
    if (!target && selected) closeModal();
  });
})();
