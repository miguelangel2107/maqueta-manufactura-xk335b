import time

def run_controller(state, data_bank):
    """Controlador secuencial lineal (Stage 1) que imita a un PLC centralizado.
    Lee de las entradas Modbus (Sensores) y escribe en las salidas Modbus (Actuadores)."""
    
    seq_state = 0
    wait_timer = 0.0
    dt = 0.05  # Ciclo de scan de 50ms

    while True:
        time.sleep(dt)

        # Si hay parada de emergencia o modo automatico desactivado, limpiamos las salidas y reiniciamos
        if state.emergency_stop or not state.auto_mode:
            seq_state = 0
            wait_timer = 0.0
            continue

        # --- LECTURA DE SENSORES (Desde el Modbus Data Bank) ---
        inputs = data_bank.get_discrete_inputs(0, 40)
        if not inputs:
            continue

        # Mapeo de entradas para mayor legibilidad
        cil_peq_ext = inputs[0]
        cil_peq_ret = inputs[1]
        cil_lrg_ext = inputs[2]
        cil_lrg_ret = inputs[3]
        presencia_inf = inputs[4]
        
        prensa_arriba = inputs[8]
        prensa_abajo = inputs[9]
        
        cil_ensa_ret = inputs[16]
        cil_ensa_ext = inputs[17]
        
        cil_vert_arriba = inputs[24]
        cil_vert_abajo = inputs[25]
        pinza_cerrada = inputs[26]
        servo_en_u1 = inputs[27]
        servo_en_u2 = inputs[28]
        servo_en_u3 = inputs[29]
        servo_en_u5 = inputs[30]
        
        sens_objeto_entrada = inputs[32]
        sens_metal = inputs[33]
        sens_mixto = inputs[34]
        sens_plastico = inputs[35]
        deflector_r1_ext = inputs[36]
        deflector_r2_ext = inputs[37]
        deflector_r3_ext = inputs[38]

        # --- MAQUINA DE ESTADOS SECUENCIAL (PLC) ---
        
        # Auxiliares para escribir salidas
        v_cil_peq = False
        v_cil_lrg = False
        v_prensa = False
        v_cil_ensa = False
        v_cil_vert = False
        v_pinza = False
        servo_go_u1 = False
        servo_go_u2 = False
        servo_go_u3 = False
        servo_go_u5 = False
        motor_cinta = False
        v_deflector_r1 = False
        v_deflector_r2 = False
        v_deflector_r3 = False

        # Estado 0: Reposo / Espera de pieza
        if seq_state == 0:
            if not presencia_inf and state.has_piece_u1:
                # Si no hay pieza lista en la rampa pero hay stock en el tubo, iniciamos dosificacion
                seq_state = 1
            elif presencia_inf:
                # Si ya hay una pieza lista para recoger, vamos a buscarla
                seq_state = 10

        # --- SECUENCIA DE DOSIFICACION (U1) ---
        elif seq_state == 1:
            # Sujetar columna (extender cilindro pequeno)
            v_cil_peq = True
            if cil_peq_ext:
                seq_state = 2

        elif seq_state == 2:
            # Mantener sujetado y empujar pieza inferior (extender cilindro largo)
            v_cil_peq = True
            v_cil_lrg = True
            if cil_lrg_ext:
                seq_state = 3

        elif seq_state == 3:
            # Mantener sujetado y retraer empujador
            v_cil_peq = True
            v_cil_lrg = False
            if cil_lrg_ret:
                seq_state = 4

        elif seq_state == 4:
            # Liberar columna (retraer cilindro pequeno para que baje la siguiente pieza)
            v_cil_peq = False
            v_cil_lrg = False
            if cil_peq_ret:
                seq_state = 5

        elif seq_state == 5:
            # Pequeno retraso de seguridad para que la pieza se asiente en la rampa
            wait_timer += dt
            if wait_timer >= 0.5:
                wait_timer = 0.0
                seq_state = 10

        # --- SECUENCIA DE TRANSPORTE A PROCESAMIENTO (U1 -> U2) ---
        elif seq_state == 10:
            # Viajar a Alimentacion (U1) con brazo arriba y pinza abierta
            servo_go_u1 = True
            v_cil_vert = False  # Arriba
            v_pinza = False     # Abierta
            if servo_en_u1:
                seq_state = 11

        elif seq_state == 11:
            # Bajar brazo en U1
            servo_go_u1 = True
            v_cil_vert = True
            if cil_vert_abajo:
                seq_state = 12

        elif seq_state == 12:
            # Cerrar pinza sobre la pieza en U1
            servo_go_u1 = True
            v_cil_vert = True
            v_pinza = True
            wait_timer += dt
            if wait_timer >= 0.5:  # Dar tiempo a cerrar la pinza
                wait_timer = 0.0
                seq_state = 13

        elif seq_state == 13:
            # Subir brazo con pieza en mano
            servo_go_u1 = True
            v_cil_vert = False
            v_pinza = True
            if cil_vert_arriba:
                seq_state = 14

        elif seq_state == 14:
            # Viajar a Procesamiento (U2) con brazo arriba
            servo_go_u2 = True
            v_pinza = True
            if servo_en_u2:
                seq_state = 15

        elif seq_state == 15:
            # Bajar brazo en U2
            servo_go_u2 = True
            v_cil_vert = True
            v_pinza = True
            if cil_vert_abajo:
                seq_state = 16

        elif seq_state == 16:
            # Abrir pinza en U2 para depositar la pieza
            servo_go_u2 = True
            v_cil_vert = True
            v_pinza = False
            wait_timer += dt
            if wait_timer >= 0.5:  # Dar tiempo a abrir la pinza
                wait_timer = 0.0
                seq_state = 17

        elif seq_state == 17:
            # Subir brazo libre
            servo_go_u2 = True
            v_cil_vert = False
            v_pinza = False
            if cil_vert_arriba:
                seq_state = 20  # Iniciar procesamiento en U2

        # --- SECUENCIA DE PROCESAMIENTO (U2) ---
        elif seq_state == 20:
            # Bajar prensa de sellado
            v_prensa = True
            if prensa_abajo:
                seq_state = 21

        elif seq_state == 21:
            # Retraer prensa
            v_prensa = False
            if prensa_arriba:
                seq_state = 30  # Listo para llevar a Ensamblaje

        # --- SECUENCIA DE TRANSPORTE A ENSAMBLAJE (U2 -> U3) ---
        elif seq_state == 30:
            # Viajar a U2
            servo_go_u2 = True
            v_cil_vert = False
            v_pinza = False
            if servo_en_u2:
                seq_state = 31

        elif seq_state == 31:
            # Bajar brazo en U2
            servo_go_u2 = True
            v_cil_vert = True
            if cil_vert_abajo:
                seq_state = 32

        elif seq_state == 32:
            # Cerrar pinza
            servo_go_u2 = True
            v_cil_vert = True
            v_pinza = True
            wait_timer += dt
            if wait_timer >= 0.5:
                wait_timer = 0.0
                seq_state = 33

        elif seq_state == 33:
            # Subir brazo
            servo_go_u2 = True
            v_cil_vert = False
            v_pinza = True
            if cil_vert_arriba:
                seq_state = 34

        elif seq_state == 34:
            # Viajar a Ensamblaje (U3)
            servo_go_u3 = True
            v_pinza = True
            if servo_en_u3:
                seq_state = 35

        elif seq_state == 35:
            # Bajar brazo en U3
            servo_go_u3 = True
            v_cil_vert = True
            v_pinza = True
            if cil_vert_abajo:
                seq_state = 36

        elif seq_state == 36:
            # Abrir pinza
            servo_go_u3 = True
            v_cil_vert = True
            v_pinza = False
            wait_timer += dt
            if wait_timer >= 0.5:
                wait_timer = 0.0
                seq_state = 37

        elif seq_state == 37:
            # Subir brazo libre
            servo_go_u3 = True
            v_cil_vert = False
            v_pinza = False
            if cil_vert_arriba:
                seq_state = 40  # Iniciar ensamblaje en U3

        # --- SECUENCIA DE ENSAMBLAJE (U3) ---
        elif seq_state == 40:
            # Empujar la pieza pequena (extender cilindro de ensamble)
            v_cil_ensa = True
            if cil_ensa_ext:
                seq_state = 41

        elif seq_state == 41:
            # Retraer empujador
            v_cil_ensa = False
            if cil_ensa_ret:
                seq_state = 50  # Listo para llevar a Seleccion (U5)

        # --- SECUENCIA DE TRANSPORTE A SELECCION (U3 -> U5) ---
        elif seq_state == 50:
            # Viajar a U3
            servo_go_u3 = True
            v_cil_vert = False
            v_pinza = False
            if servo_en_u3:
                seq_state = 51

        elif seq_state == 51:
            # Bajar brazo en U3
            servo_go_u3 = True
            v_cil_vert = True
            if cil_vert_abajo:
                seq_state = 52

        elif seq_state == 52:
            # Cerrar pinza
            servo_go_u3 = True
            v_cil_vert = True
            v_pinza = True
            wait_timer += dt
            if wait_timer >= 0.5:
                wait_timer = 0.0
                seq_state = 53

        elif seq_state == 53:
            # Subir brazo
            servo_go_u3 = True
            v_cil_vert = False
            v_pinza = True
            if cil_vert_arriba:
                seq_state = 54

        elif seq_state == 54:
            # Viajar a Seleccion (U5)
            servo_go_u5 = True
            v_pinza = True
            if servo_en_u5:
                seq_state = 55

        elif seq_state == 55:
            # Bajar brazo en U5
            servo_go_u5 = True
            v_cil_vert = True
            v_pinza = True
            if cil_vert_abajo:
                seq_state = 56

        elif seq_state == 56:
            # Abrir pinza
            servo_go_u5 = True
            v_cil_vert = True
            v_pinza = False
            wait_timer += dt
            if wait_timer >= 0.5:
                wait_timer = 0.0
                seq_state = 57

        elif seq_state == 57:
            # Subir brazo libre
            servo_go_u5 = True
            v_cil_vert = False
            v_pinza = False
            if cil_vert_arriba:
                seq_state = 60  # Iniciar clasificacion en U5

        # --- SECUENCIA DE SELECCION (U5) ---
        elif seq_state == 60:
            # Encender motor de la cinta transportadora
            motor_cinta = True
            # Esperar a que la pieza avance y sea detectada por los sensores
            if sens_metal:
                # Si es metal, activar deflector 1
                v_deflector_r1 = True
                motor_cinta = True
                if deflector_r1_ext:
                    seq_state = 62
            elif sens_mixto:
                # Si es mixto, activar deflector 2
                v_deflector_r2 = True
                motor_cinta = True
                if deflector_r2_ext:
                    seq_state = 62
            elif sens_plastico:
                # Si es plastico, activar deflector 3
                v_deflector_r3 = True
                motor_cinta = True
                if deflector_r3_ext:
                    seq_state = 62
            
            # Si no hay pieza en U5 (por ejemplo, cayo por descarte sin deflectores)
            elif not state.piece_in_u5 and not presence_check_active(state):
                seq_state = 63

        elif seq_state == 62:
            # Mantener deflector y cinta hasta que la pieza caiga a la rampa
            motor_cinta = True
            # Restaurar deflectores especificos
            if state.piece_type == "Metal":
                v_deflector_r1 = True
            elif state.piece_type == "Mixto":
                v_deflector_r2 = True
            elif state.piece_type == "Plastico":
                v_deflector_r3 = True

            if not state.piece_in_u5:
                seq_state = 63

        elif seq_state == 63:
            # Apagar todo y esperar a que deflectores se retraigan
            motor_cinta = False
            v_deflector_r1 = False
            v_deflector_r2 = False
            v_deflector_r3 = False
            if not deflector_r1_ext and not deflector_r2_ext and not deflector_r3_ext:
                seq_state = 0  # Volver a inicio para procesar nueva pieza

        # --- ESCRITURA DE ACTUADORES (Al Modbus Data Bank) ---
        coils = [False] * 40
        coils[0] = v_cil_peq
        coils[1] = v_cil_lrg
        coils[8] = v_prensa
        coils[16] = v_cil_ensa
        coils[24] = v_cil_vert
        coils[25] = v_pinza
        coils[26] = servo_go_u1
        coils[27] = servo_go_u2
        coils[28] = servo_go_u3
        coils[29] = servo_go_u5
        coils[32] = motor_cinta
        coils[33] = v_deflector_r1
        coils[34] = v_deflector_r2
        coils[35] = v_deflector_r3

        data_bank.set_coils(0, coils)

def presence_check_active(state):
    return state.sens_metal or state.sens_mixto or state.sens_plastico
