# Mapeo general de E/S

Planta XK-335B con el brazo de 4 grados de libertad. Seis PLC S7-200 conectados en un bus RS-485 con protocolo PPI a 19 200 bps.

## 1. Controladores

| PLC | Estación | CPU | Puertos | Puerto 0 | Puerto 1 | Entradas | Salidas | Analógicas |
|---|---|---|---|---|---|---|---|---|
| 1 | Transporte (maestro) | CPU 226CN | 2 | Esclavo Modbus RTU (19.2k, dirección 1) para el SCADA | Maestro PPI (19.2k) hacia los nodos 2 a 6 | `IB0`, `IB1`, `IB2` | `QB0`, `QB1` | — |
| 2 | Alimentación | CPU 224CN | 1 | Esclavo PPI (19.2k, dirección 2) | — | `IB0`, `IB1` | `QB0`, `QB1` | — |
| 3 | Ensamblaje | CPU 226CN | 2 | Esclavo PPI (19.2k, dirección 3) | Libre / diagnóstico | `IB0`, `IB1` | `QB0`, `QB1` | — |
| 4 | Procesamiento | CPU 224CN | 1 | Esclavo PPI (19.2k, dirección 4) | — | `IB0`, `IB1` | `QB0`, `QB1` | — |
| 5 | Selección y variador | CPU 224XP-CN | 2 | Esclavo PPI (19.2k, dirección 5) | Maestro Modbus RTU (19.2k, 8-N-1) hacia el variador Powtran | `IB0`, `IB1` | `QB0`, `QB1` | `AIW0`, `AIW2`, `AQW0` |
| 6 | Brazo 4DOF | CPU 224CN | 1 | Esclavo PPI (19.2k, dirección 6) | — | `IB0`, `IB1` | `QB0` | — |

## 2. Cableado común y casos especiales

### Sensores de fin de rampa conectados al PLC 1

La CPU 224XP-CN de Selección tiene solo 14 entradas (`I0.0` a `I1.5`) y todas están ocupadas por el encoder (HSC0), los sensores de inspección y los finales de carrera de los tres cilindros desviadores. Por eso los tres sensores capacitivos de las rampas están cableados al PLC 1:

| Entrada (PLC 1) | Sensor | Pieza |
|---|---|---|
| `I2.0` | Capacitivo rampa 1 | Tipo 1: base metálica + núcleo metálico |
| `I2.1` | Capacitivo rampa 2 | Tipo 2: base blanca + núcleo plástico |
| `I2.2` | Capacitivo rampa 3 | Tipo 3: base blanca + núcleo metálico |

El PLC 1 los lee directamente y los publica en la red PPI y en el SCADA.

### Mandos de cada estación

| Mando | Contacto | Reposo | Accionado |
|---|---|---|---|
| SB1 (marcha / continuar tras pausa) | NA | `0` (0 V) | `1` (24 V) |
| SB2 (pausa) | NA | `0` (0 V) | `1` (24 V) |
| QS (seta de emergencia) | NC | `1` (24 V) | `0` (0 V) |
| SA1 (selector de modo) | 2 posiciones | `1` = automático | `0` = manual / diagnóstico |

### Balizas

| Lámpara | Significado |
|---|---|
| HL1 verde | Ciclo automático en marcha (fija). |
| HL2 amarilla | Pausa por SB2, estación en espera de pieza o silo con nivel bajo (fija o intermitente según el caso). |
| HL3 roja | Seta QS accionada, alarma de proceso o atasco neumático (fija). |

### Cinta y variador Powtran PI9100A (PLC 5)

- Marcha y sentido con `Q0.0` (DI1) y `Q0.1` (DI2) del variador.
- Consigna de frecuencia por `AQW0` (0-10 V, 0-32000) al borne `AI1`.
- El puerto 1 de la CPU 224XP-CN lee por Modbus RTU la tensión del bus DC, la corriente y la frecuencia del variador.

### Brazo 4DOF (PLC 6)

- Motores paso a paso NEMA comandados por tren de pulsos (PTO).
- Eje Z (giro de la base): PTO 0 en `Q0.0`, dirección en `Q0.2`.
- Ejes X e Y (brazo horizontal y elevación): comparten el PTO 1 (`Q0.1`). Los relés K1 (`Q0.5`) y K2 (`Q0.6`) conmutan los pulsos a uno u otro eje y nunca se activan juntos. Dirección del eje X en `Q0.3` y del eje Y en `Q0.4`.
- Garra: solenoide en `Q0.7`.
