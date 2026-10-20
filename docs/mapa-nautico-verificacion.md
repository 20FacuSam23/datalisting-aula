# A Remarla: estado de la verificación del mapa

Revisión: 20/10/2026. **El mapa geográfico de C-1, C-2 y cruces sigue pendiente.**

## Resultado publicado

El visor de referencia permite ampliar y recorrer la imagen original recibida,
con accesos a C-1, C-2 y los cruces punteados. Conserva las costas, nombres,
líneas y leyenda de esa imagen: no proyecta ni redibuja esos trazados sobre
OpenStreetMap. El archivo PNG se copia sin modificar sus píxeles.

No se consulta la ubicación del visitante. No se cargan polígonos de la capa
anterior como sustituto de los sectores nuevos. El mapa del entorno, la vista
aérea y el radar siguen siendo vistas distintas.

## Fuentes contrastadas

1. Captura original aportada: `image(20261018-084344).png` (906 × 511).
2. Captura del resultado incorrecto: `image(20261018-090534).png` (1097 × 618).
   Sirve para comprobar la separación incorrecta entre trazados y costas;
   no se usa como fuente de coordenadas.
3. [Prefectura Paraná: página oficial](https://www.argentina.gob.ar/prefecturanaval/deportesnauticos/zona-de-privilegio-practica-deportiva/prefectura-parana).
   En la consulta de esta revisión enlaza la disposición
   `DI-2020-06256491-APN-PARA#PNA`, no el anexo de diciembre de 2025.
4. [Mapa enlazado por Prefectura: metadatos](https://www.arcgis.com/sharing/rest/content/items/e5461f7b44c847d8a78251f2976a6848?f=pjson).
   El mapa declara modificación el 15/12/2025 a las 13:55:01 UTC.
   Su capa `Área_de_prácticas_deportivas_V2/FeatureServer/0` declara última
   edición de datos el 12/12/2025 a las 18:27:17.913 UTC.
   La consulta filtrada por `prefectura='PREFECTURA PARANÁ'` devuelve cuatro
   polígonos: FID 474 (motor), 475 y 476 (vela), 477 (remo). No devuelve un
   sector C-2 ni líneas o puntos de cruce. La fecha del mapa completo no prueba
   por sí sola la fecha de cada entidad ni su adecuación a la nueva disposición.
5. [Elonce, 19/12/2025: publicación del plano](https://www.elonce.com/parana/navegacion-segura-prefectura-delimito-zonas-habilitadas-para-deportes-nauticos-en-parana.htm).
   La imagen del artículo coincide visualmente con la referencia recibida.
6. [0343, 19/12/2025: identificación de la disposición](https://0343.com.ar/prefectura-parana-establecio-nuevas-zonas-para-deportes-nauticos-en-el-rio/).
   Identifica `DI-2025-180-APN-PARA#PNA` y comunica que reemplaza la de 2020.
   Es información periodística; no sustituye al texto y anexo oficiales.
7. [Elonce, 20/12/2025: entrevista al prefecto Pedro Vila](https://www.elonce.com/parana/delimitaron-nuevas-areas-para-kayak-y-sup-en-el-rio-parana.htm).
   Menciona tres sectores de cruce. En el recorte recibido se distinguen dos
   tramos punteados. No se agrega un tercer cruce sin fuente cartográfica.

## Alcance de la comprobación visual

| Elemento | Comprobado en la referencia | Pendiente |
| --- | --- | --- |
| C-1 | Etiqueta y trazado junto a costa e Islote Municipal | Geometría y habilitación vigentes |
| C-2 | Etiqueta y trazado interior de Isla Puente | Geometría y habilitación vigentes |
| Cruces | Dos trazos punteados visibles en el recorte | Localización oficial de todos los cruces y discrepancia con los tres sectores mencionados |
| Costas | Se conserva la costa de la fotografía | Contraste con cartografía actual; fecha de la fotografía desconocida |
| Nombres | Isla Puente, Islote Municipal y canal secundario conservados | Nomenclatura actual de todos los lugares solicitados |

## Condiciones para completar el mapa geográfico

- Conseguir el texto y anexo cartográfico íntegros de la disposición vigente;
  confirmar su vigencia y eventuales modificaciones.
- Obtener geometrías oficiales o coordenadas verificables para C-1, C-2 y
  cada cruce; no deducirlas de descripciones periodísticas o de la captura.
- Contrastar con cartografía náutica actual y revisar visualmente costas,
  extremos de los trazados, separación de orillas y nombres.
- Verificar el conjunto en pantalla grande y en celular antes de reemplazar
  este visor. No publicar una nueva aproximación ni declarar el mapa terminado
  mientras estos puntos estén pendientes.

La ubicación exacta de la escuela tampoco se recalcula a partir de referencias
como «entre el baño y los botones». Requiere un punto comprobable.
