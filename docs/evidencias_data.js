/**
 * =============================================================================
 * BANCO DE EVIDENCIAS KAIZEN Y DIAGRAMAS - PLANTA XK-335B (GENERADO AUTOMÁTICAMENTE)
 * Generado el: 2026-09-29T23:11:12.470Z
 * =============================================================================
 */

const EVIDENCIAS_DATA = [
  {
    "id": "ev-01",
    "title": "Vista General de la Maqueta XK-335B",
    "loc": "Planta Completa (5 Estaciones)",
    "file": "fig01_portada_maqueta_xk335b.png",
    "path": "Documentacion/evidencias/assets/fig01_portada_maqueta_xk335b.png",
    "severity": "INFO",
    "sevClass": "sev-info",
    "subcategoria": "diagramas",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Disposición espacial y secuencial de la línea de manufactura flexible en el laboratorio de control."
  },
  {
    "id": "ev-02",
    "title": "Motor Trifásico y Sensor Capacitivo Winston CM18",
    "loc": "Estación 5: Unidad de Selección",
    "file": "fig02_sensores_capacitivos_motor_trifasico.png",
    "path": "Documentacion/evidencias/assets/fig02_sensores_capacitivos_motor_trifasico.png",
    "severity": "MEDIUM",
    "sevClass": "sev-medium",
    "subcategoria": "kaizen",
    "resuelto": true,
    "solucion_nota": "Actualizado esquema unifilar y reprogramado parámetro de torque en variador POWTRAN PT9100A.",
    "desc": "Rectificación física: El accionamiento es un motor asíncrono trifásico alimentado por VFD y cuenta con sensor capacitivo para discriminar plásticos, desmintiendo reportes legados."
  },
  {
    "id": "ev-03",
    "title": "Cables con Cobre Expuesto y Señalización Desprendida",
    "loc": "Borneras de Conexión de Sensores",
    "file": "fig03_borneras_conexiones_cables_expuestos.png",
    "path": "Documentacion/evidencias/assets/fig03_borneras_conexiones_cables_expuestos.png",
    "severity": "HIGH",
    "sevClass": "sev-high",
    "subcategoria": "kaizen",
    "resuelto": true,
    "solucion_nota": "Reengastado con terminales puntera tipo ferrul y colocado termocontraíble con tag normalizado.",
    "desc": "Deficiente ensamblaje en borneras con hilos de cobre vivos fuera del conector y pérdida de identificación de hilos."
  },
  {
    "id": "ev-04",
    "title": "Carcasa Plástica Fracturada en Módulo PLC",
    "loc": "Controladores Siemens S7-200",
    "file": "fig04_carcasa_fracturada_plc_s7200.png",
    "path": "Documentacion/evidencias/assets/fig04_carcasa_fracturada_plc_s7200.png",
    "severity": "MEDIUM",
    "sevClass": "sev-medium",
    "subcategoria": "kaizen",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Fractura mecánica en el plástico de sujeción de bornes por torque excesivo durante mantenimientos anteriores."
  },
  {
    "id": "ev-05",
    "title": "Sensores Fijados con Silicona Caliente y Cinta Adhesiva",
    "loc": "Estación 3: Unidad de Procesamiento",
    "file": "fig05_sensores_fijados_silicona_cinta.png",
    "path": "Documentacion/evidencias/assets/fig05_sensores_fijados_silicona_cinta.png",
    "severity": "CRITICAL",
    "sevClass": "sev-critical",
    "subcategoria": "kaizen",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Peligro Kaizen crítico: Los sensores magnéticos SMC carecen de abrazaderas rígidas. Su desprendimiento causa pérdida total de observabilidad (C = [0 0]) y colisión mecánica."
  },
  {
    "id": "ev-06",
    "title": "Desalineación Mecánica en Pistón y Pinza",
    "loc": "Estación 3: Unidad de Procesamiento",
    "file": "fig06_desalineacion_piston_pinza.png",
    "path": "Documentacion/evidencias/assets/fig06_desalineacion_piston_pinza.png",
    "severity": "HIGH",
    "sevClass": "sev-high",
    "subcategoria": "kaizen",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Desfase angular entre el cilindro vertical de prensa y la mordaza lateral, originando atascamiento de piezas y desgaste asimétrico."
  },
  {
    "id": "ev-07",
    "title": "Cableado No Documentado para Inversión de Giro en VFD",
    "loc": "Estación 5: Unidad de Selección",
    "file": "fig07_conexion_no_documentada_vfd_giro.png",
    "path": "Documentacion/evidencias/assets/fig07_conexion_no_documentada_vfd_giro.png",
    "severity": "HIGH",
    "sevClass": "sev-high",
    "subcategoria": "kaizen",
    "resuelto": true,
    "solucion_nota": "Incorporado lazo de inversión de giro al plano P&ID y esquema multifilar IEC de Estación 5.",
    "desc": "Conductor físico no registrado en los esquemas originales conectando una salida digital del PLC al terminal REV del VFD POWTRAN."
  },
  {
    "id": "ev-08",
    "title": "Cable Pelado con Cobre Rozando Perfil de Aluminio",
    "loc": "Estación 4: Unidad de Ensamblaje",
    "file": "fig08_cable_sensor_aislamiento_danado.png",
    "path": "Documentacion/evidencias/assets/fig08_cable_sensor_aislamiento_danado.png",
    "severity": "CRITICAL",
    "sevClass": "sev-critical",
    "subcategoria": "kaizen",
    "resuelto": true,
    "solucion_nota": "Aislamiento renovado con manga espiral protectora y sujeción dentro de canaleta ranurada.",
    "desc": "Riesgo inminente de cortocircuito a masa de 24 VDC por pérdida del aislamiento externo en contacto directo con la bancada metálica."
  },
  {
    "id": "ev-09",
    "title": "Diagrama de Causalidad: Unidad de Alimentación",
    "loc": "Estación 2 (ETN-902)",
    "file": "fig09_diagrama_bloques_alimentacion.jpg",
    "path": "Documentacion/evidencias/assets/fig09_diagrama_bloques_alimentacion.jpg",
    "severity": "INFO",
    "sevClass": "sev-info",
    "subcategoria": "diagramas",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Diagrama de bloques funcionales y relación entrada/salida para la eyección de piezas en la tolva de alimentación."
  },
  {
    "id": "ev-10",
    "title": "Diagrama de Causalidad: Unidad de Procesamiento",
    "loc": "Estación 3 (ETN-902)",
    "file": "fig10_diagrama_bloques_procesamiento.jpg",
    "path": "Documentacion/evidencias/assets/fig10_diagrama_bloques_procesamiento.jpg",
    "severity": "INFO",
    "sevClass": "sev-info",
    "subcategoria": "diagramas",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Modelado fenomenológico y lazos de enclavamiento de la prensa de punzonado y mordaza."
  },
  {
    "id": "ev-11",
    "title": "Diagrama de Causalidad: Unidad de Ensamblaje",
    "loc": "Estación 4 (ETN-902)",
    "file": "fig11_diagrama_bloques_ensamblaje.jpg",
    "path": "Documentacion/evidencias/assets/fig11_diagrama_bloques_ensamblaje.jpg",
    "severity": "INFO",
    "sevClass": "sev-info",
    "subcategoria": "diagramas",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Secuencia temporal del actuador rotativo 0-180° y pinza angular neumática."
  },
  {
    "id": "ev-12",
    "title": "Diagrama de Causalidad: Unidad de Selección",
    "loc": "Estación 5 (ETN-902)",
    "file": "fig12_diagrama_bloques_seleccion.jpg",
    "path": "Documentacion/evidencias/assets/fig12_diagrama_bloques_seleccion.jpg",
    "severity": "INFO",
    "sevClass": "sev-info",
    "subcategoria": "diagramas",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Lazo cerrado continuo de velocidad (consigna analógica VFD y lectura de encoder óptico incremental)."
  },
  {
    "id": "ev-13",
    "title": "Diagrama Cinemático: Unidad de Transporte",
    "loc": "Estación 1 (ETN-902)",
    "file": "fig13_diagrama_bloques_transporte.jpg",
    "path": "Documentacion/evidencias/assets/fig13_diagrama_bloques_transporte.jpg",
    "severity": "INFO",
    "sevClass": "sev-info",
    "subcategoria": "diagramas",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Cadena cinemática del servomotor AC y husillo de bolas para el carro de transferencia."
  },
  {
    "id": "ev-14",
    "title": "Controlador S7-200 y Cableado del Bus RS-485",
    "loc": "Red Industrial",
    "file": "fig14_plc_s7200_comunicacion_rs485.jpg",
    "path": "Documentacion/evidencias/assets/fig14_plc_s7200_comunicacion_rs485.jpg",
    "severity": "INFO",
    "sevClass": "sev-info",
    "subcategoria": "diagramas",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Conexión del cable bifilar apantallado en los puertos de comunicación serial de las CPUs."
  },
  {
    "id": "ev-15",
    "title": "Respuesta al Escalón en Cinta de Selección (FOPDT)",
    "loc": "Estación 5 (ETN-902)",
    "file": "curva_escalon_estacion5_vfd.png",
    "path": "Documentacion/transferencia/curva_escalon_estacion5_vfd.png",
    "severity": "INFO",
    "sevClass": "sev-info",
    "subcategoria": "transferencia",
    "resuelto": false,
    "solucion_nota": "",
    "desc": "Registro experimental de velocidad en RPM ante escalón 0-5V en salida analógica AQW0. Modelo identificado: K=290 RPM/V, theta=0.36 s, tau=0.92 s."
  }
];

if (typeof window !== "undefined") {
  window.EVIDENCIAS_DATA = EVIDENCIAS_DATA;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = EVIDENCIAS_DATA;
}
