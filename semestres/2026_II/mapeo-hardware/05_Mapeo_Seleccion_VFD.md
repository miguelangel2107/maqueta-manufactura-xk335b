# Unidad 5: Selección

Cinta con variador de frecuencia que identifica cada pieza y la desvía a su rampa.

- **CPU:** S7-200 CPU 224XP-CN (dos puertos RS-485 y E/S analógicas).
- **Puerto 0:** esclavo PPI a 19 200 bps, dirección 5.
- **Puerto 1:** maestro Modbus RTU (19 200 bps, 8-N-1) conectado al RS-485 del variador Powtran PI9100A.

## 1. Entradas digitales

| Dirección | Tipo | Símbolo | Sensor | Función |
|---|---|---|---|---|
| I0.0 | DI (HSC0) | `Enc_Fase_A` | Encoder | Encoder de la cinta, fase A. |
| I0.1 | DI (HSC0) | `Enc_Fase_B` | Encoder | Encoder de la cinta, fase B. |
| I0.2 | DI (HSC0) | `Enc_Fase_Z` | Encoder | Encoder de la cinta, fase Z (una vez por vuelta). |
| I0.3 | DI | `Sens_Pres_Entrada` | Fotoeléctrico reflectivo | Pieza en la entrada de la cinta (la deja el carro de Transporte). |
| I0.4 | DI | `Fibra_Optica_Vert` | Fibra óptica difusa (NA) | Sensor vertical a 10 cm de la entrada: mira el núcleo. |
| I0.5 | DI | `Sens_Induc_Lat` | Inductivo PNP (NA) | Sensor lateral a 10 cm de la entrada: detecta base metálica. |
| I0.7 | DI | `Cil_Desv1_Ext` | Reed (NA) | Cilindro desviador de la rampa 1 extendido. |
| I1.0 | DI | `Cil_Desv2_Ext` | Reed (NA) | Cilindro desviador de la rampa 2 extendido. |
| I1.1 | DI | `Cil_Desv3_Ext` | Reed (NA) | Cilindro desviador de la rampa 3 extendido. |
| I1.2 | DI | `Btn_Paro (SB2)` | NA | Pausa. Reposo = `0`, accionado = `1`. |
| I1.3 | DI | `Btn_Marcha (SB1)` | NA | Marcha / continuar tras pausa. Reposo = `0`, accionado = `1`. |
| I1.4 | DI | `Seta_Emerg (QS)` | NC | Seta de emergencia. Reposo = `1` (24 V), accionada = `0`. |
| I1.5 | DI | `Selector (SA1)` | 2 posiciones | `1` = automático, `0` = manual / diagnóstico. |

Los tres sensores capacitivos del final de las rampas no están en este PLC porque no quedan entradas libres. Están en `I2.0`, `I2.1` e `I2.2` del PLC 1 (Transporte), que publica su estado en la red PPI.

## 2. Salidas

| Dirección | Tipo | Símbolo | Función |
|---|---|---|---|
| Q0.0 | DO | `Marcha_VFD_DI1` | Marcha del variador (borne DI1). |
| Q0.1 | DO | `Sentido_VFD_DI2` | Sentido de giro del variador (borne DI2). |
| Q0.4 | DO | `Desviador_Carril1` | Electroválvula del desviador de la rampa 1. |
| Q0.5 | DO | `Desviador_Carril2` | Electroválvula del desviador de la rampa 2. |
| Q0.6 | DO | `Desviador_Carril3` | Electroválvula del desviador de la rampa 3. |
| Q0.7 | DO | `HL2_Amarilla` | Pausa o espera en la rampa. |
| Q1.0 | DO | `HL1_Verde` | Cinta y clasificación en marcha. |
| Q1.1 | DO | `HL3_Roja` | Seta QS, falla del variador o atasco. |
| AQW0 | AO | `Consigna_VFD_AI1` | Consigna de velocidad, 0-10 V (0 a 32000), al borne `AI1` del variador. |

## 3. Funcionamiento

**Identificación de la pieza.** Cuando el carro deja la pieza en la cinta (`I0.3 = 1`), la cinta arranca con `Q0.0` y la velocidad de `AQW0`. A 10 cm de la entrada la pieza pasa por los dos sensores sin detenerse:

- `I0.5` (inductivo lateral): base metálica (`1`) o de plástico (`0`).
- `I0.4` (fibra vertical): núcleo claro o metálico (`1`) o negro (`0`).

**Rampas.**

| Rampa | Desviador | Pieza |
|---|---|---|
| 1 | `Q0.4` | Tipo 1: base metálica + núcleo metálico |
| 2 | `Q0.5` | Tipo 2: base blanca + núcleo de plástico |
| 3 | `Q0.6` | Tipo 3: base blanca + núcleo metálico |

El desviador se activa según la cuenta del encoder en `HSC0`, para que empuje la pieza justo frente a su rampa.

**Variador.** La marcha y el sentido se mandan con `Q0.0` y `Q0.1`, y la velocidad con `AQW0` (0-10 V a `AI1`). Aparte, el puerto 1 consulta por Modbus RTU la tensión del bus DC, la corriente y la frecuencia real del motor.
