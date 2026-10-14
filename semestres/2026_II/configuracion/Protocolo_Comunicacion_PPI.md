# Comunicación entre PLC por la red PPI

Los seis PLC de la planta se comunican por un bus RS-485 con protocolo PPI de Siemens. Todo se programa en AWL con `NETR` y `NETW`, sin usar el asistente de Micro/WIN.

## 1. Red física

- Velocidad: 19 200 bps en el bloque de sistema de todos los PLC.
- Formato: 8 bits, paridad par, 1 bit de parada (8-E-1, el estándar de PPI).
- Cableado en cadena, de un PLC al siguiente:
  - Un extremo: PLC 1 (puerto 1), terminación de 120 Ω en ON.
  - PLC 2, 3, 4 y 5: terminación en OFF.
  - Otro extremo: PLC 6 (puerto 0), terminación de 120 Ω en ON.

```text
======================= BUS PPI RS-485 (19 200 bps) =======================
   |            |            |            |            |            |
 Puerto 1     Puerto 0     Puerto 0     Puerto 0     Puerto 0     Puerto 0
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+
|  PLC 1   | |  PLC 2   | |  PLC 3   | |  PLC 4   | |  PLC 5   | |  PLC 6   |
|Transporte| |Alimentac.| |Ensamblaje| |Procesam. | |Selección | |Brazo 4DOF|
|CPU 226CN | |CPU 224CN | |CPU 226CN | |CPU 224CN | |CPU 224XP | |CPU 224CN |
| Dir. 1   | | Dir. 2   | | Dir. 3   | | Dir. 4   | | Dir. 5   | | Dir. 6   |
| [TER ON] | |[TER OFF] | |[TER OFF] | |[TER OFF] | |[TER OFF] | | [TER ON] |
+----+-----+ +----------+ +----------+ +----------+ +----+--+---+ +----------+
     | Puerto 0                                          |  | Puerto 1
     | Modbus esclavo (PC)                               |  | Modbus maestro (variador)
     v                                                   v  v
+------------+                                      +------------+
| SCADA web  |                                      |  Powtran   |
|            |                                      |  PI9100A   |
+------------+                                      +------------+
```

## 2. Direcciones

| PLC | Función en la red | CPU | Dirección | Puerto | Qué hace |
|---|---|---|:---:|:---:|---|
| 1 | Maestro | CPU 226CN | 1 | 1 | Recorre las lecturas y escrituras `NETR` / `NETW` a los demás. |
| 2 | Esclavo | CPU 224CN | 2 | 0 | Entrega la pieza base y detecta el material. |
| 3 | Esclavo | CPU 226CN | 3 | 0 | Ensambla el núcleo (plato de 180° y sensor de fibra). |
| 4 | Esclavo | CPU 224CN | 4 | 0 | Prensa la pieza dos veces. |
| 5 | Esclavo | CPU 224XP-CN | 5 | 0 | Maneja la cinta con el HSC0 y clasifica. |
| 6 | Esclavo | CPU 224CN | 6 | 0 | Brazo 4DOF: homing, recogida y retiro de la pieza de la cinta. |

## 3. Tabla de `NETR` y `NETW`

Cada `NETR` o `NETW` necesita una tabla en memoria V con 7 bytes de encabezado seguidos de los datos:

```text
 +0           +1           +2   +3   +4   +5      +6           +7 ... +(7+N-1)
+------------+------------+---------------------+------------+--------------------+
| Estado     | Dirección  | Puntero remoto      | N.º bytes  | Datos              |
+------------+------------+---------------------+------------+--------------------+
```

1. **Byte 0, estado** (`D A E 0 | código`):
   - Bit 7 (`D`): `1` = terminada.
   - Bit 6 (`A`): `1` = en curso. No indica error; una versión anterior del programa avanzaba con este bit y se saltaba transacciones que todavía no terminaban.
   - Bit 5 (`E`): `1` = terminó con error.
   - Bits 0 a 3, código: `0` sin error, `1` el esclavo no responde, `2` error de recepción (paridad, trama o checksum), `3` fuera de línea (direcciones repetidas), `4` cola llena (más de 8 `NETR`/`NETW` activos), `5` violación de protocolo (el puerto no está como maestro PPI: falta `SMB130 = 2` en el puerto 1), `6` parámetro no válido, `7` el remoto no tiene recursos, `8` error de capa 7, `9` error de mensaje.
2. **Byte 1:** dirección del PLC remoto (2 a 6).
3. **Bytes 2 a 5:** puntero a la memoria V del remoto (por ejemplo `&VB100` o `&VB200`).
4. **Byte 6:** cantidad de bytes (1 a 16). Todos los esclavos reservan `VB100..VB103` y `VB200..VB2xx` solo para la red; sus palabras de paso están en `VW330`/`VW332` (PLC 2 a 5) y `VW320`/`VW322` (PLC 6).
5. **Bytes 7 en adelante:** datos leídos (`NETR`) o datos a escribir (`NETW`).

## 4. Memoria común de los esclavos

Los PLC 2 a 6 usan la misma estructura.

### 4.1 Órdenes del PLC 1 al esclavo (`VB100` a `VB103`)

El PLC 1 las escribe con `NETW` en `&VB100` del esclavo.

| Byte | Nombre | Tipo | Contenido |
|:---:|---|:---:|---|
| VB100 | `CMD_CONTROL` | BYTE | Bit 0 `CMD_START`: marcha de la estación (el PLC 1 lo envía a los nodos 2 a 5 cada vez que se pulsa SB1 de Transporte en automático).<br>Bit 1 `CMD_PAUSE`: pausa por SB2 o desde el SCADA.<br>Bit 2 `CMD_ESTOP`: seta QS accionada.<br>Bit 3 `CMD_ACK_RESET`: rearma la estación si espera rearme; si ya está rearmada solo borra las alarmas, sin volver al paso 0. Se envía con SB1 de Transporte en automático y con el reset del SCADA.<br>Bit 4 `CMD_PIEZA_ENTREGADA`: Transporte dejó la pieza en el nido o en la cinta.<br>Bit 5 `CMD_AUTORIZAR_DOSIF`: permiso para preparar la siguiente pieza.<br>Bit 6 `CMD_RETIRO_CONFIRMADO`: Transporte se llevó la pieza, el nido quedó libre.<br>Bit 7 `CMD_MODO_TEST`: ciclo de prueba de la estación sola. |
| VB101 | `CMD_TIPO_PIEZA` | BYTE | `0` = sin pieza, `1` a `5` = tipo de pieza. |
| VB102 | `CMD_CONSIGNA` | BYTE | PLC 4: tiempo de prensado. PLC 5: frecuencia de la cinta (Hz). PLC 2, 3 y 6: sin uso. |
| VB103 | `CMD_AUX_FLAGS` | BYTE | Banderas auxiliares para el ciclo continuo. |

### 4.2 Estado del esclavo al PLC 1 (`VB200` a `VB203`)

El PLC 1 los lee con `NETR` desde `&VB200` del esclavo.

| Byte | Nombre | Tipo | Contenido |
|:---:|---|:---:|---|
| VB200 | `STAT_GLOBAL` | BYTE | Bit 0 `STAT_READY`: en reposo y lista.<br>Bit 1 `STAT_BUSY`: secuencia en curso.<br>Bit 2 `STAT_DONE`: secuencia terminada, pieza lista.<br>Bit 3 `STAT_ALM_ATASCO`: un cilindro tardó más del tiempo máximo.<br>Bit 4 `STAT_ALM_FUGA`: aviso de posible fuga de aire.<br>Bit 5 `STAT_SILO_EMPTY`: silo vacío (nodos 2 y 3).<br>Bit 6 `STAT_BELT_PERMIT`: solo nodo 6, el brazo ya levantó la pieza de la cinta.<br>Bit 7 `STAT_HOMED`: estación referenciada. |
| VB201 | `STAT_PASO` | BYTE | Paso actual de la secuencia (`0`, `10`, `20`…), para mostrarlo en el SCADA. |
| VB202 | `STAT_INPUTS` | BYTE | Copia de `IB0` (`MOVB IB0, VB202`). |
| VB203 | `STAT_DATA` | BYTE | PLC 2: material de la base (`1` = metal, `0` = plástico).<br>PLC 3: sensor Omron (`1` = blanca/metal, `0` = negra).<br>PLC 5: rampa asignada (1 a 3).<br>PLC 6: eje en movimiento. |

## 5. Tablas en el PLC 1

Las 10 tablas están entre `VB500` y `VB699` del PLC 1, separadas cada 20 bytes (7 de encabezado, 4 de datos y 9 libres):

| Paso | Operación | Nodo | Tabla en PLC 1 | Dirección remota | Bytes | Datos en PLC 1 | Contenido |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 1 | `NETR` | 2 | `VB500` - `VB506` | `&VB200` | 8 | `VB507` - `VB514` | Estado, paso, `IB0`, material, `IB1`, `QB0`, `QB1`, libre |
| 2 | `NETW` | 2 | `VB520` - `VB526` | `&VB100` | 4 | `VB527` - `VB530` | `CMD_AUTORIZAR_DOSIF` (bit 5) y `CMD_RETIRO_CONFIRMADO` (bit 6); cola `VB702` |
| 3 | `NETR` | 3 | `VB540` - `VB546` | `&VB200` | 8 | `VB547` - `VB554` | Estado, paso del ensamble, `IB0`, tipo (1 / 5), `IB1`, `QB0`, `IB2` + paso de preparación, diagnóstico `VB337` |
| 4 | `NETW` | 3 | `VB560` - `VB566` | `&VB100` | 4 | `VB567` - `VB570` | `CMD_PIEZA_ENTREGADA` (bit 4) y `CMD_RETIRO_CONFIRMADO` (bit 6); cola `VB703` |
| 5 | `NETR` | 4 | `VB580` - `VB586` | `&VB200` | 8 | `VB587` - `VB594` | Estado, paso, `IB0`, libre, `IB1`, `QB0`, `QB1`, libre |
| 6 | `NETW` | 4 | `VB600` - `VB606` | `&VB100` | 4 | `VB607` - `VB610` | Inicio del prensado `CMD_PIEZA_ENTREGADA` (bit 4) y retiro (bit 6); cola `VB704` |
| 7 | `NETR` | 5 | `VB620` - `VB626` | `&VB200` | 13 | `VB627` - `VB639` | Estado, `STAT_ROBOT_WAIT` (bit 6), rampa y datos del variador (`VW631` Hz, `VW633` A, `VW635` bus DC, `VB637` modo + bit 5 atrás + bit 6 automático + bit 7 emergencia, `VB638` error), `VB639` = `QB0` |
| 8 | `NETW` | 5 | `VB640` - `VB646` | `&VB100` | 4 | `VB647` - `VB650` | `VB647` control (pieza entregada bit 4, `BELT_PERMIT_RUN` bit 6, emergencia bit 2; cola `VB705`), `VB648` tipo (5 = negra), `VB649` modo del variador pedido, `VB650` sentido de la cinta pedido (0 / 1 adelante / 2 atrás, desde el registro 40008 del SCADA) |
| 9 | `NETR` | 6 | `VB660` - `VB666` | `&VB200` | 4 | `VB667` - `VB670` | READY, BUSY, DONE, `BELT_PERMIT_RUN` (bit 6), HOMED |
| 10 | `NETW` | 6 | `VB680` - `VB686` | `&VB100` | 1 | `VB687` | Orden de recogida `CMD_START` (bit 0) y `CMD_ESTOP` (bit 2); cola `VB706` |

Los nodos 2, 3 y 4 publican además `VB204..VB207` (E/S y diagnóstico) y el nodo 5 `VB212` (`QB0`). El PLC 1 los pasa al SCADA en `VB1200..VB1255` (ver `Mapeo_Memoria_Global.md`, 2.8).

## 6. Secuencia de lecturas y escrituras

Para no llenar la cola del puerto, el PLC 1 hace una transacción a la vez y en orden fijo:

```text
 Paso 1: NETR nodo 2  --> terminada / error / 1 s (T38)
 Paso 2: NETW nodo 2  --> terminada / error / 1 s
 Paso 3: NETR nodo 3  --> terminada / error / 1 s
 Paso 4: NETW nodo 3  --> terminada / error / 1 s
 Paso 5: NETR nodo 4  --> terminada / error / 1 s
 Paso 6: NETW nodo 4  --> terminada / error / 1 s
 Paso 7: NETR nodo 5  --> terminada / error / 1 s
 Paso 8: NETW nodo 5  --> terminada / error / 1 s
 Paso 9: NETR nodo 6  --> terminada / error / 1 s
 Paso 10: NETW nodo 6 --> terminada / error / 1 s
 (vuelve al paso 1)
```

1. **Avance normal:** cada paso lanza su `NETR`/`NETW` una sola vez (bandera `M21.0`) y termina cuando el bit 7 (`D`) o el bit 5 (`E`) del byte de estado pasa a `1`. En los `NETW`, la cola de órdenes `VB70n` se copia a los datos al lanzar y se borra al confirmar, así cada orden se envía una sola vez. Los esclavos actúan por flanco.
2. **Errores y nodos desconectados:** si `E = 1` o se vence el tiempo, el nodo se marca en `VB710` (bit n = nodo n, también en `VW1046` bit 5), se borra el estado leído para no usar datos viejos, las órdenes que no llegaron se vuelven a poner en la cola y se pasa al siguiente paso.
3. **Tiempo máximo:** `T38` = 1 s por transacción. Es un respaldo del tiempo de espera propio del maestro PPI; un valor menor podría cortar transacciones que todavía están en curso y duplicar órdenes.

## 7. Coordinación entre estaciones

### 7.1 Alimentación → Transporte → Ensamblaje

1. Transporte recoge la pieza base en Alimentación. El PLC 2 queda en reposo y todavía no prepara otra pieza.
2. Transporte lleva la base al nido de Ensamblaje (PLC 3).
3. Al abrir la pinza en Ensamblaje, el PLC 1 activa dos órdenes en el mismo ciclo:
   - Al PLC 3: `CMD_PIEZA_ENTREGADA = 1` en `VB567.4`, que inicia el ensamble.
   - Al PLC 2: `CMD_AUTORIZAR_DOSIF = 1` en `VB527.5`, que le permite preparar la siguiente base.
4. El PLC 2 comprueba que el sensor de la cuna `I0.4` esté libre (`0`) y recién mueve sus cilindros.

### 7.2 Pieza negra

1. Con `CMD_PIEZA_ENTREGADA = 1`, el PLC 3 mira el sensor de fibra Omron `I0.4`:
   - `I0.4 = 1` (pieza clara o metálica): coloca el núcleo.
   - `I0.4 = 0` (pieza negra): no coloca núcleo, pone `TIPO_PIEZA = 5` y activa `STAT_DONE = 1`.
2. El PLC 1 lee `STAT_DONE = 1` con el tipo 5, recoge la pieza y la lleva directo a Selección, sin pasar por la prensa.

### 7.3 El brazo libera la cinta (`BELT_PERMIT_RUN`)

1. Cuando una pieza de tipo 4 o 5 llega al final de la cinta (`VW318 = 1800` pulsos), la cinta se detiene.
2. El PLC 1 envía `CMD_START` al PLC 6 (`VB687.0` → `V100.0` del PLC 6).
3. El brazo baja, cierra la garra y sube el eje Y 5000 pulsos.
4. Apenas la pieza deja la cinta, el PLC 6 pone `V200.6 = 1` (`BELT_PERMIT_RUN`).
5. En la siguiente vuelta de la secuencia, el PLC 1 lee esa señal (`VB667.6 = 1`) y le permite al PLC 5 volver a arrancar la cinta, mientras el brazo termina de dejar la pieza en la mesa.
