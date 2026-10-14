# Unidad 3: Ensamblaje

Coloca un núcleo dentro de la pieza base y detecta si la pieza es negra.

- **CPU:** S7-200 CPU 226CN (dos puertos RS-485).
- **Puerto 0:** esclavo PPI a 19 200 bps, dirección 3.

## 1. Entradas digitales

| Dirección | Tipo | Símbolo | Sensor | Función |
|---|---|---|---|---|
| I0.0 | DI | `Sens_Silo_Bajo` | Fotoeléctrico | Nivel bajo en el silo de núcleos. |
| I0.1 | DI | `Sens_Silo_Alto` | Fotoeléctrico | Nivel alto en el silo de núcleos. |
| I0.2 | DI | `Sens_Nido_Silo` | Fotoeléctrico | Núcleo en el nido del plato que está bajo el silo. El sensor es fijo y el plato tiene dos nidos. |
| I0.3 | DI | `Sens_Nido_Pinza` | Fotoeléctrico | Núcleo en el nido del plato que está bajo la pinza, listo para tomar (sensor fijo). |
| I0.4 | DI | `Sens_Fibra_Omron` | Fibra Omron E3X-NA11 | Sensor reflectivo en la cuna de ensamble: `1` = blanca o metálica, `0` = negra. |
| I0.5 | DI | `CilSup_Ext` | Reed | Cilindro retenedor superior extendido. |
| I0.6 | DI | `CilSup_Ret` | Reed | Cilindro retenedor superior retraído (reposo). |
| I0.7 | DI | `CilInf_Ext` | Reed | Cilindro liberador inferior extendido (reposo). |
| I1.0 | DI | `CilInf_Ret` | Reed | Cilindro liberador inferior retraído (deja caer el núcleo). |
| I1.1 | DI | `Plato_Pos_A` | Reed | Plato en la posición de `Q0.2 = 0`. Comprobado en la planta el 12-10-2026. |
| I1.2 | DI | `Plato_Pos_B` | Reed | Plato girado 180°, posición de `Q0.2 = 1`. Comprobado en la planta el 12-10-2026. |
| I1.3 | DI | `Pinza_Cerrada` | Reed | Único sensor de la pinza (cerrada). Con el núcleo dentro a veces no se activa, por eso el programa confirma el cierre por tiempo y usa este sensor solo para medir el Δt. |
| I1.4 | DI | `PickVert_Abajo` | Reed | Manipulador vertical abajo. |
| I1.5 | DI | `PickVert_Arriba` | Reed | Manipulador vertical arriba (reposo). |
| I1.6 | DI | `PickHoriz_Atras` | Reed | Manipulador horizontal atrás, sobre el plato (reposo). |
| I1.7 | DI | `PickHoriz_Adel` | Reed | Manipulador horizontal adelante, sobre la cuna de ensamble. |
| I2.4 | DI | `Btn_Paro (SB2)` | NA | Pausa / reset en manual. |
| I2.5 | DI | `Btn_Marcha (SB1)` | NA | Marcha / avance de paso. |
| I2.6 | DI | `Seta_Emerg (QS)` | NC | Seta de emergencia. Reposo = `1`, accionada = `0`. |
| I2.7 | DI | `Selector (SA1)` | 2 posiciones | `1` = automático, `0` = manual / diagnóstico. |

## 2. Salidas digitales

| Dirección | Tipo | Símbolo | Función |
|---|---|---|---|
| Q0.0 | DO | `V_Cil_Inf_Base` | Cilindro inferior del silo. Las mangueras están invertidas: `0` = extendido, `1` = retraer. |
| Q0.1 | DO | `V_Cil_Sup_Reten` | Cilindro retenedor superior: `0` = retraído, `1` = extender. |
| Q0.2 | DO | `V_Plato_Giro` | Plato de dos nidos, uno en cada extremo: `1` = posición `I1.2`, `0` = posición `I1.1`. Ninguna de las dos es reposo, así que las alarmas no cortan esta salida. |
| Q0.3 | DO | `V_Pinza_Pick` | Pinza: `1` = cerrar, `0` = abrir. |
| Q0.4 | DO | `V_Vert_Pick` | Cilindro vertical: `1` = bajar, `0` = subir. |
| Q0.5 | DO | `V_Horiz_Pick` | Cilindro horizontal: `1` = adelante (cuna), `0` = atrás (plato). |
| Q0.6 | DO | `Baliza_Planta_Roja` | Baliza grande de la planta. Fija: alarma en la celda. Intermitente: seta QS en alguna estación o PLC 1 sin comunicación. |
| Q0.7 | DO | `Baliza_Planta_Amarilla` | Baliza grande. Fija: celda detenida o Transporte en manual. Intermitente: pausa, fuga o silo vacío. |
| Q1.0 | DO | `Baliza_Planta_Verde` | Baliza grande: celda en automático y sin alarmas. |
| Q1.5 | DO | `Foco_Amarillo` | HL2. Fijo: automático sin marcha o manual sin nada pendiente. 2 Hz: en manual, pulsar SB1. 1 Hz: espera de núcleo, silo vacío o fuga. |
| Q1.6 | DO | `Foco_Verde` | HL1: automático en marcha o manual con un ciclo en curso. |
| Q1.7 | DO | `Foco_Rojo` | HL3: seta QS o alarma (atasco, el núcleo no cayó o no llegó bajo la pinza). |

Las salidas Q0.6, Q0.7 y Q1.0 manejan la baliza general de toda la planta; las controla este PLC.
