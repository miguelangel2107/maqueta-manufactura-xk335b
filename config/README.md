# Mantenimiento del repositorio y de la página

## Subir archivos

Desde GitHub: entrar a la carpeta, **Add file → Upload files**, arrastrar los archivos y hacer commit en `main`. La página se actualiza uno o dos minutos después.

- Lo de cada semestre va en `semestres/<semestre>/`; lo que es de la planta y no de un semestre (datasheets, modelos 3D) va en `global/`.
- Nombres sin tildes, sin `ñ` y sin espacios: `seleccion_pid.dwg`.
- Si el nombre o la carpeta incluye `transporte`, `alimentacion`, `ensamblaje`, `procesamiento`, `seleccion` o `brazo`, la página asigna el archivo a esa unidad.
- La página clasifica por el nombre y la carpeta: `pid` o `p&id` → P&ID, `electrico` → plano eléctrico, carpeta `mockups` → mockups, `bloques` → diagrama de bloques, `petri` → red de Petri, `mapeo` → mapeo de E/S.
- PDF, imágenes, Markdown, Word, draw.io, CSV y código se abren en la página. Lo demás (`.dwg`, `.mwp`, `.slx`, `.pptx`, SolidWorks…) se descarga.
- GitHub no acepta archivos de más de 100 MB. Los de más de 25 MB se aceptan, pero la página los descarga desde GitHub porque Cloudflare Pages no publica archivos de ese tamaño.
- GitHub no guarda carpetas vacías. Para crear una carpeta nueva, se sube con un `README.md` que explique su contenido.

## Archivos de esta carpeta

### `archivos.json`

Título, descripción, unidades y categoría de un archivo, con su ruta completa como clave:

```json
"semestres/2026_II/planos/pid/transporte_pid.pdf": {
  "titulo": "P&ID unidad de transporte",
  "descripcion": "Versión 2.0.",
  "estaciones": [1]
}
```

- Una clave que termina en `/` se aplica a todos los archivos de esa carpeta.
- `"categoria"` fuerza la categoría: `guia`, `informe`, `mapeo`, `pid`, `electrico`, `mockup`, `plano`, `bloques`, `flujo`, `petri`, `diagrama`, `modelo3d`, `datasheet`, `manual`, `presentacion`, `datos`, `programa`, `basedatos`, `enlace`.
- `"oculto": true` lo saca de las listas (sigue visible en el explorador de carpetas).
- `"orden"`: número menor aparece primero.

### `videos.json`

Videos de YouTube que aparecen en la galería:

```json
"videos": [
  {
    "titulo": "Unidad de selección con el variador",
    "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    "semestre": "2026_II",
    "estaciones": [5]
  }
]
```

### `semestres.json`

Resumen de cada semestre y cuál es el actual (`"actual"`). Al empezar un semestre se crea su carpeta en `semestres/` (por ejemplo `2027_I`) y se cambia `"actual"`.

### `carpetas.json`

Nombre con el que se muestra cada carpeta en la galería y en las secciones de la página, y el orden de las secciones.

Si un JSON queda mal escrito (una coma de más o una comilla que falta), Cloudflare no publica el cambio y la página sigue con la versión anterior. El error aparece en el registro del despliegue en Cloudflare.

## Archivos grandes y videos de semestres anteriores

Los videos y comprimidos de semestres anteriores están en Google Drive. En el repositorio quedan como un `.html` con el enlace (por ejemplo `video.mp4.html`); la página los muestra como enlace. Para hacer uno nuevo se copia `global/software/plantilla_enlace_drive.html` y se cambia el enlace.

## Página web

- `index.html`: estructura de la página. Cloudflare Pages exige que esté en la raíz.
- `web/css`, `web/js`, `web/img`: estilos, lógica e imágenes.
- `scripts/build-catalog.js`: recorre `global/` y `semestres/` y genera `web/data/catalogo.js`, que no se sube a GitHub.

Configuración en Cloudflare Pages:

- Comando de build: `node scripts/build-catalog.js`
- Directorio de salida: vacío (raíz)
- Rama de producción: `main`

Para verla en la computadora (Node.js y Python):

```bash
node scripts/build-catalog.js
python -m http.server 8335
```
