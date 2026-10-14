# Unidad 4: Procesamiento

Sujeta la pieza ensamblada, la lleva bajo la prensa y la prensa dos veces.

- **CPU:** S7-200 CPU 224CN (un puerto RS-485).
- **Puerto 0:** esclavo PPI a 19 200 bps, dirección 4.

## 1. Entradas digitales

| Dirección | Tipo | Símbolo | Sensor | Función |
|---|---|---|---|---|
| I0.0 | DI | `Sens_Pres_Mord` | Fotoeléctrico | Pieza en la mordaza. |
| I0.1 | DI | `Mordaza_Cerrada` | Reed | Mordaza cerrada. |
| I0.2 | DI | `Carro_Origen` | Reed | Carro en el origen (donde se entrega y recoge la pieza). |
| I0.3 | DI | `Carro_Prensa` | Reed | Carro bajo la prensa. |
| I0.4 | DI | `Prensa_Arriba` | Reed | Cilindro de la prensa arriba. |
| I0.5 | DI | `Prensa_Abajo` | Reed | Cilindro de la prensa abajo (prensando). |
| I1.2 | DI | `Btn_Paro (SB2)` | NA | Pausa / reset en manual. |
| I1.3 | DI | `Btn_Marcha (SB1)` | NA | Marcha / avance de paso. |
| I1.4 | DI | `Seta_Emerg (QS)` | NC | Seta de emergencia. Reposo = `1`, accionada = `0`. |
| I1.5 | DI | `Selector (SA1)` | 2 posiciones | `1` = automático, `0` = manual / diagnóstico. |

## 2. Salidas digitales

| Dirección | Tipo | Símbolo | Función |
|---|---|---|---|
| Q0.0 | DO | `V_Mordaza` | Mordaza: `1` = cerrar, `0` = abrir. |
| Q0.2 | DO | `V_Carro_Avance` | Carro: `1` = avanzar bajo la prensa, `0` = volver al origen. |
| Q0.3 | DO | `V_Prensa_Baja` | Prensa: `1` = bajar, `0` = subir. |
| Q0.7 | DO | `Lamp_Amarilla` | HL2: manual en espera, pausa o aviso. |
| Q1.0 | DO | `Lamp_Verde` | HL1: ciclo automático en marcha. |
| Q1.1 | DO | `Lamp_Roja` | HL3: seta QS o atasco. |

## 3. Funcionamiento

**Reposo:** carro en el origen (`I0.2 = 1`), prensa arriba (`I0.4 = 1`) y mordaza abierta (`I0.1 = 0`).

**Ciclo** (con orden de inicio y pieza en la mordaza, `I0.0 = 1`):

1. La mordaza se cierra (`Q0.0 = 1`, confirma `I0.1`).
2. El carro avanza bajo la prensa (`Q0.2 = 1`, confirma `I0.3`).
3. Primer golpe: la prensa baja (`Q0.3 = 1` hasta `I0.5`), se mantiene 500 ms y sube (`Q0.3 = 0` hasta `I0.4`).
4. Segundo golpe: igual que el primero.
5. El carro vuelve al origen (`Q0.2 = 0`, confirma `I0.2`).
6. La mordaza se abre (`Q0.0 = 0`, `I0.1 = 0`).
7. La estación pone `STAT_DONE = 1` en la red PPI y espera que Transporte retire la pieza.
