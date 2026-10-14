// Variables de control local
let lastKnownState = null;
let globalStopActive = false;
let isSavingPosition = false;
let demoMode = false; // Modo de simulacion local

// Variables de sesion SCADA (cargadas desde sessionStorage)
let currentUser = sessionStorage.getItem('scada_username') || null;
let currentUserRole = sessionStorage.getItem('scada_role') || null;

// Estado del brazo transferidor para la simulacion mecanica
let robotState = {
    hasPiece: false,
    lastStation: null,
    animCycle: 0
};

// Configuracion de refresco
const REFRESH_INTERVAL = 500; // ms

// Coordenadas fijas por defecto (se usan solo como fallback si el PLC esta offline)
const COORDENADAS_DEFAULT = {
    alim: 9200,
    proc: 53000,
    ensa: 94000,
    sele: 115000
};

// --- Estado de la Base de Datos Falsa para el Modo Demo ---
let mockDB = {
    total: 0,
    conteos: {
        "Metálica": 0,
        "Mixta": 0,
        "Plástica": 0
    },
    ultimas: []
};

// --- Estado del PLC Falso para el Modo Demo ---
let mockPLC = {
    online: true,
    valores: [0x0400, 0x0400, 0x0400, 0x0400], // Todos en REPOSO (0x04 en high byte)
    pos_alim: 9200,
    pos_proc: 53000,
    pos_ensa: 94000,
    pos_sele: 115000,
    pos_actual: 0,
    seta_activa: false, // Seta de Emergencia (NC: 0 = activa, 1 = libre)
    error: "Simulacion Activa"
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- Control de Sesion y Seguridad HMI ---
async function loginUser() {
    const userEl = document.getElementById('username-input');
    const passEl = document.getElementById('password-input');
    const username = userEl.value.trim();
    const password = passEl.value;
    
    if (!username || !password) {
        alert('Debe ingresar el usuario y la contrasena.');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.username;
            currentUserRole = data.role;
            sessionStorage.setItem('scada_username', currentUser);
            sessionStorage.setItem('scada_role', currentUserRole);
            
            // Limpiar campos de entrada
            userEl.value = '';
            passEl.value = '';
            
            actualizarUIAuth();
            fetchAuditLogs();
            
            // Refrescar la interfaz para aplicar los bloqueos
            if (demoMode) {
                actualizarUI({ plc: mockPLC, db: mockDB });
            } else if (lastKnownState) {
                actualizarUI(lastKnownState);
            }
        } else {
            alert(`Error de ingreso: ${data.error}`);
        }
    } catch (error) {
        alert(`Error de conexion: ${error.message}`);
    }
}

async function logoutUser() {
    if (!currentUser) return;
    
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser })
        });
    } catch (e) {
        console.error('Error al registrar salida de sesion:', e);
    }
    
    currentUser = null;
    currentUserRole = null;
    sessionStorage.removeItem('scada_username');
    sessionStorage.removeItem('scada_role');
    
    actualizarUIAuth();
    fetchAuditLogs();
    
    if (demoMode) {
        actualizarUI({ plc: mockPLC, db: mockDB });
    } else if (lastKnownState) {
        actualizarUI(lastKnownState);
    }
}

function actualizarUIAuth() {
    const outBox = document.getElementById('auth-logged-out');
    const inBox = document.getElementById('auth-logged-in');
    
    if (currentUser && currentUserRole) {
        outBox.style.display = 'none';
        inBox.style.display = 'flex';
        
        document.getElementById('logged-username').innerText = currentUser;
        
        const roleBadge = document.getElementById('logged-role');
        roleBadge.innerText = currentUserRole;
        roleBadge.className = `badge-role ${currentUserRole}`;
    } else {
        outBox.style.display = 'flex';
        inBox.style.display = 'none';
    }
}

// --- Funcion Principal de Monitoreo ---
async function fetchState() {
    if (demoMode) return; // Si la demo esta activa, cancelamos el polling real
    
    try {
        const response = await fetch('/api/state');
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        lastKnownState = data;
        
        actualizarUI(data);
    } catch (error) {
        console.error('Error al obtener estado:', error);
        mostrarOffline(`Error de comunicacion: ${error.message}`);
    }
}

// --- Activar/Desactivar el Modo Demostracion ---
function toggleDemoMode() {
    demoMode = !demoMode;
    const btn = document.getElementById('btn-demo-mode');
    
    if (demoMode) {
        btn.classList.add('active');
        btn.textContent = "MODO DEMO: ON";
        
        // Inicializar estado de simulacion
        mockPLC.online = true;
        mockPLC.pos_actual = 0;
        mockPLC.valores = [0x0400, 0x0400, 0x0400, 0x0400];
        mockPLC.seta_activa = false;
        
        // Poner la conexion en linea ficticia
        const connDot = document.getElementById('connection-dot');
        const connText = document.getElementById('connection-text');
        connDot.className = 'pulse-dot online';
        connText.innerHTML = `PLC ONLINE (Modo Demo Activo) | Puerto: /dev/ttyUSB0`;
        connText.style.color = '#10b981';
        
        actualizarUI({ plc: mockPLC, db: mockDB });
        console.log('[SCADA] Modo Demo Activado.');
    } else {
        btn.classList.remove('active');
        btn.textContent = "MODO DEMO: OFF";
        console.log('[SCADA] Modo Demo Desactivado. Retomando polling real.');
        fetchState(); // Reanudar polling
    }
}

// --- Interpolador Lineal por Tramos para el Carro SVG ---
// Asocia las coordenadas de pulsos reales (leidas del PLC o del simulador) con los pixeles fijos del SVG
function obtenerCarroX(posActual, posAlim, posProc, posEnsa, posSele) {
    posAlim = posAlim || COORDENADAS_DEFAULT.alim;
    posProc = posProc || COORDENADAS_DEFAULT.proc;
    posEnsa = posEnsa || COORDENADAS_DEFAULT.ensa;
    posSele = posSele || COORDENADAS_DEFAULT.sele;
    
    // Mapeo a pixeles en SVG (Alimentacion=860px, Procesamiento=620px, Ensamblaje=380px, Seleccion=140px)
    if (posActual <= posAlim) {
        let ratio = Math.max(0, posActual) / posAlim;
        return 860 + (1 - ratio) * 80; // Entre 940px (reposo) y 860px (estacion de alimentacion)
    }
    if (posActual <= posProc) {
        let ratio = (posActual - posAlim) / (posProc - posAlim);
        return 860 - ratio * 240; // Entre 860px y 620px
    }
    if (posActual <= posEnsa) {
        let ratio = (posActual - posProc) / (posEnsa - posProc);
        return 620 - ratio * 240; // Entre 620px y 380px
    }
    if (posActual <= posSele) {
        let ratio = (posActual - posEnsa) / (posSele - posEnsa);
        return 380 - ratio * 240; // Entre 380px y 140px
    }
    
    let ratio = Math.min(1, (posActual - posSele) / (125000 - posSele));
    return 140 - ratio * 80; // Entre 140px y 60px
}

// --- Actualizar toda la interfaz ---
function actualizarUI(data) {
    const plc = data.plc;
    const db = data.db;
    
    // 1. Estado de Conexion (solo si no estamos en demo)
    if (!demoMode) {
        const connDot = document.getElementById('connection-dot');
        const connText = document.getElementById('connection-text');
        if (plc.online) {
            connDot.className = 'pulse-dot online';
            connText.innerHTML = `PLC ONLINE | Puerto: /dev/ttyUSB0`;
            connText.style.color = '#10b981';
        } else {
            connDot.className = 'pulse-dot offline';
            const errorMsg = plc.error ? plc.error : 'PLC Desconectado';
            connText.innerHTML = `PLC OFFLINE (${errorMsg})`;
            connText.style.color = '#ef4444';
        }
    }
    
    // 2. Baliza de Torre y Estado Global
    actualizarBaliza(plc.online, plc.valores);
    
    // 3. Valores Globales
    document.getElementById('global-pieces-counter').innerText = db.total;
    
    // Formatear coordenada servo a 6 digitos alineados
    const posActual = plc.pos_actual !== null ? plc.pos_actual : 0;
    const sign = posActual < 0 ? '-' : '';
    const absPos = Math.abs(posActual);
    const paddedPos = String(absPos).padStart(6, '0');
    document.getElementById('servo-position').innerText = `${sign}${paddedPos}`;
    
    // 4. Procesar estados de las estaciones e integrarlos en el SVG
    
    // Estacion 2: Alimentacion (valores[0])
    const alimVal = plc.valores[0];
    const alimState = alimVal >> 8;       // VB0
    const alimIdle = (alimState & 0x04) != 0; // V0.2 (Alim_OK)
    const alimReq = (alimState & 0x01) != 0;  // V0.0 (Sol_AP)
    
    actualizarEstacionSvg('alim', alimIdle, alimReq, plc.pos_alim);
    
    // Estacion 4: Procesamiento (valores[1])
    const procVal = plc.valores[1];
    const procState = procVal >> 8;       // VB2
    const procIdle = (procState & 0x04) != 0; // V2.2 (Proc_OK)
    const procReq = (procState & 0x01) != 0;  // V2.0 (Sol_PE)
    
    actualizarEstacionSvg('proc', procIdle, procReq, plc.pos_proc);
    
    // Estacion 3: Ensamblaje (valores[2])
    const ensaVal = plc.valores[2];
    const ensaState = ensaVal >> 8;       // VB4
    const ensaIdle = (ensaState & 0x04) != 0; // V4.2 (Ens_OK)
    const ensaReq = (ensaState & 0x01) != 0;  // V4.0 (Sol_ES)
    
    actualizarEstacionSvg('ensa', ensaIdle, ensaReq, plc.pos_ensa);
    
    // Estacion 5: Seleccion (valores[3])
    const seleVal = plc.valores[3];
    const seleState = seleVal >> 8;       // VB6
    const seleIdle = (seleState & 0x04) != 0; // V6.2 (Sel_OK)
    const pMetal = (seleState & 0x08) != 0;    // V6.3
    const pMixta = (seleState & 0x10) != 0;    // V6.4
    const pPlastica = (seleState & 0x20) != 0; // V6.5
    
    actualizarEstacionSeleccionSvg(seleIdle, pMetal, pMixta, pPlastica, plc.pos_sele);

    // 5. Animar gantry y pinza en tiempo real
    if (plc.online) {
        animarMaqueta(posActual, alimReq, procReq, ensaReq, alimIdle, procIdle, ensaIdle, seleIdle, plc.pos_alim, plc.pos_proc, plc.pos_ensa, plc.pos_sele, pMetal, pMixta, pPlastica);
    }
    
    // 6. Metricas de base de datos (Soporta historicos con acento y nuevos registros ASCII sin acento)
    document.getElementById('count-metalica').innerText = (db.conteos['Metálica'] || 0) + (db.conteos['Metalica'] || 0);
    document.getElementById('count-mixta').innerText = db.conteos['Mixta'] || 0;
    document.getElementById('count-plastica').innerText = (db.conteos['Plástica'] || 0) + (db.conteos['Plastica'] || 0);
    
    // 7. Historial de clasificacion
    actualizarHistorialTabla(db.ultimas);
    
    // 8. Actualizar bloqueos y seguridad SCADA
    actualizarBloqueosSeguridad(plc.seta_activa || false);
}

// --- Actualizar Gabinete SVG de Estaciones Normas (Alim, Proc, Ensa) ---
function actualizarEstacionSvg(id, isIdle, isReqActive, posConfigured) {
    const led = document.getElementById(`svg-${id}-led`);
    const statusTxt = document.getElementById(`svg-${id}-status`);
    const solTxt = document.getElementById(`svg-${id}-sol`);
    const posInput = document.getElementById(`input-pos-${id}`);
    
    if (!led) return;
    
    // LED de Disponibilidad
    if (isIdle) {
        led.setAttribute('fill', 'url(#led-green)');
        statusTxt.textContent = 'REPOSO (Listo)';
        statusTxt.setAttribute('fill', '#10b981');
    } else {
        led.setAttribute('fill', 'url(#led-gray)');
        statusTxt.textContent = 'TRABAJANDO';
        statusTxt.setAttribute('fill', '#f59e0b');
    }
    
    // Solicitud (Handshake)
    if (isReqActive) {
        solTxt.textContent = 'PETICION ACTIVA';
        solTxt.setAttribute('fill', '#06b6d4');
    } else {
        solTxt.textContent = 'SIN PETICION';
        solTxt.setAttribute('fill', '#94a3b8');
    }
    
    // Input de Posicion (VD)
    if (posInput && document.activeElement !== posInput && !isSavingPosition) {
        posInput.value = posConfigured;
    }
}

// --- Actualizar Gabinete SVG de Seleccion ---
function actualizarEstacionSeleccionSvg(isIdle, pMetal, pMixta, pPlastica, posConfigured) {
    const led = document.getElementById('svg-sele-led');
    const statusTxt = document.getElementById('svg-sele-status');
    const pieceTxt = document.getElementById('svg-sele-piece');
    const posInput = document.getElementById('input-pos-sele');
    
    if (!led) return;
    
    // LED de Disponibilidad
    if (isIdle) {
        led.setAttribute('fill', 'url(#led-green)');
        statusTxt.textContent = 'REPOSO (Listo)';
        statusTxt.setAttribute('fill', '#10b981');
    } else {
        led.setAttribute('fill', 'url(#led-gray)');
        statusTxt.textContent = 'CLASIFICANDO';
        statusTxt.setAttribute('fill', '#f59e0b');
    }
    
    // Tipo de Pieza detectada
    let piezaStr = 'NINGUNA';
    let piezaColor = '#94a3b8';
    if (pMetal) {
        piezaStr = 'METALICA';
        piezaColor = '#10b981';
    } else if (pMixta) {
        piezaStr = 'MIXTA';
        piezaColor = '#f59e0b';
    } else if (pPlastica) {
        piezaStr = 'PLASTICA';
        piezaColor = '#3b82f6';
    }
    
    pieceTxt.textContent = piezaStr;
    pieceTxt.setAttribute('fill', piezaColor);
    
    // Input de Posicion (VD)
    if (posInput && document.activeElement !== posInput && !isSavingPosition) {
        posInput.value = posConfigured;
    }
}

// --- Actualizar la Baliza de Torre de 3 luces ---
function actualizarBaliza(online, valores) {
    const red = document.getElementById('baliza-red');
    const amber = document.getElementById('baliza-amber');
    const green = document.getElementById('baliza-green');
    
    if (!red) return;
    
    // Resetear clases activas
    red.classList.remove('active');
    amber.classList.remove('active');
    green.classList.remove('active');
    
    // Si esta offline o el Paro Global esta activo, Baliza Roja activa
    if (!online || globalStopActive) {
        red.classList.add('active');
        return;
    }
    
    // Verificar si alguna estacion esta trabajando
    const alimActive = (valores[0] >> 8 & 0x04) == 0;
    const procActive = (valores[1] >> 8 & 0x04) == 0;
    const ensaActive = (valores[2] >> 8 & 0x04) == 0;
    const seleActive = (valores[3] >> 8 & 0x04) == 0;
    
    const sistemaTrabajando = alimActive || procActive || ensaActive || seleActive;
    
    if (sistemaTrabajando) {
        green.classList.add('active');
    } else {
        amber.classList.add('active');
    }
}

// --- Estado de animacion activa por estacion ---
let animationsActive = {
    alim: false,
    proc: false,
    ensa: false,
    sele: false
};

// --- Funciones auxiliares para animar cada estacion ---
async function triggerAlimAnimation() {
    if (animationsActive.alim) return;
    animationsActive.alim = true;
    
    const rod = document.getElementById('alim-pusher-rod');
    const head = document.getElementById('alim-pusher-head');
    const readyPiece = document.getElementById('alim-piece-ready');
    
    if (readyPiece) readyPiece.style.opacity = '0';
    
    // Piston avanza hacia la derecha (45px)
    if (rod) rod.style.transform = 'translateX(45px)';
    if (head) head.style.transform = 'translateX(45px)';
    
    await sleep(400);
    
    // Al finalizar avance, se muestra la pieza en el punto de recogida
    if (readyPiece) {
        readyPiece.style.transform = 'scale(0.5)';
        readyPiece.style.opacity = '1';
        setTimeout(() => {
            readyPiece.style.transform = 'scale(1)';
        }, 50);
    }
    
    // Piston retrocede
    if (rod) rod.style.transform = 'translateX(0)';
    if (head) head.style.transform = 'translateX(0)';
    
    await sleep(400);
    animationsActive.alim = false;
}

async function triggerProcAnimation() {
    if (animationsActive.proc) return;
    animationsActive.proc = true;
    
    const slider = document.getElementById('proc-slider');
    const stamp = document.getElementById('proc-stamp-piston');
    const piece = document.getElementById('proc-piece-sim');
    
    // Mostrar pieza en plataforma de la pinza
    if (piece) piece.style.opacity = '1';
    
    // Subir pinza deslizante a la zona de estampado
    if (slider) slider.style.transform = 'translateY(-55px)';
    
    await sleep(700);
    
    // Bajar piston de estampado
    if (stamp) stamp.style.transform = 'translateY(15px)';
    
    await sleep(450);
    
    // Subir piston de estampado
    if (stamp) stamp.style.transform = 'translateY(0)';
    
    await sleep(400);
    
    // Bajar pinza deslizante
    if (slider) slider.style.transform = 'translateY(0)';
    
    await sleep(700);
    animationsActive.proc = false;
}

async function triggerEnsaAnimation() {
    if (animationsActive.ensa) return;
    animationsActive.ensa = true;
    
    const rotArm = document.getElementById('ensa-rot-arm');
    const extArm = document.getElementById('ensa-ext-arm');
    const heldLid = document.getElementById('ensa-held-lid');
    const baseSim = document.getElementById('ensa-base-sim');
    const lidSim = document.getElementById('ensa-lid-sim');
    
    if (baseSim) baseSim.style.opacity = '1';
    if (lidSim) lidSim.style.opacity = '0';
    if (heldLid) heldLid.style.opacity = '0';
    
    // Girar brazo al cargador de tapas (izquierda)
    if (rotArm) rotArm.style.transform = 'translate(375px, 288px) rotate(15deg)';
    
    await sleep(700);
    
    // Extender ventosa para tomar tapa
    if (extArm) extArm.style.transform = 'translate(-45px, 45px) translateY(10px)';
    
    await sleep(400);
    
    // Mostrar tapa sujeta
    if (heldLid) heldLid.style.opacity = '1';
    
    // Retraer brazo
    if (extArm) extArm.style.transform = 'translate(-45px, 45px) translateY(0px)';
    
    await sleep(400);
    
    // Girar brazo a la plataforma de ensamble (derecha)
    if (rotArm) rotArm.style.transform = 'translate(375px, 288px) rotate(-50deg)';
    
    await sleep(700);
    
    // Extender ventosa para colocar tapa
    if (extArm) extArm.style.transform = 'translate(-45px, 45px) translateY(22px)';
    
    await sleep(400);
    
    // Soltar tapa en pieza
    if (heldLid) heldLid.style.opacity = '0';
    if (lidSim) lidSim.style.opacity = '1';
    
    // Retraer brazo
    if (extArm) extArm.style.transform = 'translate(-45px, 45px) translateY(0px)';
    
    await sleep(400);
    
    // Volver a posicion de reposo
    if (rotArm) rotArm.style.transform = 'translate(375px, 288px) rotate(0deg)';
    
    await sleep(700);
    animationsActive.ensa = false;
}

async function triggerSeleAnimation(pMetal, pMixta, pPlastica) {
    if (animationsActive.sele) return;
    animationsActive.sele = true;
    
    const piece = document.getElementById('sele-piece-sim');
    const belt = document.getElementById('sele-belt-line');
    
    // Determinar destino y color segun tipo
    let targetPusherId = 'sele-pusher-3'; // Plastica por defecto
    let targetDx = 132;
    let color = '#3b82f6';
    
    if (pMetal) {
        targetPusherId = 'sele-pusher-1';
        targetDx = 32;
        color = '#10b981';
    } else if (pMixta) {
        targetPusherId = 'sele-pusher-2';
        targetDx = 82;
        color = '#f59e0b';
    }
    
    const pusher = document.getElementById(targetPusherId);
    
    if (piece) {
        piece.setAttribute('fill', color);
        piece.style.transition = 'none';
        piece.style.transform = 'translate(0, 0)';
        piece.style.opacity = '1';
    }
    
    if (belt) belt.classList.add('belt-moving');
    
    await sleep(50);
    
    // Avanzar pieza por la cinta
    if (piece) {
        piece.style.transition = 'transform 0.8s linear';
        piece.style.transform = `translateX(${targetDx}px)`;
    }
    
    await sleep(800);
    
    // Detener movimiento cinta
    if (belt) belt.classList.remove('belt-moving');
    
    // Activar piston empujador
    if (pusher) pusher.style.transform = 'translateY(22px)';
    
    await sleep(250);
    
    // Pieza cae por la rampa diagonal
    if (piece) {
        piece.style.transition = 'transform 0.6s ease-in';
        piece.style.transform = `translateX(${targetDx - 20}px) translateY(30px)`;
    }
    
    await sleep(350);
    
    // Retraer piston y desvanecer pieza
    if (pusher) pusher.style.transform = 'translateY(0)';
    if (piece) piece.style.opacity = '0';
    
    await sleep(300);
    animationsActive.sele = false;
}

// --- Animar la Maqueta SVG segun Telemetria ---
function animarMaqueta(posActual, alimReq, procReq, ensaReq, alimIdle, procIdle, ensaIdle, seleIdle, posAlim, posProc, posEnsa, posSele, pMetal, pMixta, pPlastica) {
    let x_px = obtenerCarroX(posActual, posAlim, posProc, posEnsa, posSele);
    
    const carriage = document.getElementById('carriage');
    if (carriage) {
        carriage.setAttribute('transform', `translate(${x_px}, 480)`);
    }
    
    const verticalArm = document.getElementById('vertical-arm');
    const gripperHead = document.getElementById('gripper-head');
    const vastagoExt = document.getElementById('vastago-extension');
    const clawLeft = document.getElementById('claw-left');
    const clawRight = document.getElementById('claw-right');
    const grippedPiece = document.getElementById('gripped-piece');
    const grippedLid = document.getElementById('gripped-piece-lid');
    
    if (!verticalArm) return;
    
    let z_y = 0;          
    let vastago_y = 0;    
    let rotate_deg = 0;   
    
    let destAlim = Math.abs(posActual - (posAlim || COORDENADAS_DEFAULT.alim)) < 2500;
    let destProc = Math.abs(posActual - (posProc || COORDENADAS_DEFAULT.proc)) < 2500;
    let destEnsa = Math.abs(posActual - (posEnsa || COORDENADAS_DEFAULT.ensa)) < 2500;
    let destSele = Math.abs(posActual - (posSele || COORDENADAS_DEFAULT.sele)) < 2500;
    
    // Logica de simulacion mecanica de recogida y entrega (Heuristica de Petri)
    if (destAlim && alimReq) {
        z_y = -7;       
        vastago_y = -10; 
        robotState.hasPiece = true;
        robotState.hasLid = false;
        robotState.lastStation = 'alim';
    } 
    else if (destProc && !procIdle && robotState.lastStation === 'alim') {
        z_y = -7;
        vastago_y = -10;
        robotState.hasPiece = false;
        robotState.lastStation = 'proc';
    } 
    else if (destProc && procReq) {
        z_y = -7;
        vastago_y = -10;
        robotState.hasPiece = true;
        robotState.lastStation = 'proc';
    } 
    else if (destEnsa && !ensaIdle && robotState.lastStation === 'proc') {
        z_y = -7;
        vastago_y = -10;
        robotState.hasPiece = false;
        robotState.lastStation = 'ensa';
    } 
    else if (destEnsa && ensaReq) {
        z_y = -7;
        vastago_y = -10;
        robotState.hasPiece = true;
        robotState.hasLid = true;
        robotState.lastStation = 'ensa';
    } 
    else if (destSele && !seleIdle) {
        z_y = -31;
        vastago_y = -10;
        robotState.hasPiece = false;
        robotState.hasLid = false;
        robotState.lastStation = 'sele';
    }
    
    verticalArm.setAttribute('transform', `translate(0, -20) translateY(${z_y}px)`);
    vastagoExt.setAttribute('transform', `translateY(${vastago_y}px)`);
    
    // El actuador de la garra del carro transportador debe apuntar siempre verticalmente hacia arriba (0 grados)
    // para interactuar correctamente con las estaciones ubicadas arriba de la guia lineal.
    rotate_deg = 0;
    gripperHead.setAttribute('transform', `translate(0, -67) rotate(${rotate_deg})`);
    
    // Control de pinza (cerrada si lleva pieza, abierta si no)
    let claw_rotate = robotState.hasPiece ? 12 : 0;
    if (clawLeft && clawRight) {
        clawLeft.setAttribute('transform', `rotate(${claw_rotate})`);
        clawRight.setAttribute('transform', `rotate(${-claw_rotate})`);
    }
    
    if (grippedPiece) {
        grippedPiece.style.opacity = robotState.hasPiece ? '1' : '0';
    }
    if (grippedLid) {
        grippedLid.style.opacity = (robotState.hasPiece && robotState.hasLid) ? '1' : '0';
    }

    // --- Disparadores de Animaciones Locales por Estaciones ---
    if (!alimIdle) {
        triggerAlimAnimation();
    } else if (!animationsActive.alim) {
        const readyPiece = document.getElementById('alim-piece-ready');
        // Si no esta activa la animacion, la pieza aparece segun el handshake de peticion
        if (readyPiece) readyPiece.style.opacity = alimReq ? '1' : '0';
    }

    if (!procIdle) {
        triggerProcAnimation();
    } else if (!animationsActive.proc) {
        const piece = document.getElementById('proc-piece-sim');
        if (piece) piece.style.opacity = (procReq) ? '1' : '0';
    }

    if (!ensaIdle) {
        triggerEnsaAnimation();
    } else if (!animationsActive.ensa) {
        const baseSim = document.getElementById('ensa-base-sim');
        const lidSim = document.getElementById('ensa-lid-sim');
        if (baseSim) baseSim.style.opacity = (ensaReq) ? '1' : '0';
        if (lidSim) lidSim.style.opacity = (ensaReq) ? '1' : '0';
    }

    if (!seleIdle) {
        triggerSeleAnimation(pMetal, pMixta, pPlastica);
    }
}

// --- Simular movimiento del carro del servo (Demo Mode) ---
async function moverCarroSimulado(target) {
    if (!demoMode) return;
    let current = mockPLC.pos_actual;
    let step = 3500;
    
    if (current < target) {
        while (current < target && demoMode) {
            current = Math.min(target, current + step);
            mockPLC.pos_actual = current;
            actualizarUI({ plc: mockPLC, db: mockDB });
            await sleep(40);
        }
    } else {
        while (current > target && demoMode) {
            current = Math.max(target, current - step);
            mockPLC.pos_actual = current;
            actualizarUI({ plc: mockPLC, db: mockDB });
            await sleep(40);
        }
    }
}

// --- Simular Secuencia Completa Petri de la Planta ---
async function ejecutarCicloCompletoDemo() {
    console.log('[Demo] Iniciando ciclo completo de la celda de manufactura...');
    
    // 1. Estacion 2 (Alimentacion) inicia dosificacion
    mockPLC.valores[0] = 0x0000; // Alimentacion Trabajando
    actualizarUI({ plc: mockPLC, db: mockDB });
    await sleep(2000);
    
    // Pieza disponible
    mockPLC.valores[0] = 0x0401; // Alim reposo, Sol_AP = 1 (Peticion de pieza)
    actualizarUI({ plc: mockPLC, db: mockDB });
    await sleep(800);
    
    // 2. Carriage viaja a Alimentacion (9200) para recoger pieza
    await moverCarroSimulado(9200);
    await sleep(1500); // Esperar que el brazo realice recogida mecanica (animacion por cercania)
    
    // Brazo subio con pieza. Limpiamos peticion en Alimentacion
    mockPLC.valores[0] = 0x0400; // Alim reposo, Sol_AP = 0
    actualizarUI({ plc: mockPLC, db: mockDB });
    
    // 3. Viajar a Procesamiento (53000)
    await moverCarroSimulado(53000);
    await sleep(1500); // Esperar entrega en Procesamiento
    
    // 4. Iniciar taladrado en Procesamiento
    mockPLC.valores[1] = 0x0000; // Procesamiento Trabajando
    actualizarUI({ plc: mockPLC, db: mockDB });
    await sleep(2500); // Simular proceso
    
    // Procesamiento terminado y pide recogida
    mockPLC.valores[1] = 0x0401; // Proc reposo, Sol_PE = 1
    actualizarUI({ plc: mockPLC, db: mockDB });
    await sleep(1500); // Esperar que el brazo recoja la pieza
    
    // Brazo subio con pieza. Limpiamos peticion en Procesamiento
    mockPLC.valores[1] = 0x0400;
    actualizarUI({ plc: mockPLC, db: mockDB });
    
    // 5. Viajar a Ensamblaje (94000)
    await moverCarroSimulado(94000);
    await sleep(1500); // Esperar entrega
    
    // 6. Iniciar ensamblaje de tapa
    mockPLC.valores[2] = 0x0000; // Ensamblaje Trabajando
    actualizarUI({ plc: mockPLC, db: mockDB });
    await sleep(2500); // Simular proceso
    
    // Ensamblaje terminado y pide recogida
    mockPLC.valores[2] = 0x0401; // Ensa reposo, Sol_ES = 1
    actualizarUI({ plc: mockPLC, db: mockDB });
    await sleep(1500); // Esperar recogida
    
    // Brazo subio con pieza. Limpiamos peticion en Ensamblaje
    mockPLC.valores[2] = 0x0400;
    actualizarUI({ plc: mockPLC, db: mockDB });
    
    // 7. Viajar a Seleccion (115000)
    await moverCarroSimulado(115000);
    await sleep(1500); // Esperar entrega
    
    // 8. Iniciar clasificacion en Seleccion
    // Determinar tipo de pieza al azar (Demo)
    const opciones = ["Metálica", "Mixta", "Plástica"];
    const piezaElegida = opciones[Math.floor(Math.random() * opciones.length)];
    
    // Activar bits de clasificacion (Sel_OK es 0 = ocupado, pieza detectada es 1)
    if (piezaElegida === "Metálica") {
        mockPLC.valores[3] = 0x0800; // Sel_OK = 0, Pieza_Metal = 1
    } else if (piezaElegida === "Mixta") {
        mockPLC.valores[3] = 0x1000; // Sel_OK = 0, Pieza_Mixta = 1
    } else {
        mockPLC.valores[3] = 0x2000; // Sel_OK = 0, Pieza_Plastica = 1
    }
    
    actualizarUI({ plc: mockPLC, db: mockDB });
    await sleep(2500); // Dar tiempo para que corra la animacion de clasificacion
    
    // Establecer estado completado
    if (piezaElegida === "Metálica") {
        mockPLC.valores[3] = 0x0c00; // Sel_OK = 1, Pieza_Metal = 1 (bits 2 y 3)
    } else if (piezaElegida === "Mixta") {
        mockPLC.valores[3] = 0x1400; // Sel_OK = 1, Pieza_Mixta = 1 (bits 2 y 4)
    } else {
        mockPLC.valores[3] = 0x2400; // Sel_OK = 1, Pieza_Plastica = 1 (bits 2 y 5)
    }
    
    // Incrementar base de datos ficticia de piezas
    mockDB.total += 1;
    mockDB.conteos[piezaElegida] += 1;
    
    let ahora = new Date();
    let fechaStr = ahora.toISOString().replace('T', ' ').substring(0, 19);
    mockDB.ultimas.unshift({
        id: mockDB.total,
        fecha: fechaStr,
        tipo: piezaElegida
    });
    
    actualizarUI({ plc: mockPLC, db: mockDB });
    await sleep(2500); // Mantener el reporte visual unos segundos
    
    // Volver a reposo
    mockPLC.valores[3] = 0x0400; // Seleccion en reposo
    await moverCarroSimulado(0); // Volver al origen
    
    actualizarUI({ plc: mockPLC, db: mockDB });
    console.log('[Demo] Ciclo completo de demo finalizado con exito.');
}

// --- Actualizar tabla de historial ---
function actualizarHistorialTabla(ultimas) {
    const tbody = document.getElementById('db-history-body');
    if (!tbody) return;
    
    if (!ultimas || ultimas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="empty-table">No hay registros aun</td></tr>`;
        return;
    }
    
    let html = '';
    ultimas.forEach(row => {
        let badgeClass = 'badge-req-inactive';
        if (row.tipo === 'Metálica') badgeClass = 'badge-pieza-metal';
        else if (row.tipo === 'Mixta') badgeClass = 'badge-pieza-mixta';
        else if (row.tipo === 'Plástica') badgeClass = 'badge-pieza-plastica';
        
        html += `
            <tr>
                <td><strong>#${row.id}</strong></td>
                <td>${row.fecha}</td>
                <td><span class="${badgeClass}">${row.tipo}</span></td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// --- Mostrar UI Offline General ---
function mostrarOffline(mensaje) {
    const connDot = document.getElementById('connection-dot');
    const connText = document.getElementById('connection-text');
    connDot.className = 'pulse-dot offline';
    connText.innerHTML = `PLC OFFLINE (${mensaje})`;
    connText.style.color = '#ef4444';
    
    const red = document.getElementById('baliza-red');
    if (red) {
        red.classList.add('active');
        document.getElementById('baliza-amber').classList.remove('active');
        document.getElementById('baliza-green').classList.remove('active');
    }
    
    const leds = ['svg-alim-led', 'svg-proc-led', 'svg-ensa-led', 'svg-sele-led'];
    leds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('fill', 'url(#led-gray)');
    });

    // En estado offline real, forzar bloqueos visuales con seta liberada
    actualizarBloqueosSeguridad(false);
}

// --- Toggle Seta de Emergencia (Demo Mode) ---
async function toggleSetaEmergencia() {
    if (!demoMode) {
        alert('En Modo Real, el estado de la Seta de Emergencia es determinado por la entrada fisica I2.6 del PLC.');
        return;
    }
    
    mockPLC.seta_activa = !mockPLC.seta_activa;
    
    try {
        await fetch('/api/demo/seta', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Username': currentUser || 'Invitado'
            },
            body: JSON.stringify({ seta_activa: mockPLC.seta_activa })
        });
    } catch (e) {
        console.error('Error al sincronizar seta demo:', e);
    }
    
    actualizarUI({ plc: mockPLC, db: mockDB });
    fetchAuditLogs();
}

// --- Actualizar Bloqueos y Seguridad en la UI ---
function actualizarBloqueosSeguridad(setaActiva) {
    const btnSeta = document.getElementById('btn-seta-emergencia');
    const labelSeta = document.getElementById('seta-status-label');
    
    if (setaActiva) {
        btnSeta.classList.add('active');
        labelSeta.innerText = 'SETA PRESIONADA';
        labelSeta.className = 'seta-label seta-active';
    } else {
        btnSeta.classList.remove('active');
        labelSeta.innerText = 'SETA LIBERADA';
        labelSeta.className = 'seta-label seta-ok';
    }
    
    const isGuest = !currentUserRole;
    const isOperador = currentUserRole === 'Operador';
    const isIngeniero = currentUserRole === 'Ingeniero';
    
    const bloquearOperaciones = setaActiva || isGuest;
    const bloquearConfiguracion = setaActiva || !isIngeniero;
    
    const btnMarcha = document.getElementById('btn-global-marcha');
    const btnParo = document.getElementById('btn-global-paro');
    if (btnMarcha) btnMarcha.disabled = bloquearOperaciones;
    if (btnParo) btnParo.disabled = bloquearOperaciones;
    
    const estaciones = ['alim', 'proc', 'ensa', 'sele'];
    
    estaciones.forEach(key => {
        const input = document.getElementById(`input-pos-${key}`);
        if (input) {
            input.disabled = bloquearConfiguracion;
            const btnSave = input.nextElementSibling;
            if (btnSave) {
                btnSave.disabled = bloquearConfiguracion;
                if (bloquearConfiguracion) {
                    btnSave.classList.add('disabled-op');
                } else {
                    btnSave.classList.remove('disabled-op');
                }
            }
        }
        
        const btnStart = document.getElementById(`btn-start-${key}`);
        if (btnStart) {
            if (bloquearOperaciones) {
                btnStart.classList.add('disabled-op');
            } else {
                btnStart.classList.remove('disabled-op');
            }
        }
    });
}

// --- Lanzar ciclo de estacion ---
async function lanzarCiclo(estacionIndex) {
    if (globalStopActive) {
        alert('Accion bloqueada. El sistema esta en PARO GENERAL. Pulse MARCHA para reanudar.');
        return;
    }
    
    if (!currentUserRole) {
        alert('Accion bloqueada. Debe iniciar sesion para operar.');
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'X-Username': currentUser,
        'X-User-Role': currentUserRole
    };
    
    if (demoMode) {
        try {
            await fetch(`/api/marcha/${estacionIndex}`, { 
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ demo: true })
            });
        } catch (e) {
            console.error('Error al registrar marcha demo:', e);
        }
        
        if (estacionIndex === 0) {
            ejecutarCicloCompletoDemo();
        } else {
            alert('En Modo Demo, inicie la simulacion haciendo clic en START de la Unidad de Alimentacion (ST2) para ver la secuencia completa.');
        }
        fetchAuditLogs();
        return;
    }
    
    try {
        const response = await fetch(`/api/marcha/${estacionIndex}`, { 
            method: 'POST',
            headers: headers
        });
        const resData = await response.json();
        if (!resData.success) {
            throw new Error(resData.error || 'Error desconocido');
        }
        console.log(`[SCADA] Ciclo lanzado en estacion ${estacionIndex}`);
        fetchAuditLogs();
    } catch (error) {
        alert(`Error al lanzar ciclo: ${error.message}`);
    }
}

// --- Guardar posicion (VD) directamente ---
async function guardarPosicionDirecta(estacionKey, registro, inputId) {
    if (globalStopActive) {
        alert('Accion bloqueada. El sistema esta en PARO GENERAL.');
        return;
    }
    
    if (currentUserRole !== 'Ingeniero') {
        alert('Accion bloqueada. Se requieren permisos de Ingeniero.');
        return;
    }
    
    const input = document.getElementById(inputId);
    const valor = parseInt(input.value);
    
    if (isNaN(valor)) {
        alert('Debe ingresar un numero entero valido.');
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'X-Username': currentUser,
        'X-User-Role': currentUserRole
    };
    
    if (demoMode) {
        try {
            await fetch('/api/posicion', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    estacion: estacionKey,
                    valor: valor,
                    demo: true
                })
            });
        } catch (e) {
            console.error('Error al registrar posicion demo:', e);
        }
        
        mockPLC[`pos_${estacionKey}`] = valor;
        alert(`[Demo] Posicion simulada guardada para ${estacionKey}: ${valor} pulsos`);
        actualizarUI({ plc: mockPLC, db: mockDB });
        fetchAuditLogs();
        return;
    }
    
    isSavingPosition = true;
    const btn = input.nextElementSibling;
    const origText = btn.innerText;
    btn.innerText = '...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/posicion', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                estacion: estacionKey,
                valor: valor
            })
        });
        const resData = await response.json();
        
        if (resData.success) {
            btn.innerText = 'OK';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.innerText = origText;
                btn.style.background = '';
                btn.disabled = false;
                isSavingPosition = false;
            }, 1200);
            fetchAuditLogs();
        } else {
            throw new Error(resData.error || 'Error desconocido');
        }
    } catch (error) {
        alert(`Error al guardar en el PLC: ${error.message}`);
        btn.innerText = 'Err';
        btn.style.background = '#ef4444';
        setTimeout(() => {
            btn.innerText = origText;
            btn.style.background = '';
            btn.disabled = false;
            isSavingPosition = false;
        }, 1500);
    }
}

// --- Panel Central: Lanzar Marcha Global ---
async function lanzarMarchaGlobal() {
    if (!currentUserRole) {
        alert('Accion bloqueada. Debe iniciar sesion para operar.');
        return;
    }

    globalStopActive = false;
    const btn = document.getElementById('btn-global-marcha');
    if (btn) btn.classList.add('pressed');
    
    console.log('[SCADA] Iniciando ciclo de Marcha en todas las unidades disponibles');
    
    const headers = {
        'Content-Type': 'application/json',
        'X-Username': currentUser,
        'X-User-Role': currentUserRole
    };

    try {
        await fetch('/api/global/marcha', { method: 'POST', headers: headers });
        fetchAuditLogs();
    } catch (e) {
        console.error('Error al registrar marcha global:', e);
    }

    if (demoMode) {
        ejecutarCicloCompletoDemo();
        setTimeout(() => {
            if (btn) btn.classList.remove('pressed');
        }, 800);
        return;
    }
    
    try {
        await Promise.all([
            fetch('/api/marcha/0', { method: 'POST', headers: headers }).catch(e => console.log('Alim offline')),
            fetch('/api/marcha/1', { method: 'POST', headers: headers }).catch(e => console.log('Proc offline')),
            fetch('/api/marcha/2', { method: 'POST', headers: headers }).catch(e => console.log('Ensa offline')),
            fetch('/api/marcha/3', { method: 'POST', headers: headers }).catch(e => console.log('Sele offline'))
        ]);
        fetchAuditLogs();
    } catch(err) {
        console.error('Error en marcha global:', err);
    }
    
    setTimeout(() => {
        if (btn) btn.classList.remove('pressed');
    }, 800);
}

// --- Panel Central: Lanzar Paro Global (Interlock de Software) ---
async function lanzarParoGlobal() {
    if (!currentUserRole) {
        alert('Accion bloqueada. Debe iniciar sesion para operar.');
        return;
    }

    globalStopActive = true;
    const btn = document.getElementById('btn-global-paro');
    if (btn) btn.classList.add('pressed');
    
    console.log('[SCADA] PARO GENERAL ACTIVO - Acceso a PLC suspendido temporalmente');
    
    const headers = {
        'Content-Type': 'application/json',
        'X-Username': currentUser,
        'X-User-Role': currentUserRole
    };

    try {
        await fetch('/api/global/paro', { method: 'POST', headers: headers });
        fetchAuditLogs();
    } catch (e) {
        console.error('Error al registrar paro global:', e);
    }

    const red = document.getElementById('baliza-red');
    if (red) {
        red.classList.add('active');
        document.getElementById('baliza-amber').classList.remove('active');
        document.getElementById('baliza-green').classList.remove('active');
    }
    
    setTimeout(() => {
        if (btn) btn.classList.remove('pressed');
    }, 800);
}

// --- Consultar y Actualizar Tabla de Auditoria ---
async function fetchAuditLogs() {
    try {
        const response = await fetch('/api/auditoria');
        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
            actualizarTablaAuditoria(data.logs);
        }
    } catch (error) {
        console.error('Error al obtener registros de auditoria:', error);
    }
}

function actualizarTablaAuditoria(logs) {
    const tbody = document.getElementById('audit-history-body');
    if (!tbody) return;
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-table">No hay registros de auditoria aun</td></tr>`;
        return;
    }
    
    let html = '';
    logs.forEach(row => {
        let badgeClass = 'badge-audit-action';
        const act = row.accion;
        
        if (act === 'INICIO_SESION' || act === 'CONEXION_RESTABLECIDA' || act === 'EMERGENCIA_LIBERADA') {
            badgeClass = 'badge-audit-login';
        } else if (act === 'ACCESO_DENEGADO' || act === 'ESCRITURA_BLOQUEADA' || act === 'EMERGENCIA_ACTIVA' || act === 'ALARMA_TIMEOUT' || act === 'INICIO_SESION_FALLIDO') {
            badgeClass = 'badge-audit-alarm';
        } else if (act === 'CIERRE_SESION' || act === 'PARO_GLOBAL') {
            badgeClass = 'badge-audit-warn';
        }
        
        html += `
            <tr>
                <td><strong>#${row.id}</strong></td>
                <td>${row.fecha}</td>
                <td><strong>${row.usuario}</strong></td>
                <td><span class="${badgeClass}">${row.accion}</span></td>
                <td>${row.detalle}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// --- Inicializacion al Cargar ---
actualizarUIAuth();

// Bucle de refresco ciclico
setInterval(fetchState, REFRESH_INTERVAL);
setInterval(fetchAuditLogs, 1500);

// Primer refresco inmediato al cargar
fetchState();
fetchAuditLogs();
