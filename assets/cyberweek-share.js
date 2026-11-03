/* A Remarla | Compartir Cyber Week SUP | noviembre 2026 */
(function () {
  'use strict';

  var panel = document.getElementById('cyberweek-share');
  if (!panel) return;

  var status = panel.querySelector('[data-cw-status]');
  var title = 'CYBER WEEK SUP · A Remarla';
  var link = 'https://20facusam23.github.io/datalisting-aula/a-remarla/#cyberweek-sup';
  var message = 'CYBER WEEK SUP · A Remarla, Paraná\nDel 2 al 4 de noviembre de 2026.\nCurso de SUP: 4 clases de 1 hora y media.\nPROMOS: 2x1 (50% OFF) · Individual (35% OFF) · Alumnos A Remarla (40% OFF) · Tabla propia (50% OFF).\nCupos limitados. Inscripciones para noviembre y diciembre.\nMirá los precios, elegí tu promoción e inscribite en la página:';
  var filename = 'a-remarla-cyber-week-sup-historia-2026.jpg';
  var imageFile = null;
  var imagePromise = null;

  function announce(text) {
    if (status) status.textContent = text;
  }

  // La imagen es la pieza original, no una recreación por canvas.
  function prepareImage() {
    if (imageFile) return Promise.resolve(imageFile);
    if (imagePromise) return imagePromise;
    imagePromise = fetch('../assets/a-remarla-cyber-week-sup-historia-2026.jpg')
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

  function openExternal(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
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
      if (action === 'whatsapp') {
        // Compartir un archivo de imagen con el selector nativo, no un texto.
        var whatsappFile = await prepareImage();
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [whatsappFile] })) {
          try {
            await navigator.share({ files: [whatsappFile], title: title });
            announce('Se abrió el menú para compartir la imagen. Elegí WhatsApp y luego Mi estado.');
          } catch (error) {
            if (error && error.name !== 'AbortError') {
              downloadImage(whatsappFile);
              announce('Imagen descargada. Abrí WhatsApp > Novedades > Mi estado y elegí la imagen.');
            }
          }
        } else {
          downloadImage(whatsappFile);
          announce('Imagen descargada. Abrí WhatsApp > Novedades > Mi estado y elegí la imagen.');
        }
        return;
      }
      if (action === 'facebook') {
        openExternal('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link));
        return;
      }
      if (action === 'copy') {
        await copyLink();
        announce('Enlace copiado. Ya podés pegarlo en tus redes.');
        return;
      }
      if (action === 'native') {
        var nativeFile = await prepareImage();
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [nativeFile] })) {
          try {
            await navigator.share({ files: [nativeFile], title: title });
            announce('Compartiste la imagen promocional, sin precios. El QR dirige a la página.');
          } catch (error) {
            if (error && error.name !== 'AbortError') {
              downloadImage(nativeFile);
              announce('Imagen guardada. Podés subirla a tu estado de WhatsApp o historia de Instagram.');
            }
          }
        } else {
          downloadImage(nativeFile);
          announce('Imagen guardada. Podés subirla a tu estado de WhatsApp o historia de Instagram.');
        }
        return;
      }
      if (action === 'instagram') {
        var instagramFile = await prepareImage();
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [instagramFile] })) {
          try {
            await navigator.share({ files: [instagramFile], title: title });
            announce('En Instagram agregá el sticker «Enlace» con el botón Copiar enlace de esta tarjeta para que puedan inscribirse.');
          } catch (error) {
            if (error && error.name !== 'AbortError') {
              downloadImage(instagramFile);
              announce('Historia descargada. Subila a Instagram y agregá el sticker «Enlace» con la dirección de la inscripción.');
            }
          }
        } else {
          downloadImage(instagramFile);
          announce('Historia descargada. Subila a Instagram y agregá el sticker «Enlace» con la dirección de la inscripción.');
        }
        return;
      }
      if (action === 'download') {
        announce('Preparando imagen para el estado…');
        var downloadedFile = await prepareImage();
        downloadImage(downloadedFile);
        announce('Historia lista. Para hacerla clicable en Instagram, añadí el sticker «Enlace» y pegá la URL de la inscripción.');
      }
    } catch (error) {
      announce('No se pudo completar. Probá con Copiar enlace o WhatsApp.');
    }
  });

  // Preparar la imagen por anticipado conserva el gesto táctil al compartir en Instagram.
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(function () { prepareImage().catch(function () {}); });
  } else {
    window.setTimeout(function () { prepareImage().catch(function () {}); }, 250);
  }
})();
