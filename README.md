# Aulas Datalisting

Frontend de demostración y propuestas comerciales, alimentado por los módulos centrales de Datalisting. Requiere backend 2026.10.17-integrada.5.

- Raíz: aula genérica de muestra, portal `aula-generica`, recorrido público sin login.
- `/a-remarla/`: plataforma independiente de A Remarla, portal `a-remarla`, identidad y cursos propios.
- `?portal=identificador`: reutiliza esta interfaz para otra propuesta creada en Matriz.
- `/maqueta-a-remarla/`: redirige al aula funcional para no mantener dos versiones diferentes.

La administración de la escuela funciona en esta misma página: identidad, cursos, clases, archivos privados, enlaces, cuentas e inscripciones. Los alumnos consultan sus cursos y guardan avances. Cada portal tiene cuentas y sesiones independientes; las contraseñas temporales se cambian dentro del aula. Matriz puede administrarlos con su cuenta central.

Las propuestas no crean organizaciones definitivas. Matriz controla módulos e identidad en `/matriz/portales`. Los datos de propuesta se almacenan en un área separada del backend, que procesa cada solicitud y verifica permisos. Solamente los cursos marcados como muestra exponen texto y enlaces al público; los archivos privados requieren cuenta autorizada.

La incorporación requiere confirmación expresa de fidelización. Conserva contenido y cuentas, crea o recupera la organización, sincroniza datos con los módulos operativos y habilita la misma interfaz en `https://datalisting.info/portales/identificador/`. Permanece privada hasta autorizar su publicación. Desde entonces la página GitHub dirige al alojamiento propio.

Los ejemplos están identificados como contenido ilustrativo. No son instrucciones profesionales de navegación. MET Norway suministra el pronóstico mediante el backend con caché y atribución CC BY 4.0. INA, SHN, SMN y NOAA son enlaces: todavía no hay integración de niveles de río, mareas, AIS o alertas automáticas.

La identidad es configurable. No se incluye un logotipo oficial obtenido de Instagram. El control de acceso protege los archivos; la marca de agua y el desenfoque no impiden capturas de un usuario autorizado.

Las evaluaciones y certificaciones formales continúan disponibles en los módulos educativos del sistema para organizaciones incorporadas. El recorrido de prospecto permite clases, materiales e inscripción y progreso; no emite certificados formales.
