/* =============================================================================
   SCADA XL-335B - Ventanas (paginas)
   Cada pagina: { id, title, sub, icon, group, mount(root, app) -> { update(m) } }
   ============================================================================= */
'use strict';

(function (XL) {
  const { h, txt, cls, bit, fmt, icon, ui, draw, model } = XL;
  const CMD = { MARCHA: 0x01, PAUSA: 0x02, RESET: 0x04, PARADA_FIN: 0x08, SB1: 0x10, SB2: 0x20, JOG_R: 0x40, JOG_L: 0x80, RESET_CNT: 0x100 };
  XL.CMD = CMD;

  function head(app, page, extra) {
    const actions = [].concat(extra || []);
    if (!app.isPopup) actions.push(h('button', { class: 'btn sm', title: 'Abrir esta ventana aparte (por ejemplo en otro monitor)', onclick: () => app.openPopup(page.id) }, [icon('window'), 'Abrir aparte']));
    return h('div', { class: 'page-head' }, [
      h('div', { class: 'ph-text' }, [h('h2', { text: page.title }), page.sub ? h('p', { text: page.sub }) : null]),
      h('div', { class: 'ph-actions' }, actions)
    ]);
  }

  function btn(label, iconName, cls2, onclick, title) {
    return h('button', { class: 'btn ' + (cls2 || ''), title: title || '', onclick }, [iconName ? icon(iconName) : null, label]);
  }

  function callout(kind, title, text) {
    return h('div', { class: 'callout ' + kind }, [icon(kind === 'bad' || kind === 'warn' ? 'warn' : 'info', 'co-icon'), h('div', {}, [title ? h('b', { text: title }) : null, text ? h('span', { text }) : null])]);
  }

  // ======================================================================== PLANTA
  const planta = {
    id: 'planta', title: 'Planta', sub: 'Vista general de la celda XL-335B', icon: 'plant', group: 'Operación',
    mount(root, app) {
      const plant = draw.plantView(id => app.navigate(model.STATIONS.find(s => s.id === id).page));
      const cellChips = { mode: ui.chip(), run: ui.chip(), qs: ui.chip() };
      const why = ui.reasons();
      const piece = h('div', { class: 'muted', text: '' });
      const cards = model.STATIONS.map(st => ui.stationCard(st, p => app.navigate(p)));
      const counts = ui.kv([['total', 'Piezas terminadas'], ['c1', 'Carril 1 (metal / metal)'], ['c2', 'Carril 2 (blanca / plástico)'], ['c3', 'Carril 3 (blanca / metal)'], ['robot', 'Brazo (tipos 4 y 5)'], ['rate', 'Ritmo de la sesión']]);
      const actions = h('div', { class: 'big-actions' }, [
        h('button', { class: 'btn ok lg', onclick: () => app.pulse(CMD.MARCHA, 'Marcha') }, [icon('play'), 'Marcha', h('small', { text: 'arranca toda la celda' })]),
        h('button', { class: 'btn warn lg', onclick: () => app.pulse(CMD.PAUSA, 'Pausa') }, [icon('pause'), 'Pausa', h('small', { text: 'termina el movimiento' })]),
        h('button', { class: 'btn lg', onclick: () => app.pulse(CMD.PARADA_FIN, 'Parar al terminar la pieza') }, [icon('flag'), 'Parar al final', h('small', { text: 'tras la pieza en curso' })]),
        h('button', { class: 'btn lg', onclick: () => app.pulse(CMD.RESET, 'Reset / rearme') }, [icon('reset'), 'Reset', h('small', { text: 'rearma y borra alarmas' })])
      ]);
      root.append(
        head(app, this),
        h('section', { class: 'card svg-card' }, [plant.el]),
        h('div', { class: 'grid g-3', style: { marginTop: '16px' } }, [
          ui.card('Mando de la celda', null, h('div', { class: 'stack', style: { gap: '12px' } }, [
            h('div', { class: 'btn-row' }, [cellChips.mode.el, cellChips.run.el, cellChips.qs.el]),
            actions,
            h('p', { class: 'hint', style: { margin: 0 }, text: 'Marcha hace lo mismo que el SB1 de Transporte en Automático: rearma las estaciones y les envía la orden de marcha.' })
          ])),
          ui.card('¿Qué está pasando?', null, h('div', {}, [why.el, piece])),
          ui.card('Producción', 'contadores del PLC 1', counts.el, [h('button', { class: 'btn sm ghost', onclick: () => app.navigate('produccion'), text: 'Ver detalle' })])
        ]),
        h('div', { class: 'grid g-3', style: { marginTop: '16px' } }, cards.map(c => c.el)),
        h('div', { style: { marginTop: '16px' } }, [ui.card('Tipos de pieza', 'matriz de clasificación', pieceMatrix())])
      );
      return {
        update(m) {
          plant.update(m);
          cards.forEach(c => c.update(m));
          cellChips.mode.update(m.cell.auto ? 'info' : 'idle', m.cell.auto ? 'Automático' : 'Manual');
          cellChips.run.update(m.cell.run && !m.cell.pause ? 'ok' : m.cell.pause ? 'warn' : 'idle', m.cell.run && !m.cell.pause ? 'En marcha' : m.cell.pause ? 'En pausa' : 'Detenida');
          cellChips.qs.update(m.cell.qsOk ? 'ok' : 'bad', m.cell.qsOk ? 'Seta liberada' : 'Seta pulsada', !m.cell.qsOk);
          why.update(whatsHappening(m, app));
          txt(piece, m.T.gripClosed ? (m.pieceType === 5 ? 'Transporte lleva una pieza negra (va directo a la cinta, sin prensa).' : 'Transporte lleva una pieza en la pinza.') : '');
          counts.set('total', fmt(m.count.total)); counts.set('c1', fmt(m.count.c1)); counts.set('c2', fmt(m.count.c2));
          counts.set('c3', fmt(m.count.c3)); counts.set('robot', fmt(m.count.robot));
          const r = app.prod.rate();
          counts.set('rate', r === null ? '—' : fmt(r, 0) + ' piezas/h');
        }
      };
    }
  };

  function whatsHappening(m, app) {
    const out = [];
    const act = app.alarms.list();
    const bad = act.filter(a => a.def.sev === 'bad');
    if (bad.length) out.push({ kind: 'bad', blink: true, text: bad.length === 1 ? bad[0].def.title : bad.length + ' alarmas activas', sub: bad.length === 1 ? bad[0].def.help : 'Abra la ventana Alarmas para ver el detalle.' });
    if (!m.cell.auto) out.push({ kind: 'info', text: 'Transporte está en Manual', sub: 'Cada SB1 ejecuta una acción. Las estaciones siguen trabajando en su propio modo.' });
    else if (!m.cell.run) out.push({ kind: 'idle', text: 'La celda está detenida', sub: 'Pulse Marcha (o SB1 en Transporte).' });
    else if (m.cell.pause) out.push({ kind: 'warn', text: 'La celda está en pausa', sub: 'Marcha reanuda.' });
    const w = m.waitBits & 0x3F;
    for (let i = 0; i < 6; i++) if (bit(w, i)) out.push({ kind: 'warn', text: 'Transporte espera ' + model.WAIT_TEXT[i] });
    if (m.T.homing) out.push({ kind: 'info', text: 'Transporte buscando la referencia (homing)' });
    if (m.E.online && bit(m.E.diag, 2)) out.push({ kind: 'warn', text: 'Ensamblaje prepara un núcleo para la pieza blanca' });
    if (m.S.online && bit(m.S.stat, 6)) out.push({ kind: 'info', text: 'Pieza en el fin de cinta esperando al Brazo' });
    const warns = act.filter(a => a.def.sev === 'warn');
    warns.slice(0, 3).forEach(a => out.push({ kind: 'warn', text: a.def.title }));
    if (!out.length && m.cell.run) out.push({ kind: 'ok', text: 'Todo en orden: la celda produce.' });
    return out;
  }

  function pieceMatrix() {
    const dot = c => h('i', { style: { background: c === 'metal' ? 'var(--metal)' : c === 'white' ? 'var(--white-piece)' : c === 'black' ? 'var(--black-piece)' : 'transparent', borderStyle: c ? 'solid' : 'dashed' } });
    return h('table', { class: 'tbl' }, [
      h('thead', {}, h('tr', {}, ['Tipo', 'Base', 'Núcleo', 'Destino'].map(t => h('th', { text: t })))),
      h('tbody', {}, model.PIECE_TYPES.map(p => h('tr', {}, [
        h('td', {}, [h('span', { class: 'piece-dots' }, [dot(p.colors[0]), dot(p.colors[1])]), ' ', String(p.t)]),
        h('td', { text: p.base }), h('td', { text: p.core }), h('td', { text: p.dest })
      ])))
    ]);
  }

  // ======================================================================== TRANSPORTE
  const transporte = {
    id: 'transporte', title: 'Transporte', sub: 'Carro con servo, manipulador y coordinación de la celda (PLC 1)', icon: 'rail', group: 'Unidades',
    mount(root, app) {
      const rail = draw.railView();
      const manip = draw.manipulatorView();
      const now = ui.nowBox();
      const stepsAuto = ui.stepsPanel(model.STEPS.T_auto, [0, 5, 10, 20, 22, 30, 32, 50]);
      const stepsMan = ui.stepsPanel(model.STEPS.T_man, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 90]);
      const stepsWrap = h('div', {});
      const flags = ui.reasons();
      const io = ui.ioPanel('T');
      const dt = ui.dtPanel(model.DT_DEF);
      const chip = ui.chip();
      const modeHelp = h('p', { class: 'hint' });
      const jogPulses = h('b', { text: '—' });
      const jogBox = h('div', { class: 'stack', style: { gap: '10px' } }, [
        h('div', { class: 'btn-row' }, [
          btn('Jog izquierda', 'left', '', () => app.pulse(CMD.JOG_L, 'Jog izquierda', { quiet: true })),
          btn('Jog derecha', 'right', '', () => app.pulse(CMD.JOG_R, 'Jog derecha', { quiet: true }))
        ]),
        h('div', { class: 'muted' }, ['Cada toque mueve ', jogPulses, ' pulsos. Solo en Manual, con referencia y en reposo o esperando SB1. Cambie el valor en Configuración.'])
      ]);
      const jogCard = ui.card('Jog de calibración', 'para ajustar cotas', jogBox);
      root.append(
        head(app, this),
        h('section', { class: 'card svg-card' }, [rail.el]),
        h('div', { class: 'grid g-main', style: { marginTop: '16px' } }, [
          h('div', { class: 'stack' }, [
            ui.card('Ahora', null, h('div', { class: 'stack', style: { gap: '12px' } }, [now.el, stepsWrap]), [chip.el]),
            h('div', { class: 'grid g-2' }, [h('section', { class: 'card svg-card' }, [manip.el]), ui.card('Estado del carro', null, flags.el)])
          ]),
          h('div', { class: 'stack' }, [
            ui.card('Pulsadores virtuales', 'iguales a los del tablero de Transporte', h('div', {}, [
              h('div', { class: 'big-actions' }, [
                h('button', { class: 'btn primary lg', onclick: () => app.pulse(CMD.SB1, 'SB1 de Transporte', { confirm: true }) }, [icon('step'), 'SB1', h('small', { text: 'avanzar / marcha' })]),
                h('button', { class: 'btn lg', onclick: () => app.pulse(CMD.SB2, 'SB2 de Transporte', { confirm: true }) }, [icon('home'), 'SB2', h('small', { text: 'paro / homing' })])
              ]),
              modeHelp
            ])),
            jogCard
          ])
        ]),
        h('div', { class: 'grid g-2', style: { marginTop: '16px' } }, [
          ui.card('Tiempos del manipulador (Δt)', 'medidos en cada movimiento', dt.el),
          ui.card('Entradas y salidas', 'PLC 1', io.el)
        ])
      );
      return {
        update(m) {
          const T = m.T;
          rail.update(m); manip.update(m); io.update(m); dt.update(m.dt);
          const st = m.st.T;
          chip.update(st.kind, st.label, st.blink);
          if (T.auto) {
            const i = model.stepInfo(model.STEPS.T_auto, T.step);
            let sub = T.step >= 10 ? (model.STEPS.T_autoSub[T.subAuto] || '') : i.text;
            if (T.subAuto === 3 && T.maniobra) sub = 'Maniobra: ' + model.STEPS.T_maniobra[T.maniobra] + ' – ' + (model.STEPS.T_manSubEtapa[T.subManiobra] || T.subManiobra);
            now.update(T.step, i.name, sub);
            if (stepsWrap.firstChild !== stepsAuto.el) { stepsWrap.textContent = ''; stepsWrap.appendChild(stepsAuto.el); }
            stepsAuto.update(T.step);
            txt(modeHelp, 'En Automático: SB1 = Marcha (arranca y rearma toda la celda). SB2 = Pausa.');
          } else {
            const i = model.stepInfo(model.STEPS.T_man, T.step);
            let sub = model.STEPS.T_manSub[T.subMan] || i.text;
            if (T.maniobra && T.maneuvering) sub = 'Maniobra: ' + model.STEPS.T_maniobra[T.maniobra] + ' – ' + (model.STEPS.T_manSubEtapa[T.subManiobra] || '');
            now.update(T.step, i.name, sub);
            if (stepsWrap.firstChild !== stepsMan.el) { stepsWrap.textContent = ''; stepsWrap.appendChild(stepsMan.el); }
            stepsMan.update(T.step);
            txt(modeHelp, 'En Manual: SB1 = ejecutar la siguiente acción (si falta referencia hace el homing). SB2 en reposo = homing; en otro paso vuelve al reposo.');
          }
          const items = [];
          items.push(T.homed ? { kind: 'ok', text: 'Referenciado', sub: 'Posición ' + fmt(m.pos) + ' pulsos' } : { kind: 'warn', text: 'Sin referencia', sub: 'Se hará el homing al arrancar' });
          if (T.homing) items.push({ kind: 'info', text: 'Homing en curso', sub: 'Fase: ' + (model.STEPS.T_homing[T.homingPhase] || T.homingPhase) });
          if (T.travelling) items.push({ kind: 'info', text: 'Viajando', sub: 'Dirección ' + (bit(T.qb0, 2) ? 'derecha' : 'izquierda') });
          if (T.maneuvering) items.push({ kind: 'info', text: 'Maniobra en curso', sub: model.STEPS.T_maniobra[T.maniobra] || '' });
          if (T.bounce) items.push({ kind: 'warn', text: 'Rebote en el final de carrera derecho' });
          if (T.waiting) items.push({ kind: 'warn', text: 'Esperando a otra estación', sub: waitText(m) });
          if (T.stopAtEnd) items.push({ kind: 'info', text: 'Parará al terminar la pieza en curso' });
          if (T.robotMission) items.push({ kind: 'info', text: 'Misión del Brazo en curso' });
          items.push({ kind: bit(T.ib1, 2) ? 'ok' : 'idle', text: bit(T.ib1, 2) ? 'Servo listo (RDY)' : 'Servo sin RDY (solo informativo)' });
          flags.update(items);
          txt(jogPulses, fmt(m.params.jog));
          cls(jogCard, 'hidden', T.auto);
        }
      };
    }
  };

  function waitText(m) {
    for (let i = 0; i < 6; i++) if (bit(m.waitBits, i)) return model.WAIT_TEXT[i];
    return '';
  }

  // ======================================================================== ESTACIONES (plantilla)
  function stationPage(cfg) {
    return {
      id: cfg.id, title: cfg.title, sub: cfg.sub, icon: cfg.icon, group: 'Unidades',
      mount(root, app) {
        const view = cfg.view();
        const now = ui.nowBox();
        const steps = cfg.steps ? ui.stepsPanel(cfg.steps.table, cfg.steps.keys) : null;
        const chip = ui.chip();
        const modeChip = ui.chip();
        const info = ui.reasons();
        const io = ui.ioPanel(cfg.st);
        const extraCards = cfg.extra ? cfg.extra(app) : [];
        const offline = callout('bad', 'Sin comunicación con esta estación', 'Los datos que ve son los últimos recibidos. Revise el cable PPI y que el PLC esté en RUN.');
        root.append(...[
          head(app, this),
          offline,
          h('div', { class: 'grid g-main', style: { marginTop: '0' } }, [
            h('section', { class: 'card svg-card' }, [view.el]),
            h('div', { class: 'stack' }, [
              ui.card('Ahora', null, h('div', { class: 'stack', style: { gap: '12px' } }, [now.el, steps ? steps.el : null]), [modeChip.el, chip.el]),
              ui.card('Estado', null, info.el)
            ])
          ]),
          extraCards.length ? h('div', { class: 'grid g-2', style: { marginTop: '16px' } }, extraCards.map(c => c.el || c)) : null,
          h('div', { style: { marginTop: '16px' } }, [ui.card('Entradas y salidas', 'PLC ' + cfg.plc, io.el)])
        ].filter(Boolean));
        return {
          update(m) {
            const S = m[cfg.st], st = m.st[cfg.st];
            cls(offline, 'hidden', S.online);
            offline.style.marginBottom = '16px';
            view.update(m); io.update(m);
            chip.update(st.kind, st.label, st.blink);
            modeChip.update(S.online ? (S.auto ? 'info' : 'idle') : 'idle', !S.online ? 'Sin red' : S.auto ? 'Automático' : 'Manual');
            const n = cfg.now(m, S);
            now.update(n.step, n.title, n.sub);
            if (steps) steps.update(cfg.steps.value ? cfg.steps.value(S) : S.step, cfg.steps.active ? cfg.steps.active(S) : true);
            info.update(cfg.info(m, S));
            extraCards.forEach(c => c.update && c.update(m));
          }
        };
      }
    };
  }

  function statInfo(S, labels) {
    const out = [];
    if (!S.online) return [{ kind: 'bad', text: 'Sin comunicación' }];
    if (!S.qsOk) out.push({ kind: 'bad', blink: true, text: 'Seta de emergencia pulsada', sub: 'Libere la seta y rearme con SB1' });
    if (bit(S.stat, 3)) out.push({ kind: 'bad', text: labels.atasco || 'Alarma de atasco', sub: 'SB2 en la estación la borra' });
    if (bit(S.stat, 4)) out.push({ kind: 'warn', text: 'Movimiento lento (posible fuga de aire)' });
    if (bit(S.stat, 0)) out.push({ kind: 'ok', text: labels.ready || 'Lista para recibir' });
    if (bit(S.stat, 1)) out.push({ kind: 'info', text: labels.busy || 'Trabajando' });
    if (bit(S.stat, 2)) out.push({ kind: 'ok', text: labels.done || 'Terminado: esperando a Transporte' });
    if (bit(S.stat, 7)) out.push({ kind: 'ok', text: labels.homed || 'Mecanismos en reposo' });
    return out;
  }

  const alimentacion = stationPage({
    id: 'alimentacion', st: 'A', plc: 2, icon: 'feed', title: 'Alimentación', sub: 'Silo de bases, sujetador, empujador y cuna de salida (PLC 2)',
    view: draw.feedView,
    steps: { table: model.STEPS.A, keys: [0, 10, 20, 30, 40, 50] },
    now: (m, S) => { const i = model.stepInfo(model.STEPS.A, S.step); return { step: S.step, title: i.name, sub: i.text }; },
    info: (m, S) => {
      const out = statInfo(S, { ready: 'En reposo', done: 'Base lista en la cuna' });
      if (S.online && bit(S.stat, 5)) out.push({ kind: 'warn', text: 'Silo de bases vacío', sub: 'Reponga bases' });
      if (S.online && bit(S.ib0, 4)) out.push({ kind: 'info', text: 'Base en la cuna: ' + (S.data === 1 || bit(S.ib0, 7) ? 'metálica' : 'plástica') });
      if (S.online && S.auto) out.push({ kind: 'idle', text: 'Repone una base sola cada vez que la cuna queda libre' });
      return out;
    }
  });

  const ensamblaje = stationPage({
    id: 'ensamblaje', st: 'E', plc: 3, icon: 'puzzle', title: 'Ensamblaje', sub: 'Silo de núcleos, plato de dos nidos y Pick & Place (PLC 3)',
    view: draw.assemblyView,
    steps: { table: model.STEPS.E, keys: [0, 10, 50, 60, 70, 80, 90, 95, 100, 110, 120] },
    now: (m, S) => {
      const i = model.stepInfo(model.STEPS.E, S.step);
      let sub = i.text;
      if (S.step === 10 && S.data === 1) sub = 'Pieza blanca/metal: ' + (bit(S.ib0, 3) ? 'toma el núcleo' : 'esperando núcleo bajo la pinza');
      if (S.step === 120 && S.data === 5) sub = 'Pieza negra: sin núcleo (bypass)';
      return { step: S.step, title: i.name, sub };
    },
    info: (m, S) => {
      const out = statInfo(S, { atasco: 'Alarma: atasco, núcleo no cayó o no llegó bajo la pinza', ready: 'Nido libre: acepta pieza', busy: 'Trabajando sobre la pieza' });
      if (!S.online) return out;
      // Paso 10 con pieza blanca: condiciones del PLC 3 para bajar la pinza (SBR_ENSAMBLE Network 7)
      if (S.step === 10 && S.data === 1) {
        const i0 = S.ib0, i1 = S.ib1, q2 = bit(S.qb0, 2);
        const plateOk = (q2 && bit(i1, 2) && !bit(i1, 1)) || (!q2 && bit(i1, 1) && !bit(i1, 2));
        const miss = [];
        if (!bit(i0, 3)) miss.push(['Núcleo bajo la pinza (I0.3)', 'la estación lo está preparando']);
        if (!plateOk) miss.push(['Plato quieto en su posición', 'Q0.2 = ' + q2 + ', I1.1 = ' + bit(i1, 1) + ', I1.2 = ' + bit(i1, 2) + ': el sensor de la posición ordenada no está activo']);
        if (S.prep === 40) miss.push(['Plato girando', 'espera a que termine el giro']);
        if (!bit(i1, 5)) miss.push(['Pick & Place arriba (I1.5)', 'el sensor de vertical arriba no está activo: revise su reed en el cilindro, el aire o el cableado']);
        if (!bit(i1, 6)) miss.push(['Pick & Place atrás (I1.6)', 'el sensor de horizontal atrás no está activo: revise su reed en el cilindro, el aire o el cableado']);
        if (!S.auto) miss.push(['Modo Manual', 'pulse SB1 en la estación para bajar la pinza']);
        miss.forEach(([t, sub]) => out.unshift({ kind: 'bad', text: 'Para bajar la pinza falta: ' + t, sub }));
      }
      for (const b of [5, 0, 2, 3, 4, 7]) if (bit(S.diag, b)) out.push({ kind: b === 2 || b === 4 ? 'warn' : b === 7 ? 'info' : 'idle', text: model.E_DIAG[b] });
      return out;
    },
    extra: (app) => {
      const prepNow = ui.nowBox();
      const prepSteps = ui.stepsPanel(model.STEPS.E_prep, [0, 20, 30, 40]);
      const nests = ui.kv([['silo', 'Nido bajo el silo'], ['grip', 'Nido bajo la pinza'], ['plate', 'Plato'], ['silo2', 'Silo de núcleos'], ['type', 'Última pieza']]);
      const c1 = ui.card('Preparación de núcleos', 'corre en paralelo al ensamble', h('div', { class: 'stack', style: { gap: '12px' } }, [prepNow.el, prepSteps.el,
        h('p', { class: 'hint', text: 'Regla: núcleo bajo el silo y nido de la pinza vacío → gira 180°. Nido del silo vacío → dosifica. Ambos con núcleo → lista.' })]));
      c1.update = m => {
        const E = m.E;
        const i = model.stepInfo(model.STEPS.E_prep, E.prep);
        prepNow.update(E.prep, i.name, i.text);
        prepSteps.update(E.prep);
      };
      const c2 = ui.card('Núcleos y pieza', null, nests.el);
      c2.update = m => {
        const E = m.E;
        nests.set('silo', bit(E.ib0, 2) ? 'Con núcleo' : 'Vacío');
        nests.set('grip', bit(E.ib0, 3) ? 'Con núcleo' : 'Vacío');
        nests.set('plate', bit(E.ib1, 1) ? 'Posición A' : bit(E.ib1, 2) ? 'Posición B' : 'Girando');
        nests.set('silo2', bit(E.ib0, 1) ? 'Nivel alto' : bit(E.ib0, 0) ? 'Nivel bajo' : 'Vacío');
        nests.set('type', E.data === 1 ? 'Blanca / metal (con núcleo)' : E.data === 5 ? 'Negra (sin núcleo)' : '—');
      };
      return [c1, c2];
    }
  });

  const procesamiento = stationPage({
    id: 'procesamiento', st: 'P', plc: 4, icon: 'press', title: 'Procesamiento', sub: 'Mordaza, carro y prensa de doble golpe (PLC 4)',
    view: draw.pressView,
    steps: { table: model.STEPS.P, keys: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110] },
    now: (m, S) => {
      const i = model.stepInfo(model.STEPS.P, S.step);
      let sub = i.text;
      if (S.step === 0 && bit(S.ib0, 0) && S.auto) sub = 'Pieza recibida: espera 0,8 s a que Transporte la suelte';
      return { step: S.step, title: i.name, sub };
    },
    info: (m, S) => {
      const out = statInfo(S, { ready: 'Mordaza libre: acepta pieza', done: 'Prensado terminado: esperando a Transporte' });
      if (S.online && bit(S.ib0, 0)) out.push({ kind: 'info', text: 'Pieza en la mordaza' });
      if (S.online && S.auto) out.push({ kind: 'idle', text: 'Arranca con el aviso de Transporte (cuando su pinza ya se retiró)' });
      return out;
    }
  });

  // ======================================================================== SELECCION Y VARIADOR
  const seleccion = {
    id: 'seleccion', title: 'Selección y variador', sub: 'Cinta con encoder, inspección, 3 desviadores y variador Powtran PI9100A (PLC 5)', icon: 'belt', group: 'Unidades',
    mount(root, app) {
      const belt = draw.beltView();
      const gauge = draw.gaugeView();
      const now = ui.nowBox();
      const stepsAuto = ui.stepsPanel(model.STEPS.S_auto, [0, 10, 20, 25, 30, 32, 40, 42, 50, 52, 60]);
      const stepsMan = ui.stepsPanel(model.STEPS.S_man, [0, 10, 20, 30, 40, 50, 60, 70]);
      const stepsWrap = h('div');
      const chip = ui.chip(), modeChip = ui.chip();
      const vfd = ui.kv([['run', 'Estado'], ['cur', 'Corriente'], ['bus', 'Bus DC'], ['mode', 'Modo activo'], ['dir', 'Sentido'], ['err', 'Comunicación']]);
      const modeSeg = ui.segmented([[1, 'Modo 1 · Analógico'], [2, 'Modo 2 · Modbus']], v => app.setVfdMode(v));
      const dirSeg = ui.segmented([[1, 'Forward'], [2, 'Reverse']], v => app.setBeltDir(v));
      const pend = h('p', { class: 'hint' });
      const info = ui.reasons();
      const io = ui.ioPanel('S');
      const offline = callout('bad', 'Sin comunicación con Selección', 'Revise el cable PPI y que el PLC 5 esté en RUN.');
      root.append(
        head(app, this),
        offline,
        h('section', { class: 'card svg-card' }, [belt.el]),
        h('div', { class: 'grid g-3', style: { marginTop: '16px' } }, [
          ui.card('Variador', 'telemetría', h('div', { class: 'stack', style: { gap: '6px' } }, [gauge.el, vfd.el])),
          ui.card('Configuración del variador', 'se aplica con la cinta detenida', h('div', { class: 'stack', style: { gap: '14px' } }, [
            h('div', { class: 'field' }, [h('label', { text: 'Modo de mando' }), modeSeg.el, h('small', { text: 'Modo 1: marcha por Q0.0/Q0.1 y consigna analógica AQW0. Modo 2: órdenes y consigna por Modbus RS-485 (Puerto 1 del PLC 5).' })]),
            h('div', { class: 'field' }, [h('label', { text: 'Sentido de giro de la cinta' }), dirSeg.el, h('small', { text: 'En el banco la cinta avanza en Reverse (motor cableado al revés).' })]),
            pend
          ])),
          ui.card('Ahora', null, h('div', { class: 'stack', style: { gap: '12px' } }, [now.el, stepsWrap, info.el]), [modeChip.el, chip.el])
        ]),
        h('div', { class: 'grid g-2', style: { marginTop: '16px' } }, [
          ui.card('Entradas y salidas', 'PLC 5', io.el),
          ui.card('Calibración de cotas de la cinta', 'se hace en la estación', h('div', { class: 'stack', style: { gap: '8px' } }, [
            h('p', { style: { margin: 0 }, text: 'Con Selección en Automático y en reposo: mantenga SB2 y pulse SB1. La cinta marcha a 18 Hz; pulse SB1 cuando la pieza pase por el carril 1, 2, 3 y el fin de cinta. Los valores quedan en VD416..VD452 del PLC 5 (documentación 6.7).' }),
            h('p', { class: 'hint', text: 'Cotas vigentes: carril 1 = 2737, carril 2 = 4322, carril 3 = 5945, fin de cinta = 7769 cuentas.' })
          ]))
        ])
      );
      return {
        update(m) {
          const S = m.S, st = m.st.S;
          cls(offline, 'hidden', S.online);
          offline.style.marginBottom = '16px';
          belt.update(m); gauge.update(S.freq); io.update(m);
          chip.update(st.kind, st.label, st.blink);
          modeChip.update(S.online ? (S.auto ? 'info' : 'idle') : 'idle', !S.online ? 'Sin red' : S.auto ? 'Automático' : 'Manual');
          vfd.set('run', S.freq > 0.3 ? 'En marcha' : 'Parado');
          vfd.set('cur', fmt(S.current, 2) + ' A');
          vfd.set('bus', fmt(S.bus, 1) + ' V');
          vfd.set('mode', S.mode === 1 ? 'Modo 1 (analógico)' : S.mode === 2 ? 'Modo 2 (Modbus)' : '—');
          vfd.set('dir', S.rev ? 'Reverse' : 'Forward');
          vfd.set('err', bit(S.stat, 5) ? 'Falla (código ' + S.err + ')' : 'Correcta');
          const busy = !app.canWrite();
          modeSeg.update(S.mode, busy); dirSeg.update(S.rev ? 2 : 1, busy);
          const reqMode = m.params.modeReq, reqDir = m.params.dirReq;
          const msgs = [];
          if ((reqMode === 1 || reqMode === 2) && reqMode !== S.mode) msgs.push('Modo ' + reqMode + ' pedido: se aplicará cuando la cinta se detenga.');
          if ((reqDir === 1 || reqDir === 2) && reqDir !== (S.rev ? 2 : 1)) msgs.push('Sentido ' + (reqDir === 2 ? 'Reverse' : 'Forward') + ' pedido: se aplicará cuando la cinta se detenga.');
          txt(pend, msgs.join(' ') || 'El SCADA mantiene el último modo y sentido elegidos mientras siga conectado al PLC 1.');
          const table = S.auto ? model.STEPS.S_auto : model.STEPS.S_man;
          const i = model.stepInfo(table, S.step);
          let sub = i.text;
          if (S.auto && S.lane && S.step >= 10 && S.step < 60) sub = 'Destino: ' + (S.lane === 4 ? 'fin de cinta (Brazo)' : 'carril ' + S.lane);
          now.update(S.step, i.name, sub);
          const sp = S.auto ? stepsAuto : stepsMan;
          if (stepsWrap.firstChild !== sp.el) { stepsWrap.textContent = ''; stepsWrap.appendChild(sp.el); }
          sp.update(S.step);
          const items = statInfo(S, { ready: 'Cinta libre: acepta pieza', busy: 'Clasificando', done: 'Pieza clasificada' });
          if (S.online && bit(S.stat, 5)) items.push({ kind: 'bad', text: 'Sin comunicación con el variador', sub: 'Código Modbus ' + S.err });
          if (S.online && bit(S.stat, 6)) items.push({ kind: 'warn', text: 'Pieza en el fin de cinta esperando al Brazo' });
          info.update(items);
        }
      };
    }
  };

  // ======================================================================== BRAZO
  const brazo = {
    id: 'brazo', title: 'Brazo 4-DOF', sub: 'Recoge las piezas tipo 4 y 5 en el fin de cinta y las deja en la mesa (PLC 6)', icon: 'robot', group: 'Unidades',
    mount(root, app) {
      const view = draw.robotView();
      const now = ui.nowBox();
      const chip = ui.chip(), modeChip = ui.chip();
      const phases = model.R_PHASES.map(p => ({ p, el: h('div', { class: 'step' }, [h('span', { class: 'step-n', text: p.from === p.to ? String(p.from) : p.from + '+' }), h('span', { text: p.name })]) }));
      const link = ui.reasons();
      const info = ui.reasons();
      const io = ui.ioPanel('R');
      const offline = callout('bad', 'Sin comunicación con el Brazo', 'Revise el cable PPI y que el PLC 6 esté en RUN.');
      root.append(
        head(app, this),
        offline,
        h('div', { class: 'grid g-main' }, [
          h('section', { class: 'card svg-card' }, [view.el]),
          h('div', { class: 'stack' }, [
            ui.card('Ahora', null, h('div', { class: 'stack', style: { gap: '12px' } }, [now.el, h('div', { class: 'steps' }, phases.map(x => x.el))]), [modeChip.el, chip.el]),
            ui.card('Estado', null, info.el)
          ])
        ]),
        h('div', { class: 'grid g-2', style: { marginTop: '16px' } }, [
          ui.card('Enlace Selección → Brazo', 'coordinado por el PLC 1', link.el),
          ui.card('Sensores', 'PLC 6 (el Brazo solo publica IB0)', io.el)
        ])
      );
      return {
        update(m) {
          const R = m.R, st = m.st.R;
          cls(offline, 'hidden', R.online);
          offline.style.marginBottom = '16px';
          view.update(m); io.update(m);
          chip.update(st.kind, st.label, st.blink);
          modeChip.update(R.online ? (R.auto ? 'info' : 'idle') : 'idle', !R.online ? 'Sin red' : R.auto ? 'Automático' : 'Manual');
          const ph = model.robotPhase(R.step);
          const homing = bit(R.stat, 1) && R.homingPhase;
          now.update(R.step, homing ? 'Homing' : ph.name, homing ? (model.STEPS.R_homing[R.homingPhase] || '') + ' (orden X → Z → Y)' : ph.text);
          const idx = model.R_PHASES.indexOf(ph);
          phases.forEach((x, i) => { cls(x.el, 'current', x.p === ph); cls(x.el, 'done', idx > 0 && i < idx && i > 0); });
          const items = [];
          if (bit(R.stat, 0)) items.push({ kind: 'ok', text: 'Listo para recoger' });
          if (bit(R.stat, 1)) items.push({ kind: 'info', text: 'Trabajando' });
          if (bit(R.stat, 2)) items.push({ kind: 'ok', text: 'Pieza dejada en la mesa' });
          if (bit(R.stat, 6)) items.push({ kind: 'info', text: 'Pieza elevada: la cinta puede seguir' });
          items.push(R.homed ? { kind: 'ok', text: 'Referenciado' } : { kind: 'warn', text: 'Sin referencia', sub: 'La primera orden lanza el homing' });
          if (R.online && !R.auto) items.push({ kind: 'warn', text: 'Selector en Manual', sub: 'Para recoger debe estar en Automático' });
          info.update(items);
          const li = [];
          for (let i = 0; i < 8; i++) if (bit(m.robotLink, i)) li.push({ kind: i === 4 || i === 5 ? 'bad' : i === 0 ? 'warn' : 'ok', text: model.ROBOT_LINK[i] });
          if (bit(m.tAlarm, 6)) li.push({ kind: 'bad', text: 'El Brazo no respondió a la última orden (Marcha borra la alarma)' });
          link.update(li);
        }
      };
    }
  };

  // ======================================================================== ALARMAS
  const alarmas = {
    id: 'alarmas', title: 'Alarmas', sub: 'Alarmas y avisos activos, con su solución, e historial', icon: 'bell', group: 'Operación',
    mount(root, app) {
      const tabs = h('div', { class: 'tabs' });
      const tA = h('button', { class: 'on', text: 'Activas' }), tH = h('button', { text: 'Historial' });
      tabs.append(tA, tH);
      const listEl = h('div', { class: 'alarm-list' });
      const histBody = h('tbody');
      const histWrap = h('div', { class: 'hidden' }, [
        h('div', { class: 'btn-row', style: { marginBottom: '10px' } }, [
          btn('Exportar CSV', 'download', 'sm', () => app.alarms.exportCsv()),
          btn('Borrar historial', 'trash', 'sm', async () => { if (await XL.confirmDialog({ title: 'Borrar el historial de alarmas', text: 'Se borra solo en este navegador.', danger: true, ok: 'Borrar' })) { app.alarms.clearHistory(); lastHist = -1; } })
        ]),
        h('div', { class: 'tbl-wrap' }, [h('table', { class: 'tbl' }, [h('thead', {}, h('tr', {}, ['Fecha y hora', 'Unidad', 'Evento', 'Descripción', 'Duración'].map(t => h('th', { text: t })))), histBody])])
      ]);
      const ackBtn = btn('Reconocer todas', 'check', 'sm', () => app.alarms.ackAll());
      tA.onclick = () => { cls(tA, 'on', true); cls(tH, 'on', false); cls(activeWrap, 'hidden', false); cls(histWrap, 'hidden', true); };
      tH.onclick = () => { cls(tH, 'on', true); cls(tA, 'on', false); cls(activeWrap, 'hidden', true); cls(histWrap, 'hidden', false); };
      const activeWrap = h('div', {}, [listEl]);
      root.append(head(app, this, [ackBtn]), h('section', { class: 'card' }, [tabs, activeWrap, histWrap]));
      let lastKey = null, lastHist = -1, durs = [];
      return {
        update() {
          const act = app.alarms.list();
          const key = act.map(a => a.def.id + a.acked).join('|');
          if (key !== lastKey) {
            lastKey = key;
            durs = [];
            listEl.textContent = '';
            if (!act.length) listEl.appendChild(h('div', { class: 'empty' }, [icon('check'), 'No hay alarmas ni avisos activos.']));
            act.forEach(a => {
              const d = a.def;
              listEl.appendChild(h('div', { class: 'alarm ' + d.sev + (a.acked ? '' : ' unacked') }, [
                h('div', { class: 'al-bar' }),
                h('div', {}, [
                  h('div', { class: 'al-title', text: d.title }),
                  h('div', { class: 'al-meta', text: d.stName + ' · ' + (d.sev === 'bad' ? 'Alarma' : d.sev === 'warn' ? 'Aviso' : 'Información') + (a.detail ? ' · ' + a.detail : '') }),
                  h('div', { class: 'al-help', text: d.help })
                ]),
                h('div', { class: 'al-time' }, [XL.fmtTime(a.since), h('br'), (() => { const d = h('span', { text: XL.fmtDuration(Date.now() - a.since) }); durs.push({ d, since: a.since }); return d; })()])
              ]));
            });
          }
          durs.forEach(x => txt(x.d, XL.fmtDuration(Date.now() - x.since)));
          const hist = app.alarms.history;
          if (hist.length !== lastHist) {
            lastHist = hist.length;
            histBody.textContent = '';
            hist.slice().reverse().slice(0, 400).forEach(e => histBody.appendChild(h('tr', {}, [
              h('td', { class: 'num', text: XL.fmtDateTime(e.t) }), h('td', { text: e.st }),
              h('td', {}, [h('span', { class: 'chip ' + (e.on ? (e.sev === 'bad' ? 'bad' : e.sev === 'warn' ? 'warn' : 'info') : 'ok'), text: e.on ? 'Aparece' : 'Se resuelve' })]),
              h('td', { text: e.title }), h('td', { class: 'num', text: e.dur ? XL.fmtDuration(e.dur) : '' })
            ])));
            if (!hist.length) histBody.appendChild(h('tr', {}, [h('td', { colspan: 5, class: 'muted', text: 'Sin eventos registrados.' })]));
          }
        }
      };
    }
  };

  // ======================================================================== PRODUCCION
  const produccion = {
    id: 'produccion', title: 'Producción', sub: 'Contadores por destino y ritmo de la sesión', icon: 'chart', group: 'Operación',
    mount(root, app) {
      const keys = [['c1', 'Carril 1', 'metal / metal'], ['c2', 'Carril 2', 'blanca / plástico'], ['c3', 'Carril 3', 'blanca / metal'], ['robot', 'Brazo', 'tipos 4 y 5'], ['total', 'Total', 'piezas terminadas']];
      const vals = {};
      const lanes = h('div', { class: 'lane-cards' }, keys.map(([k, l, sub]) => {
        const v = h('div', { class: 'lc-v', text: '—' }); vals[k] = v;
        return h('div', { class: 'lane-card' }, [v, h('div', { class: 'lc-l', text: l }), h('div', { class: 'faint', style: { fontSize: '12px' }, text: sub })]);
      }));
      const canvas = h('canvas', { class: 'chart' });
      const rate = ui.kv([['rate', 'Ritmo (últimos 15 min)'], ['session', 'Piezas en esta sesión'], ['since', 'Sesión iniciada'], ['avg', 'Tiempo medio por pieza']]);
      root.append(
        head(app, this, [btn('Poner contadores a cero', 'reset', 'sm', async () => {
          if (await XL.confirmDialog({ title: 'Poner a cero los contadores del PLC 1', text: 'Se borran los contadores de los 3 carriles, del Brazo y el total (VW1182..VW1190).', danger: true, ok: 'Poner a cero' })) { app.pulse(CMD.RESET_CNT, 'Contadores a cero', { quiet: true }); app.prod.resetSession(); }
        })]),
        lanes,
        h('div', { class: 'grid g-main', style: { marginTop: '16px' } }, [
          ui.card('Piezas por intervalo de 5 minutos', 'últimas 2 horas', h('div', {}, [canvas, h('div', { class: 'legend' }, [h('span', {}, [h('i', { style: { background: 'var(--accent)' } }), 'Piezas terminadas'])])])),
          ui.card('Sesión', null, rate.el)
        ]),
        h('div', { style: { marginTop: '16px' } }, [ui.card('Matriz de clasificación', null, pieceMatrix())])
      );
      let lastDraw = 0;
      return {
        update(m) {
          keys.forEach(([k]) => txt(vals[k], fmt(m.count[k])));
          const r = app.prod.rate();
          rate.set('rate', r === null ? 'calculando…' : fmt(r, 0) + ' piezas/h');
          rate.set('session', fmt(app.prod.sessionCount()));
          rate.set('since', XL.fmtTime(app.prod.start));
          const avg = app.prod.avgCycle();
          rate.set('avg', avg ? fmt(avg / 1000, 1) + ' s' : '—');
          if (Date.now() - lastDraw > 2000) { lastDraw = Date.now(); app.prod.drawChart(canvas); }
        }
      };
    }
  };

  // ======================================================================== DIAGNOSTICO
  const diagnostico = {
    id: 'diagnostico', title: 'Diagnóstico', sub: 'Red PPI, baliza, tiempos neumáticos y bytes de estado', icon: 'pulse', group: 'Ingeniería',
    mount(root, app) {
      const nodes = [[1, 'Transporte (maestro)'], [2, 'Alimentación'], [3, 'Ensamblaje'], [4, 'Procesamiento'], [5, 'Selección'], [6, 'Brazo 4-DOF']].map(([n, name]) => {
        const l = ui.ledEl('ok'); const t = h('span', { class: 'muted', text: '' });
        return { n, l, t, el: h('div', { class: 'io-row' }, [l, h('span', { class: 'io-addr', text: 'PLC ' + n }), h('span', { class: 'io-name', text: name }), t]) };
      });
      const beaconRows = ui.reasons();
      const red = ui.reasons();
      const dt = ui.dtPanel(model.DT_DEF);
      const bytes = [
        ['Transporte VW1020 (celda)', m => m.img.vb(1021)], ['Transporte VW1040 (alarmas)', m => m.tAlarm], ['Transporte banderas VB1210', m => m.T.flags],
        ['Espera del automático VB287', m => m.waitBits], ['Causa de baliza roja VB292', m => m.redCause], ['Enlace Brazo VB286', m => m.robotLink],
        ['Alimentación VB200', m => m.A.stat], ['Ensamblaje VB200', m => m.E.stat], ['Ensamblaje VB337 (espera)', m => m.E.diag],
        ['Procesamiento VB200', m => m.P.stat], ['Selección VB200', m => m.S.stat], ['Selección VB210 (modo)', m => m.S.modeByte],
        ['Brazo VB200', m => m.R.stat], ['Nodos sin red VB710', m => m.nodesDown]
      ].map(([label, get]) => { const b = ui.bitsView(); const v = h('span', { class: 'mono muted' }); return { get, b, v, el: h('div', { class: 'io-row' }, [h('span', { class: 'io-name', text: label }), v, b.el]) }; });
      const demoCard = ui.card('Simulador', 'solo en modo demostración', h('div', { class: 'btn-row' }, [
        btn('Atasco en Ensamblaje', null, 'sm', () => app.sim && app.sim.inject('E')),
        btn('Atasco en Procesamiento', null, 'sm', () => app.sim && app.sim.inject('P')),
        btn('Brazo sin red', null, 'sm', () => app.sim && app.sim.inject('net6')),
        btn('Seta en Transporte', null, 'sm', () => app.sim && app.sim.inject('qsT'))
      ]));
      root.append(
        head(app, this),
        h('div', { class: 'grid g-3' }, [
          ui.card('Red PPI', 'el PLC 1 lee y escribe a cada estación', h('div', {}, nodes.map(n => n.el))),
          ui.card('Baliza de planta', 'sobre Ensamblaje', beaconRows.el),
          ui.card('¿Por qué está roja?', 'VB292 del PLC 1', red.el)
        ]),
        h('div', { class: 'grid g-2', style: { marginTop: '16px' } }, [
          ui.card('Tiempos neumáticos de Transporte', 'alerta de fuga y atasco', dt.el),
          ui.card('Bytes de estado', 'vista experta (bit 7 … bit 0)', h('div', {}, bytes.map(b => b.el)))
        ]),
        h('div', { style: { marginTop: '16px' } }, [demoCard])
      );
      return {
        update(m) {
          nodes.forEach(n => {
            const down = n.n === 1 ? false : bit(m.nodesDown, n.n);
            ui.setLed(n.l, true, down ? 'bad' : 'ok');
            txt(n.t, down ? 'sin respuesta' : 'comunicando');
          });
          const b = m.beacon, li = [];
          if (bit(b, 4)) li.push({ kind: 'bad', blink: true, text: 'Roja intermitente: seta pulsada en alguna estación' });
          if (bit(b, 3)) li.push({ kind: 'bad', text: 'Roja fija: alarma en la celda' });
          if (bit(b, 0)) li.push({ kind: 'ok', text: 'Verde: produciendo en Automático' });
          if (bit(b, 2)) li.push({ kind: 'warn', blink: true, text: 'Amarilla intermitente: pausa, fuga o silo vacío' });
          if (bit(b, 1)) li.push({ kind: 'warn', text: 'Amarilla fija: celda detenida o Transporte en Manual' });
          beaconRows.update(li);
          const rc = [];
          for (let i = 0; i < 8; i++) if (bit(m.redCause, i)) rc.push({ kind: 'bad', text: model.RED_CAUSE[i] });
          red.update(rc.length ? rc : [{ kind: 'ok', text: 'Ninguna causa de roja activa' }]);
          dt.update(m.dt);
          bytes.forEach(x => { const v = x.get(m); x.b.update(v); txt(x.v, String(v).padStart(3, ' ') + '  '); });
          cls(demoCard, 'hidden', app.mode !== 'demo');
        }
      };
    }
  };

  // ======================================================================== CONFIGURACION
  const configuracion = {
    id: 'configuracion', title: 'Configuración', sub: 'Cotas del carro, parámetros, variador, comunicación y apariencia', icon: 'gear', group: 'Ingeniería',
    mount(root, app) {
      const cotaDefs = [['A', 1110, 'Alimentación', 'Sobre el inductivo de Home (normalmente 0)'], ['P', 1114, 'Procesamiento', 'Mordaza de la prensa'], ['E', 1118, 'Ensamblaje', 'Nido de ensamble'], ['S', 1122, 'Selección', 'Entrada de la cinta']];
      const posT = h('b', { text: '—' });
      const cotaRows = cotaDefs.map(([k, addr, name, hint]) => paramRow({
        app, name, hint, addr, unit: 'p', min: -1000, max: 116000, get: m => m.cotas[k],
        extra: (input) => btn('Usar posición actual', 'target', 'sm ghost', () => { if (app.last) { input.value = app.last.pos; input.dispatchEvent(new Event('input')); } }, 'Copia la posición actual del carro en el campo')
      }));
      const paramRows = [
        paramRow({ app, name: 'Pulsos por toque de jog', hint: 'Jog de calibración en Manual (VD280)', addr: 1002, unit: 'p', min: 1, max: 20000, get: m => m.params.jog }),
        paramRow({ app, name: 'Rebote en el final de carrera derecho', hint: 'Retroceso al tocar el FC derecho llegando a Selección (VD288)', addr: 1006, unit: 'p', min: 0, max: 10000, get: m => m.params.rebote }),
        paramRow({ app, name: 'Retroceso del homing', hint: 'Antes de la aproximación lenta a I0.0 (VD240)', addr: 1010, unit: 'p', min: 500, max: 20000, get: m => m.params.homingBack })
      ];
      const modeSeg = ui.segmented([[1, 'Modo 1 · Analógico'], [2, 'Modo 2 · Modbus']], v => app.setVfdMode(v));
      const dirSeg = ui.segmented([[1, 'Forward'], [2, 'Reverse']], v => app.setBeltDir(v));
      const st = app.settings;
      const sel = (opts, value, onchange) => h('select', { class: 'input', onchange }, opts.map(([v, l]) => h('option', { value: v, text: l, selected: String(v) === String(value) ? 'selected' : false })));
      const comm = h('div', { class: 'grid g-2' }, [
        field('Dirección Modbus del PLC 1', h('input', { class: 'input', type: 'number', min: 1, max: 247, value: st.slave, onchange: e => app.saveSettings({ slave: +e.target.value || 1 }) }), 'Por defecto 1'),
        field('Velocidad', sel([[9600, '9600 bps'], [19200, '19200 bps'], [38400, '38400 bps']], st.baud, e => app.saveSettings({ baud: +e.target.value })), 'El PLC 1 usa 19200'),
        field('Paridad', sel([['none', 'Ninguna (8-N-1)'], ['even', 'Par (8-E-1)'], ['odd', 'Impar (8-O-1)']], st.parity, e => app.saveSettings({ parity: e.target.value })), 'El PLC 1 usa 8-N-1'),
        field('Intervalo de lectura', sel([[100, '0,1 s'], [200, '0,2 s'], [400, '0,4 s'], [800, '0,8 s']], st.poll, e => app.saveSettings({ poll: +e.target.value })), 'Pausa entre ciclos de lectura'),
        field('Tiempo de espera', sel([[300, '0,3 s'], [450, '0,45 s'], [700, '0,7 s'], [1000, '1 s']], st.timeout, e => app.saveSettings({ timeout: +e.target.value })), 'Respuesta máxima del PLC'),
        field('Tema', sel([['auto', 'Automático (sistema)'], ['light', 'Claro'], ['dark', 'Oscuro']], st.theme, e => app.saveSettings({ theme: e.target.value })), 'Colores de la interfaz')
      ]);
      root.append(
        head(app, this),
        callout('info', 'Los cambios se escriben en la memoria V del PLC 1', 'El PLC valida cada valor: si está fuera de rango lo rechaza y el campo vuelve al valor vigente. Para que sobrevivan a un apagado, la memoria V debe estar en el rango retentivo (o en el bloque de datos).'),
        h('div', { class: 'grid g-2', style: { marginTop: '16px' } }, [
          ui.card('Cotas del carro de Transporte', null, h('div', { class: 'stack', style: { gap: '4px' } }, [
            h('p', { class: 'muted', style: { margin: '0 0 6px' } }, ['Posición actual: ', posT, ' pulsos. Para calibrar: en Manual, lleve el carro con el jog hasta la estación y pulse «Usar posición actual».'])
          ].concat(cotaRows.map(r => r.el)))),
          h('div', { class: 'stack' }, [
            ui.card('Parámetros de Transporte', null, h('div', {}, paramRows.map(r => r.el))),
            ui.card('Variador de la cinta', 'se aplica con la cinta detenida', h('div', { class: 'stack', style: { gap: '12px' } }, [
              h('div', { class: 'field' }, [h('label', { text: 'Modo de mando' }), modeSeg.el]),
              h('div', { class: 'field' }, [h('label', { text: 'Sentido de giro' }), dirSeg.el])
            ]))
          ])
        ]),
        h('div', { style: { marginTop: '16px' } }, [ui.card('Comunicación y apariencia', 'se guardan en este navegador; la comunicación se aplica al reconectar', comm)])
      );
      return {
        update(m) {
          txt(posT, fmt(m.pos) + (m.T.homed ? '' : ' (sin referencia)'));
          cotaRows.concat(paramRows).forEach(r => r.update(m));
          const busy = !app.canWrite();
          modeSeg.update(m.S.mode, busy); dirSeg.update(m.S.rev ? 2 : 1, busy);
        }
      };
    }
  };

  function field(label, input, hint) {
    return h('div', { class: 'field' }, [h('label', { text: label }), input, hint ? h('small', { text: hint }) : null]);
  }

  // Fila editable de un DINT del PLC 1 con validacion y confirmacion
  function paramRow(o) {
    const input = h('input', { class: 'input', type: 'number', min: o.min, max: o.max, step: 1 });
    const cur = h('span', { class: 'muted num', text: '' });
    let editing = false;
    const save = h('button', { class: 'btn sm primary', text: 'Guardar', disabled: true });
    input.addEventListener('input', () => { editing = true; cls(input, 'changed', true); save.disabled = false; });
    input.addEventListener('focus', () => { editing = true; });
    input.addEventListener('blur', () => { if (!input.classList.contains('changed')) editing = false; });
    save.addEventListener('click', async () => {
      const v = Math.round(Number(input.value));
      if (!Number.isFinite(v) || v < o.min || v > o.max) { XL.toast('Valor fuera de rango (' + fmt(o.min) + ' a ' + fmt(o.max) + ')', 'bad'); return; }
      const old = o.app.last ? o.get(o.app.last) : null;
      const ok = await XL.confirmDialog({ title: 'Cambiar ' + o.name.toLowerCase(), text: 'De ' + (old === null ? '—' : fmt(old)) + ' a ' + fmt(v) + ' ' + o.unit + '. El PLC 1 lo aplica de inmediato.', ok: 'Escribir en el PLC' });
      if (!ok) return;
      try {
        await o.app.writeDint(o.addr, v);
        XL.toast(o.name + ': ' + fmt(v) + ' ' + o.unit, 'ok');
        cls(input, 'changed', false); save.disabled = true; editing = false;
      } catch (e) { XL.toast('No se pudo escribir: ' + e.message, 'bad'); }
    });
    const cancel = h('button', { class: 'btn sm ghost', text: 'Deshacer', onclick: () => { editing = false; cls(input, 'changed', false); save.disabled = true; } });
    const el = h('div', { class: 'field', style: { padding: '10px 0', borderBottom: '1px dashed var(--border)' } }, [
      h('label', {}, [o.name, ' ', cur]),
      h('div', { class: 'input-row', style: { flexWrap: 'wrap' } }, [input, h('span', { class: 'muted', text: o.unit }), save, cancel, o.extra ? o.extra(input) : null]),
      h('small', { text: o.hint + ' · rango ' + fmt(o.min) + ' a ' + fmt(o.max) })
    ]);
    return {
      el,
      update(m) {
        const v = o.get(m);
        txt(cur, '(vigente: ' + fmt(v) + ')');
        if (!editing && document.activeElement !== input) input.value = v;
        save.disabled = !input.classList.contains('changed') || !o.app.canWrite();
      }
    };
  }

  // ======================================================================== COMUNICACION
  const comunicacion = {
    id: 'comunicacion', title: 'Comunicación', sub: 'Enlace Modbus RTU con el PLC 1, registros y tramas', icon: 'plug', group: 'Ingeniería',
    mount(root, app) {
      const stats = ui.kv([['mode', 'Estado'], ['cfg', 'Parámetros'], ['tx', 'Tramas enviadas'], ['rx', 'Respuestas correctas'], ['crc', 'Errores de CRC'], ['to', 'Sin respuesta'], ['ex', 'Rechazadas por el PLC'], ['lat', 'Latencia de la última trama'], ['cycle', 'Ciclo de lectura'], ['life', 'Contador de vida del PLC 1']]);
      const filter = h('input', { class: 'input', placeholder: 'Filtrar (p. ej. 1120, 40061)', style: { maxWidth: '260px' } });
      const tbody = h('tbody');
      const rows = [];
      for (let k = 0; k < model.REG_COUNT; k++) {
        const cells = [h('td', { class: 'mono', text: String(40001 + k) }), h('td', { class: 'mono', text: 'VW' + (1000 + 2 * k) }), h('td', { class: 'mono num' }), h('td', { class: 'mono' }), h('td', { class: 'mono' })];
        const tr = h('tr', {}, cells);
        rows.push({ k, tr, cells });
        tbody.appendChild(tr);
      }
      filter.addEventListener('input', () => {
        const q = filter.value.trim();
        rows.forEach(r => cls(r.tr, 'hidden', q && !(String(40001 + r.k).includes(q) || String(1000 + 2 * r.k).includes(q))));
      });
      const log = h('div', { class: 'mono', style: { maxHeight: '320px', overflow: 'auto', whiteSpace: 'pre', fontSize: '12px', lineHeight: '1.6' } });
      root.append(
        head(app, this, [
          btn('Conectar PLC', 'plug', 'primary sm', () => app.connect()),
          btn('Modo demostración', 'demo', 'sm', () => app.startDemo()),
          btn('Desconectar', null, 'sm ghost', () => app.disconnect())
        ]),
        callout('info', 'Requisitos', 'Chrome o Edge en un PC · conversor USB-RS485 al Puerto 0 del PLC 1 (pin 3 = B/+, pin 8 = A/−) · selector físico del PLC 1 en RUN (en TERM el puerto es PPI y no responde a Modbus).'),
        h('div', { class: 'grid g-main', style: { marginTop: '16px' } }, [
          ui.card('Registros Modbus', '40001 = VW1000 · 128 registros', h('div', { class: 'stack', style: { gap: '10px' } }, [filter,
            h('div', { class: 'tbl-wrap' }, [h('table', { class: 'tbl' }, [h('thead', {}, h('tr', {}, ['Registro', 'Dirección V', 'Decimal', 'Hex', 'Binario'].map(t => h('th', { text: t })))), tbody])])])),
          h('div', { class: 'stack' }, [ui.card('Enlace', null, stats.el), ui.card('Últimas tramas', 'tx = enviada, rx = recibida', log)])
        ])
      );
      let lastLog = 0;
      return {
        update(m) {
          const c = app.client;
          const s = c ? c.stats : null;
          stats.set('mode', { serial: 'Conectado por puerto serie', demo: 'Modo demostración', linked: 'Ventana enlazada', off: 'Desconectado' }[app.mode]);
          stats.set('cfg', app.settings.slave + ' · ' + app.settings.baud + ' bps · ' + ({ none: '8-N-1', even: '8-E-1', odd: '8-O-1' }[app.settings.parity]));
          stats.set('tx', s ? fmt(s.tx) : '—'); stats.set('rx', s ? fmt(s.rx) : '—'); stats.set('crc', s ? fmt(s.crc) : '—');
          stats.set('to', s ? fmt(s.timeouts) : '—'); stats.set('ex', s ? fmt(s.exceptions) : '—');
          stats.set('lat', s ? s.latency + ' ms' : '—'); stats.set('cycle', app.cycleMs ? app.cycleMs + ' ms' : '—');
          stats.set('life', String(m.life));
          rows.forEach(r => {
            if (r.tr.classList.contains('hidden')) return;
            const v = m.img.reg(r.k);
            txt(r.cells[2], String(v)); txt(r.cells[3], XL.hex(v, 4)); txt(r.cells[4], XL.bin(v >> 8) + ' ' + XL.bin(v & 0xFF));
          });
          if (c && Date.now() - lastLog > 1000) {
            lastLog = Date.now();
            log.textContent = c.frameLog.slice(-30).reverse().map(f => XL.fmtTime(f.t) + '  ' + f.dir + '  ' + f.hex + (f.note ? '   ← ' + f.note : '')).join('\n');
          }
        }
      };
    }
  };

  XL.pages = [planta, alarmas, produccion, transporte, alimentacion, procesamiento, ensamblaje, seleccion, brazo, diagnostico, configuracion, comunicacion];
})(window.XL);
