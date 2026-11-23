# Instagram en el carrusel de A Remarla

La importación se ejecuta con código del repositorio, sin Hostinger, login de
Instagram, cookies, claves ni servicios intermediarios. Lee los datos públicos
del perfil incrustado de `kayak_parana_club`, verifica la cuenta autora y obtiene
texto, fecha y portada. Descarga la imagen a `assets/a-remarla-instagram/` y
actualiza `a-remarla/data/instagram.json`. La web lee ese archivo cada minuto.

Cada tarjeta abre su imagen, el texto original, el enlace a Instagram, un
formulario de inscripción/consulta y WhatsApp. El formulario prepara una
solicitud dirigida al WhatsApp de la escuela; la persona debe enviarla y la
escuela confirmar la inscripción. No se almacenan datos personales en GitHub.

## Ejecución

```sh
python3 scripts/sync_instagram.py --mode today
python3 scripts/sync_instagram.py --mode latest
python3 scripts/sync_instagram.py --mode previous
```

`today` sólo incorpora publicaciones del día calendario de Argentina. Los otros
modos permiten la prueba solicitada con la última y la anterior aunque sean de
otro día. Se conserva lo ya incorporado y se evita duplicar por identificador.
Las cuatro campañas anteriores y el login del Club no se modifican.

El workflow `Instagram de A Remarla` corre diariamente a las 09:17 de Argentina
y admite ejecución manual. Al introducir esta función con un commit cuyo
mensaje contiene `[prueba-instagram]`, incorpora la última, espera diez minutos
e incorpora la anterior mediante una segunda lectura real. Luego solicita la
publicación de GitHub Pages. Los tiempos pueden variar por la cola de Actions
y la publicación de Pages.

Si Instagram devuelve un bloqueo, requiere login o cambia el formato público,
la ejecución falla y conserva el último archivo correcto. No fabrica tarjetas
ni sustituye el texto por contenido de ejemplo. No importa historias ni el
archivo de video: en los reels obtiene su portada y descripción.
