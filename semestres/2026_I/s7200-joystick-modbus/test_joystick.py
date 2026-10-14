import pygame
import sys
import struct

# Initialize pygame and joystick subsystems
pygame.init()
pygame.joystick.init()

# Check for connected joysticks
joystick_count = pygame.joystick.get_count()
if joystick_count == 0:
    print("================================================================")
    print(" ERROR: No se detecto ningun joystick conectado.               ")
    print("================================================================")
    sys.exit(1)

# Initialize the joystick
joystick = pygame.joystick.Joystick(0)
joystick.init()

# Control parameters
deadzone = 0.15
v_min = 1000
v_normal_max = 20000
v_turbo_max = 50000

clock = pygame.time.Clock()
running = True

print("Iniciando simulador completo local...")

# Clear screen and hide cursor at startup
sys.stdout.write("\033[2J\033[H\033[?25l")
sys.stdout.flush()


# Handshake tracking variables for PPI network
ack_ap = False
ack_pe = False
ack_es = False

# Button state tracking for simulator triggers
last_btn_1 = 0
last_btn_2 = 0
last_btn_3 = 0
last_btn_4 = 0

# Simulation variables to test the handshake offline
sim_sol_ap = False
sim_sol_pe = False
sim_sol_es = False
sim_sol_ap_timer = 0.0
sim_sol_pe_timer = 0.0
sim_sol_es_timer = 0.0

import time

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
        btn_1 = joystick.get_button(0) if joystick.get_numbuttons() > 0 else 0  # Button 1 -> Start Alimentacion
        btn_2 = joystick.get_button(1) if joystick.get_numbuttons() > 1 else 0  # Button 2 -> Start Procesamiento
        btn_3 = joystick.get_button(2) if joystick.get_numbuttons() > 2 else 0  # Button 3 -> Start Ensamblaje
        btn_4 = joystick.get_button(3) if joystick.get_numbuttons() > 3 else 0  # Button 4 -> Start Seleccion

        if btn_select and btn_start:
            running = False
            break

        # Simulate remote station requests after starting them (rising edge trigger)
        now = time.time()
        if btn_1 and not last_btn_1 and sim_sol_ap_timer == 0.0 and not sim_sol_ap:
            sim_sol_ap_timer = now + 2.0
        if btn_2 and not last_btn_2 and sim_sol_pe_timer == 0.0 and not sim_sol_pe:
            sim_sol_pe_timer = now + 2.0
        if btn_3 and not last_btn_3 and sim_sol_es_timer == 0.0 and not sim_sol_es:
            sim_sol_es_timer = now + 2.0

        if sim_sol_ap_timer > 0.0 and now >= sim_sol_ap_timer:
            sim_sol_ap = True
            sim_sol_ap_timer = 0.0
        if sim_sol_pe_timer > 0.0 and now >= sim_sol_pe_timer:
            sim_sol_pe = True
            sim_sol_pe_timer = 0.0
        if sim_sol_es_timer > 0.0 and now >= sim_sol_es_timer:
            sim_sol_es = True
            sim_sol_es_timer = 0.0

        # Clear simulated requests when Python activates the acknowledgement
        if ack_ap:
            sim_sol_ap = False
        if ack_pe:
            sim_sol_pe = False
        if ack_es:
            sim_sol_es = False

        # 2. Process carriage speed & direction (Left Stick X & R1 modifier)
        run_flag = 0
        direction = 0
        velocidad_buff = 0

        # Speed limit determined by R1 (Turbo)
        max_speed = v_turbo_max if btn_r1 else v_normal_max

        if abs(left_stick_x) > deadzone:
            run_flag = 1
            direction = 1 if left_stick_x < 0 else 0
            
            # Scale speed linearly
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

        # L2 button controls Vertical Z-axis: 0 = DOWN (when L2 pressed), 1 = UP (default/released)
        vertical_up = 0 if btn_l2 else 1

        # L1 button controls Double Rod: 1 = EXTEND (when L1 pressed), 0 = RETRACT (default)
        double_rod_ext = 1 if btn_l1 else 0

        # R2 button controls Gripper Close/Open: 1 = CLOSE (pressed), 0 = OPEN (default)
        gripper_close = 1 if btn_r2 else 0
        gripper_open = 0 if btn_r2 else 1

        # 4. Assemble Virtual Modbus Command Word VW28 (V29.0 - V29.7 in low byte VB29, V28.0 - V28.6 in high byte VB28)
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
            command_word |= (1 << 8)   # V28.0 -> Marcha Alimentacion
        if btn_2:
            command_word |= (1 << 9)   # V28.1 -> Marcha Procesamiento
        if btn_3:
            command_word |= (1 << 10)  # V28.2 -> Marcha Ensamblaje
        if btn_4:
            command_word |= (1 << 11)  # V28.3 -> Marcha Seleccion

        # Auto-acknowledgements for PPI inter-station requests (V28.4 - V28.6)
        if ack_ap:
            command_word |= (1 << 12)  # V28.4 -> Ack_AP
        if ack_pe:
            command_word |= (1 << 13)  # V28.5 -> Ack_PE
        if ack_es:
            command_word |= (1 << 14)  # V28.6 -> Ack_ES

        # Update auto-acknowledgement states based on simulated requests
        ack_ap = sim_sol_ap
        ack_pe = sim_sol_pe
        ack_es = sim_sol_es

        # Pack VD24 speed buffer
        raw_speed = struct.pack('>i', velocidad_buff)
        val_h1, val_h2 = struct.unpack('>HH', raw_speed)

        # 5. Render Terminal UI (Flicker-Free)
        lines = []
        lines.append("=====================================================================")
        lines.append("      TEST JOYSTICK COMPLETO - CARRO Y BRAZO ROBOTICO NEUMATICO      ")
        lines.append("=====================================================================")
        lines.append(f"Control: {joystick.get_name()}")
        lines.append("Modo: SIMULADOR LOCAL COMPLETADO (Cinta + Brazo)")
        lines.append("---------------------------------------------------------------------")
        
        # Carriage Travel Status
        dir_text = "IZQUIERDA (Rev)" if direction == 1 else "DERECHA (Fwd)"
        mode_text = "\033[1;33mTURBO\033[0m" if btn_r1 else "Precision"
        lines.append(f"CARRO (Stick Izq X | R1):")
        lines.append(f"  * Modulo Stick: {left_stick_x:6.3f} | Modo Speed: {mode_text}")
        if run_flag == 1:
            motion_char = "<<<<<< MOVIENDO IZQ <<<<<<" if direction == 1 else ">>>>>> MOVIENDO DER >>>>>>"
            color = "\033[1;34m" if direction == 1 else "\033[1;32m"
            lines.append(f"  * Movimiento: {color}{motion_char}\033[0m")
            lines.append(f"  * Velocidad: {velocidad_buff:5d} / {max_speed} pulsos/seg")
        else:
            lines.append("  * Movimiento: \033[1;31mPARADO\033[0m")
            
        lines.append("---------------------------------------------------------------------")
        
        # Pneumatic Arm states
        v_state = "ABAJO (Descendido)" if btn_l2 else "ARRIBA (Elevado - Seguro)"
        dv_state = "EXTENDIDO" if btn_l1 else "RETRAIDO"
        grip_state = "CERRADA (Grip)" if btn_r2 else "ABIERTA (Libre)"
        rot_state = "GIRO AH (IZQ)" if rot_left else ("GIRO H (DER)" if rot_right else "Centro")
        
        lines.append(f"BRAZO NEUMATICO:")
        lines.append(f"  * Eje Vertical (L2): {v_state}")
        lines.append(f"  * Doble Vastago (L1): {dv_state}")
        lines.append(f"  * Rotatorio (Stick Der X): {rot_state} (Eje X: {right_stick_x:6.3f})")
        lines.append(f"  * Pinza (R2):        {grip_state}")
        
        # Simulated PPI requests status
        lines.append("---------------------------------------------------------------------")
        lines.append("ESTADO DE PETICIONES PPI SIMULADAS:")
        lines.append(f"  * Sol_AP (Alim->Proc): {'[ACTIVA]' if sim_sol_ap else '[espera]'} | temporizador: {max(0.0, sim_sol_ap_timer - now) if sim_sol_ap_timer > 0 else 0:.1f}s")
        lines.append(f"  * Sol_PE (Proc->Ens):  {f'[ACTIVA]' if sim_sol_pe else '[espera]'} | temporizador: {max(0.0, sim_sol_pe_timer - now) if sim_sol_pe_timer > 0 else 0:.1f}s")
        lines.append(f"  * Sol_ES (Ens->Sel):   {f'[ACTIVA]' if sim_sol_es else '[espera]'} | temporizador: {max(0.0, sim_sol_es_timer - now) if sim_sol_es_timer > 0 else 0:.1f}s")

        lines.append("---------------------------------------------------------------------")
        
        # Modbus representation
        lines.append("REGISTROS MODBUS A ENVIAR:")
        lines.append(f"  * VD24 (Buffer Velocidad): {velocidad_buff:5d} (VW24: 0x{val_h1:04X}, VW26: 0x{val_h2:04X})")
        lines.append(f"  * VW28 (Comandos):          0x{command_word:04X} | Bin: {command_word:016b}")
        lines.append(f"    - V29.0 (Run Flag):          {run_flag}")
        lines.append(f"    - V29.1 (Dir Flag):          {direction}")
        lines.append(f"    - V29.2 (Rotary Left AH):    {rot_left}")
        lines.append(f"    - V29.3 (Rotary Right H):    {rot_right}")
        lines.append(f"    - V29.4 (Vertical UP):       {vertical_up}")
        lines.append(f"    - V29.5 (Double Rod EXT):    {double_rod_ext}")
        lines.append(f"    - V29.6 (Gripper CLOSE):     {gripper_close}")
        lines.append(f"    - V29.7 (Gripper OPEN):      {gripper_open}")
        lines.append(f"    - V28.0 (Start Alim Request):{btn_1}")
        lines.append(f"    - V28.1 (Start Proc Request):{btn_2}")
        lines.append(f"    - V28.2 (Start Ens Request): {btn_3}")
        lines.append(f"    - V28.3 (Start Sel Request): {btn_4}")
        lines.append(f"    - V28.4 (Ack Alim Request):  {int(ack_ap)}")
        lines.append(f"    - V28.5 (Ack Proc Request):  {int(ack_pe)}")
        lines.append(f"    - V28.6 (Ack Ens Request):   {int(ack_es)}")
        
        lines.append("=====================================================================")
        lines.append(" CONTROLES DEL JOYSTICK:")
        lines.append("  * Stick Izquierdo X: Mover Carro  |  Stick Derecho X: Rotar Brazo")
        lines.append("  * L2: Bajar brazo  |  L1: Extender vastago  |  R2: Cerrar pinza")
        lines.append("  * R1 (Hold): Modo TURBO para el carro lineal (Sube limite a 50k)")
        lines.append("  * Botonera Derecha (1/2/3/4): Dar Marcha a Alimentacion/Procesamiento/Ensamblaje/Seleccion")
        lines.append("  * SELECT + START: Salir del programa")
        lines.append("=====================================================================")

        # Render double-buffered text
        sys.stdout.write("\033[H" + "\n".join(f"{line}\033[K" for line in lines) + "\n\033[J")
        sys.stdout.flush()

        # Store previous button states for rising edge detection in simulation
        last_btn_1 = btn_1
        last_btn_2 = btn_2
        last_btn_3 = btn_3
        last_btn_4 = btn_4

        clock.tick(20)

finally:
    # Restore terminal cursor state on exit
    sys.stdout.write("\033[?25h\n")
    sys.stdout.flush()
    
    pygame.quit()
sys.exit(0)
