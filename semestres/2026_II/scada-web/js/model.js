/* =============================================================================
   SCADA XL-335B - Modelo de datos
   La imagen Modbus del PLC 1 empieza en VB1000 (registro 40001 = VW1000) y tiene 128
   registros (VB1000..VB1255). El S7-200 es big-endian: el registro 40001+k contiene
   VB(1000+2k) en el byte alto y VB(1001+2k) en el bajo. Aqui se trabaja con las
   direcciones V reales para que coincidan con los programas AWL y la documentacion.
   ============================================================================= */
'use strict';

(function (XL) {
  const bit = XL.bit;
  const REG_COUNT = 128;

  class MemImage {
    constructor() { this.bytes = new Uint8Array(REG_COUNT * 2); this.stamp = 0; }
    setRegs(offset, regs) {
      for (let i = 0; i < regs.length; i++) {
        const k = 2 * (offset + i);
        this.bytes[k] = (regs[i] >> 8) & 0xFF;
        this.bytes[k + 1] = regs[i] & 0xFF;
      }
      this.stamp = Date.now();
    }
    reg(k) { return (this.bytes[2 * k] << 8) | this.bytes[2 * k + 1]; }
    vb(a) { return this.bytes[a - 1000] || 0; }
    vw(a) { return (this.vb(a) << 8) | this.vb(a + 1); }
    vwi(a) { const v = this.vw(a); return v >= 0x8000 ? v - 0x10000 : v; }
    vd(a) { return (this.vb(a) << 24) | (this.vb(a + 1) << 16) | (this.vb(a + 2) << 8) | this.vb(a + 3); }
    setVb(a, v) { this.bytes[a - 1000] = v & 0xFF; }
    setVw(a, v) { this.setVb(a, v >> 8); this.setVb(a + 1, v); }
    setVd(a, v) { this.setVw(a, (v >>> 16) & 0xFFFF); this.setVw(a + 2, v & 0xFFFF); }
    clone() { const c = new MemImage(); c.bytes.set(this.bytes); c.stamp = this.stamp; return c; }
  }

  // ------------------------------------------------------------------ estaciones
  const STATIONS = [
    { id: 'T', name: 'Transporte', short: 'Transporte', plc: 1, page: 'transporte', icon: 'rail' },
    { id: 'A', name: 'Alimentación', short: 'Alimentación', plc: 2, page: 'alimentacion', icon: 'feed' },
    { id: 'P', name: 'Procesamiento', short: 'Procesamiento', plc: 4, page: 'procesamiento', icon: 'press' },
    { id: 'E', name: 'Ensamblaje', short: 'Ensamblaje', plc: 3, page: 'ensamblaje', icon: 'puzzle' },
    { id: 'S', name: 'Selección y variador', short: 'Selección', plc: 5, page: 'seleccion', icon: 'belt' },
    { id: 'R', name: 'Brazo 4-DOF', short: 'Brazo', plc: 6, page: 'brazo', icon: 'robot' }
  ];

  // ------------------------------------------------------------------ pasos
  const STEPS = {
    T_auto: {
      0: ['Reposo', 'Pulse Marcha (SB1 o SCADA) para arrancar la celda'],
      5: ['Homing', 'Buscando la referencia sobre el inductivo I0.0'],
      10: ['Alimentación', 'Ir a Alimentación y recoger la base'],
      20: ['Ensamblaje: dejar', 'Llevar la pieza al nido de Ensamblaje'],
      22: ['Ensamblaje: recoger', 'Esperar el fin del ensamble y recoger'],
      30: ['Procesamiento: dejar', 'Volver a la prensa y dejar la pieza'],
      32: ['Procesamiento: recoger', 'Esperar el prensado y recoger'],
      50: ['Selección', 'Llevar la pieza a la cinta']
    },
    T_autoSub: { 0: 'preparando el viaje', 1: 'viajando', 2: 'esperando a la estación', 3: 'maniobra en curso' },
    T_man: {
      0: ['Reposo', 'SB1 recoge en Alimentación (si falta referencia, hace homing)'],
      1: ['Recoger en Alimentación', ''],
      2: ['Viaje a Ensamblaje', ''],
      3: ['Dejar en Ensamblaje', ''],
      4: ['Recoger en Ensamblaje', 'SB1 espera a que Ensamblaje termine'],
      5: ['Viaje a Procesamiento', ''],
      6: ['Dejar en Procesamiento', ''],
      7: ['Recoger en Procesamiento', 'SB1 espera a que Procesamiento termine'],
      8: ['Viaje a Selección', 'Con rebote en el final de carrera derecho'],
      9: ['Dejar en la cinta', ''],
      10: ['Volver a Alimentación', 'Re-referencia y viaje a la cota 0'],
      90: ['Homing', 'Buscando la referencia sobre I0.0']
    },
    T_manSub: { 0: 'listo para lanzar', 1: 'en curso', 2: 'esperando SB1' },
    T_maniobra: { 0: '—', 1: 'Recoger (pick)', 2: 'Dejar (place)', 3: 'Dejar en la cinta' },
    T_manSubEtapa: { 0: 'inicio', 10: 'girar hacia la cinta', 15: 'girar hacia la bancada', 20: 'extender brazo', 30: 'bajar', 40: 'pinza', 45: 'asentar pinza', 50: 'subir', 60: 'retraer brazo', 70: 'volver el giro', 99: 'terminada' },
    T_homing: { 0: 'inactivo', 10: 'saliendo del sensor', 11: 'saliendo del sensor', 20: 'búsqueda rápida', 21: 'búsqueda rápida', 30: 'retroceso', 31: 'retroceso', 40: 'aproximación lenta', 41: 'aproximación lenta', 90: 'falló' },
    A: {
      0: ['Reposo', 'Esperando autorización o cuna libre'],
      10: ['Sujetar columna', 'El sujetador retiene la segunda base'],
      20: ['Empujar base', 'El empujador lleva la base a la cuna'],
      30: ['Retraer empujador', ''],
      40: ['Soltar columna', 'La columna baja un nivel'],
      50: ['Pieza lista', 'Esperando que Transporte la recoja']
    },
    E: {
      0: ['Nido libre', 'Esperando que Transporte deje una pieza'],
      10: ['Evaluando pieza', 'La fibra I0.4 decide blanca/metal o negra'],
      50: ['Bajar pinza', 'Hacia el núcleo del plato'],
      60: ['Cerrar pinza', 'Toma el núcleo (0.5 s)'],
      70: ['Subir con el núcleo', ''],
      80: ['Avanzar sobre el nido', ''],
      90: ['Insertar', 'Baja e inserta a presión'],
      95: ['Abrir pinza', 'Suelta el núcleo dentro de la pieza'],
      100: ['Subir', ''],
      110: ['Retroceder', 'Vuelve sobre el plato'],
      120: ['Terminado', 'Esperando que Transporte retire la pieza']
    },
    E_prep: {
      0: ['Evaluando nidos', 'Ambos nidos con núcleo = estación lista'],
      20: ['Dosificando', 'Cae un núcleo al nido bajo el silo'],
      30: ['Cerrando base', 'La columna baja un nivel'],
      40: ['Girando plato 180°', 'Lleva el núcleo bajo la pinza']
    },
    P: {
      0: ['Reposo', 'Esperando pieza de Transporte'],
      10: ['Cerrar mordaza', ''],
      20: ['Carro a la prensa', ''],
      30: ['Golpe 1', 'La prensa baja'],
      40: ['Sostener golpe 1', ''],
      50: ['Subir prensa', ''],
      60: ['Golpe 2', 'La prensa baja otra vez'],
      70: ['Sostener golpe 2', ''],
      80: ['Subir prensa', ''],
      90: ['Carro a origen', ''],
      100: ['Abrir mordaza', ''],
      110: ['Terminado', 'Esperando que Transporte la recoja']
    },
    S_auto: {
      0: ['Reposo', 'Cinta libre, esperando pieza'],
      10: ['Hacia la inspección', 'Cinta a 30 Hz'],
      15: ['Tránsito rápido', ''],
      20: ['Aproximación lenta', 'Cinta a 18 Hz antes de la cota final'],
      25: ['Frenando', 'El desviador espera a que la pieza quede quieta'],
      30: ['Carril 1: empujar', ''],
      32: ['Carril 1: retraer', 'Pausa de 2 s'],
      40: ['Carril 2: empujar', ''],
      42: ['Carril 2: retraer', 'Pausa de 2 s'],
      50: ['Carril 3: empujar', ''],
      52: ['Carril 3: retraer', 'Pausa de 2 s'],
      60: ['Fin de cinta', 'Esperando al Brazo'],
      90: ['Calibración', 'Cinta a 18 Hz: SB1 marca cada carril'],
      91: ['Calibración', 'Frenando y guardando la posición final']
    },
    S_man: {
      0: ['Reposo', 'SB1 prueba los desviadores y la cinta'],
      10: ['Extender desviador 1', ''], 20: ['Retraer desviador 1', ''],
      30: ['Extender desviador 2', ''], 40: ['Retraer desviador 2', ''],
      50: ['Extender desviador 3', ''], 60: ['Retraer desviador 3', ''],
      70: ['Prueba de cinta', 'Marcha a 30 Hz durante 10 s']
    },
    R_homing: { 10: 'Eje X a su home', 11: 'Eje X a su home', 20: 'Eje Z a su home', 21: 'Eje Z a su home', 30: 'Eje Y a su home', 31: 'Eje Y a su home', 40: 'Abriendo garra', 50: 'Consolidando' }
  };

  const R_PHASES = [
    { from: 0, to: 0, name: 'Reposo', text: 'Esperando la orden de recogida' },
    { from: 10, to: 19, name: 'Sec. 1: subir Y', text: 'Eje Y sube 12000 pasos' },
    { from: 20, to: 29, name: 'Sec. 1: girar Z', text: 'Eje Z gira hacia la cinta' },
    { from: 30, to: 39, name: 'Sec. 1: extender X', text: 'Eje X hasta la zona de toma' },
    { from: 40, to: 99, name: 'En zona de toma', text: 'Listo para recoger en el fin de cinta' },
    { from: 100, to: 109, name: 'Cerrar garra', text: 'Sujeta la pieza' },
    { from: 110, to: 119, name: 'Elevar pieza', text: 'Y sube 5000 pasos y libera la cinta' },
    { from: 120, to: 129, name: 'Retraer X', text: 'Hacia la mesa exterior' },
    { from: 130, to: 139, name: 'Girar Z', text: 'Hacia la mesa' },
    { from: 140, to: 149, name: 'Bajar Y', text: 'Deja la pieza sobre la mesa' },
    { from: 150, to: 159, name: 'Abrir garra', text: 'Suelta la pieza' },
    { from: 160, to: 169, name: 'Subir Y', text: 'Despeje vertical' },
    { from: 170, to: 255, name: 'Volver a la toma', text: 'Retorno a la zona de recogida' }
  ];

  function stepInfo(table, step) {
    const e = table[step];
    if (e) return { name: e[0], text: e[1] };
    return { name: 'Paso ' + step, text: '' };
  }

  // ------------------------------------------------------------------ E/S
  // Cada estacion: listas de entradas y salidas (byte del modelo y numero de bit)
  const IO = {
    T: {
      in: [
        ['I0.0', 'Home inductivo', 'ib0', 0], ['I0.1', 'Final de carrera izquierdo', 'ib0', 1, 'bad'], ['I0.2', 'Final de carrera derecho', 'ib0', 2, 'bad'],
        ['I0.3', 'Vertical abajo', 'ib0', 3], ['I0.4', 'Vertical arriba', 'ib0', 4], ['I0.5', 'Giro hacia la cinta', 'ib0', 5],
        ['I0.6', 'Giro hacia la bancada', 'ib0', 6], ['I0.7', 'Brazo extendido', 'ib0', 7], ['I1.0', 'Brazo retraído', 'ib1', 0],
        ['I1.1', 'Pinza cerrada', 'ib1', 1], ['I1.2', 'Servo listo (RDY)', 'ib1', 2], ['I2.0', 'Fin de carril 1', 'ib2', 0],
        ['I2.1', 'Fin de carril 2', 'ib2', 1], ['I2.2', 'Fin de carril 3', 'ib2', 2], ['I2.4', 'SB2 paro', 'ib2', 4],
        ['I2.5', 'SB1 marcha', 'ib2', 5], ['I2.6', 'Seta QS (1 = liberada)', 'ib2', 6], ['I2.7', 'Selector en Automático', 'ib2', 7]
      ],
      out: [
        ['Q0.0', 'Pulsos del servo', 'qb0', 0], ['Q0.2', 'Dirección (1 = derecha)', 'qb0', 2], ['Q0.3', 'Vertical arriba', 'qb0', 3],
        ['Q0.4', 'Girar hacia la cinta', 'qb0', 4], ['Q0.5', 'Girar hacia la bancada', 'qb0', 5], ['Q0.6', 'Extender brazo', 'qb0', 6],
        ['Q0.7', 'Abrir pinza', 'qb0', 7], ['Q1.0', 'Cerrar pinza', 'qb1', 0], ['Q1.1', 'Foco rojo auxiliar', 'qb1', 1, 'bad'],
        ['Q1.5', 'Foco amarillo', 'qb1', 5, 'warn'], ['Q1.6', 'Foco verde', 'qb1', 6], ['Q1.7', 'Foco rojo', 'qb1', 7, 'bad']
      ]
    },
    A: {
      in: [
        ['I0.0', 'Sujetador extendido', 'ib0', 0], ['I0.1', 'Sujetador retraído', 'ib0', 1], ['I0.2', 'Empujador extendido', 'ib0', 2],
        ['I0.3', 'Empujador retraído', 'ib0', 3], ['I0.4', 'Pieza en la cuna', 'ib0', 4], ['I0.5', 'Silo nivel alto', 'ib0', 5],
        ['I0.6', 'Silo con base abajo', 'ib0', 6], ['I0.7', 'Inductivo (metal)', 'ib0', 7], ['I1.2', 'SB2 paro', 'ib1', 2],
        ['I1.3', 'SB1 marcha', 'ib1', 3], ['I1.4', 'Seta QS (1 = liberada)', 'ib1', 4], ['I1.5', 'Selector en Automático', 'ib1', 5]
      ],
      out: [
        ['Q0.0', 'Sujetador', 'qb0', 0], ['Q0.1', 'Empujador', 'qb0', 1], ['Q0.7', 'Foco amarillo', 'qb0', 7, 'warn'],
        ['Q1.0', 'Foco verde', 'qb1', 0], ['Q1.1', 'Foco rojo', 'qb1', 1, 'bad']
      ]
    },
    E: {
      in: [
        ['I0.0', 'Silo nivel bajo', 'ib0', 0], ['I0.1', 'Silo nivel alto', 'ib0', 1], ['I0.2', 'Núcleo en el nido del silo', 'ib0', 2],
        ['I0.3', 'Núcleo en el nido de la pinza', 'ib0', 3], ['I0.4', 'Fibra: pieza blanca/metal', 'ib0', 4], ['I0.5', 'Retenedor extendido', 'ib0', 5],
        ['I0.6', 'Retenedor retraído', 'ib0', 6], ['I0.7', 'Base del silo cerrada', 'ib0', 7], ['I1.0', 'Base del silo abierta', 'ib1', 0],
        ['I1.1', 'Plato en posición A', 'ib1', 1], ['I1.2', 'Plato en posición B', 'ib1', 2], ['I1.3', 'Pinza cerrada', 'ib1', 3],
        ['I1.4', 'Vertical abajo', 'ib1', 4], ['I1.5', 'Vertical arriba', 'ib1', 5], ['I1.6', 'Horizontal atrás', 'ib1', 6],
        ['I1.7', 'Horizontal adelante', 'ib1', 7], ['I2.4', 'SB2 paro', 'ib2', 4], ['I2.5', 'SB1 marcha', 'ib2', 5],
        ['I2.6', 'Seta QS (1 = liberada)', 'ib2', 6], ['I2.7', 'Selector en Automático', 'ib2', 7]
      ],
      out: [
        ['Q0.0', 'Abrir base del silo', 'qb0', 0], ['Q0.1', 'Retenedor', 'qb0', 1], ['Q0.2', 'Plato a posición B', 'qb0', 2],
        ['Q0.3', 'Cerrar pinza', 'qb0', 3], ['Q0.4', 'Bajar vertical', 'qb0', 4], ['Q0.5', 'Horizontal adelante', 'qb0', 5],
        ['Q0.6', 'Baliza de planta roja', 'qb0', 6, 'bad'], ['Q0.7', 'Baliza de planta amarilla', 'qb0', 7, 'warn']
      ]
    },
    P: {
      in: [
        ['I0.0', 'Pieza en la mordaza', 'ib0', 0], ['I0.1', 'Mordaza cerrada', 'ib0', 1], ['I0.2', 'Carro en origen', 'ib0', 2],
        ['I0.3', 'Carro bajo la prensa', 'ib0', 3], ['I0.4', 'Prensa arriba', 'ib0', 4], ['I0.5', 'Prensa abajo', 'ib0', 5],
        ['I1.2', 'SB2 paro', 'ib1', 2], ['I1.3', 'SB1 marcha', 'ib1', 3], ['I1.4', 'Seta QS (1 = liberada)', 'ib1', 4],
        ['I1.5', 'Selector en Automático', 'ib1', 5]
      ],
      out: [
        ['Q0.0', 'Cerrar mordaza', 'qb0', 0], ['Q0.2', 'Carro a la prensa', 'qb0', 2], ['Q0.3', 'Bajar prensa', 'qb0', 3],
        ['Q0.7', 'Foco amarillo', 'qb0', 7, 'warn'], ['Q1.0', 'Foco verde', 'qb1', 0], ['Q1.1', 'Foco rojo', 'qb1', 1, 'bad']
      ]
    },
    S: {
      in: [
        ['I0.0', 'Encoder fase A', 'ib0', 0], ['I0.1', 'Encoder fase B', 'ib0', 1], ['I0.2', 'Encoder fase Z', 'ib0', 2],
        ['I0.3', 'Pieza en la entrada', 'ib0', 3], ['I0.4', 'Fibra (núcleo claro)', 'ib0', 4], ['I0.5', 'Inductivo (base metálica)', 'ib0', 5],
        ['I0.7', 'Desviador 1 extendido', 'ib0', 7], ['I1.5', 'Selector en Automático', 'modeByte', 6]
      ],
      out: [
        ['Q0.0', 'Marcha del variador (DI1)', 'qb0', 0], ['Q0.1', 'Sentido inverso (DI2)', 'qb0', 1], ['Q0.4', 'Desviador carril 1', 'qb0', 4],
        ['Q0.5', 'Desviador carril 2', 'qb0', 5], ['Q0.6', 'Desviador carril 3', 'qb0', 6], ['Q0.7', 'Foco amarillo', 'qb0', 7, 'warn']
      ]
    },
    R: {
      in: [
        ['I0.0', 'Home eje Z', 'ib0', 0], ['I0.1', 'Home eje X', 'ib0', 1], ['I0.2', 'Límite eje X', 'ib0', 2, 'warn'],
        ['I0.3', 'Home eje Y', 'ib0', 3], ['I0.4', 'Límite eje Y', 'ib0', 4, 'warn'], ['I0.5', 'Selector en Automático', 'ib0', 5],
        ['I0.6', 'Pulsador reset', 'ib0', 6], ['I0.7', 'Pulsador start / garra', 'ib0', 7]
      ],
      out: []
    }
  };

  // ------------------------------------------------------------------ decodificacion
  function decode(img, now) {
    const m = { img, t: now || Date.now() };
    const g = img.vb(1021);
    m.cell = { run: bit(g, 0), pause: bit(g, 1), qsOk: bit(g, 2), auto: bit(g, 3), cycle: bit(g, 4), alarm: bit(g, 5), manual: bit(g, 6) };
    m.readyBits = img.vb(1023);
    m.pieceType = img.vw(1036);           // 5 = negra (bypass), 0 = se clasifica en la cinta
    m.interlock = img.vb(1039);
    m.tAlarm = img.vb(1041);
    m.procAlarm = img.vb(1047);
    m.beacon = img.vb(1051);
    m.robotLink = img.vb(1053);
    m.waitBits = img.vb(1055);
    m.redCause = img.vb(1057);
    m.dt = [1060, 1062, 1064, 1066, 1068, 1070].map(a => img.vw(a));
    m.cotas = { A: img.vd(1110), P: img.vd(1114), E: img.vd(1118), S: img.vd(1122) };
    m.pos = img.vd(1126);
    m.laneSensors = img.vb(1181);
    m.count = { c1: img.vw(1182), c2: img.vw(1184), c3: img.vw(1186), robot: img.vw(1188), total: img.vw(1190) };
    m.params = { jog: img.vd(1002), rebote: img.vd(1006), homingBack: img.vd(1010), dirReq: img.vb(1015), modeReq: img.vb(1017) };
    m.nodesDown = img.vb(1209);
    m.life = img.vb(1254);

    const T = m.T = {
      ib0: img.vb(1200), ib1: img.vb(1201), ib2: img.vb(1202), qb0: img.vb(1203), qb1: img.vb(1204),
      maniobra: img.vb(1205), subAuto: img.vb(1206), subMan: img.vb(1207), subManiobra: img.vb(1208),
      flags: img.vb(1210), homingPhase: img.vb(1211), step: img.vw(1024), online: true
    };
    T.auto = m.cell.auto; T.qsOk = m.cell.qsOk;
    T.homed = bit(T.flags, 0); T.homing = bit(T.flags, 1); T.maneuvering = bit(T.flags, 2); T.travelling = bit(T.flags, 3);
    T.waiting = bit(T.flags, 4); T.bounce = bit(T.flags, 5); T.stopAtEnd = bit(T.flags, 6); T.robotMission = bit(T.flags, 7);
    T.gripClosed = bit(T.ib1, 1);

    const online = n => !bit(m.nodesDown, n);
    m.A = { stat: img.vb(1212), step: img.vb(1213), ib0: img.vb(1214), data: img.vb(1215), ib1: img.vb(1216), qb0: img.vb(1217), qb1: img.vb(1218), online: online(2) };
    m.A.auto = bit(m.A.ib1, 5); m.A.qsOk = !bit(m.A.stat, 6);   // la emergencia sale del byte de estado (vale tambien con programas sin IB1)
    m.E = { stat: img.vb(1220), step: img.vb(1221), ib0: img.vb(1222), data: img.vb(1223), ib1: img.vb(1224), qb0: img.vb(1225), ib2: img.vb(1226) & 0xF0, prep: (img.vb(1226) & 0x0F) * 10, diag: img.vb(1227), online: online(3) };
    m.E.auto = bit(m.E.ib2, 7); m.E.qsOk = !bit(m.E.stat, 6);
    m.P = { stat: img.vb(1228), step: img.vb(1229), ib0: img.vb(1230), data: img.vb(1231), ib1: img.vb(1232), qb0: img.vb(1233), qb1: img.vb(1234), online: online(4) };
    m.P.auto = bit(m.P.ib1, 5); m.P.qsOk = !bit(m.P.stat, 6);
    const sm = img.vb(1246);
    m.S = {
      stat: img.vb(1236), step: img.vb(1237), ib0: img.vb(1238), lane: img.vb(1239),
      freq: img.vw(1240) / 100, current: img.vw(1242) / 100, bus: img.vw(1244) / 10,
      mode: sm & 0x03, rev: bit(sm, 5), auto: bit(sm, 6), emergency: bit(sm, 7), modeByte: sm,
      err: img.vb(1247), qb0: img.vb(1248), online: online(5)
    };
    m.S.qsOk = !m.S.emergency;
    m.S.running = bit(m.S.qb0, 0) || m.S.freq > 0.5;
    m.R = { stat: img.vb(1250), step: img.vb(1251), ib0: img.vb(1252), homingPhase: img.vb(1253), online: online(6) };
    m.R.auto = bit(m.R.ib0, 5); m.R.homed = bit(m.R.stat, 7); m.R.qsOk = true;

    // Estado resumido de cada estacion
    m.st = {};
    for (const st of STATIONS) m.st[st.id] = summarize(m, st.id);
    return m;
  }

  // Resumen amigable: color, texto y paso actual
  function summarize(m, id) {
    const o = { id, kind: 'idle', label: 'Detenida', step: '', stepText: '', auto: false, online: true };
    if (id === 'T') {
      const T = m.T;
      o.auto = T.auto;
      const info = stepInfo(T.auto ? STEPS.T_auto : STEPS.T_man, T.step);
      o.step = info.name; o.stepText = info.text;
      if (T.auto && STEPS.T_autoSub[T.subAuto] && T.step >= 10) o.stepText = STEPS.T_autoSub[T.subAuto];
      if (!T.qsOk) return Object.assign(o, { kind: 'bad', label: 'Emergencia', blink: true });
      if (m.tAlarm & 0x7F) return Object.assign(o, { kind: 'bad', label: 'Alarma' });
      if (T.homing) return Object.assign(o, { kind: 'run', label: 'Homing' });
      if (T.auto && m.cell.pause) return Object.assign(o, { kind: 'warn', label: 'En pausa' });
      if (T.waiting) return Object.assign(o, { kind: 'warn', label: 'Esperando' });
      if (T.travelling || T.maneuvering) return Object.assign(o, { kind: 'run', label: 'En movimiento' });
      if (T.auto && m.cell.run) return Object.assign(o, { kind: 'ok', label: 'En marcha' });
      return Object.assign(o, { kind: 'idle', label: T.auto ? 'Detenida' : 'Manual' });
    }
    const S = m[id];
    o.online = S.online;
    o.auto = !!S.auto;
    if (!S.online) return Object.assign(o, { kind: 'idle', label: 'Sin red', step: '—' });
    if (id === 'A') Object.assign(o, stepPair(STEPS.A, S.step));
    if (id === 'E') Object.assign(o, stepPair(STEPS.E, S.step));
    if (id === 'P') Object.assign(o, stepPair(STEPS.P, S.step));
    if (id === 'S') Object.assign(o, stepPair(S.auto ? STEPS.S_auto : STEPS.S_man, S.step));
    if (id === 'R') {
      const ph = robotPhase(S.step, S.stat);
      o.step = bit(S.stat, 1) && S.homingPhase ? 'Homing' : ph.name;
      o.stepText = bit(S.stat, 1) && S.homingPhase ? (STEPS.R_homing[S.homingPhase] || '') : ph.text;
    }
    const st = S.stat;
    if (!S.qsOk || (id !== 'S' && id !== 'R' && bit(st, 6))) return Object.assign(o, { kind: 'bad', label: 'Emergencia', blink: true });
    if (id !== 'R' && bit(st, 3)) return Object.assign(o, { kind: 'bad', label: 'Alarma' });
    if (id === 'S' && bit(st, 5)) return Object.assign(o, { kind: 'bad', label: 'Falla variador' });
    if (id === 'S' && bit(st, 6)) return Object.assign(o, { kind: 'warn', label: 'Espera al Brazo' });
    if (id === 'E' && bit(S.diag, 2)) return Object.assign(o, { kind: 'warn', label: 'Espera núcleo' });
    if (bit(st, 1)) return Object.assign(o, { kind: 'run', label: 'Trabajando' });
    // READY antes que DONE: en Seleccion y en el Brazo el bit DONE queda enclavado tras la ultima pieza
    if (bit(st, 0)) return Object.assign(o, { kind: 'ok', label: 'Lista' });
    if (bit(st, 2)) return Object.assign(o, { kind: 'ok', label: id === 'A' ? 'Pieza lista' : 'Terminado' });
    if (id === 'R' && !S.auto) return Object.assign(o, { kind: 'idle', label: 'Manual' });
    return Object.assign(o, { kind: 'idle', label: S.auto ? 'En espera' : 'Manual' });
  }

  function stepPair(table, step) { const i = stepInfo(table, step); return { step: i.name, stepText: i.text }; }

  function robotPhase(step) {
    for (const p of R_PHASES) if (step >= p.from && step <= p.to) return p;
    return { name: 'Paso ' + step, text: '' };
  }

  // ------------------------------------------------------------------ explicaciones
  const WAIT_TEXT = [
    'una base en la cuna de Alimentación',
    'que Ensamblaje tenga el nido libre',
    'que Ensamblaje termine',
    'que Procesamiento esté libre',
    'que Procesamiento termine el prensado',
    'que Selección tenga la cinta libre (en Automático)'
  ];
  const RED_CAUSE = [
    'Alarma de Transporte', 'El Brazo no responde', 'Atasco en Alimentación', 'Atasco en Ensamblaje',
    'Atasco en Procesamiento', 'Atasco en Selección o falla del variador', 'Un PLC no responde en la red PPI', 'Seta de emergencia pulsada'
  ];
  const ROBOT_LINK = [
    'Selección espera al Brazo (pieza tipo 4/5 en el fin de cinta)', 'Brazo listo (Automático y en reposo)', 'Brazo referenciado',
    'Brazo ocupado', 'Sin red con Selección (PLC 5)', 'Sin red con el Brazo (PLC 6)', 'Orden de recogida enviada', 'Permiso de cinta devuelto a Selección'
  ];
  const E_DIAG = [
    'Automático sin marcha o en pausa: pulse SB1 de Transporte o el SB1 de la estación', 'Nido libre: esperando pieza',
    'Pieza blanca esperando un núcleo bajo la pinza', 'Esperando que Transporte retire la pieza', 'Silo de núcleos vacío',
    'Seguridad sin rearmar: pulse SB1 en la estación o Marcha en Transporte', 'Alarma: pulse SB2 en la estación', 'Manual: hay un movimiento listo, pulse SB1'
  ];
  const DT_DEF = [
    { name: 'Vertical baja', nominal: 400, alert: 550, crit: 1500 },
    { name: 'Vertical sube', nominal: 350, alert: 500, crit: 1500 },
    { name: 'Brazo se extiende', nominal: 350, alert: 550, crit: 1500 },
    { name: 'Brazo se retrae', nominal: 300, alert: 500, crit: 1500 },
    { name: 'Giro a la bancada', nominal: 400, alert: 600, crit: 1500 },
    { name: 'Pinza cierra', nominal: 250, alert: 450, crit: 1500 }
  ];
  const PIECE_TYPES = [
    { t: 1, base: 'Metal', core: 'Metal', dest: 'Carril 1', colors: ['metal', 'metal'] },
    { t: 2, base: 'Plástico blanco', core: 'Plástico', dest: 'Carril 2', colors: ['white', 'white'] },
    { t: 3, base: 'Plástico blanco', core: 'Metal', dest: 'Carril 3', colors: ['white', 'metal'] },
    { t: 4, base: 'Metal', core: 'Plástico', dest: 'Fin de cinta → Brazo', colors: ['metal', 'white'] },
    { t: 5, base: 'Plástico negro', core: 'Sin núcleo', dest: 'Fin de cinta → Brazo', colors: ['black', null] }
  ];

  // ------------------------------------------------------------------ reglas de alarma
  // sev: bad = alarma, warn = aviso, info = informativo
  const st = (id) => STATIONS.find(s => s.id === id).short;
  const ALARMS = [
    { id: 'T.qs', st: 'T', sev: 'bad', title: 'Seta de emergencia pulsada en Transporte', help: 'Libere la seta. Después pulse SB1 en Transporte o Marcha en el SCADA.', test: m => !m.T.qsOk },
    { id: 'A.qs', st: 'A', sev: 'bad', title: 'Seta de emergencia pulsada en Alimentación', help: 'Libere la seta y rearme con SB1 (o Marcha en Transporte).', test: m => m.A.online && bit(m.A.stat, 6) },
    { id: 'E.qs', st: 'E', sev: 'bad', title: 'Seta de emergencia pulsada en Ensamblaje', help: 'Libere la seta y rearme con SB1 (o Marcha en Transporte).', test: m => m.E.online && bit(m.E.stat, 6) },
    { id: 'P.qs', st: 'P', sev: 'bad', title: 'Seta de emergencia pulsada en Procesamiento', help: 'Libere la seta y rearme con SB1 (o Marcha en Transporte).', test: m => m.P.online && bit(m.P.stat, 6) },
    { id: 'S.qs', st: 'S', sev: 'bad', title: 'Seta de emergencia pulsada en Selección', help: 'Libere la seta y rearme con SB1 (o Marcha en Transporte).', test: m => m.S.online && m.S.emergency },
    { id: 'T.atasco', st: 'T', sev: 'bad', title: 'Transporte: atasco o viaje no concluido', help: 'Revise el aire y los sensores del manipulador. En Automático pulse Marcha para reintentar; en Manual, SB2.', test: m => bit(m.tAlarm, 0) },
    { id: 'T.homing', st: 'T', sev: 'bad', title: 'Transporte: homing fallido', help: 'No encontró el inductivo I0.0 o tocó el final de carrera izquierdo. Revise el sensor y pulse Marcha para reintentar.', test: m => bit(m.tAlarm, 1) },
    { id: 'T.limite', st: 'T', sev: 'bad', title: 'Transporte: límite o cota fuera de rango', help: 'En Manual aleje el carro del final de carrera; revise las cotas en Configuración.', test: m => bit(m.tAlarm, 2) },
    { id: 'T.sinref', st: 'T', sev: 'bad', title: 'Transporte: movimiento sin referencia', help: 'Haga el homing: SB2 en Manual (reposo) o Marcha en Automático.', test: m => bit(m.tAlarm, 3) },
    { id: 'T.maniobra', st: 'T', sev: 'bad', title: 'Transporte: una maniobra superó 2 s', help: 'Algún cilindro del manipulador no llegó a su sensor. Revise aire y sensores; Marcha reintenta.', test: m => bit(m.tAlarm, 4) },
    { id: 'T.diag', st: 'T', sev: 'bad', title: 'Transporte: alarma en Manual', help: 'Un movimiento manual no se confirmó. Pulse SB2 para volver al reposo.', test: m => bit(m.tAlarm, 5) },
    { id: 'T.brazo', st: 'R', sev: 'bad', title: 'El Brazo no respondió a la orden de recogida', help: 'Ponga el Brazo en Automático y revise su red en Diagnóstico. Marcha borra la alarma.', test: m => bit(m.tAlarm, 6) },
    { id: 'T.fuga', st: 'T', sev: 'warn', title: 'Transporte: movimiento lento (posible fuga de aire)', help: 'Revise los tiempos en Diagnóstico. Marcha borra el aviso.', test: m => bit(m.tAlarm, 7) },
    { id: 'T.fcIzq', st: 'T', sev: 'bad', title: 'Final de carrera izquierdo accionado', help: 'Mueva el carro hacia la derecha en Manual.', test: m => bit(m.laneSensors, 4) },
    { id: 'T.fcDer', st: 'T', sev: 'warn', title: 'Final de carrera derecho accionado', help: 'Normal durante el rebote en Selección; si persiste, revise la cota de Selección.', test: m => bit(m.laneSensors, 5) && !m.T.bounce },
    { id: 'T.servo', st: 'T', sev: 'info', title: 'Servo de Transporte sin señal de listo (RDY)', help: 'Solo informativo: no bloquea el movimiento.', test: m => bit(m.procAlarm, 2) },
    { id: 'net.2', st: 'A', sev: 'bad', title: 'Sin comunicación con Alimentación (PLC 2)', help: 'Revise el cable PPI y que el PLC 2 esté en RUN.', test: m => bit(m.nodesDown, 2) },
    { id: 'net.3', st: 'E', sev: 'bad', title: 'Sin comunicación con Ensamblaje (PLC 3)', help: 'Revise el cable PPI y que el PLC 3 esté en RUN.', test: m => bit(m.nodesDown, 3) },
    { id: 'net.4', st: 'P', sev: 'bad', title: 'Sin comunicación con Procesamiento (PLC 4)', help: 'Revise el cable PPI y que el PLC 4 esté en RUN.', test: m => bit(m.nodesDown, 4) },
    { id: 'net.5', st: 'S', sev: 'bad', title: 'Sin comunicación con Selección (PLC 5)', help: 'Revise el cable PPI y que el PLC 5 esté en RUN.', test: m => bit(m.nodesDown, 5) },
    { id: 'net.6', st: 'R', sev: 'bad', title: 'Sin comunicación con el Brazo (PLC 6)', help: 'Revise el cable PPI y que el PLC 6 esté en RUN.', test: m => bit(m.nodesDown, 6) },
    { id: 'A.atasco', st: 'A', sev: 'bad', title: 'Alimentación: atasco de un cilindro', help: 'Revise el aire y los sensores. SB2 en la estación reinicia.', test: m => m.A.online && bit(m.A.stat, 3) },
    { id: 'A.fuga', st: 'A', sev: 'warn', title: 'Alimentación: movimiento lento (posible fuga)', help: 'SB2 en la estación borra el aviso.', test: m => m.A.online && bit(m.A.stat, 4) },
    { id: 'A.silo', st: 'A', sev: 'warn', title: 'Alimentación: silo de bases vacío', help: 'Reponga bases en el silo.', test: m => m.A.online && bit(m.A.stat, 5) },
    { id: 'E.atasco', st: 'E', sev: 'bad', title: 'Ensamblaje: alarma (atasco, núcleo no cayó o no llegó bajo la pinza)', help: 'Mire el foco rojo de la estación, corrija y pulse SB2 allí.', test: m => m.E.online && bit(m.E.stat, 3) },
    { id: 'E.fuga', st: 'E', sev: 'warn', title: 'Ensamblaje: movimiento lento (posible fuga)', help: 'SB2 en la estación borra el aviso.', test: m => m.E.online && bit(m.E.stat, 4) },
    { id: 'E.silo', st: 'E', sev: 'warn', title: 'Ensamblaje: silo de núcleos vacío', help: 'Reponga núcleos. Las piezas negras pasan igual.', test: m => m.E.online && bit(m.E.stat, 5) },
    { id: 'E.nucleo', st: 'E', sev: 'info', title: 'Ensamblaje: pieza blanca esperando núcleo', help: 'La estación está preparando un núcleo.', test: m => m.E.online && bit(m.E.diag, 2) },
    { id: 'P.atasco', st: 'P', sev: 'bad', title: 'Procesamiento: atasco de un cilindro', help: 'Revise el aire y los sensores. SB2 en la estación reinicia.', test: m => m.P.online && bit(m.P.stat, 3) },
    { id: 'P.fuga', st: 'P', sev: 'warn', title: 'Procesamiento: movimiento lento (posible fuga)', help: 'SB2 en la estación borra el aviso.', test: m => m.P.online && bit(m.P.stat, 4) },
    { id: 'S.atasco', st: 'S', sev: 'bad', title: 'Selección: atasco de un desviador', help: 'Revise el aire y los sensores de los desviadores. SB2 en la estación reinicia.', test: m => m.S.online && bit(m.S.stat, 3) },
    { id: 'S.fuga', st: 'S', sev: 'warn', title: 'Selección: desviador lento (posible fuga)', help: 'SB2 en la estación borra el aviso.', test: m => m.S.online && bit(m.S.stat, 4) },
    { id: 'S.vfd', st: 'S', sev: 'bad', title: 'Selección: sin comunicación con el variador', help: 'Revise el cable RS-485 del Powtran (Puerto 1 del PLC 5) y sus parámetros.', test: m => m.S.online && bit(m.S.stat, 5), detail: m => m.S.err ? 'Código Modbus ' + m.S.err : '' },
    { id: 'S.brazo', st: 'S', sev: 'info', title: 'Selección: pieza en el fin de cinta esperando al Brazo', help: 'El Brazo debe estar en Automático.', test: m => m.S.online && bit(m.S.stat, 6) }
  ];
  ALARMS.forEach(a => { a.stName = st(a.st); });

  XL.model = { MemImage, REG_COUNT, STATIONS, STEPS, R_PHASES, IO, decode, stepInfo, robotPhase, WAIT_TEXT, RED_CAUSE, ROBOT_LINK, E_DIAG, DT_DEF, PIECE_TYPES, ALARMS };
})(window.XL);
