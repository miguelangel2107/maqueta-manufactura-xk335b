# Unidad de Transporte - XK335B
## Mapeo de Hardware y Variables

**Sistema:** Manufactura Flexible XK335B
**Modulo:** Unidad de Transporte (UT)
**PLC:** Siemens S7-200 CPU 224XP CN

---

## 1. Entradas Digitales

| Direccion | Simbolo        | Funcion                                                     |
|-----------|----------------|-------------------------------------------------------------|
| I0.0      | Sens_Origen    | Sensor inductivo de punto de origen para homing del servo   |
| I0.1      | FC_Derecha     | Final de carrera limite fisico derecho del eje (Fwd_Limit)  |
| I0.2      | FC_Izquierda   | Final de carrera limite fisico izquierdo del eje (Rev_Limit)|
| I0.3      | CilV_Abajo     | Cilindro vertical en posicion abajo (brazo descendido)      |
| I0.4      | CilV_Arriba    | Cilindro vertical en posicion arriba (brazo elevado)        |
| I0.5      | Giro_Izquierda | Rotatorio en posicion antihoraria (AH / izquierda)          |
| I0.6      | Giro_Derecha   | Rotatorio en posicion horaria (H / derecha)                 |
| I0.7      | CilDV_Ext      | Doble vastago completamente extendido                       |
| I1.0      | CilDV_Ret      | Doble vastago completamente retraido                        |
| I1.1      | Pinza_Cer      | Pinza en posicion cerrada (pieza sujetada)                  |
| I1.2      | Estado_Servo   | Driver servo en estado listo para operar (1 = Ready)        |
| I2.4      | Btn_Paro       | Boton rojo de paro en panel de operador                     |
| I2.5      | Btn_Marcha     | Boton amarillo de marcha en panel de operador               |
| I2.6      | Seta_Emerg     | Seta de emergencia normalmente cerrada (NC). 0 = emergencia |
| I2.7      | Selector       | Selector modo standalone (genera solicitud A->P auto)       |

---

## 2. Salidas Digitales

| Direccion | Simbolo        | Funcion                                                        |
|-----------|----------------|----------------------------------------------------------------|
| Q0.0      | Servo_Pulsos   | Salida PTO - tren de pulsos para servo motor lineal            |
| Q0.2      | Servo_Dir      | Senal de direccion servo (gestionado por libreria MAP_SERV)    |
| Q0.3      | V_Cil_Vert     | Valvula cilindro vertical. Activo = brazo ARRIBA (elevado)     |
| Q0.4      | V_Giro_AH      | Valvula rotatorio. Activo = giro antihorario de la garra       |
| Q0.5      | V_Giro_H       | Valvula rotatorio. Activo = giro horario de la garra           |
| Q0.6      | V_Cil_DV       | Valvula doble vastago. Activo = vastago EXTENDIDO              |
| Q0.7      | V_Pinza_Abre   | Valvula pinza. Activo = apertura de pinza                      |
| Q1.0      | V_Pinza_Cierra | Valvula pinza. Activo = cierre de pinza                        |
| Q1.5      | Lamp_Amarilla  | Lampara amarilla: homing activo o paro solicitado              |
| Q1.6      | Lamp_Verde     | Lampara verde: sistema ejecutando tarea (cualquier plaza P1x-P14)|
| Q1.7      | Lamp_Roja      | Lampara roja: sistema libre, brazo en reposo (P0_Brazo_Libre)  |

Nota: Q0.1 NO es usado por el servo. La direccion del servo es Q0.2 (segun libreria MAP_SERV Q0_0).
Las salidas Q0.3 a Q1.0 son reseteadas por MOD0 ante emergencia.

---

## 3. Marcas de Plazas - Red de Petri (M)

### 3.1 Zona Homing

| Marca | Simbolo       | Descripcion                                            |
|-------|---------------|--------------------------------------------------------|
| M5.0  | P_Hom_Espera  | Espera de inicio de homing. Marcado inicial tras reset |
| M5.1  | P_Hom_Activo  | Homing en ejecucion. Lampara amarilla encendida        |

### 3.2 Zona Gestion de Solicitudes

| Marca | Simbolo        | Descripcion                                                  |
|-------|----------------|--------------------------------------------------------------|
| M0.0  | P0_Brazo_Libre | Brazo libre, sistema listo para nueva tarea. Lampara roja ON |
| M0.1  | P1_Req_A_P     | Solicitud activa: Alimentacion -> Procesamiento (prioridad 3)|
| M0.2  | P2_Req_P_E     | Solicitud activa: Procesamiento -> Ensamblaje (prioridad 2)  |
| M0.3  | P3_Req_E_S     | Solicitud activa: Ensamblaje -> Seleccion (prioridad 1)      |

### 3.3 Zona Ejecucion Pick

| Marca | Simbolo       | Descripcion                                              |
|-------|---------------|----------------------------------------------------------|
| M1.0  | P10_Viaje_Ori | Servo viajando hacia coordenada origen de la tarea       |
| M1.1  | P11a_Rot_Ori  | Girando garra a posicion de recogida (rotacion H)        |
| M1.2  | P11b_DV_Ext   | Extendiendo doble vastago sobre la pieza                 |
| M1.3  | P11c_Cil_Baj  | Descendiendo cilindro vertical hacia la pieza            |
| M1.4  | P11d_Pinza_Cer| Cerrando pinza para sujetar pieza                        |
| M1.5  | P11e_Cil_Arr  | Elevando cilindro vertical con pieza sujetada            |
| M1.6  | P11f_DV_Ret   | Retrayendo doble vastago con pieza elevada               |

### 3.4 Zona Ejecucion Place

| Marca | Simbolo       | Descripcion                                              |
|-------|---------------|----------------------------------------------------------|
| M1.7  | P12_Viaje_Des | Servo viajando hacia coordenada destino con pieza        |
| M2.0  | P13a_Rot_Des  | Girando garra a orientacion de deposito segun destino    |
| M2.1  | P13b_DV_Ext   | Extendiendo doble vastago sobre posicion de deposito     |
| M2.2  | P13c_Cil_Baj  | Descendiendo cilindro vertical para depositar pieza      |
| M8.0  | P13d_Pinza_Ab | Abriendo pinza para soltar pieza                         |
| M8.1  | P13e_Cil_Arr  | Elevando cilindro vertical tras depositar pieza          |
| M3.5  | P13f_DV_Ret   | Retrayendo doble vastago tras place                      |
| M3.6  | P14_Finalizar | Plaza de finalizacion de tarea. Regresa a P0_Brazo_Libre |

---

## 4. Marcas de Transiciones - Red de Petri (M)

| Marca | Simbolo         | Condicion de Disparo                                         |
|-------|-----------------|--------------------------------------------------------------|
| M4.0  | T_Homing_Start  | M5.0 AND M6.0 AND M3.4 (espera, marcha, servo listo)        |
| M4.1  | T_Homing_Done   | M5.1 AND M3.3 (homing activo, sensor origen detectado)       |
| M4.2  | T_Acept_ES      | M0.0 AND M0.3 AND !M6.1 (libre, req ES, sin paro)           |
| M4.3  | T_Acept_PE      | M0.0 AND M0.2 AND !M0.3 AND !M6.1 (sin req ES)              |
| M4.4  | T_Acept_AP      | M0.0 AND M0.1 AND !M0.2 AND !M0.3 AND !M6.1                 |
| M4.5  | T_Origen_OK     | M1.0 AND M3.2 (viaje origen completo, servo done)            |
| M4.6  | T_Rot_Ori_OK    | M1.1 AND M2.6 (giro H confirmado en pick)                    |
| M4.7  | T_DV_Ext_Pick   | M1.2 AND M2.7 (DV extendido confirmado)                      |
| M5.2  | T_CilV_Baj_Pick | M1.3 AND M2.3 (cilindro abajo confirmado)                    |
| M5.3  | T_Pinza_Cer     | M1.4 AND M3.1 (pinza cerrada confirmada)                     |
| M5.4  | T_CilV_Arr_Pick | M1.5 AND M2.4 (cilindro arriba confirmado)                   |
| M5.5  | T_DV_Ret_Pick   | M1.6 AND M3.0 (DV retraido confirmado)                       |
| M5.6  | T_Destino_OK    | M1.7 AND M3.2 (viaje destino completo, servo done)           |
| M5.7  | T_Rot_Des_OK    | M2.0 AND ((M2.6 AND !M7.2) OR (M2.5 AND M7.2))              |
| M6.2  | T_DV_Ext_Place  | M2.1 AND M2.7 (DV extendido en place)                        |
| M6.3  | T_CilV_Baj_Place| M2.2 AND M2.3 (cilindro abajo en place)                      |
| M6.4  | T_Pinza_Ab      | M8.0 AND !M3.1 (pinza abierta confirmada)                    |
| M6.5  | T_CilV_Arr_Place| M8.1 AND M2.4 (cilindro arriba en place)                     |
| M6.6  | T_DV_Ret_Place  | M3.5 AND M3.0 (DV retraido en place)                         |
| M6.7  | T_Tarea_Fin     | M3.6 (sin condicion adicional, siempre disparable)           |

---

## 5. Marcas de Eventos (M)

| Marca | Simbolo         | Fuente   | Descripcion                                         |
|-------|-----------------|----------|-----------------------------------------------------|
| M2.3  | Ev_CilV_Abajo   | I0.3     | Evento: cilindro vertical ha llegado abajo          |
| M2.4  | Ev_CilV_Arriba  | I0.4     | Evento: cilindro vertical ha llegado arriba         |
| M2.5  | Ev_Giro_Izq     | I0.5     | Evento: rotatorio en posicion AH (izquierda)        |
| M2.6  | Ev_Giro_Der     | I0.6     | Evento: rotatorio en posicion H (derecha)           |
| M2.7  | Ev_CilDV_Ext    | I0.7     | Evento: doble vastago ha llegado a extendido        |
| M3.0  | Ev_CilDV_Ret    | I1.0     | Evento: doble vastago ha llegado a retraido         |
| M3.1  | Ev_Pinza_Cer    | I1.1     | Evento: pinza confirmada cerrada                    |
| M3.2  | Ev_Move_Done    | V220.1   | Evento: servo completo movimiento (MAP_SERV Done)   |
| M3.3  | Ev_Origen_Det   | I0.0     | Evento: sensor inductivo de origen detectado        |
| M3.4  | Ev_Servo_OK     | I1.2     | Evento: driver servo en estado listo                |
| M6.0  | Ev_Marcha_Flanco| I2.5 ↑   | Flanco de subida en boton marcha (autoreset)        |
| M6.1  | Ev_Paro_Flanco  | I2.4 ↑   | Flanco de subida en boton paro (autoreset)          |

---

## 6. Marcas de Contexto de Tarea (M)

| Marca | Simbolo      | Descripcion                                                  |
|-------|--------------|--------------------------------------------------------------|
| M7.0  | Ctx_Tarea_AP | Contexto activo: tarea Alimentacion -> Procesamiento         |
| M7.1  | Ctx_Tarea_PE | Contexto activo: tarea Procesamiento -> Ensamblaje           |
| M7.2  | Ctx_Tarea_ES | Contexto activo: tarea Ensamblaje -> Seleccion               |

Solo una marca de contexto puede estar activa a la vez.
Son activadas por las transiciones T_Acept_AP/PE/ES y reseteadas por T_Tarea_Fin.
El contexto determina las coordenadas de viaje y la orientacion de la garra en la fase place.

---

## 7. Variables de Bit en Area V

| Direccion | Simbolo             | Descripcion                                                |
|-----------|---------------------|------------------------------------------------------------|
| V219.0    | Home_Done           | SBR0 Home completado exitosamente (salida de MAP_SERV)     |
| V219.1    | Home_Error          | SBR0 Home terminado con error (salida de MAP_SERV)         |
| V220.1    | Servo_Done          | SBR5 MoveAbsolute completado. Copiado a M3.2 (Ev_Move_Done)|
| V220.4    | Servo_Execute_Pulse | Pulso de un scan para lanzar SBR5 MoveAbsolute             |

---

## 8. Registros de Doble Palabra (VD) - 32 bits

| Registro | Simbolo           | Valor Init | Descripcion                                         |
|----------|-------------------|------------|-----------------------------------------------------|
| VD10     | Servo_C_Pos       | -          | Posicion actual del servo (salida CTRL MAP_SERV)    |
| VD200    | Coord_Target      | -          | Coordenada objetivo activa para MoveAbsolute        |
| VD204    | Coord_Alim        | 8000       | Coordenada absoluta estacion Alimentacion           |
| VD208    | Coord_Proc        | 50000      | Coordenada absoluta estacion Procesamiento          |
| VD212    | Coord_Ensa        | 92000      | Coordenada absoluta estacion Ensamblaje             |
| VD216    | Coord_Sele        | 112000     | Coordenada absoluta estacion Seleccion              |

Las coordenadas en VD204-VD216 son constantes cargadas en primer scan (SM0.1).
VD200 es la variable de trabajo que se actualiza en cada aceptacion de solicitud y
al inicio de la fase place segun el contexto M7.x.

---

## 9. Subrutinas MAP_SERV (Q0_0) - Resumen

| SBR   | Nombre       | Cuando se llama                           | Parametros clave                                |
|-------|--------------|-------------------------------------------|-------------------------------------------------|
| SBR0  | Q0_0_Home    | Flanco de subida en M5.1 (homing inicio)  | Start_Dir=0 (reverso), ref=I0.0, Done->V219.0  |
| SBR3  | Q0_0_CTRL    | Cada scan del OB1 (obligatorio)           | SS=30000, Max=50000, Ramp=2.0s, C_Pos->VD10    |
| SBR5  | Q0_0_MoveAbs | EXECUTE=V220.4 (pulso un scan)            | Position=VD200, Velocity=50000, Done->V220.1   |
