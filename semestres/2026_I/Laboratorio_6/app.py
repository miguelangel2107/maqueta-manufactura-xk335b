import os
import time
import threading
import random
from flask import Flask, render_template, jsonify, request
from pyModbusTCP.server import ModbusServer

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

# --- CONFIGURACION MODBUS ---
# El simulador corre un servidor Modbus TCP en el puerto 5020 (para evitar requerir privilegios de root)
# Coils (Bobinas - Lectura/Escritura por el PLC para accionar actuadores):
# 0: V_Cil_Peq (U1)
# 1: V_Cil_Lrg (U1)
# 8: V_Prensa (U2)
# 16: V_Cil_Ensa (U3)
# 24: V_Cil_Vert (U4 - 1=Bajar, 0=Subir)
# 25: V_Pinza (U4 - 1=Cerrar, 0=Abrir)
# 26: Servo_Go_U1 (U4 - Viajar a Alimentacion)
# 27: Servo_Go_U2 (U4 - Viajar a Procesamiento)
# 28: Servo_Go_U3 (U4 - Viajar a Ensamblaje)
# 29: Servo_Go_U5 (U4 - Viajar a Seleccion)
# 32: Motor_Cinta (U5 - 1=Encendido, 0=Apagado)
# 33: V_Deflector_R1 (U5)
# 34: V_Deflector_R2 (U5)
# 35: V_Deflector_R3 (U5)

# Discrete Inputs (Entradas - Lectura desde el PLC para leer sensores):
# 0: Cil_Peq_Ext (U1)
# 1: Cil_Peq_Ret (U1)
# 2: Cil_Lrg_Ext (U1)
# 3: Cil_Lrg_Ret (U1)
# 4: Presencia_Inf (U1 - Pieza lista en rampa)
# 8: Prensa_Arriba (U2)
# 9: Prensa_Abajo (U2)
# 16: Cil_Ensa_Ret (U3)
# 17: Cil_Ensa_Ext (U3)
# 24: Cil_Vert_Arriba (U4)
# 25: Cil_Vert_Abajo (U4)
# 26: Pinza_Cerrada (U4)
# 27: Servo_En_U1 (U4)
# 28: Servo_En_U2 (U4)
# 29: Servo_En_U3 (U4)
# 30: Servo_En_U5 (U4)
# 32: Sens_Objeto_Entrada (U5)
# 33: Sens_Metal (U5)
# 34: Sens_Mixto (U5)
# 35: Sens_Plastico (U5)
# 36: Deflector_R1_Ext (U5)
# 37: Deflector_R2_Ext (U5)
# 38: Deflector_R3_Ext (U5)

class PlantState:
    def __init__(self):
        # Estado de Actuadores (Coils)
        self.v_cil_peq = False
        self.v_cil_lrg = False
        self.v_prensa = False
        self.v_cil_ensa = False
        self.v_cil_vert = False
        self.v_pinza = False
        self.servo_go_u1 = False
        self.servo_go_u2 = False
        self.servo_go_u3 = False
        self.servo_go_u5 = False
        self.motor_cinta = False
        self.v_deflector_r1 = False
        self.v_deflector_r2 = False
        self.v_deflector_r3 = False

        # Estado de Fisicas e Intermedios (Posiciones de 0 a 100)
        self.pos_cil_peq = 0.0  # 0 = Retraido, 100 = Extendido
        self.pos_cil_lrg = 0.0
        self.pos_prensa = 0.0
        self.pos_cil_ensa = 0.0
        self.pos_cil_vert = 0.0  # 0 = Arriba, 100 = Abajo
        self.pos_deflector_r1 = 0.0
        self.pos_deflector_r2 = 0.0
        self.pos_deflector_r3 = 0.0

        # Eje Servo Horizontal (Pulsos)
        self.pos_servo = 0.0  # Posicion actual
        self.target_servo = 0.0  # Destino deseado
        self.coords = {
            'U1': 20000.0,
            'U2': 44000.0,
            'U3': 81500.0,
            'U5': 107000.0
        }

        # Estado de las Piezas
        self.has_piece_u1 = True  # Inicia con pieza en el alimentador
        self.piece_in_u1_delivery = False
        self.piece_in_u2 = False
        self.piece_in_u3 = False
        self.piece_in_u4 = False  # Pieza en la pinza del transporte
        self.piece_in_u5 = False
        self.pos_piece_u5 = 0.0  # Posicion de la pieza en la cinta (0 a 100)
        self.piece_type = "Plastico"  # Plastico, Metal, Mixto (aleatorio al generarse)
        self.piece_assembled = False
        self.piece_processed = False

        # Sensores (Inputs)
        self.cil_peq_ext = False
        self.cil_peq_ret = True
        self.cil_lrg_ext = False
        self.cil_lrg_ret = True
        self.presencia_inf = False
        self.prensa_arriba = True
        self.prensa_abajo = False
        self.cil_ensa_ret = True
        self.cil_ensa_ext = False
        self.cil_vert_arriba = True
        self.cil_vert_abajo = False
        self.pinza_cerrada = False
        self.servo_en_u1 = False
        self.servo_en_u2 = False
        self.servo_en_u3 = False
        self.servo_en_u5 = False
        self.sens_objeto_entrada = False
        self.sens_metal = False
        self.sens_mixto = False
        self.sens_plastico = False
        self.deflector_r1_ext = False
        self.deflector_r2_ext = False
        self.deflector_r3_ext = False

        # Modo de Control (Auto / Manual)
        self.auto_mode = True
        self.emergency_stop = False
        
        # Historial de piezas procesadas para mostrar en el HMI
        self.processed_count = 0
        self.history = []

state = PlantState()

# Servidor Modbus TCP que corre en el localhost puerto 5020
modbus_server = ModbusServer(host='0.0.0.0', port=5020, no_block=True)

def update_modbus_registers():
    """Copia el estado de la simulacion a los registros Modbus de lectura (Inputs)
    y lee las salidas del PLC (Coils) para aplicarlas a los actuadores."""
    global state

    # --- LECTURA DE COILS (PLC -> Actuadores) ---
    # Si la parada de emergencia esta activa, forzamos a apagar todas las salidas
    if state.emergency_stop:
        modbus_server.data_bank.set_coils(0, [False] * 40)
        state.v_cil_peq = False
        state.v_cil_lrg = False
        state.v_prensa = False
        state.v_cil_ensa = False
        state.v_cil_vert = False
        state.v_pinza = False
        state.servo_go_u1 = False
        state.servo_go_u2 = False
        state.servo_go_u3 = False
        state.servo_go_u5 = False
        state.motor_cinta = False
        state.v_deflector_r1 = False
        state.v_deflector_r2 = False
        state.v_deflector_r3 = False
    else:
        # En condiciones normales, leemos las salidas del Modbus Data Bank
        coils = modbus_server.data_bank.get_coils(0, 40)
        if coils:
            state.v_cil_peq = coils[0]
            state.v_cil_lrg = coils[1]
            state.v_prensa = coils[8]
            state.v_cil_ensa = coils[16]
            state.v_cil_vert = coils[24]
            state.v_pinza = coils[25]
            state.servo_go_u1 = coils[26]
            state.servo_go_u2 = coils[27]
            state.servo_go_u3 = coils[28]
            state.servo_go_u5 = coils[29]
            state.motor_cinta = coils[32]
            state.v_deflector_r1 = coils[33]
            state.v_deflector_r2 = coils[34]
            state.v_deflector_r3 = coils[35]

    # --- ESCRITURA DE DISCRETE INPUTS (Sensores -> PLC) ---
    inputs = [False] * 40
    # U1
    inputs[0] = state.cil_peq_ext
    inputs[1] = state.cil_peq_ret
    inputs[2] = state.cil_lrg_ext
    inputs[3] = state.cil_lrg_ret
    inputs[4] = state.presencia_inf
    # U2
    inputs[8] = state.prensa_arriba
    inputs[9] = state.prensa_abajo
    # U3
    inputs[16] = state.cil_ensa_ret
    inputs[17] = state.cil_ensa_ext
    # U4
    inputs[24] = state.cil_vert_arriba
    inputs[25] = state.cil_vert_abajo
    inputs[26] = state.pinza_cerrada
    inputs[27] = state.servo_en_u1
    inputs[28] = state.servo_en_u2
    inputs[29] = state.servo_en_u3
    inputs[30] = state.servo_en_u5
    # U5
    inputs[32] = state.sens_objeto_entrada
    inputs[33] = state.sens_metal
    inputs[34] = state.sens_mixto
    inputs[35] = state.sens_plastico
    inputs[36] = state.deflector_r1_ext
    inputs[37] = state.deflector_r2_ext
    inputs[38] = state.deflector_r3_ext

    modbus_server.data_bank.set_discrete_inputs(0, inputs)


def simulation_loop():
    """Hilo secundario que simula la fisica de la planta en tiempo real."""
    global state
    dt = 0.05  # Paso de tiempo de 50ms
    servo_speed = 30000.0  # Pulsos por segundo

    while True:
        time.sleep(dt)

        if state.emergency_stop:
            # En emergencia, los actuadores neumaticos retornan por accion de sus resortes
            state.v_cil_peq = False
            state.v_cil_lrg = False
            state.v_prensa = False
            state.v_cil_ensa = False
            state.v_cil_vert = False
            state.v_pinza = False
            state.motor_cinta = False
            state.v_deflector_r1 = False
            state.v_deflector_r2 = False
            state.v_deflector_r3 = False

        # --- SIMULACION DE CILINDROS (Fisica Simple) ---
        # U1: Piston pequeno (retenedor)
        if state.v_cil_peq:
            state.pos_cil_peq = min(100.0, state.pos_cil_peq + 100.0 * dt / 0.5)  # Tarda 0.5s en extenderse
        else:
            state.pos_cil_peq = max(0.0, state.pos_cil_peq - 100.0 * dt / 0.5)
        state.cil_peq_ext = state.pos_cil_peq >= 98.0
        state.cil_peq_ret = state.pos_cil_peq <= 2.0

        # U1: Piston largo (empujador)
        if state.v_cil_lrg:
            state.pos_cil_lrg = min(100.0, state.pos_cil_lrg + 100.0 * dt / 0.8)  # Tarda 0.8s
        else:
            state.pos_cil_lrg = max(0.0, state.pos_cil_lrg - 100.0 * dt / 0.8)
        state.cil_lrg_ext = state.pos_cil_lrg >= 98.0
        state.cil_lrg_ret = state.pos_cil_lrg <= 2.0

        # Si el piston largo se extiende completamente y hay pieza en U1, se empuja a la posicion de entrega
        if state.cil_lrg_ext and state.has_piece_u1:
            state.has_piece_u1 = False
            state.piece_in_u1_delivery = True
            # Al dosificar, generamos el tipo de pieza de forma aleatoria
            state.piece_type = random.choice(["Metal", "Plastico", "Mixto"])
            state.piece_processed = False
            state.piece_assembled = False

        state.presencia_inf = state.piece_in_u1_delivery

        # U2: Prensa
        if state.v_prensa:
            state.pos_prensa = min(100.0, state.pos_prensa + 100.0 * dt / 1.0)  # Tarda 1s
        else:
            state.pos_prensa = max(0.0, state.pos_prensa - 100.0 * dt / 1.0)
        state.prensa_abajo = state.pos_prensa >= 98.0
        state.prensa_arriba = state.pos_prensa <= 2.0

        # Si la prensa esta abajo y hay una pieza en U2, se procesa (estampado)
        if state.prensa_abajo and state.piece_in_u2:
            state.piece_processed = True

        # U3: Cilindro Ensamblador
        if state.v_cil_ensa:
            state.pos_cil_ensa = min(100.0, state.pos_cil_ensa + 100.0 * dt / 0.6)  # Tarda 0.6s
        else:
            state.pos_cil_ensa = max(0.0, state.pos_cil_ensa - 100.0 * dt / 0.6)
        state.cil_ensa_ext = state.pos_cil_ensa >= 98.0
        state.cil_ensa_ret = state.pos_cil_ensa <= 2.0

        # Si el piston de ensamble se extiende y hay pieza en U3, se ensambla
        if state.cil_ensa_ext and state.piece_in_u3:
            state.piece_assembled = True

        # U4: Brazo Vertical
        if state.v_cil_vert:
            state.pos_cil_vert = min(100.0, state.pos_cil_vert + 100.0 * dt / 0.5)  # 0.5s para bajar
        else:
            state.pos_cil_vert = max(0.0, state.pos_cil_vert - 100.0 * dt / 0.5)  # 0.5s para subir
        state.cil_vert_abajo = state.pos_cil_vert >= 98.0
        state.cil_vert_arriba = state.pos_cil_vert <= 2.0

        # U4: Pinza
        state.pinza_cerrada = state.v_pinza  # La pinza es instantanea en esta simulacion

        # Logica de Recoger / Soltar pieza por la pinza del brazo
        if state.pinza_cerrada and state.cil_vert_abajo:
            # Si el brazo baja y cierra pinza, intenta agarrar pieza de donde este ubicado
            if state.servo_en_u1 and state.piece_in_u1_delivery:
                state.piece_in_u1_delivery = False
                state.piece_in_u4 = True
            elif state.servo_en_u2 and state.piece_in_u2:
                state.piece_in_u2 = False
                state.piece_in_u4 = True
            elif state.servo_en_u3 and state.piece_in_u3:
                state.piece_in_u3 = False
                state.piece_in_u4 = True

        if not state.pinza_cerrada and state.cil_vert_abajo and state.piece_in_u4:
            # Si abre pinza estando abajo, deposita la pieza segun ubicacion actual
            state.piece_in_u4 = False
            if state.servo_en_u1:
                state.piece_in_u1_delivery = True
            elif state.servo_en_u2:
                state.piece_in_u2 = True
            elif state.servo_en_u3:
                state.piece_in_u3 = True
            elif state.servo_en_u5:
                state.piece_in_u5 = True
                state.pos_piece_u5 = 0.0  # Inicia al principio de la cinta

        # --- SIMULACION DEL SERVO (Eje horizontal U4) ---
        if not state.emergency_stop:
            if state.servo_go_u1:
                state.target_servo = state.coords['U1']
            elif state.servo_go_u2:
                state.target_servo = state.coords['U2']
            elif state.servo_go_u3:
                state.target_servo = state.coords['U3']
            elif state.servo_go_u5:
                state.target_servo = state.coords['U5']

            # Mover el servo hacia la coordenada objetivo
            diff = state.target_servo - state.pos_servo
            if abs(diff) > 10.0:
                step = servo_speed * dt
                if abs(diff) < step:
                    state.pos_servo = state.target_servo
                else:
                    state.pos_servo += (step if diff > 0 else -step)

        # Sensores de posicion del servo (tolerancia de 100 pulsos)
        state.servo_en_u1 = abs(state.pos_servo - state.coords['U1']) <= 100.0
        state.servo_en_u2 = abs(state.pos_servo - state.coords['U2']) <= 100.0
        state.servo_en_u3 = abs(state.pos_servo - state.coords['U3']) <= 100.0
        state.servo_en_u5 = abs(state.pos_servo - state.coords['U5']) <= 100.0

        # --- SIMULACION DE SELECCION (Cinta transportadora U5) ---
        # U5: Deflectores neumaticos
        if state.v_deflector_r1:
            state.pos_deflector_r1 = min(100.0, state.pos_deflector_r1 + 100.0 * dt / 0.4)
        else:
            state.pos_deflector_r1 = max(0.0, state.pos_deflector_r1 - 100.0 * dt / 0.4)
        state.deflector_r1_ext = state.pos_deflector_r1 >= 98.0

        if state.v_deflector_r2:
            state.pos_deflector_r2 = min(100.0, state.pos_deflector_r2 + 100.0 * dt / 0.4)
        else:
            state.pos_deflector_r2 = max(0.0, state.pos_deflector_r2 - 100.0 * dt / 0.4)
        state.deflector_r2_ext = state.pos_deflector_r2 >= 98.0

        if state.v_deflector_r3:
            state.pos_deflector_r3 = min(100.0, state.pos_deflector_r3 + 100.0 * dt / 0.4)
        else:
            state.pos_deflector_r3 = max(0.0, state.pos_deflector_r3 - 100.0 * dt / 0.4)
        state.deflector_r3_ext = state.pos_deflector_r3 >= 98.0

        # Mover pieza sobre la cinta transportadora de U5
        if state.piece_in_u5:
            # Si el motor esta encendido, la pieza avanza
            if state.motor_cinta:
                state.pos_piece_u5 += 20.0 * dt  # Tarda unos 5s en recorrer la cinta completa

            # Sensor de objeto en la entrada de la cinta
            state.sens_objeto_entrada = state.pos_piece_u5 < 10.0

            # Los sensores detectan el material a mitad de camino (ej. posicion 30.0)
            if 25.0 <= state.pos_piece_u5 <= 35.0:
                state.sens_metal = state.piece_type == "Metal"
                state.sens_mixto = state.piece_type == "Mixto"
                state.sens_plastico = state.piece_type == "Plastico"
            else:
                state.sens_metal = False
                state.sens_mixto = False
                state.sens_plastico = False

            # Deflector Rampa 1 (Metal) en posicion 40.0
            if state.pos_piece_u5 >= 40.0 and state.piece_type == "Metal" and state.deflector_r1_ext:
                state.piece_in_u5 = False
                state.processed_count += 1
                state.history.append({"id": state.processed_count, "type": "Metal", "status": "Rampa 1", "processed": state.piece_processed, "assembled": state.piece_assembled})
                # Reabastecer tubo de U1 automaticamente para mantener el ciclo infinito
                state.has_piece_u1 = True

            # Deflector Rampa 2 (Mixto) en posicion 60.0
            elif state.pos_piece_u5 >= 60.0 and state.piece_type == "Mixto" and state.deflector_r2_ext:
                state.piece_in_u5 = False
                state.processed_count += 1
                state.history.append({"id": state.processed_count, "type": "Mixto", "status": "Rampa 2", "processed": state.piece_processed, "assembled": state.piece_assembled})
                state.has_piece_u1 = True

            # Deflector Rampa 3 (Plastico) en posicion 80.0
            elif state.pos_piece_u5 >= 80.0 and state.piece_type == "Plastico" and state.deflector_r3_ext:
                state.piece_in_u5 = False
                state.processed_count += 1
                state.history.append({"id": state.processed_count, "type": "Plastico", "status": "Rampa 3", "processed": state.piece_processed, "assembled": state.piece_assembled})
                state.has_piece_u1 = True

            # Si la pieza llega al final de la cinta (posicion 100) sin ser desviada, cae por descarte
            elif state.pos_piece_u5 >= 100.0:
                state.piece_in_u5 = False
                state.processed_count += 1
                state.history.append({"id": state.processed_count, "type": state.piece_type, "status": "Descarte / Caida", "processed": state.piece_processed, "assembled": state.piece_assembled})
                state.has_piece_u1 = True
        else:
            state.sens_objeto_entrada = False
            state.sens_metal = False
            state.sens_mixto = False
            state.sens_plastico = False

        # Sincronizacion de datos con la tabla Modbus
        update_modbus_registers()

# --- RUTAS DE FLASK (API E INTERFAZ) ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/state', methods=['GET'])
def get_state():
    global state
    return jsonify({
        # Actuadores
        'v_cil_peq': state.v_cil_peq,
        'v_cil_lrg': state.v_cil_lrg,
        'v_prensa': state.v_prensa,
        'v_cil_ensa': state.v_cil_ensa,
        'v_cil_vert': state.v_cil_vert,
        'v_pinza': state.v_pinza,
        'servo_go_u1': state.servo_go_u1,
        'servo_go_u2': state.servo_go_u2,
        'servo_go_u3': state.servo_go_u3,
        'servo_go_u5': state.servo_go_u5,
        'motor_cinta': state.motor_cinta,
        'v_deflector_r1': state.v_deflector_r1,
        'v_deflector_r2': state.v_deflector_r2,
        'v_deflector_r3': state.v_deflector_r3,
        # Sensores
        'cil_peq_ext': state.cil_peq_ext,
        'cil_peq_ret': state.cil_peq_ret,
        'cil_lrg_ext': state.cil_lrg_ext,
        'cil_lrg_ret': state.cil_lrg_ret,
        'presencia_inf': state.presencia_inf,
        'prensa_arriba': state.prensa_arriba,
        'prensa_abajo': state.prensa_abajo,
        'cil_ensa_ret': state.cil_ensa_ret,
        'cil_ensa_ext': state.cil_ensa_ext,
        'cil_vert_arriba': state.cil_vert_arriba,
        'cil_vert_abajo': state.cil_vert_abajo,
        'pinza_cerrada': state.pinza_cerrada,
        'servo_en_u1': state.servo_en_u1,
        'servo_en_u2': state.servo_en_u2,
        'servo_en_u3': state.servo_en_u3,
        'servo_en_u5': state.servo_en_u5,
        'sens_objeto_entrada': state.sens_objeto_entrada,
        'sens_metal': state.sens_metal,
        'sens_mixto': state.sens_mixto,
        'sens_plastico': state.sens_plastico,
        'deflector_r1_ext': state.deflector_r1_ext,
        'deflector_r2_ext': state.deflector_r2_ext,
        'deflector_r3_ext': state.deflector_r3_ext,
        # Fisicas e Intermedios
        'pos_cil_peq': state.pos_cil_peq,
        'pos_cil_lrg': state.pos_cil_lrg,
        'pos_prensa': state.pos_prensa,
        'pos_cil_ensa': state.pos_cil_ensa,
        'pos_cil_vert': state.pos_cil_vert,
        'pos_servo': state.pos_servo,
        'pos_piece_u5': state.pos_piece_u5,
        'pos_deflector_r1': state.pos_deflector_r1,
        'pos_deflector_r2': state.pos_deflector_r2,
        'pos_deflector_r3': state.pos_deflector_r3,
        # Piezas
        'has_piece_u1': state.has_piece_u1,
        'piece_in_u1_delivery': state.piece_in_u1_delivery,
        'piece_in_u2': state.piece_in_u2,
        'piece_in_u3': state.piece_in_u3,
        'piece_in_u4': state.piece_in_u4,
        'piece_in_u5': state.piece_in_u5,
        'piece_type': state.piece_type,
        'piece_processed': state.piece_processed,
        'piece_assembled': state.piece_assembled,
        # Control
        'auto_mode': state.auto_mode,
        'emergency_stop': state.emergency_stop,
        'processed_count': state.processed_count,
        'history': state.history[-5:]  # Solo enviar los ultimos 5
    })

@app.route('/api/cmd', methods=['POST'])
def command():
    global state
    data = request.get_json()
    cmd = data.get('cmd')
    val = data.get('val')

    if cmd == 'emergency':
        state.emergency_stop = val
        if val:
            # Escribir ceros en el banco de datos Modbus
            modbus_server.data_bank.set_coils(0, [False] * 40)
    elif cmd == 'toggle_auto':
        state.auto_mode = val
    elif cmd == 'reabastecer':
        state.has_piece_u1 = True
    elif not state.auto_mode:
        # Solo permitimos accionar directamente los actuadores en modo Manual
        if cmd == 'v_cil_peq':
            modbus_server.data_bank.set_coils(0, [val])
        elif cmd == 'v_cil_lrg':
            modbus_server.data_bank.set_coils(1, [val])
        elif cmd == 'v_prensa':
            modbus_server.data_bank.set_coils(8, [val])
        elif cmd == 'v_cil_ensa':
            modbus_server.data_bank.set_coils(16, [val])
        elif cmd == 'v_cil_vert':
            modbus_server.data_bank.set_coils(24, [val])
        elif cmd == 'v_pinza':
            modbus_server.data_bank.set_coils(25, [val])
        elif cmd == 'servo':
            # Comando manual de posicion
            if val == 'U1':
                modbus_server.data_bank.set_coils(26, [True])
                modbus_server.data_bank.set_coils(27, [False])
                modbus_server.data_bank.set_coils(28, [False])
                modbus_server.data_bank.set_coils(29, [False])
            elif val == 'U2':
                modbus_server.data_bank.set_coils(26, [False])
                modbus_server.data_bank.set_coils(27, [True])
                modbus_server.data_bank.set_coils(28, [False])
                modbus_server.data_bank.set_coils(29, [False])
            elif val == 'U3':
                modbus_server.data_bank.set_coils(26, [False])
                modbus_server.data_bank.set_coils(27, [False])
                modbus_server.data_bank.set_coils(28, [True])
                modbus_server.data_bank.set_coils(29, [False])
            elif val == 'U5':
                modbus_server.data_bank.set_coils(26, [False])
                modbus_server.data_bank.set_coils(27, [False])
                modbus_server.data_bank.set_coils(28, [False])
                modbus_server.data_bank.set_coils(29, [True])
        elif cmd == 'motor_cinta':
            modbus_server.data_bank.set_coils(32, [val])
        elif cmd == 'v_deflector_r1':
            modbus_server.data_bank.set_coils(33, [val])
        elif cmd == 'v_deflector_r2':
            modbus_server.data_bank.set_coils(34, [val])
        elif cmd == 'v_deflector_r3':
            modbus_server.data_bank.set_coils(35, [val])

    return jsonify({'status': 'ok'})

# --- INICIO DEL PROGRAMA ---
if __name__ == '__main__':
    # Lanzar hilo de la simulacion fisica
    sim_thread = threading.Thread(target=simulation_loop)
    sim_thread.daemon = True
    sim_thread.start()

    # Iniciar servidor Modbus TCP
    print("Iniciando servidor Modbus TCP en el puerto 5020...")
    modbus_server.start()

    # Iniciar controlador automatico interno (Stage 1) - COMENTADO PARA LA ETAPA 2 (OPENPLC)
    # from controller import run_controller
    # control_thread = threading.Thread(target=run_controller, args=(state, modbus_server.data_bank))
    # control_thread.daemon = True
    # control_thread.start()

    # Iniciar servidor Web Flask
    print("Iniciando servidor Web HMI en puerto 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)
