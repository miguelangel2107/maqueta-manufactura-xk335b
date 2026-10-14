import minimalmodbus
import serial
import time
import sqlite3
import threading
import struct
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuracion Modbus
PUERTO = '/dev/ttyUSB0'
DIRECCION_PLC = 2
BAUDRATE = 19200
DB_PATH = 'piezas.db'

# Usuarios y Roles para Seguridad SCADA
USERS = {
    "operador": {"password": "operador123", "role": "Operador"},
    "ingeniero": {"password": "ingeniero123", "role": "Ingeniero"}
}

# Locks y variables globales
modbus_lock = threading.Lock()
db_lock = threading.Lock()
state_cache = {
    'online': False,
    'valores': [0, 0, 0, 0],
    'pos_alim': 0,
    'pos_proc': 0,
    'pos_ensa': 0,
    'pos_sele': 0,
    'pos_actual': 0,
    'seta_activa': False,  # Seta de Emergencia (NC: 0 = activa, 1 = liberada)
    'error': None
}

# --- Inicializacion de Instrumento Modbus ---
instrumento = None
try:
    instrumento = minimalmodbus.Instrument(PUERTO, DIRECCION_PLC)
    instrumento.serial.baudrate = BAUDRATE
    instrumento.serial.parity = serial.PARITY_EVEN
    instrumento.serial.stopbits = 1
    instrumento.serial.timeout = 0.5
except Exception as e:
    print(f"Error inicializando Modbus: {e}")

# --- Base de Datos ---
def inicializar_db():
    with db_lock:
        conn = sqlite3.connect(DB_PATH, timeout=10.0)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS registro_piezas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tipo TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS registro_auditoria (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usuario TEXT NOT NULL,
                accion TEXT NOT NULL,
                detalle TEXT NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

def registrar_pieza(tipo):
    try:
        with db_lock:
            conn = sqlite3.connect(DB_PATH, timeout=10.0)
            cursor = conn.cursor()
            cursor.execute('INSERT INTO registro_piezas (tipo) VALUES (?)', (tipo,))
            conn.commit()
            conn.close()
        print(f"[BD] Pieza clasificada registrada: {tipo}")
    except Exception as e:
        print(f"[BD] Error al registrar pieza: {e}")

def registrar_auditoria(usuario, accion, detalle):
    try:
        with db_lock:
            conn = sqlite3.connect(DB_PATH, timeout=10.0)
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO registro_auditoria (usuario, accion, detalle) VALUES (?, ?, ?)',
                (usuario, accion, detalle)
            )
            conn.commit()
            conn.close()
        print(f"[AUDITORIA] {usuario} | {accion}: {detalle}")
    except Exception as e:
        print(f"[AUDITORIA] Error al registrar auditoria: {e}")

# --- Hilo de Monitoreo Modbus ---
def background_polling():
    global instrumento
    inicializar_db()
    prev_sel_idle = True
    
    # Registro de estado de conexion previo para alarmas de timeout
    prev_online = False
    prev_seta_activa = False
    
    while True:
        # Reintentar inicializacion de puerto si es necesario
        if instrumento is None:
            try:
                instrumento = minimalmodbus.Instrument(PUERTO, DIRECCION_PLC)
                instrumento.serial.baudrate = BAUDRATE
                instrumento.serial.parity = serial.PARITY_EVEN
                instrumento.serial.stopbits = 1
                instrumento.serial.timeout = 0.5
            except Exception as e:
                if prev_online:
                    registrar_auditoria('SISTEMA', 'ALARMA_TIMEOUT', 'Perdida de comunicacion con el PLC S7-200. Alarma de Timeout activa.')
                    prev_online = False
                state_cache['online'] = False
                state_cache['error'] = f"Error al abrir puerto serie: {str(e)}"
                time.sleep(2.0)
                continue

        # Lectura ciclica con Lock
        try:
            with modbus_lock:
                # Lectura optimizada en un solo bloque de 19 registros (0 a 18)
                bloque = instrumento.read_registers(0, 19, functioncode=3)
                
                # Leer la Seta de Emergencia fisica (I2.6 -> Modbus Discrete Input 22)
                try:
                    seta_val = instrumento.read_bit(22, functioncode=2)
                    seta_activa = (seta_val == 0)
                except Exception:
                    seta_activa = False

            # Extraer e interpretar los datos
            valores = bloque[0:4]
            pos_alim = struct.unpack('>i', struct.pack('>HH', bloque[5], bloque[6]))[0]
            pos_proc = struct.unpack('>i', struct.pack('>HH', bloque[7], bloque[8]))[0]
            pos_ensa = struct.unpack('>i', struct.pack('>HH', bloque[9], bloque[10]))[0]
            pos_sele = struct.unpack('>i', struct.pack('>HH', bloque[11], bloque[12]))[0]
            pos_actual = struct.unpack('>i', struct.pack('>HH', bloque[17], bloque[18]))[0]

            # Auditoria de eventos de red y Seta
            if not prev_online:
                registrar_auditoria('SISTEMA', 'CONEXION_RESTABLECIDA', 'Comunicacion con el PLC S7-200 restablecida.')
                prev_online = True
                
            if prev_seta_activa != seta_activa:
                if seta_activa:
                    registrar_auditoria('SISTEMA', 'EMERGENCIA_ACTIVA', 'Seta de Emergencia fisica presionada (I2.6 = 0). Acciones de escritura bloqueadas.')
                else:
                    registrar_auditoria('SISTEMA', 'EMERGENCIA_LIBERADA', 'Seta de Emergencia fisica liberada (I2.6 = 1).')
                prev_seta_activa = seta_activa

            # Actualizar Cache
            state_cache['online'] = True
            state_cache['valores'] = valores
            state_cache['pos_alim'] = pos_alim
            state_cache['pos_proc'] = pos_proc
            state_cache['pos_ensa'] = pos_ensa
            state_cache['pos_sele'] = pos_sele
            state_cache['pos_actual'] = pos_actual
            state_cache['seta_activa'] = seta_activa
            state_cache['error'] = None

            # --- Logica de Piezas (Estacion 5 - Seleccion) ---
            val_sele = valores[3]
            sele_state = val_sele >> 8
            
            sel_idle = (sele_state & 0x04) != 0 
            p_metal = (sele_state & 0x08) != 0     
            p_mixta = (sele_state & 0x10) != 0     
            p_plastica = (sele_state & 0x20) != 0  
            
            if not prev_sel_idle and sel_idle:
                if p_metal:
                    registrar_pieza("Metalica")
                elif p_mixta:
                    registrar_pieza("Mixta")
                elif p_plastica:
                    registrar_pieza("Plastica")
                else:
                    registrar_pieza("No identificada")
            
            prev_sel_idle = sel_idle

        except Exception as e:
            if prev_online:
                registrar_auditoria('SISTEMA', 'ALARMA_TIMEOUT', f'Perdida de comunicacion con el PLC S7-200. Error: {str(e)}')
                prev_online = False
            state_cache['online'] = False
            state_cache['error'] = f"Error de lectura: {str(e)}"
            instrumento = None
            
        time.sleep(0.3)

# Iniciar el hilo de monitoreo
polling_thread = threading.Thread(target=background_polling, daemon=True)
polling_thread.start()

# --- Endpoints de la API ---
@app.route('/api/state')
def get_state():
    # Consultar DB para estadisticas de piezas
    ultimas = []
    conteos = {}
    total = 0
    try:
        with db_lock:
            conn = sqlite3.connect(DB_PATH, timeout=10.0)
            cursor = conn.cursor()
            cursor.execute("SELECT id, datetime(fecha_hora, 'localtime'), tipo FROM registro_piezas ORDER BY id DESC LIMIT 5")
            ultimas = [{'id': r[0], 'fecha': r[1], 'tipo': r[2]} for r in cursor.fetchall()]
            
            cursor.execute('SELECT tipo, COUNT(*) FROM registro_piezas GROUP BY tipo')
            conteos = dict(cursor.fetchall())
            
            cursor.execute('SELECT COUNT(*) FROM registro_piezas')
            total = cursor.fetchone()[0]
            conn.close()
    except Exception as e:
        print(f"Error consultando DB para API: {e}")

    # Retornar estado combinado
    return jsonify({
        'plc': state_cache,
        'db': {
            'ultimas': ultimas,
            'conteos': conteos,
            'total': total
        }
    })

@app.route('/api/login', methods=['POST'])
def post_login():
    params = request.get_json(silent=True) or {}
    username = params.get('username')
    password = params.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'error': 'Usuario y contrasena requeridos'}), 400
        
    user = USERS.get(username.lower())
    if user and user['password'] == password:
        registrar_auditoria(username, 'INICIO_SESION', 'Inicio de sesion exitoso.')
        return jsonify({
            'success': True,
            'username': username,
            'role': user['role']
        })
    else:
        registrar_auditoria(username or 'Desconocido', 'INICIO_SESION_FALLIDO', 'Intento de inicio de sesion fallido.')
        return jsonify({'success': False, 'error': 'Usuario o contrasena incorrectos'}), 401

@app.route('/api/logout', methods=['POST'])
def post_logout():
    params = request.get_json(silent=True) or {}
    username = params.get('username', 'Invitado')
    registrar_auditoria(username, 'CIERRE_SESION', 'Sesion cerrada por el usuario.')
    return jsonify({'success': True})

@app.route('/api/auditoria')
def get_auditoria():
    try:
        with db_lock:
            conn = sqlite3.connect(DB_PATH, timeout=10.0)
            cursor = conn.cursor()
            cursor.execute("SELECT id, datetime(fecha_hora, 'localtime'), usuario, accion, detalle FROM registro_auditoria ORDER BY id DESC LIMIT 30")
            rows = cursor.fetchall()
            conn.close()
        logs = [{'id': r[0], 'fecha': r[1], 'usuario': r[2], 'accion': r[3], 'detalle': r[4]} for r in rows]
        return jsonify({'success': True, 'logs': logs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/demo/seta', methods=['POST'])
def post_demo_seta():
    params = request.get_json(silent=True) or {}
    seta_activa = params.get('seta_activa', False)
    username = request.headers.get('X-Username', 'Invitado')
    
    prev_seta = state_cache.get('seta_activa', False)
    state_cache['seta_activa'] = seta_activa
    
    if prev_seta != seta_activa:
        if seta_activa:
            registrar_auditoria(username, 'EMERGENCIA_ACTIVA', 'Seta de Emergencia simulada activada en el SCADA.')
        else:
            registrar_auditoria(username, 'EMERGENCIA_LIBERADA', 'Seta de Emergencia simulada desactivada.')
            
    return jsonify({'success': True})

@app.route('/api/global/marcha', methods=['POST'])
def post_global_marcha():
    username = request.headers.get('X-Username', 'Invitado')
    role = request.headers.get('X-User-Role', 'Invitado')
    
    if role not in ['Operador', 'Ingeniero']:
        registrar_auditoria(username, 'ACCESO_DENEGADO', 'Intento no autorizado de marcha general.')
        return jsonify({'success': False, 'error': 'No autorizado. Se requiere iniciar sesion.'}), 403
        
    seta_activa = state_cache.get('seta_activa', False)
    if seta_activa:
        registrar_auditoria(username, 'ESCRITURA_BLOQUEADA', 'Intento de marcha general con Seta de Emergencia activa.')
        return jsonify({'success': False, 'error': 'Accion bloqueada. Seta de Emergencia activa.'}), 400

    registrar_auditoria(username, 'MARCHA_GLOBAL', 'Comando de marcha general enviado a todas las unidades.')
    return jsonify({'success': True})

@app.route('/api/global/paro', methods=['POST'])
def post_global_paro():
    username = request.headers.get('X-Username', 'Invitado')
    role = request.headers.get('X-User-Role', 'Invitado')
    
    if role not in ['Operador', 'Ingeniero']:
        registrar_auditoria(username, 'ACCESO_DENEGADO', 'Intento no autorizado de paro general.')
        return jsonify({'success': False, 'error': 'No autorizado. Se requiere iniciar sesion.'}), 403
        
    registrar_auditoria(username, 'PARO_GLOBAL', 'Comando de paro general activado (Interlock de software).')
    return jsonify({'success': True})

@app.route('/api/marcha/<int:estacion>', methods=['POST'])
def post_marcha(estacion):
    username = request.headers.get('X-Username', 'Invitado')
    role = request.headers.get('X-User-Role', 'Invitado')
    
    if role not in ['Operador', 'Ingeniero']:
        registrar_auditoria(username, 'ACCESO_DENEGADO', f'Intento no autorizado de lanzar ciclo en estacion {estacion}')
        return jsonify({'success': False, 'error': 'No autorizado. Se requiere iniciar sesion.'}), 403
        
    params = request.get_json(silent=True) or {}
    es_demo = params.get('demo', False)
    
    seta_activa = state_cache.get('seta_activa', False)
    if seta_activa:
        registrar_auditoria(username, 'ESCRITURA_BLOQUEADA', f'Intento de lanzar ciclo en estacion {estacion} con Seta de Emergencia activa')
        return jsonify({'success': False, 'error': 'Accion bloqueada. Seta de Emergencia activa.'}), 400

    nombres = {0: 'Alimentacion', 1: 'Procesamiento', 2: 'Ensamblaje', 3: 'Seleccion'}
    nombre_est = nombres.get(estacion, f'Estacion {estacion}')

    if es_demo:
        registrar_auditoria(username, 'MARCHA_ESTACION', f'Lanzado ciclo simulado en {nombre_est}')
        return jsonify({'success': True})

    if not state_cache['online'] or instrumento is None:
        return jsonify({'success': False, 'error': 'PLC Offline'}), 503
        
    try:
        # Generar pulso de Marcha de 500ms
        with modbus_lock:
            val = instrumento.read_register(estacion, functioncode=3)
            vb_high = val >> 8
            vb_low = val & 0xFF
            val_on = (vb_high << 8) | (vb_low | 0x02)
            instrumento.write_register(estacion, val_on)
            
        time.sleep(0.5)
        
        with modbus_lock:
            val = instrumento.read_register(estacion, functioncode=3)
            vb_high = val >> 8
            vb_low = val & 0xFF
            val_off = (vb_high << 8) | (vb_low & ~0x02)
            instrumento.write_register(estacion, val_off)
            
        registrar_auditoria(username, 'MARCHA_ESTACION', f'Lanzado ciclo real en {nombre_est}')
        return jsonify({'success': True})
    except Exception as e:
        registrar_auditoria(username, 'ERROR_MARCHA', f'Fallo al lanzar ciclo en {nombre_est}: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/posicion', methods=['POST'])
def post_posicion():
    username = request.headers.get('X-Username', 'Invitado')
    role = request.headers.get('X-User-Role', 'Invitado')
    
    if role != 'Ingeniero':
        registrar_auditoria(username, 'ACCESO_DENEGADO', 'Intento no autorizado de modificar coordenadas')
        return jsonify({'success': False, 'error': 'No autorizado. Se requiere rol de Ingeniero.'}), 403
        
    params = request.get_json(silent=True) or {}
    estacion = params.get('estacion')
    valor = params.get('valor')
    es_demo = params.get('demo', False)
    
    seta_activa = state_cache.get('seta_activa', False)
    if seta_activa:
        registrar_auditoria(username, 'ESCRITURA_BLOQUEADA', f'Intento de modificar posicion de {estacion} con Seta de Emergencia activa')
        return jsonify({'success': False, 'error': 'Accion bloqueada. Seta de Emergencia activa.'}), 400

    # Mapeo de registros de posicion
    mapeo = {
        'alim': 5,
        'proc': 7,
        'ensa': 9,
        'sele': 11
    }
    
    reg = mapeo.get(estacion)
    if reg is None or valor is None:
        return jsonify({'success': False, 'error': 'Parametros invalidos'}), 400
        
    try:
        val_int = int(valor)
        if es_demo:
            registrar_auditoria(username, 'CAMBIO_CONSIGNA', f'Modificada posicion simulada de {estacion} a {val_int} pulsos')
            return jsonify({'success': True})

        if not state_cache['online'] or instrumento is None:
            return jsonify({'success': False, 'error': 'PLC Offline'}), 503

        with modbus_lock:
            instrumento.write_long(reg, val_int, signed=True)
            
        registrar_auditoria(username, 'CAMBIO_CONSIGNA', f'Modificada posicion real de {estacion} a {val_int} pulsos')
        return jsonify({'success': True})
    except Exception as e:
        registrar_auditoria(username, 'ERROR_CAMBIO', f'Fallo al cambiar posicion de {estacion}: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

# --- Servidor de Archivos Estaticos (HMI Frontend) ---
@app.route('/imagen/<path:filename>')
def serve_image(filename):
    return send_from_directory('imagen', filename)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    # Ejecutar en puerto 5000 expuesto localmente con soporte multihilo para multiples clientes
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
