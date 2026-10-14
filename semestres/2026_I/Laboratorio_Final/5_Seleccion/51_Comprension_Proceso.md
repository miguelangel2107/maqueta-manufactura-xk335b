# Unidad de Seleccion - Comprension del Proceso
Sistema de Manufactura Flexible XK335B | S7-200 CPU 224XP CN

---

## 1. Funcion General

La Unidad de Seleccion clasifica y desvia piezas transportadas por una cinta motorizada hacia una de tres rampas de salida, segun el tipo de material detectado (metal puro, mixto o plastico). El control de posicion de la cinta se realiza mediante un controlador de realimentacion de estados ejecutado por interrupcion periodica de 10 ms.

---

## 2. Descripcion Mecanica

### 2.1 Cinta Transportadora

La cinta es accionada por un motor de corriente alterna gobernado por un variador de frecuencia. El variador recibe:

- Q0.0 (Motor_Cinta): habilita o deshabilita la marcha.
- Q0.1 (Motor_Dir): selecciona el sentido de giro (adelante o atras).
- AQW0 (Salida_Analog): consigna de velocidad analogica 0-32000 unidades equivalentes a 0-10 V DC.

### 2.2 Encoder de Cuadratura

Un encoder incremental de cuadratura de tres canales proporciona la medida de posicion:

- I0.0 (Enc_A): canal de fase A.
- I0.1 (Enc_B): canal de fase B.
- I0.2 (Enc_C): canal de indice Z para reset de posicion.

El contador de alta velocidad HSC0 opera en Modo 9 (cuadratura AB con reset por canal Z), configurado mediante la subrutina SBR1 (HSC_INIT). El registro HC0 es de 32 bits (DINT) y se convierte a Real con la instruccion DTR para los calculos de control.

### 2.3 Sensores de Clasificacion

Dos sensores leen el material de la pieza cuando esta pasa por la zona de identificacion (aprox. posicion 500 cuentas del encoder):

- I0.4 (Sens_Fibra): sensor de fibra optica Omron. Valor 1 indica presencia de material reflectivo.
- I0.5 (Sens_Mag): sensor magnetico. Valor 1 indica material metalico.

### 2.4 Cilindros de Desvio

Tres actuadores neumaticos desvian la pieza hacia la rampa correspondiente:

- Q0.4 (V_Cil1): valvula del cilindro de la Rampa 1 (material metalico, posicion 710 cuentas).
- Q0.5 (V_Cil2): valvula del cilindro de la Rampa 2 (material mixto, posicion 1150 cuentas).
- Q0.6 (V_Cil3): valvula del cilindro de la Rampa 3 (material plastico, posicion 1520 cuentas).

Las confirmaciones de cilindro extendido se leen en I0.7, I1.0 e I1.1 respectivamente.

---

## 3. Secuencia Logica (Red de Petri de 6 Plazas)

El ciclo productivo sigue una Red de Petri con 6 plazas (P0 a P5) y 6 transiciones (T0 a T5). El marcado inicial es P0 activa.

| Plaza | Nombre       | Accion principal                                   |
|-------|--------------|----------------------------------------------------|
| P0    | P0_Reposo    | Setpoint = 0.0 (cinta parada)                      |
| P1    | P1_Avanzar   | Setpoint = 710.0 (cinta avanza a zona sensores)    |
| P2    | P2_Ident     | Clasificacion al vuelo, carga coordenada en VD300  |
| P3    | P3_Viaje     | Setpoint = VD300 (cinta lleva pieza a la rampa)    |
| P4    | P4_Expulsar  | Activa cilindro de la rampa correspondiente        |
| P5    | P5_Final     | Setpoint = 0.0, reset encoder, retorno a P0        |

### 3.1 Condiciones de Disparo de Transiciones

| Transicion | Condicion                                                        |
|------------|------------------------------------------------------------------|
| T0         | P0 activa AND Btn_Marcha(I1.3) AND Seta_Emerg(I1.4) AND Sens_Objeto(I0.3) |
| T1         | P1 activa AND HC0_Real >= 490.0 cuentas                          |
| T2         | P2 activa (disparo inmediato, sin espera adicional)              |
| T3         | P3 activa AND (HC0_Real + 10.0) >= VD300                        |
| T4         | P4 activa AND alguno de I0.7, I1.0 o I1.1 = 1                  |
| T5         | P5 activa (disparo inmediato, retorno a P0)                      |

---

## 4. Sistema de Clasificacion al Vuelo

La clasificacion se realiza en P2 en un unico ciclo de OB1, leyendo los sensores antes de que T2 se dispare. La logica es:

| Sens_Mag (I0.5) | Sens_Fibra (I0.4) | Material     | VD300  | Cilindro |
|-----------------|-------------------|--------------|--------|----------|
| 1               | 1                 | Metal puro   | 710.0  | Q0.4     |
| 1               | 0                 | Mixto        | 1150.0 | Q0.5     |
| 0               | 1                 | Mixto        | 1150.0 | Q0.5     |
| 0               | 0                 | Plastico     | 1520.0 | Q0.6     |

La coordenada cargada en VD300 (Coord_Rampa) define tanto el setpoint de P3 como el cilindro que se activa en P4.

---

## 5. Controlador de Realimentacion de Estados

### 5.1 Arquitectura

El control de posicion de la cinta se implementa mediante un controlador de realimentacion de estados con pre-compensacion de referencia. El vector de estado tiene dos componentes:

- x1 = posicion actual (VD100, en cuentas encoder, tipo REAL).
- x2 = velocidad actual (VD108, en cuentas/s, calculada por derivada numerica).

### 5.2 Ley de Control

    u(t) = N * r(t) - K1 * x1(t) - K2 * x2(t)

Donde:
- r(t) = VD112 (Setpoint, en cuentas encoder).
- K1 = VD120 = 97.26 (ganancia de posicion).
- K2 = VD124 = 25.64 (ganancia de velocidad).
- N  = VD132 = 97.26 (ganancia de pre-compensacion de referencia, igual a K1).

### 5.3 Calculo de Velocidad

    x2(t) = (VD100 - VD104) / Ts = (Pos_Real - Pos_Last) * 100

Con Ts = 10 ms, el factor multiplicador es 100 para obtener cuentas/segundo.

### 5.4 Interrupcion INT0 (10 ms)

La rutina INT0 se ejecuta periodicamente cada 10 ms, habilitada en OB1 mediante ATCH INT0,10 y ENI. Secuencia de ejecucion:

1. Verificacion de emergencia: si I1.4 = 0, CRETI (retorno inmediato).
2. Lectura de posicion: MOVD HC0, AC0; DTR AC0, VD100.
3. Calculo de velocidad: VD108 = (VD100 - VD104) * 100.0.
4. Calculo de la accion de control: VD116 = N*VD112 - K1*VD100 - K2*VD108.
5. Determinacion de direccion: si VD116 >= 0, Q0.1=0 (adelante); si VD116 < 0, Q0.1=1 (atras).
6. Saturacion: VD128 = |VD116|, limitado a 32000.
7. Salida analogica: ROUND VD128 -> DTI -> MOVW AQW0.
8. Control marcha: si VD128 > 100 -> S Q0.0; si VD128 <= 100 -> R Q0.0.
9. Actualizacion: VD104 = VD100 (posicion previa para siguiente ciclo).

### 5.5 Saturacion y Rango

La accion de control se satura a 32000 unidades antes de enviarse a AQW0, que corresponde a la salida analogica maxima de 10 V DC al variador. El umbral de 100 unidades define la zona muerta de marcha del motor.

---

## 6. Gestion de Emergencia

Si la seta de emergencia I1.4 pasa a 0 (estado NC abierto):

- En OB1 (MOD5): se activa M0.0 (P0), se desactivan M0.1 a M0.5, setpoint = 0.0, se desactivan Q0.0 y Q0.4-Q0.6.
- En INT0: CRETI inmediato (no se actualiza la salida analogica ni el motor).

La maquina queda en estado de reposo seguro hasta que se restablezca la emergencia y se pulse de nuevo marcha.
