(() => {
  'use strict';
  const scriptUrl = document.currentScript.src;
  const frame = document.getElementById('riverMap');
  if (!frame) return;
  // Image coordinates only: this viewer deliberately creates no geographic routes.
  const W = 906, H = 511, ns = 'http://www.w3.org/2000/svg';
  const panel = document.createElement('section');
  panel.id = 'nauticalPlan';
  panel.className = 'nautical-plan';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'nauticalPlanTitle');
  panel.innerHTML = `
    <header class="nautical-plan-head">
      <div><span class="nautical-plan-kicker">EL RÍO · PLANO DE REFERENCIA</span><h2 id="nauticalPlanTitle">Conocé las zonas del plano.</h2><p>Explorá C-1, C-2 y los cruces sobre la imagen original.</p></div>
      <span class="nautical-plan-badge">Vigencia por confirmar</span>
    </header>
    <div class="nautical-plan-sectors" role="group" aria-label="Explorar sectores del plano">
      <button type="button" data-sector="all" aria-pressed="true">Plano completo</button>
      <button type="button" data-sector="c1" aria-pressed="false">C-1 · Costa e islote</button>
      <button type="button" data-sector="c2" aria-pressed="false">C-2 · Isla Puente</button>
      <button type="button" data-sector="crossings" aria-pressed="false">Cruces punteados</button>
    </div>
    <div class="nautical-plan-canvas"></div>
    <div class="nautical-plan-controls" role="group" aria-label="Ampliación del plano">
      <button type="button" data-zoom="in" aria-label="Ampliar el plano">＋</button>
      <output aria-label="Ampliación actual">100 %</output>
      <button type="button" data-zoom="out" aria-label="Reducir el plano">−</button>
      <button type="button" data-zoom="reset">Restablecer vista</button>
    </div>
    <p id="nauticalPlanHelp" class="nautical-plan-help">Ampliá con ＋ y −; arrastrá para recorrer el plano. En el celular también podés usar dos dedos. Con teclado: flechas, ＋, − e Inicio.</p>
    <p class="nautical-plan-status" role="status" aria-live="polite">Plano completo. Se conserva la imagen original.</p>
    <div class="nautical-plan-legend" aria-label="Leyenda del plano">
      <div class="nautical-plan-remo"><i aria-hidden="true"></i><span><b>C-1 / C-2 · Remo, kayak y SUP</b><small>Amarillo continuo: sectores dibujados en el plano.</small></span></div>
      <div class="nautical-plan-crossing"><i aria-hidden="true"></i><span><b>Cruces del plano</b><small>Amarillo punteado: cruces indicados en la imagen.</small></span></div>
      <div class="nautical-plan-other"><i aria-hidden="true"></i><span><b>A · Motor y arrastre</b><small>Verde en el plano.</small></span></div>
      <div class="nautical-plan-sail"><i aria-hidden="true"></i><span><b>B-1 / B-2 · Vela</b><small>Azul en el plano.</small></span></div>
    </div>
    <p class="nautical-plan-limit">Plano de consulta: no muestra tu posición, el tránsito ni las condiciones actuales del río. Confirmá con la escuela y Prefectura las zonas habilitadas antes de salir.</p>
    <details class="nautical-plan-sources"><summary>Fuente y alcance del plano</summary>
      <p>Imagen aportada como referencia y coincidente con el plano publicado por Elonce el 19 de diciembre de 2025. Se conservan sus costas, nombres, líneas y cruces, sin redibujarlos sobre otro mapa.</p>
      <p>La página de Prefectura enlaza una disposición de 2020. La capa digital consultada no incluye C-2 ni los cruces del plano recibido. Hace falta contrastar el anexo vigente y sus coordenadas para incorporarlos a un mapa geográfico.</p>
      <p>En esta imagen se distinguen dos cruces punteados; una entrevista del 20 de diciembre de 2025 menciona tres sectores de cruce. Esa diferencia queda pendiente de verificación.</p>
      <ul><li><a href="https://www.argentina.gob.ar/prefecturanaval/deportesnauticos/zona-de-privilegio-practica-deportiva/prefectura-parana" target="_blank" rel="noopener noreferrer">Consultar Prefectura Paraná ↗</a></li>
      <li><a href="https://www.elonce.com/parana/navegacion-segura-prefectura-delimito-zonas-habilitadas-para-deportes-nauticos-en-parana.htm" target="_blank" rel="noopener noreferrer">Publicación del plano · 19/12/2025 ↗</a></li>
      <li><a href="https://www.elonce.com/parana/delimitaron-nuevas-areas-para-kayak-y-sup-en-el-rio-parana.htm" target="_blank" rel="noopener noreferrer">Entrevista a Prefectura · 20/12/2025 ↗</a></li></ul>
      <a class="nautical-plan-original" target="_blank" rel="noopener">Abrir imagen original ↗</a>
    </details>`;
  const imageUrl = new URL('plano-nautico-referencia.png', scriptUrl).href;
  panel.querySelector('.nautical-plan-original').href = imageUrl;
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('aria-label', 'Plano original: Isla Puente, Islote Municipal, canal secundario, C-1, C-2 y cruces punteados.');
  svg.setAttribute('aria-describedby', 'nauticalPlanHelp');
  const image = document.createElementNS(ns, 'image');
  image.setAttribute('href', imageUrl);
  image.setAttribute('width', W);
  image.setAttribute('height', H);
  svg.append(image);
  panel.querySelector('.nautical-plan-canvas').append(svg);
  frame.before(panel);
  const output = panel.querySelector('output');
  const status = panel.querySelector('.nautical-plan-status');
  const sectorButtons = [...panel.querySelectorAll('[data-sector]')];
  const fit = {x: 0, y: 0, w: W, h: H};
  let box = {...fit}, gesture = null;
  const pointers = new Map();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function render(next, message) {
    const w = clamp(next.w, W / 6, W), h = w * H / W;
    box = {x: clamp(next.x, 0, W - w), y: clamp(next.y, 0, H - h), w, h};
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
    output.textContent = `${Math.round(W / box.w * 100)} %`;
    panel.querySelector('[data-zoom=in]').disabled = box.w <= W / 6 + .01;
    panel.querySelector('[data-zoom=out]').disabled = box.w >= W - .01;
    if (message) status.textContent = message;
  }
  function clearSelection() { sectorButtons.forEach(b => b.setAttribute('aria-pressed', 'false')); }
  function selectSector(name) {
    const sectors = {
      all: [fit, 'Plano completo. Se conserva la imagen original.'],
      c1: [{x: 190, y: 120, w: 520}, 'C-1: detalle de la costa y del Islote Municipal en el plano original.'],
      c2: [{x: 20, y: 65, w: 480}, 'C-2: detalle del lado interior de Isla Puente en el plano original.'],
      crossings: [{x: 190, y: 175, w: 415}, 'Detalle de los dos cruces punteados visibles en esta imagen. Su vigencia está pendiente de confirmar.']
    };
    sectorButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sector === name)));
    render(...sectors[name]);
  }
  function zoomBy(factor, anchor = {x: box.x + box.w / 2, y: box.y + box.h / 2}) {
    const w = clamp(box.w / factor, W / 6, W), ratio = w / box.w;
    clearSelection();
    render({x: anchor.x - (anchor.x - box.x) * ratio, y: anchor.y - (anchor.y - box.y) * ratio, w});
  }
  sectorButtons.forEach(b => b.addEventListener('click', () => selectSector(b.dataset.sector)));
  panel.querySelector('[data-zoom=in]').onclick = () => zoomBy(1.35);
  panel.querySelector('[data-zoom=out]').onclick = () => zoomBy(1 / 1.35);
  panel.querySelector('[data-zoom=reset]').onclick = () => selectSector('all');
  const distance = points => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const midpoint = points => ({x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2});
  function beginGesture() {
    const points = [...pointers.values()];
    gesture = points.length === 1 ? {kind: 'pan', origin: points[0], box: {...box}} : points.length === 2 ? {kind: 'pinch', origin: midpoint(points), distance: distance(points), box: {...box}} : null;
  }
  svg.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    svg.focus({preventScroll: true});
    pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    svg.setPointerCapture(e.pointerId);
    beginGesture();
  });
  svg.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (!gesture) return;
    const rect = svg.getBoundingClientRect(), start = gesture.box, points = [...pointers.values()];
    if (!rect.width || !rect.height) return;
    clearSelection();
    if (gesture.kind === 'pan') {
      render({x: start.x - (e.clientX - gesture.origin.x) * start.w / rect.width, y: start.y - (e.clientY - gesture.origin.y) * start.h / rect.height, w: start.w});
    } else if (points.length === 2 && gesture.distance > 0) {
      const mid = midpoint(points), w = clamp(start.w * gesture.distance / Math.max(1, distance(points)), W / 6, W), ratio = w / start.w;
      const anchor = {x: start.x + (gesture.origin.x - rect.left) / rect.width * start.w, y: start.y + (gesture.origin.y - rect.top) / rect.height * start.h};
      render({x: anchor.x - (anchor.x - start.x) * ratio - (mid.x - gesture.origin.x) * w / rect.width, y: anchor.y - (anchor.y - start.y) * ratio - (mid.y - gesture.origin.y) * w * H / W / rect.height, w});
    }
  });
  function endPointer(e) { pointers.delete(e.pointerId); beginGesture(); }
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) svg.addEventListener(event, endPointer);
  svg.addEventListener('wheel', e => {
    if (!e.ctrlKey && document.activeElement !== svg) return;
    e.preventDefault();
    const point = svg.createSVGPoint(); point.x = e.clientX; point.y = e.clientY;
    const matrix = svg.getScreenCTM();
    if (matrix) zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, point.matrixTransform(matrix.inverse()));
  }, {passive: false});
  svg.addEventListener('keydown', e => {
    const move = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[e.key];
    if (move) { e.preventDefault(); clearSelection(); render({x: box.x + move[0] * box.w / 8, y: box.y + move[1] * box.h / 8, w: box.w}); }
    else if (['+', '=', '-'].includes(e.key)) { e.preventDefault(); zoomBy(e.key === '-' ? 1 / 1.35 : 1.35); }
    else if (e.key === 'Home') { e.preventDefault(); selectSector('all'); }
  });
  image.addEventListener('error', () => { status.textContent = 'No se pudo cargar el plano original. Podés consultar la fuente al pie.'; });
  document.querySelectorAll('[data-map]').forEach(button => button.addEventListener('click', () => {
    const open = button.dataset.map === 'nautical';
    panel.hidden = !open;
    frame.hidden = open;
    if (open) document.getElementById('mapExplanation').textContent = 'Consulta del plano original. El trazado geográfico de C-1, C-2 y cruces sigue pendiente de validación.';
  }));
  render(fit);
  function openFromHash() {
    if (location.hash !== '#mapa-nautico' || typeof show !== 'function') return;
    show('rio');
    document.querySelector('[data-map="nautical"]')?.click();
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();
