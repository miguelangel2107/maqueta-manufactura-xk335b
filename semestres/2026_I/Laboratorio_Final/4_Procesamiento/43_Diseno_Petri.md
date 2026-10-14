# Unidad de Procesamiento - XK335B
## Diseno de la Red de Petri CIPN

---

## 1. Descripcion General

El control de la Unidad de Procesamiento se implementa mediante una Red de Petri Interpretada para Control (CIPN - Control Interpreted Petri Net). La red tiene las siguientes caracteristicas:

- 6 plazas: P0 a P5
- 6 transiciones: T0 a T5
- 7 eventos de entrada: Ev_Marcha, Ev_Pieza, Ev_Pinza_Cer, Ev_CilL_Ext, Ev_CilL_Ret, Ev_CilD_Ext, Ev_CilD_Ret
- Marcado inicial: M0.0 (P0_Reposo) = 1, todas las demas plazas = 0
- Estructura: secuencia ciclica lineal (sin concurrencia ni bifurcaciones)

---

## 2. Plazas y Acciones Asociadas

### P0 - Reposo (M0.0)
- Descripcion: estado inicial de espera. El carro esta en origen, la pinza abierta y la prensa arriba.
- Acciones de salida activas: ninguna salida Q activa.
- Indicacion visual: Q1.1 (Lamp_Roja) se activa si P0 esta activo Y no hay pieza (M0.0 AND NOT M2.1) o si hay emergencia (NOT I1.4).
- Esta es la unica plaza sin acciones de proceso.

### P1 - Sujecion (M0.1)
- Descripcion: la pinza cierra para aferrar la pieza. El carro permanece en origen (I0.2=1).
- Acciones de salida activas:
  - Q0.0 = 1 (V_Pinza: cierra la pinza)
  - Q1.0 = 1 (Lamp_Verde: ciclo en marcha)
- Condicion necesaria para avanzar: confirmar I0.1 (Pinza_Cerrada).

### P2 - Traslacion hacia Prensa (M0.2)
- Descripcion: la pinza retiene la pieza, la valvula del cil largo activa y el carro se desplaza hacia la prensa.
- Acciones de salida activas:
  - Q0.0 = 1 (V_Pinza)
  - Q0.2 = 1 (V_Cil_Lrg: cil largo retrae -> carro hacia PRENSA)
  - Q1.0 = 1 (Lamp_Verde)
- Condicion necesaria para avanzar: confirmar I0.3 (Cil_Lrg_Ret: carro llego a prensa).

### P3 - Prensado Baja (M0.3)
- Descripcion: el carro esta posicionado en la prensa. La valvula del cil delgado activa y la prensa desciende sobre la pieza.
- Acciones de salida activas:
  - Q0.0 = 1 (V_Pinza)
  - Q0.2 = 1 (V_Cil_Lrg: mantiene carro en posicion prensa)
  - Q0.3 = 1 (V_Cil_Del: cil delgado extiende -> prensa ABAJO)
  - Q1.0 = 1 (Lamp_Verde)
- Condicion necesaria para avanzar: confirmar I0.5 (Cil_Del_Ext: prensa llego abajo).

### P4 - Prensado Sube (M0.4)
- Descripcion: el prensado ha sido completado. La valvula del cil delgado se desactiva y la prensa asciende. El carro permanece en la posicion de prensa.
- Acciones de salida activas:
  - Q0.0 = 1 (V_Pinza)
  - Q0.2 = 1 (V_Cil_Lrg: mantiene carro en posicion prensa)
  - Q1.0 = 1 (Lamp_Verde)
- Nota: Q0.3 = 0 (el cil delgado retrae, prensa sube).
- Condicion necesaria para avanzar: confirmar I0.4 (Cil_Del_Ret: prensa llego arriba).

### P5 - Traslacion hacia Origen (M0.5)
- Descripcion: la prensa esta arriba. La valvula del cil largo se desactiva y el carro retorna a la posicion de origen. La pinza continua cerrada para no perder la pieza.
- Acciones de salida activas:
  - Q0.0 = 1 (V_Pinza)
  - Q1.0 = 1 (Lamp_Verde)
- Nota: Q0.2 = 0 (el cil largo extiende, carro retorna a ORIGEN).
- Condicion necesaria para avanzar: confirmar I0.2 (Cil_Lrg_Ext: carro en origen).

---

## 3. Transiciones y Condiciones de Disparo

| Transicion | Simbolo (M1.x)  | Plaza origen | Plaza destino | Condicion de disparo                                    |
|------------|-----------------|--------------|---------------|---------------------------------------------------------|
| T0         | T0_Inicio       | P0 (M0.0)    | P1 (M0.1)     | M0.0 AND Ev_Marcha (I1.3 AND I1.4) AND Ev_Pieza (I0.0) |
| T1         | T1_Sujeto       | P1 (M0.1)    | P2 (M0.2)     | M0.1 AND Ev_Pinza_Cer (I0.1)                           |
| T2         | T2_Carro_Prensa | P2 (M0.2)    | P3 (M0.3)     | M0.2 AND Ev_CilL_Ret (I0.3)                            |
| T3         | T3_Prensa_Abajo | P3 (M0.3)    | P4 (M0.4)     | M0.3 AND Ev_CilD_Ext (I0.5)                            |
| T4         | T4_Prensa_Arriba| P4 (M0.4)    | P5 (M0.5)     | M0.4 AND Ev_CilD_Ret (I0.4)                            |
| T5         | T5_Carro_Origen | P5 (M0.5)    | P0 (M0.0)     | M0.5 AND Ev_CilL_Ext (I0.2)                            |

---

## 4. Tabla de Eventos

| Evento  | Simbolo (M2.x)      | Expresion logica     | Descripcion                              |
|---------|---------------------|----------------------|------------------------------------------|
| Ev_0    | Ev_Marcha (M2.0)    | I1.3 AND I1.4        | Boton marcha pulsado Y seta OK           |
| Ev_1    | Ev_Pieza (M2.1)     | I0.0                 | Pieza detectada en base                  |
| Ev_2    | Ev_Pinza_Cer (M2.2) | I0.1                 | Pinza cerrada confirmada                 |
| Ev_3    | Ev_CilL_Ext (M2.3)  | I0.2                 | Cil largo extendido (carro en ORIGEN)    |
| Ev_4    | Ev_CilL_Ret (M2.4)  | I0.3                 | Cil largo retraido (carro en PRENSA)     |
| Ev_5    | Ev_CilD_Ext (M2.5)  | I0.5                 | Cil delgado extendido (prensa ABAJO)     |
| Ev_6    | Ev_CilD_Ret (M2.6)  | I0.4                 | Cil delgado retraido (prensa ARRIBA)     |

---

## 5. Logica de Acciones por Plaza (Modulo 5 del OB1)

La activacion de salidas esta condicionada por el estado de emergencia. Si I1.4=0 (emergencia activa), se salta la asignacion de salidas (instruccion JMP 0 en AWL):

| Salida  | Simbolo       | Condicion de activacion (plazas activas)     |
|---------|---------------|----------------------------------------------|
| Q0.0    | V_Pinza       | M0.1 OR M0.2 OR M0.3 OR M0.4 OR M0.5        |
| Q0.2    | V_Cil_Lrg    | M0.2 OR M0.3 OR M0.4                         |
| Q0.3    | V_Cil_Del    | M0.3                                          |
| Q1.0    | Lamp_Verde    | M0.1 OR M0.2 OR M0.3 OR M0.4 OR M0.5        |
| Q1.1    | Lamp_Roja     | (M0.0 AND NOT M2.1) OR (NOT I1.4)            |

---

## 6. Comportamiento de Emergencia

Condicion: I1.4 = 0 (seta de emergencia accionada).

Acciones inmediatas (sin condicion de plaza):
- R M0.1, 7: resetea plazas P1 a P7 (limpia todo estado activo de proceso).
- S M0.0, 1: activa P0_Reposo (retorno forzado al estado inicial).
- El bloque de acciones de salida (MOD5) es saltado por la instruccion JMP 0.
- Resultado: todas las salidas Q de proceso quedan en 0 (actuadores desenergizados).
- Q1.1 (Lamp_Roja) se activa por la condicion NOT I1.4.

Nota de seguridad: la logica de emergencia se ejecuta al inicio del MOD5 con instruccion LDN I1.4, garantizando que aunque el ciclo este en cualquier plaza, al detectar I1.4=0 el sistema se detiene inmediatamente y retorna al estado de reposo.

---

## 7. Nota sobre Boton Rojo (I1.2)

I1.2 (Btn_Paro) esta definido en el archivo de simbolos CSV del proyecto. Sin embargo, en el programa AWL actual de la Unidad de Procesamiento (OB1), no existe ninguna red que utilice I1.2 como condicion logica. La funcion de paro queda actualmente cubierta solo por la seta de emergencia (I1.4). Una implementacion de paro controlado mediante I1.2 podria considerarse en futuras revisiones del programa.
