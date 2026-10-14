/* =============================================================================
   SCADA XL-335B - Dibujos 2D (SVG) de la planta y de cada unidad
   Cada vista devuelve { el, update(m) }. Las posiciones salen de los sensores reales
   (no de una simulacion): si un cilindro no confirma ninguna posicion se dibuja a medio
   camino. Los colores usan las variables CSS del tema.
   ============================================================================= */
'use strict';

(function (XL) {
  const { s, attr, txt, bit } = XL;
  let uid = 0;

  // -------------------------------------------------------------- utilidades
  function led(x, y, r) { return s('circle', { cx: x, cy: y, r: r || 6, class: 'sv-off' }); }
  function setLed(c, on, kind) { attr(c, 'class', on ? 'sv-led-on sv-' + (kind || 'ok') : 'sv-off'); }
  function show(el, on) { attr(el, 'visibility', on ? 'visible' : 'hidden'); }
  function move(el, x, y) { const v = 'translate(' + (x || 0) + 'px,' + (y || 0) + 'px)'; if (el.style.transform !== v) el.style.transform = v; }
  function rotate(el, deg, cx, cy) {
    el.style.transformOrigin = cx + 'px ' + cy + 'px';
    const v = 'rotate(' + deg + 'deg)';
    if (el.style.transform !== v) el.style.transform = v;
  }
  function text(x, y, value, cls, anchor) { return s('text', { x, y, class: cls || 'sv-m', 'text-anchor': anchor || 'start', text: value }); }
  function shorten(str, n) { return str && str.length > n ? str.slice(0, n - 1) + '…' : (str || ''); }
  function svg(w, hgt, cls) { return s('svg', { viewBox: '0 0 ' + w + ' ' + hgt, class: 'canvas ' + (cls || ''), role: 'img' }); }
  function kindClass(kind) { return { ok: 'sv-ok', run: 'sv-run', warn: 'sv-warn', bad: 'sv-bad', idle: 'sv-idle' }[kind] || 'sv-idle'; }
  function pieceClass(k) { return { metal: 'sv-metal', white: 'sv-white', black: 'sv-black' }[k] || 'sv-unknown'; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // ============================================================== PLANTA
  function plantView(onOpen) {
    const W = 1240, H = 430;
    const root = svg(W, H);
    const posX = p => 110 + clamp(p, -1000, 116000) * 770 / 107500;
    root.appendChild(s('rect', { x: 1, y: 1, width: W - 2, height: H - 2, rx: 18, class: 'sv-floor' }));
    // riel del carro
    root.appendChild(s('rect', { x: 62, y: 350, width: 880, height: 12, rx: 6, class: 'sv-rail' }));
    for (let x = 80; x < 940; x += 24) root.appendChild(s('line', { x1: x, y1: 352, x2: x, y2: 360, class: 'sv-line', opacity: .5 }));
    root.appendChild(text(62, 392, 'Riel de Transporte', 'sv-m'));
    const posLabel = text(940, 392, '', 'sv-m', 'end');
    root.appendChild(posLabel);

    const boxes = {};
    const centers = { A: 110, P: 436, E: 737, S: 900 };
    const cotaKey = { A: 'A', P: 'P', E: 'E', S: 'S' };
    const names = { A: 'Alimentación', P: 'Procesamiento', E: 'Ensamblaje', S: 'Selección' };
    for (const id of ['A', 'P', 'E', 'S']) {
      const cx = centers[id], bx = cx - 75, by = 108;
      const g = s('g', { class: 'sv-click', onclick: () => onOpen(id) });
      g.appendChild(s('rect', { x: bx, y: by, width: 150, height: 176, rx: 14, class: 'sv-card' }));
      const bar = s('rect', { x: bx, y: by, width: 150, height: 7, rx: 3.5, class: 'sv-idle' });
      g.appendChild(bar);
      g.appendChild(text(bx + 12, by + 28, names[id], 'sv-t'));
      const pic = s('g', { transform: 'translate(' + bx + ',' + by + ')' });
      g.appendChild(pic);
      const stepT = text(bx + 12, by + 146, '', 'sv-m');
      const dot = s('circle', { cx: bx + 17, cy: by + 162, r: 5, class: 'sv-idle' });
      const stT = text(bx + 28, by + 166, '', 'sv-t');
      const modeC = s('circle', { cx: bx + 134, cy: by + 23, r: 10, class: 'sv-soft' });
      const modeT = text(bx + 134, by + 27, '', 'sv-s', 'middle');
      const modeTip = s('title', { text: '' });
      modeC.appendChild(modeTip);
      g.append(stepT, dot, stT, modeC, modeT);
      root.appendChild(g);
      const drop = s('line', { x1: cx, y1: by + 176, x2: cx, y2: 350, class: 'sv-dash' });
      root.appendChild(drop);
      const cotaT = text(cx + 5, 342, '', 'sv-s');
      root.appendChild(cotaT);
      boxes[id] = { g, bar, pic: buildPictogram(id, pic), stepT, dot, stT, modeT, modeTip, drop, cotaT };
    }

    // cinta de Seleccion, carriles y Brazo
    const beltX0 = 975, beltX1 = 1205;
    root.appendChild(s('rect', { x: beltX0, y: 186, width: beltX1 - beltX0, height: 28, rx: 8, class: 'sv-belt' }));
    const beltLines = s('g');
    for (let x = beltX0 + 8; x < beltX1; x += 18) beltLines.appendChild(s('line', { x1: x, y1: 189, x2: x - 6, y2: 211, class: 'sv-belt-line' }));
    root.appendChild(beltLines);
    const laneX = [2737, 4322, 5945].map(c => beltX0 + (beltX1 - beltX0) * c / 7769);
    const lanes = laneX.map((x, i) => {
      const chute = s('path', { d: `M${x - 13} 214 L${x + 13} 214 L${x + 19} 262 L${x - 19} 262 Z`, class: 'sv-soft' });
      const t = text(x, 282, '', 'sv-m', 'middle');
      const lbl = text(x, 300, 'C' + (i + 1), 'sv-s', 'middle');
      root.append(chute, t, lbl);
      return { chute, t };
    });
    const robotG = s('g', { class: 'sv-click', onclick: () => onOpen('R') });
    robotG.appendChild(s('rect', { x: 1150, y: 60, width: 80, height: 112, rx: 12, class: 'sv-card' }));
    robotG.appendChild(s('rect', { x: 1178, y: 128, width: 24, height: 16, rx: 3, class: 'sv-steel' }));
    const robotArm = s('path', { d: 'M1190 128 L1172 104 L1198 92', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: { stroke: 'var(--steel)', strokeWidth: '5px' } });
    robotG.appendChild(robotArm);
    robotG.appendChild(text(1190, 80, 'Brazo', 'sv-t', 'middle'));
    const robotDot = s('circle', { cx: 1160, cy: 158, r: 5, class: 'sv-idle' });
    const robotSt = text(1169, 162, '', 'sv-s');
    robotG.append(robotDot, robotSt);
    root.appendChild(robotG);
    const robotT = text(1190, 330, '', 'sv-m', 'middle');
    root.appendChild(robotT);
    root.appendChild(text(1090, 240 + 82, 'Cinta de Selección', 'sv-s', 'middle'));

    // baliza de planta (fisicamente sobre Ensamblaje)
    const bcx = 800;
    root.appendChild(s('rect', { x: bcx - 2, y: 34, width: 4, height: 74, class: 'sv-steel' }));
    root.appendChild(s('rect', { x: bcx - 13, y: 24, width: 26, height: 66, rx: 8, class: 'sv-card' }));
    const lamps = [['r', 37], ['y', 57], ['g', 77]].map(([c, y]) => {
      const l = s('circle', { cx: bcx, cy: y, r: 7, class: 'sv-lamp-off' });
      root.appendChild(l);
      return { c, l };
    });
    root.appendChild(text(bcx + 20, 50, 'Baliza', 'sv-s'));

    // carro
    const cart = s('g', { class: 'sv-move' });
    cart.appendChild(s('rect', { x: -38, y: 326, width: 76, height: 24, rx: 7, class: 'sv-card', 'stroke-width': 2 }));
    cart.appendChild(s('circle', { cx: -22, cy: 352, r: 5, class: 'sv-steel' }));
    cart.appendChild(s('circle', { cx: 22, cy: 352, r: 5, class: 'sv-steel' }));
    cart.appendChild(s('rect', { x: -4, y: 296, width: 8, height: 30, class: 'sv-steel' }));
    const jawL = s('rect', { x: -14, y: 286, width: 6, height: 14, rx: 2, class: 'sv-steel' });
    const jawR = s('rect', { x: 8, y: 286, width: 6, height: 14, rx: 2, class: 'sv-steel' });
    const cartPiece = s('circle', { cx: 0, cy: 291, r: 8, class: 'sv-unknown' });
    cart.append(cartPiece, jawL, jawR);
    const cartAccent = s('rect', { x: -38, y: 326, width: 76, height: 4, rx: 2, class: 'sv-accent' });
    cart.appendChild(cartAccent);
    root.appendChild(cart);

    function update(m) {
      move(cart, posX(m.pos), 0);
      txt(posLabel, 'Posición del carro: ' + XL.fmt(m.pos) + ' p' + (m.T.homed ? '' : ' (sin referencia)'));
      show(cartPiece, m.T.gripClosed);
      attr(cartPiece, 'class', m.pieceType === 5 ? 'sv-black' : 'sv-unknown');
      move(jawL, m.T.gripClosed ? 2 : 0, 0); move(jawR, m.T.gripClosed ? -2 : 0, 0);
      attr(cartAccent, 'class', m.T.travelling || m.T.maneuvering ? 'sv-accent' : m.T.homed ? 'sv-ok' : 'sv-warn');
      for (const id of ['A', 'P', 'E', 'S']) {
        const b = boxes[id], st = m.st[id];
        attr(b.bar, 'class', kindClass(st.kind));
        attr(b.dot, 'class', kindClass(st.kind) + (st.blink ? ' sv-blink' : ''));
        txt(b.stT, st.label);
        txt(b.stepT, shorten(st.step, 20));
        txt(b.modeT, st.online ? (st.auto ? 'A' : 'M') : '');
        txt(b.modeTip, st.online ? (st.auto ? 'Automático' : 'Manual') : 'Sin red');
        attr(b.drop, 'x2', posX(m.cotas[cotaKey[id]]));
        attr(b.cotaT, 'x', posX(m.cotas[cotaKey[id]]) + 5);
        txt(b.cotaT, XL.fmt(m.cotas[cotaKey[id]]));
        b.pic.update(m);
      }
      const running = m.S.online && m.S.freq > 0.5;
      attr(beltLines, 'opacity', running ? 1 : .5);
      if (running) beltLines.style.transform = 'translateX(' + ((Date.now() / 40 * m.S.freq / 30) % 18) + 'px)';
      lanes.forEach((ln, i) => {
        attr(ln.chute, 'class', m.S.lane === i + 1 && m.S.step >= 20 && m.S.step < 60 ? 'sv-accent' : 'sv-soft');
        txt(ln.t, XL.fmt([m.count.c1, m.count.c2, m.count.c3][i]));
      });
      const rs = m.st.R;
      attr(robotDot, 'class', kindClass(rs.kind));
      txt(robotSt, shorten(rs.label, 11));
      txt(robotT, 'Brazo: ' + XL.fmt(m.count.robot) + ' piezas');
      const b = m.beacon;
      lamps.forEach(({ c, l }) => {
        const on = c === 'r' ? bit(b, 3) || bit(b, 4) : c === 'y' ? bit(b, 1) || bit(b, 2) : bit(b, 0);
        const blink = (c === 'r' && bit(b, 4)) || (c === 'y' && bit(b, 2));
        attr(l, 'class', on ? 'sv-lamp-' + c + (blink ? ' sv-blink' : '') : 'sv-lamp-off');
      });
    }
    return { el: root, update };
  }

  // Pictogramas pequenos dentro de cada caja de la planta
  function buildPictogram(id, g) {
    if (id === 'A') {
      g.appendChild(s('rect', { x: 34, y: 38, width: 30, height: 74, rx: 4, class: 'sv-glass' }));
      const pcs = [0, 1, 2, 3].map(i => { const r = s('rect', { x: 37, y: 94 - i * 16, width: 24, height: 14, rx: 3, class: 'sv-unknown' }); g.appendChild(r); return r; });
      g.appendChild(s('rect', { x: 74, y: 108, width: 52, height: 8, rx: 3, class: 'sv-steel-l' }));
      const cradle = s('rect', { x: 86, y: 92, width: 28, height: 16, rx: 4, class: 'sv-unknown' });
      g.appendChild(cradle);
      return {
        update(m) {
          const A = m.A, n = !A.online ? 0 : bit(A.ib0, 5) ? 4 : bit(A.ib0, 6) ? 2 : 0;
          pcs.forEach((r, i) => show(r, i < n));
          show(cradle, A.online && bit(A.ib0, 4));
          attr(cradle, 'class', A.data === 1 || bit(A.ib0, 7) ? 'sv-metal' : 'sv-white');
        }
      };
    }
    if (id === 'P') {
      g.appendChild(s('rect', { x: 46, y: 36, width: 58, height: 10, rx: 3, class: 'sv-steel' }));
      g.appendChild(s('rect', { x: 46, y: 36, width: 8, height: 78, class: 'sv-steel-l' }));
      g.appendChild(s('rect', { x: 96, y: 36, width: 8, height: 78, class: 'sv-steel-l' }));
      const ram = s('g', { class: 'sv-fast' });
      ram.appendChild(s('rect', { x: 68, y: 46, width: 14, height: 22, class: 'sv-steel' }));
      ram.appendChild(s('rect', { x: 62, y: 66, width: 26, height: 6, rx: 2, class: 'sv-steel' }));
      g.appendChild(ram);
      g.appendChild(s('rect', { x: 40, y: 112, width: 90, height: 6, rx: 3, class: 'sv-steel-l' }));
      const cart = s('g', { class: 'sv-move' });
      const piece = s('rect', { x: 64, y: 92, width: 22, height: 18, rx: 4, class: 'sv-unknown' });
      cart.appendChild(s('rect', { x: 58, y: 104, width: 34, height: 8, rx: 2, class: 'sv-steel' }));
      cart.appendChild(piece);
      g.appendChild(cart);
      return {
        update(m) {
          const P = m.P;
          move(ram, 0, bit(P.ib0, 5) ? 18 : bit(P.ib0, 4) ? 0 : 9);
          move(cart, bit(P.ib0, 3) ? 0 : bit(P.ib0, 2) ? 40 : 20, 0);
          show(piece, P.online && bit(P.ib0, 0));
        }
      };
    }
    if (id === 'E') {
      g.appendChild(s('rect', { x: 22, y: 36, width: 22, height: 40, rx: 4, class: 'sv-glass' }));
      const plate = s('g', { class: 'sv-move' });
      plate.appendChild(s('rect', { x: 26, y: 92, width: 72, height: 8, rx: 4, class: 'sv-steel-l' }));
      plate.appendChild(s('circle', { cx: 33, cy: 96, r: 10, class: 'sv-card' }));
      plate.appendChild(s('circle', { cx: 91, cy: 96, r: 10, class: 'sv-card' }));
      plate.appendChild(s('circle', { cx: 33, cy: 86, r: 2.5, class: 'sv-accent' }));
      g.appendChild(plate);
      const coreS = s('circle', { cx: 33, cy: 96, r: 5, class: 'sv-core' });
      const coreG = s('circle', { cx: 91, cy: 96, r: 5, class: 'sv-core' });
      g.append(coreS, coreG);
      g.appendChild(s('rect', { x: 86, y: 52, width: 46, height: 5, rx: 2, class: 'sv-steel-l' }));
      g.appendChild(s('circle', { cx: 124, cy: 98, r: 13, class: 'sv-card' }));
      const piece = s('circle', { cx: 124, cy: 98, r: 9, class: 'sv-white' });
      g.appendChild(piece);
      const head = s('g', { class: 'sv-move' });
      head.appendChild(s('rect', { x: 84, y: 46, width: 14, height: 16, rx: 3, class: 'sv-steel' }));
      g.appendChild(head);
      return {
        update(m) {
          const E = m.E;
          rotate(plate, bit(E.ib1, 2) ? 180 : bit(E.ib1, 1) ? 0 : 90, 62, 96);
          show(coreS, E.online && bit(E.ib0, 2));
          show(coreG, E.online && bit(E.ib0, 3));
          const present = E.online && (bit(E.ib0, 4) || (E.step >= 10 && E.data === 5));
          show(piece, present);
          attr(piece, 'class', E.data === 5 ? 'sv-black' : 'sv-white');
          move(head, bit(E.ib1, 7) ? 33 : bit(E.ib1, 6) ? 0 : 16, bit(E.ib1, 4) ? 10 : 0);
        }
      };
    }
    // Seleccion
    g.appendChild(s('rect', { x: 16, y: 84, width: 134, height: 24, rx: 6, class: 'sv-belt' }));
    const piece = s('circle', { cx: 36, cy: 96, r: 8, class: 'sv-unknown' });
    g.appendChild(piece);
    const sensor = s('circle', { cx: 36, cy: 72, r: 5, class: 'sv-off' });
    g.appendChild(sensor);
    const arrow = text(78, 64, '', 'sv-s', 'middle');
    g.appendChild(arrow);
    return {
      update(m) {
        const S = m.S;
        show(piece, S.online && bit(S.ib0, 3));
        setLed(sensor, S.online && bit(S.ib0, 3), 'run');
        txt(arrow, S.online && S.freq > 0.5 ? XL.fmt(S.freq, 1) + ' Hz' : '');
      }
    };
  }

  // ============================================================== TRANSPORTE: RIEL
  function railView() {
    const W = 920, H = 250;
    const root = svg(W, H);
    const posX = p => 70 + clamp(p, -1000, 116000) * 730 / 107500;
    root.appendChild(s('rect', { x: 1, y: 1, width: W - 2, height: H - 2, rx: 16, class: 'sv-floor' }));
    root.appendChild(s('rect', { x: 40, y: 190, width: 850, height: 14, rx: 7, class: 'sv-rail' }));
    const fcL = s('rect', { x: 22, y: 176, width: 12, height: 40, rx: 3, class: 'sv-off' });
    const fcR = s('rect', { x: 896, y: 176, width: 12, height: 40, rx: 3, class: 'sv-off' });
    root.append(fcL, fcR, text(28, 232, 'FC izq.', 'sv-s', 'middle'), text(902, 232, 'FC der.', 'sv-s', 'middle'));
    const home = s('path', { d: 'M62 220 L78 220 L70 208 Z', class: 'sv-off' });
    root.append(home, text(70, 236, 'Home', 'sv-s', 'middle'));
    const marks = {};
    const labels = { A: 'Alimentación', P: 'Procesamiento', E: 'Ensamblaje', S: 'Selección' };
    for (const id of ['A', 'P', 'E', 'S']) {
      const line = s('line', { x1: 0, y1: 56, x2: 0, y2: 188, class: 'sv-dash' });
      const name = text(0, 30, labels[id], 'sv-t', 'middle');
      const val = text(0, 47, '', 'sv-s', 'middle');
      root.append(line, name, val);
      marks[id] = { line, name, val };
    }
    const cart = s('g', { class: 'sv-move' });
    cart.appendChild(s('rect', { x: -44, y: 156, width: 88, height: 30, rx: 8, class: 'sv-card', 'stroke-width': 2 }));
    cart.appendChild(s('circle', { cx: -26, cy: 190, r: 6, class: 'sv-steel' }));
    cart.appendChild(s('circle', { cx: 26, cy: 190, r: 6, class: 'sv-steel' }));
    const mast = s('rect', { x: -5, y: 104, width: 10, height: 52, class: 'sv-steel' });
    const piece = s('circle', { cx: 0, cy: 96, r: 11, class: 'sv-unknown' });
    const stripe = s('rect', { x: -44, y: 156, width: 88, height: 5, rx: 2.5, class: 'sv-accent' });
    cart.append(mast, piece, stripe);
    root.appendChild(cart);
    const posT = text(0, 74, '', 'sv-t', 'middle');
    root.appendChild(posT);
    return {
      el: root,
      update(m) {
        const x = posX(m.pos);
        move(cart, x, 0);
        attr(posT, 'x', clamp(x, 90, 830));
        txt(posT, XL.fmt(m.pos) + ' p');
        show(piece, m.T.gripClosed);
        attr(piece, 'class', m.pieceType === 5 ? 'sv-black' : 'sv-unknown');
        attr(stripe, 'class', !m.T.homed ? 'sv-warn' : m.T.travelling ? 'sv-accent' : 'sv-ok');
        attr(fcL, 'class', bit(m.T.ib0, 1) ? 'sv-bad' : 'sv-off');
        attr(fcR, 'class', bit(m.T.ib0, 2) ? 'sv-bad' : 'sv-off');
        attr(home, 'class', bit(m.T.ib0, 0) ? 'sv-ok' : 'sv-off');
        for (const id in marks) {
          const mx = posX(m.cotas[id]);
          attr(marks[id].line, 'x1', mx); attr(marks[id].line, 'x2', mx);
          attr(marks[id].name, 'x', mx); attr(marks[id].val, 'x', mx);
          txt(marks[id].val, XL.fmt(m.cotas[id]) + ' p');
        }
      }
    };
  }

  // ============================================================== TRANSPORTE: MANIPULADOR
  function manipulatorView() {
    const root = svg(500, 250);
    root.appendChild(s('rect', { x: 1, y: 1, width: 498, height: 248, rx: 16, class: 'sv-floor' }));
    root.appendChild(s('rect', { x: 24, y: 212, width: 120, height: 18, rx: 4, class: 'sv-steel-l' }));
    root.appendChild(s('rect', { x: 66, y: 36, width: 16, height: 176, rx: 3, class: 'sv-steel' }));
    const slider = s('g', { class: 'sv-move' });
    slider.appendChild(s('rect', { x: 54, y: 64, width: 40, height: 34, rx: 6, class: 'sv-card', 'stroke-width': 2 }));
    const arm = s('rect', { x: 94, y: 76, width: 80, height: 10, rx: 3, class: 'sv-steel' });
    const grip = s('g', { class: 'sv-fast' });
    const jawT = s('rect', { x: 0, y: 58, width: 10, height: 16, rx: 2, class: 'sv-steel' });
    const jawB = s('rect', { x: 0, y: 88, width: 10, height: 16, rx: 2, class: 'sv-steel' });
    const piece = s('rect', { x: 2, y: 70, width: 22, height: 22, rx: 4, class: 'sv-unknown' });
    grip.append(s('rect', { x: -4, y: 66, width: 8, height: 30, rx: 2, class: 'sv-steel' }), piece, jawT, jawB);
    slider.append(arm, grip);
    root.appendChild(slider);
    const vT = text(312, 52, '', 'sv-t');
    const hT = text(312, 76, '', 'sv-t');
    const gT = text(312, 100, '', 'sv-t');
    root.append(text(312, 28, 'Leído por los sensores', 'sv-s'), vT, hT, gT);
    const pill = (x, label) => {
      const r = s('rect', { x, y: 192, width: 86, height: 30, rx: 15, class: 'sv-off' });
      const t = text(x + 43, 211, label, 'sv-s', 'middle');
      root.append(r, t);
      return { r, t };
    };
    const pB = pill(312, 'Bancada'), pC = pill(404, 'Cinta');
    root.appendChild(text(312, 180, 'Giro del manipulador', 'sv-s'));
    return {
      el: root,
      update(m) {
        const T = m.T;
        const up = bit(T.ib0, 4), down = bit(T.ib0, 3), ext = bit(T.ib0, 7), ret = bit(T.ib1, 0);
        move(slider, 0, down ? 92 : up ? 0 : 46);
        const len = ext ? 150 : ret ? 70 : 110;
        attr(arm, 'width', len);
        move(grip, 94 + len, 0);
        const closed = T.gripClosed;
        move(jawT, 4, closed ? 10 : 0); move(jawB, 4, closed ? -10 : 0);
        show(piece, closed);
        attr(piece, 'class', m.pieceType === 5 ? 'sv-black' : 'sv-unknown');
        txt(vT, 'Vertical: ' + (down ? 'abajo' : up ? 'arriba' : 'en movimiento'));
        txt(hT, 'Brazo: ' + (ext ? 'extendido' : ret ? 'retraído' : 'en movimiento'));
        txt(gT, 'Pinza: ' + (closed ? 'cerrada' : 'abierta'));
        attr(pB.r, 'class', bit(T.ib0, 6) ? 'sv-ok' : 'sv-off');
        attr(pC.r, 'class', bit(T.ib0, 5) ? 'sv-run' : 'sv-off');
        attr(pB.t, 'class', bit(T.ib0, 6) ? 'sv-pill-on' : 'sv-s');
        attr(pC.t, 'class', bit(T.ib0, 5) ? 'sv-pill-on' : 'sv-s');
      }
    };
  }

  // ============================================================== ALIMENTACION
  function feedView() {
    const root = svg(620, 290);
    root.appendChild(s('rect', { x: 1, y: 1, width: 618, height: 288, rx: 16, class: 'sv-floor' }));
    root.appendChild(s('line', { x1: 30, y1: 244, x2: 590, y2: 244, class: 'sv-line' }));
    root.appendChild(s('rect', { x: 190, y: 22, width: 64, height: 196, rx: 6, class: 'sv-glass' }));
    root.appendChild(text(222, 16, 'Silo de bases', 'sv-s', 'middle'));
    const pcs = [0, 1, 2, 3, 4, 5].map(i => { const r = s('rect', { x: 196, y: 188 - i * 28, width: 52, height: 26, rx: 5, class: 'sv-unknown' }); root.appendChild(r); return r; });
    const lvlHi = led(272, 62), lvlLo = led(272, 200);
    root.append(lvlHi, lvlLo, text(284, 66, 'Nivel alto (I0.5)', 'sv-s'), text(284, 204, 'Base abajo (I0.6)', 'sv-s'));
    // sujetador (derecha, a la altura de la segunda base)
    root.appendChild(s('rect', { x: 286, y: 150, width: 80, height: 20, rx: 4, class: 'sv-steel-l' }));
    const holdRod = s('rect', { x: 256, y: 155, width: 30, height: 10, rx: 3, class: 'sv-steel' });
    root.append(holdRod, text(326, 186, 'Sujetador', 'sv-s', 'middle'));
    // empujador (izquierda, abajo)
    root.appendChild(s('rect', { x: 40, y: 218, width: 110, height: 22, rx: 4, class: 'sv-steel-l' }));
    const pushG = s('g', { class: 'sv-move' });
    pushG.appendChild(s('rect', { x: 150, y: 224, width: 40, height: 10, rx: 3, class: 'sv-steel' }));
    pushG.appendChild(s('rect', { x: 186, y: 218, width: 8, height: 22, rx: 2, class: 'sv-steel' }));
    root.append(pushG, text(95, 262, 'Empujador', 'sv-s', 'middle'));
    // cuna
    root.appendChild(s('rect', { x: 430, y: 236, width: 130, height: 8, rx: 3, class: 'sv-steel' }));
    root.appendChild(text(495, 262, 'Cuna de salida', 'sv-s', 'middle'));
    const cradle = s('rect', { x: 462, y: 208, width: 64, height: 28, rx: 5, class: 'sv-white' });
    root.appendChild(cradle);
    const cradleSens = led(580, 196), ind = led(580, 220);
    root.append(cradleSens, ind, text(568, 200, 'I0.4', 'sv-s', 'end'), text(568, 224, 'Metal', 'sv-s', 'end'));
    const matT = text(494, 196, '', 'sv-s', 'middle');
    root.appendChild(matT);
    return {
      el: root,
      update(m) {
        const A = m.A, i0 = A.ib0;
        const n = bit(i0, 5) ? 6 : bit(i0, 6) ? 2 : 0;
        pcs.forEach((r, i) => show(r, A.online && i < n));
        setLed(lvlHi, bit(i0, 5)); setLed(lvlLo, bit(i0, 6));
        const holdExt = bit(i0, 0), holdRet = bit(i0, 1);
        attr(holdRod, 'x', holdExt ? 232 : holdRet ? 270 : 252);
        attr(holdRod, 'width', holdExt ? 54 : holdRet ? 16 : 34);
        move(pushG, bit(i0, 2) ? 210 : bit(i0, 3) ? 0 : 105, 0);
        const present = bit(i0, 4);
        show(cradle, A.online && present);
        const metal = A.data === 1 || bit(i0, 7);
        attr(cradle, 'class', metal ? 'sv-metal' : 'sv-white');
        txt(matT, present ? (metal ? 'Base metálica' : 'Base plástica') : '');
        setLed(cradleSens, present, 'run'); setLed(ind, bit(i0, 7), 'info');
      }
    };
  }

  // ============================================================== ENSAMBLAJE
  function assemblyView() {
    const root = svg(660, 330);
    root.appendChild(s('rect', { x: 1, y: 1, width: 658, height: 328, rx: 16, class: 'sv-floor' }));
    // silo de nucleos y su mecanismo
    root.appendChild(s('circle', { cx: 132, cy: 72, r: 38, class: 'sv-glass' }));
    const coreStack = s('circle', { cx: 132, cy: 72, r: 16, class: 'sv-core' });
    root.append(coreStack, text(132, 24, 'Silo de núcleos', 'sv-s', 'middle'));
    const lvlHi = led(188, 52), lvlLo = led(188, 76);
    root.append(lvlHi, lvlLo, text(198, 56, 'Alto (I0.1)', 'sv-s'), text(198, 80, 'Bajo (I0.0)', 'sv-s'));
    root.appendChild(s('rect', { x: 22, y: 50, width: 46, height: 12, rx: 3, class: 'sv-steel-l' }));
    const retRod = s('rect', { x: 68, y: 53, width: 10, height: 6, rx: 2, class: 'sv-steel' });
    root.appendChild(s('rect', { x: 22, y: 82, width: 46, height: 12, rx: 3, class: 'sv-steel-l' }));
    const baseRod = s('rect', { x: 68, y: 85, width: 26, height: 6, rx: 2, class: 'sv-steel' });
    root.append(retRod, baseRod, text(22, 44, 'Retenedor', 'sv-s'), text(22, 110, 'Base', 'sv-s'));
    // plato de dos nidos
    const cx = 232, cy = 182;
    const plate = s('g', { class: 'sv-move' });
    plate.appendChild(s('rect', { x: cx - 100, y: cy - 10, width: 200, height: 20, rx: 10, class: 'sv-steel-l' }));
    plate.appendChild(s('circle', { cx: cx - 100, cy, r: 27, class: 'sv-card', 'stroke-width': 2 }));
    plate.appendChild(s('circle', { cx: cx + 100, cy, r: 27, class: 'sv-card', 'stroke-width': 2 }));
    plate.appendChild(s('circle', { cx: cx - 100, cy: cy - 34, r: 4, class: 'sv-accent' }));
    plate.appendChild(s('circle', { cx, cy, r: 8, class: 'sv-steel' }));
    root.appendChild(plate);
    const coreSilo = s('circle', { cx: cx - 100, cy, r: 13, class: 'sv-core' });
    const coreGrip = s('circle', { cx: cx + 100, cy, r: 13, class: 'sv-core' });
    root.append(coreSilo, coreGrip);
    const ledS = led(cx - 100, cy + 44), ledG = led(cx + 100, cy + 44);
    root.append(ledS, ledG, text(cx - 100, cy + 64, 'Nido bajo el silo (I0.2)', 'sv-s', 'middle'), text(cx + 100, cy + 64, 'Nido bajo la pinza (I0.3)', 'sv-s', 'middle'));
    const plateT = text(cx, cy + 92, '', 'sv-t', 'middle');
    root.appendChild(plateT);
    // nido de ensamble
    const nx = 548;
    root.appendChild(s('circle', { cx: nx, cy, r: 38, class: 'sv-card', 'stroke-width': 2 }));
    const piece = s('circle', { cx: nx, cy, r: 26, class: 'sv-white' });
    const pieceCore = s('circle', { cx: nx, cy, r: 9, class: 'sv-core' });
    root.append(piece, pieceCore, text(nx, cy + 64, 'Nido de ensamble', 'sv-s', 'middle'));
    const fiber = led(nx + 56, cy + 8);
    root.append(fiber, text(nx + 56, cy + 28, 'Fibra', 'sv-s', 'middle'), text(nx + 56, cy + 41, 'I0.4', 'sv-s', 'middle'));
    const typeT = text(nx, cy + 84, '', 'sv-t', 'middle');
    root.appendChild(typeT);
    // pick & place (vista superior)
    root.appendChild(s('rect', { x: cx + 100, y: 112, width: nx - cx - 100, height: 8, rx: 4, class: 'sv-steel-l' }));
    const head = s('g', { class: 'sv-move' });
    head.appendChild(s('rect', { x: -4, y: 116, width: 8, height: 46, class: 'sv-steel' }));
    const headBox = s('rect', { x: -24, y: cy - 24, width: 48, height: 48, rx: 12, class: 'sv-card', 'stroke-width': 2.5, 'fill-opacity': .55 });
    const jawL = s('rect', { x: -18, y: cy - 8, width: 7, height: 16, rx: 2, class: 'sv-steel' });
    const jawR = s('rect', { x: 11, y: cy - 8, width: 7, height: 16, rx: 2, class: 'sv-steel' });
    const gripCore = s('circle', { cx: 0, cy, r: 9, class: 'sv-core' });
    const vText = text(0, cy - 30, '', 'sv-s', 'middle');
    head.append(headBox, gripCore, jawL, jawR, vText);
    root.appendChild(head);
    root.appendChild(text(cx + 100 + (nx - cx - 100) / 2, 104, 'Pick & Place', 'sv-s', 'middle'));
    return {
      el: root,
      update(m) {
        const E = m.E, i0 = E.ib0, i1 = E.ib1;
        setLed(lvlHi, bit(i0, 1)); setLed(lvlLo, bit(i0, 0));
        show(coreStack, bit(i0, 0) || bit(i0, 1));
        attr(retRod, 'width', bit(i0, 5) ? 30 : bit(i0, 6) ? 8 : 18);
        attr(baseRod, 'width', bit(i0, 7) ? 30 : bit(i1, 0) ? 6 : 18);
        const posA = bit(i1, 1), posB = bit(i1, 2);
        rotate(plate, posB ? 180 : posA ? 0 : 90, cx, cy);
        txt(plateT, posA ? 'Plato en posición A' : posB ? 'Plato en posición B' : 'Plato girando…');
        show(coreSilo, bit(i0, 2)); show(coreGrip, bit(i0, 3));
        setLed(ledS, bit(i0, 2), 'warn'); setLed(ledG, bit(i0, 3), 'warn');
        const black = E.data === 5 && E.step >= 10;
        const present = bit(i0, 4) || black;
        show(piece, E.online && present);
        attr(piece, 'class', black ? 'sv-black' : 'sv-white');
        show(pieceCore, E.online && present && !black && E.step >= 100);
        setLed(fiber, bit(i0, 4), 'run');
        txt(typeT, !present ? '' : black ? 'Pieza negra: sin núcleo' : E.step >= 100 ? 'Pieza con núcleo' : 'Pieza blanca / metal');
        const hx = bit(i1, 7) ? nx : bit(i1, 6) ? cx + 100 : (cx + 100 + nx) / 2;
        move(head, hx, 0);
        const down = bit(i1, 4), up = bit(i1, 5);
        txt(vText, down ? '▼ abajo' : up ? '▲ arriba' : '↕');
        attr(headBox, 'class', down ? 'sv-accent' : 'sv-card');
        const closed = bit(E.qb0, 3);
        move(jawL, closed ? 4 : 0, 0); move(jawR, closed ? -4 : 0, 0);
        show(gripCore, closed && E.step >= 60 && E.step <= 95);
      }
    };
  }

  // ============================================================== PROCESAMIENTO
  function pressView() {
    const root = svg(560, 280);
    root.appendChild(s('rect', { x: 1, y: 1, width: 558, height: 278, rx: 16, class: 'sv-floor' }));
    root.appendChild(s('rect', { x: 50, y: 224, width: 460, height: 10, rx: 5, class: 'sv-rail' }));
    const oL = led(130, 248), pL = led(400, 248);
    root.append(oL, pL, text(142, 252, 'Origen (I0.2)', 'sv-s'), text(412, 252, 'Prensa (I0.3)', 'sv-s'));
    root.appendChild(s('rect', { x: 340, y: 30, width: 120, height: 18, rx: 4, class: 'sv-steel' }));
    root.appendChild(s('rect', { x: 340, y: 30, width: 14, height: 160, class: 'sv-steel-l' }));
    root.appendChild(s('rect', { x: 446, y: 30, width: 14, height: 160, class: 'sv-steel-l' }));
    const ram = s('g', { class: 'sv-fast' });
    ram.appendChild(s('rect', { x: 388, y: 48, width: 24, height: 56, rx: 3, class: 'sv-steel' }));
    ram.appendChild(s('rect', { x: 376, y: 102, width: 48, height: 12, rx: 3, class: 'sv-steel' }));
    root.appendChild(ram);
    const upL = led(484, 64), dnL = led(484, 120);
    root.append(upL, dnL, text(494, 68, 'Arriba', 'sv-s'), text(494, 124, 'Abajo', 'sv-s'));
    const cart = s('g', { class: 'sv-move' });
    cart.appendChild(s('rect', { x: -50, y: 196, width: 100, height: 28, rx: 6, class: 'sv-card', 'stroke-width': 2 }));
    const jL = s('rect', { x: -34, y: 166, width: 12, height: 30, rx: 2, class: 'sv-steel' });
    const jR = s('rect', { x: 22, y: 166, width: 12, height: 30, rx: 2, class: 'sv-steel' });
    const piece = s('rect', { x: -18, y: 164, width: 36, height: 32, rx: 5, class: 'sv-unknown' });
    cart.append(piece, jL, jR);
    root.appendChild(cart);
    const clampT = text(130, 150, '', 'sv-t', 'middle');
    root.appendChild(clampT);
    return {
      el: root,
      update(m) {
        const P = m.P, i0 = P.ib0;
        const atO = bit(i0, 2), atP = bit(i0, 3);
        const x = atP ? 400 : atO ? 130 : 265;
        move(cart, x, 0);
        attr(clampT, 'x', x);
        setLed(oL, atO); setLed(pL, atP, 'run');
        move(ram, 0, bit(i0, 5) ? 52 : bit(i0, 4) ? 0 : 26);
        setLed(upL, bit(i0, 4)); setLed(dnL, bit(i0, 5), 'warn');
        const closed = bit(i0, 1);
        move(jL, closed ? 10 : 0, 0); move(jR, closed ? -10 : 0, 0);
        show(piece, P.online && bit(i0, 0));
        txt(clampT, closed ? 'Mordaza cerrada' : 'Mordaza abierta');
      }
    };
  }

  // ============================================================== SELECCION
  function beltView() {
    const root = svg(900, 260);
    const id = 'beltclip' + (++uid);
    root.appendChild(s('rect', { x: 1, y: 1, width: 898, height: 258, rx: 16, class: 'sv-floor' }));
    const defs = s('defs');
    const clip = s('clipPath', { id });
    clip.appendChild(s('rect', { x: 60, y: 98, width: 780, height: 48, rx: 10 }));
    defs.appendChild(clip);
    root.appendChild(defs);
    root.appendChild(s('rect', { x: 60, y: 98, width: 780, height: 48, rx: 10, class: 'sv-belt' }));
    const stripes = s('g');
    for (let x = 40; x < 880; x += 26) stripes.appendChild(s('line', { x1: x, y1: 96, x2: x - 12, y2: 150, class: 'sv-belt-line' }));
    const sg = s('g', { 'clip-path': 'url(#' + id + ')' });
    sg.appendChild(stripes);
    root.appendChild(sg);
    const toX = c => 60 + 780 * c / 7769;
    // entrada e inspeccion
    const entryL = led(96, 82), indL = led(toX(2080) - 14, 82), fibL = led(toX(2080) + 14, 82);
    root.append(entryL, indL, fibL, text(96, 70, 'Entrada', 'sv-s', 'middle'), text(toX(2080), 62, 'Inspección', 'sv-s', 'middle'),
      text(toX(2080) - 14, 72, 'Ind.', 'sv-s', 'middle'), text(toX(2080) + 14, 72, 'Fibra', 'sv-s', 'middle'));
    // desviadores y carriles
    const lanes = [2737, 4322, 5945].map((c, i) => {
      const x = toX(c);
      root.appendChild(s('rect', { x: x - 15, y: 14, width: 30, height: 40, rx: 4, class: 'sv-steel-l' }));
      const rod = s('g', { class: 'sv-fast' });
      rod.appendChild(s('rect', { x: x - 4, y: 54, width: 8, height: 32, class: 'sv-steel' }));
      rod.appendChild(s('rect', { x: x - 20, y: 84, width: 40, height: 7, rx: 2, class: 'sv-steel' }));
      root.appendChild(rod);
      const chute = s('path', { d: `M${x - 26} 146 L${x + 26} 146 L${x + 34} 212 L${x - 34} 212 Z`, class: 'sv-soft' });
      const cnt = text(x, 236, '', 'sv-t', 'middle');
      root.append(chute, cnt, text(x, 252, 'Carril ' + (i + 1), 'sv-s', 'middle'));
      return { rod, chute, cnt, x };
    });
    root.appendChild(s('path', { d: 'M842 146 L878 146 L878 212 L842 212 Z', class: 'sv-soft' }));
    const robotCnt = text(860, 236, '', 'sv-t', 'middle');
    root.append(robotCnt, text(860, 252, 'Brazo', 'sv-s', 'middle'), text(840, 70, 'Fin de cinta', 'sv-s', 'end'));
    const waitL = led(860, 82);
    root.appendChild(waitL);
    const piece = s('circle', { cx: 0, cy: 122, r: 15, class: 'sv-unknown' });
    const pieceG = s('g', { class: 'sv-move' });
    pieceG.appendChild(piece);
    root.appendChild(pieceG);
    let offset = 0, last = performance.now();
    return {
      el: root,
      update(m) {
        const S = m.S;
        setLed(entryL, bit(S.ib0, 3), 'run');
        setLed(indL, bit(S.ib0, 5), 'info'); setLed(fibL, bit(S.ib0, 4), 'info');
        const counts = [m.count.c1, m.count.c2, m.count.c3];
        lanes.forEach((ln, i) => {
          move(ln.rod, 0, bit(S.qb0, 4 + i) ? 40 : 0);
          attr(ln.chute, 'class', S.lane === i + 1 && S.step >= 10 && S.step < 60 ? 'sv-accent' : 'sv-soft');
          txt(ln.cnt, XL.fmt(counts[i]));
        });
        txt(robotCnt, XL.fmt(m.count.robot));
        setLed(waitL, bit(S.stat, 6), 'warn');
        // posicion aproximada de la pieza segun el paso
        let px = null;
        const laneX = S.lane >= 1 && S.lane <= 3 ? lanes[S.lane - 1].x : 820;
        if (S.step === 0 && bit(S.ib0, 3)) px = 96;
        else if (S.step === 10 || S.step === 15) px = toX(2080);
        else if (S.step === 20 || S.step === 25) px = laneX - 30;
        else if (S.step === 30 || S.step === 40 || S.step === 50) px = laneX;
        else if (S.step === 60) px = 820;
        show(piece, S.online && px !== null);
        if (px !== null) move(pieceG, px, 0);
        const now = performance.now();
        if (S.freq > 0.3) offset = (offset + (now - last) / 1000 * S.freq * 4) % 26;
        last = now;
        stripes.style.transform = 'translateX(' + offset.toFixed(1) + 'px)';
      }
    };
  }

  // ============================================================== VARIADOR (indicador)
  function gaugeView() {
    const root = svg(260, 160);
    const cx = 130, cy = 132, r = 100;
    const arc = (a0, a1) => {
      const p = a => [cx + r * Math.cos(Math.PI * (1 - a)), cy - r * Math.sin(Math.PI * (1 - a))];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1} ${y1}`;
    };
    root.appendChild(s('path', { d: arc(0, 1), fill: 'none', 'stroke-linecap': 'round', style: { stroke: 'var(--surface-3)', strokeWidth: '16px' } }));
    const val = s('path', { d: arc(0, 0.001), fill: 'none', 'stroke-linecap': 'round', style: { stroke: 'var(--accent)', strokeWidth: '16px' } });
    root.appendChild(val);
    for (let hz = 0; hz <= 50; hz += 10) {
      const a = hz / 50, x = cx + (r - 26) * Math.cos(Math.PI * (1 - a)), y = cy - (r - 26) * Math.sin(Math.PI * (1 - a));
      root.appendChild(text(x, y + 4, String(hz), 'sv-s', 'middle'));
    }
    const vT = text(cx, cy - 18, '0,0', 'sv-tl', 'middle');
    vT.style.fontSize = '30px';
    root.append(vT, text(cx, cy + 4, 'Hz de salida', 'sv-s', 'middle'));
    return {
      el: root,
      update(hz) {
        const a = clamp(hz / 50, 0.001, 1);
        attr(val, 'd', arc(0, a));
        txt(vT, XL.fmt(hz, 1));
      }
    };
  }

  // ============================================================== BRAZO
  function robotView() {
    const root = svg(480, 270);
    root.appendChild(s('rect', { x: 1, y: 1, width: 478, height: 268, rx: 16, class: 'sv-floor' }));
    root.appendChild(s('rect', { x: 20, y: 186, width: 130, height: 26, rx: 8, class: 'sv-belt' }));
    root.appendChild(text(85, 232, 'Fin de cinta', 'sv-s', 'middle'));
    root.appendChild(s('rect', { x: 340, y: 200, width: 120, height: 12, rx: 3, class: 'sv-steel-l' }));
    root.appendChild(s('rect', { x: 350, y: 212, width: 8, height: 30, class: 'sv-steel-l' }));
    root.appendChild(s('rect', { x: 442, y: 212, width: 8, height: 30, class: 'sv-steel-l' }));
    root.appendChild(text(400, 258, 'Mesa exterior', 'sv-s', 'middle'));
    root.appendChild(s('rect', { x: 212, y: 216, width: 56, height: 30, rx: 6, class: 'sv-steel' }));
    root.appendChild(s('rect', { x: 232, y: 130, width: 16, height: 88, rx: 3, class: 'sv-steel-l' }));
    const arm = s('path', { d: '', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: { stroke: 'var(--steel)', strokeWidth: '9px' } });
    root.appendChild(arm);
    const grip = s('g', { class: 'sv-move' });
    const piece = s('circle', { cx: 0, cy: 14, r: 11, class: 'sv-unknown' });
    const jl = s('rect', { x: -14, y: 0, width: 6, height: 18, rx: 2, class: 'sv-steel' });
    const jr = s('rect', { x: 8, y: 0, width: 6, height: 18, rx: 2, class: 'sv-steel' });
    grip.append(piece, jl, jr);
    root.appendChild(grip);
    const tablePiece = s('circle', { cx: 400, cy: 188, r: 11, class: 'sv-unknown' });
    root.appendChild(tablePiece);
    const beltPiece = s('circle', { cx: 120, cy: 182, r: 11, class: 'sv-unknown' });
    root.appendChild(beltPiece);
    const poses = [
      { from: 0, to: 0, p: [300, 70], hold: false },
      { from: 1, to: 39, p: [190, 80], hold: false },
      { from: 40, to: 99, p: [110, 140], hold: false },
      { from: 100, to: 109, p: [110, 158], hold: true },
      { from: 110, to: 119, p: [110, 118], hold: true },
      { from: 120, to: 129, p: [190, 100], hold: true },
      { from: 130, to: 139, p: [330, 100], hold: true },
      { from: 140, to: 149, p: [400, 164], hold: true },
      { from: 150, to: 159, p: [400, 164], hold: false },
      { from: 160, to: 169, p: [400, 110], hold: false },
      { from: 170, to: 255, p: [210, 90], hold: false }
    ];
    return {
      el: root,
      update(m) {
        const R = m.R;
        const pose = poses.find(q => R.step >= q.from && R.step <= q.to) || poses[0];
        const [x, y] = pose.p;
        const sx = 240, sy = 130;
        const ex = (sx + x) / 2 + (x < sx ? 10 : -10), ey = Math.min(sy, y) - 34;
        attr(arm, 'd', `M${sx} ${sy} L${ex} ${ey} L${x} ${y}`);
        move(grip, x, y);
        show(piece, pose.hold);
        move(jl, pose.hold ? 3 : 0, 0); move(jr, pose.hold ? -3 : 0, 0);
        show(tablePiece, R.step >= 150 && R.step < 200);
        show(beltPiece, bit(m.S.stat, 6) && R.step < 100);
      }
    };
  }

  XL.draw = { plantView, railView, manipulatorView, feedView, assemblyView, pressView, beltView, gaugeView, robotView, kindClass };
})(window.XL);
