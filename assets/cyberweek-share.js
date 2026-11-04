/* A Remarla | Compartir Cyber Week SUP | noviembre 2026 */
(function () {
  'use strict';

  var panel = document.getElementById('cyberweek-share');
  if (!panel) return;

  var status = panel.querySelector('[data-cw-status]');
  var title = 'CYBER WEEK SUP · A Remarla';
  var link = 'https://20facusam23.github.io/datalisting-aula/a-remarla/#cyberweek-sup';
  var filename = 'a-remarla-cybersup-redes-2026.jpg';
  var imageFile = null;
  var imagePromise = null;

  function announce(text) {
    if (status) { status.textContent = text; status.hidden = !text; }
  }

  // La imagen es la pieza original, no una recreación por canvas.
  function prepareImage() {
    if (imageFile) return Promise.resolve(imageFile);
    if (imagePromise) return imagePromise;
    imagePromise = fetch('../assets/a-remarla-cybersup-redes-2026.jpg?v=20261103-final')
      .then(function (response) {
        if (!response.ok) throw new Error('Imagen no disponible');
        return response.blob();
      })
      .then(function (blob) {
        imageFile = new File([blob], filename, { type: 'image/jpeg' });
        return imageFile;
      })
      .catch(function (error) {
        imagePromise = null;
        throw error;
      });
    return imagePromise;
  }

  function downloadImage(file) {
    var url = URL.createObjectURL(file);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 15000);
  }

  async function copyLink() {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(link);
      return;
    }
    var input = document.createElement('textarea');
    input.value = link;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    var success = document.execCommand('copy');
    input.remove();
    if (!success) throw new Error('Copiar no disponible');
  }

  panel.addEventListener('click', async function (event) {
    var button = event.target.closest('button[data-cw-share]');
    if (!button || !panel.contains(button)) return;
    var action = button.getAttribute('data-cw-share');
    try {
      if (action === 'copy') {
        await copyLink();
        announce('Enlace copiado. Podés pegarlo en tu historia o enviarlo por mensaje.');
        return;
      }
      if (action !== 'share') return;

      var file = await prepareImage();
      // Una sola función del celular para Instagram, WhatsApp (Mi estado) u otras apps.
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          announce('Seleccioná Instagram o WhatsApp (Mi estado) para publicar la imagen.');
        } catch (error) {
          if (!error || error.name !== 'AbortError') {
            downloadImage(file);
            announce('Imagen descargada. Podés subirla a tu historia o estado desde la galería.');
          }
        }
      } else {
        downloadImage(file);
        announce('Imagen descargada. Podés subirla a Instagram o al estado de WhatsApp.');
      }
    } catch (error) {
      announce('No se pudo preparar la imagen. Probá nuevamente o copiá el enlace.');
    }
  });

  // Preparar la imagen por anticipado facilita el menú de compartir del celular.
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(function () { prepareImage().catch(function () {}); });
  } else {
    window.setTimeout(function () { prepareImage().catch(function () {}); }, 250);
  }
})();
