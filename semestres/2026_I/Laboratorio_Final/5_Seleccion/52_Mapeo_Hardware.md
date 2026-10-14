# Unidad de Seleccion - Mapeo de Hardware
Sistema de Manufactura Flexible XK335B | S7-200 CPU 224XP CN

---

## 1. Entradas Digitales

| Direccion | Simbolo       | Descripcion                                         |
|-----------|---------------|-----------------------------------------------------|
| I0.0      | Enc_A         | Encoder cuadratura - Fase A                         |
| I0.1      | Enc_B         | Encoder cuadratura - Fase B                         |
| I0.2      | Enc_C         | Encoder cuadratura - Canal Z (indice / reset)       |
| I0.3      | Sens_Objeto   | Sensor de presencia de pieza en zona de entrada     |
| I0.4      | Sens_Fibra    | Sensor de fibra optica Omron (material reflectivo)  |
| I0.5      | Sens_Mag      | Sensor magnetico (detecta material metalico)        |
| I0.7      | Extendido_C1  | Confirmacion de cilindro Rampa 1 extendido          |
| I1.0      | Extendido_C2  | Confirmacion de cilindro Rampa 2 extendido          |
| I1.1      | Extendido_C3  | Confirmacion de cilindro Rampa 3 extendido          |
| I1.2      | Btn_Paro      | Pulsador de paro (rojo)                             |
| I1.3      | Btn_Marcha    | Pulsador de marcha (verde)                          |
| I1.4      | Seta_Emerg    | Seta de emergencia (NC - normalmente cerrada)       |
| I1.5      | Selector      | Selector de modo                                    |

---

## 2. Salidas Digitales

| Direccion | Simbolo      | Descripcion                                                      |
|-----------|--------------|------------------------------------------------------------------|
| Q0.0      | Motor_Cinta  | Mando de marcha del variador (Run/Stop)                          |
| Q0.1      | Motor_Dir    | Mando de sentido de giro del variador (Forward/Reverse)          |
| Q0.4      | V_Cil1       | Valvula neumatica cilindro Rampa 1 (expulsion metal puro)        |
| Q0.5      | V_Cil2       | Valvula neumatica cilindro Rampa 2 (expulsion material mixto)    |
| Q0.6      | V_Cil3       | Valvula neumatica cilindro Rampa 3 (expulsion plastico puro)     |
| Q0.7      | Lamp_Amarilla| Lampara de senalizacion amarilla                                 |
| Q1.0      | Lamp_Verde   | Lampara de senalizacion verde                                    |
| Q1.1      | Lamp_Roja    | Lampara de senalizacion roja                                     |

---

## 3. Salida Analogica

| Direccion | Simbolo        | Descripcion                                                                  |
|-----------|----------------|------------------------------------------------------------------------------|
| AQW0      | Salida_Analog  | Consigna de velocidad al variador: 0-32000 unidades = 0-10 V DC              |

---

## 4. Registros de Variables (VD - Double Word Real)

| Direccion | Simbolo       | Tipo | Funcion                                                                 |
|-----------|---------------|------|-------------------------------------------------------------------------|
| VD100     | Pos_Real      | REAL | Posicion actual del encoder en cuentas (convertida de HC0 con DTR)      |
| VD104     | Pos_Last      | REAL | Posicion del ciclo anterior (usada para calculo de velocidad)           |
| VD108     | Vel_Actual    | REAL | Velocidad actual en cuentas/s (derivada numerica: (Pos_Real-Pos_Last)*100) |
| VD112     | Setpoint      | REAL | Objetivo de posicion para el controlador (cuentas encoder)              |
| VD116     | Accion_Ctrl   | REAL | Accion de control calculada u(t) = N*r - K1*x1 - K2*x2                 |
| VD120     | K1            | REAL | Ganancia de posicion del controlador = 97.26                            |
| VD124     | K2            | REAL | Ganancia de velocidad del controlador = 25.64                           |
| VD128     | U_Abs         | REAL | Valor absoluto de la accion de control (tras saturacion a 32000)        |
| VD132     | N             | REAL | Ganancia de pre-compensacion de referencia = 97.26 (igual a K1)         |
| VD300     | Coord_Rampa   | REAL | Coordenada de la rampa destino seleccionada por clasificacion            |

---

## 5. Marcas de Plaza (Red de Petri - M0.x)

| Direccion | Simbolo     | Descripcion                                                      |
|-----------|-------------|------------------------------------------------------------------|
| M0.0      | P0_Reposo   | Plaza 0: estado de reposo, cinta parada, setpoint = 0            |
| M0.1      | P1_Avanzar  | Plaza 1: cinta avanzando hacia zona de sensores, setpoint = 710  |
| M0.2      | P2_Ident    | Plaza 2: identificacion de material al vuelo                     |
| M0.3      | P3_Viaje    | Plaza 3: cinta desplazando pieza hasta la rampa destino          |
| M0.4      | P4_Expulsar | Plaza 4: cilindro activo, expulsando pieza hacia la rampa        |
| M0.5      | P5_Final    | Plaza 5: reset de encoder y setpoint, fin de ciclo               |

---

## 6. Marcas de Transicion (Red de Petri - M1.x)

| Direccion | Simbolo         | Condicion de disparo                                              |
|-----------|-----------------|-------------------------------------------------------------------|
| M1.0      | T0_Inicio       | P0 AND Btn_Marcha AND Seta_Emerg AND Sens_Objeto                  |
| M1.1      | T1_Pos500       | P1 AND HC0_Real >= 490.0 cuentas (umbral aprox. 500)              |
| M1.2      | T2_Clasificado  | P2 (disparo inmediato, sin condicion adicional)                   |
| M1.3      | T3_Target       | P3 AND (HC0_Real + 10.0) >= VD300 (llegada a zona de rampa)       |
| M1.4      | T4_Push_OK      | P4 AND (I0.7 OR I1.0 OR I1.1) - algun cilindro confirmado extendido |
| M1.5      | T5_Fin_Ciclo    | P5 (disparo inmediato, retorno a P0)                              |

---

## 7. Marcas de Evento (M2.x)

| Direccion | Simbolo       | Expresion logica                              | Descripcion                                           |
|-----------|---------------|-----------------------------------------------|-------------------------------------------------------|
| M2.0      | Ev_Marcha     | I1.3 AND I1.4                                 | Boton marcha pulsado Y emergencia no activa           |
| M2.1      | Ev_Pieza_In   | I0.3                                          | Sensor detecta pieza en zona de entrada               |
| M2.2      | Ev_P500       | DTR(HC0) >= 490.0                             | Encoder ha alcanzado aprox. 500 cuentas               |
| M2.3      | Ev_PRampa     | (DTR(HC0) + 10.0) >= VD300                   | Encoder ha alcanzado la zona de la rampa destino      |
| M2.4      | Ev_Cil_Ext    | I0.7 OR I1.0 OR I1.1                          | Al menos un cilindro de expulsion confirmado extendido |

---

## 8. Registro de Alta Velocidad

| Registro | Tipo | Descripcion                                                                    |
|----------|------|--------------------------------------------------------------------------------|
| HC0      | DINT | Contador de alta velocidad HSC0, Modo 9 (cuadratura AB + reset Z). 32 bits.    |
| SMB37    | BYTE | Configuracion HSC0: 16#FC (cuadratura, sin reinicio SW, sin captura, creciente)|
| SMD38    | DINT | Valor actual de HSC0 (se carga con 0 para reset de posicion en P5)             |
| SMD42    | DINT | Valor de preset de HSC0 (cargado con 0)                                        |
| SMB34    | BYTE | Periodo de interrupcion temporizada: 10 (= 10 ms)                              |
