// --- ESTADO LOCAL DEL HMI ---
let systemState = {};

// Mapeo de Registros Modbus para visualizacion en tablas
const coilsMapping = [
    { reg: 0, sym: 'V_Cil_Peq', hw: 'Q0.0', desc: 'Sujetador Columna U1' },
    { reg: 1, sym: 'V_Cil_Lrg', hw: 'Q0.1', desc: 'Empujador Pieza U1' },
    { reg: 8, sym: 'V_Prensa', hw: 'Q1.0', desc: 'Cilindro Prensa U2' },
    { reg: 16, sym: 'V_Cil_Ensa', hw: 'Q2.0', desc: 'Empujador Ensamble U3' },
    { reg: 24, sym: 'V_Cil_Vert', hw: 'Q3.0', desc: 'Bajar Brazo U4' },
    { reg: 25, sym: 'V_Pinza', hw: 'Q3.1', desc: 'Cerrar Pinza U4' },
    { reg: 26, sym: 'Servo_Go_U1', hw: 'Q3.2', desc: 'Viaje a U1' },
    { reg: 27, sym: 'Servo_Go_U2', hw: 'Q3.3', desc: 'Viaje a U2' },
    { reg: 28, sym: 'Servo_Go_U3', hw: 'Q3.4', desc: 'Viaje a U3' },
    { reg: 29, sym: 'Servo_Go_U5', hw: 'Q3.5', desc: 'Viaje a U5' },
    { reg: 32, sym: 'Motor_Cinta', hw: 'Q4.0', desc: 'Motor Cinta U5' },
    { reg: 33, sym: 'V_Deflector_R1', hw: 'Q4.1', desc: 'Deflector Rampa 1' },
    { reg: 34, sym: 'V_Deflector_R2', hw: 'Q4.2', desc: 'Deflector Rampa 2' },
    { reg: 35, sym: 'V_Deflector_R3', hw: 'Q4.3', desc: 'Deflector Rampa 3' }
];

const inputsMapping = [
    { reg: 0, sym: 'Cil_Peq_Ext', hw: 'I0.0', desc: 'Cil Peq Extendido U1' },
    { reg: 1, sym: 'Cil_Peq_Ret', hw: 'I0.1', desc: 'Cil Peq Retraido U1' },
    { reg: 2, sym: 'Cil_Lrg_Ext', hw: 'I0.2', desc: 'Cil Lrg Extendido U1' },
    { reg: 3, sym: 'Cil_Lrg_Ret', hw: 'I0.3', desc: 'Cil Lrg Retraido U1' },
    { reg: 4, sym: 'Presencia_Inf', hw: 'I0.4', desc: 'Pieza Lista en Base U1' },
    { reg: 8, sym: 'Prensa_Arriba', hw: 'I1.0', desc: 'Prensa Arriba U2' },
    { reg: 9, sym: 'Prensa_Abajo', hw: 'I1.1', desc: 'Prensa Abajo U2' },
    { reg: 16, sym: 'Cil_Ensa_Ret', hw: 'I2.0', desc: 'Cil Ensa Retraido U3' },
    { reg: 17, sym: 'Cil_Ensa_Ext', hw: 'I2.1', desc: 'Cil Ensa Extendido U3' },
    { reg: 24, sym: 'Cil_Vert_Arriba', hw: 'I3.0', desc: 'Brazo Arriba U4' },
    { reg: 25, sym: 'Cil_Vert_Abajo', hw: 'I3.1', desc: 'Brazo Abajo U4' },
    { reg: 26, sym: 'Pinza_Cerrada', hw: 'I3.2', desc: 'Pinza Cerrada U4' },
    { reg: 27, sym: 'Servo_En_U1', hw: 'I3.3', desc: 'Servo en Alimentacion' },
    { reg: 28, sym: 'Servo_En_U2', hw: 'I3.4', desc: 'Servo en Procesamiento' },
    { reg: 29, sym: 'Servo_En_U3', hw: 'I3.5', desc: 'Servo en Ensamblaje' },
    { reg: 30, sym: 'Servo_En_U5', hw: 'I3.6', desc: 'Servo en Seleccion' },
    { reg: 32, sym: 'Sens_Objeto_Ent', hw: 'I4.0', desc: 'Pieza en Cinta U5' },
    { reg: 33, sym: 'Sens_Metal', hw: 'I4.1', desc: 'Sensor Inductivo U5' },
    { reg: 34, sym: 'Sens_Mixto', hw: 'I4.2', desc: 'Sensor Optico U5' },
    { reg: 35, sym: 'Sens_Plastico', hw: 'I4.3', desc: 'Sensor Capacitivo U5' },
    { reg: 36, sym: 'Deflector_R1_Ext', hw: 'I4.4', desc: 'Deflector 1 Extendido' },
    { reg: 37, sym: 'Deflector_R2_Ext', hw: 'I4.5', desc: 'Deflector 2 Extendido' },
    { reg: 38, sym: 'Deflector_R3_Ext', hw: 'I4.6', desc: 'Deflector 3 Extendido' }
];

// --- FUNCION DE INICIALIZACION ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Primer fetch
    fetchState();
    // Loop de refresco cada 100ms
    setInterval(fetchState, 100);
});

// --- OBTENER ESTADO DEL SERVIDOR ---
function fetchState() {
    fetch('/api/state')
        .then(response => response.json())
        .then(data => {
            systemState = data;
            updateUI();
        })
        .catch(err => console.error("Error al obtener estado:", err));
}

// --- ACTUALIZAR LA INTERFAZ DE USUARIO ---
function updateUI() {
    // 1. Cabecera y badges de Modo
    const modeBadge = document.getElementById('system-mode-badge');
    const modeSelector = document.getElementById('mode-selector');
    
    if (systemState.emergency_stop) {
        modeBadge.innerText = "EMERGENCIA ACTIVA";
        modeBadge.className = "status-badge btn-danger";
    } else if (systemState.auto_mode) {
        modeBadge.innerText = "MODO: AUTOMATICO";
        modeBadge.className = "status-badge";
        modeBadge.style.color = "var(--success)";
        modeBadge.style.borderColor = "rgba(0, 255, 135, 0.2)";
        modeSelector.checked = true;
    } else {
        modeBadge.innerText = "MODO: MANUAL";
        modeBadge.className = "status-badge";
        modeBadge.style.color = "var(--warning)";
        modeBadge.style.borderColor = "rgba(255, 170, 0, 0.2)";
        modeSelector.checked = false;
    }

    // Boton de Parada de Emergencia
    const btnEmerg = document.getElementById('btn-emergency');
    if (systemState.emergency_stop) {
        btnEmerg.innerText = "RESTABLECER EMERGENCIA";
        btnEmerg.classList.add('active');
    } else {
        btnEmerg.innerText = "PARADA DE EMERGENCIA";
        btnEmerg.classList.remove('active');
    }

    // 2. Contadores e Informacion de pieza
    document.getElementById('counter-value').innerText = systemState.processed_count;
    
    if (systemState.piece_in_u5 || systemState.piece_in_u4 || systemState.piece_in_u3 || systemState.piece_in_u2 || systemState.piece_in_u1_delivery) {
        document.getElementById('info-piece-type').innerText = systemState.piece_type;
    } else {
        document.getElementById('info-piece-type').innerText = "-";
    }

    // LEDs de Informacion
    setLed('led-info-proc', systemState.piece_processed ? 'active' : 'inactive');
    setLed('led-info-ensa', systemState.piece_assembled ? 'active' : 'inactive');

    // 3. Desactivar mandos manuales si esta en AUTO o EMERGENCIA
    const manualPanel = document.getElementById('manual-controls-section');
    const manualButtons = manualPanel.querySelectorAll('.btn');
    
    if (systemState.auto_mode || systemState.emergency_stop) {
        manualPanel.classList.add('disabled');
        manualButtons.forEach(btn => btn.setAttribute('disabled', 'true'));
    } else {
        manualPanel.classList.remove('disabled');
        manualButtons.forEach(btn => btn.removeAttribute('disabled'));
    }

    // 4. Actualizar estado visual de los botones manuales (activos/inactivos)
    updateManualButtonState('v_cil_peq', systemState.v_cil_peq);
    updateManualButtonState('v_cil_lrg', systemState.v_cil_lrg);
    updateManualButtonState('v_prensa', systemState.v_prensa);
    updateManualButtonState('v_cil_ensa', systemState.v_cil_ensa);
    updateManualButtonState('v_cil_vert', systemState.v_cil_vert);
    updateManualButtonState('v_pinza', systemState.v_pinza);
    updateManualButtonState('motor_cinta', systemState.motor_cinta);
    updateManualButtonState('v_deflector_r1', systemState.v_deflector_r1);
    updateManualButtonState('v_deflector_r2', systemState.v_deflector_r2);
    updateManualButtonState('v_deflector_r3', systemState.v_deflector_r3);

    // Botones del Servo
    updateServoButtonState('U1', systemState.servo_en_u1);
    updateServoButtonState('U2', systemState.servo_en_u2);
    updateServoButtonState('U3', systemState.servo_en_u3);
    updateServoButtonState('U5', systemState.servo_en_u5);

    // --- ANIMACIONES DEL SIMULADOR ---

    // A. Eje Horizontal Servo U4 (Mapeo de left: 7% a 100%)
    const servoCarriage = document.getElementById('servo-carriage');
    const pServo = systemState.pos_servo;
    const minP = 8000.0;
    const maxP = 112000.0;
    const leftPct = 7 + ((pServo - minP) / (maxP - minP)) * 86; // Rango acotado
    servoCarriage.style.left = `${leftPct}%`;

    // Cilindro vertical U4
    const gripperArm = document.getElementById('gripper-arm');
    gripperArm.style.height = `${20 + systemState.pos_cil_vert * 0.4}px`;

    // Pinza holding piece
    const gripperHand = document.getElementById('gripper-hand');
    if (systemState.piece_in_u4) {
        gripperHand.classList.add('holding');
        // Poner la clase correspondiente al color del material agarrado
        gripperHand.className = `gripper-hand holding piece-color-${systemState.piece_type.toLowerCase()}`;
    } else {
        gripperHand.className = 'gripper-hand';
    }

    // B. U1: Alimentador
    // Cilindro pequeno
    document.getElementById('piston-small-vis').style.width = `${systemState.pos_cil_peq * 0.4}%`;
    // Cilindro largo
    document.getElementById('piston-large-vis').style.width = `${systemState.pos_cil_lrg * 0.4}%`;
    // Stock en tubo
    const u1PiecesDiv = document.getElementById('u1-pieces');
    if (systemState.has_piece_u1) {
        u1PiecesDiv.style.opacity = '1';
    } else {
        u1PiecesDiv.style.opacity = '0.2';
    }
    // Pieza en punto de entrega
    setPieceState('piece-u1-delivery', systemState.piece_in_u1_delivery);

    // C. U2: Procesamiento
    // Prensa
    document.getElementById('press-cylinder-vis').style.height = `${10 + systemState.pos_prensa * 0.4}px`;
    // Pieza en prensa
    setPieceState('piece-u2', systemState.piece_in_u2);

    // D. U3: Ensamblaje
    // Cilindro de empuje
    document.getElementById('piston-ensa-vis').style.width = `${systemState.pos_cil_ensa * 0.35}%`;
    // Pieza en mesa
    const pieceU3 = document.getElementById('piece-u3');
    setPieceState('piece-u3', systemState.piece_in_u3);
    if (systemState.piece_in_u3 && systemState.piece_assembled) {
        pieceU3.classList.add('assembled');
    } else {
        pieceU3.classList.remove('assembled');
    }

    // E. U5: Seleccion
    // Cinta transportadora
    const pieceU5 = document.getElementById('piece-u5');
    setPieceState('piece-u5', systemState.piece_in_u5);
    if (systemState.piece_in_u5) {
        pieceU5.style.left = `${systemState.pos_piece_u5}%`;
    }
    // Deflectores
    setDeflectorState('deflector-r1', systemState.v_deflector_r1);
    setDeflectorState('deflector-r2', systemState.v_deflector_r2);
    setDeflectorState('deflector-r3', systemState.v_deflector_r3);

    // 5. Renderizar tablas Modbus
    renderIOTables();

    // 6. Renderizar Historial
    renderHistoryTable();
}

function setPieceState(elemId, active) {
    const el = document.getElementById(elemId);
    if (active) {
        el.classList.add('active');
        el.className = `piece-vis active color-${systemState.piece_type.toLowerCase()}`;
    } else {
        el.classList.remove('active');
    }
}

function setDeflectorState(elemId, active) {
    const el = document.getElementById(elemId);
    if (active) {
        el.classList.add('active');
    } else {
        el.classList.remove('active');
    }
}

function setLed(elemId, stateClass) {
    const el = document.getElementById(elemId);
    el.className = `led-indicator inline-led ${stateClass}`;
}

function updateManualButtonState(cmd, active) {
    const btn = document.querySelector(`.btn-manual[data-cmd="${cmd}"]`);
    if (btn) {
        if (active) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

function updateServoButtonState(pos, active) {
    const btn = document.querySelector(`.btn-servo[data-pos="${pos}"]`);
    if (btn) {
        if (active) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

// --- SETUP EVENT LISTENERS ---
function setupEventListeners() {
    // Parada de Emergencia
    document.getElementById('btn-emergency').addEventListener('click', () => {
        const nextVal = !systemState.emergency_stop;
        sendCommand('emergency', nextVal);
    });

    // Cambiar Modo Auto / Manual
    document.getElementById('mode-selector').addEventListener('change', function() {
        sendCommand('toggle_auto', this.checked);
    });

    // Reabastecer Stock
    document.getElementById('btn-reabastecer').addEventListener('click', () => {
        sendCommand('reabastecer', true);
    });

    // Botones de control manual para actuadores
    document.querySelectorAll('.btn-manual').forEach(btn => {
        btn.addEventListener('click', function() {
            if (systemState.auto_mode) return;
            const cmd = this.getAttribute('data-cmd');
            const isActive = this.classList.contains('active');
            sendCommand(cmd, !isActive);
        });
    });

    // Botones de control manual para coordenadas del servo
    document.querySelectorAll('.btn-servo').forEach(btn => {
        btn.addEventListener('click', function() {
            if (systemState.auto_mode) return;
            const pos = this.getAttribute('data-pos');
            sendCommand('servo', pos);
        });
    });
}

// Enviar comandos al API
function sendCommand(cmd, val) {
    fetch('/api/cmd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cmd: cmd, val: val })
    })
    .catch(err => console.error("Error al enviar comando:", err));
}

// --- RENDERIZAR TABLAS I/O MODBUS ---
function renderIOTables() {
    const inputsBody = document.getElementById('inputs-table-body');
    const coilsBody = document.getElementById('coils-table-body');

    // Solo regenerar si las tablas estan vacias (evitamos parpadeo de reconstruccion)
    if (inputsBody.children.length === 0) {
        inputsMapping.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-mono">DI_${item.reg}</td>
                <td>${item.sym}</td>
                <td class="font-mono">${item.hw}</td>
                <td><span class="led-indicator" id="di-led-${item.reg}"></span></td>
            `;
            inputsBody.appendChild(tr);
        });
    }

    if (coilsBody.children.length === 0) {
        coilsMapping.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-mono">COIL_${item.reg}</td>
                <td>${item.sym}</td>
                <td class="font-mono">${item.hw}</td>
                <td><span class="led-indicator" id="coil-led-${item.reg}"></span></td>
            `;
            coilsBody.appendChild(tr);
        });
    }

    // Actualizar LEDs de estado en las tablas
    inputsMapping.forEach(item => {
        const el = document.getElementById(`di-led-${item.reg}`);
        if (el && systemState.inputs) {
            // El estado de las entradas se obtiene directamente de los valores del sistema
            const val = getSensorValueBySymbol(item.sym);
            el.className = `led-indicator ${val ? 'active' : ''}`;
        }
    });

    coilsMapping.forEach(item => {
        const el = document.getElementById(`coil-led-${item.reg}`);
        if (el) {
            const val = getActuatorValueBySymbol(item.sym);
            el.className = `led-indicator ${val ? 'active' : ''}`;
        }
    });
}

// Mapeos auxiliares de simbolos a variables del HMI
function getSensorValueBySymbol(sym) {
    switch(sym) {
        case 'Cil_Peq_Ext': return systemState.cil_peq_ext;
        case 'Cil_Peq_Ret': return systemState.cil_peq_ret;
        case 'Cil_Lrg_Ext': return systemState.cil_lrg_ext;
        case 'Cil_Lrg_Ret': return systemState.cil_lrg_ret;
        case 'Presencia_Inf': return systemState.presencia_inf;
        case 'Prensa_Arriba': return systemState.prensa_arriba;
        case 'Prensa_Abajo': return systemState.prensa_abajo;
        case 'Cil_Ensa_Ret': return systemState.cil_ensa_ret;
        case 'Cil_Ensa_Ext': return systemState.cil_ensa_ext;
        case 'Cil_Vert_Arriba': return systemState.cil_vert_arriba;
        case 'Cil_Vert_Abajo': return systemState.cil_vert_abajo;
        case 'Pinza_Cerrada': return systemState.pinza_cerrada;
        case 'Servo_En_U1': return systemState.servo_en_u1;
        case 'Servo_En_U2': return systemState.servo_en_u2;
        case 'Servo_En_U3': return systemState.servo_en_u3;
        case 'Servo_En_U5': return systemState.servo_en_u5;
        case 'Sens_Objeto_Ent': return systemState.sens_objeto_entrada;
        case 'Sens_Metal': return systemState.sens_metal;
        case 'Sens_Mixto': return systemState.sens_mixto;
        case 'Sens_Plastico': return systemState.sens_plastico;
        case 'Deflector_R1_Ext': return systemState.deflector_r1_ext;
        case 'Deflector_R2_Ext': return systemState.deflector_r2_ext;
        case 'Deflector_R3_Ext': return systemState.deflector_r3_ext;
        default: return false;
    }
}

function getActuatorValueBySymbol(sym) {
    switch(sym) {
        case 'V_Cil_Peq': return systemState.v_cil_peq;
        case 'V_Cil_Lrg': return systemState.v_cil_lrg;
        case 'V_Prensa': return systemState.v_prensa;
        case 'V_Cil_Ensa': return systemState.v_cil_ensa;
        case 'V_Cil_Vert': return systemState.v_cil_vert;
        case 'V_Pinza': return systemState.v_pinza;
        case 'Servo_Go_U1': return systemState.servo_go_u1;
        case 'Servo_Go_U2': return systemState.servo_go_u2;
        case 'Servo_Go_U3': return systemState.servo_go_u3;
        case 'Servo_Go_U5': return systemState.servo_go_u5;
        case 'Motor_Cinta': return systemState.motor_cinta;
        case 'V_Deflector_R1': return systemState.v_deflector_r1;
        case 'V_Deflector_R2': return systemState.v_deflector_r2;
        case 'V_Deflector_R3': return systemState.v_deflector_r3;
        default: return false;
    }
}

// --- RENDERIZAR TABLA DE HISTORIAL ---
function renderHistoryTable() {
    const historyBody = document.getElementById('history-table-body');
    if (!systemState.history || systemState.history.length === 0) {
        historyBody.innerHTML = `
            <tr>
                <td colspan="5" class="txt-center text-muted">No hay piezas procesadas todavia</td>
            </tr>
        `;
        return;
    }

    historyBody.innerHTML = "";
    // Mostrar en orden inverso para ver la mas reciente arriba
    const displayList = [...systemState.history].reverse();
    displayList.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${item.id}</td>
            <td><strong>${item.type}</strong></td>
            <td>${item.processed ? '<span style="color:var(--success)">Si</span>' : 'No'}</td>
            <td>${item.assembled ? '<span style="color:var(--success)">Si</span>' : 'No'}</td>
            <td><span class="status-badge" style="color:var(--primary);border-color:var(--panel-border)">${item.status}</span></td>
        `;
        historyBody.appendChild(tr);
    });
}
