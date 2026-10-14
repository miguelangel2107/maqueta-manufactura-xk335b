# MAPEO UNIFICADO DE MEMORIA V Y REGISTROS MODBUS RTU (PLC 1 TRANSPORTE)
## Celda de Manufactura Flexible XL-335B + Brazo Robótico 4-DOF[cite: 2, 4]

**Controlador:** Siemens SIMATIC S7-200 CPU 226CN (Maestro de Celda y Pasarela de Supervisión)[cite: 4, 7]  
**Canal de Supervisión:** Puerto 0 (RS-485 hacia Web SCADA SPA vía Web Serial API)[cite: 4, 7]  
**Configuración de Comunicación Modbus RTU:**
- **Modo:** Esclavo Modbus RTU nativo mediante librería Micro/WIN (`MBUS_INIT` / `MBUS_SLAVE`)[cite: 4].
- **Dirección de Esclavo:** `1`[cite: 4, 7].
- **Velocidad de Transferencia:** `19,200 bps`[cite: 4, 7].
- **Formato de Trama:** 8 bits de datos, sin paridad (None), 1 bit de parada (8-N-1)[cite: 4, 7].
- **Base de Direccionamiento de Holding Registers:** `HoldStart = &VB1000` (El registro Modbus `40001` apunta físicamente a `VW1000`)[cite: 4].
- **Zona de Memoria de Librería Modbus:** `VB4000` en adelante (desacoplada de las tablas de datos y red)[cite: 4].

---

## 1. DISTRIBUCIÓN GENERAL DE ÁREAS DE MEMORIA V EN PLC 1 (MAPA v2, REV. 2026-10-12)

> Este mapa describe **lo que el programa del PLC 1 realmente publica y acepta** (`SBR_IO_SCAN` y `SBR_MODBUS_SLAVE`). Lo usa el SCADA web de `03_SCADA_Web`. El SCADA lee los 128 registros en dos tramas de 64.

```text
+------------------+------------------+--------------------------------------------------------+
| Rango Memoria V  | Holding Register | Descripción Funcional                                  |
+------------------+------------------+--------------------------------------------------------+
| VB500 - VB699    | Interno (No MB)  | Descriptores y Buffers del Carrusel PPI (NETR / NETW)  |
| VD720 - VD728    | Interno (No MB)  | Sombras de los parámetros editables desde el SCADA     |
| VW1000           | 40001            | Mandos del SCADA (pulsos)                              |
| VD1002 - VW1018  | 40002 - 40010    | Parámetros editables y peticiones al variador          |
| VW1020 - VW1038  | 40011 - 40020    | Estados globales y pasos por estación                  |
| VW1040 - VW1056  | 40021 - 40029    | Alarmas y diagnósticos                                 |
| VW1060 - VW1070  | 40031 - 40036    | Δt neumáticos de Transporte (ms)                       |
| VD1110 - VD1126  | 40056 - 40065    | Cotas del carro (lectura/escritura) y posición         |
| VW1132 - VW1146  | 40067 - 40074    | Telemetría del variador Powtran (vía PLC 5)            |
| VW1180 - VW1190  | 40091 - 40096    | Sensores físicos del PLC 1 y contadores de producción  |
| VB1200 - VB1255  | 40101 - 40128    | Imagen extendida: E/S de Transporte y datos de cada PLC|
| VB4000 - VB4799  | Interno (No MB)  | Memoria de Trabajo de Librerías Modbus Slave           |
+------------------+------------------+--------------------------------------------------------+
```

Los registros no listados (40030, 40037..40055, 40066, 40075..40090, 40097..40100) no los escribe el programa: el SCADA no los usa.

---

## 2. TABLA DETALLADA DE REGISTROS MODBUS (HOLDING REGISTERS 40001+)

> **Numeración de bits:** el S7-200 es big-endian. El bit `n` (0 = LSB) de un registro `VWxxxx` es `V(xxxx+1).n`. Por ejemplo, el bit 0 de `40001` es `V1001.0` y el bit 8 es `V1000.0`. Un DINT `VDxxxx` ocupa dos registros, con la palabra alta primero.

### 2.1 Mandos y Parámetros (SCADA → PLC 1)

| Dirección Modbus | Registro PLC | Tipo | Nemónico / Tag | Descripción |
|---|---|---|---|---|
| **40001** | `VW1000` | WORD | `CMD_SCADA` | **Pulsos**: el SCADA escribe el bit a 1 durante unos 350 ms y luego 0. El PLC actúa en el flanco.<br>• Bit 0: Marcha. Igual que SB1 en Automático: además envía `CMD_START` y `CMD_ACK_RESET` a los PLC 2..5.<br>• Bit 1: Pausa.<br>• Bit 2: Reset / rearme. También envía `CMD_ACK_RESET` a los PLC 2..5.<br>• Bit 3: Parada al terminar la pieza en curso.<br>• Bit 4: **SB1 virtual** (idéntico al pulsador físico).<br>• Bit 5: **SB2 virtual**.<br>• Bit 6: Jog de calibración a la derecha (solo en Manual).<br>• Bit 7: Jog a la izquierda (solo en Manual).<br>• Bit 8 (`V1000.0`): poner a cero los contadores `VW1182..VW1190`. |
| **40002 - 40003** | `VD1002` | DINT | `PAR_JOG_PULSOS` | Pulsos por toque de jog (`VD280`). Rango 1..20000. |
| **40004 - 40005** | `VD1006` | DINT | `PAR_REBOTE_FC` | Rebote en el FC derecho al llegar a Selección (`VD288`). Rango 0..10000. |
| **40006 - 40007** | `VD1010` | DINT | `PAR_RETROCESO_HOMING` | Retroceso del homing (`VD240`). Rango 500..20000. |
| **40008** | `VW1014` | WORD | `REQ_SENTIDO_CINTA` | Sentido de la cinta pedido al PLC 5 (`VB650` → `VB103` remoto): `0` = sin cambio, `1` = Forward, `2` = Reverse. Se aplica con la cinta parada. |
| **40009** | `VW1016` | WORD | `REQ_MODO_VFD` | Modo del variador pedido al PLC 5 (`VB649` → `VB102` remoto): `0` = sin cambio, `1` = Analógico, `2` = Modbus. Se aplica con la cinta parada. |
| **40010** | `VW1018` | WORD | `HEARTBEAT_SCADA` | Libre para el SCADA (el PLC no lo usa). |

**Cómo se aplican los parámetros (40002..40007) y las cotas (40056..40063):**
1. Si el valor del registro difiere de su sombra, el PLC entiende que lo escribió el SCADA.
2. Si está dentro de rango, lo aplica. Si no, lo descarta.
3. En el mismo ciclo, el PLC vuelve a publicar el valor vigente.

Por eso un valor rechazado regresa solo. Un cambio hecho desde la Tabla de Estado de Micro/WIN (por ejemplo, `VD280`) no lo pisa el SCADA.

### 2.2 Estados Globales y Pasos por Estación (PLC 1 → SCADA)

| Dirección Modbus | Registro PLC | Tipo | Nemónico / Tag | Descripción |
|---|---|---|---|---|
| **40011** | `VW1020` | WORD | `STAT_GLOBAL_CELL` | Bit 0 marcha, bit 1 pausa, bit 2 seta QS liberada, bit 3 Automático, bit 4 ciclo activo, bit 5 alarma general, bit 6 Manual |
| **40012** | `VW1022` | WORD | `STAT_ESTACIONES_RDY` | Bit 1 Transporte referenciado, bits 2..6 `STAT_READY` de los PLC 2..6 |
| **40013** | `VW1024` | WORD | `STAT_PASO_TRANSP` | Paso de Transporte (`VW16` en Automático, `VW12` en Manual) |
| **40014..40018** | `VW1026..VW1034` | WORD | `STAT_PASO_xx` | Paso de los PLC 2..6 (`VB201` de cada uno) |
| **40019** | `VW1036` | WORD | `TIPO_PIEZA_ACTUAL` | `VB33`: `5` = pieza negra (bypass), `0` = se clasifica en la cinta |
| **40020** | `VW1038` | WORD | `FLAGS_INTERLOCK` | Bit 0 E listo, bit 1 P listo, bit 2 S listo, bit 3 `BELT_PERMIT_RUN`, bit 4 misión del Brazo |

### 2.3 Alarmas y Diagnósticos

| Dirección Modbus | Registro PLC | Tipo | Nemónico / Tag | Descripción y Bits |
|---|---|---|---|---|
| **40021** | `VW1040` | WORD | `ALM_TRANSPORTE` | Byte bajo:<br>• Bit 0: atasco o viaje no concluido (`M4.1`).<br>• Bit 1: homing fallido (`M7.2`).<br>• Bit 2: límite o cota fuera de rango (`M7.6`).<br>• Bit 3: sin referencia (`M7.7`).<br>• Bit 4: timeout de maniobra (`M8.2`).<br>• Bit 5: alarma manual (`M10.7`).<br>• Bit 6: Brazo sin respuesta (`M20.3`).<br>• Bit 7: fuga (`M4.0`). |
| **40024** | `VW1046` | WORD | `ALM_PROCESO_CELL` | Bit 0 silo de Alimentación vacío, bit 1 silo de núcleos vacío, bit 2 servo sin RDY, bit 3 falla de comunicación con el VFD, bit 4 límites, bit 5 nodo PPI sin respuesta |
| **40026** | `VW1050` | WORD | `ESTADO_BALIZA_PLANTA` | Byte bajo = `VB37`: bit 0 verde, bit 1 amarilla fija, bit 2 amarilla intermitente, bit 3 roja fija, bit 4 roja intermitente |
| **40027** | `VW1052` | WORD | `DIAG_ENLACE_BRAZO` | Byte bajo = `VB286` (Documentación 6.8) |
| **40028** | `VW1054` | WORD | `DIAG_ESPERA_AUTO` | Byte bajo = `VB287` (Documentación 6.12) |
| **40029** | `VW1056` | WORD | `DIAG_BALIZA_ROJA` | Byte bajo = `VB292`: bit 0 Transporte, bit 1 Brazo, bits 2..5 atasco PLC 2..5 / VFD, bit 6 nodo PPI sin red, bit 7 seta QS |

### 2.4 Tiempos de Tránsito Neumático de Transporte ($\Delta t$ en ms)

| Dirección Modbus | Registro PLC | Origen | Movimiento | Nominal | Alerta de fuga | Atasco |
|---|---|---|---|:---:|:---:|:---:|
| **40031** | `VW1060` | `VW20` | Vertical baja | 400 ms | > 550 ms | 1,5 s |
| **40032** | `VW1062` | `VW22` | Vertical sube | 350 ms | > 500 ms | 1,5 s |
| **40033** | `VW1064` | `VW24` | Brazo se extiende | 350 ms | > 550 ms | 1,5 s |
| **40034** | `VW1066` | `VW26` | Brazo se retrae | 300 ms | > 500 ms | 1,5 s |
| **40035** | `VW1068` | `VW28` | Giro a la bancada | 400 ms | > 600 ms | 1,5 s |
| **40036** | `VW1070` | `VW30` | Pinza cierra | 250 ms | > 450 ms | 1,5 s |

Los Δt de las estaciones se miden en cada PLC (`VW210..VW224`) y no viajan por la red PPI. Se ven con Micro/WIN.

### 2.5 Cotas del Carro de Transporte (DINT, pulsos PTO 0)
*Solo son las cotas del carro de Transporte. No confundir con las cotas del encoder de la cinta de Selección (PLC 5, `VW310..VW328`).*

| Dirección Modbus | Registro PLC | Tipo | Nemónico / Tag | Por defecto | Descripción |
|---|---|---|---|:---:|---|
| **40056 - 40057** | `VD1110` | DINT | `COTA_ALIMENTACION` | `0` (`VD204`) | Sobre el inductivo de Home `I0.0` |
| **40058 - 40059** | `VD1114` | DINT | `COTA_PROCESAMIENTO` | `45,500` (`VD208`) | Mordaza de la prensa |
| **40060 - 40061** | `VD1118` | DINT | `COTA_ENSAMBLAJE` | `87,500` (`VD212`) | Nido de Ensamblaje |
| **40062 - 40063** | `VD1122` | DINT | `COTA_SELECCION` | `107,500` (`VD216`) | Entrada de la cinta |
| **40064 - 40065** | `VD1126` | DINT | `POS_ACTUAL_SERVO` | — | Posición actual (`VD250`), solo lectura |

Las cotas escritas se validan contra `[VD226, VD222]` = `[-1000, 116000]`.

### 2.6 Telemetría del Variador Powtran PI9100A (vía PLC 5)

| Dirección Modbus | Registro PLC | Tipo | Nemónico / Tag | Unidad | Descripción |
|---|---|---|---|:---:|---|
| **40067** | `VW1132` | WORD | `VFD_FREQ_OUT` | 0.01 Hz | Frecuencia de salida (Powtran `0x1001`) |
| **40068** | `VW1134` | WORD | `VFD_BUS_VOLT` | 0.1 V | Bus DC (`0x1002`) |
| **40069** | `VW1136` | WORD | `VFD_CURRENT` | 0.01 A | Corriente (`0x1004`) |
| **40070** | `VW1138` | WORD | `VFD_STATUS_WORD` | — | `1` = en marcha, `5` = parado |
| **40073** | `VW1144` | WORD | `VFD_CONTROL_MODE` | 1 / 2 | Modo activo: `1` = Analógico, `2` = Modbus |
| **40074** | `VW1146` | WORD | `VFD_FAULT_CODE` | — | Código de error Modbus del PLC 5 (`0` = sin falla) |

### 2.7 Sensores Físicos del PLC 1 y Contadores de Producción

| Dirección Modbus | Registro PLC | Tipo | Nemónico / Tag | Descripción |
|---|---|---|---|---|
| **40091** | `VW1180` | WORD | `SENS_FIN_CARRILES` | Bit 0..2 `I2.0..I2.2` fin de carril 1..3, bit 3 `I0.0` Home, bit 4 `I0.1` FC izquierdo, bit 5 `I0.2` FC derecho |
| **40092** | `VW1182` | WORD | `COUNT_PIEZAS_C1` | Piezas en carril 1 |
| **40093** | `VW1184` | WORD | `COUNT_PIEZAS_C2` | Piezas en carril 2 |
| **40094** | `VW1186` | WORD | `COUNT_PIEZAS_C3` | Piezas en carril 3 |
| **40095** | `VW1188` | WORD | `COUNT_PIEZAS_ROBOT` | Piezas retiradas por el Brazo (tipos 4 y 5) |
| **40096** | `VW1190` | WORD | `COUNT_TOTAL_PIEZAS` | Total de piezas terminadas |

### 2.8 Imagen Extendida para el SCADA (40101..40128 = VB1200..VB1255)

La publica `SBR_MODBUS_SLAVE` Network 16 y 17 en cada ciclo. Las filas indican el byte V.

| Bytes | Registros | Contenido |
|---|---|---|
| `VB1200` / `VB1201` | 40101 | `IB0` / `IB1` del PLC 1 |
| `VB1202` / `VB1203` | 40102 | `IB2` / `QB0` del PLC 1 |
| `VB1204` / `VB1205` | 40103 | `QB1` del PLC 1 / tipo de maniobra `VB19` (1 pick, 2 place, 3 place en cinta) |
| `VB1206` / `VB1207` | 40104 | Sub-etapa del automático `VB18` / del manual `VB14` |
| `VB1208` / `VB1209` | 40105 | Sub-etapa de maniobra `VB34` / nodos PPI sin red `VB710` (bit n = PLC n) |
| `VB1210` / `VB1211` | 40106 | Banderas de Transporte / fase de homing `VB15`. Banderas:<br>• Bit 0: referenciado.<br>• Bit 1: homing.<br>• Bit 2: maniobra.<br>• Bit 3: viaje.<br>• Bit 4: esperando a otra estación.<br>• Bit 5: rebote.<br>• Bit 6: parada al final.<br>• Bit 7: misión del Brazo. |
| `VB1212..VB1219` | 40107..40110 | **PLC 2** (`VB507..VB514`): estado, paso, `IB0`, material (1 metal), `IB1`, `QB0`, `QB1`, — |
| `VB1220..VB1227` | 40111..40114 | **PLC 3** (`VB547..VB554`): estado, paso del ensamble, `IB0`, tipo (1 blanca/metal, 5 negra), `IB1`, `QB0`, `IB2` (bits 4..7) + paso de preparación / 10 (bits 0..3), diagnóstico de espera `VB337` |
| `VB1228..VB1235` | 40115..40118 | **PLC 4** (`VB587..VB594`): estado, paso, `IB0`, —, `IB1`, `QB0`, `QB1`, — |
| `VB1236..VB1248` | 40119..40125 | **PLC 5** (`VB627..VB639`): estado, paso, `IB0`, carril asignado, frecuencia (W), corriente (W), bus DC (W), modo (bits 0..1, bit 5 REV, bit 6 Automático, bit 7 emergencia), error Modbus, `QB0` |
| `VB1250..VB1253` | 40126..40127 | **PLC 6** (`VB667..VB670`): estado, paso, `IB0`, fase de homing |
| `VB1254` / `VB1255` | 40128 | Contador de vida `VB570` / baliza `VB37` |

Bits del byte de estado de las estaciones (`VB200` de cada PLC):

| Bit | Significado |
|:---:|---|
| 0 | `READY` |
| 1 | `BUSY` |
| 2 | `DONE` |
| 3 | Atasco |
| 4 | Fuga |
| 5 | Silo vacío en PLC 2 / PLC 3; falla del VFD en PLC 5 |
| 6 | Emergencia; en PLC 5, `ROBOT_WAIT`; en PLC 6, `BELT_PERMIT` |
| 7 | `HOMED` |
