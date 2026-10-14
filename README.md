# Planta de manufactura XK-335B

Documentación de la planta de manufactura flexible XK-335B del Laboratorio de Control, Carrera de Ingeniería Electrónica, UMSA.

Aquí se junta lo que se ha hecho con la planta semestre a semestre: planos, programas de PLC, informes, diagramas, datasheets, presentaciones y videos. El contenido se publica como página web en Cloudflare Pages y se actualiza solo cada vez que se sube algo a la rama `main`.

## La planta

Cinco unidades, cada una con su PLC Siemens S7-200, conectadas en red PPI por RS-485. Desde II-2026 se agregó un brazo de 4 grados de libertad como sexto nodo.

| N.º | Unidad        | CPU          |
|-----|---------------|--------------|
| 1   | Transporte    | CPU 226 CN   |
| 2   | Alimentación  | CPU 224 CN   |
| 3   | Ensamblaje    | CPU 226 CN   |
| 4   | Procesamiento | CPU 224 CN   |
| 5   | Selección     | CPU 224XP CN |
| 6   | Brazo 4DOF    | CPU 224 CN   |

## Carpetas

```
global/                    Lo que sirve para todos los semestres
  datasheets/              Hojas de datos y manuales de fabricante (PLC, servo, variador, sensores, cilindros)
  manuales/                Manual original de la planta
  programas-originales/    Programas de fábrica (.mwp) de las cinco unidades
  modelos-3d/              Modelos 3D de las unidades
  software/                Enlaces a STEP 7-Micro/WIN y la librería Modbus (en Google Drive)

semestres/                 Una carpeta por semestre, con el nombre AAAA_I o AAAA_II
  2022_II/  2023_I/  2023_II/  2025_II/  2026_I/
  2026_II/                 Semestre en curso

index.html                 Página web (Cloudflare Pages exige que esté en la raíz)
web/                       Estilos, scripts e imágenes de la página
config/                    Títulos, descripciones y videos que se editan a mano
scripts/build-catalog.js   Genera el índice de archivos que usa la página
```

Las carpetas de semestres anteriores se dejaron con la organización que tenía cada grupo. Lo único que se quitó fueron archivos temporales (`.bak`, bloqueos de AutoCAD, comprimidos repetidos) y copias de datasheets que ya están en `global/datasheets`.

## Cómo subir archivos

Lo más simple es desde GitHub: entrar a la carpeta que corresponde, **Add file → Upload files**, arrastrar los archivos y hacer commit en `main`. En uno o dos minutos aparecen en la página.

- Lo de cada semestre va en `semestres/<semestre>/`. Lo que es de la planta y no de un semestre (un datasheet nuevo, un modelo 3D) va en `global/`.
- Nombres sin tildes, sin `ñ` y sin espacios: `seleccion_pid.dwg`, no `Selección P&ID.dwg`.
- Si el nombre o la carpeta incluye la unidad (`transporte`, `alimentacion`, `ensamblaje`, `procesamiento`, `seleccion`, `brazo`), la página lo asigna solo a esa unidad.
- Lo que se puede ver en el navegador (PDF, imágenes, Markdown, Word, AWL, Python, CSV, draw.io) se abre en la página. El resto (`.dwg`, `.mwp`, `.slx`, `.pptx`, SolidWorks, etc.) se descarga.
- Los archivos de más de 25 MB se pueden subir, pero la página los descarga desde GitHub porque Cloudflare no publica archivos de ese tamaño. GitHub no acepta archivos de más de 100 MB.
- Los videos no se suben al repositorio: se suben a YouTube y el enlace se agrega en `config/videos.json`.

## Títulos, descripciones y videos

La página arma el título a partir del nombre del archivo. Para corregirlo, o para agregar una descripción o las unidades a las que pertenece, se edita `config/archivos.json` con la ruta completa del archivo:

```json
"semestres/2026_II/planos/pid/transporte_pid.pdf": {
  "titulo": "P&ID unidad de transporte",
  "descripcion": "Versión 2.0 corregida en el laboratorio 2.",
  "estaciones": [1]
}
```

Si la clave termina en `/`, se aplica a toda la carpeta. También se puede usar `"oculto": true` para que un archivo no aparezca en las listas.

Videos de YouTube, en `config/videos.json`:

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

El resumen de cada semestre que aparece en la página está en `config/semestres.json`. Al empezar un semestre nuevo hay que crear su carpeta en `semestres/` y cambiar `"actual"` en ese archivo.

Si un JSON queda mal escrito (una coma de más, comillas que faltan), Cloudflare no publica el cambio y la página sigue mostrando la versión anterior. El error aparece en el registro del despliegue.

## Ver la página en la computadora

Se necesita Node.js y Python:

```bash
node scripts/build-catalog.js
python -m http.server 8335
```

y abrir `http://localhost:8335`.

## Cloudflare Pages

- Comando de build: `node scripts/build-catalog.js`
- Directorio de salida: vacío (la raíz del repositorio)
- Rama de producción: `main`

El archivo `web/data/catalogo.js` no se sube a GitHub: Cloudflare lo genera en cada despliegue.
