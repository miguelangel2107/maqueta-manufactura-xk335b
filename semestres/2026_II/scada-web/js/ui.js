/* =============================================================================
   SCADA XL-335B - Componentes de interfaz reutilizables
   Cada componente devuelve { el, update(...) } y solo toca el DOM si algo cambia.
   ============================================================================= */
'use strict';

(function (XL) {
  const { h, cls, txt, attr, bit, icon, fmt } = XL;

  function card(title, sub, body, right) {
    return h('section', { class: 'card' }, [
      title ? h('div', { class: 'card-head' }, [h('h3', { text: title }), sub ? h('span', { class: 'ch-sub', text: sub }) : null, right ? h('div', { class: 'ch-right' }, right) : null]) : null,
      body
    ]);
  }

  function chip() {
    const el = h('span', { class: 'chip', text: '—' });
    return {
      el,
      update(kind, label, blink) {
        const map = { ok: 'ok', run: 'accent', warn: 'warn', bad: 'bad', idle: '', info: 'info' };
        const c = 'chip ' + (map[kind] || '') + (blink ? ' blink' : '');
        if (el.className !== c) el.className = c;
        txt(el, label);
      }
    };
  }

  function ledEl(kind) { return h('span', { class: 'led', dataset: { kind: kind || 'ok' } }); }
  function setLed(el, on, kind, blink) {
    const k = kind || el.dataset.kind || 'ok';
    const c = 'led' + (on ? ' on ' + k : '') + (on && blink ? ' blink' : '');
    if (el.className !== c) el.className = c;
  }

  // Tabla de entradas / salidas de una estacion
  function ioPanel(stationId) {
    const def = XL.model.IO[stationId];
    const rows = [];
    const col = (title, list) => h('div', { class: 'io-list' }, [h('h4', { text: title })].concat(list.map(([addr, name, key, b, kind]) => {
      const l = ledEl(kind || 'ok');
      rows.push({ l, key, b, kind });
      return h('div', { class: 'io-row' }, [l, h('span', { class: 'io-addr', text: addr }), h('span', { class: 'io-name', text: name })]);
    })));
    const el = h('div', { class: 'io-cols' }, [col('Entradas', def.in), def.out.length ? col('Salidas', def.out) : h('div', { class: 'io-list' }, [h('h4', { text: 'Salidas' }), h('p', { class: 'muted', text: 'El Brazo no publica sus salidas en la red.' })])]);
    return {
      el,
      update(m) {
        const st = m[stationId];
        rows.forEach(r => setLed(r.l, st && st.online !== false && bit(st[r.key] || 0, r.b), r.kind || 'ok'));
      }
    };
  }

  // Linea de pasos: resalta el actual y los ya recorridos
  function stepsPanel(table, keys) {
    const items = keys.map(k => {
      const e = table[k];
      const el = h('div', { class: 'step', title: e ? e[1] : '' }, [h('span', { class: 'step-n', text: String(k) }), h('span', { text: e ? e[0] : 'Paso ' + k })]);
      return { k, el };
    });
    const el = h('div', { class: 'steps' }, items.map(i => i.el));
    return {
      el,
      update(step, active) {
        const idx = keys.indexOf(step);
        items.forEach((it, i) => {
          cls(it.el, 'current', active !== false && it.k === step);
          cls(it.el, 'done', active !== false && idx > 0 && i < idx && it.k !== 0);
        });
      }
    };
  }

  // Caja "paso actual"
  function nowBox(label) {
    const n = h('div', { class: 'now-step', text: '—' });
    const b = h('b', { text: '—' });
    const sp = h('span', { text: '' });
    const el = h('div', { class: 'now-box' }, [n, h('div', { class: 'now-text' }, [label ? h('span', { text: label }) : null, b, sp])]);
    return {
      el,
      update(step, title, sub) { txt(n, step === null || step === undefined ? '—' : step); txt(b, title || '—'); txt(sp, sub || ''); }
    };
  }

  // Lista de razones / estados con LED
  function reasons() {
    const el = h('ul', { class: 'reasons' });
    let lastKey = '';
    return {
      el,
      update(items) {
        const key = JSON.stringify(items);
        if (key === lastKey) return;
        lastKey = key;
        el.textContent = '';
        if (!items.length) { el.appendChild(h('li', { class: 'muted', text: 'Nada pendiente.' })); return; }
        items.forEach(it => {
          const l = ledEl(it.kind);
          setLed(l, true, it.kind, it.blink);
          el.appendChild(h('li', {}, [l, h('div', {}, [h('div', { text: it.text }), it.sub ? h('div', { class: 'muted', style: { fontSize: '12.5px' }, text: it.sub }) : null])]));
        });
      }
    };
  }

  // Lista clave-valor
  function kv(items) {
    const cells = {};
    const el = h('dl', { class: 'kv' });
    items.forEach(([key, label]) => {
      const dd = h('dd', { text: '—' });
      cells[key] = dd;
      el.append(h('dt', { text: label }), dd);
    });
    return { el, set(key, value) { txt(cells[key], value); }, cell: k => cells[k] };
  }

  // Barras de tiempos neumaticos (Delta-t)
  function dtPanel(defs) {
    const rows = defs.map(d => {
      const fill = h('div', { class: 'dt-fill' });
      const max = d.crit;
      const bar = h('div', { class: 'dt-bar' }, [fill,
        h('div', { class: 'dt-mark', style: { left: (d.nominal / max * 100) + '%' }, title: 'Nominal ' + d.nominal + ' ms' }),
        h('div', { class: 'dt-mark alert', style: { left: (d.alert / max * 100) + '%' }, title: 'Alerta ' + d.alert + ' ms' })]);
      const val = h('div', { class: 'dt-val', text: '—' });
      const el = h('div', { class: 'dt-row' }, [h('div', { class: 'dt-name', text: d.name }), bar, val]);
      return { d, fill, val, el, max };
    });
    const el = h('div', {}, rows.map(r => r.el).concat([h('div', { class: 'legend', style: { marginTop: '8px' } }, [
      h('span', {}, [h('i', { style: { background: 'var(--muted)' } }), 'Nominal']),
      h('span', {}, [h('i', { style: { background: 'var(--warn)' } }), 'Umbral de alerta de fuga']),
      h('span', { text: 'Escala hasta el tiempo de atasco (1,5 s)' })])]));
    return {
      el,
      update(values) {
        rows.forEach((r, i) => {
          const v = values[i] || 0;
          r.fill.style.width = Math.min(100, v / r.max * 100) + '%';
          r.fill.className = 'dt-fill' + (v > r.d.alert ? ' warn' : '') + (v >= r.d.crit ? ' bad' : '');
          txt(r.val, v ? fmt(v) + ' ms' : '—');
        });
      }
    };
  }

  // Bits de un byte (vista experta)
  function bitsView() {
    const spans = [];
    const el = h('span', { class: 'bits' });
    for (let i = 7; i >= 0; i--) { const sp = h('span', { text: String(i) }); spans[i] = sp; el.appendChild(sp); }
    return { el, update(v) { for (let i = 0; i < 8; i++) cls(spans[i], 'on', bit(v, i)); } };
  }

  // Tarjeta de estacion para la vista general
  function stationCard(st, onOpen) {
    const c = chip();
    const step = h('b', { text: '—' });
    const sub = h('div', { class: 'muted', text: '' });
    const mode = h('span', { class: 'chip plain', text: '—' });
    const extra = h('span', { class: 'chip plain', text: '' });
    const el = h('section', { class: 'card station-card', onclick: () => onOpen(st.page), title: 'Abrir ' + st.name }, [
      h('div', { class: 'sc-head' }, [icon(st.icon), h('b', { text: st.short }), c.el]),
      h('div', { class: 'sc-step' }, [step, sub]),
      h('div', { class: 'sc-foot' }, [mode, extra])
    ]);
    return {
      el,
      update(m) {
        const s = m.st[st.id];
        c.update(s.kind, s.label, s.blink);
        el.className = 'card station-card st-' + (s.kind === 'run' ? 'run' : s.kind === 'ok' ? 'ok' : s.kind === 'warn' ? 'warn' : s.kind === 'bad' ? 'bad' : 'idle');
        txt(step, s.step || '—');
        txt(sub, s.stepText || '');
        txt(mode, !s.online ? 'Sin red' : s.auto ? 'Automático' : 'Manual');
        txt(extra, stationExtra(m, st.id));
        extra.style.display = extra.textContent ? '' : 'none';
      }
    };
  }

  function stationExtra(m, id) {
    if (id === 'T') return m.T.homed ? 'Referenciado' : 'Sin referencia';
    if (id === 'A') return m.A.online && bit(m.A.ib0, 4) ? 'Base en la cuna' : '';
    if (id === 'E') {
      if (!m.E.online) return '';
      const n = bit(m.E.ib0, 2) + bit(m.E.ib0, 3);
      return 'Núcleos listos: ' + n + ' / 2';
    }
    if (id === 'P') return m.P.online && bit(m.P.ib0, 0) ? 'Pieza en la mordaza' : '';
    if (id === 'S') return m.S.online ? (m.S.freq > 0.5 ? 'Cinta ' + fmt(m.S.freq, 1) + ' Hz' : 'Cinta parada') : '';
    if (id === 'R') return m.R.online ? (m.R.homed ? 'Referenciado' : 'Sin referencia') : '';
    return '';
  }

  // Selector segmentado
  function segmented(options, onPick) {
    const btns = options.map(([value, label]) => h('button', { type: 'button', text: label, onclick: () => onPick(value) }));
    const el = h('div', { class: 'seg' }, btns);
    return {
      el,
      update(value, disabled) {
        options.forEach(([v], i) => { cls(btns[i], 'on', v === value); btns[i].disabled = !!disabled; });
      }
    };
  }

  XL.ui = { card, chip, ledEl, setLed, ioPanel, stepsPanel, nowBox, reasons, kv, dtPanel, bitsView, stationCard, segmented, stationExtra };
})(window.XL);
