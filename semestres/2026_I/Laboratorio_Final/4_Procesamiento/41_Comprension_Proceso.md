# Unidad de Procesamiento - XK335B
## Comprension del Proceso

---

## 1. Funcion General

La Unidad de Procesamiento realiza una operacion de prensado (mecanizado por compresion) sobre una pieza que es colocada en la estacion de origen. El ciclo comprende el agarre de la pieza, su traslado hasta la prensa, el descenso y ascenso de la prensa, y el retorno del carro a la posicion de origen.

---

## 2. Mecanismo Fisico

### 2.1 Pinza de Dedo (Sujecion)
- Actuador: cilindro de dedo / pinza neumatica.
- Valvula de control: Q0.0 (V_Pinza).
- Sensor de confirmacion: I0.1 (Pinza_Cerrada).
- Funcion: aferrar la pieza durante todo el ciclo de traslado y prensado.

### 2.2 Carro Deslizante (Traslacion)
- Actuador: cilindro largo neumatico de doble efecto.
- Valvula de control: Q0.2 (V_Cil_Lrg).
- Sensor posicion ORIGEN (cil extendido): I0.2 (Cil_Lrg_Ext).
- Sensor posicion PRENSA (cil retraido): I0.3 (Cil_Lrg_Ret).
- Funcion: desplazar la pieza sujeta desde la posicion de origen hasta la prensa y retornarla.
- Logica de movimiento:
  - Q0.2 inactivo -> cil largo extiende -> carro en ORIGEN.
  - Q0.2 activo   -> cil largo retrae  -> carro se desplaza hacia PRENSA.

### 2.3 Prensa (Mecanizado)
- Actuador: cilindro delgado neumatico de doble efecto.
- Valvula de control: Q0.3 (V_Cil_Del).
- Sensor posicion ARRIBA (cil retraido): I0.4 (Cil_Del_Ret).
- Sensor posicion ABAJO (cil extendido): I0.5 (Cil_Del_Ext).
- Funcion: descender sobre la pieza para realizar la operacion de prensado y luego retornar a posicion de reposo.
- Logica de movimiento:
  - Q0.3 inactivo -> cil delgado retrae -> prensa ARRIBA.
  - Q0.3 activo   -> cil delgado extiende -> prensa ABAJO (prensando).

### 2.4 Sensor de Presencia de Pieza
- Sensor: I0.0 (Pos_Pieza), tipo fotoelectrico.
- Funcion: detectar que hay una pieza en la estacion de origen antes de iniciar el ciclo.

---

## 3. Secuencia Logica del Ciclo (6 Plazas, 6 Transiciones)

La secuencia esta implementada como una Red de Petri CIPN (Control Interpreted Petri Net) con marcado inicial en P0.

### P0 - Reposo
- Estado: sistema en espera, pinza abierta, carro en origen, prensa arriba.
- Salidas activas: ninguna (Q0.0=0, Q0.2=0, Q0.3=0).
- Indicador: Lamp_Roja (Q1.1) si no hay pieza.
- Condicion de avance (T0): Btn_Marcha (I1.3) AND Seta_Emerg OK (I1.4) AND Pieza presente (I0.0).

### P1 - Sujecion
- Estado: pinza cierra sobre la pieza. El carro permanece en ORIGEN (I0.2=1).
- Salidas activas: Q0.0 (V_Pinza), Q1.0 (Lamp_Verde).
- Condicion de avance (T1): Pinza_Cerrada confirmada (I0.1).

### P2 - Traslacion hacia Prensa
- Estado: pinza retiene la pieza, cil largo retrae, carro se desplaza hacia la prensa.
- Salidas activas: Q0.0 (V_Pinza), Q0.2 (V_Cil_Lrg), Q1.0 (Lamp_Verde).
- Condicion de avance (T2): Carro llego a prensa, Cil_Lrg retraido (I0.3).

### P3 - Prensado Baja
- Estado: carro en prensa, prensa desciende sobre la pieza.
- Salidas activas: Q0.0 (V_Pinza), Q0.2 (V_Cil_Lrg), Q0.3 (V_Cil_Del), Q1.0 (Lamp_Verde).
- Condicion de avance (T3): Prensa abajo, Cil_Del extendido (I0.5).

### P4 - Prensado Sube
- Estado: prensado completado, prensa asciende, carro permanece en posicion de prensa.
- Salidas activas: Q0.0 (V_Pinza), Q0.2 (V_Cil_Lrg), Q1.0 (Lamp_Verde).
- Nota: Q0.3 se desactiva al salir de P3, el cil delgado retrae.
- Condicion de avance (T4): Prensa arriba, Cil_Del retraido (I0.4).

### P5 - Traslacion hacia Origen
- Estado: prensa arriba, cil largo extiende, carro con pieza retorna a origen.
- Salidas activas: Q0.0 (V_Pinza), Q1.0 (Lamp_Verde).
- Nota: Q0.2 se desactiva al salir de P4, el cil largo extiende.
- Condicion de avance (T5): Carro en origen, Cil_Lrg extendido (I0.2).

### Retorno a P0
- Al disparar T5: pinza abre (Q0.0 inactivo), ciclo completado.
- El sistema queda listo para el siguiente ciclo si hay pieza y se pulsa marcha.

---

## 4. Resumen de Sensores

| Address | Simbolo        | Descripcion                              |
|---------|----------------|------------------------------------------|
| I0.0    | Pos_Pieza      | Sensor fotoelectrico, pieza en base      |
| I0.1    | Pinza_Cerrada  | Sensor confirma pinza cerrada            |
| I0.2    | Cil_Lrg_Ext    | Cil largo extendido = carro en ORIGEN    |
| I0.3    | Cil_Lrg_Ret    | Cil largo retraido = carro en PRENSA     |
| I0.4    | Cil_Del_Ret    | Cil delgado retraido = prensa ARRIBA     |
| I0.5    | Cil_Del_Ext    | Cil delgado extendido = prensa ABAJO     |
| I1.2    | Btn_Paro       | Pulsador rojo (definido en CSV, no conectado en AWL) |
| I1.3    | Btn_Marcha     | Pulsador verde                           |
| I1.4    | Seta_Emerg     | Seta de emergencia (NC, normalmente 1)   |
| I1.5    | Selector_Rot   | Selector rotativo                        |

---

## 5. Resumen de Actuadores

| Address | Simbolo      | Descripcion                                   |
|---------|--------------|-----------------------------------------------|
| Q0.0    | V_Pinza      | Valvula cilindro dedo/pinza (cierra pinza)    |
| Q0.2    | V_Cil_Lrg   | Valvula cil largo (retrae = traslada a prensa) |
| Q0.3    | V_Cil_Del   | Valvula cil delgado (extiende = prensa baja)  |
| Q0.7    | Lamp_Amarilla| Lampara amarilla (no usada en logica actual)  |
| Q1.0    | Lamp_Verde   | Lampara verde (ciclo activo)                  |
| Q1.1    | Lamp_Roja    | Lampara roja (reposo sin pieza o emergencia)  |
