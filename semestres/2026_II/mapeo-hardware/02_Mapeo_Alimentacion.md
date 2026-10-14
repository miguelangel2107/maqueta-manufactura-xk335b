# Unidad 2: Alimentación

Entrega una pieza base a la vez desde el silo y detecta si la base es metálica o de plástico.

- **CPU:** S7-200 CPU 224CN (un puerto RS-485).
- **Puerto 0:** esclavo PPI a 19 200 bps, dirección 2.

## 1. Entradas digitales

| Dirección | Tipo | Símbolo | Sensor | Función |
|---|---|---|---|---|
| I0.0 | DI | `CilSuj_Ext` | Reed | Cilindro sujetador extendido (retiene la columna). |
| I0.1 | DI | `CilSuj_Ret` | Reed | Cilindro sujetador retraído (la columna puede bajar). |
| I0.2 | DI | `CilEmp_Ext` | Reed | Cilindro empujador extendido (pieza expulsada). |
| I0.3 | DI | `CilEmp_Ret` | Reed | Cilindro empujador retraído (reposo). |
| I0.4 | DI | `Sens_Pres_Cuna` | Óptico reflectivo | Pieza en la cuna de salida. |
| I0.5 | DI | `Sens_Silo_Alto` | Fotoeléctrico | Nivel alto en el silo (3 piezas o más). |
| I0.6 | DI | `Sens_Silo_Bajo` | Fotoeléctrico | Hay pieza en la base de la columna. |
| I0.7 | DI | `Sens_Inductivo` | Inductivo | Material de la base: `1` = metálica, `0` = plástico. |
| I1.2 | DI | `Btn_Paro (SB2)` | NA | Pausa / reset en manual. Reposo = `0`, accionado = `1`. |
| I1.3 | DI | `Btn_Marcha (SB1)` | NA | Marcha / avance de paso. Reposo = `0`, accionado = `1`. |
| I1.4 | DI | `Seta_Emerg (QS)` | NC | Seta de emergencia. Reposo = `1`, accionada = `0`. |
| I1.5 | DI | `Selector (SA1)` | 2 posiciones | `1` = automático, `0` = manual / diagnóstico. |

## 2. Salidas digitales

| Dirección | Tipo | Símbolo | Función |
|---|---|---|---|
| Q0.0 | DO | `V_Cil_Sujetador` | Electroválvula monoestable del cilindro sujetador (retiene la columna). |
| Q0.1 | DO | `V_Cil_Empujador` | Electroválvula monoestable del cilindro empujador (lleva la pieza a la cuna). |
| Q0.7 | DO | `Lamp_Amarilla (HL2)` | Manual en espera, pausa o aviso. |
| Q1.0 | DO | `Lamp_Verde (HL1)` | Ciclo automático en marcha. |
| Q1.1 | DO | `Lamp_Roja (HL3)` | Seta QS, atasco o silo vacío. |

## 3. Funcionamiento

**Reposo:** sujetador retraído (`I0.1 = 1`), empujador retraído (`I0.3 = 1`) y piezas en el silo (`I0.6 = 1`).

**Ciclo:**

1. El sujetador se extiende (`Q0.0 = 1`, confirma `I0.0`) y retiene la segunda pieza de la columna.
2. El empujador se extiende (`Q0.1 = 1`, confirma `I0.2`) y lleva la pieza de abajo a la cuna (`I0.4 = 1`).
3. Cuando el carro de Transporte retira la pieza, el empujador se retrae (`Q0.1 = 0`, confirma `I0.3`).
4. El sujetador se retrae (`Q0.0 = 0`, confirma `I0.1`) y la columna baja por gravedad.
