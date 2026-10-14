# Mapa de memoria V y registros Modbus del PLC 1

El PLC 1 (Transporte, CPU 226CN) reúne los datos de toda la planta y los publica para el SCADA por Modbus RTU en el puerto 0.

- Esclavo Modbus RTU con la librería de Micro/WIN (`MBUS_INIT` / `MBUS_SLAVE`).
- Dirección 1, 19 200 bps, 8-N-1.
- `HoldStart = &VB1000`: el registro `40001` es `VW1000`.
- La librería Modbus usa la memoria desde `VB4000`.

Este mapa corresponde a lo que publican y aceptan `SBR_IO_SCAN` y `SBR_MODBUS_SLAVE` en el programa del PLC 1, y es el que usa el SCADA de `scada-web/`. El SCADA lee los 128 registros en dos tramas de 64.

## 1. Áreas de memoria

| Memoria V | Registros | Contenido |
|---|---|---|
| VB500 - VB699 | — (interno) | Descriptores y buffers de la secuencia de lecturas y escrituras PPI (`NETR` / `NETW`) |
| VD720 - VD728 | — (interno) | Copias de los parámetros que se pueden cambiar desde el SCADA |
| VW1000 | 40001 | Mandos del SCADA (pulsos) |
| VD1002 - VW1018 | 40002 - 40010 | Parámetros y pedidos al variador |
| VW1020 - VW1038 | 40011 - 40020 | Estado general y pasos de cada estación |
| VW1040 - VW1056 | 40021 - 40029 | Alarmas y diagnóstico |
| VW1060 - VW1070 | 40031 - 40036 | Tiempos de los cilindros de Transporte (ms) |
| VD1110 - VD1126 | 40056 - 40065 | Cotas del carro y posición actual |
| VW1132 - VW1146 | 40067 - 40074 | Datos del variador (los envía el PLC 5) |
| VW1180 - VW1190 | 40091 - 40096 | Sensores del PLC 1 y contadores de piezas |
| VB1200 - VB1255 | 40101 - 40128 | E/S de Transporte y datos de cada PLC |
| VB4000 - VB4799 | — (interno) | Memoria de la librería Modbus esclavo |

Los registros que no aparecen (40030, 40037 a 40055, 40066, 40075 a 40090, 40097 a 40100) no los escribe el programa ni los usa el SCADA.

## 2. Registros

**Numeración de bits.** El S7-200 guarda las palabras con el byte alto primero. El bit `n` (0 = menos significativo) de `VWxxxx` es `V(xxxx+1).n`: el bit 0 de `40001` es `V1001.0` y el bit 8 es `V1000.0`. Un `VDxxxx` ocupa dos registros, primero la palabra alta.

### 2.1 Mandos y parámetros (SCADA → PLC 1)

| Registro | Memoria | Tipo | Nombre | Descripción |
|---|---|---|---|---|
| 40001 | `VW1000` | WORD | `CMD_SCADA` | Pulsos: el SCADA pone el bit en 1 unos 350 ms y luego en 0. El PLC actúa en el flanco.<br>Bit 0: marcha (igual que SB1 en automático; además envía `CMD_START` y `CMD_ACK_RESET` a los PLC 2 a 5).<br>Bit 1: pausa.<br>Bit 2: reset / rearme (también envía `CMD_ACK_RESET` a los PLC 2 a 5).<br>Bit 3: parar al terminar la pieza en curso.<br>Bit 4: SB1 desde el SCADA (igual que el pulsador).<br>Bit 5: SB2 desde el SCADA.<br>Bit 6: jog a la derecha (solo en manual).<br>Bit 7: jog a la izquierda (solo en manual).<br>Bit 8 (`V1000.0`): poner en cero los contadores `VW1182` a `VW1190`. |
| 40002 - 40003 | `VD1002` | DINT | `PAR_JOG_PULSOS` | Pulsos por cada toque de jog (`VD280`). De 1 a 20000. |
| 40004 - 40005 | `VD1006` | DINT | `PAR_REBOTE_FC` | Retroceso tras tocar el FC derecho al llegar a Selección (`VD288`). De 0 a 10000. |
| 40006 - 40007 | `VD1010` | DINT | `PAR_RETROCESO_HOMING` | Retroceso del homing (`VD240`). De 500 a 20000. |
| 40008 | `VW1014` | WORD | `REQ_SENTIDO_CINTA` | Sentido de la cinta que se pide al PLC 5 (`VB650` → `VB103` del PLC 5): `0` = sin cambio, `1` = adelante, `2` = atrás. Se aplica con la cinta parada. |
| 40009 | `VW1016` | WORD | `REQ_MODO_VFD` | Modo del variador que se pide al PLC 5 (`VB649` → `VB102` del PLC 5): `0` = sin cambio, `1` = analógico, `2` = Modbus. Se aplica con la cinta parada. |
| 40010 | `VW1018` | WORD | `HEARTBEAT_SCADA` | Libre para el SCADA; el PLC no lo usa. |

Cómo se aplican los parámetros (40002 a 40007) y las cotas (40056 a 40063):

1. Si el valor del registro es distinto de su copia interna, el PLC entiende que lo escribió el SCADA.
2. Si está dentro del rango, lo aplica; si no, lo descarta.
3. En el mismo ciclo vuelve a publicar el valor vigente.

Así un valor rechazado vuelve solo a su valor anterior, y un cambio hecho desde la tabla de estado de Micro/WIN (por ejemplo en `VD280`) no lo sobrescribe el SCADA.

### 2.2 Estado general y pasos (PLC 1 → SCADA)

| Registro | Memoria | Tipo | Nombre | Descripción |
|---|---|---|---|---|
| 40011 | `VW1020` | WORD | `STAT_GLOBAL_CELL` | Bit 0 marcha, bit 1 pausa, bit 2 seta QS liberada, bit 3 automático, bit 4 ciclo activo, bit 5 alarma general, bit 6 manual. |
| 40012 | `VW1022` | WORD | `STAT_ESTACIONES_RDY` | Bit 1 Transporte con referencia, bits 2 a 6 `STAT_READY` de los PLC 2 a 6. |
| 40013 | `VW1024` | WORD | `STAT_PASO_TRANSP` | Paso de Transporte (`VW16` en automático, `VW12` en manual). |
| 40014 - 40018 | `VW1026` - `VW1034` | WORD | `STAT_PASO_xx` | Paso de los PLC 2 a 6 (`VB201` de cada uno). |
| 40019 | `VW1036` | WORD | `TIPO_PIEZA_ACTUAL` | `VB33`: `5` = pieza negra (no pasa por la prensa), `0` = se clasifica en la cinta. |
| 40020 | `VW1038` | WORD | `FLAGS_INTERLOCK` | Bit 0 Ensamblaje listo, bit 1 Procesamiento listo, bit 2 Selección lista, bit 3 `BELT_PERMIT_RUN`, bit 4 tarea del brazo. |

### 2.3 Alarmas y diagnóstico

| Registro | Memoria | Tipo | Nombre | Descripción |
|---|---|---|---|---|
| 40021 | `VW1040` | WORD | `ALM_TRANSPORTE` | Byte bajo:<br>Bit 0: atasco o viaje sin terminar (`M4.1`).<br>Bit 1: homing fallido (`M7.2`).<br>Bit 2: final de carrera o cota fuera de rango (`M7.6`).<br>Bit 3: sin referencia (`M7.7`).<br>Bit 4: tiempo de maniobra excedido (`M8.2`).<br>Bit 5: alarma en manual (`M10.7`).<br>Bit 6: el brazo no responde (`M20.3`).<br>Bit 7: fuga (`M4.0`). |
| 40024 | `VW1046` | WORD | `ALM_PROCESO_CELL` | Bit 0 silo de Alimentación vacío, bit 1 silo de núcleos vacío, bit 2 servo sin RDY, bit 3 falla de comunicación con el variador, bit 4 finales de carrera, bit 5 nodo PPI sin respuesta. |
| 40026 | `VW1050` | WORD | `ESTADO_BALIZA_PLANTA` | Byte bajo = `VB37`: bit 0 verde, bit 1 amarilla fija, bit 2 amarilla intermitente, bit 3 roja fija, bit 4 roja intermitente. |
| 40027 | `VW1052` | WORD | `DIAG_ENLACE_BRAZO` | Byte bajo = `VB286` (ver `Documentacion_Funcionamiento.md`, 6.8). |
| 40028 | `VW1054` | WORD | `DIAG_ESPERA_AUTO` | Byte bajo = `VB287` (ver `Documentacion_Funcionamiento.md`, 6.12). |
| 40029 | `VW1056` | WORD | `DIAG_BALIZA_ROJA` | Byte bajo = `VB292`: bit 0 Transporte, bit 1 brazo, bits 2 a 5 atasco en PLC 2 a 5 / variador, bit 6 nodo PPI sin red, bit 7 seta QS. |

### 2.4 Tiempos de los cilindros de Transporte (Δt en ms)

| Registro | Memoria | Origen | Movimiento | Normal | Aviso de fuga | Atasco |
|---|---|---|---|:---:|:---:|:---:|
| 40031 | `VW1060` | `VW20` | Vertical baja | 400 ms | > 550 ms | 1,5 s |
| 40032 | `VW1062` | `VW22` | Vertical sube | 350 ms | > 500 ms | 1,5 s |
| 40033 | `VW1064` | `VW24` | Doble vástago se extiende | 350 ms | > 550 ms | 1,5 s |
| 40034 | `VW1066` | `VW26` | Doble vástago se retrae | 300 ms | > 500 ms | 1,5 s |
| 40035 | `VW1068` | `VW28` | Giro hacia los nidos | 400 ms | > 600 ms | 1,5 s |
| 40036 | `VW1070` | `VW30` | Pinza cierra | 250 ms | > 450 ms | 1,5 s |

Los Δt de las otras estaciones se miden en cada PLC (`VW210` a `VW224`) y no pasan por la red PPI; se ven con Micro/WIN.

### 2.5 Cotas del carro (DINT, pulsos del PTO 0)

Son las cotas del carro de Transporte, no las del encoder de la cinta de Selección (PLC 5, `VW310` a `VW328`).

| Registro | Memoria | Tipo | Nombre | Por defecto | Lugar |
|---|---|---|---|:---:|---|
| 40056 - 40057 | `VD1110` | DINT | `COTA_ALIMENTACION` | 0 (`VD204`) | Sobre el inductivo de home `I0.0` |
| 40058 - 40059 | `VD1114` | DINT | `COTA_PROCESAMIENTO` | 45 500 (`VD208`) | Mordaza de la prensa |
| 40060 - 40061 | `VD1118` | DINT | `COTA_ENSAMBLAJE` | 87 500 (`VD212`) | Nido de Ensamblaje |
| 40062 - 40063 | `VD1122` | DINT | `COTA_SELECCION` | 107 500 (`VD216`) | Entrada de la cinta |
| 40064 - 40065 | `VD1126` | DINT | `POS_ACTUAL_SERVO` | — | Posición actual (`VD250`), solo lectura |

Las cotas que llegan del SCADA deben estar entre `VD226` y `VD222` (−1000 y 116 000).

### 2.6 Datos del variador Powtran PI9100A (enviados por el PLC 5)

| Registro | Memoria | Tipo | Nombre | Unidad | Descripción |
|---|---|---|---|:---:|---|
| 40067 | `VW1132` | WORD | `VFD_FREQ_OUT` | 0.01 Hz | Frecuencia de salida (`0x1001` del variador) |
| 40068 | `VW1134` | WORD | `VFD_BUS_VOLT` | 0.1 V | Tensión del bus DC (`0x1002`) |
| 40069 | `VW1136` | WORD | `VFD_CURRENT` | 0.01 A | Corriente (`0x1004`) |
| 40070 | `VW1138` | WORD | `VFD_STATUS_WORD` | — | `1` = en marcha, `5` = parado |
| 40073 | `VW1144` | WORD | `VFD_CONTROL_MODE` | 1 / 2 | `1` = analógico, `2` = Modbus |
| 40074 | `VW1146` | WORD | `VFD_FAULT_CODE` | — | Código de error Modbus del PLC 5 (`0` = sin falla) |

### 2.7 Sensores del PLC 1 y contadores

| Registro | Memoria | Tipo | Nombre | Descripción |
|---|---|---|---|---|
| 40091 | `VW1180` | WORD | `SENS_FIN_CARRILES` | Bits 0 a 2: `I2.0` a `I2.2` (fin de rampa 1 a 3). Bit 3: `I0.0` home. Bit 4: `I0.1` FC izquierdo. Bit 5: `I0.2` FC derecho. |
| 40092 | `VW1182` | WORD | `COUNT_PIEZAS_C1` | Piezas en la rampa 1 |
| 40093 | `VW1184` | WORD | `COUNT_PIEZAS_C2` | Piezas en la rampa 2 |
| 40094 | `VW1186` | WORD | `COUNT_PIEZAS_C3` | Piezas en la rampa 3 |
| 40095 | `VW1188` | WORD | `COUNT_PIEZAS_ROBOT` | Piezas que retiró el brazo (tipos 4 y 5) |
| 40096 | `VW1190` | WORD | `COUNT_TOTAL_PIEZAS` | Total de piezas terminadas |

### 2.8 E/S y datos de cada PLC (40101 a 40128 = VB1200 a VB1255)

Los publica `SBR_MODBUS_SLAVE` (networks 16 y 17) en cada ciclo. La tabla va por bytes.

| Bytes | Registros | Contenido |
|---|---|---|
| `VB1200` / `VB1201` | 40101 | `IB0` / `IB1` del PLC 1 |
| `VB1202` / `VB1203` | 40102 | `IB2` / `QB0` del PLC 1 |
| `VB1204` / `VB1205` | 40103 | `QB1` del PLC 1 / tipo de maniobra `VB19` (1 tomar, 2 dejar, 3 dejar en la cinta) |
| `VB1206` / `VB1207` | 40104 | Etapa del automático `VB18` / del manual `VB14` |
| `VB1208` / `VB1209` | 40105 | Etapa de la maniobra `VB34` / nodos PPI sin red `VB710` (bit n = PLC n) |
| `VB1210` / `VB1211` | 40106 | Banderas de Transporte / fase del homing `VB15`.<br>Banderas: bit 0 con referencia, bit 1 homing, bit 2 maniobra, bit 3 viaje, bit 4 esperando a otra estación, bit 5 retroceso del FC, bit 6 parar al final, bit 7 tarea del brazo. |
| `VB1212` - `VB1219` | 40107 - 40110 | PLC 2 (`VB507` a `VB514`): estado, paso, `IB0`, material (1 = metal), `IB1`, `QB0`, `QB1`, — |
| `VB1220` - `VB1227` | 40111 - 40114 | PLC 3 (`VB547` a `VB554`): estado, paso del ensamble, `IB0`, tipo (1 = blanca/metal, 5 = negra), `IB1`, `QB0`, `IB2` (bits 4 a 7) + paso de preparación / 10 (bits 0 a 3), diagnóstico de espera `VB337` |
| `VB1228` - `VB1235` | 40115 - 40118 | PLC 4 (`VB587` a `VB594`): estado, paso, `IB0`, —, `IB1`, `QB0`, `QB1`, — |
| `VB1236` - `VB1248` | 40119 - 40125 | PLC 5 (`VB627` a `VB639`): estado, paso, `IB0`, rampa asignada, frecuencia (W), corriente (W), bus DC (W), modo (bits 0 y 1; bit 5 atrás, bit 6 automático, bit 7 emergencia), error Modbus, `QB0` |
| `VB1250` - `VB1253` | 40126 - 40127 | PLC 6 (`VB667` a `VB670`): estado, paso, `IB0`, fase del homing |
| `VB1254` / `VB1255` | 40128 | Contador de vida `VB570` / baliza `VB37` |

Bits del byte de estado de cada estación (`VB200` de cada PLC):

| Bit | Significado |
|:---:|---|
| 0 | `READY` |
| 1 | `BUSY` |
| 2 | `DONE` |
| 3 | Atasco |
| 4 | Fuga |
| 5 | Silo vacío (PLC 2 y PLC 3); falla del variador (PLC 5) |
| 6 | Emergencia; en el PLC 5 `ROBOT_WAIT`; en el PLC 6 `BELT_PERMIT` |
| 7 | `HOMED` |
