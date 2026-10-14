# Unidad de Seleccion - Diseno de la Red de Petri y Modulo de Control
Sistema de Manufactura Flexible XK335B | S7-200 CPU 224XP CN

---

## 1. Estructura General de la Red de Petri

La Red de Petri de la Unidad de Seleccion es un grafo secuencial con:

- 6 plazas: P0, P1, P2, P3, P4, P5 (marcas M0.0 a M0.5).
- 6 transiciones: T0, T1, T2, T3, T4, T5 (marcas M1.0 a M1.5).
- 5 eventos combinacionales: M2.0 a M2.4.
- Marcado inicial: M0.0 = 1 (P0 activa), M0.1 a M0.5 = 0.

La red es estrictamente secuencial (un token circula por las plazas en orden). Las marcas M1.x son bits auxiliares calculados en MOD3 del OB1 y usados en MOD4 para la dinamica. Las marcas M2.x son condiciones combinacionales calculadas en MOD2.

---

## 2. Marcado Inicial

En la primera ejecucion del OB1 (SM0.1 = 1, primer ciclo de scan), el MOD1 realiza:

- S M0.0, 1: activa P0 (estado de reposo).
- R M0.1, 7: desactiva P1 a M0.7 (limpia cualquier estado previo).
- Carga de ganancias: VD120 = 97.26, VD124 = 25.64, VD132 = 97.26.
- Reset de variables: VD112 = 0.0 (setpoint), VD104 = 0.0 (posicion previa).
- CALL SBR1: inicializa HSC0 (encoder cuadratura Modo 9).
- SMB34 = 10, ATCH INT0 evento 10, ENI: habilita interrupcion de control cada 10 ms.

---

## 3. Condicion de Cada Transicion

### T0 - Inicio de Ciclo (M1.0)

    M1.0 = M0.0 AND M2.0 AND M2.1
    M2.0 = I1.3 AND I1.4   (marcha pulsada Y emergencia OK)
    M2.1 = I0.3             (sensor detecta pieza en entrada)

Disparo: P0 esta activa, el operario pulsa marcha, la emergencia no esta activa y hay una pieza en la zona de entrada.

### T1 - Posicion 500 alcanzada (M1.1)

    M1.1 = M0.1 AND M2.2
    M2.2: SM0.0; DTR HC0, AC0; AR>= AC0, 490.0; = M2.2

El encoder cuadratura (HC0, tipo DINT) se convierte a Real con DTR y se compara con 490.0 usando la instruccion de comparacion en serie AR>=. El umbral de 490 cuentas representa la zona de lectura de sensores (aprox. 500 cuentas). La instruccion AR>= se usa en lugar de una carga LDR adicional para mantener la red en un unico escalon logico.

### T2 - Clasificacion completada (M1.2)

    M1.2 = M0.2

Disparo inmediato en el mismo ciclo de scan en que P2 queda activa. No hay condicion adicional: la clasificacion al vuelo se ejecuta en las acciones de P2 y T2 dispara en el ciclo siguiente.

### T3 - Llegada a zona de rampa (M1.3)

    M1.3 = M0.3 AND M2.3
    M2.3: SM0.0; DTR HC0, AC0; +R 10.0, AC0; AR>= AC0, VD300; = M2.3

Se convierte HC0 a Real, se suma 10.0 (margen de anticipacion) y se compara con VD300 (coordenada de la rampa seleccionada). La instruccion AR>= vincula la comparacion al mismo escalon logico.

### T4 - Cilindro extendido (M1.4)

    M1.4 = M0.4 AND M2.4
    M2.4 = I0.7 OR I1.0 OR I1.1

Disparo cuando al menos uno de los tres cilindros de desvio confirma extension completa.

### T5 - Fin de ciclo (M1.5)

    M1.5 = M0.5

Disparo inmediato: en el mismo ciclo de scan en que P5 queda activa, se dispara T5 y el token regresa a P0.

---

## 4. Accion de Cada Plaza

### P0 - Reposo (M0.0)

    MOVR 0.0, VD112    (Setpoint = 0.0 cuentas -> cinta parada)

El controlador de estados actuara sobre esta referencia: al ser el error nulo o minimo, la accion de control tendra a 0 y el motor se detiene (|u| <= 100 -> R Q0.0).

### P1 - Avanzar (M0.1)

    MOVR 710.0, VD112  (Setpoint = 710.0 cuentas)

La cinta avanza hasta la zona de sensores. El controlador de estados acelera el motor en funcion del error de posicion y velocidad. La pieza pasa por delante de los sensores Sens_Fibra e Sens_Mag mientras se desplaza.

### P2 - Identificacion (M0.2)

No hay cambio de setpoint. Se realizan las lecturas de los sensores y se carga VD300 segun la logica de clasificacion al vuelo (ver seccion 5). T2 se dispara en el siguiente ciclo de scan sin condicion adicional.

### P3 - Viaje a Rampa (M0.3)

    MOVR VD300, VD112  (Setpoint = Coord_Rampa)

El controlador lleva la cinta hasta la posicion de la rampa destino. El setpoint cambia segun el tipo de material detectado en P2.

### P4 - Expulsion (M0.4)

Se activa la valvula del cilindro correspondiente a la rampa:

    Si VD300 == 710.0  -> S Q0.4 (V_Cil1, Rampa 1, metal puro)
    Si VD300 == 1150.0 -> S Q0.5 (V_Cil2, Rampa 2, material mixto)
    Si VD300 == 1520.0 -> S Q0.6 (V_Cil3, Rampa 3, plastico puro)

La comparacion se realiza con instrucciones AR= sobre el acumulador cargado con VD300.

### P5 - Final de Ciclo (M0.5)

    MOVR 0.0, VD112    (Setpoint = 0.0)
    MOVD 0, SMD38      (Carga valor 0 en registro actual de HSC0)
    HSC 0              (Aplica la configuracion: reset del encoder a 0)

Se reinicia la posicion del encoder para que el siguiente ciclo comience desde 0.

---

## 5. Logica de Clasificacion al Vuelo (P2)

La clasificacion se ejecuta en las acciones de la plaza P2 (MOD5, caso M0.2 activo). Los dos sensores son leidos simultaneamente por el OB1:

| Sens_Mag I0.5 | Sens_Fibra I0.4 | Material     | VD300 (Coord_Rampa) | Cilindro activo en P4 |
|---------------|-----------------|--------------|---------------------|-----------------------|
| 1             | 1               | Metal puro   | 710.0               | Q0.4 (V_Cil1)         |
| 1             | 0               | Mixto        | 1150.0              | Q0.5 (V_Cil2)         |
| 0             | 1               | Mixto        | 1150.0              | Q0.5 (V_Cil2)         |
| 0             | 0               | Plastico     | 1520.0              | Q0.6 (V_Cil3)         |

La condicion "Mixto" agrupa los casos en que solo uno de los dos sensores detecta material. En el AWL esto se implementa como:

- Si I0.5=1 AND I0.4=1: MOVR 710.0, VD300.
- Si (I0.4=1 AND !I0.5) OR (!I0.4 AND I0.5): MOVR 1150.0, VD300.
- Si !I0.4 AND !I0.5: MOVR 1520.0, VD300.

---

## 6. Subrutina SBR1 - HSC_INIT (Inicializacion del Encoder)

La subrutina SBR1 configura el contador de alta velocidad HSC0 para operar en Modo 9 (cuadratura de dos fases con reset por canal Z):

1. MOVB 16#FC, SMB37: configura HSC0.
   - Bit 7=1: habilitar HSC.
   - Bit 6=1: escribir valor actual (SMD38).
   - Bit 5=1: escribir preset (SMD42).
   - Bit 4=0: sin reinicio activo.
   - Bit 3=0: sin captura activa.
   - Bit 2=1: sin cambio de modo.
   - Bits 1-0: no aplica en Modo 9.
2. MOVD +0, SMD38: valor actual = 0 cuentas.
3. MOVD +0, SMD42: preset = 0 (sin interrupcion por preset).
4. HDEF 0, 9: define HSC0 en Modo 9 (cuadratura A/B con Z).
5. HSC 0: activa HSC0 con la configuracion cargada.

El registro HC0 es de 32 bits (DINT). Para usar su valor en calculos de punto flotante se emplea siempre DTR (Double Integer to Real) y nunca ITD, ya que ITD esta disenado para enteros de 16 bits y produciria perdida de datos o desbordamiento en HC0.

---

## 7. Modulo de Control INT0 - Controlador de Realimentacion de Estados

La rutina de interrupcion INT0 se ejecuta cada 10 ms (periodo Ts = 0.01 s). Implementa el controlador que mantiene la cinta en el setpoint de posicion indicado por la Red de Petri.

### 7.1 Ley de Control

    u(t) = N * r(t) - K1 * x1(t) - K2 * x2(t)

    Implementacion en VD:
    VD116 = VD132 * VD112 - VD120 * VD100 - VD124 * VD108

Donde:
- VD132 = N = 97.26 (pre-compensacion de referencia)
- VD112 = r(t) = setpoint actual (definido por la plaza activa)
- VD120 = K1 = 97.26 (ganancia de posicion)
- VD100 = x1(t) = posicion actual en cuentas (REAL)
- VD124 = K2 = 25.64 (ganancia de velocidad)
- VD108 = x2(t) = velocidad en cuentas/s (REAL)

### 7.2 Calculo de Velocidad (Derivada Numerica)

    VD108 = (VD100 - VD104) * 100.0

Con Ts = 10 ms, el factor 100 convierte la diferencia de posicion a cuentas por segundo.

### 7.3 Cadena de Salida

    VD128 = |VD116|  (valor absoluto)
    Si VD128 > 32000.0 -> VD128 = 32000.0  (saturacion)
    ROUND VD128 -> AC0  (redondeo a entero 32 bits)
    DTI AC0 -> AC1      (conversion Double a Integer 16 bits)
    MOVW AC1 -> AQW0    (escritura a salida analogica)

    Si VD128 > 100.0 -> S Q0.0  (marcha motor)
    Si VD128 <= 100.0 -> R Q0.0 (paro motor)

    Si VD116 >= 0.0 -> R Q0.1  (sentido adelante)
    Si VD116 < 0.0  -> S Q0.1  (sentido atras)

### 7.4 Seguridad en INT0

La primera instruccion de INT0 es:

    LDN I1.4 -> CRETI

Si la seta de emergencia esta activa (I1.4 = 0), la rutina retorna inmediatamente sin actualizar ninguna salida ni variable. El retorno se hace con CRETI (Conditional Return from Interrupt), que es la instruccion correcta para rutinas de interrupcion en S7-200. El uso de CRET causaria error de carga en el PLC.

---

## 8. Comportamiento Ante Emergencia

El bloque de emergencia en MOD5 del OB1 se evalua en cada ciclo de scan:

    LDN I1.4
    JMP 0       (salta la ejecucion normal si emergencia activa)
    LBL 0       (etiqueta en red independiente)

Si I1.4 = 0 (seta abierta):

    S M0.0, 1       (fuerza P0 activo)
    R M0.1, 5       (desactiva P1 a P5)
    MOVR 0.0, VD112 (setpoint = 0)
    R Q0.0, 1       (para el motor)
    R Q0.4, 3       (desactiva los tres cilindros Q0.4, Q0.5, Q0.6)

La combinacion de la parada en OB1 y el CRETI en INT0 garantiza que tanto la referencia como las salidas fisicas quedan en estado seguro durante una emergencia.
