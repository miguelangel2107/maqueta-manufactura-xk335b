# Configuración del variador Powtran PI9100A

Variador de la cinta de la unidad de Selección (PLC 5, CPU 224XP-CN).

- **Comunicación:** Modbus RTU por el puerto 1 del PLC, RS-485 a 19 200 bps, 8-N-1.
- **Mando analógico:** salida `AQW0` (0-10 V) del PLC.

## 1. Conexiones

```text
S7-200 CPU 224XP-CN                    Powtran PI9100A
-------------------                    ---------------
Puerto 1, pin 3 (B)  ----------------  485+
Puerto 1, pin 8 (A)  ----------------  485-
Puerto 1, pin 5 (GND, malla) --------  GND

AQW0 (0-10 V)        ----------------  AI1
M (masa analógica)   ----------------  GND

Q0.0 (marcha)        ----------------  DI1 (FWD)
Q0.1 (sentido)       ----------------  DI2 (REV)
1M (común 24 V)      ----------------  COM
```

## 2. Parámetros que se cargan desde el teclado

Se configuran una sola vez desde el panel del variador, antes de conectar el bus. Sin ellos el variador no responde al PLC o da errores de comunicación.

1. Alimentar el variador con 220 VAC en `R`, `S`, `T`.
2. Pulsar `PRG/ESC` para entrar a los grupos de parámetros.
3. Con `▲` / `▼` ir al grupo `F9` (comunicaciones) y pulsar `DATA/ENT`.
4. Cargar:

| Parámetro | Valor | Significado |
|---|---|---|
| `F9.00` | `6006` | La última cifra es la velocidad: `6` = 19 200 bps (`5` sería 9600). Las demás cifras se dejan como vienen (`600x`). |
| `F9.01` | `3` | Formato 8-N-1. |
| `F9.02` | `1` | Dirección Modbus del variador. |
| `F9.03` | `5` | Retardo de respuesta: 5 ms. |
| `F9.04` | `0.0` | Tiempo de espera de comunicación deshabilitado, para que no salte `Err.16` cuando el PLC deja de consultar a propósito. |
| `F9.05` | `1` | Modbus RTU estándar. Con `0` el variador agrega un byte propio en la respuesta. |
| `F0.19` | `50.00` | Frecuencia máxima de salida: 50 Hz. |
| `F0.20` | `50.00` | Límite superior de frecuencia: 50 Hz. |
| `F0.13` | `1.0` | Tiempo de aceleración: 1 s. |
| `F0.14` | `1.0` | Tiempo de desaceleración: 1 s. |

5. Pulsar `PRG/ESC` hasta volver a la pantalla de monitoreo (`d-00`).

## 3. Modo Modbus y modo analógico

El programa permite manejar el variador de dos formas. El modo se elige con `VW308` en el PLC 5.

| Modo | `F0.03` (fuente de frecuencia) | `F0.11` (fuente de comandos) | Cómo se maneja |
|---|:---:|:---:|---|
| 2, Modbus (por defecto), `VW308 = 2` | `9` (comunicación) | `2` (comunicación) | Consigna en `0x1000` (44097): `6000` = 30.0 Hz. Marcha y paro en `0x2000` (48193): `1` marcha adelante, `6` paro con rampa, `5` paro libre. |
| 1, analógico / digital, `VW308 = 1` | `2` (entrada AI1 0-10 V) | `1` (bornes DI) | Consigna por `AQW0` (19200 = 30.0 Hz). Marcha con `Q0.0` (DI1). El puerto 1 solo lee datos. |

`F0.03` y `F0.11` se escriben en las direcciones de RAM `0x0003` (40004) y `0x000B` (40012). Según el manual, el número del parámetro se toma en decimal y se escribe en hexadecimal (`F3.12` → `F30C`). Una versión anterior del programa escribía en `0x0011` (40018), que es `F0.17`: el variador respondía con excepción y la fuente de comandos nunca pasaba a comunicación.

En el modo analógico el PLC 5 sigue leyendo por Modbus la frecuencia real (`0x1001`), la tensión del bus DC (`0x1002`) y la corriente (`0x1004`), y las envía a Transporte y al SCADA. Así la supervisión no depende del modo.

## 4. Registros Modbus del PI9100A

### 4.1 Consigna y comando (escritura, funciones `0x06` / `0x10`)

| Hex | Decimal | Tipo | Valores | Función |
|:---:|:---:|:---:|:---:|---|
| `0x1000` | 4096 | INT16 | −10000 a 10000 | Consigna de frecuencia en porcentaje de `F0.19`: `10000` = 100 % = 50 Hz, `6000` = 30 Hz. |
| `0x2000` | 8192 | WORD | 1, 2, 5, 6 | Comando: `1` marcha adelante, `2` marcha atrás, `5` paro libre, `6` paro con rampa (1 s). |

### 4.2 Rampas en RAM

El variador guarda en EEPROM cada parámetro que se modifica, y la EEPROM soporta unas 100 000 escrituras. Si el PLC cambia las rampas seguido, conviene escribirlas en RAM: se reemplaza la `F` inicial de la dirección por `0`.

| Parámetro | Dirección EEPROM | Dirección RAM | Resolución | Ejemplo |
|:---:|:---:|:---:|:---:|---|
| `F0.13` aceleración | `0xF00D` | `0x000D` (13) | 0.1 s | `10` = 1.0 s |
| `F0.14` desaceleración | `0xF00E` | `0x000E` (14) | 0.1 s | `10` = 1.0 s |

### 4.3 Lectura de datos (función `0x03`)

El PLC 5 lee estos registros cíclicamente con `MBUS_MSG` por el puerto 1 y los pasa a la red PPI y al SCADA.

| Hex | Decimal | Registro Modbus | Variable PLC 5 | Escala | Dato |
|:---:|:---:|:---:|:---:|:---:|---|
| `0x1001` | 4097 | 44098 | `VW400` | 0.01 Hz (`3000` = 30.00 Hz) | Frecuencia de salida |
| `0x1002` | 4098 | 44099 | `VW402` | 0.1 V (`3100` = 310.0 V) | Tensión del bus DC |
| `0x1003` | 4099 | 44100 | `VW404` | 0.1 V (`2200` = 220.0 V) | Tensión de salida al motor |
| `0x1004` | 4100 | 44101 | `VW406` | 0.01 A (`125` = 1.25 A) | Corriente del motor |
| `0x1007` | 4103 | 44104 | `VW408` | 1 rpm (`1420` = 1420 rpm) | Velocidad estimada |
| `0x1008` | 4104 | 44105 | `VW410` | Bits | Estado de las entradas DI |

## 5. Escala de la salida analógica `AQW0`

- `AQW0` va de 0 a 32000 para 0 a 10 V.
- En `AI1` del variador, 0 V = 0 Hz y 10 V = 50 Hz (`F0.19`).

$$\text{AQW0} = \frac{f\ (\text{Hz})}{50} \times 32000$$

| Frecuencia | AQW0 |
|---:|---:|
| 10 Hz | 6 400 |
| 20 Hz | 12 800 |
| 30 Hz (velocidad de trabajo) | 19 200 |
| 40 Hz | 25 600 |
| 50 Hz (máxima) | 32 000 |
