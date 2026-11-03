/* A Remarla | Compartir Cyber Week SUP | noviembre 2026 */
(function () {
  'use strict';

  var panel = document.getElementById('cyberweek-share');
  if (!panel) return;

  var status = panel.querySelector('[data-cw-status]');
  var title = 'CYBER WEEK SUP · A Remarla';
  var link = 'https://20facusam23.github.io/datalisting-aula/a-remarla/#cyberweek-sup';
  var message = 'CYBER WEEK SUP · A Remarla, Paraná\nDel 2 al 4 de noviembre de 2026.\nCurso de SUP: 4 clases de 1 hora y media.\nPROMOS: 2x1 (50% OFF) · Individual (35% OFF) · Alumnos A Remarla (40% OFF) · Tabla propia (50% OFF).\nCupos limitados. Inscripciones para noviembre y diciembre.\nMirá los precios, elegí tu promoción e inscribite en la página:';
  var filename = 'a-remarla-cyber-week-sup-historia-2026.png';
  var imageFile = null;
  var imagePromise = null;

  function announce(text) {
    if (status) status.textContent = text;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    var r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function text(ctx, copy, x, y, size, color, weight, align) {
    ctx.font = (weight || 700) + ' ' + size + 'px Arial, sans-serif';
    ctx.fillStyle = color || '#ffffff';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(copy, x, y);
  }

  function makeStoryCanvas() {
    var canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');

    var bg = ctx.createLinearGradient(0, 0, 1040, 1920);
    bg.addColorStop(0, '#0c3553');
    bg.addColorStop(0.48, '#102641');
    bg.addColorStop(1, '#33183f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    // Cielo tecnológico y agua de la costa: ilustración original para compartir.
    ctx.strokeStyle = 'rgba(79,240,225,0.15)';
    ctx.lineWidth = 2;
    for (var i = 0; i < 22; i++) {
      var x = 42 + i * 47;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 80, 850);
      ctx.stroke();
    }
    for (var wave = 0; wave < 23; wave++) {
      var y = 790 + wave * 41;
      ctx.beginPath();
      ctx.strokeStyle = wave % 3 === 0 ? 'rgba(73,235,231,0.22)' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      ctx.moveTo(-30, y);
      ctx.bezierCurveTo(290, y - 45, 640, y + 51, 1110, y - 22);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(222,72,163,0.17)';
    ctx.beginPath();
    ctx.arc(900, 260, 320, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(49,236,235,0.12)';
    ctx.beginPath();
    ctx.arc(60, 880, 330, 0, Math.PI * 2);
    ctx.fill();

    roundRect(ctx, 68, 70, 458, 66, 33);
    ctx.fillStyle = '#be3d93';
    ctx.fill();
    text(ctx, 'A REMARLA · PARANÁ', 96, 113, 31, '#ffffff', 800);

    ctx.save();
    ctx.shadowColor = '#22f4e8';
    ctx.shadowBlur = 33;
    text(ctx, 'CYBER', 58, 344, 182, '#8ffdf4', 900);
    text(ctx, 'SUP', 58, 526, 205, '#8ffdf4', 900);
    ctx.restore();
    text(ctx, 'EN A REMARLA', 73, 611, 61, '#ffffff', 900);

    ctx.save();
    ctx.translate(540, 748);
    ctx.rotate(-0.055);
    text(ctx, 'HASTA 50% OFF', 0, 0, 105, '#ff72c4', 900, 'center');
    ctx.restore();

    roundRect(ctx, 64, 827, 950, 136, 28);
    ctx.fillStyle = 'rgba(5,24,39,0.82)';
    ctx.fill();
    text(ctx, '4 CLASES DE 1 HORA Y MEDIA', 540, 882, 49, '#ffffff', 800, 'center');
    text(ctx, 'STAND UP PADDLE SURF', 540, 932, 35, '#91f6ef', 700, 'center');

    // Esta pieza es publicitaria: los importes sólo aparecen en el formulario de inscripción.
    var promos = [
      ['VIENEN 2, PAGA 1', '50% OFF'],
      ['VENÍS SOLO/A', '35% OFF'],
      ['ALUMNOS A REMARLA', '40% OFF'],
      ['CON TABLA PROPIA', '50% OFF']
    ];
    for (var n = 0; n < promos.length; n++) {
      var top = 1010 + n * 131;
      roundRect(ctx, 65, top, 950, 110, 22);
      ctx.fillStyle = n === 0 ? '#ffffff' : 'rgba(255,255,255,0.94)';
      ctx.fill();
      text(ctx, promos[n][0], 93, top + 68, 33, '#21354e', 800);
      text(ctx, promos[n][1], 982, top + 75, 53, '#a32682', 900, 'right');
    }


    // QR auténtico al formulario Cyber Week: la misma URL utilizada en el enlace de la campaña.
    // Este patrón ya incluye margen blanco para facilitar su lectura desde estados o historias.
    var qrRows = ["11111110000001110100010001000001101111111","10000010010101001100110111111010101000001","10111010111100100110011101000000101011101","10111010110001000000010110100010001011101","10111010111110001111111100001001101011101","10000010111001111010000010110110001000001","11111110101010101010101010101010101111111","00000000101000110011011000101010100000000","10111110011111010100000101101111101111100","00001101100111111001110110101101011110100","01111111111010010000010011111010110100010","00111000111010001000111110100001100011000","10010110001010110100100011011101010001110","10000100011100111110010001010000100110111","01001010110011000100110110111111010011000","11010100100101001110011100110011101111011","01110011101000110000010111110101010100110","10101101011100001010101010101101101111111","11011011101010001011001010011100010010000","10011000010101000001100010111111000011011","00001010101010100011111010010000000010101","01001001001001100001100100101011101101111","10110010001010100000101001011010110000100","11100001110001101000110000110010001101101","01100111010001100101101001100100000000000","11111100110011000111100111001011001011010","01101011110111111000101000111110101100001","00100100111110010000011000110001111101011","00000111100010001101001101110101101001101","11100000001010001010100010011000010111101","10111010010111101011001001000100111101100","10100001100011000001100010101000011100000","10111111111000110011111001100100111110110","00000000101010011100010101101010100010011","11111110011111111100110001111011101011010","10000010110110110110011001011001100010011","10111010100001001000010000110010111110110","10111010100010100011011100001001010100010","10111010110011000100101000010100111111000","10000010001010111100011010111010100010010","11111110100100011100001011110101010111000"];
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(70, 1572, 226, 226);
    ctx.fillStyle = '#092135';
    for (var ry = 0; ry < qrRows.length; ry++) {
      for (var rx = 0; rx < qrRows[ry].length; rx++) {
        if (qrRows[ry][rx] === '1') ctx.fillRect(80 + rx * 5, 1582 + ry * 5, 5, 5);
      }
    }
    text(ctx, 'PROMO DEL 2 AL 4 NOVIEMBRE', 670, 1613, 34, '#a8fff6', 900, 'center');
    text(ctx, 'INSCRIPCIONES NOV. Y DIC. 2026', 670, 1680, 28, '#ffffff', 800, 'center');
    text(ctx, 'CUPOS LIMITADOS', 670, 1742, 39, '#ff9cd6', 900, 'center');
    text(ctx, 'ESCANEÁ EL QR', 670, 1810, 41, '#a8fff6', 900, 'center');
    text(ctx, 'O TOCÁ EL ENLACE DE LA HISTORIA', 540, 1870, 27, '#ffffff', 700, 'center');
    return canvas;
  }

  function prepareImage() {
    if (imagePromise) return imagePromise;
    imagePromise = new Promise(function (resolve, reject) {
      try {
        makeStoryCanvas().toBlob(function (blob) {
          if (!blob) {
            reject(new Error('No se pudo crear la imagen'));
            return;
          }
          imageFile = new File([blob], filename, { type: 'image/png' });
          resolve(imageFile);
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
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
            announce('Se abrió la opción para compartir la imagen. En WhatsApp, elegí Mi estado. El QR lleva a la inscripción.');
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
        if (navigator.share) {
          try {
            await navigator.share({ title: title, text: message, url: link });
            announce('Elegiste dónde compartir la promoción.');
          } catch (error) {
            if (error && error.name !== 'AbortError') announce('No se pudo abrir el menú. Usá WhatsApp, Facebook o Copiar enlace.');
          }
        } else {
          await copyLink();
          announce('Este navegador no ofrece el menú de compartir. Copiamos el enlace.');
        }
        return;
      }
      if (action === 'instagram') {
        if (imageFile && navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          try {
            await navigator.share({ files: [imageFile], title: title });
            announce('En Instagram agregá el sticker «Enlace» con el botón Copiar enlace de esta tarjeta para que puedan inscribirse.');
          } catch (error) {
            if (error && error.name !== 'AbortError') {
              downloadImage(imageFile);
              announce('Historia descargada. Subila a Instagram y agregá el sticker «Enlace» con la dirección de la inscripción.');
            }
          }
        } else {
          var instagramFile = await prepareImage();
          downloadImage(instagramFile);
          announce('Historia descargada. Subila a Instagram y agregá el sticker «Enlace» con la dirección de la inscripción.');
        }
        return;
      }
      if (action === 'download') {
        announce('Generando historia vertical…');
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
