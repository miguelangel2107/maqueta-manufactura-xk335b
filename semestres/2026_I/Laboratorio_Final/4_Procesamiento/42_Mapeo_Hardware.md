# Unidad de Procesamiento - XK335B
## Mapeo de Hardware (Entradas, Salidas y Memorias)

---

## 1. Entradas Digitales

| Address | Simbolo        | Descripcion                                      | Tipo de Sensor       |
|---------|----------------|--------------------------------------------------|----------------------|
| I0.0    | Pos_Pieza      | Presencia de pieza en estacion de origen         | Sensor fotoelectrico |
| I0.1    | Pinza_Cerrada  | Confirmacion de pinza cerrada                    | Sensor cilindro dedo |
| I0.2    | Cil_Lrg_Ext    | Cil largo extendido (carro en ORIGEN)            | Sensor magnetico     |
| I0.3    | Cil_Lrg_Ret    | Cil largo retraido (carro en PRENSA)             | Sensor magnetico     |
| I0.4    | Cil_Del_Ret    | Cil delgado retraido (prensa ARRIBA)             | Sensor magnetico     |
| I0.5    | Cil_Del_Ext    | Cil delgado extendido (prensa ABAJO)             | Sensor magnetico     |
| I1.2    | Btn_Paro       | Pulsador rojo de paro                            | Pulsador NC/NA       |
| I1.3    | Btn_Marcha     | Pulsador verde de marcha                         | Pulsador NA          |
| I1.4    | Seta_Emerg     | Seta de emergencia (NC, normalmente cerrada=1)   | Hongo de emergencia  |
| I1.5    | Selector_Rot   | Selector rotativo de modo                        | Selector             |

---

## 2. Salidas Digitales

| Address | Simbolo       | Descripcion                                         | Elemento Fisico           |
|---------|---------------|-----------------------------------------------------|---------------------------|
| Q0.0    | V_Pinza       | Valvula cilindro de dedo/pinza (activa=cierra)      | Valvula solenoide neumatica|
| Q0.2    | V_Cil_Lrg    | Valvula cil largo traslacion (activa=retrae=PRENSA) | Valvula solenoide neumatica|
| Q0.3    | V_Cil_Del    | Valvula cil delgado prensa (activa=extiende=ABAJO)  | Valvula solenoide neumatica|
| Q0.7    | Lamp_Amarilla | Lampara de indicacion amarilla                      | Lampara de torre           |
| Q1.0    | Lamp_Verde    | Lampara de ciclo activo (verde)                     | Lampara de torre           |
| Q1.1    | Lamp_Roja     | Lampara de reposo / emergencia (roja)               | Lampara de torre           |

---

## 3. Memorias de Estado - Plazas Red de Petri (M0.x)

| Address | Simbolo            | Descripcion                                              |
|---------|--------------------|----------------------------------------------------------|
| M0.0    | P0_Reposo          | Plaza inicial: sistema en espera                         |
| M0.1    | P1_Sujecion        | Pinza cierra sobre la pieza en origen                    |
| M0.2    | P2_Traslacion_In   | Carro con pieza se desplaza hacia la prensa              |
| M0.3    | P3_Prensado_Baja   | Prensa desciende sobre la pieza (operacion de prensado)  |
| M0.4    | P4_Prensado_Sube   | Prensa retorna a posicion arriba                         |
| M0.5    | P5_Traslacion_Out  | Carro retorna a posicion de origen                       |

---

## 4. Memorias de Transicion (M1.x)

| Address | Simbolo           | Descripcion                                                   |
|---------|-------------------|---------------------------------------------------------------|
| M1.0    | T0_Inicio         | Transicion: P0 -> P1 (marcha + pieza presente)                |
| M1.1    | T1_Sujeto         | Transicion: P1 -> P2 (pinza cerrada confirmada)               |
| M1.2    | T2_Carro_Prensa   | Transicion: P2 -> P3 (carro llego a prensa)                   |
| M1.3    | T3_Prensa_Abajo   | Transicion: P3 -> P4 (prensa llego abajo)                     |
| M1.4    | T4_Prensa_Arriba  | Transicion: P4 -> P5 (prensa regreso arriba)                  |
| M1.5    | T5_Carro_Origen   | Transicion: P5 -> P0 (carro regreso a origen)                 |

---

## 5. Memorias de Evento (M2.x)

| Address | Simbolo             | Descripcion                                            | Senal Origen              |
|---------|---------------------|--------------------------------------------------------|---------------------------|
| M2.0    | Ev_Marcha           | Evento: boton marcha Y seta OK                         | I1.3 AND I1.4             |
| M2.1    | Ev_Pieza            | Evento: pieza presente en estacion de origen           | I0.0                      |
| M2.2    | Ev_Pinza_Cer        | Evento: pinza cerrada confirmada                       | I0.1                      |
| M2.3    | Ev_CilL_Ext(Origen) | Evento: cil largo extendido (carro en ORIGEN)          | I0.2                      |
| M2.4    | Ev_CilL_Ret(Prensa) | Evento: cil largo retraido (carro en PRENSA)           | I0.3                      |
| M2.5    | Ev_CilD_Ext(Abajo)  | Evento: cil delgado extendido (prensa ABAJO)           | I0.5                      |
| M2.6    | Ev_CilD_Ret(Arriba) | Evento: cil delgado retraido (prensa ARRIBA)           | I0.4                      |

---

## 6. Notas de Implementacion

- **I1.4 (Seta_Emerg)** es de tipo NC (normalmente cerrado). En estado normal I1.4=1. Al activar emergencia I1.4=0.
- **I1.2 (Btn_Paro)** esta definido en el CSV de simbolos pero no tiene logica asignada en el programa AWL actual.
- **Q0.7 (Lamp_Amarilla)** esta definida en el CSV pero no es activada por ninguna red del programa AWL actual.
- **Q0.1** no esta asignado en este modulo (reservado para otras unidades o futuras expansiones).
