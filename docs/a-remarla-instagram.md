# Instagram en el carrusel de A Remarla

La importación se ejecuta en segundo plano, incluso sin visitantes. Actualmente
la ejecuta GitHub Actions; al migrar se activará un cron propio en Hostinger.
No utiliza login de Instagram, cookies, claves ni servicios intermediarios. Lee los datos públicos
del perfil incrustado de `kayak_parana_club`, verifica la cuenta autora y obtiene
texto, fecha y portada. Descarga la imagen a `assets/a-remarla-instagram/` y
actualiza `a-remarla/data/instagram.json`. La web lee ese archivo cada minuto.
Las fotos antiguas y nuevas comparten la presentación redondeada. Sólo se
recortan franjas negras uniformes; el archivo original permanece intacto.

Cada tarjeta abre su imagen, el texto original, el enlace a Instagram, un
formulario de inscripción/consulta y WhatsApp. El formulario prepara una
solicitud dirigida al WhatsApp de la escuela; la persona debe enviarla y la
escuela confirmar la inscripción. No se almacenan datos personales en GitHub.

## Ejecución

```sh
python3 scripts/sync_instagram.py --mode new
python3 scripts/sync_instagram.py --mode latest
python3 scripts/sync_instagram.py --mode previous
```

`new` incorpora identificadores nuevos posteriores a la publicación más reciente
ya guardada. Así no importa el historial anterior ni pierde novedades publicadas
después de la última revisión del día. `today` sigue disponible para una lectura
limitada al día calendario de Argentina. `latest` y `previous` son modos de prueba.
Se conserva todo lo ya incorporado en el archivo y se evita duplicar por
identificador. No hay límites automáticos de 12 o 24 publicaciones. El carrusel
retira las promociones y actividades al pasar su fecha de cierre; las cuatro
originales conservan su orden entre las que sigan vigentes. El login del Club
y sus cuentas se conservan.

`assets/a-remarla-vigencia.js` reconoce fechas claras del texto de Instagram:
fechas con mes escrito, rangos, fechas numéricas con contexto y vencimientos
explícitos (`expires_at`). El último día sigue incluido hasta las 23:59:59 de
Argentina. Una fecha de cierre de inscripciones prevalece sobre la fecha de
la actividad. Si falta el año, se usa la fecha de publicación como referencia;
"hoy" y "hasta mañana" también se anclan a esa publicación, nunca a la visita.
Si la fecha es ambigua o sólo está en la foto, no inventa un vencimiento.
Las novedades sin cierre definido siguen visibles. No se borran fotos ni textos;
un enlace guardado a una promoción vencida permite consultar nuevas fechas.
La vigencia se revisa cada minuto, también sin cambios en el archivo o si falla
su descarga. El mismo código del carrusel funciona al migrar a Hostinger.

El workflow `Instagram de A Remarla` corre diariamente a las 09:17 y 21:17 de
Argentina y admite ejecución manual. Antes de publicar ejecuta pruebas del
lector, la conservación del historial y un conflicto real de escrituras sobre
un repositorio temporal. El publicador usa siempre la rama vigente y repite la
lectura hasta tres veces si otro cambio se publica mientras trabaja, sin forzar
la rama ni rebasar archivos JSON en conflicto. Sólo se ejecuta en un checkout
desechable de Actions; no se debe ejecutar este publicador en el hosting.

Al introducir una prueba con un commit cuyo
mensaje contiene `[prueba-instagram]`, incorpora la última, espera diez minutos
e incorpora la anterior mediante una segunda lectura real. Luego solicita la
publicación de GitHub Pages. Los tiempos pueden variar por la cola de Actions
y la publicación de Pages.

## Preparación para Hostinger / Datalisting

`scripts/sync_instagram_hostinger.php` realiza la misma lectura y conserva el
mismo formato de datos usando PHP 8.2 o posterior. No requiere Python, una base
de datos ni cambios en la autenticación de Datalisting. Se prueba también desde
GitHub Actions contra Instagram. Utiliza bloqueo de archivo y reemplazo atómico
del JSON para que una lectura incompleta no borre el contenido vigente.

Al migrar, probar primero por SSH con las rutas reales del servidor:

```sh
RUTA_PHP RUTA_DEL_SCRIPT/sync_instagram_hostinger.php --mode=new --output=RUTA_PUBLICA/a-remarla/data/instagram.json --image-dir=RUTA_PUBLICA/assets/a-remarla-instagram --image-url-prefix=../assets/a-remarla-instagram/
```

Si cambia la ubicación pública del portal, el sincronizador acepta `--output`,
`--image-dir` y `--image-url-prefix`. La web admite `instagramFeedUrl` e
`instagramImageBaseUrl` dentro de su configuración existente. Usar rutas del
mismo dominio y terminar la ruta base de las imágenes con `/`.

Después de verificar imagen, texto, tarjetas vigentes, formulario,
WhatsApp y acceso al Club en el servidor real, crear el cron de Hostinger. La
programación de hPanel usa UTC: minuto `17`, horas `0,12`, todos los días,
equivalente a las 09:17 y 21:17 de Argentina. Para una sola lectura, usar hora
`12`. Desactivar el horario de GitHub al completar la migración para que quede
un único escritor del contenido. Hostinger todavía no está activado.

Referencia de hPanel: https://www.hostinger.com/support/1583465-how-to-set-up-a-cron-job-at-hostinger/

Si Instagram devuelve un bloqueo, requiere login o cambia el formato público,
la ejecución falla y conserva el último archivo correcto. No fabrica tarjetas
ni sustituye el texto por contenido de ejemplo. No importa historias ni el
archivo de video: en los reels obtiene su portada y descripción.
