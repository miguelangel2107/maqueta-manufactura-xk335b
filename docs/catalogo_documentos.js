/**
 * =============================================================================
 * CATÁLOGO GENERAL DE DOCUMENTOS TÉCNICOS - PLANTA XK-335B (GENERADO AUTOMÁTICAMENTE)
 * Generado el: 2026-09-29T21:45:02.133Z
 * =============================================================================
 */

const CATALOGO_DOCUMENTOS = [
  {
    "id": "inf-lab1",
    "orden_prioridad": 1,
    "titulo": "Informe Oficial de Auditoría de Campo y Ruptura de Lazo (Lab 1)",
    "archivo": "Informe_Laboratorio_1.pdf",
    "ruta": "Documentacion/ingenieria-inversa/Informe_Laboratorio_1.pdf",
    "categoria": "informe",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-informe",
    "badgeText": "Informe Oficial",
    "isDownloadOnly": false,
    "descripcion": "Memoria técnica completa de 40 páginas: inspección estática cable por cable, inventario real de activos, mapeo I/O de las 5 CPUs Siemens y demostración analítica de pérdida de observabilidad."
  },
  {
    "id": "plano-pid-est1-dwg",
    "orden_prioridad": 7,
    "titulo": "Plano P&ID CAD: Unidad de Transporte (AutoCAD DWG)",
    "archivo": "transporte_pid.dwg",
    "ruta": "Documentacion/Planos/Diagrama_P&ID/1_Transporte/transporte_pid.dwg",
    "categoria": "pid",
    "estaciones": [
      "1"
    ],
    "badgeClass": "badge-pid",
    "badgeText": "Plano CAD (DWG)",
    "isDownloadOnly": true,
    "descripcion": "Plano original de instrumentación y lazos de control de la Unidad de Transporte en formato nativo AutoCAD (.dwg)."
  },
  {
    "id": "plano-pid-est1-pdf",
    "orden_prioridad": 8,
    "titulo": "Plano P&ID: Unidad de Transporte (ANSI/ISA-S5.1)",
    "archivo": "transporte_pid.pdf",
    "ruta": "Documentacion/Planos/Diagrama_P&ID/1_Transporte/transporte_pid.pdf",
    "categoria": "pid",
    "estaciones": [
      "1"
    ],
    "badgeClass": "badge-pid",
    "badgeText": "Plano P&ID (ISA)",
    "isDownloadOnly": false,
    "descripcion": "Diagrama funcional de instrumentación para el lazo horizontal y manipulador cartesiano de la Estación 1 exportado a PDF."
  },
  {
    "id": "plano-elec-est2-pdf",
    "orden_prioridad": 9,
    "titulo": "Plano Eléctrico: Unidad de Alimentación (IEC 60617)",
    "archivo": "Unidad_de_Alimentacion.pdf",
    "ruta": "Documentacion/Planos/Diagrama_Electrico/2_Alimentacion/Unidad_de_Alimentacion.pdf",
    "categoria": "electrico",
    "estaciones": [
      "2"
    ],
    "badgeClass": "badge-electrico",
    "badgeText": "Plano CAD (IEC)",
    "isDownloadOnly": false,
    "descripcion": "Esquema unifilar y multifilar oficial para la Estación 2: electroválvula eyectora 24 VDC, sensor fotoeléctrico Omron y regleta de bornes."
  },
  {
    "id": "plano-elec-est4-pdf",
    "orden_prioridad": 10,
    "titulo": "Plano Eléctrico: Unidad de Ensamblaje (IEC 60617)",
    "archivo": "Unidad_de_Ensamblaje.pdf",
    "ruta": "Documentacion/Planos/Diagrama_Electrico/3_Ensamblaje/Unidad_de_Ensamblaje.pdf",
    "categoria": "electrico",
    "estaciones": [
      "4"
    ],
    "badgeClass": "badge-electrico",
    "badgeText": "Plano CAD (IEC)",
    "isDownloadOnly": false,
    "descripcion": "Esquema eléctrico de potencia y mando para la Estación 4: actuador rotativo oscilante 0–180°, pinza angular y bornes."
  },
  {
    "id": "plano-elec-est3-pdf",
    "orden_prioridad": 10,
    "titulo": "Plano Eléctrico: Unidad de Procesamiento (IEC 60617)",
    "archivo": "Unidad_de_Procesamiento.pdf",
    "ruta": "Documentacion/Planos/Diagrama_Electrico/4_Procesamiento/Unidad_de_Procesamiento.pdf",
    "categoria": "electrico",
    "estaciones": [
      "3"
    ],
    "badgeClass": "badge-electrico",
    "badgeText": "Plano CAD (IEC)",
    "isDownloadOnly": false,
    "descripcion": "Esquema de mando para prensa neumática vertical, cilindro guiado MGPM y enclavamientos de seguridad."
  },
  {
    "id": "plano-elec-est5-pdf",
    "orden_prioridad": 10,
    "titulo": "Plano Eléctrico: Unidad de Selección (IEC 60617)",
    "archivo": "Unidad_de_Seleccion.pdf",
    "ruta": "Documentacion/Planos/Diagrama_Electrico/5_Seleccion/Unidad_de_Seleccion.pdf",
    "categoria": "electrico",
    "estaciones": [
      "5"
    ],
    "badgeClass": "badge-electrico",
    "badgeText": "Plano CAD (IEC)",
    "isDownloadOnly": false,
    "descripcion": "Circuito trifásico de potencia: variador de frecuencia POWTRAN PT9100A, motor asíncrono y retroalimentación de encoder HSC0."
  },
  {
    "id": "norma-electrica-master",
    "orden_prioridad": 11,
    "titulo": "Normativa de Esquemas Eléctricos de Potencia y Mando (IEC)",
    "archivo": "README.md",
    "ruta": "Documentacion/Planos/Diagrama_Electrico/README.md",
    "categoria": "electrico",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-electrico",
    "badgeText": "Normativa IEC",
    "isDownloadOnly": false,
    "descripcion": "Manual de estandarización eléctrica: distribución de 220 VAC y 24 VDC, código normalizado de colores de conductores y diseño de tableros según IEC 60617 / 81346."
  },
  {
    "id": "norma-pid-master",
    "orden_prioridad": 12,
    "titulo": "Guía de Diagramas de Instrumentación P&ID (ANSI/ISA-S5.1-2009)",
    "archivo": "README.md",
    "ruta": "Documentacion/Planos/Diagrama_P&ID/README.md",
    "categoria": "pid",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-pid",
    "badgeText": "Normativa ISA",
    "isDownloadOnly": false,
    "descripcion": "Estandarización de tags de instrumentos (PV, MV, DV), reglas de numeración de lazos, tipos de burbujas en campo/panel/PLC y codificación de líneas."
  },
  {
    "id": "mockup-ui-spec",
    "orden_prioridad": 15,
    "titulo": "Especificaciones de Mockups UI/UX para HMI y Dashboard ERP",
    "archivo": "README.md",
    "ruta": "Documentacion/Planos/mockups/README.md",
    "categoria": "mockup",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-mockup",
    "badgeText": "Norma ISA-101",
    "isDownloadOnly": false,
    "descripcion": "Wireframes interactivos y diseño de alto desempeño (ISA-101) para pantalla táctil de celda y Dashboard SCADA/ERP web de monitoreo centralizado."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-s7200-system-manual-es-es-pdf",
    "orden_prioridad": 30,
    "titulo": "Manual del Sistema SIMATIC S7-200 (Siemens AG)",
    "archivo": "s7200_system_manual_es-ES.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/s7200_system_manual_es-ES.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Manual de Sistema",
    "isDownloadOnly": false,
    "descripcion": "Manual de 486 páginas: mapeo de memoria I/Q/V, especificaciones eléctricas de entradas/salidas digitales a transistor y relé, y configuración de contadores de alta velocidad (HSC)."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-technical-reference-ac-servo-motor-driver-minas-a4-series-pdf",
    "orden_prioridad": 31,
    "titulo": "Referencia Técnica: Servomotor y Servodriver MINAS A4",
    "archivo": "Technical reference_AC Servo Motor & Driver_MINAS A4-series.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/Technical reference_AC Servo Motor & Driver_MINAS A4-series.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Servodriver AC",
    "isDownloadOnly": false,
    "descripcion": "Conexionado del conector CN X4 para tren de pulsos rápido (PTO) generado por la CPU 226 CN de la Estación 1 (Transporte) y ajuste de ganancias proporcionales de posición."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-minas-a4-e-pdf",
    "orden_prioridad": 32,
    "titulo": "Manual de Operación Rápida y Parámetros: MINAS A4",
    "archivo": "minas_a4_e.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/minas_a4_e.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Manual Operativo",
    "isDownloadOnly": false,
    "descripcion": "Guía de parámetros de usuario, códigos de alarma del display y calibración del freno electromecánico del carro de transporte."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-map-serv-e-pdf",
    "orden_prioridad": 33,
    "titulo": "Guía de Aplicación de Control de Movimiento Panasonic",
    "archivo": "map_serv_e.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/map_serv_e.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Movimiento / Servo",
    "isDownloadOnly": false,
    "descripcion": "Cálculo de momentos de inercia y curvas características par-velocidad para el manipulador cartesiano de 3 GDL."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-pi9000-english-manual-v17-0-pdf",
    "orden_prioridad": 35,
    "titulo": "Manual de Usuario: Inversor de Frecuencia POWTRAN PT9100 / PI9000",
    "archivo": "PI9000_English_Manual_V17.0.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/PI9000_English_Manual_V17.0.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "5"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Variador VFD",
    "isDownloadOnly": false,
    "descripcion": "Inversor para el motor trifásico de la cinta transportadora. Mapeo de la entrada analógica AI1 (0–10 VDC desde CPU 224XP CN) y terminales de marcha FWD/REV."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-sensor-e3z-ls-pdf",
    "orden_prioridad": 40,
    "titulo": "Sensor Fotoeléctrico con Supresión de Fondo Omron E3Z-LS",
    "archivo": "sensor_e3z-ls.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/sensor_e3z-ls.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "2",
      "3",
      "5"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Sensor Óptico",
    "isDownloadOnly": false,
    "descripcion": "Sensor con ajuste micrométrico de distancia (20 a 200 mm), salida NPN y tensión de alimentación 12–24 VDC. Instalado en tolva de alimentación y zona de clasificación."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-sersor-magnetico-z80-pdf",
    "orden_prioridad": 42,
    "titulo": "Sensores Magnéticos de Posición SMC Reed Switch (D-Z80 / D-C73)",
    "archivo": "SERSOR_MAGNETICO_-Z80.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/SERSOR_MAGNETICO_-Z80.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Reed Switch",
    "isDownloadOnly": false,
    "descripcion": "Sensores de proximidad magnéticos para detección de final de carrera de cilindros neumáticos. Conexión a dos hilos a 24 VDC con indicador LED integrado."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-cq2-z-pdf",
    "orden_prioridad": 45,
    "titulo": "Cilindro Neumático Compacto de Doble Efecto SMC Serie CQ2",
    "archivo": "CQ2_Z.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/CQ2_Z.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "2"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Cilindro Compacto",
    "isDownloadOnly": false,
    "descripcion": "Actuador de eyección de piezas en la Estación de Alimentación. Diseño optimizado de carrera corta y alta frecuencia de conmutación."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-mgpm-z-cilindro-guiado-estandar-cojinete-deslizante-pdf",
    "orden_prioridad": 46,
    "titulo": "Cilindro Guiado con Cojinetes Deslizantes SMC Serie MGPM",
    "archivo": "MGPM-Z,_cilindro_guiado_estandar,_cojinete_deslizante.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/MGPM-Z,_cilindro_guiado_estandar,_cojinete_deslizante.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "3"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Cilindro Guiado",
    "isDownloadOnly": false,
    "descripcion": "Cilindro de la prensa de estampado y mordaza de sujeción en la Estación de Procesamiento. Soporta elevados momentos torsores y cargas excéntricas."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-mhc-pdf",
    "orden_prioridad": 47,
    "titulo": "Pinza Neumática Angular SMC Serie MHC2",
    "archivo": "MHC.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/MHC.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1",
      "4"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Pinza Angular",
    "isDownloadOnly": false,
    "descripcion": "Mecanismo de sujeción mecánica angular para montaje de tapas/pasadores (Ensamblaje) y agarre de piezas cilíndricas en el carro de transporte."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-using-modbus-library-step7-mw-4-0-pdf",
    "orden_prioridad": 50,
    "titulo": "Librería y Rutinas Modbus RTU para STEP 7-Micro/WIN",
    "archivo": "Using_Modbus_Library_Step7_MW_4.0.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/Using_Modbus_Library_Step7_MW_4.0.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Red Modbus RTU",
    "isDownloadOnly": false,
    "descripcion": "Manual de integración de rutinas MBUS_CTRL y MBUS_MSG para comunicación industrial multipunto sobre el bus RS-485 bifilar apantallado."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-yl-335-b-instruction-book-mitsubishi-fx-3-u-8a2db1348a-pdf",
    "orden_prioridad": 52,
    "titulo": "Manual Estructural y Mecánico de la Maqueta YL-335B / XK-335B",
    "archivo": "YL_335_B_instruction_book_Mitsubishi_FX_3_U_8a2db1348a.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/YL_335_B_instruction_book_Mitsubishi_FX_3_U_8a2db1348a.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Manual Maqueta",
    "isDownloadOnly": false,
    "descripcion": "Planos mecánicos, despiece, tolerancias de montaje de la cinta transportadora y presión neumática de servicio (0.4 – 0.6 MPa)."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-rtb-e-pdf",
    "orden_prioridad": 55,
    "titulo": "Especificaciones de Borneras y Conectores Industriales RTB",
    "archivo": "RTB-E.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/RTB-E.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Borneras RTB",
    "isDownloadOnly": false,
    "descripcion": "Capacidad de corriente admisible, tensión de aislamiento y dimensiones mecánicas para el recableado seguro de tableros de control."
  },
  {
    "id": "ds-documentacion-ingenieria-inversa-datasheets-medien-62289-pdf",
    "orden_prioridad": 58,
    "titulo": "Documentación Complementaria de Electroválvulas Neumáticas",
    "archivo": "medien_62289.pdf",
    "ruta": "Documentacion/ingenieria-inversa/datasheets/medien_62289.pdf",
    "categoria": "datasheet",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-datasheet",
    "badgeText": "Válvulas 5/2",
    "isDownloadOnly": false,
    "descripcion": "Datos de caudal neumático, tiempos de conmutación de solenoide y bobinas de 24 VDC para automatización de actuadores."
  },
  {
    "id": "sql-ddl-3fn",
    "orden_prioridad": 70,
    "titulo": "Script DDL: Esquema Relacional de Telemetría en 3FN",
    "archivo": "01_schema_telemetria_3fn.sql",
    "ruta": "database/scripts/01_schema_telemetria_3fn.sql",
    "categoria": "sql",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-sql",
    "badgeText": "PostgreSQL DDL",
    "isDownloadOnly": false,
    "descripcion": "Definición DDL normalizada en Tercera Forma Normal (estaciones, instrumentos, variables PV/MV/DV, telemetría histórica, alarmas y logs de operadores)."
  },
  {
    "id": "sql-seed-activos",
    "orden_prioridad": 71,
    "titulo": "Script DML: Población de Datos Auditados y Tags ISA-S5.1",
    "archivo": "02_seed_data_xk335b.sql",
    "ruta": "database/scripts/02_seed_data_xk335b.sql",
    "categoria": "sql",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-sql",
    "badgeText": "Datos Semilla SQL",
    "isDownloadOnly": false,
    "descripcion": "Población de datos de las 5 estaciones, 20 instrumentos auditados en campo, variables clasificadas para control y usuarios operadores de la escuadra."
  },
  {
    "id": "sql-indices-triggers",
    "orden_prioridad": 72,
    "titulo": "Script SQL: Índices de Optimización B-Tree y Disparadores",
    "archivo": "03_indices_optimizacion.sql",
    "ruta": "database/scripts/03_indices_optimizacion.sql",
    "categoria": "sql",
    "estaciones": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "badgeClass": "badge-sql",
    "badgeText": "Triggers & Índices",
    "isDownloadOnly": false,
    "descripcion": "Índices B-Tree compuestos para acelerar consultas temporales de telemetría y función trigger para registrar eventos de alarma automáticamente."
  }
];

if (typeof window !== "undefined") {
  window.CATALOGO_DOCUMENTOS = CATALOGO_DOCUMENTOS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CATALOGO_DOCUMENTOS;
}
