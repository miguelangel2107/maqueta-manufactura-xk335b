import pygame
import minimalmodbus
import time
import sys
import struct

# Initialize pygame and joystick subsystems
pygame.init()
pygame.joystick.init()

# Check for connected joysticks
joystick_count = pygame.joystick.get_count()
if joystick_count == 0:
    print("Error: No se detecto ningun joystick conectado.")
    print("Por favor conecta tu joystick USB y vuelve a intentarlo.")
    sys.exit(1)

# Initialize the first joystick (PS3 Controller)
joystick = pygame.joystick.Joystick(0)
joystick.init()
print(f"Joystick detectado: {joystick.get_name()}")
print("Presiona SELECT y START simultaneamente para detener el programa.")

# Modbus Configuration
PUERTO = '/dev/ttyUSB0'  # Adjust to match your RS485-to-USB adapter
DIRECCION_PLC = 2
BAUDRATE = 19200

try:
    instrument = minimalmodbus.Instrument(PUERTO, DIRECCION_PLC)
    instrument.serial.baudrate = BAUDRATE
    instrument.serial.bytesize = 8
    instrument.serial.parity = 'E'  # Even parity matching S7-200 standard
    instrument.serial.stopbits = 1
    instrument.serial.timeout = 0.15
    print(f"Conexion Modbus establecida en {PUERTO} con PLC ID {DIRECCION_PLC}")
except Exception as e:
    print(f"Error al inicializar la conexion serie: {e}")
    sys.exit(1)

# Control limits
deadzone = 0.15
v_min = 1000
v_normal_max = 20000
v_turbo_max = 50000

running = True
clock = pygame.time.Clock()

def decode_inputs(inputs):
    """
    Decodes physical S7-200 inputs from the discrete input bit list.
    """
    # inputs is a list of booleans from bit 0 to bit 23
    return {
        "sens_origen": inputs[0],   # I0.0
        "fc_derecha": inputs[1],    # I0.1
        "fc_izquierda": inputs[2],  # I0.2
        "cil_v_abajo": inputs[3],   # I0.3
        "cil_v_arriba": inputs[4],  # I0.4
        "giro_izq": inputs[5],      # I0.5
        "giro_der": inputs[6],      # I0.6
        "cil_dv_ext": inputs[7],    # I0.7
        "cil_dv_ret": inputs[8],    # I1.0
        "pinza_cer": inputs[9],     # I1.1
        "servo_ready": inputs[10],  # I1.2
        "btn_paro": inputs[20],     # I2.4
        "btn_marcha": inputs[21],   # I2.5
        "seta_emerg": inputs[22],   # I2.6 (NC)
        "selector": inputs[23]      # I2.7
    }

# Handshake tracking variables for PPI network
ack_ap = False
ack_pe = False
ack_es = False

# Clear screen and hide cursor at startup
sys.stdout.write("\033[2J\033[H\033[?25l")
sys.stdout.flush()

try:
    while running:
        # 1. Update pygame events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Read Joystick Inputs
        left_stick_x = joystick.get_axis(0)       # Left Stick X (Carriage)
        # Check if Axis 3 is available (common on DragonRise for Right Stick X under Linux), otherwise fall back to Axis 2
        right_stick_x = joystick.get_axis(3) if joystick.get_numaxes() > 3 else (joystick.get_axis(2) if joystick.get_numaxes() > 2 else 0.0)

        btn_l1 = joystick.get_button(4) if joystick.get_numbuttons() > 4 else 0 # L1 -> Double Rod
        btn_r1 = joystick.get_button(5) if joystick.get_numbuttons() > 5 else 0 # R1 -> Turbo Mode
        btn_l2 = joystick.get_button(6) if joystick.get_numbuttons() > 6 else 0 # L2 -> Vertical Z-axis
        btn_r2 = joystick.get_button(7) if joystick.get_numbuttons() > 7 else 0 # R2 -> Gripper Close
        btn_select = joystick.get_button(8) if joystick.get_numbuttons() > 8 else 0
        btn_start = joystick.get_button(9) if joystick.get_numbuttons() > 9 else 0

        # Right Pad Buttons (X, Circle, Square, Triangle mapped as 1, 2, 3, 4) for PPI start requests
        btn_1 = joystick.get_button(0) if joystick.get_numbuttons() > 0 else 0  # Button 1 -> Start Alimentacion (V1.1)
        btn_2 = joystick.get_button(1) if joystick.get_numbuttons() > 1 else 0  # Button 2 -> Start Procesamiento (V3.1)
        btn_3 = joystick.get_button(2) if joystick.get_numbuttons() > 2 else 0  # Button 3 -> Start Ensamblaje (V5.1)
        btn_4 = joystick.get_button(3) if joystick.get_numbuttons() > 3 else 0  # Button 4 -> Start Seleccion (V7.1)

        if btn_select and btn_start:
            running = False
            break

        # 2. Process carriage speed & direction (Left Stick X & R1 modifier)
        run_flag = 0
        direction = 0
        velocidad_buff = 0

        max_speed = v_turbo_max if btn_r1 else v_normal_max

        if abs(left_stick_x) > deadzone:
            run_flag = 1
            direction = 1 if left_stick_x < 0 else 0
            deflection_ratio = (abs(left_stick_x) - deadzone) / (1.0 - deadzone)
            velocidad_buff = int(v_min + deflection_ratio * (max_speed - v_min))
        else:
            run_flag = 0
            direction = 0
            velocidad_buff = 0

        # 3. Process Pneumatic Arm states based on holds/sticks
        # Right Stick X controls Rotary Cylinder
        rot_left = 0
        rot_right = 0
        if right_stick_x < -deadzone:
            rot_left = 1
        elif right_stick_x > deadzone:
            rot_right = 1

        # L2 controls Vertical Z-axis: 0 = DOWN (when L2 pressed), 1 = UP (default/released)
        vertical_up = 0 if btn_l2 else 1

        # L1 controls Double Rod: 1 = EXTEND (when L1 pressed), 0 = RETRACT (default)
        double_rod_ext = 1 if btn_l1 else 0

        # R2 controls Gripper Close/Open: 1 = CLOSE (pressed), 0 = OPEN (default)
        gripper_close = 1 if btn_r2 else 0
        gripper_open = 0 if btn_r2 else 1

        # 4. Assemble Modbus Command Word VW28 (V29.0 - V29.7 in low byte VB29, V28.0 - V28.6 in high byte VB28)
        command_word = 0
        if run_flag:
            command_word |= (1 << 0)
        if direction:
            command_word |= (1 << 1)
        if rot_left:
            command_word |= (1 << 2)
        if rot_right:
            command_word |= (1 << 3)
        if vertical_up:
            command_word |= (1 << 4)
        if double_rod_ext:
            command_word |= (1 << 5)
        if gripper_close:
            command_word |= (1 << 6)
        if gripper_open:
            command_word |= (1 << 7)

        # High byte (VB28) for starting other units via PPI network
        if btn_1:
            command_word |= (1 << 8)   # V28.0 -> Marcha Alimentacion (V1.1)
        if btn_2:
            command_word |= (1 << 9)   # V28.1 -> Marcha Procesamiento (V3.1)
        if btn_3:
            command_word |= (1 << 10)  # V28.2 -> Marcha Ensamblaje (V5.1)
        if btn_4:
            command_word |= (1 << 11)  # V28.3 -> Marcha Seleccion (V7.1)

        # Auto-acknowledgements for PPI inter-station requests (V28.4 - V28.6)
        if ack_ap:
            command_word |= (1 << 12)  # V28.4 -> Ack_AP (V1.0)
        if ack_pe:
            command_word |= (1 << 13)  # V28.5 -> Ack_PE (V3.0)
        if ack_es:
            command_word |= (1 << 14)  # V28.6 -> Ack_ES (V5.0)

        # Pack VD24 speed buffer
        raw_speed = struct.pack('>i', velocidad_buff)
        val_h1, val_h2 = struct.unpack('>HH', raw_speed)

        plc_online = False
        pos_actual = 0
        plc_data = {}
        vb0, vb1, vb2, vb3, vb4, vb5, vb6, vb7 = 0, 0, 0, 0, 0, 0, 0, 0

        # 5. Write commands and read feedback
        try:
            # Write speed (VD24) and commands (VW28) in one block starting at offset 12
            instrument.write_registers(12, [val_h1, val_h2, command_word])
            
            # Read current status and position. We read from offset 0 to 21 (22 registers)
            # This fetches VW0-VW6 (which includes PPI network bytes VB0-VB7) and VW40-VW42 (VD40, Servo position)
            regs = instrument.read_registers(0, 22, functioncode=3)
            
            # Unpack servo position from VD40 (offsets 20 and 21)
            raw_pos = struct.pack('>HH', regs[20], regs[21])
            pos_actual = struct.unpack('>i', raw_pos)[0]
            
            # Extract bytes for PPI stations from regs[0] to regs[3]
            vb0 = regs[0] >> 8
            vb1 = regs[0] & 0xFF
            vb2 = regs[1] >> 8
            vb3 = regs[1] & 0xFF
            vb4 = regs[2] >> 8
            vb5 = regs[2] & 0xFF
            vb6 = regs[3] >> 8
            vb7 = regs[3] & 0xFF
            
            # Read physical S7-200 inputs (24 bits starting from offset 0)
            inputs = instrument.read_bits(0, 24, functioncode=2)
            plc_data = decode_inputs(inputs)
            plc_online = True
            
            # Evaluate inter-station requests and update auto-acknowledgement states
            # V0.0: Sol_AP (bit 0 of vb0) -> Ack_AP (V28.4)
            ack_ap = bool(vb0 & (1 << 0))
            # V2.0: Sol_PE (bit 0 of vb2) -> Ack_PE (V28.5)
            ack_pe = bool(vb2 & (1 << 0))
            # V4.0: Sol_ES (bit 0 of vb4) -> Ack_ES (V28.6)
            ack_es = bool(vb4 & (1 << 0))

        except Exception as e:
            plc_online = False
            error_msg = str(e)
            ack_ap = False
            ack_pe = False
            ack_es = False

        # 6. Draw Terminal Dashboard (Flicker-Free)
        lines = []
        lines.append("=====================================================================")
        lines.append("               CONTROL MANUAL EN VIVO - CARRO Y BRAZO NEUMATICO      ")
        lines.append("=====================================================================")
        lines.append(f"Joystick: {joystick.get_name()}")
        
        if plc_online:
            lines.append(f"PLC Status: ONLINE | Puerto: {PUERTO} | Baud: {BAUDRATE}")
        else:
            lines.append(f"PLC Status: OFFLINE | Puerto: {PUERTO} | Error: {error_msg}")
            
        lines.append("---------------------------------------------------------------------")
        
        if plc_online:
            # Emergency indicator
            is_emerg_active = (not plc_data["seta_emerg"])
            emerg_text = "!!! PARADA DE EMERGENCIA ACTIVA (I2.6 = 0) !!!" if is_emerg_active else "Seta de Seguridad Ok"
            emerg_color = "\033[1;31m" if is_emerg_active else "\033[1;32m"
            lines.append(f"Seguridad: {emerg_color}{emerg_text}\033[0m")
            
            lines.append("---------------------------------------------------------------------")
            
            # Carriage Travel Status
            dir_text = "IZQUIERDA (Rev)" if direction == 1 else "DERECHA (Fwd)"
            mode_text = "\033[1;33mTURBO\033[0m" if btn_r1 else "Precision"
            lines.append(f"Carro - Posicion Actual: {pos_actual:7d} pulsos")
            lines.append(f"Carro - F.C. Izq (I0.2): {'[X]' if plc_data['fc_izquierda'] else '[ ]'} | F.C. Der (I0.1): {'[X]' if plc_data['fc_derecha'] else '[ ]'}")
            
            if run_flag == 1:
                motion_color = "\033[1;34m" if direction == 1 else "\033[1;32m"
                lines.append(f"Carro - Estado: {motion_color}MOVIENDO a la {dir_text}\033[0m ({mode_text})")
                lines.append(f"Carro - Velocidad Consigna: {velocidad_buff:5d} pulsos/seg")
            else:
                lines.append("Carro - Estado: \033[1;31mPARADO\033[0m")
                
            lines.append("---------------------------------------------------------------------")
            
            # Pneumatic Arm Status & Sensor Confirmations
            v_sensor_up = "[X]" if plc_data["cil_v_arriba"] else "[ ]"
            v_sensor_down = "[X]" if plc_data["cil_v_abajo"] else "[ ]"
            dv_sensor_ret = "[X]" if plc_data["cil_dv_ret"] else "[ ]"
            dv_sensor_ext = "[X]" if plc_data["cil_dv_ext"] else "[ ]"
            rot_sensor_l = "[X]" if plc_data["giro_izq"] else "[ ]"
            rot_sensor_r = "[X]" if plc_data["giro_der"] else "[ ]"
            grip_sensor_closed = "[X]" if plc_data["pinza_cer"] else "[ ]"
            
            # State indicators
            v_state = "DOWN (Bajo)" if btn_l2 else "UP (Elevado)"
            dv_state = "EXTENDIDO" if btn_l1 else "RETRAIDO"
            grip_state = "CERRADO" if btn_r2 else "ABIERTO"
            
            lines.append("ESTADO DEL BRAZO NEUMATICO Y CONFIRMACIONES FISICAS:")
            lines.append(f"  * Eje Vertical Z (L2): {v_state:12s} | Sensores -> Arriba: {v_sensor_up} Abajo: {v_sensor_down}")
            lines.append(f"  * Doble Vastago  (L1): {dv_state:12s} | Sensores -> Retraido: {dv_sensor_ret} Extendido: {dv_sensor_ext}")
            lines.append(f"  * Rotatorio (StickDer): {'AH/Izq' if rot_left else ('H/Der' if rot_right else 'Centro'):12s} | Sensores -> Izq: {rot_sensor_l} Der: {rot_sensor_r}")
            lines.append(f"  * Pinza          (R2): {grip_state:12s} | Sensor   -> Cerrada: {grip_sensor_closed}")
            
            # PPI Stations Status
            lines.append("---------------------------------------------------------------------")
            lines.append("ESTADO DE RED PPI (CONTROL DE MARCHA INTER-ESTACIONES):")
            
            def format_station(name, avail, active, ack, btn_desc):
                avail_text = f"{'Listo':7s}" if avail else f"{'Offline':7s}"
                color_avail = f"\033[1;32m{avail_text}\033[0m" if avail else f"\033[1;30m{avail_text}\033[0m"
                
                run_text = "MARCHA" if active else ("Ack" if ack else "Espera")
                run_padded = f"{run_text:6s}"
                if active:
                    color_run = f"\033[1;33m{run_padded}\033[0m"
                elif ack:
                    color_run = f"\033[1;34m{run_padded}\033[0m"
                else:
                    color_run = run_padded
                return f"  * {name:13s}: {color_avail} | Estado: {color_run} | Mando: {btn_desc}"
                
            lines.append(format_station("Alimentacion", bool(vb0 & (1 << 2)), bool(vb1 & (1 << 1)), bool(vb0 & (1 << 1)), "[1 / X]"))
            lines.append(format_station("Procesamiento", bool(vb2 & (1 << 2)), bool(vb3 & (1 << 1)), bool(vb2 & (1 << 1)), "[2 / O]"))
            lines.append(format_station("Ensamblaje", bool(vb4 & (1 << 2)), bool(vb5 & (1 << 1)), bool(vb4 & (1 << 1)), "[3 / Sq]"))
            lines.append(format_station("Seleccion", bool(vb6 & (1 << 2)), bool(vb7 & (1 << 1)), bool(vb6 & (1 << 1)), "[4 / Tr]"))
            
            # Active request handshakes
            active_reqs = []
            if bool(vb0 & (1 << 0)): active_reqs.append("Alim->Proc (Sol_AP)")
            if bool(vb2 & (1 << 0)): active_reqs.append("Proc->Ens (Sol_PE)")
            if bool(vb4 & (1 << 0)): active_reqs.append("Ens->Sel (Sol_ES)")
            if active_reqs:
                lines.append(f"  * Peticiones Activas (Auto-Ack): {', '.join(active_reqs)}")
            else:
                lines.append("  * Peticiones Activas (Auto-Ack): Ninguna")

            if bool(vb6 & (1 << 2)): # If Selection is online
                piece_type = "Ninguna"
                if bool(vb6 & (1 << 3)):
                    piece_type = "\033[1;33mMetalica\033[0m"
                elif bool(vb6 & (1 << 4)):
                    piece_type = "\033[1;36mMixta (Bi-material)\033[0m"
                elif bool(vb6 & (1 << 5)):
                    piece_type = "\033[1;37mPlastica\033[0m"
                lines.append(f"  * Deteccion Pieza (Seleccion): {piece_type}")
            
        else:
            lines.append("")
            lines.append("Esperando conexion con el PLC S7-200...")
            lines.append("Verifica el cable RS485-USB y que el PLC este encendido en modo RUN.")
            
        lines.append("=====================================================================")
        lines.append(" CONTROLES DEL JOYSTICK:")
        lines.append("  * Stick Izquierdo X: Mover Carro  |  Stick Derecho X: Rotar Brazo")
        lines.append("  * L2: Bajar brazo  |  L1: Extender vastago  |  R2: Cerrar pinza")
        lines.append("  * R1 (Hold): Modo TURBO para el carro lineal (Sube limite a 50k)")
        lines.append("  * Botonera Derecha (1/2/3/4): Dar Marcha a Alimentacion/Procesamiento/Ensamblaje/Seleccion")
        lines.append("  * SELECT + START: Detener programa y salir")
        lines.append("=====================================================================")

        # Render double-buffered text
        sys.stdout.write("\033[H" + "\n".join(f"{line}\033[K" for line in lines) + "\n\033[J")
        sys.stdout.flush()

        clock.tick(20)

finally:
    # Restore cursor on exit
    sys.stdout.write("\033[?25h\n")
    sys.stdout.flush()
    
    # Stop all outputs on exit
    try:
        print("Enviando comando de paro seguro al PLC...")
        instrument.write_registers(12, [0, 0, 0x0090])
    except Exception:
        pass
    
    pygame.quit()
sys.exit(0)
