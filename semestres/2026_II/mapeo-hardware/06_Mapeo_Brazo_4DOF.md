# Unidad 6: Brazo 4DOF

Brazo con motores paso a paso y garra eléctrica, al final de la cinta de Selección.

- **CPU:** S7-200 CPU 224CN.
- **Puerto 0:** esclavo PPI a 19 200 bps, dirección 6.

## 1. Entradas digitales

### 1.1 Sensores y mandos

| Dirección | Tipo | Símbolo | Sensor | Función |
|---|---|---|---|---|
| I0.0 | DI | `Sens_Home_Z` | Inductivo PNP (NA) | Home del eje Z (giro de la base, sentido horario). |
| I0.1 | DI | `Sens_Home_X` | Inductivo PNP (NA) | Home del eje X (brazo recogido). |
| I0.2 | DI | `FC_Limite_X` | Inductivo PNP (NA) | Límite del eje X en el otro extremo (brazo extendido). |
| I0.3 | DI | `Sens_Home_Y` | Inductivo PNP (NA) | Home del eje Y (arriba). |
| I0.4 | DI | `FC_Limite_Y` | Inductivo PNP (NA) | Límite inferior del eje Y. |
| I0.5 | DI | `Selector (SA1)` | 2 posiciones | `1` = automático, `0` = manual / diagnóstico. |
| I0.6 | DI | `Btn_Reset` | NA | Reset y nuevo homing. |
| I0.7 | DI | `Btn_Start_Grip` | NA | Automático: start. Manual: abre o cierra la garra. |

### 1.2 Botonera de movimiento manual

| Dirección | Tipo | Símbolo | Contacto | Función en manual |
|---|---|---|---|---|
| I1.0 | DI | `Jog_Stop_CCW_Z` | NA | En automático: stop. En manual: eje Z antihorario. |
| I1.1 | DI | `Jog_CW_Z` | NA | Eje Z horario (hacia el home). |
| I1.2 | DI | `Jog_X_Fwd` | NA | Eje X adelante. |
| I1.3 | DI | `Jog_X_Rev` | NA | Eje X atrás (hacia el home). |
| I1.4 | DI | `Jog_Y_Down` | NA | Eje Y abajo. |
| I1.5 | DI | `Jog_Y_Up` | NA | Eje Y arriba (hacia el home). |

## 2. Salidas digitales

| Dirección | Tipo | Símbolo | Función |
|---|---|---|---|
| Q0.0 | DO (PTO 0) | `PTO0_Pulsos_Z` | Pulsos para el driver del eje Z. |
| Q0.1 | DO (PTO 1) | `PTO1_Pulsos_XY` | Pulsos compartidos por los drivers de los ejes X e Y. |
| Q0.2 | DO | `Dir_Eje_Z` | Dirección Z: `1` = horario (hacia el home), `0` = antihorario. |
| Q0.3 | DO | `Dir_Eje_X` | Dirección X: `1` = atrás (hacia el home), `0` = adelante. |
| Q0.4 | DO | `Dir_Eje_Y` | Dirección Y: `1` = arriba (hacia el home), `0` = abajo. |
| Q0.5 | DO | `Rele_K1_X` | Relé K1: lleva los pulsos del PTO 1 al driver del eje X. |
| Q0.6 | DO | `Rele_K2_Y` | Relé K2: lleva los pulsos del PTO 1 al driver del eje Y. |
| Q0.7 | DO | `Solenoide_Garra` | Garra: `1` = cerrar, `0` = abrir. |

## 3. Funcionamiento

### 3.1 Motores y garra

Cada eje tiene un motor paso a paso NEMA con reductor y su driver bipolar. La garra es un solenoide en `Q0.7`.

### 3.2 Ejes X e Y con un solo PTO

La CPU 224CN tiene solo dos generadores de pulsos (`Q0.0` y `Q0.1`) y el brazo tiene tres ejes:

- El eje Z usa el PTO 0 (`Q0.0`) con dirección en `Q0.2`.
- Los ejes X e Y comparten el PTO 1 (`Q0.1`), y los relés K1 (`Q0.5`) y K2 (`Q0.6`) eligen a cuál de los dos drivers llegan los pulsos.

Para mover un eje:

- **Eje X:** activar K1 (`Q0.5 = 1`), esperar 50 ms a que se asienten los contactos, fijar la dirección en `Q0.3` y lanzar los pulsos por `Q0.1`.
- **Eje Y:** activar K2 (`Q0.6 = 1`), esperar 50 ms, fijar la dirección en `Q0.4` y lanzar los pulsos por `Q0.1`.

`Q0.5` y `Q0.6` nunca se activan al mismo tiempo; el programa lo impide.

### 3.3 Homing

Al encender o al pulsar `Btn_Reset` (`I0.6`), el brazo busca sus ceros en este orden:

1. Eje X hacia atrás hasta `Sens_Home_X` (`I0.1 = 1`).
2. Eje Z en sentido horario hasta `Sens_Home_Z` (`I0.0 = 1`).
3. Eje Y hacia arriba hasta `Sens_Home_Y` (`I0.3 = 1`) y apertura de la garra.

Cuando termina, se activa `M0.3` (referencia lista) y recién entonces el brazo acepta las órdenes del ciclo automático por PPI.
