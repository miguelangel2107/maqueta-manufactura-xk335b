/**
 * =============================================================================
 * GENERADOR AUTOMÁTICO DEL CATÁLOGO TÉCNICO Y EVIDENCIAS - PLANTA XK-335B
 * Universidad Mayor de San Andrés (UMSA) - Ingeniería Electrónica
 * =============================================================================
 * Este script escanea recursivamente el repositorio para descubrir planos,
 * datasheets, scripts SQL, informes y evidencias fotográficas.
 *
 * Ejecución:
 *   node scripts/build-catalog.js
 *
 * Salidas generadas:
 *   - docs/catalogo_documentos.json
 *   - docs/catalogo_documentos.js
 *   - docs/evidencias_data.json
 *   - docs/evidencias_data.js
 */

const fs = require('fs');
const path = require('path');

// Directorio raíz del repositorio (un nivel arriba de scripts/)
const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const CONFIG_FILE = path.join(DOCS_DIR, 'datasheets_config.json');

// Metadatos y títulos conocidos para archivos clave
const KNOWN_DOCS = {
  'Informe_Laboratorio_1.pdf': {
    id: 'inf-lab1',
    orden_prioridad: 1,
    titulo: 'Informe Oficial de Auditoría de Campo y Ruptura de Lazo (Lab 1)',
    categoria: 'informe',
    estaciones: ['1', '2', '3', '4', '5'],
    badgeClass: 'badge-informe',
    badgeText: 'Informe Oficial',
    descripcion: 'Memoria técnica completa de 40 páginas: inspección estática cable por cable, inventario real de activos, mapeo I/O de las 5 CPUs Siemens y demostración analítica de pérdida de observabilidad.'
  },
  'transporte_pid.dwg': {
    id: 'plano-pid-est1-dwg',
    orden_prioridad: 7,
    titulo: 'Plano P&ID CAD: Unidad de Transporte (AutoCAD DWG)',
    categoria: 'pid',
    estaciones: ['1'],
    badgeClass: 'badge-pid',
    badgeText: 'Plano CAD (DWG)',
    isDownloadOnly: true,
    descripcion: 'Plano original de instrumentación y lazos de control de la Unidad de Transporte en formato nativo AutoCAD (.dwg).'
  },
  'transporte_pid.pdf': {
    id: 'plano-pid-est1-pdf',
    orden_prioridad: 8,
    titulo: 'Plano P&ID: Unidad de Transporte (ANSI/ISA-S5.1)',
    categoria: 'pid',
    estaciones: ['1'],
    badgeClass: 'badge-pid',
    badgeText: 'Plano P&ID (ISA)',
    isDownloadOnly: false,
    descripcion: 'Diagrama funcional de instrumentación para el lazo horizontal y manipulador cartesiano de la Estación 1 exportado a PDF.'
  },
  'Unidad_de_Alimentacion.pdf': {
    id: 'plano-elec-est2-pdf',
    orden_prioridad: 9,
    titulo: 'Plano Eléctrico: Unidad de Alimentación (IEC 60617)',
    categoria: 'electrico',
    estaciones: ['2'],
    badgeClass: 'badge-electrico',
    badgeText: 'Plano CAD (IEC)',
    isDownloadOnly: false,
    descripcion: 'Esquema unifilar y multifilar oficial para la Estación 2: electroválvula eyectora 24 VDC, sensor fotoeléctrico Omron y regleta de bornes.'
  },
  'AlimentacionCAD.pdf': {
    id: 'plano-elec-est2-cad-legacy',
    orden_prioridad: 10,
    titulo: 'Plano Eléctrico CAD: Unidad de Alimentación (IEC 60617)',
    categoria: 'electrico',
    estaciones: ['2'],
    badgeClass: 'badge-electrico',
    badgeText: 'Plano CAD (IEC)',
    isDownloadOnly: false,
    descripcion: 'Esquema exportado desde AutoCAD Electrical para la Estación 2: conexionado de electroválvulas Airtac, sensor Omron y borneras.'
  },
  'Unidad_de_Ensamblaje.pdf': {
    id: 'plano-elec-est4-pdf',
    orden_prioridad: 10,
    titulo: 'Plano Eléctrico: Unidad de Ensamblaje (IEC 60617)',
    categoria: 'electrico',
    estaciones: ['4'],
    badgeClass: 'badge-electrico',
    badgeText: 'Plano CAD (IEC)',
    isDownloadOnly: false,
    descripcion: 'Esquema eléctrico de potencia y mando para la Estación 4: actuador rotativo oscilante 0–180°, pinza angular y bornes.'
  },
  'Unidad_de_Procesamiento.pdf': {
    id: 'plano-elec-est3-pdf',
    orden_prioridad: 10,
    titulo: 'Plano Eléctrico: Unidad de Procesamiento (IEC 60617)',
    categoria: 'electrico',
    estaciones: ['3'],
    badgeClass: 'badge-electrico',
    badgeText: 'Plano CAD (IEC)',
    isDownloadOnly: false,
    descripcion: 'Esquema de mando para prensa neumática vertical, cilindro guiado MGPM y enclavamientos de seguridad.'
  },
  'Unidad_de_Seleccion.pdf': {
    id: 'plano-elec-est5-pdf',
    orden_prioridad: 10,
    titulo: 'Plano Eléctrico: Unidad de Selección (IEC 60617)',
    categoria: 'electrico',
    estaciones: ['5'],
    badgeClass: 'badge-electrico',
    badgeText: 'Plano CAD (IEC)',
    isDownloadOnly: false,
    descripcion: 'Circuito trifásico de potencia: variador de frecuencia POWTRAN PT9100A, motor asíncrono y retroalimentación de encoder HSC0.'
  },
  'Diagrama_Electrico/README.md': {
    id: 'norma-electrica-master',
    orden_prioridad: 11,
    titulo: 'Normativa de Esquemas Eléctricos de Potencia y Mando (IEC)',
    categoria: 'electrico',
    estaciones: ['1', '2', '3', '4', '5'],
    badgeClass: 'badge-electrico',
    badgeText: 'Normativa IEC',
    isDownloadOnly: false,
    descripcion: 'Manual de estandarización eléctrica: distribución de 220 VAC y 24 VDC, código normalizado de colores de conductores y diseño de tableros según IEC 60617 / 81346.'
  },
  'Diagrama_P&ID/README.md': {
    id: 'norma-pid-master',
    orden_prioridad: 12,
    titulo: 'Guía de Diagramas de Instrumentación P&ID (ANSI/ISA-S5.1-2009)',
    categoria: 'pid',
    estaciones: ['1', '2', '3', '4', '5'],
    badgeClass: 'badge-pid',
    badgeText: 'Normativa ISA',
    isDownloadOnly: false,
    descripcion: 'Estandarización de tags de instrumentos (PV, MV, DV), reglas de numeración de lazos, tipos de burbujas en campo/panel/PLC y codificación de líneas.'
  },
  'mockups/README.md': {
    id: 'mockup-ui-spec',
    orden_prioridad: 15,
    titulo: 'Especificaciones de Mockups UI/UX para HMI y Dashboard ERP',
    categoria: 'mockup',
    estaciones: ['1', '2', '3', '4', '5'],
    badgeClass: 'badge-mockup',
    badgeText: 'Norma ISA-101',
    isDownloadOnly: false,
    descripcion: 'Wireframes interactivos y diseño de alto desempeño (ISA-101) para pantalla táctil de celda y Dashboard SCADA/ERP web de monitoreo centralizado.'
  },
  '01_schema_telemetria_3fn.sql': {
    id: 'sql-ddl-3fn',
    orden_prioridad: 70,
    titulo: 'Script DDL: Esquema Relacional de Telemetría en 3FN',
    categoria: 'sql',
    estaciones: ['1', '2', '3', '4', '5'],
    badgeClass: 'badge-sql',
    badgeText: 'PostgreSQL DDL',
    isDownloadOnly: false,
    descripcion: 'Definición DDL normalizada en Tercera Forma Normal (estaciones, instrumentos, variables PV/MV/DV, telemetría histórica, alarmas y logs de operadores).'
  },
  '02_seed_data_xk335b.sql': {
    id: 'sql-seed-activos',
    orden_prioridad: 71,
    titulo: 'Script DML: Población de Datos Auditados y Tags ISA-S5.1',
    categoria: 'sql',
    estaciones: ['1', '2', '3', '4', '5'],
    badgeClass: 'badge-sql',
    badgeText: 'Datos Semilla SQL',
    isDownloadOnly: false,
    descripcion: 'Población de datos de las 5 estaciones, 20 instrumentos auditados en campo, variables clasificadas para control y usuarios operadores de la escuadra.'
  },
  '03_indices_optimizacion.sql': {
    id: 'sql-indices-triggers',
    orden_prioridad: 72,
    titulo: 'Script SQL: Índices de Optimización B-Tree y Disparadores',
    categoria: 'sql',
    estaciones: ['1', '2', '3', '4', '5'],
    badgeClass: 'badge-sql',
    badgeText: 'Triggers & Índices',
    isDownloadOnly: false,
    descripcion: 'Índices B-Tree compuestos para acelerar consultas temporales de telemetría y función trigger para registrar eventos de alarma automáticamente.'
  }
};

// Metadatos conocidos para evidencias Kaizen (fig01 a fig14)
const KNOWN_EVIDENCIAS = {
  'fig01_portada_maqueta_xk335b.png': {
    title: 'Vista General de la Maqueta XK-335B',
    loc: 'Planta Completa (5 Estaciones)',
    severity: 'INFO',
    desc: 'Disposición espacial y secuencial de la línea de manufactura flexible en el laboratorio de control.'
  },
  'fig02_sensores_capacitivos_motor_trifasico.png': {
    title: 'Motor Trifásico y Sensor Capacitivo Winston CM18',
    loc: 'Estación 5: Unidad de Selección',
    severity: 'MEDIUM',
    desc: 'Rectificación física: El accionamiento es un motor asíncrono trifásico alimentado por VFD y cuenta con sensor capacitivo para discriminar plásticos, desmintiendo reportes legados.'
  },
  'fig03_borneras_conexiones_cables_expuestos.png': {
    title: 'Cables con Cobre Expuesto y Señalización Desprendida',
    loc: 'Borneras de Conexión de Sensores',
    severity: 'HIGH',
    desc: 'Deficiente ensamblaje en borneras con hilos de cobre vivos fuera del conector y pérdida de identificación de hilos.'
  },
  'fig04_carcasa_fracturada_plc_s7200.png': {
    title: 'Carcasa Plástica Fracturada en Módulo PLC',
    loc: 'Controladores Siemens S7-200',
    severity: 'MEDIUM',
    desc: 'Fractura mecánica en el plástico de sujeción de bornes por torque excesivo durante mantenimientos anteriores.'
  },
  'fig05_sensores_fijados_silicona_cinta.png': {
    title: 'Sensores Fijados con Silicona Caliente y Cinta Adhesiva',
    loc: 'Estación 3: Unidad de Procesamiento',
    severity: 'CRITICAL',
    desc: 'Peligro Kaizen crítico: Los sensores magnéticos SMC carecen de abrazaderas rígidas. Su desprendimiento causa pérdida total de observabilidad (C = [0 0]) y colisión mecánica.'
  },
  'fig06_desalineacion_piston_pinza.png': {
    title: 'Desalineación Mecánica en Pistón y Pinza',
    loc: 'Estación 3: Unidad de Procesamiento',
    severity: 'HIGH',
    desc: 'Desfase angular entre el cilindro vertical de prensa y la mordaza lateral, originando atascamiento de piezas y desgaste asimétrico.'
  },
  'fig07_conexion_no_documentada_vfd_giro.png': {
    title: 'Cableado No Documentado para Inversión de Giro en VFD',
    loc: 'Estación 5: Unidad de Selección',
    severity: 'HIGH',
    desc: 'Conductor físico no registrado en los esquemas originales conectando una salida digital del PLC al terminal REV del VFD POWTRAN.'
  },
  'fig08_cable_sensor_aislamiento_danado.png': {
    title: 'Cable Pelado con Cobre Rozando Perfil de Aluminio',
    loc: 'Estación 4: Unidad de Ensamblaje',
    severity: 'CRITICAL',
    desc: 'Riesgo inminente de cortocircuito a masa de 24 VDC por pérdida del aislamiento externo en contacto directo con la bancada metálica.'
  },
  'fig09_diagrama_bloques_alimentacion.jpg': {
    title: 'Diagrama de Causalidad: Unidad de Alimentación',
    loc: 'Estación 2 (ETN-902)',
    severity: 'INFO',
    desc: 'Diagrama de bloques funcionales y relación entrada/salida para la eyección de piezas en la tolva de alimentación.'
  },
  'fig10_diagrama_bloques_procesamiento.jpg': {
    title: 'Diagrama de Causalidad: Unidad de Procesamiento',
    loc: 'Estación 3 (ETN-902)',
    severity: 'INFO',
    desc: 'Modelado fenomenológico y lazos de enclavamiento de la prensa de punzonado y mordaza.'
  },
  'fig11_diagrama_bloques_ensamblaje.jpg': {
    title: 'Diagrama de Causalidad: Unidad de Ensamblaje',
    loc: 'Estación 4 (ETN-902)',
    severity: 'INFO',
    desc: 'Secuencia temporal del actuador rotativo 0-180° y pinza angular neumática.'
  },
  'fig12_diagrama_bloques_seleccion.jpg': {
    title: 'Diagrama de Causalidad: Unidad de Selección',
    loc: 'Estación 5 (ETN-902)',
    severity: 'INFO',
    desc: 'Lazo cerrado continuo de velocidad (consigna analógica VFD y lectura de encoder óptico incremental).'
  },
  'fig13_diagrama_bloques_transporte.jpg': {
    title: 'Diagrama Cinemático: Unidad de Transporte',
    loc: 'Estación 1 (ETN-902)',
    severity: 'INFO',
    desc: 'Diagrama de bloques de control de posición del carro cartesiano gobernado por servomotor Panasonic.'
  },
  'fig14_plc_s7200_comunicacion_rs485.jpg': {
    title: 'Controlador S7-200 y Cableado del Bus RS-485',
    loc: 'Red Industrial',
    severity: 'INFO',
    desc: 'Conexión del cable bifilar apantallado en los puertos de comunicación serial de las CPUs.'
  }
};

/**
 * Carga o inicializa la configuración de datasheets
 */
function loadDatasheetsConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      console.warn(`[WARN] No se pudo parsear ${CONFIG_FILE}, usando objeto vacío:`, e.message);
      return {};
    }
  }
  return {};
}

/**
 * Deduce la estación basándose en la ruta o nombre de archivo
 */
function deduceStation(relPath, fileName) {
  const norm = relPath.toLowerCase().replace(/\\/g, '/');

  if (norm.includes('1_transporte') || norm.includes('transporte')) return ['1'];
  if (norm.includes('2_alimentacion') || norm.includes('alimentacion')) return ['2'];
  if (norm.includes('4_procesamiento') || norm.includes('procesamiento')) return ['3'];
  if (norm.includes('3_ensamblaje') || norm.includes('ensamblaje')) return ['4'];
  if (norm.includes('5_seleccion') || norm.includes('seleccion')) return ['5'];

  // Match por prefijo numérico como 1_, 2_, etc.
  const prefixMatch = norm.match(/\/([1-5])_[^/]+/);
  if (prefixMatch) return [prefixMatch[1]];

  return ['1', '2', '3', '4', '5'];
}

/**
 * Convierte un nombre de archivo en un título legible
 */
function formatHumanTitle(fileName) {
  const base = path.basename(fileName, path.extname(fileName));
  return base
    .replace(/[_\-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

/**
 * Recorre recursivamente un directorio y recopila todos los archivos
 */
function scanDirectory(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '.git' && entry.name !== 'node_modules') {
        scanDirectory(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * Construye el catálogo de documentos escaneando el repositorio
 */
function buildCatalog() {
  console.log('[INFO] Iniciando escaneo automático del repositorio...');
  const datasheetsConfig = loadDatasheetsConfig();

  const scanDirs = [
    { dir: 'Documentacion/Planos/Diagrama_P&ID', defaultCat: 'pid' },
    { dir: 'Documentacion/Planos/Diagrama_Electrico', defaultCat: 'electrico' },
    { dir: 'Documentacion/Planos/mockups', defaultCat: 'mockup' },
    { dir: 'Documentacion/ingenieria-inversa', defaultCat: 'informe' },
    { dir: 'database/scripts', defaultCat: 'sql' }
  ];

  const catalog = [];
  const processedFiles = new Set();

  for (const { dir, defaultCat } of scanDirs) {
    const targetDir = path.join(REPO_ROOT, dir);
    const files = scanDirectory(targetDir);

    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const relPath = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');

      // Ignorar READMEs que no correspondan a especificaciones principales
      if (fileName.toLowerCase() === 'readme.md') {
        const knownReadme = Object.keys(KNOWN_DOCS).find(k => relPath.endsWith(k));
        if (!knownReadme) continue;
      }

      // Evitar duplicados
      if (processedFiles.has(relPath)) continue;
      processedFiles.add(relPath);

      // Determinar si es CAD / Archivo Binario descargable
      const isCAD = ['.dwg', '.dxf', '.step', '.stp', '.zip', '.rar', '.7z'].includes(ext);
      const isDownloadOnly = isCAD;

      // Determinar categoría específica
      let categoria = defaultCat;
      if (relPath.includes('datasheets')) {
        categoria = 'datasheet';
      }

      // ID determinista para el documento
      const cleanId = relPath
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

      // 1. Verificar si existe configuración en KNOWN_DOCS
      const knownKey = Object.keys(KNOWN_DOCS).find(k => relPath.endsWith(k) || fileName === k);
      if (knownKey) {
        const meta = KNOWN_DOCS[knownKey];
        catalog.push({
          id: meta.id || cleanId,
          orden_prioridad: meta.orden_prioridad || 20,
          titulo: meta.titulo || formatHumanTitle(fileName),
          archivo: fileName,
          ruta: relPath,
          categoria: meta.categoria || categoria,
          estaciones: meta.estaciones || deduceStation(relPath, fileName),
          badgeClass: meta.badgeClass || `badge-${categoria}`,
          badgeText: meta.badgeText || (isCAD ? 'Plano CAD (DWG)' : 'Documento'),
          isDownloadOnly: meta.isDownloadOnly !== undefined ? meta.isDownloadOnly : isDownloadOnly,
          descripcion: meta.descripcion || `Documento técnico disponible en ${relPath}.`
        });
        continue;
      }

      // 2. Verificar si es un Datasheet
      if (categoria === 'datasheet') {
        const dsConfig = datasheetsConfig[fileName];
        if (dsConfig) {
          // Datasheet configurado por el usuario
          catalog.push({
            id: `ds-${cleanId}`,
            orden_prioridad: dsConfig.priority || 45,
            titulo: dsConfig.title || formatHumanTitle(fileName),
            archivo: fileName,
            ruta: relPath,
            categoria: 'datasheet',
            estaciones: dsConfig.stations && dsConfig.stations.length > 0 ? dsConfig.stations : ['all'],
            badgeClass: 'badge-datasheet',
            badgeText: dsConfig.badgeText || 'Ficha Técnica',
            isDownloadOnly: false,
            descripcion: dsConfig.description || `Ficha técnica oficial del fabricante para componentes de la maqueta XK-335B.`
          });
        } else {
          // REGLA FALLBACK: Datasheet nuevo no configurado
          catalog.push({
            id: `ds-auto-${cleanId}`,
            orden_prioridad: 65,
            titulo: formatHumanTitle(fileName),
            archivo: fileName,
            ruta: relPath,
            categoria: 'datasheet',
            estaciones: ['all'],
            badgeClass: 'badge-datasheet',
            badgeText: 'General / Sin asignar',
            isDownloadOnly: false,
            descripcion: `Ficha técnica detectada automáticamente en datasheets/. Para asignar estaciones específicas, edite docs/datasheets_config.json.`
          });
        }
        continue;
      }

      // 3. Documento estándar detectado automáticamente
      let badgeText = 'Documento';
      let priority = 25;
      if (categoria === 'pid') {
        badgeText = isCAD ? 'Plano CAD (DWG)' : 'Plano P&ID (ISA)';
        priority = isCAD ? 8 : 10;
      } else if (categoria === 'electrico') {
        badgeText = isCAD ? 'Plano CAD (DWG)' : 'Plano Eléctrico (IEC)';
        priority = 10;
      } else if (categoria === 'mockup') {
        badgeText = 'Mockup ISA-101';
        priority = 15;
      } else if (categoria === 'sql') {
        badgeText = 'Script SQL';
        priority = 75;
      } else if (categoria === 'informe') {
        badgeText = 'Informe Técnico';
        priority = 5;
      }

      catalog.push({
        id: cleanId,
        orden_prioridad: priority,
        titulo: formatHumanTitle(fileName),
        archivo: fileName,
        ruta: relPath,
        categoria: categoria,
        estaciones: deduceStation(relPath, fileName),
        badgeClass: `badge-${categoria}`,
        badgeText: badgeText,
        isDownloadOnly: isDownloadOnly,
        descripcion: `Archivo técnico detectado automáticamente en ${relPath}.`
      });
    }
  }

  // Ordenar catálogo por orden_prioridad ascendente
  catalog.sort((a, b) => (a.orden_prioridad || 99) - (b.orden_prioridad || 99));

  console.log(`[INFO] Se indexaron exitosamente ${catalog.length} documentos técnicos.`);

  // Escribir docs/catalogo_documentos.json
  const jsonPath = path.join(DOCS_DIR, 'catalogo_documentos.json');
  fs.writeFileSync(jsonPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`[OK] Guardado: ${path.relative(REPO_ROOT, jsonPath)}`);

  // Escribir docs/catalogo_documentos.js
  const jsContent = `/**
 * =============================================================================
 * CATÁLOGO GENERAL DE DOCUMENTOS TÉCNICOS - PLANTA XK-335B (GENERADO AUTOMÁTICAMENTE)
 * Generado el: ${new Date().toISOString()}
 * =============================================================================
 */

const CATALOGO_DOCUMENTOS = ${JSON.stringify(catalog, null, 2)};

if (typeof window !== "undefined") {
  window.CATALOGO_DOCUMENTOS = CATALOGO_DOCUMENTOS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CATALOGO_DOCUMENTOS;
}
`;
  const jsPath = path.join(DOCS_DIR, 'catalogo_documentos.js');
  fs.writeFileSync(jsPath, jsContent, 'utf8');
  console.log(`[OK] Guardado: ${path.relative(REPO_ROOT, jsPath)}`);

  // Escaneo de Evidencias Kaizen
  buildEvidencias();
}

/**
 * Escanea la carpeta de evidencias y genera evidencias_data.json y .js
 */
function buildEvidencias() {
  const assetsDir = path.join(REPO_ROOT, 'Documentacion/evidencias/assets');
  if (!fs.existsSync(assetsDir)) return;

  const files = fs.readdirSync(assetsDir);
  const evidencias = [];

  let counter = 1;
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext)) continue;

    const relPath = `Documentacion/evidencias/assets/${file}`;
    const id = `ev-${counter.toString().padStart(2, '0')}`;
    counter++;

    const known = KNOWN_EVIDENCIAS[file];
    if (known) {
      evidencias.push({
        id: id,
        title: known.title,
        loc: known.loc,
        file: file,
        path: relPath,
        severity: known.severity,
        sevClass: `sev-${known.severity.toLowerCase()}`,
        desc: known.desc
      });
    } else {
      // Auto-detección de nueva evidencia
      evidencias.push({
        id: id,
        title: formatHumanTitle(file),
        loc: 'Inspección de Planta',
        file: file,
        path: relPath,
        severity: 'MEDIUM',
        sevClass: 'sev-medium',
        desc: `Registro visual capturado durante la auditoría física de la maqueta XK-335B (${file}).`
      });
    }
  }

  console.log(`[INFO] Se indexaron ${evidencias.length} evidencias fotográficas.`);

  const jsonEvPath = path.join(DOCS_DIR, 'evidencias_data.json');
  fs.writeFileSync(jsonEvPath, JSON.stringify(evidencias, null, 2), 'utf8');
  console.log(`[OK] Guardado: ${path.relative(REPO_ROOT, jsonEvPath)}`);

  const jsEvContent = `/**
 * =============================================================================
 * BANCO DE EVIDENCIAS KAIZEN - PLANTA XK-335B (GENERADO AUTOMÁTICAMENTE)
 * Generado el: ${new Date().toISOString()}
 * =============================================================================
 */

const EVIDENCIAS_DATA = ${JSON.stringify(evidencias, null, 2)};

if (typeof window !== "undefined") {
  window.EVIDENCIAS_DATA = EVIDENCIAS_DATA;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = EVIDENCIAS_DATA;
}
`;
  const jsEvPath = path.join(DOCS_DIR, 'evidencias_data.js');
  fs.writeFileSync(jsEvPath, jsEvContent, 'utf8');
  console.log(`[OK] Guardado: ${path.relative(REPO_ROOT, jsEvPath)}`);
}

// Ejecutar compilación del catálogo
buildCatalog();
