/* Planta XK-335B - lógica del sitio. Los datos vienen de web/data/catalogo.js */
(function () {
  'use strict';

  const C = window.CATALOGO;
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));

  if (!C) {
    $('#app').innerHTML = '<div class="empty">No se encontró <span class="inline-code">web/data/catalogo.js</span>. ' +
      'Ejecute <span class="inline-code">node scripts/build-catalog.js</span> en la carpeta del repositorio.</div>';
    return;
  }

  // ---------------------------------------------------------------- utilidades
  const LIBS = {
    marked: 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js',
    purify: 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js',
    hljs: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
    hljsMatlab: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/matlab.min.js',
    katex: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js',
    katexAuto: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js',
    katexCss: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css',
    mermaid: 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js',
    chart: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js',
    mammoth: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
    drawio: 'https://viewer.diagrams.net/js/viewer-static.min.js'
  };
  const cargados = {};
  function cargar(src) {
    if (!cargados[src]) {
      cargados[src] = new Promise((ok, mal) => {
        if (src.endsWith('.css')) {
          const l = document.createElement('link');
          l.rel = 'stylesheet'; l.href = src; l.onload = ok; l.onerror = mal;
          document.head.appendChild(l);
        } else {
          const s = document.createElement('script');
          s.src = src; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar ' + src));
          document.head.appendChild(s);
        }
      });
    }
    return cargados[src];
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const urlDe = ruta => ruta.split('/').map(encodeURIComponent).join('/');
  const urlArchivo = a => a.github || urlDe(a.ruta);
  const carpetaDe = ruta => ruta.includes('/') ? ruta.slice(0, ruta.lastIndexOf('/')) : '';

  function tamano(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  const ICONOS = {
    ver: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    bajar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg>',
    carpeta: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6a2 2 0 0 1 2-2h4.6l2 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/></svg>',
    carpetaLinea: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 6a2 2 0 0 1 2-2h4.6l2 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/></svg>',
    archivo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/></svg>',
    enlace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/></svg>'
  };

  // Programa necesario para abrir lo que no se ve en el navegador
  const PROGRAMAS = {
    dwg: 'AutoCAD', dxf: 'AutoCAD', aepx: 'AutoCAD Electrical', wdp: 'AutoCAD Electrical',
    mwp: 'STEP 7-Micro/WIN', pca: 'S7-200 PC Access', mce: 'MCGS',
    slx: 'Simulink', mlx: 'MATLAB', ct: 'FluidSIM',
    pptx: 'PowerPoint', ppt: 'PowerPoint', xlsx: 'Excel', xlsm: 'Excel', xls: 'Excel', doc: 'Word',
    sldprt: 'SolidWorks', sldasm: 'SolidWorks', slddrw: 'SolidWorks', step: 'un programa CAD', stp: 'un programa CAD', stl: 'un programa CAD'
  };

  // ---------------------------------------------------------------- datos base
  const ARCHIVOS = C.archivos;
  const POR_RUTA = new Map(ARCHIVOS.map(a => [a.ruta, a]));
  const EST = new Map(C.estaciones.map(e => [e.id, e]));
  const SEM = new Map(C.semestres.map(s => [s.id, s]));
  const ORDEN_CAT = Object.keys(C.categorias);

  const etiquetaSem = id => id === 'global' ? 'Global' : (SEM.get(id) || { etiqueta: id }).etiqueta;
  const rangoSem = id => id === C.actual ? 0 : id === 'global' ? 1 : 2;

  function ordenar(a, b) {
    return rangoSem(a.semestre) - rangoSem(b.semestre)
      || (a.semestre < b.semestre ? 1 : a.semestre > b.semestre ? -1 : 0)
      || (a.orden ?? 999) - (b.orden ?? 999)
      || ORDEN_CAT.indexOf(a.categoria) - ORDEN_CAT.indexOf(b.categoria)
      || a.ruta.localeCompare(b.ruta, 'es', { numeric: true });
  }

  const textoBusqueda = new Map();
  function coincide(a, q) {
    if (!q) return true;
    let t = textoBusqueda.get(a);
    if (!t) {
      t = norm([a.titulo, a.ruta, a.descripcion, a.lenguaje, C.categorias[a.categoria], etiquetaSem(a.semestre),
        ...a.estaciones.map(id => (EST.get(id) || {}).nombre)].join(' '));
      textoBusqueda.set(a, t);
    }
    return norm(q).split(/\s+/).filter(Boolean).every(p => t.includes(p));
  }

  // ---------------------------------------------------------------- tema
  function temaOscuro() {
    const t = document.documentElement.dataset.theme;
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }
  $('#btnTema').addEventListener('click', () => {
    const nuevo = temaOscuro() ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    try { localStorage.setItem('tema', nuevo); } catch (e) { /* sin almacenamiento */ }
  });

  // ---------------------------------------------------------------- inicio
  function pintarInicio() {
    const visibles = ARCHIVOS.filter(a => !a.recurso);
    const cuenta = f => visibles.filter(f).length;
    $('#stats').innerHTML = [
      [C.semestres.length, 'Semestres'],
      [visibles.length, 'Archivos'],
      [cuenta(a => a.categoria === 'programa'), 'Programas'],
      [cuenta(a => a.categoria === 'datasheet'), 'Datasheets']
    ].map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`).join('');

    $('#unidades').innerHTML = C.estaciones.map(e => `
      <button class="unit" data-est="${e.id}">
        <span class="num">${e.id}</span>
        <strong>${esc(e.nombre)}</strong>
        <small>${esc(e.cpu)}</small>
        <em>${cuenta(a => a.estaciones.includes(e.id))} archivos</em>
      </button>`).join('');
    $$('#unidades .unit').forEach(b => b.addEventListener('click', () => {
      filtrarYMostrar('documentos', { est: b.dataset.est, sem: 'all', cat: 'all', q: '' });
    }));

    $('#semestres').innerHTML = C.semestres.map(s => `
      <article class="sem-card ${s.id === C.actual ? 'actual' : ''}">
        <header><h3>${esc(s.etiqueta)}</h3>${s.id === C.actual ? '<span class="tag-actual">En curso</span>' : ''}</header>
        <p>${esc(s.resumen || 'Sin descripción.')}</p>
        <footer>
          <button class="btn btn-sm" data-sem="${s.id}">${s.archivos} archivos</button>
          <a class="btn btn-sm" href="#repositorio/semestres/${encodeURIComponent(s.id)}">${ICONOS.carpetaLinea} Carpeta</a>
        </footer>
      </article>`).join('');
    $$('#semestres [data-sem]').forEach(b => b.addEventListener('click', () => {
      filtrarYMostrar('documentos', { sem: b.dataset.sem, est: 'all', cat: 'all', q: '' });
    }));

    $('#heroFoto').addEventListener('click', () => abrirVisor({
      ruta: 'web/img/maqueta_xk335b.png', titulo: 'Planta XK-335B', vista: 'imagen', nombre: 'maqueta_xk335b.png'
    }));

    const fecha = new Date(C.generado);
    if (!isNaN(fecha)) {
      $('#pieGenerado').textContent = `UMSA · Laboratorio de Control · catálogo actualizado el ${fecha.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    }
  }

  // Al elegir un semestre también se muestra lo global (datasheets, manuales, 3D)
  const enSemestre = (sem, filtro) => filtro === 'all' || sem === filtro || (filtro !== 'global' && sem === 'global');

  // Sección = primera carpeta dentro del semestre (o dentro de global)
  function seccionDe(a) {
    const partes = a.ruta.split('/');
    const resto = a.semestre === 'global' ? partes.slice(1, -1) : partes.slice(2, -1);
    return resto[0] || '';
  }
  const ORDEN_SEC = Object.keys(C.carpetas || {});
  function etiquetaSeccion(sec) {
    if (!sec) return 'General';
    if (C.carpetas && C.carpetas[sec]) return C.carpetas[sec];
    const t = sec.replace(/^\d+[_.\s-]*/, '').replace(/[_-]+/g, ' ').trim() || sec;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function ordenSeccion(x, y) {
    const ix = ORDEN_SEC.indexOf(x), iy = ORDEN_SEC.indexOf(y);
    return (ix < 0 ? 999 : ix) - (iy < 0 ? 999 : iy) || x.localeCompare(y, 'es', { numeric: true });
  }

  // ---------------------------------------------------------------- listas (documentos / programas)
  const LISTAS = {
    documentos: {
      base: ARCHIVOS.filter(a => !a.recurso && !['programa', 'basedatos', 'imagen', 'video'].includes(a.categoria)),
      grupo: a => a.categoria,
      etiquetaGrupo: k => C.categorias[k] || k,
      estado: { q: '', sem: C.actual, est: 'all', cat: 'all', limite: 60 }
    },
    codigos: {
      base: ARCHIVOS.filter(a => !a.recurso && ['programa', 'basedatos'].includes(a.categoria)),
      grupo: a => a.lenguaje,
      etiquetaGrupo: k => k,
      estado: { q: '', sem: C.actual, est: 'all', cat: 'all', limite: 60 }
    }
  };
  Object.values(LISTAS).forEach(l => l.base.sort(ordenar));

  function opcionesSemestre(sel, conTodos = true) {
    const ids = [C.actual, ...C.semestres.map(s => s.id).filter(id => id !== C.actual)];
    sel.innerHTML = (conTodos ? '<option value="all">Todos los semestres</option>' : '') +
      ids.map(id => `<option value="${id}">${esc(etiquetaSem(id))}${id === C.actual ? ' (actual)' : ''}</option>`).join('') +
      '<option value="global">Global (datasheets, manuales, 3D)</option>';
  }
  function opcionesEstacion(sel) {
    sel.innerHTML = '<option value="all">Todas las unidades</option>' +
      C.estaciones.map(e => `<option value="${e.id}">${e.id}. ${esc(e.nombre)}</option>`).join('');
  }

  function iniciarLista(nombre) {
    const L = LISTAS[nombre];
    const vista = $('#vista-' + nombre);
    const panel = $('.filters', vista);
    const inp = $('[data-f="q"]', panel);
    const limpiar = $('.clear', panel);
    opcionesSemestre($('[data-f="sem"]', panel));
    opcionesEstacion($('[data-f="est"]', panel));

    let temporizador;
    inp.addEventListener('input', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => { L.estado.q = inp.value.trim(); L.estado.limite = 60; pintarLista(nombre); }, 120);
    });
    limpiar.addEventListener('click', () => { inp.value = ''; L.estado.q = ''; pintarLista(nombre); inp.focus(); });
    $$('select', panel).forEach(s => s.addEventListener('change', () => {
      L.estado[s.dataset.f] = s.value; L.estado.limite = 60; pintarLista(nombre);
    }));
    $('[data-f="cat"]', panel).addEventListener('click', e => {
      const b = e.target.closest('.pill');
      if (!b) return;
      L.estado.cat = b.dataset.v; L.estado.limite = 60; pintarLista(nombre);
    });
  }

  function pintarLista(nombre) {
    const L = LISTAS[nombre];
    const st = L.estado;
    const vista = $('#vista-' + nombre);
    const panel = $('.filters', vista);
    $('[data-f="q"]', panel).value = st.q;
    $('.clear', panel).classList.toggle('hidden', !st.q);
    $('[data-f="sem"]', panel).value = st.sem;
    $('[data-f="est"]', panel).value = st.est;

    const previos = L.base.filter(a =>
      enSemestre(a.semestre, st.sem) &&
      (st.est === 'all' || a.estaciones.includes(+st.est)) &&
      coincide(a, st.q));

    // Píldoras con conteo según los demás filtros
    const conteo = {};
    previos.forEach(a => { const g = L.grupo(a); conteo[g] = (conteo[g] || 0) + 1; });
    const grupos = Object.keys(conteo).sort((x, y) => nombre === 'documentos'
      ? ORDEN_CAT.indexOf(x) - ORDEN_CAT.indexOf(y) : conteo[y] - conteo[x]);
    if (st.cat !== 'all' && !conteo[st.cat]) grupos.push(st.cat);
    $('[data-f="cat"]', panel).innerHTML =
      `<button class="pill ${st.cat === 'all' ? 'active' : ''}" data-v="all">Todos <span class="count">${previos.length}</span></button>` +
      grupos.map(g => `<button class="pill ${st.cat === g ? 'active' : ''}" data-v="${esc(g)}">${esc(L.etiquetaGrupo(g))} <span class="count">${conteo[g] || 0}</span></button>`).join('');

    const lista = st.cat === 'all' ? previos : previos.filter(a => L.grupo(a) === st.cat);
    $('.results', panel).textContent = lista.length === L.base.length
      ? `${lista.length} archivos`
      : `${lista.length} de ${L.base.length} archivos`;

    const cont = $('.lista', vista);
    if (!lista.length) {
      cont.innerHTML = '<div class="empty">No hay archivos con esos filtros.</div>';
      return;
    }
    const porSemestre = st.sem === 'all';
    if (!porSemestre) {
      const orden = nombre === 'documentos'
        ? g => ORDEN_CAT.indexOf(g)
        : g => grupos.indexOf(g);
      lista.sort((x, y) => orden(L.grupo(x)) - orden(L.grupo(y)) || ordenar(x, y));
    }
    const mostrar = lista.slice(0, st.limite);
    let html = '';
    let grupoActual = null;
    let abierto = false;
    for (const a of mostrar) {
      const g = porSemestre ? a.semestre : L.grupo(a);
      if (g !== grupoActual) {
        if (abierto) html += '</div>';
        grupoActual = g;
        const titulo = porSemestre
          ? etiquetaSem(g) + (g === C.actual ? ' · en curso' : '')
          : L.etiquetaGrupo(g);
        html += `<div class="group-title">${esc(titulo)}</div><div class="grid">`;
        abierto = true;
      }
      html += tarjeta(a);
    }
    if (abierto) html += '</div>';
    if (lista.length > mostrar.length) {
      html += `<div class="more"><button class="btn" data-mas>Mostrar más (${lista.length - mostrar.length} restantes)</button></div>`;
    }
    cont.innerHTML = html;
    const mas = $('[data-mas]', cont);
    if (mas) mas.addEventListener('click', () => { st.limite += 90; pintarLista(nombre); });
  }

  function tarjeta(a) {
    const carpeta = carpetaDe(a.ruta);
    const est = a.estaciones.length >= 5 ? '<span class="chip">Todas las unidades</span>'
      : a.estaciones.map(id => `<span class="chip">${esc((EST.get(id) || { nombre: id }).nombre)}</span>`).join('');
    const etiqueta = a.categoria === 'programa' || a.categoria === 'basedatos' ? a.lenguaje : C.categorias[a.categoria];
    return `
      <article class="card">
        <div class="card-top">
          <span class="badge badge-cat cat-${a.categoria}">${esc(etiqueta)}</span>
          <span class="badge badge-sem ${a.semestre === C.actual ? 'actual' : ''}">${esc(etiquetaSem(a.semestre))}</span>
          <span class="meta">${a.externo ? 'enlace' : esc(a.ext) + ' · ' + tamano(a.tam)}</span>
        </div>
        <h3>${esc(a.titulo)}</h3>
        <div class="path"><a href="#repositorio/${urlDe(carpeta)}" title="Abrir carpeta">${esc(a.ruta)}</a></div>
        ${a.descripcion ? `<p class="desc">${esc(a.descripcion)}</p>` : ''}
        ${est ? `<div class="chips">${est}</div>` : ''}
        <div class="card-actions">${botones(a)}</div>
      </article>`;
  }

  function botones(a) {
    const carpeta = `<a class="btn btn-sm" href="#repositorio/${urlDe(carpetaDe(a.ruta))}" title="Abrir carpeta">${ICONOS.carpetaLinea}</a>`;
    if (a.externo) {
      return `<a class="btn btn-sm btn-primary" href="${esc(a.externo)}" target="_blank" rel="noopener">${ICONOS.enlace} Abrir enlace</a>${carpeta}`;
    }
    if (a.github) {
      return `<a class="btn btn-sm btn-primary" href="${esc(a.github)}" target="_blank" rel="noopener" title="Archivo de más de 25 MB, se descarga desde GitHub">${ICONOS.github} Descargar (GitHub)</a>${carpeta}`;
    }
    if (a.vista) {
      return `<a class="btn btn-sm btn-primary" href="#ver/${urlDe(a.ruta)}">${ICONOS.ver} Ver</a>` +
        `<a class="btn btn-sm" href="${urlArchivo(a)}" download title="Descargar">${ICONOS.bajar}</a>${carpeta}`;
    }
    const prog = PROGRAMAS[a.ext] ? ` title="Se abre con ${esc(PROGRAMAS[a.ext])}"` : '';
    return `<a class="btn btn-sm btn-primary" href="${urlArchivo(a)}" download${prog}>${ICONOS.bajar} Descargar</a>${carpeta}`;
  }

  function filtrarYMostrar(nombre, filtros) {
    Object.assign(LISTAS[nombre].estado, filtros, { limite: 60 });
    if (location.hash === '#' + nombre) pintarLista(nombre);
    else location.hash = nombre;
  }

  // ---------------------------------------------------------------- galería
  const galeria = { tab: 'fotos', sem: C.actual, est: 'all' };
  const FOTOS = ARCHIVOS.filter(a => a.categoria === 'imagen' && !a.recurso).sort(ordenar);
  const VIDEOS_DRIVE = ARCHIVOS.filter(a => a.categoria === 'video').sort(ordenar);

  function idYoutube(url) {
    const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function iniciarGaleria() {
    opcionesSemestre($('#galSem'));
    opcionesEstacion($('#galEst'));
    $('#galSem').value = galeria.sem;
    $('#galTabs').addEventListener('click', e => {
      const b = e.target.closest('.tab');
      if (!b) return;
      galeria.tab = b.dataset.tab;
      $$('#galTabs .tab').forEach(t => t.classList.toggle('active', t === b));
      pintarGaleria();
    });
    $('#galSem').addEventListener('change', e => { galeria.sem = e.target.value; pintarGaleria(); });
    $('#galEst').addEventListener('change', e => { galeria.est = e.target.value; pintarGaleria(); });
  }

  function pasaFiltro(semestre, estaciones) {
    return (galeria.sem === 'all' || semestre === galeria.sem) &&
      (galeria.est === 'all' || (estaciones || []).includes(+galeria.est));
  }

  function tarjetaFoto(a) {
    const sub = carpetaDe(a.ruta).split('/').slice(a.semestre === 'global' ? 2 : 3).join(' / ');
    return `
      <a class="shot" href="#ver/${urlDe(a.ruta)}">
        <div class="thumb"><img src="${urlArchivo(a)}" alt="${esc(a.titulo)}" loading="lazy"></div>
        <div class="info"><strong>${esc(a.titulo)}</strong>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
      </a>`;
  }

  function pintarGaleria() {
    const cont = $('#galeria');
    const fotos = FOTOS.filter(a => pasaFiltro(a.semestre, a.estaciones));
    const videosYt = C.videos.map((v, i) => [v, i]).filter(([v]) => pasaFiltro(v.semestre, v.estaciones));
    const videosDrive = VIDEOS_DRIVE.filter(a => pasaFiltro(a.semestre, a.estaciones));
    $('#galTabs [data-tab="fotos"]').textContent = `Fotos y diagramas (${fotos.length})`;
    $('#galTabs [data-tab="videos"]').textContent = `Videos (${videosYt.length + videosDrive.length})`;
    let html = '';
    if (galeria.tab === 'fotos') {
      // Agrupadas por semestre y sección (diagramas de bloques, diagnóstico Kaizen, ...)
      const grupos = new Map();
      for (const a of fotos) {
        const k = a.semestre + '|' + seccionDe(a);
        if (!grupos.has(k)) grupos.set(k, []);
        grupos.get(k).push(a);
      }
      const claves = [...grupos.keys()].sort((x, y) => {
        const [sx, cx] = x.split('|'), [sy, cy] = y.split('|');
        return rangoSem(sx) - rangoSem(sy) || (sx < sy ? 1 : sx > sy ? -1 : 0) || ordenSeccion(cx, cy);
      });
      html = claves.map(k => {
        const [sem, sec] = k.split('|');
        const titulo = (galeria.sem === 'all' ? etiquetaSem(sem) + ' · ' : '') + etiquetaSeccion(sec);
        const items = grupos.get(k);
        return `<div class="group-title">${esc(titulo)} <span class="count">${items.length}</span></div>
          <div class="gallery">${items.map(tarjetaFoto).join('')}</div>`;
      }).join('');
    } else {
      const items = videosYt.map(([v, i]) => {
        const id = idYoutube(v.url);
        return `
        <button class="shot" data-video="${i}">
          <div class="thumb">${id ? `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy">` : '<div class="noimg">▶</div>'}
            <div class="play"><span>▶</span></div></div>
          <div class="info"><strong>${esc(v.titulo)}</strong><small>${esc(etiquetaSem(v.semestre))}${v.descripcion ? ' · ' + esc(v.descripcion) : ''}</small></div>
        </button>`;
      }).join('') + videosDrive.map(a => `
        <a class="shot" ${a.externo ? `href="${esc(a.externo)}" target="_blank" rel="noopener"` : `href="#ver/${urlDe(a.ruta)}"`}>
          <div class="thumb"><div class="noimg">▶</div></div>
          <div class="info"><strong>${esc(a.titulo)}</strong><small>${esc(etiquetaSem(a.semestre))} · ${a.externo ? 'Google Drive' : esc(a.ext)}</small></div>
        </a>`).join('');
      if (items) html = `<div class="gallery">${items}</div>`;
    }
    cont.innerHTML = html || `<div class="empty">${galeria.tab === 'videos' ? 'No hay videos en este semestre.' : 'No hay imágenes con esos filtros.'}</div>`;
    $$('[data-video]', cont).forEach(b => b.addEventListener('click', () => {
      const v = C.videos[+b.dataset.video];
      const id = idYoutube(v.url);
      if (!id) { window.open(v.url, '_blank', 'noopener'); return; }
      abrirVisor({ titulo: v.titulo, ruta: v.url, vista: 'youtube', youtube: id, externo: v.url });
    }));
  }

  // ---------------------------------------------------------------- repositorio
  function hijosDe(dir) {
    const pref = dir ? dir + '/' : '';
    const carpetas = new Map();
    const archivos = [];
    for (const a of ARCHIVOS) {
      if (!a.ruta.startsWith(pref)) continue;
      const resto = a.ruta.slice(pref.length);
      const i = resto.indexOf('/');
      if (i === -1) archivos.push(a);
      else {
        const n = resto.slice(0, i);
        carpetas.set(n, (carpetas.get(n) || 0) + 1);
      }
    }
    return { carpetas, archivos };
  }

  function pintarRepositorio(dir) {
    dir = dir.replace(/\/+$/, '');
    const { carpetas, archivos } = hijosDe(dir);
    if (dir && !carpetas.size && !archivos.length) {
      $('#filas').innerHTML = '<li class="empty" style="border:0">Esta carpeta no existe o está vacía.</li>';
    }
    const partes = dir ? dir.split('/') : [];
    $('#crumbs').innerHTML = `<a href="#repositorio">maqueta-manufactura-xk335b</a>` +
      partes.map((p, i) => `<span>/</span><a href="#repositorio/${urlDe(partes.slice(0, i + 1).join('/'))}">${esc(p)}</a>`).join('') +
      `<a class="gh" href="https://github.com/${C.repo}/tree/${C.rama}/${urlDe(dir)}" target="_blank" rel="noopener">Ver en GitHub ↗</a>`;

    const nombresCarpeta = [...carpetas.keys()].sort((a, b) =>
      dir === 'semestres' ? b.localeCompare(a) : a.localeCompare(b, 'es', { numeric: true }));
    let html = '';
    if (dir) {
      html += `<li><a class="row" href="#repositorio/${urlDe(partes.slice(0, -1).join('/'))}"><span class="ico dir">${ICONOS.carpeta}</span><span class="name">..</span><span></span><span></span></a></li>`;
    }
    html += nombresCarpeta.map(n => {
      const ruta = dir ? dir + '/' + n : n;
      let sub = '';
      if (dir === 'semestres' && SEM.get(n)) sub = SEM.get(n).resumen;
      return `<li><a class="row" href="#repositorio/${urlDe(ruta)}">
        <span class="ico dir">${ICONOS.carpeta}</span>
        <span class="name">${esc(dir === 'semestres' ? etiquetaSem(n) + '  ·  ' + n : n)}</span>
        <span class="sub">${esc(sub)}</span>
        <span class="info">${carpetas.get(n)} arch.</span></a></li>`;
    }).join('');
    html += archivos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true })).map(a => {
      const destino = a.externo ? `href="${esc(a.externo)}" target="_blank" rel="noopener"`
        : a.github ? `href="${esc(a.github)}" target="_blank" rel="noopener"`
        : a.vista ? `href="#ver/${urlDe(a.ruta)}"`
        : `href="${urlArchivo(a)}" download`;
      const sub = a.externo ? 'enlace externo' : a.github ? 'se descarga desde GitHub' : (!a.vista && PROGRAMAS[a.ext] ? PROGRAMAS[a.ext] : '');
      return `<li><a class="row" ${destino}>
        <span class="ico">${a.externo ? ICONOS.enlace : ICONOS.archivo}</span>
        <span class="name">${esc(a.nombre)}</span>
        <span class="sub">${esc(sub)}</span>
        <span class="info">${a.externo ? '' : tamano(a.tam)}</span></a></li>`;
    }).join('');
    $('#filas').innerHTML = html;

    const readme = archivos.find(a => /^readme\.md$/i.test(a.nombre));
    const caja = $('#readme');
    if (readme) {
      caja.classList.remove('hidden');
      $('#readmeHead').innerHTML = `${ICONOS.archivo.replace('<svg', '<svg width="15" height="15"')} ${esc(readme.nombre)}`;
      const cuerpo = $('#readmeBody');
      cuerpo.innerHTML = '<div class="loading">Cargando…</div>';
      fetch(urlArchivo(readme)).then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
        .then(t => renderMarkdown(t, dir, cuerpo))
        .catch(() => { cuerpo.innerHTML = '<p>No se pudo cargar el README.</p>'; });
    } else {
      caja.classList.add('hidden');
    }
  }

  // ---------------------------------------------------------------- markdown
  function resolver(base, rel) {
    const limpio = rel.split('#')[0].split('?')[0];
    let dec;
    try { dec = decodeURIComponent(limpio); } catch (e) { dec = limpio; }
    const partes = (base ? base.split('/') : []);
    for (const p of dec.split('/')) {
      if (p === '..') partes.pop();
      else if (p && p !== '.') partes.push(p);
    }
    return partes.join('/');
  }

  function slug(texto) {
    return norm(texto).trim().replace(/[^\w\s-]/g, '').replace(/\s/g, '-');
  }

  async function renderMarkdown(texto, base, cont) {
    await Promise.all([cargar(LIBS.marked), cargar(LIBS.purify)]);

    // Las fórmulas se apartan antes de pasar por marked para que no se alteren
    const formulas = [];
    const apartar = m => { formulas.push(m); return `qqformula${formulas.length - 1}qq`; };
    texto = texto
      .replace(/\$\$[\s\S]+?\$\$/g, apartar)
      .replace(/\\\[[\s\S]+?\\\]/g, apartar)
      .replace(/\\\([\s\S]+?\\\)/g, apartar)
      .replace(/(^|[^\\$\w])(\$(?!\s)[^$\n]+?[^\s\\]\$)(?!\d)/g, (m, pre, f) => pre + apartar(f))
      .replace(/(^|[^\\$\w])(\$[^\s$]\$)(?!\d)/g, (m, pre, f) => pre + apartar(f));

    let html = window.marked.parse(texto, { gfm: true, breaks: false });
    html = window.DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
    html = html.replace(/qqformula(\d+)qq/g, (m, i) => esc(formulas[+i]));
    cont.innerHTML = html;
    cont.classList.add('markdown');

    // Encabezados con id, como en GitHub
    const usados = {};
    $$('h1,h2,h3,h4,h5,h6', cont).forEach(h => {
      let id = slug(h.textContent);
      if (usados[id] != null) id += '-' + (++usados[id]); else usados[id] = 0;
      h.id = id;
    });

    // Rutas relativas de imágenes y enlaces
    const externa = s => /^([a-z]+:|\/\/|data:)/i.test(s);
    $$('img[src]', cont).forEach(img => {
      const s = img.getAttribute('src');
      if (!externa(s)) {
        const r = resolver(base, s);
        const a = POR_RUTA.get(r);
        img.src = a ? urlArchivo(a) : urlDe(r);
      }
      img.loading = 'lazy';
    });
    $$('a[href]', cont).forEach(a => {
      const h = a.getAttribute('href');
      if (h.startsWith('#')) {
        a.addEventListener('click', e => {
          e.preventDefault();
          const destino = cont.querySelector('#' + CSS.escape(decodeURIComponent(h.slice(1))));
          if (destino) destino.scrollIntoView({ behavior: 'smooth' });
        });
        return;
      }
      if (externa(h)) { a.target = '_blank'; a.rel = 'noopener'; return; }
      const r = resolver(base, h);
      const arch = POR_RUTA.get(r);
      if (arch && arch.vista) a.href = '#ver/' + urlDe(r);
      else if (arch) { a.href = urlArchivo(arch); if (!arch.github) a.setAttribute('download', ''); }
      else if (ARCHIVOS.some(x => x.ruta.startsWith(r + '/'))) a.href = '#repositorio/' + urlDe(r);
      else a.href = urlDe(r);
    });

    // Diagramas Mermaid
    const mermaids = $$('pre code.language-mermaid', cont);
    if (mermaids.length) {
      mermaids.forEach(c => {
        const d = document.createElement('div');
        d.className = 'mermaid';
        d.textContent = c.textContent;
        c.parentElement.replaceWith(d);
      });
      cargar(LIBS.mermaid).then(() => {
        window.mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'strict' });
        return window.mermaid.run({ nodes: $$('.mermaid', cont) });
      }).catch(() => {});
    }

    // Resaltado de código
    const bloques = $$('pre code', cont);
    if (bloques.length) {
      cargar(LIBS.hljs).then(() => cargar(LIBS.hljsMatlab)).then(() => {
        bloques.forEach(b => {
          const lang = (b.className.match(/language-(\S+)/) || [])[1];
          if (lang && /^(awl|stl)$/i.test(lang)) b.innerHTML = resaltarAwl(b.textContent);
          else if (!lang || window.hljs.getLanguage(lang)) window.hljs.highlightElement(b);
        });
      }).catch(() => {});
    }

    // Fórmulas
    if (formulas.length) {
      cargar(LIBS.katexCss);
      cargar(LIBS.katex).then(() => cargar(LIBS.katexAuto)).then(() => {
        window.renderMathInElement(cont, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false }
          ],
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          throwOnError: false
        });
      }).catch(() => {});
    }
  }

  // ---------------------------------------------------------------- AWL
  const AWL_KW = /^(ORGANIZATION_BLOCK|SUBROUTINE_BLOCK|INTERRUPT_BLOCK|TITLE|BEGIN|END_ORGANIZATION_BLOCK|END_SUBROUTINE_BLOCK|END_INTERRUPT_BLOCK|VAR_INPUT|VAR_OUTPUT|VAR_IN_OUT|TEMP|END_VAR|VAR)\b/;
  const AWL_OP = /\b(LDN|LD|AN|A|ON|O|ALD|OLD|LPS|LRD|LPP|NOT|EU|ED|=I|=|S|R|SI|RI|TON|TOF|TONR|CTU|CTD|CTUD|MOVB|MOVW|MOVD|MOVR|BMB|BMW|\+I|-I|\*I|\/I|\+D|-D|\+R|-R|\*R|\/R|ITD|DTR|ROUND|TRUNC|AB=|AB<>|AB>=|AB<=|AB>|AB<|AW=|AW<>|AW>=|AW<=|AW>|AW<|AD=|AD<>|AD>=|AD<=|AD>|AD<|LDB=|LDB<>|LDB>=|LDB<=|LDB>|LDB<|LDW=|LDW<>|LDW>=|LDW<=|LDW>|LDW<|LDD=|LDD<>|LDD>=|LDD<=|LDD>|LDD<|LDR=|LDR>=|LDR<=|LDR>|LDR<|JMP|LBL|CALL|CRET|RET|RETI|FOR|NEXT|INCB|INCW|INCD|DECB|DECW|DECD|ATCH|DTCH|ENI|DISI|HDEF|HSC|PLS|XMT|RCV|NETR|NETW|SEG|BCDI|IBCD|ITB|BTI|SLB|SRB|SLW|SRW|RLW|RRW|ANDB|ANDW|ANDD|ORB|ORW|ORD|XORB|XORW|XORD|INVB|INVW|INVD|FILL|TBL|FIFO|LIFO|FND=|SCRE|SCRT|LSCR|CSCRE|STOP|WDR|END|MEND)\b/;
  const AWL_ADDR = /(%?\b(?:[IQMVSL]\d+\.\d+|[IQMVSLA]?[BWD]\d+|SM[BWD]?\d+(?:\.\d+)?|AIW\d+|AQW\d+|HC\d+|[TC]\d+|AC\d+|VB\d+|VW\d+|VD\d+)\b|#\w+|16#[0-9A-Fa-f]+|\b\d+(?:\.\d+)?\b)/g;

  function resaltarAwl(texto) {
    return texto.split('\n').map(linea => {
      const i = linea.indexOf('//');
      const codigo = i >= 0 ? linea.slice(0, i) : linea;
      const comentario = i >= 0 ? linea.slice(i) : '';
      let h;
      const t = codigo.trim();
      if (/^NETWORK\b/i.test(t)) h = `<span class="awl-net">${esc(codigo)}</span>`;
      else if (AWL_KW.test(t)) h = `<span class="awl-kw">${esc(codigo)}</span>`;
      else {
        const m = codigo.match(/^(\s*)(\S+)(.*)$/);
        if (m && AWL_OP.test(m[2])) {
          h = esc(m[1]) + `<span class="awl-op">${esc(m[2])}</span>` +
            esc(m[3]).replace(AWL_ADDR, '<span class="awl-addr">$1</span>');
        } else h = esc(codigo);
      }
      return `<span class="ln">${h}${comentario ? `<span class="awl-com">${esc(comentario)}</span>` : ''}</span>`;
    }).join('');
  }

  // ---------------------------------------------------------------- visor
  const visor = $('#visor');
  const cuerpo = $('#visorCuerpo');
  let vistaBase = 'inicio';
  let abiertoDesdeApp = false;
  let graficoCsv = null;

  const LENG_HLJS = { py: 'python', m: 'matlab', sql: 'sql', js: 'javascript', css: 'css', json: 'json', xml: 'xml', cpp: 'cpp', h: 'cpp', hpp: 'cpp', ino: 'cpp', bat: 'dos', st: 'pascal' };

  async function abrirVisor(a) {
    $('#visorTitulo').textContent = a.titulo || a.nombre;
    $('#visorRuta').textContent = a.ruta;
    const url = a.vista === 'youtube' ? a.externo : urlArchivo(a);
    const bajar = $('#visorDescargar');
    bajar.classList.toggle('hidden', a.vista === 'youtube');
    bajar.href = url;
    $('#visorAbrir').href = a.vista === 'youtube' ? a.externo : url;
    visor.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (graficoCsv) { graficoCsv.destroy(); graficoCsv = null; }
    cuerpo.innerHTML = '<div class="loading">Cargando…</div>';
    cuerpo.scrollTop = 0;

    try {
      switch (a.vista) {
        case 'pdf':
          cuerpo.innerHTML = `<iframe src="${url}#view=FitH" title="${esc(a.titulo)}"></iframe>`;
          break;
        case 'web':
          cuerpo.innerHTML = `<iframe src="${url}" title="${esc(a.titulo)}"></iframe>`;
          break;
        case 'imagen':
          cuerpo.innerHTML = `<div class="img-wrap"><img src="${url}" alt="${esc(a.titulo)}"></div>`;
          break;
        case 'video':
          cuerpo.innerHTML = `<div class="video-wrap"><video src="${url}" controls></video></div>`;
          break;
        case 'youtube':
          cuerpo.innerHTML = `<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${a.youtube}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="${esc(a.titulo)}"></iframe></div>`;
          break;
        case 'md': {
          const t = await obtenerTexto(url);
          const doc = document.createElement('div');
          doc.className = 'doc';
          cuerpo.innerHTML = '';
          cuerpo.appendChild(doc);
          await renderMarkdown(t, carpetaDe(a.ruta), doc);
          break;
        }
        case 'texto':
          await verTexto(a, url);
          break;
        case 'csv':
          await verCsv(url);
          break;
        case 'drawio':
          await verDrawio(url);
          break;
        case 'docx':
          await verDocx(url);
          break;
        default:
          throw new Error('sin vista');
      }
    } catch (err) {
      cuerpo.innerHTML = `<div class="error-box"><div class="big">📄</div>
        <p>No se pudo mostrar el archivo en el navegador.</p>
        <a class="btn btn-primary" href="${url}" download>${ICONOS.bajar} Descargar</a></div>`;
    }
  }

  async function obtenerTexto(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const buf = await r.arrayBuffer();
    let t = new TextDecoder('utf-8').decode(buf);
    // Archivos guardados en Windows-1252 (frecuente en AWL exportados de Micro/WIN)
    if (t.includes('�')) t = new TextDecoder('windows-1252').decode(buf);
    return t;
  }

  async function verTexto(a, url) {
    const t = await obtenerTexto(url);
    if (a.ext === 'awl') {
      cuerpo.innerHTML = `<pre class="code"><code>${resaltarAwl(t)}</code></pre>`;
      return;
    }
    const lineas = t.split('\n');
    cuerpo.innerHTML = `<pre class="code"><code>${lineas.map(l => `<span class="ln">${esc(l)}</span>`).join('')}</code></pre>`;
    const lang = LENG_HLJS[a.ext];
    if (!lang || t.length > 400000) return;
    try {
      await cargar(LIBS.hljs);
      if (lang === 'matlab') await cargar(LIBS.hljsMatlab);
      if (!window.hljs.getLanguage(lang)) return;
      const res = window.hljs.highlight(t, { language: lang, ignoreIllegals: true }).value;
      // Se reparte el HTML resaltado por líneas, cerrando y reabriendo spans
      let abiertos = [];
      const salida = res.split('\n').map(l => {
        const pre = abiertos.join('');
        const re = /<span[^>]*>|<\/span>/g;
        let m;
        while ((m = re.exec(l))) {
          if (m[0] === '</span>') abiertos.pop(); else abiertos.push(m[0]);
        }
        return `<span class="ln">${pre}${l}${'</span>'.repeat(abiertos.length)}</span>`;
      });
      $('code', cuerpo).innerHTML = salida.join('');
      $('code', cuerpo).classList.add('hljs');
    } catch (e) { /* queda sin colores */ }
  }

  async function verCsv(url) {
    const t = await obtenerTexto(url);
    const lineas = t.split(/\r?\n/).filter(l => l.trim());
    const primera = lineas[0] || '';
    const sep = [';', '\t', ','].sort((x, y) => primera.split(y).length - primera.split(x).length)[0];
    let filas = lineas.map(l => l.split(sep).map(c => c.trim().replace(/^"|"$/g, '')));
    const num = c => c !== '' && !isNaN(+c.replace(',', '.'));
    const tieneEncabezado = filas[0] && filas[0].some(c => c && !num(c));
    const encabezado = tieneEncabezado ? filas[0] : filas[0].map((_, i) => 'Columna ' + (i + 1));
    if (tieneEncabezado) filas = filas.slice(1);
    const numericas = encabezado.map((_, i) => filas.slice(0, 50).filter(f => num(f[i] || '')).length > Math.min(5, filas.length / 2));
    const idx = encabezado.map((_, i) => i).filter(i => numericas[i]);

    const tabla = `<div class="csv-table-wrap markdown"><table><thead><tr>${encabezado.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${filas.slice(0, 200).map(f => `<tr>${encabezado.map((_, i) => `<td>${esc(f[i] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>
      ${filas.length > 200 ? `<p class="results">Se muestran 200 de ${filas.length} filas.</p>` : ''}</div>`;

    if (idx.length < 2) { cuerpo.innerHTML = tabla; return; }

    const ops = sel => idx.map(i => `<option value="${i}" ${i === sel ? 'selected' : ''}>${esc(encabezado[i])}</option>`).join('');
    cuerpo.innerHTML = `
      <div class="csv-tools">
        <label>Eje X<select class="select" id="csvX">${ops(idx[0])}</select></label>
        <label>Eje Y<select class="select" id="csvY">${ops(idx[idx.length > 2 ? 2 : 1])}</select></label>
        <label>Segundo eje Y<select class="select" id="csvY2"><option value="">Ninguno</option>${ops(idx.length > 2 ? idx[1] : -1)}</select></label>
        <span class="results">${filas.length} filas</span>
      </div>
      <div class="csv-chart"><canvas id="csvCanvas"></canvas></div>${tabla}`;

    await cargar(LIBS.chart);
    const valor = (f, i) => +(String(f[i] ?? '').replace(',', '.'));
    const paso = Math.max(1, Math.ceil(filas.length / 4000));
    const muestras = filas.filter((_, i) => i % paso === 0);
    const estilo = getComputedStyle(document.documentElement);
    const colorTexto = estilo.getPropertyValue('--muted').trim();
    const colorRejilla = estilo.getPropertyValue('--border').trim();

    function dibujar() {
      const x = +$('#csvX').value, y = +$('#csvY').value, y2 = $('#csvY2').value;
      const sets = [{
        label: encabezado[y], data: muestras.map(f => ({ x: valor(f, x), y: valor(f, y) })),
        borderColor: '#3b82f6', backgroundColor: '#3b82f6', borderWidth: 2, pointRadius: 0, yAxisID: 'y'
      }];
      if (y2 !== '') sets.push({
        label: encabezado[+y2], data: muestras.map(f => ({ x: valor(f, x), y: valor(f, +y2) })),
        borderColor: '#f59e0b', backgroundColor: '#f59e0b', borderWidth: 2, pointRadius: 0, borderDash: [5, 4], yAxisID: 'y2', stepped: false
      });
      if (graficoCsv) graficoCsv.destroy();
      const eje = (titulo, pos, rejilla) => ({
        type: 'linear', position: pos, title: { display: true, text: titulo, color: colorTexto },
        ticks: { color: colorTexto }, grid: { color: rejilla ? colorRejilla : 'transparent' }
      });
      graficoCsv = new window.Chart($('#csvCanvas'), {
        type: 'line',
        data: { datasets: sets },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false, parsing: false,
          interaction: { mode: 'nearest', axis: 'x', intersect: false },
          plugins: { legend: { labels: { color: colorTexto } } },
          scales: Object.assign({ x: eje(encabezado[x], 'bottom', true), y: eje(encabezado[y], 'left', true) },
            y2 !== '' ? { y2: eje(encabezado[+y2], 'right', false) } : {})
        }
      });
    }
    ['#csvX', '#csvY', '#csvY2'].forEach(s => $(s).addEventListener('change', dibujar));
    dibujar();
  }

  async function verDrawio(url) {
    const [xml] = await Promise.all([obtenerTexto(url), cargar(LIBS.drawio)]);
    const div = document.createElement('div');
    div.className = 'mxgraph';
    div.setAttribute('data-mxgraph', JSON.stringify({
      highlight: '#3b82f6', nav: true, resize: true, lightbox: false, toolbar: 'zoom layers pages', 'toolbar-position': 'top', xml
    }));
    cuerpo.innerHTML = '<div class="drawio-wrap"></div>';
    $('.drawio-wrap', cuerpo).appendChild(div);
    window.GraphViewer.processElements();
  }

  async function verDocx(url) {
    const [r] = await Promise.all([fetch(url), cargar(LIBS.mammoth), cargar(LIBS.purify)]);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const res = await window.mammoth.convertToHtml({ arrayBuffer: await r.arrayBuffer() });
    cuerpo.innerHTML = `<div class="doc markdown">${window.DOMPurify.sanitize(res.value)}</div>`;
  }

  function cerrarVisor() {
    visor.classList.add('hidden');
    document.body.style.overflow = '';
    cuerpo.innerHTML = '';
    if (graficoCsv) { graficoCsv.destroy(); graficoCsv = null; }
    if (location.hash.startsWith('#ver/')) {
      if (abiertoDesdeApp) history.back();
      else location.hash = vistaBase;
    }
  }
  $('#visorCerrar').addEventListener('click', cerrarVisor);
  visor.addEventListener('click', e => { if (e.target === visor) cerrarVisor(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !visor.classList.contains('hidden')) cerrarVisor(); });

  // ---------------------------------------------------------------- rutas
  const pintado = {};
  function mostrarVista(nombre) {
    $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== 'vista-' + nombre));
    $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.vista === nombre));
  }

  function enrutar() {
    let h = location.hash.slice(1);
    try { h = decodeURIComponent(h); } catch (e) { /* hash sin codificar */ }

    if (h.startsWith('ver/')) {
      const ruta = h.slice(4);
      const a = POR_RUTA.get(ruta);
      if (!pintado[vistaBase]) irA(vistaBase === 'inicio' && a ? 'repositorio/' + carpetaDe(ruta) : vistaBase, true);
      if (a && a.vista) abrirVisor(a);
      else if (a) { location.replace(urlArchivo(a)); }
      return;
    }
    if (!visor.classList.contains('hidden')) {
      visor.classList.add('hidden');
      document.body.style.overflow = '';
      cuerpo.innerHTML = '';
    }
    irA(h || 'inicio');
  }

  function irA(h, sinScroll) {
    const [vista, ...resto] = h.split('/');
    const nombre = ['inicio', 'documentos', 'codigos', 'galeria', 'repositorio'].includes(vista) ? vista : 'inicio';
    vistaBase = nombre === 'repositorio' && resto.length ? 'repositorio/' + resto.join('/') : nombre;
    mostrarVista(nombre);
    if (nombre === 'documentos' || nombre === 'codigos') pintarLista(nombre);
    if (nombre === 'galeria') pintarGaleria();
    if (nombre === 'repositorio') pintarRepositorio(resto.join('/'));
    pintado[nombre] = true;
    if (!sinScroll) window.scrollTo(0, 0);
  }

  // Los enlaces "#ver/..." dentro del sitio marcan que el visor se abrió desde la app
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#ver/"]');
    if (a) abiertoDesdeApp = true;
  }, true);
  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#ver/')) abiertoDesdeApp = false;
    enrutar();
  });

  // ---------------------------------------------------------------- arranque
  pintarInicio();
  iniciarLista('documentos');
  iniciarLista('codigos');
  iniciarGaleria();
  enrutar();
})();
