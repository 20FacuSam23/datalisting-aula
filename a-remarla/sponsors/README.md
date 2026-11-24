# Sponsors de A Remarla

Página pública: `a-remarla/sponsors/`. La portada del club conserva su aula, autenticación, navegación y campañas; solo se agrega un enlace y una sección de sponsors.

## Qué funciona

- Muestra personalizable en tres formatos: web, actividad e historia.
- Nombre, frase, tres colores y logo local (PNG/JPG/WebP, hasta 5 MB). El archivo no se envía a ningún servidor ni se conserva al recargar.
- Descarga de una historia PNG de 1080 × 1920. Conserva la foto completa, con la identidad del sponsor en un espacio aparte. La muestra siempre lleva esa identificación.
- Consulta preparada para el WhatsApp oficial de Guille. El visitante revisa y envía el mensaje; no se registra una solicitud en el aula ni se declara recibida.
- Marcas reales leídas desde `a-remarla/data/sponsors.json`, con aprobación explícita, ubicaciones y vigencia. Las marcas vencidas se retiran al cargar y cada minuto mientras la página está abierta. Si falla la lectura se ocultan los espacios pagados.

## Publicar una marca real

El archivo empieza vacío. Agregar únicamente acuerdos confirmados y logos autorizados. Los logos se guardan como archivos del sitio; las rutas se resuelven respecto del JSON. Ejemplo ilustrativo, no incorporado al catálogo:

```json
{
  "version": 1,
  "sponsors": [{
    "id": "marca-ejemplo",
    "published": false,
    "name": "Marca de ejemplo",
    "label": "Sponsor de A Remarla",
    "description": "Presentación acordada con la marca.",
    "logo": "../../assets/sponsors/marca-ejemplo.png",
    "url": "https://example.org/",
    "cta": "Conocer la marca",
    "placements": ["home", "sponsors"],
    "starts_on": "2026-12-01",
    "ends_on": "2026-12-31",
    "order": 10
  }]
}
```

Las fechas son días completos de Argentina (UTC−03), ambos inclusive. Un límite vacío permite una vigencia abierta. Se descartan fechas inválidas, IDs duplicados, acuerdos deshabilitados y ubicaciones no autorizadas. Los enlaces externos requieren HTTPS y se identifican como patrocinados. Los datos se insertan como texto, no como HTML.

Las opciones comerciales no tienen precios, alcance numérico ni acuerdos de exclusividad inventados. Guille coordina duración, acciones, piezas y valor antes de publicar. La página muestra formatos a contratar; no publica automáticamente anuncios en Instagram ni incorpora sponsors a los afiches actuales.

## Verificación

`node --test tests/a-remarla-sponsors.test.cjs`

Revisar también a 390 px y escritorio: navegación, tres formatos, teclado, carga y eliminación de logo, descarga PNG, validación del formulario y composición de consulta. No enviar consultas de prueba a Guille.

## Continuidad

Es una incorporación estática al sitio actual de GitHub Pages. No modifica las cuentas ni los permisos del aula. La edición compartida desde el panel y las métricas de campañas requieren una conexión de gestión posterior; esta versión no presenta un panel ficticio ni contadores simulados.
