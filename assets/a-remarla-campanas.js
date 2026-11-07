/* A Remarla · Campañas temporales | Afiches originales sin retoques. */
(function () {
  'use strict';
  var previous = document.getElementById('cyberweek-sup');
  var main = document.getElementById('contenido');
  if (!previous || !main) return;
  var existingSection = document.getElementById('campanas-remarla');

  var pictureCyber = new URL('../assets/a-remarla-cybersup-redes-2026.jpg?v=20261105-images5', document.baseURI).href;
  var picturePena = new URL('../assets/a-remarla-pena-rio-nos-une-2026.jpg?v=20261105-images5', document.baseURI).href;
  var pictureArroyo = new URL('../assets/a-remarla-arroyo-las-conchas-2026.jpg?v=20261105-original1', document.baseURI).href;
  var pictureSanta = new URL('../assets/1000727311.jpg?v=20261106-photo-original', document.baseURI).href;
  var campaigns = [
    { id: 'cyberweek', title: 'Cyber Week · Curso SUP', type: 'Promoción', starts: '2026-11-02T00:00:00-03:00', expires: '2026-11-04T23:59:59-03:00', date: 'Del 2 al 4 de noviembre', visibleUntil: '2026-11-15T23:59:59-03:00', photo: pictureCyber, file: 'a-remarla-cybersup-redes-2026.jpg' },
    { id: 'pena-rio-nos-une', title: 'Peña · El Río Nos Une', type: 'Evento', starts: '2026-11-04T00:00:00-03:00', expires: '2026-11-13T23:59:59-03:00', date: 'Viernes 13 de noviembre · 19:00', photo: picturePena, file: 'a-remarla-pena-rio-nos-une-2026.jpg' },
    { id: 'arroyo-las-conchas', title: 'Paseo guiado · Arroyo Las Conchas', type: 'Evento', starts: '2026-11-05T00:00:00-03:00', expires: '2026-11-09T23:59:59-03:00', date: 'Lunes 9 de noviembre · 10:00 a 13:00', photo: pictureArroyo, file: 'a-remarla-arroyo-las-conchas-2026.jpg' },
    { id: 'isla-santa-candida', title: 'Travesía en kayak · Isla Santa Cándida', type: 'Evento', starts: '2026-11-06T00:00:00-03:00', expires: '2026-11-08T23:59:59-03:00', date: 'Domingo 8 de noviembre · 14:00', photo: pictureSanta, file: '1000727311.jpg' }
  ];
  var now = function () { return Date.now(); };
  var active = function (item) { return now() >= Date.parse(item.starts) && now() <= Date.parse(item.expires); };
  var expired = function (item) { return now() > Date.parse(item.expires); };
  var site = new URL('./', window.location.href.split('#')[0]).href;
  var selected = null;
  var lastFocus = null;
  var currentSlide = 0;
  var rotation = null;

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
  var section = existingSection || el('section', 'section view');
  section.id = 'campanas-remarla';
  section.setAttribute('data-section', 'inicio');
  section.setAttribute('aria-label', 'Campañas de A Remarla');
  var heading = el('div', 'cp-heading');
  var headingLeft = el('div');
  headingLeft.append(el('span', 'cp-eyebrow', 'A REMARLA · NOVEDADES'), el('h2', '', 'Eventos y promociones'), el('p', 'cp-description', 'Tocá el afiche para ver los detalles o deslizá para conocer las demás campañas.'));
  heading.append(headingLeft);
  // Los afiches son el único contenido visible del carrusel, sin encabezados superpuestos.

  // Únicamente afiches completos, sin pestañas ni flechas.
  var track = section.querySelector('.cp-track') || el('div', 'cp-track');
  track.setAttribute('aria-label', 'Carrusel de afiches de A Remarla');
  track.tabIndex = 0;
  var dots = section.querySelector('.cp-dots') || el('div', 'cp-dots');
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Elegir afiche');
  if (!existingSection) {
    section.append(dots, track);
    main.insertBefore(section, previous);
  }

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
  // La promoción vencida se mantiene visible. Su formulario admite únicamente consultas
  // por nuevas fechas: el mensaje de WhatsApp aclara que los descuentos ya no rigen.
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
  var arroyoImageCol = el('div');
  var arroyoImage = el('img');
  arroyoImage.src = pictureArroyo;
  arroyoImage.alt = 'Afiche original: Paseo guiado Arroyo Las Conchas, 9 de noviembre a las 10:00';
  arroyoImageCol.append(arroyoImage);
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
  var arroyoShare = el('div', 'cp-share');
  arroyoShare.append(el('strong', '', 'Compartir este paseo'));
  var arroyoShareActions = el('div', 'cp-share-actions');
  arroyoShareActions.append(button('Compartir imagen', function () { sharePicture(campaigns[2], arroyoInfo); }));
  arroyoShareActions.append(button('Copiar enlace', function () { copyLink(campaigns[2], arroyoInfo); }));
  var arroyoOpenImage = el('a', '', 'Ver afiche');
  arroyoOpenImage.href = pictureArroyo;
  arroyoOpenImage.target = '_blank';
  arroyoOpenImage.rel = 'noopener';
  arroyoShareActions.append(arroyoOpenImage);
  arroyoShare.append(arroyoShareActions);
  arroyoInfo.append(arroyoShare);
  arroyoHolder.append(arroyoImageCol, arroyoInfo);
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
  // Travesía en kayak del domingo: sin reutilizar el afiche de otro evento.
  // Mostrar el afiche original sin retoques, con ficha de respaldo si falta la foto.
  var travesiaHolder = el('div', 'cp-pena');
  var travesiaImageCol = el('div');
  var travesiaImage = el('img');
  travesiaImage.alt = 'Afiche original Isla Santa Cándida · A Remarla';
  travesiaImage.loading = 'eager';
  travesiaImage.style.display = 'none';
  var travesiaVisual = el('div', 'cp-image-pending');
  travesiaVisual.append(
    el('small', 'cp-pending-label', 'A REMARLA · TRAVESÍA EN KAYAK'),
    el('strong', '', 'Isla Santa Cándida'),
    el('span', '', 'Domingo 8 de noviembre · 14:00 hs'),
    el('span', '', 'Thompson · Paraná')
  );
  var travesiaInfo = el('div');
  travesiaInfo.append(
    el('span', 'cp-eyebrow', 'TRAVESÍA EN KAYAK'),
    el('h2', '', 'Isla Santa Cándida'),
    el('p', '', 'Domingo 8 de noviembre de 2026 · 14:00 hs · Salida desde Thompson, Paraná.'),
    el('p', '', 'Completá tus datos para consultar disponibilidad y coordinar la reserva con A Remarla.')
  );
  var travesiaForm = el('form');
  travesiaForm.id = 'isla-santa-candida-reserva';
  var travesiaFields = el('div', 'cp-two');
  travesiaFields.append(field('Nombre y apellido', 'nombre', true), field('WhatsApp de contacto', 'telefono', true, 'tel'));
  travesiaForm.append(travesiaFields, field('Consulta (opcional)', 'consulta', false, 'textarea'));
  var travesiaSend = el('button', 'cp-submit', 'Solicitar reserva por WhatsApp');
  travesiaSend.type = 'submit';
  travesiaForm.append(travesiaSend);
  var travesiaStatus = el('p', 'cp-status');
  travesiaStatus.setAttribute('data-cp-status', '');
  travesiaStatus.setAttribute('role', 'status');
  travesiaInfo.append(travesiaForm, travesiaStatus);
  var travesiaShare = el('div', 'cp-share');
  travesiaShare.append(el('strong', '', 'Compartir la travesía'));
  var travesiaShareActions = el('div', 'cp-share-actions');
  travesiaShareActions.append(button('Compartir imagen', function () {
    if (!travesiaImage.naturalWidth) return announce(travesiaInfo, 'El afiche está pendiente de publicación.');
    sharePicture(campaigns[3], travesiaInfo);
  }));
  travesiaShareActions.append(button('Copiar enlace', function () { copyLink(campaigns[3], travesiaInfo); }));
  travesiaShare.append(travesiaShareActions);
  travesiaInfo.append(travesiaShare);
  travesiaImageCol.append(travesiaImage, travesiaVisual);
  travesiaHolder.append(travesiaImageCol, travesiaInfo);
  travesiaImage.addEventListener('load', function () { travesiaImage.style.display = ''; travesiaVisual.hidden = true; });
  travesiaImage.addEventListener('error', function () { travesiaImage.style.display = 'none'; travesiaVisual.hidden = false; });
  travesiaImage.src = pictureSanta;
  travesiaForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!travesiaForm.reportValidity()) return;
    if (expired(campaigns[3])) { announce(travesiaInfo, 'Este evento ya finalizó.'); return; }
    var data = new FormData(travesiaForm);
    var lines = [
      'Hola Guille, quiero consultar por la travesía en kayak a Isla Santa Cándida.',
      'Nombre: ' + String(data.get('nombre') || '').trim(),
      'WhatsApp: ' + String(data.get('telefono') || '').trim(),
      'Fecha: domingo 8 de noviembre de 2026',
      'Hora: 14:00 hs',
      'Lugar: Thompson, Paraná'
    ];
    var question = String(data.get('consulta') || '').trim();
    if (question) lines.push('Consulta: ' + question);
    window.location.href = 'https://wa.me/5493434461280?text=' + encodeURIComponent(lines.join('\n'));
  });
  var holders = { cyberweek: cyberHolder, 'pena-rio-nos-une': penaHolder, 'arroyo-las-conchas': arroyoHolder, 'isla-santa-candida': travesiaHolder };

  // Mantener las cuatro campañas; Cyber Week sigue visible hasta la fecha acordada.
  // Mostrar también eventos sin afiche y conservar Cyber Week hasta el 15/11.
  // La fecha de exhibición es independiente del vencimiento para reservar.
  // Primero los afiches originales disponibles (Cyber Week y Peña).
  // La cuarta campaña sin afiche muestra sus datos y no reemplaza imágenes originales.
  var ordered = campaigns.filter(function (item) { return now() <= Date.parse(item.visibleUntil || item.expires); });
  ordered.sort(function (a, b) { return Number(!!b.photo) - Number(!!a.photo); });
  function updateDots() {
    Array.from(dots.children).forEach(function (dot, index) {
      dot.setAttribute('aria-current', String(index === currentSlide));
      dot.setAttribute('aria-label', 'Campaña ' + (index + 1) + ' de ' + ordered.length +
        ': ' + ordered[index].title);
    });
  }
  function slideTo(index, smooth) {
    if (!ordered.length) return;
    currentSlide = (index + ordered.length) % ordered.length;
    track.scrollTo({ left: currentSlide * track.clientWidth, behavior: smooth ? 'smooth' : 'instant' });
    updateDots();
  }
  function stopRotation() {
    if (rotation != null) { clearInterval(rotation); rotation = null; }
  }
  function startRotation() {
    stopRotation();
    if (overlay.hidden && !document.hidden && ordered.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rotation = setInterval(function () { slideTo(currentSlide + 1, true); }, 6000);
    }
  }
  function render() {
    track.replaceChildren();
    dots.replaceChildren();
    ordered.forEach(function (item, index) {
      var card = el('article', 'cp-card');
      var action = button('', function () { openModal(item); });
      action.setAttribute('aria-label', 'Abrir publicación completa de ' + item.title +
        (expired(item) ? ', finalizada' : ''));
      if (item.photo) {
        var img = el('img');
        img.src = item.photo;
        img.alt = 'Afiche original: ' + item.title;
        img.loading = index === 0 ? 'eager' : 'lazy';
        if (item.id === 'isla-santa-candida') {
          img.addEventListener('error', function () {
            var fallback = el('div', 'cp-image-pending');
            fallback.append(
              el('small', 'cp-pending-label', 'TRAVESÍA EN KAYAK · A REMARLA'),
              el('strong', '', 'Isla Santa Cándida'),
              el('span', '', 'Domingo 8 de noviembre · 14:00 hs'),
              el('span', '', 'Thompson · Paraná'),
              el('span', 'cp-pending-action', 'Ver detalles y reservar')
            );
            action.replaceChildren(fallback);
          });
        }
        action.append(img);
      } else {
        // No reemplazar los afiches entregados por Guille con una foto inventada.
        // Hasta recibir el afiche original, mostrar la tercera campaña con sus datos reales.
        var pending = el('div', 'cp-image-pending');
        pending.append(el('small', 'cp-pending-label', 'TRAVESÍA EN KAYAK · A REMARLA'));
        pending.append(el('strong', '', 'Isla Santa Cándida'));
        pending.append(el('span', '', 'Domingo 8 de noviembre · 14:00 hs'));
        pending.append(el('span', '', 'Thompson · Paraná'));
        pending.append(el('span', 'cp-pending-action', 'Ver detalles y reservar'));
        action.append(pending);
      }
      card.append(action);
      track.append(card);
      var dot = button('', function () { slideTo(index, true); startRotation(); });
      dot.setAttribute('title', item.title);
      dots.append(dot);
    });
    updateDots();
    slideTo(0, false);
    startRotation();
  }
  // Swipe táctil nativo con CSS scroll-snap. La reproducción se reanuda tras interactuar.
  track.addEventListener('pointerdown', stopRotation);
  track.addEventListener('pointerup', startRotation);
  track.addEventListener('pointercancel', startRotation);
  track.addEventListener('scroll', function () {
    if (!track.clientWidth) return;
    var index = Math.max(0, Math.min(ordered.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    if (index !== currentSlide) { currentSlide = index; updateDots(); }
  }, { passive: true });
  track.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      slideTo(currentSlide + (event.key === 'ArrowRight' ? 1 : -1), true);
      startRotation();
    }
  });
  window.addEventListener('resize', function () { slideTo(currentSlide, false); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopRotation(); else startRotation(); });
  function openModal(item) {
    stopRotation();
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
      // No bloquear campos: incluso vencida se puede consultar por próximas fechas,
      // sin aceptar reservas ni asegurar precios de Cyber Week.
      Array.from(cyberForm.querySelectorAll('input,select,button.cw-book')).forEach(function (input) { input.disabled = false; });
      var bookButton = cyberForm.querySelector('button.cw-book');
      if (bookButton) bookButton.textContent = ended ? 'Consultar nuevas fechas por WhatsApp →' : 'Solicitar reserva por WhatsApp →';
      var notice = previous.querySelector('[data-cp-expiry]');
      if (!notice) { notice = el('p', 'cw-note'); notice.setAttribute('data-cp-expiry', ''); cyberForm.insertBefore(notice, cyberForm.firstChild); }
      notice.textContent = ended ? 'La promoción finalizó el 4 de noviembre de 2026. Podés enviar una consulta por nuevas fechas y tarifas vigentes; los descuentos Cyber Week ya no están disponibles.' : '';
      notice.hidden = !ended;
    }
    if (item.id === 'arroyo-las-conchas') {
      var endedArroyo = expired(item);
      Array.from(arroyoForm.querySelectorAll('input,select,textarea,button[type=submit]')).forEach(function (input) { input.disabled = endedArroyo; });
      announce(arroyoInfo, endedArroyo ? 'Este paseo ya finalizó.' : '');
    }
    if (item.id === 'isla-santa-candida') {
      var endedTravesia = expired(item);
      Array.from(travesiaForm.querySelectorAll('input,textarea,button[type=submit]')).forEach(function (input) { input.disabled = endedTravesia; });
      announce(travesiaInfo, endedTravesia ? 'Esta travesía ya finalizó.' : '');
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
    startRotation();
    document.body.classList.remove('cp-modal-open');
    if (selected && selected.id === 'cyberweek') cyberHolder.append(previous);
    else if (selected && selected.id === 'pena-rio-nos-une') penaHolder.append(imageCol, infoCol);
    else if (selected && selected.id === 'arroyo-las-conchas') arroyoHolder.append(arroyoImageCol, arroyoInfo);
    else if (selected && selected.id === 'isla-santa-candida') travesiaHolder.append(travesiaImageCol, travesiaInfo);
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
