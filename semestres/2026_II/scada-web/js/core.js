/* =============================================================================
   SCADA XL-335B - Utilidades comunes (sin dependencias externas)
   Scripts clasicos (no modulos) para que funcione abriendo index.html con doble clic.
   ============================================================================= */
'use strict';
window.XL = window.XL || {};

(function (XL) {
  const SVGNS = 'http://www.w3.org/2000/svg';

  // Crea un elemento HTML: h('div', {class:'x', onclick:fn}, [hijos o texto])
  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    applyAttrs(el, attrs);
    append(el, children);
    return el;
  }

  // Crea un elemento SVG con la misma firma que h()
  function s(tag, attrs, children) {
    const el = document.createElementNS(SVGNS, tag);
    applyAttrs(el, attrs, true);
    append(el, children);
    return el;
  }

  function applyAttrs(el, attrs, isSvg) {
    if (!attrs) return;
    for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (!isSvg && (k === 'value' || k === 'checked' || k === 'disabled')) el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }

  function append(el, children) {
    if (children === undefined || children === null || children === false) return;
    if (!Array.isArray(children)) children = [children];
    for (const c of children) {
      if (c === undefined || c === null || c === false) continue;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
  }

  // Cambia una clase solo si hace falta (evita trabajo del navegador en cada sondeo)
  function cls(el, name, on) {
    if (!el) return;
    if (el.classList.contains(name) !== !!on) el.classList.toggle(name, !!on);
  }
  function txt(el, value) {
    if (!el) return;
    const v = value === undefined || value === null ? '' : String(value);
    if (el.textContent !== v) el.textContent = v;
  }
  function attr(el, name, value) {
    if (!el) return;
    const v = String(value);
    if (el.getAttribute(name) !== v) el.setAttribute(name, v);
  }

  // Formato numerico es-ES con decimales fijos
  function fmt(n, dec) {
    if (n === undefined || n === null || Number.isNaN(n)) return '—';
    return Number(n).toLocaleString('es-ES', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }
  function fmtTime(d) {
    const t = d instanceof Date ? d : new Date(d);
    return t.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  function fmtDateTime(d) {
    const t = d instanceof Date ? d : new Date(d);
    return t.toLocaleDateString('es-ES') + ' ' + fmtTime(t);
  }
  function fmtDuration(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return s + ' s';
    const m = Math.floor(s / 60);
    if (m < 60) return m + ' min ' + (s % 60) + ' s';
    return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
  }
  function bit(v, n) { return (v >> n) & 1; }
  function hex(v, w) { return (v >>> 0).toString(16).toUpperCase().padStart(w || 2, '0'); }
  function bin(v, w) { return (v >>> 0).toString(2).padStart(w || 8, '0'); }

  // Almacenamiento local protegido (puede no estar disponible)
  const store = {
    get(key, def) {
      try {
        const v = localStorage.getItem('xl335b.' + key);
        return v === null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set(key, value) {
      try { localStorage.setItem('xl335b.' + key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento */ }
    }
  };

  // Bus de eventos minimo
  const listeners = {};
  const bus = {
    on(name, fn) { (listeners[name] = listeners[name] || []).push(fn); },
    emit(name, data) { (listeners[name] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); }
  };

  // Avisos breves en la esquina inferior derecha
  function toast(message, kind) {
    let box = document.querySelector('.toasts');
    if (!box) { box = h('div', { class: 'toasts' }); document.body.appendChild(box); }
    const t = h('div', { class: 'toast ' + (kind || ''), text: message });
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 3200);
    setTimeout(() => t.remove(), 3600);
  }

  // Dialogo de confirmacion. Devuelve una promesa con true / false.
  function confirmDialog(opts) {
    return new Promise(resolve => {
      const back = h('div', { class: 'modal-back' });
      const close = ok => { back.remove(); document.removeEventListener('keydown', onKey); resolve(ok); };
      const onKey = e => { if (e.key === 'Escape') close(false); if (e.key === 'Enter') close(true); };
      const okBtn = h('button', { class: 'btn ' + (opts.danger ? 'bad' : 'primary'), text: opts.ok || 'Confirmar', onclick: () => close(true) });
      const modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, [
        h('h3', { text: opts.title || '¿Confirmar?' }),
        opts.text ? h('p', { text: opts.text }) : null,
        opts.body ? h('div', { class: 'modal-body' }, opts.body) : null,
        h('div', { class: 'modal-actions' }, [
          h('button', { class: 'btn ghost', text: opts.cancel || 'Cancelar', onclick: () => close(false) }),
          okBtn
        ])
      ]);
      back.addEventListener('click', e => { if (e.target === back) close(false); });
      back.appendChild(modal);
      document.body.appendChild(back);
      document.addEventListener('keydown', onKey);
      okBtn.focus();
    });
  }

  // Iconos de trazo (24x24)
  const ICONS = {
    plant: 'M3 21h18M5 21V10l5 3V10l5 3V7l4 2v12M8 17h1m3 0h1m3 0h1',
    rail: 'M3 18h18M5 18v-3h14v3M8 15V9h8v6M10 9V6h4v3',
    feed: 'M9 3h6v10H9zM9 7h6M9 10h6M5 17h14M15 13l3 4M6 21h12',
    puzzle: 'M10 3h4v3a2 2 0 1 0 4 0V3h3v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3V3h7z',
    press: 'M6 3h12v4H6zM12 7v6M8 13h8v3H8zM4 20h16M7 16v4m10-4v4',
    belt: 'M3 9h18v6H3zM6 12h.01M18 12h.01M10 12h4M7 18l-2 3m14-3 2 3',
    robot: 'M5 21h8M9 21v-4l-3-5 6-4 5 3M17 11l2 3h-3M6 12a2 2 0 1 0 0-.01M12 8a2 2 0 1 0 0-.01',
    bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
    chart: 'M4 20V4M4 20h16M8 16v-4m4 4V8m4 8v-6',
    pulse: 'M3 12h4l2-6 4 12 2-6h6',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    plug: 'M9 2v6m6-6v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4',
    play: 'M7 4l13 8-13 8z',
    pause: 'M7 4h4v16H7zM13 4h4v16h-4z',
    stop: 'M6 6h12v12H6z',
    reset: 'M4 4v6h6M20 20v-6h-6M5 15a8 8 0 0 0 14 2M19 9A8 8 0 0 0 5 7',
    flag: 'M5 21V4h11l-2 4 2 4H5',
    home: 'M3 11l9-7 9 7M5 10v10h14V10',
    left: 'M15 5l-7 7 7 7',
    right: 'M9 5l7 7-7 7',
    step: 'M5 12h11M12 6l6 6-6 6',
    window: 'M4 5h16v14H4zM4 9h16M14 13h4v4',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-5m0-3h.01',
    warn: 'M12 3l10 18H2zM12 10v4m0 3h.01',
    check: 'M20 6 9 17l-5-5',
    download: 'M12 3v12m-5-5 5 5 5-5M4 21h16',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
    demo: 'M4 4h16v12H4zM8 20h8M12 16v4M9 8l6 2-6 2z',
    link: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01'
  };
  function icon(name, extra) {
    const svg = s('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'ico' + (extra ? ' ' + extra : '') });
    svg.appendChild(s('path', { d: ICONS[name] || ICONS.info }));
    return svg;
  }

  Object.assign(XL, { h, s, cls, txt, attr, fmt, fmtTime, fmtDateTime, fmtDuration, bit, hex, bin, store, bus, toast, confirmDialog, icon, SVGNS });
})(window.XL);
