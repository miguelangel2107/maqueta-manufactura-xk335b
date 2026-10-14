/* =============================================================================
   SCADA XL-335B - Aplicacion
   - Navegacion entre ventanas (#/planta, #/transporte, ...)
   - Conexion Modbus RTU por Web Serial, modo demostracion y ventanas enlazadas
   - Motor de alarmas con historial y seguimiento de produccion
   ============================================================================= */
'use strict';

(function (XL) {
  const { h, txt, cls, attr, bit, icon, store, fmt, model } = XL;
  const params = new URLSearchParams(location.search);

  const app = {
    mode: 'off',                 // off | serial | demo | linked
    isPopup: params.has('ventana'),
    client: null,
    sim: null,
    img: new model.MemImage(),
    last: null,                  // ultimo modelo decodificado
    lastData: 0,
    cycleMs: 0,
    page: null,
    pageApi: null,
    children: new Set(),
    settings: Object.assign({ slave: 1, baud: 19200, parity: 'none', poll: 200, timeout: 450, theme: 'auto' }, store.get('settings', {})),
    sessionConfirmed: false
  };
  XL.app = app;

  // ------------------------------------------------------------------ tema
  function applyTheme() {
    const t = app.settings.theme;
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }
  app.saveSettings = patch => {
    Object.assign(app.settings, patch);
    store.set('settings', app.settings);
    if ('theme' in patch) applyTheme();
    XL.toast('Preferencia guardada');
  };

  // ------------------------------------------------------------------ alarmas
  const alarms = app.alarms = {
    active: new Map(),
    history: store.get('alarmHistory', []),
    update(m) {
      for (const def of model.ALARMS) {
        let on = false;
        try { on = !!def.test(m); } catch (e) { on = false; }
        const cur = this.active.get(def.id);
        if (on && !cur) {
          this.active.set(def.id, { def, since: Date.now(), acked: def.sev === 'info', detail: def.detail ? def.detail(m) : '' });
          if (!app.isPopup) this.log({ t: Date.now(), id: def.id, st: def.stName, title: def.title, sev: def.sev, on: true });
          if (def.sev === 'bad' && !app.isPopup) XL.toast(def.title, 'bad');
        } else if (!on && cur) {
          this.active.delete(def.id);
          if (!app.isPopup) this.log({ t: Date.now(), id: def.id, st: def.stName, title: def.title, sev: def.sev, on: false, dur: Date.now() - cur.since });
        } else if (on && cur && def.detail) cur.detail = def.detail(m);
      }
    },
    log(e) {
      this.history.push(e);
      if (this.history.length > 1000) this.history.splice(0, this.history.length - 1000);
      store.set('alarmHistory', this.history);
    },
    list() {
      const order = { bad: 0, warn: 1, info: 2 };
      return Array.from(this.active.values()).sort((a, b) => order[a.def.sev] - order[b.def.sev] || b.since - a.since);
    },
    count(sev) { let n = 0; this.active.forEach(a => { if (!sev || a.def.sev === sev) n++; }); return n; },
    unacked() { let n = 0; this.active.forEach(a => { if (!a.acked && a.def.sev !== 'info') n++; }); return n; },
    ackAll() { this.active.forEach(a => { a.acked = true; }); },
    clearHistory() { this.history = []; store.set('alarmHistory', []); },
    exportCsv() {
      const rows = [['fecha', 'unidad', 'evento', 'severidad', 'descripcion', 'duracion_s']].concat(this.history.map(e => [XL.fmtDateTime(e.t), e.st, e.on ? 'aparece' : 'se resuelve', e.sev, e.title, e.dur ? Math.round(e.dur / 1000) : '']));
      const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\r\n');
      const a = h('a', { href: URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })), download: 'alarmas_xl335b.csv' });
      document.body.appendChild(a); a.click(); a.remove();
    }
  };

  // ------------------------------------------------------------------ produccion
  const prod = app.prod = {
    start: Date.now(),
    base: null,                  // total al iniciar la sesion
    samples: [],                 // { t, total } cada 10 s
    events: [],                  // instantes en que aumento el total
    lastTotal: null,
    update(m) {
      const total = m.count.total;
      if (this.base === null || total < this.lastTotal) { this.base = total; this.lastTotal = total; }
      if (total > this.lastTotal) { for (let i = this.lastTotal; i < total; i++) this.events.push(Date.now()); this.lastTotal = total; }
      const now = Date.now();
      if (!this.samples.length || now - this.samples[this.samples.length - 1].t > 10000) this.samples.push({ t: now, total: total - this.base });
      const cut = now - 3 * 3600e3;
      while (this.samples.length && this.samples[0].t < cut) this.samples.shift();
      while (this.events.length && this.events[0] < cut) this.events.shift();
    },
    sessionCount() { return this.lastTotal === null ? 0 : this.lastTotal - this.base; },
    rate() {
      const now = Date.now(), win = 15 * 60e3;
      const recent = this.events.filter(t => t > now - win);
      const span = Math.min(win, now - this.start);
      if (span < 60e3) return null;
      return recent.length / (span / 3600e3);
    },
    avgCycle() {
      const e = this.events.slice(-11);
      if (e.length < 2) return null;
      return (e[e.length - 1] - e[0]) / (e.length - 1);
    },
    resetSession() { this.base = null; this.lastTotal = null; this.events = []; this.samples = []; this.start = Date.now(); },
    drawChart(canvas) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth, hh = canvas.clientHeight;
      if (!w) return;
      canvas.width = w * dpr; canvas.height = hh * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      const css = getComputedStyle(document.documentElement);
      const col = n => css.getPropertyValue(n).trim();
      const now = Date.now(), bins = 24, binMs = 5 * 60e3;
      const counts = new Array(bins).fill(0);
      this.events.forEach(t => { const i = bins - 1 - Math.floor((now - t) / binMs); if (i >= 0 && i < bins) counts[i]++; });
      const max = Math.max(4, ...counts);
      const padL = 28, padB = 22, gw = w - padL - 6, gh = hh - padB - 8;
      ctx.clearRect(0, 0, w, hh);
      ctx.font = '11px Segoe UI, system-ui, sans-serif';
      ctx.fillStyle = col('--muted'); ctx.strokeStyle = col('--border');
      for (let i = 0; i <= 4; i++) {
        const y = 8 + gh - gh * i / 4;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - 6, y); ctx.stroke();
        ctx.fillText(String(Math.round(max * i / 4)), 4, y + 4);
      }
      const bw = gw / bins;
      ctx.fillStyle = col('--accent');
      counts.forEach((c, i) => {
        const bh = gh * c / max;
        const x = padL + i * bw + 2, y = 8 + gh - bh;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, bw - 4, bh, 3); else ctx.rect(x, y, bw - 4, bh);
        ctx.fill();
      });
      ctx.fillStyle = col('--muted');
      ctx.fillText('hace 2 h', padL, hh - 6);
      ctx.fillText('ahora', w - 40, hh - 6);
    }
  };

  // ------------------------------------------------------------------ escrituras
  app.canWrite = () => app.mode === 'serial' || app.mode === 'demo' || app.mode === 'linked';

  async function writeRegs(offset, values) {
    if (app.mode === 'demo') { app.sim.write(offset, values); return true; }
    if (app.mode === 'serial') return app.client.writeMultiple(offset, values);
    if (app.mode === 'linked') return linkedWrite(offset, values);
    throw new Error('Sin conexión con el PLC');
  }
  app.writeRegs = writeRegs;
  app.writeDint = (vaddr, value) => writeRegs((vaddr - 1000) / 2, [(value >>> 16) & 0xFFFF, value & 0xFFFF]);
  app.writeWord = (vaddr, value) => writeRegs((vaddr - 1000) / 2, [value & 0xFFFF]);

  // Pulso de mando en 40001: 1 durante ~350 ms y luego 0 (el PLC detecta el flanco)
  app.pulse = async (mask, label, opts) => {
    opts = opts || {};
    if (!app.canWrite()) { XL.toast('Conecte el PLC o active el modo demostración', 'bad'); return; }
    if (opts.confirm && !app.sessionConfirmed) {
      const chk = h('input', { type: 'checkbox' });
      const ok = await XL.confirmDialog({
        title: label, ok: 'Pulsar',
        text: 'Equivale a pulsar el botón físico del tablero de Transporte: la máquina se moverá. Compruebe que nadie esté dentro de la celda.',
        body: h('label', { class: 'chk' }, [chk, 'No volver a preguntar en esta sesión'])
      });
      if (!ok) return;
      if (chk.checked) app.sessionConfirmed = true;
    }
    try {
      await writeRegs(0, [mask]);
      await new Promise(r => setTimeout(r, 350));
      await writeRegs(0, [0]);
      if (!opts.quiet) XL.toast(label + ': enviado');
    } catch (e) {
      XL.toast('No se pudo enviar «' + label + '»: ' + e.message, 'bad');
    }
  };

  app.setVfdMode = async v => {
    if (!app.canWrite()) return XL.toast('Sin conexión con el PLC', 'bad');
    const ok = await XL.confirmDialog({ title: 'Cambiar el modo del variador', text: v === 1 ? 'Modo 1: marcha por Q0.0/Q0.1 y consigna analógica (AQW0). Se aplica en cuanto la cinta esté detenida.' : 'Modo 2: órdenes y consigna por Modbus RS-485. Se aplica en cuanto la cinta esté detenida.', ok: 'Cambiar a modo ' + v });
    if (!ok) return;
    try { await app.writeWord(1016, v); XL.toast('Modo ' + v + ' pedido al variador', 'ok'); } catch (e) { XL.toast('No se pudo escribir: ' + e.message, 'bad'); }
  };
  app.setBeltDir = async v => {
    if (!app.canWrite()) return XL.toast('Sin conexión con el PLC', 'bad');
    const ok = await XL.confirmDialog({ title: 'Cambiar el sentido de la cinta', text: (v === 1 ? 'Forward' : 'Reverse') + '. Se aplica en la siguiente marcha, con la cinta detenida. Si la cinta empieza a ir hacia atrás, vuelva al sentido anterior.', ok: 'Cambiar' });
    if (!ok) return;
    try { await app.writeWord(1014, v); XL.toast('Sentido ' + (v === 1 ? 'Forward' : 'Reverse') + ' pedido', 'ok'); } catch (e) { XL.toast('No se pudo escribir: ' + e.message, 'bad'); }
  };

  // ------------------------------------------------------------------ conexion serie
  app.connect = async () => {
    if (app.isPopup) return XL.toast('Conecte desde la ventana principal');
    if (!XL.ModbusClient.supported()) {
      XL.confirmDialog({ title: 'Web Serial no disponible', text: 'Abra el SCADA con Google Chrome o Microsoft Edge en un PC. Mientras tanto puede usar el modo demostración.', ok: 'Entendido' });
      return;
    }
    await app.disconnect(true);
    const c = new XL.ModbusClient();
    try {
      await c.connect({ slave: app.settings.slave, baud: app.settings.baud, parity: app.settings.parity, timeoutMs: app.settings.timeout });
    } catch (e) {
      if (e && e.name === 'NotFoundError') return; // el usuario cerro el selector de puertos
      XL.toast('No se pudo abrir el puerto: ' + e.message, 'bad');
      return;
    }
    app.client = c;
    app.mode = 'serial';
    c.onDisconnect = () => { if (app.mode === 'serial') { app.mode = 'off'; XL.toast('Se perdió el puerto serie (¿cable USB desconectado?)', 'bad'); render(); } };
    XL.toast('Puerto abierto. Leyendo el PLC 1…');
    pollLoop(c);
    render();
  };

  app.disconnect = async (silent) => {
    const was = app.mode;
    app.mode = 'off';
    if (app.demoTimer) { clearInterval(app.demoTimer); app.demoTimer = null; }
    if (app.client) { const c = app.client; app.client = null; await c.disconnect(); }
    if (!silent && was !== 'off') XL.toast('Desconectado');
    render();
  };

  async function pollLoop(c) {
    while (app.mode === 'serial' && app.client === c) {
      const t0 = performance.now();
      try {
        const a = await c.readHolding(0, 64);
        const b = await c.readHolding(64, 64);
        app.img.setRegs(0, a);
        app.img.setRegs(64, b);
        app.cycleMs = Math.round(performance.now() - t0);
        onImage();
      } catch (e) {
        app.linkError = e.message;
        renderChrome();
      }
      await new Promise(r => setTimeout(r, app.settings.poll));
    }
  }

  // ------------------------------------------------------------------ demostracion
  app.startDemo = async () => {
    if (app.isPopup) return;
    await app.disconnect(true);
    app.sim = app.sim || new XL.Simulator();
    app.mode = 'demo';
    app.img = app.sim.img;
    let last = performance.now();
    app.demoTimer = setInterval(() => {
      const now = performance.now();
      app.sim.tick(Math.min(0.5, (now - last) / 1000));
      last = now;
      app.img = app.sim.img;
      app.cycleMs = 0;
      onImage();
    }, 200);
    XL.toast('Modo demostración: datos simulados. Pulse Marcha para ver el ciclo.');
    render();
  };

  // ------------------------------------------------------------------ ventanas aparte
  app.openPopup = pageId => {
    const url = location.pathname + '?ventana=1#/' + pageId;
    const w = window.open(url, 'xl335b_' + pageId, 'width=1280,height=860');
    if (w) app.children.add(w);
    else XL.toast('El navegador bloqueó la ventana emergente: permítala para este sitio', 'bad');
  };

  function broadcast() {
    if (!app.children.size) return;
    const msg = { xl335b: 'img', bytes: Array.from(app.img.bytes), mode: app.mode, stamp: app.img.stamp, stats: app.client ? app.client.stats : null };
    app.children.forEach(w => { if (w.closed) app.children.delete(w); else w.postMessage(msg, '*'); });
  }

  const pendingWrites = new Map();
  let writeId = 0;
  function linkedWrite(offset, values) {
    return new Promise((resolve, reject) => {
      if (!window.opener || window.opener.closed) return reject(new Error('La ventana principal está cerrada'));
      const id = ++writeId;
      pendingWrites.set(id, { resolve, reject });
      window.opener.postMessage({ xl335b: 'write', id, offset, values }, '*');
      setTimeout(() => { if (pendingWrites.has(id)) { pendingWrites.delete(id); reject(new Error('Sin respuesta de la ventana principal')); } }, 3000);
    });
  }

  window.addEventListener('message', async ev => {
    const d = ev.data;
    if (!d || typeof d !== 'object' || !d.xl335b) return;
    if (d.xl335b === 'hello' && ev.source) { app.children.add(ev.source); return; }
    if (d.xl335b === 'write' && ev.source && app.children.has(ev.source)) {
      try { await writeRegs(d.offset, d.values); ev.source.postMessage({ xl335b: 'writeResult', id: d.id, ok: true }, '*'); }
      catch (e) { ev.source.postMessage({ xl335b: 'writeResult', id: d.id, ok: false, err: e.message }, '*'); }
      return;
    }
    if (!app.isPopup || ev.source !== window.opener) return;
    if (d.xl335b === 'img') {
      app.mode = d.mode === 'off' ? 'off' : 'linked';
      app.parentMode = d.mode;
      app.img.bytes.set(d.bytes);
      app.img.stamp = d.stamp;
      app.linkedStats = d.stats;
      onImage();
    } else if (d.xl335b === 'writeResult') {
      const p = pendingWrites.get(d.id);
      if (p) { pendingWrites.delete(d.id); d.ok ? p.resolve(true) : p.reject(new Error(d.err)); }
    }
  });

  // ------------------------------------------------------------------ ciclo de datos
  function onImage() {
    const m = model.decode(app.img);
    app.last = m;
    app.lastData = Date.now();
    app.linkError = '';
    alarms.update(m);
    prod.update(m);
    renderChrome();
    if (app.pageApi) {
      try { app.pageApi.update(m); } catch (e) { console.error(e); }
    }
    cls(document.getElementById('nodata'), 'hidden', true);
    broadcast();
  }

  function stale() { return !app.lastData || Date.now() - app.lastData > 3000; }

  // ------------------------------------------------------------------ estructura
  const els = {};
  function buildShell() {
    const root = document.getElementById('app');
    if (app.isPopup) root.classList.add('popup');
    // barra lateral
    const nav = h('nav', { class: 'nav' });
    let group = '';
    els.navLinks = {};
    XL.pages.forEach(p => {
      if (p.group !== group) { group = p.group; nav.appendChild(h('div', { class: 'nav-group', text: group })); }
      const st = model.STATIONS.find(s => s.page === p.id);
      const extra = p.id === 'alarmas' ? h('span', { class: 'nav-badge hidden', text: '0' }) : st ? h('span', { class: 'nav-dot' }) : null;
      const a = h('a', { href: '#/' + p.id }, [icon(p.icon), h('span', { text: p.title }), extra]);
      els.navLinks[p.id] = { a, extra, st };
      nav.appendChild(a);
    });
    const side = h('aside', { class: 'sidebar' }, [
      h('div', { class: 'brand' }, [h('div', { class: 'brand-mark', text: 'XL' }), h('div', { class: 'brand-text' }, [h('div', { class: 'brand-title', text: 'Celda XL-335B' }), h('div', { class: 'brand-sub', text: 'SCADA de la celda' })])]),
      nav,
      h('div', { class: 'sidebar-foot' }, [h('div', { text: 'PLC 1 · Modbus RTU' }), h('div', { class: 'faint', text: 'Web Serial · sin servidor' })])
    ]);
    // barra superior
    els.title = h('h1', { text: '' });
    els.conn = h('span', { class: 'conn-pill' }, [h('span', { class: 'led' }), h('span', { text: 'Desconectado' })]);
    els.connBtn = h('button', { class: 'btn primary', onclick: () => (app.mode === 'serial' || app.mode === 'demo') ? app.disconnect() : app.connect() }, [icon('plug'), h('span', { text: 'Conectar PLC' })]);
    els.demoBtn = h('button', { class: 'btn hide-sm', onclick: () => app.startDemo(), title: 'Explorar el SCADA con datos simulados' }, [icon('demo'), 'Demo']);
    els.beacon = h('span', { class: 'beacon h', title: 'Baliza de planta' }, [h('i', { class: 'r' }), h('i', { class: 'y' }), h('i', { class: 'g' })]);
    els.clock = h('span', { class: 'muted num hide-sm' });
    els.theme = h('button', { class: 'btn icon ghost', title: 'Cambiar tema claro / oscuro', onclick: () => app.saveSettings({ theme: document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark' }) }, [icon('moon')]);
    const top = h('header', { class: 'topbar' }, [els.title, h('div', { class: 'spacer' }), els.beacon, els.clock, els.conn, app.isPopup ? null : els.demoBtn, app.isPopup ? null : els.connBtn, els.theme]);
    // principal y pie
    els.main = h('main', { class: 'main' });
    els.nodata = h('div', { id: 'nodata', class: 'nodata' });
    els.ticker = h('span', { class: 'ticker' });
    els.footStats = h('span', { class: 'num' });
    els.footTime = h('span', { class: 'num' });
    const foot = h('footer', { class: 'footer' }, [els.footStats, els.footTime, els.ticker]);
    root.append(side, top, els.main, foot);
  }

  let bannerKey = '';
  function noDataBanner(force) {
    const box = els.nodata;
    const supported = XL.ModbusClient.supported();
    let title, textMsg;
    if (app.isPopup) { title = 'Ventana aparte'; textMsg = 'Recibe los datos de la ventana principal. Si la cerró, vuelva a abrirla.'; }
    else if (app.mode === 'serial') { title = 'Esperando respuesta del PLC 1…'; textMsg = (app.linkError ? app.linkError + '. ' : '') + 'Compruebe que el selector físico del PLC 1 esté en RUN y el cableado A/B del conversor.'; }
    else { title = 'Sin conexión'; textMsg = supported ? 'Pulse «Conectar PLC» y elija el puerto del conversor USB-RS485, o pruebe el modo demostración.' : 'Este navegador no tiene Web Serial: use Chrome o Edge en un PC. Puede explorar el SCADA con el modo demostración.'; }
    const key = app.mode + title + textMsg;
    if (!force && key === bannerKey && box.firstChild) return;
    bannerKey = key;
    box.textContent = '';
    box.appendChild(h('div', { class: 'callout ' + (app.mode === 'serial' ? 'warn' : 'info') }, [icon('info', 'co-icon'), h('div', { style: { flex: 1 } }, [h('b', { text: title }), h('span', { text: textMsg })]),
      app.isPopup ? null : h('div', { class: 'btn-row' }, [
        app.mode !== 'serial' && supported ? h('button', { class: 'btn primary sm', onclick: () => app.connect() }, [icon('plug'), 'Conectar PLC']) : null,
        h('button', { class: 'btn sm', onclick: () => app.startDemo() }, [icon('demo'), 'Modo demostración'])
      ])]));
  }

  // ------------------------------------------------------------------ navegacion
  function route() {
    const id = (location.hash.replace(/^#\/?/, '') || 'planta').split('?')[0];
    const page = XL.pages.find(p => p.id === id) || XL.pages[0];
    if (app.page === page) return;
    app.page = page;
    els.main.textContent = '';
    els.main.appendChild(els.nodata);
    const holder = h('div');
    els.main.appendChild(holder);
    try { app.pageApi = page.mount(holder, app); } catch (e) { console.error(e); app.pageApi = null; }
    els.main.scrollTop = 0;
    txt(els.title, page.title);
    document.title = page.title + ' · SCADA XL-335B';
    Object.entries(els.navLinks).forEach(([pid, l]) => cls(l.a, 'active', pid === page.id));
    noDataBanner(true);
    if (app.last && !stale()) { try { app.pageApi.update(app.last); } catch (e) { console.error(e); } cls(els.nodata, 'hidden', true); }
  }
  app.navigate = id => { location.hash = '#/' + id; };

  // ------------------------------------------------------------------ barras
  function renderChrome() {
    const m = app.last;
    const live = !stale();
    // conexion
    const pill = els.conn;
    let kind = '', label = 'Desconectado';
    if (app.mode === 'serial') { kind = live ? 'ok' : 'bad'; label = live ? 'PLC 1 en línea' : 'PLC sin respuesta'; }
    else if (app.mode === 'demo') { kind = 'demo'; label = 'Demostración'; }
    else if (app.mode === 'linked') { kind = live ? 'linked' : 'bad'; label = live ? (app.parentMode === 'demo' ? 'Enlazada (demo)' : 'Enlazada') : 'Sin datos'; }
    pill.className = 'conn-pill ' + kind;
    txt(pill.lastChild, label);
    cls(pill.firstChild, 'on', live && app.mode !== 'off');
    cls(pill.firstChild, 'blink', live && app.mode === 'serial');
    const connected = app.mode === 'serial' || app.mode === 'demo';
    txt(els.connBtn.lastChild, connected ? 'Desconectar' : 'Conectar PLC');
    els.connBtn.className = 'btn ' + (connected ? '' : 'primary');
    // baliza
    const lamps = els.beacon.children;
    const b = m && live ? m.beacon : 0;
    lamps[0].className = 'r' + (bit(b, 3) || bit(b, 4) ? ' on' : '') + (bit(b, 4) ? ' blink' : '');
    lamps[1].className = 'y' + (bit(b, 1) || bit(b, 2) ? ' on' : '') + (bit(b, 2) ? ' blink' : '');
    lamps[2].className = 'g' + (bit(b, 0) ? ' on' : '');
    // navegacion: puntos de estado y contador de alarmas
    Object.values(els.navLinks).forEach(l => {
      if (l.st && l.extra) {
        const k = m && live ? m.st[l.st.id].kind : '';
        l.extra.className = 'nav-dot ' + ({ ok: 'ok', run: 'ok', warn: 'warn', bad: 'bad', idle: 'idle' }[k] || '');
      }
    });
    const badge = els.navLinks.alarmas.extra;
    const n = alarms.count('bad') + alarms.count('warn');
    txt(badge, String(n));
    cls(badge, 'hidden', !n);
    badge.style.background = alarms.count('bad') ? 'var(--bad)' : 'var(--warn)';
    // pie
    const s = app.client ? app.client.stats : app.linkedStats;
    txt(els.footStats, app.mode === 'demo' ? 'Datos simulados' : s ? 'TX ' + fmt(s.tx) + ' · RX ' + fmt(s.rx) + ' · errores ' + fmt(s.crc + s.timeouts + s.exceptions) + ' · ' + s.latency + ' ms' : 'Sin enlace');
    txt(els.footTime, app.lastData ? 'Actualizado ' + XL.fmtTime(app.lastData) : '');
    const top = alarms.list()[0];
    txt(els.ticker, top ? top.def.title : (m && live ? 'Sin alarmas' : ''));
    cls(els.ticker, 'bad', !!top && top.def.sev === 'bad');
    document.title = (n ? '(' + n + ') ' : '') + (app.page ? app.page.title : 'SCADA') + ' · SCADA XL-335B';
  }

  function render() {
    renderChrome();
    const showBanner = stale();
    if (showBanner) noDataBanner();
    cls(els.nodata, 'hidden', !showBanner);
  }

  // ------------------------------------------------------------------ inicio
  function init() {
    applyTheme();
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
    buildShell();
    window.addEventListener('hashchange', route);
    route();
    render();
    setInterval(() => {
      txt(els.clock, new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
      if (stale()) render();
    }, 1000);
    if (app.isPopup) {
      const hello = () => { if (window.opener && !window.opener.closed && stale()) window.opener.postMessage({ xl335b: 'hello' }, '*'); };
      hello();
      setInterval(hello, 2000);
    }
    // Reconexion automatica si el navegador ya tiene permiso sobre un puerto
    if (!app.isPopup && XL.ModbusClient.supported() && store.get('autoconnect', false)) {
      navigator.serial.getPorts().then(ports => { if (ports.length === 1) autoConnect(ports[0]); });
    }
  }

  async function autoConnect(port) {
    const c = new XL.ModbusClient();
    try {
      await c.connect({ port, slave: app.settings.slave, baud: app.settings.baud, parity: app.settings.parity, timeoutMs: app.settings.timeout });
      app.client = c; app.mode = 'serial';
      c.onDisconnect = () => { if (app.mode === 'serial') { app.mode = 'off'; render(); } };
      pollLoop(c); render();
    } catch (e) { /* el usuario conectara a mano */ }
  }

  // Recordar que se uso el puerto para reconectar sola la proxima vez
  const origConnect = app.connect;
  app.connect = async () => { await origConnect(); if (app.mode === 'serial') store.set('autoconnect', true); };
  const origDisconnect = app.disconnect;
  app.disconnect = async silent => { if (!silent) store.set('autoconnect', false); await origDisconnect(silent); };

  document.addEventListener('DOMContentLoaded', init);
})(window.XL);
