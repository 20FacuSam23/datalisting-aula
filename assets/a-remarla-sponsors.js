(() => {
  'use strict';
  const core = window.AremarlaSponsors;
  if (!core) return;
  const studio = document.getElementById('spPreviewShell');
  const state = { tab: 'web', color: 'rosa', logoUrl: null, logoImage: null };
  const tabLabels = { web: 'Presencia en la web', evento: 'Campaña para una actividad', historia: 'Historia para redes' };
  const tabNotes = { web: 'Logo, mensaje y enlace a tu negocio.', evento: 'Una propuesta acompañada por tu marca.', historia: 'Una pieza vertical para compartir en redes.' };
  const brand = document.getElementById('spBrand'), tagline = document.getElementById('spTagline');
  function paint() {
    const name = core.cleanText(brand.value, 36) || 'Tu marca';
    const phrase = core.cleanText(tagline.value, 72) || 'Compartimos las ganas de estar afuera.';
    document.querySelectorAll('[data-sp-brand]').forEach(node => { node.textContent = name; });
    document.querySelectorAll('[data-sp-tagline]').forEach(node => { node.textContent = phrase; });
    document.querySelectorAll('[data-sp-logo]').forEach(node => {
      node.hidden = !state.logoUrl;
      if (state.logoUrl) { node.src = state.logoUrl; node.alt = 'Logo de ' + name; }
      else node.removeAttribute('src');
    });
    studio.style.setProperty('--sp-accent', core.COLORS[state.color]);
  }
  function selectTab(key, focus) {
    state.tab = key;
    document.querySelectorAll('[data-sp-tab]').forEach(button => {
      const selected = button.dataset.spTab === key;
      button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
      document.getElementById('preview-' + button.dataset.spTab).hidden = !selected;
      if (selected && focus) button.focus();
    });
    document.getElementById('spPreviewLabel').textContent = tabLabels[key];
    document.getElementById('spFormatNote').textContent = tabNotes[key];
  }
  if (studio) {
    brand.addEventListener('input', paint); tagline.addEventListener('input', paint);
    document.querySelectorAll('[data-sp-tab]').forEach(button => {
      button.addEventListener('click', () => selectTab(button.dataset.spTab, false));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const keys = Object.keys(tabLabels), index = keys.indexOf(state.tab);
        selectTab(keys[event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3], true);
      });
    });
    document.querySelectorAll('input[name="spColor"]').forEach(input => input.addEventListener('change', () => { state.color = input.value; paint(); }));
    const upload = document.getElementById('spLogo'), remove = document.getElementById('spRemoveLogo'), status = document.getElementById('spLogoStatus');
    let uploadSequence = 0;
    function clearLogo() {
      if (state.logoUrl) URL.revokeObjectURL(state.logoUrl);
      state.logoUrl = null; state.logoImage = null; upload.value = ''; remove.hidden = true; paint();
    }
    upload.addEventListener('change', async () => {
      const current = ++uploadSequence, file = upload.files[0];
      if (!file) return;
      status.textContent = '';
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        status.textContent = 'Elegí un PNG, JPG o WebP de hasta 5 MB.'; upload.value = ''; return;
      }
      const url = URL.createObjectURL(file);
      try {
        const img = await imageFrom(url);
        if (current !== uploadSequence) { URL.revokeObjectURL(url); return; }
        if (img.naturalWidth * img.naturalHeight > 24000000) throw new Error('dimensions');
        clearLogo(); state.logoUrl = url; state.logoImage = img; remove.hidden = false; paint();
        status.textContent = 'Logo listo para la vista previa.';
      } catch (_) { URL.revokeObjectURL(url); upload.value = ''; status.textContent = 'No pudimos abrir esa imagen. Probá con otra de menor tamaño.'; }
    });
    remove.addEventListener('click', () => { ++uploadSequence; clearLogo(); status.textContent = 'Logo quitado de la muestra.'; });
    document.getElementById('spChooseSpace').addEventListener('click', () => {
      const field = document.getElementById('spContactBrand');
      if (!field.value.trim()) field.value = brand.value.trim();
      document.getElementById('spInterest').value = state.tab === 'web' ? 'Presencia de marca' : 'Campañas y actividades';
    });
    document.getElementById('spDownload').addEventListener('click', exportStory);
    paint();
  }
  document.querySelectorAll('[data-sp-plan]').forEach(button => button.addEventListener('click', () => {
    document.getElementById('spInterest').value = button.dataset.spPlan;
    const field = document.getElementById('spContactBrand');
    if (!field.value.trim()) field.value = brand?.value.trim() || '';
    document.getElementById('contacto').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    field.focus({ preventScroll: true });
  }));
  const form = document.getElementById('spContactForm');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form).entries());
    fields.space = tabLabels[state.tab];
    const url = core.enquiryUrl(fields), status = document.getElementById('spContactStatus');
    if (!url) { status.textContent = 'Completá tu nombre y el de tu negocio.'; return; }
    window.open(url, '_blank', 'noopener,noreferrer');
    status.replaceChildren(document.createTextNode('Para completar la consulta, enviá el mensaje en WhatsApp. '));
    const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'Abrir mi consulta'; status.append(link);
  });

  function imageFrom(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => { img.src = ''; reject(new Error('timeout')); }, 15000);
      img.onload = () => { clearTimeout(timer); resolve(img); };
      img.onerror = () => { clearTimeout(timer); reject(new Error('image')); };
      img.src = url;
    });
  }
  function contain(ctx, img, x, y, w, h) {
    const ratio = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * ratio, dh = img.naturalHeight * ratio;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  function wrapText(ctx, text, x, y, width, lineHeight, maxLines) {
    const words = text.split(/\s+/), lines = []; let current = '';
    for (const word of words) {
      // Long brand names also fit, without disappearing outside the canvas.
      for (const char of (current ? ' ' : '') + word) {
        if (ctx.measureText(current + char).width > width && current) { lines.push(current); current = char.trimStart(); }
        else current += char;
      }
    }
    if (current) lines.push(current);
    lines.slice(0, maxLines).forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
  }
  async function exportStory() {
    const button = document.getElementById('spDownload'), status = document.getElementById('spExportStatus');
    button.disabled = true; status.textContent = 'Preparando la historia…';
    try {
      const snapshot = { name: core.cleanText(brand.value, 36) || 'Tu marca', phrase: core.cleanText(tagline.value, 72) || 'Compartimos las ganas de estar afuera.', color: core.COLORS[state.color], logo: state.logoImage };
      if (document.fonts) await document.fonts.ready;
      const [photo, clubLogo] = await Promise.all([imageFrom(new URL('../../assets/a-remarla-instagram/DgBj1jgDdlT.webp', location.href).href), imageFrom(new URL('../../assets/a-remarla-marca.jpg', location.href).href)]);
      const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1920;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('canvas');
      ctx.fillStyle = '#121f25'; ctx.fillRect(0, 0, 1080, 1920);
      contain(ctx, clubLogo, 60, 55, 90, 90);
      ctx.fillStyle = '#ffffff'; ctx.font = '800 34px Manrope, Arial, sans-serif'; ctx.fillText('A REMARLA', 172, 97);
      ctx.font = '500 19px Manrope, Arial, sans-serif'; ctx.fillText('KAYAK · SUP · PARANÁ', 172, 129);
      ctx.fillStyle = '#ef83c9'; ctx.font = '700 23px Manrope, Arial, sans-serif'; ctx.fillText('VISTA PREVIA', 815, 92);
      ctx.fillStyle = '#ffffff'; ctx.font = '800 84px Manrope, Arial, sans-serif'; ctx.fillText('Hay un río', 62, 263); ctx.fillText('que nos une.', 62, 351);
      ctx.fillStyle = '#0c171c'; ctx.fillRect(60, 400, 960, 940); contain(ctx, photo, 60, 400, 960, 940);
      ctx.fillStyle = snapshot.color; ctx.fillRect(60, 1370, 960, 385);
      ctx.fillStyle = '#121f25'; ctx.font = '800 23px Manrope, Arial, sans-serif'; ctx.fillText('ESPACIO DE SPONSOR · MUESTRA', 98, 1428);
      let nameX = 98, nameWidth = 884;
      if (snapshot.logo) {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(98, 1460, 200, 140); contain(ctx, snapshot.logo, 108, 1470, 180, 120);
        nameX = 324; nameWidth = 648;
      }
      ctx.fillStyle = '#121f25';
      let nameSize = 60;
      do { ctx.font = '800 ' + nameSize + 'px Manrope, Arial, sans-serif'; if (ctx.measureText(snapshot.name).width <= nameWidth * 1.75) break; nameSize -= 2; } while (nameSize > 28);
      wrapText(ctx, snapshot.name, nameX, 1525, nameWidth, 67, 2);
      ctx.font = '500 32px Manrope, Arial, sans-serif'; wrapText(ctx, snapshot.phrase, 98, 1665, 884, 43, 2);
      ctx.fillStyle = '#ffffff'; ctx.font = '700 24px Manrope, Arial, sans-serif'; ctx.fillText('A REMARLA · ESCUELA · RÍO · COMUNIDAD', 60, 1830);
      ctx.fillStyle = '#cbd9da'; ctx.font = '500 21px Manrope, Arial, sans-serif'; ctx.fillText('Muestra de publicidad. Propuesta a coordinar con el club.', 60, 1872);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('export');
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'a-remarla-sponsor-historia.png'; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = 'Historia preparada. Revisá las descargas de tu navegador.';
    } catch (_) { status.textContent = 'No pudimos preparar la imagen. Revisá tu conexión y probá otra vez.'; }
    finally { button.disabled = false; }
  }

  const grids = document.querySelectorAll('[data-sp-partners]');
  if (grids.length) {
    let refreshing = false;
    async function refresh() {
      if (refreshing) return;
      refreshing = true;
      for (const grid of grids) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
          const dataUrl = new URL(grid.dataset.spData, location.href);
          const response = await fetch(dataUrl.href, { cache: 'no-cache', credentials: 'omit', signal: controller.signal });
          if (!response.ok) throw new Error('catalog');
          const sponsors = core.activeSponsors(await response.json(), Date.now(), dataUrl.href, grid.dataset.spPlacement || 'sponsors');
          const cards = sponsors.map(sponsor => {
            const card = document.createElement('article'); card.className = 'sp-partner-card';
            if (sponsor.logo) { const logo = document.createElement('img'); logo.src = sponsor.logo; logo.alt = 'Logo de ' + sponsor.name; logo.loading = 'lazy'; logo.addEventListener('error', () => { logo.hidden = true; }, { once: true }); card.append(logo); }
            const label = document.createElement('small'); label.textContent = sponsor.label;
            const name = document.createElement('h3'); name.textContent = sponsor.name;
            const description = document.createElement('p'); description.textContent = sponsor.description;
            card.append(label, name, description);
            if (sponsor.url) { const link = document.createElement('a'); link.href = sponsor.url; link.target = '_blank'; link.rel = 'sponsored noopener noreferrer'; link.textContent = sponsor.cta; card.append(link); }
            return card;
          });
          grid.replaceChildren(...cards);
          const section = grid.closest('[data-sp-partners-section]');
          if (section) section.hidden = !cards.length;
        } catch (_) {
          // On data failures hide paid placements rather than extending expired campaigns.
          grid.replaceChildren();
          const section = grid.closest('[data-sp-partners-section]'); if (section) section.hidden = true;
        } finally { clearTimeout(timeout); }
      }
      refreshing = false;
    }
    refresh(); setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  }
})();
