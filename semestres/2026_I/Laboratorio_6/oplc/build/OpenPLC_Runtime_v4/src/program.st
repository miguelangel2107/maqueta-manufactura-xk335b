PROGRAM main
  VAR
    Step : INT := 0;
    Timer_Pinza : TON;
    Timer_Seleccion : TON;
  END_VAR
  VAR
    Cil_Peq_Ext AT %IX0.0 : BOOL;
    Cil_Peq_Ret AT %IX0.1 : BOOL;
    Cil_Lrg_Ext AT %IX0.2 : BOOL;
    Cil_Lrg_Ret AT %IX0.3 : BOOL;
    Presencia_Inf AT %IX0.4 : BOOL;
    Prensa_Arriba AT %IX1.0 : BOOL;
    Prensa_Abajo AT %IX1.1 : BOOL;
    Cil_Ensa_Ret AT %IX2.0 : BOOL;
    Cil_Ensa_Ext AT %IX2.1 : BOOL;
    Cil_Vert_Arriba AT %IX3.0 : BOOL;
    Cil_Vert_Abajo AT %IX3.1 : BOOL;
    Pinza_Cerrada AT %IX3.2 : BOOL;
    Servo_En_U1 AT %IX3.3 : BOOL;
    Servo_En_U2 AT %IX3.4 : BOOL;
    Servo_En_U3 AT %IX3.5 : BOOL;
    Servo_En_U5 AT %IX3.6 : BOOL;
    Sens_Objeto_Ent AT %IX4.0 : BOOL;
    Sens_Metal AT %IX4.1 : BOOL;
    Sens_Mixto AT %IX4.2 : BOOL;
    Sens_Plastico AT %IX4.3 : BOOL;
    Deflector_R1_Ext AT %IX4.4 : BOOL;
    Deflector_R2_Ext AT %IX4.5 : BOOL;
    Deflector_R3_Ext AT %IX4.6 : BOOL;
    V_Cil_Peq AT %QX0.0 : BOOL;
    V_Cil_Lrg AT %QX0.1 : BOOL;
    V_Prensa AT %QX1.0 : BOOL;
    V_Cil_Ensa AT %QX2.0 : BOOL;
    V_Cil_Vert AT %QX3.0 : BOOL;
    V_Pinza AT %QX3.1 : BOOL;
    Servo_Go_U1 AT %QX3.2 : BOOL;
    Servo_Go_U2 AT %QX3.3 : BOOL;
    Servo_Go_U3 AT %QX3.4 : BOOL;
    Servo_Go_U5 AT %QX3.5 : BOOL;
    Motor_Cinta AT %QX4.0 : BOOL;
    V_Deflector_R1 AT %QX4.1 : BOOL;
    V_Deflector_R2 AT %QX4.2 : BOOL;
    V_Deflector_R3 AT %QX4.3 : BOOL;
  END_VAR

  (* 1. RESET DE SALIDAS AL INICIO DE CADA CICLO SCAN (Evita retencion) *)
      V_Cil_Peq := FALSE;
      V_Cil_Lrg := FALSE;
      V_Prensa := FALSE;
      V_Cil_Ensa := FALSE;
      V_Cil_Vert := FALSE;
      V_Pinza := FALSE;
      Servo_Go_U1 := FALSE;
      Servo_Go_U2 := FALSE;
      Servo_Go_U3 := FALSE;
      Servo_Go_U5 := FALSE;
      Motor_Cinta := FALSE;
      V_Deflector_R1 := FALSE;
      V_Deflector_R2 := FALSE;
      V_Deflector_R3 := FALSE;

      (* Resetear disparo de temporizadores por defecto *)
      Timer_Pinza.IN := FALSE;
      Timer_Seleccion.IN := FALSE;

      (* 2. LOGICA DEL SECUENCIADOR *)
      CASE Step OF
          0: (* Reposo / Espera *)
              IF Presencia_Inf THEN
                  Step := 10; (* Viajar a recoger *)
              ELSE
                  Step := 1; (* Iniciar dosificacion *)
              END_IF;

          (* DOSIFICACION U1 *)
          1:
              V_Cil_Peq := TRUE;
              IF Cil_Peq_Ext THEN Step := 2; END_IF;
          2:
              V_Cil_Peq := TRUE;
              V_Cil_Lrg := TRUE;
              IF Cil_Lrg_Ext THEN Step := 3; END_IF;
          3:
              V_Cil_Peq := TRUE;
              V_Cil_Lrg := FALSE;
              IF Cil_Lrg_Ret THEN Step := 4; END_IF;
          4:
              V_Cil_Peq := FALSE;
              IF Cil_Peq_Ret THEN Step := 10; END_IF;

          (* TRANSPORTE A U2 *)
          10:
              Servo_Go_U1 := TRUE;
              IF Servo_En_U1 THEN Step := 11; END_IF;
          11:
              Servo_Go_U1 := TRUE;
              V_Cil_Vert := TRUE;
              IF Cil_Vert_Abajo THEN Step := 12; END_IF;
          12:
              Servo_Go_U1 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := TRUE;
              Timer_Pinza.IN := TRUE;
              Timer_Pinza.PT := T#500ms;
              IF Timer_Pinza.Q THEN
                  Step := 13;
              END_IF;
          13:
              Servo_Go_U1 := TRUE;
              V_Pinza := TRUE;
              IF Cil_Vert_Arriba THEN Step := 14; END_IF;
          14:
              Servo_Go_U2 := TRUE;
              V_Pinza := TRUE;
              IF Servo_En_U2 THEN Step := 15; END_IF;
          15:
              Servo_Go_U2 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := TRUE;
              IF Cil_Vert_Abajo THEN Step := 16; END_IF;
          16:
              Servo_Go_U2 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := FALSE;
              Timer_Pinza.IN := TRUE;
              Timer_Pinza.PT := T#500ms;
              IF Timer_Pinza.Q THEN
                  Step := 17;
              END_IF;
          17:
              Servo_Go_U2 := TRUE;
              IF Cil_Vert_Arriba THEN Step := 20; END_IF;

          (* PROCESAMIENTO U2 *)
          20:
              V_Prensa := TRUE;
              IF Prensa_Abajo THEN Step := 21; END_IF;
          21:
              V_Prensa := FALSE;
              IF Prensa_Arriba THEN Step := 30; END_IF;

          (* TRANSPORTE A U3 *)
          30:
              Servo_Go_U2 := TRUE;
              IF Servo_En_U2 THEN Step := 31; END_IF;
          31:
              Servo_Go_U2 := TRUE;
              V_Cil_Vert := TRUE;
              IF Cil_Vert_Abajo THEN Step := 32; END_IF;
          32:
              Servo_Go_U2 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := TRUE;
              Timer_Pinza.IN := TRUE;
              Timer_Pinza.PT := T#500ms;
              IF Timer_Pinza.Q THEN
                  Step := 33;
              END_IF;
          33:
              Servo_Go_U2 := TRUE;
              V_Pinza := TRUE;
              IF Cil_Vert_Arriba THEN Step := 34; END_IF;
          34:
              Servo_Go_U3 := TRUE;
              V_Pinza := TRUE;
              IF Servo_En_U3 THEN Step := 35; END_IF;
          35:
              Servo_Go_U3 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := TRUE;
              IF Cil_Vert_Abajo THEN Step := 36; END_IF;
          36:
              Servo_Go_U3 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := FALSE;
              Timer_Pinza.IN := TRUE;
              Timer_Pinza.PT := T#500ms;
              IF Timer_Pinza.Q THEN
                  Step := 37;
              END_IF;
          37:
              Servo_Go_U3 := TRUE;
              IF Cil_Vert_Arriba THEN Step := 40; END_IF;

          (* ENSAMBLAJE U3 *)
          40:
              V_Cil_Ensa := TRUE;
              IF Cil_Ensa_Ext THEN Step := 41; END_IF;
          41:
              V_Cil_Ensa := FALSE;
              IF Cil_Ensa_Ret THEN Step := 50; END_IF;

          (* TRANSPORTE A U5 *)
          50:
              Servo_Go_U3 := TRUE;
              IF Servo_En_U3 THEN Step := 51; END_IF;
          51:
              Servo_Go_U3 := TRUE;
              V_Cil_Vert := TRUE;
              IF Cil_Vert_Abajo THEN Step := 52; END_IF;
          52:
              Servo_Go_U3 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := TRUE;
              Timer_Pinza.IN := TRUE;
              Timer_Pinza.PT := T#500ms;
              IF Timer_Pinza.Q THEN
                  Step := 53;
              END_IF;
          53:
              Servo_Go_U3 := TRUE;
              V_Pinza := TRUE;
              IF Cil_Vert_Arriba THEN Step := 54; END_IF;
          54:
              Servo_Go_U5 := TRUE;
              V_Pinza := TRUE;
              IF Servo_En_U5 THEN Step := 55; END_IF;
          55:
              Servo_Go_U5 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := TRUE;
              IF Cil_Vert_Abajo THEN Step := 56; END_IF;
          56:
              Servo_Go_U5 := TRUE;
              V_Cil_Vert := TRUE;
              V_Pinza := FALSE;
              Timer_Pinza.IN := TRUE;
              Timer_Pinza.PT := T#500ms;
              IF Timer_Pinza.Q THEN
                  Step := 57;
              END_IF;
          57:
              Servo_Go_U5 := TRUE;
              IF Cil_Vert_Arriba THEN Step := 60; END_IF;

          (* SELECCION U5 *)
          60:
              Motor_Cinta := TRUE;
              IF Sens_Metal THEN
                  V_Deflector_R1 := TRUE;
                  IF Deflector_R1_Ext THEN Step := 61; END_IF;
              ELSIF Sens_Mixto THEN
                  V_Deflector_R2 := TRUE;
                  IF Deflector_R2_Ext THEN Step := 61; END_IF;
              ELSIF Sens_Plastico THEN
                  V_Deflector_R3 := TRUE;
                  IF Deflector_R3_Ext THEN Step := 61; END_IF;
              ELSIF NOT Sens_Objeto_Ent THEN
                  (* Si no hay pieza en la entrada de U5 tras un tiempo de espera, es descarte *)
                  Timer_Seleccion.IN := TRUE;
                  Timer_Seleccion.PT := T#4500ms;
                  IF Timer_Seleccion.Q THEN
                      Step := 62;
                  END_IF;
              END_IF;
          61:
              Motor_Cinta := TRUE;
              (* Mantener el deflector activo durante la expulsion de la pieza *)
              IF Deflector_R1_Ext THEN V_Deflector_R1 := TRUE; END_IF;
              IF Deflector_R2_Ext THEN V_Deflector_R2 := TRUE; END_IF;
              IF Deflector_R3_Ext THEN V_Deflector_R3 := TRUE; END_IF;

              (* Mantener la cinta encendida por 3 segundos para asegurar la caida *)
              Timer_Seleccion.IN := TRUE;
              Timer_Seleccion.PT := T#3000ms;
              IF Timer_Seleccion.Q THEN
                  Step := 62;
              END_IF;
          62:
              Motor_Cinta := FALSE;
              V_Deflector_R1 := FALSE;
              V_Deflector_R2 := FALSE;
              V_Deflector_R3 := FALSE;
              IF NOT Deflector_R1_Ext AND NOT Deflector_R2_Ext AND NOT Deflector_R3_Ext THEN
                  Step := 0; (* Reiniciar ciclo *)
              END_IF;
      END_CASE;

      (* 3. EVALUACION UNCONDICIONAL DE LOS TEMPORIZADORES (Actualiza su tiempo interno) *)
      Timer_Pinza();
      Timer_Seleccion();
END_PROGRAM


CONFIGURATION Config0

  RESOURCE Res0 ON PLC
    TASK task0(INTERVAL := T#20ms,PRIORITY := 1);
    PROGRAM instance0 WITH task0 : main;
  END_RESOURCE
END_CONFIGURATION
