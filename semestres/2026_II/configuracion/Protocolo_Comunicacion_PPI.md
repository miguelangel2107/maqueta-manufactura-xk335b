# PROTOCOLO DE COMUNICACIÓN INTER-PLC (RED PPI A 19,200 BAUDIOS)
## Celda de Manufactura Flexible XL-335B + Brazo 4-DOF (AWL Puro sin Asistentes)[cite: 2, 5]

---

## 1. ESPECIFICACIÓN FÍSICA Y TOPOLOGÍA DE RED

La interconexión de control distribuido entre las 6 estaciones de la celda se realiza a través de un bus multipunto diferencial industrial RS-485 gobernado por el protocolo nativo Siemens PPI (Point-to-Point Interface)[cite: 2, 5]:

- **Velocidad de Transferencia:** **19,200 bps** homogénea en todos los bloques de sistema[cite: 2, 5].
- **Formato de Trama:** 8 bits de datos, paridad par (Even), 1 bit de parada (8-E-1 estándar PPI)[cite: 5].
- **Topología Física:** Conexión en bus lineal continuo Daisy-Chain punto a punto[cite: 5].
  - **Extremo Inicial:** PLC 1 (Puerto 1) con resistencia terminadora de **120 Ω en ON**[cite: 5].
  - **Nodos Intermedios:** PLCs 2, 3, 4 y 5 con resistencias terminadoras en **OFF**[cite: 5].
  - **Extremo Final:** PLC 6 (Puerto 0) con resistencia terminadora de **120 Ω en ON**[cite: 5].

```text
======================= BUS PPI RS-485 (19,200 bps) =======================
   |            |            |            |            |            |
 Port 1       Port 0       Port 0       Port 0       Port 0       Port 0
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+
|  PLC 1   | |  PLC 2   | |  PLC 3   | |  PLC 4   | |  PLC 5   | |  PLC 6   |
|Transporte| |Alimentac.| |Ensamblaje| |Procesam. | |Selección | |Brazo 4DOF|
|CPU 226CN | |CPU 224CN | |CPU 226CN | |CPU 224CN | |CPU 224XP | |CPU 224CN |
|ID PPI = 1| |ID PPI = 2| |ID PPI = 3| |ID PPI = 4| |ID PPI = 5| |ID PPI = 6|
| [TER ON] | |[TER OFF] | |[TER OFF] | |[TER OFF] | |[TER OFF] | | [TER ON] |
+----+-----+ +----------+ +----------+ +----------+ +----+--+---+ +----------+
     | Port 0                                            |  | Port 1
     | Modbus Esclavo (PC)                               |  | Modbus Maestro (VFD)
     v                                                   v  v
+------------+                                      +------------+
| Web SCADA  |                                      |VFD Powtran |
|    SPA     |                                      |  PI9100A   |
+------------+                                      +------------+
```

---

## 2. MAPA DE DIRECCIONAMIENTO DE ESTACIONES (IDs DE NODO)

| Estación Física | Rol en la Red | Modelo CPU | Dirección PPI | Puerto Físico | Rol Operativo |
|---|---|---|:---:|:---:|---|
| **PLC 1** | **Maestro de Celda** | CPU 226CN | **1** | **Puerto 1** | Coordinador: ejecuta carrusel `NETR`/`NETW`[cite: 2, 5] |
| **PLC 2** | Esclavo | CPU 224CN | **2** | Puerto 0 | Dosificación de cilindro base e inspección inductiva[cite: 2, 5] |
| **PLC 3** | Esclavo | CPU 226CN | **3** | Puerto 0 | Ensamble de núcleos, plato 180° y sensor de fibra[cite: 2, 5] |
| **PLC 4** | Esclavo | CPU 224CN | **4** | Puerto 0 | Ciclo de prensado y conformado doble[cite: 2, 5] |
| **PLC 5** | Esclavo | CPU 224XP-CN | **5** | Puerto 0 | Control autónomo de cinta por HSC0 y clasificación[cite: 2, 5] |
| **PLC 6** | Esclavo | CPU 224CN | **6** | Puerto 0 | Manipulador 4-DOF: homing, recogida y despeje[cite: 2, 5, 9] |

---

## 3. ESTRUCTURA FORMAL DE LOS DESCRIPTORES NETR Y NETW

En el S7-200, cada instrucción nativa `NETR` o `NETW` requiere una tabla descriptora en memoria V de **7 bytes de cabecera más los bytes de datos**[cite: 5]:

```text
 Desplazamiento en Memoria V:
 +0           +1           +2   +3   +4   +5      +6           +7 ... +(7+N-1)
+------------+------------+---------------------+------------+--------------------+
| Status/Err | Station ID | 32-bit Remote Ptr   | Data Count | Data Buffer        |
+------------+------------+---------------------+------------+--------------------+
```

### Detalle de Campos del Descriptor:
1. **Byte 0 (Status/Error):** formato `D A E 0 | código`
   - **Bit 7 (`D`):** `1` = Transacción terminada.
   - **Bit 6 (`A`):** `1` = Transacción **activa** (en curso). *No es un bit de error: la versión anterior del carrusel avanzaba con él y saltaba transacciones aún en curso.*
   - **Bit 5 (`E`):** `1` = Transacción terminada con error.
   - **Bits 0..3 (código):** `0` sin error, `1` timeout (esclavo no responde), `2` error de recepción (paridad/trama/checksum), `3` offline (direcciones duplicadas), `4` cola desbordada (>8 NETR/NETW activos), `5` violación de protocolo (puerto sin modo maestro PPI: falta `SMB130 = 2` en el Puerto 1), `6` parámetro ilegal, `7` sin recursos en el remoto, `8` error de capa 7, `9` error de mensaje.
2. **Byte 1 (Station ID):** Dirección física del nodo remoto (`2` a `6`)[cite: 5].
3. **Bytes 2 a 5 (Remote Pointer):** Puntero indirecto de 32 bits a la variable de memoria V remota (ej: `&VB100` o `&VB200`)[cite: 5].
4. **Byte 6 (Data Count):** cantidad de bytes a transferir (1 a 16). Todos los esclavos reservan `VB100..VB103` y `VB200..VB2xx` exclusivamente para la red: sus palabras de paso viven en `VW330`/`VW332` (PLC 2..5) y `VW320`/`VW322` (PLC 6).
5. **Bytes 7 a 10 (Payload):**
   - Para `NETR`: Búfer receptor donde se copian los datos leídos del esclavo[cite: 5].
   - Para `NETW`: Búfer transmisor donde se colocan los datos a escribir en el esclavo[cite: 5].

---

## 4. CONTRATO DE INTERFAZ ESTANDARIZADO (ICD UNIFICADO)

Para garantizar consistencia y eliminar variables ad-hoc, **todos los autómatas esclavos (PLCs 2 al 6)** adoptan la misma estructura de memoria base:

### 4.1 Paquete de Bajada: Comandos desde PLC 1 hacia Esclavo (`VB100` a `VB103`)
El PLC 1 escribe periódicamente mediante `NETW` sobre la dirección remota `&VB100` del autómata esclavo[cite: 5]:

| Byte | Variable | Tipo | Descripción de Bits y Campos |
|:---:|---|:---:|---|
| **VB100** | `CMD_CONTROL` | BYTE | **Palabra de Control Maestro:**<br>• Bit 0: `CMD_START` (Marcha de la estación; el PLC 1 lo envía a los nodos 2..5 con cada SB1 de Transporte en Automático)<br>• Bit 1: `CMD_PAUSE` (Pausa de secuencia por SB2 o SCADA)<br>• Bit 2: `CMD_ESTOP` (Emergencia activa QS)<br>• Bit 3: `CMD_ACK_RESET` (Rearma la estación si espera rearme; si ya está rearmada solo borra alarmas, sin reiniciar el paso. Se envía con cada SB1 de Transporte en Automático y con Reset del SCADA)<br>• Bit 4: `CMD_PIEZA_ENTREGADA` (Transporte colocó pieza en el nido/cinta)<br>• Bit 5: `CMD_AUTORIZAR_DOSIF` (Autorización de dosificación a Silos)<br>• Bit 6: `CMD_RETIRO_CONFIRMADO` (Transporte tomó la pieza, nido libre)<br>• Bit 7: `CMD_MODO_TEST` (Habilita ciclo de diagnóstico individual) |
| **VB101** | `CMD_TIPO_PIEZA`| BYTE | **Receta de Pieza:** `0` = Sin pieza / Reposo, `1` a `5` = Tipo de pieza asignada |
| **VB102** | `CMD_CONSIGNA`  | BYTE | **Consigna Específica:**<br>• En PLC 4: Tiempo base de prensado<br>• En PLC 5: Consigna de frecuencia cinta (Hz)<br>• En PLCs 2, 3, 6: Reservado |
| **VB103** | `CMD_AUX_FLAGS` | BYTE | Banderas auxiliares / sincronización de ciclo continuo |

---

### 4.2 Paquete de Subida: Telemetría y Estados hacia PLC 1 (`VB200` a `VB203`)
El PLC 1 lee periódicamente mediante `NETR` desde la dirección remota `&VB200` del autómata esclavo[cite: 5]:

| Byte | Variable | Tipo | Descripción de Bits y Campos |
|:---:|---|:---:|---|
| **VB200** | `STAT_GLOBAL` | BYTE | **Palabra de Estado del Esclavo:**<br>• Bit 0: `STAT_READY` (En reposo y listo para operar)<br>• Bit 1: `STAT_BUSY` (Secuencia local en ejecución)<br>• Bit 2: `STAT_DONE` (Secuencia terminada con éxito, pieza lista)<br>• Bit 3: `STAT_ALM_ATASCO` (Alarma por tiempo de carrera excedido)<br>• Bit 4: `STAT_ALM_FUGA` (Alerta predictiva de fuga neumática)<br>• Bit 5: `STAT_SILO_EMPTY` (Alarma silo sin existencias en Nodos 2 y 3)<br>• Bit 6: `STAT_BELT_PERMIT` (Exclusivo Nodo 6: Brazo despejó cinta)<br>• Bit 7: `STAT_HOMED` (Origen físico referenciado) |
| **VB201** | `STAT_PASO` | BYTE | **Sub-etapa Activa:** Entero que indica el paso exacto del autómata (`0`, `10`, `20`...) para animación en tiempo real en Web SCADA |
| **VB202** | `STAT_INPUTS` | BYTE | **Espejo Físico de Entradas:** Copia directa del registro `IB0` (`MOVB IB0, VB202`) para telemetría de sensores en Web SCADA |
| **VB203** | `STAT_DATA` | BYTE | **Dato Particular de la Estación:**<br>• En PLC 2: Sensor inductivo (`1` = Metal, `0` = Plástico)<br>• En PLC 3: Sensor Omron reflectivo (`1` = Blanco/Metal, `0` = Negro)<br>• En PLC 5: Carril activo de clasificación (1 a 3)<br>• En PLC 6: Eje activo en movimiento |

---

## 5. TABLA MAESTRA DE ASIGNACIÓN DE DESCRIPTORES EN PLC 1

Para prevenir solapamientos de memoria, las 10 tablas descriptoras se ubican en el rango `VB500` a `VB699` del PLC 1 espaciadas cada **20 bytes** (7 bytes de encabezado + 4 bytes de datos + 9 bytes de guarda):

| Paso | Operación | Nodo | Descriptor en PLC 1 | Dirección Remota | Longitud | Búfer de Datos en PLC 1 | Función Operativa |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **1** | `NETR` | **Nodo 2** | `VB500` - `VB506` | `&VB200` | **8 Bytes** | `VB507` - `VB514` | Estado, paso, `IB0`, material base, `IB1`, `QB0`, `QB1`, reservado |
| **2** | `NETW` | **Nodo 2** | `VB520` - `VB526` | `&VB100` | 4 Bytes | `VB527` - `VB530` | `CMD_AUTORIZAR_DOSIF` (bit 5) y `CMD_RETIRO_CONFIRMADO` (bit 6), cola `VB702` |
| **3** | `NETR` | **Nodo 3** | `VB540` - `VB546` | `&VB200` | **8 Bytes** | `VB547` - `VB554` | Estado, paso del ensamble, `IB0`, tipo (1 / 5), `IB1`, `QB0`, `IB2` + paso de preparación, diagnóstico `VB337` |
| **4** | `NETW` | **Nodo 3** | `VB560` - `VB566` | `&VB100` | 4 Bytes | `VB567` - `VB570` | `CMD_PIEZA_ENTREGADA` (bit 4) y `CMD_RETIRO_CONFIRMADO` (bit 6), cola `VB703` |
| **5** | `NETR` | **Nodo 4** | `VB580` - `VB586` | `&VB200` | **8 Bytes** | `VB587` - `VB594` | Estado, paso, `IB0`, reservado, `IB1`, `QB0`, `QB1`, reservado |
| **6** | `NETW` | **Nodo 4** | `VB600` - `VB606` | `&VB100` | 4 Bytes | `VB607` - `VB610` | Disparo de prensado `CMD_PIEZA_ENTREGADA` (bit 4) y retiro (bit 6), cola `VB704` |
| **7** | `NETR` | **Nodo 5** | `VB620` - `VB626` | `&VB200` | **13 Bytes** | `VB627` - `VB639` | Estado, `STAT_ROBOT_WAIT` (bit 6), carril y telemetría VFD (`VW631` Hz, `VW633` A, `VW635` Bus DC, `VB637` modo + bit 5 REV + bit 6 Automático + bit 7 emergencia, `VB638` error), `VB639` = `QB0` |
| **8** | `NETW` | **Nodo 5** | `VB640` - `VB646` | `&VB100` | 4 Bytes | `VB647` - `VB650` | `VB647` control (pieza entregada bit 4, `BELT_PERMIT_RUN` bit 6, estop bit 2; cola `VB705`), `VB648` tipo (5 = negra), `VB649` modo VFD pedido, `VB650` sentido de cinta pedido (0 / 1 FWD / 2 REV, desde el SCADA 40008) |
| **9** | `NETR` | **Nodo 6** | `VB660` - `VB666` | `&VB200` | 4 Bytes | `VB667` - `VB670` | READY, BUSY, DONE, `BELT_PERMIT_RUN` (bit 6), HOMED |

> **Rev. 2026-10-12 (SCADA):** los nodos 2, 3 y 4 publican además `VB204..VB207` (E/S y diagnóstico) y el nodo 5 `VB212` (`QB0`); el PLC 1 los reenvía al SCADA en `VB1200..VB1255` (ver `Mapeo_Memoria_Global.md` 2.8). El SB1 de Transporte en Automático (o Marcha del SCADA) encola `CMD_START` y `CMD_ACK_RESET` a los nodos 2..5; `CMD_ACK_RESET` solo rearma a la estación que espera rearme y, si ya está rearmada, solo borra sus alarmas sin reiniciar el paso.
| **10**| `NETW` | **Nodo 6** | `VB680` - `VB686` | `&VB100` | **1 Byte** | `VB687` | Orden de recogida `CMD_START` (bit 0) y `CMD_ESTOP` (bit 2), cola `VB706` |

---

## 6. MÁQUINA DE ESTADOS DEL SECUENCIADOR PPI (CARRUSEL SERIAL)

Para respetar la arquitectura token-ring y evitar la saturación de la cola de red del puerto RS-485, el PLC 1 ejecuta una **máquina de estados cíclica con avance estrictamente secuencial**[cite: 5]:

```text
       [Paso 1: NETR Nodo 2]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 2: NETW Nodo 2]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 3: NETR Nodo 3]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 4: NETW Nodo 3]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 5: NETR Nodo 4]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 6: NETW Nodo 4]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 7: NETR Nodo 5]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 8: NETW Nodo 5]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 9: NETR Nodo 6]  --> Done / Err / Timeout T38 1.0 s
                 |
                 v
       [Paso 10: NETW Nodo 6] --> Done / Err / Timeout T38 1.0 s
                 |
                 +-----> (Retorna a Paso 1)
```

### Reglas de Ejecución del Secuenciador:
1. **Transición Normal:** cada paso lanza su `NETR`/`NETW` **una sola vez** (bandera `M21.0`) y se cierra cuando el bit 7 (`D`) o el bit 5 (`E`) del byte de estado conmuta a `1`. En los `NETW` la cola de solicitudes `VB70n` se copia al buffer al lanzar y se borra al confirmar (**envío único**); los esclavos actúan por flanco.
2. **Gestión de Errores y Nodos Desconectados:** con `E = 1` o watchdog vencido se marca el nodo en `VB710` (bit n = nodo n, espejo en `VW1046` bit 5), se borra el byte de estado leído (para no decidir con datos viejos), se **reencolan** los comandos no entregados y se pasa al siguiente paso.
3. **Watchdog de Protección:** `T38` = **1.0 s** por transacción (respaldo del timeout interno del maestro PPI; un valor menor podría cortar transacciones vivas y duplicar órdenes).

---

## 7. DINÁMICA DE HANDSHAKE Y SINCRONIZACIÓN DE PROCESO

### 7.1 Triangulación Alimentación $\to$ Transporte $\to$ Ensamblaje
1. Transporte recoge la pieza base en Alimentación. El PLC 2 pasa a reposo y **no dosifica** de inmediato.
2. Transporte traslada la pieza base y la deposita en el nido de Ensamblaje (PLC 3)[cite: 2].
3. Al abrir la pinza en Ensamblaje, el PLC 1 conmuta dos señales en el mismo escaneo:
   - Hacia PLC 3: `CMD_PIEZA_ENTREGADA = 1` en `VB567.4` (dispara la secuencia en Ensamblaje).
   - Hacia PLC 2: `CMD_AUTORIZAR_DOSIF = 1` en `VB527.5` (autoriza a preparar la siguiente pieza base).
4. El PLC 2 verifica que su sensor de salida `I0.4` esté libre (`0`) y procede a ciclar sus cilindros para dejar lista la siguiente pieza sin riesgo de colisión.

### 7.2 Discriminación de Pieza Negra y Bypass
1. Al recibir `CMD_PIEZA_ENTREGADA = 1`, el PLC 3 evalúa el sensor de fibra Omron `I0.4`[cite: 2, 6]:
   - Si `I0.4 = 1` (Pieza reflectiva): Inicia el ciclo de dosificación de núcleo y Pick & Place[cite: 2, 6].
   - Si `I0.4 = 0` (Pieza negra): Cancela la dosificación de núcleo, establece `TIPO_PIEZA = 5` y activa inmediatamente `STAT_DONE = 1`[cite: 2, 6].
2. El PLC 1 lee `STAT_DONE = 1` junto con el indicativo de pieza negra, toma la pieza del nido y ejecuta el **Bypass directo a Selección**, sobrevolando Procesamiento sin entrar a la prensa[cite: 2, 6].

### 7.3 Despeje de Cinta por Manipulador 4-DOF (`BELT_PERMIT_RUN`)
1. Al llegar una pieza de Tipo 4 o 5 al extremo final de la cinta (`VW318 = 1800` pulsos), la cinta se detiene[cite: 2, 6].
2. El PLC 1 emite la orden de recogida `CMD_START` hacia el PLC 6 (`VB687.0` → `V100.0` remoto).
3. El brazo desciende, cierra su pinza electromagnética y eleva el Eje Y 5,000 pulsos[cite: 9].
4. En cuanto la pieza se despega de la cinta, el PLC 6 conmuta **`V200.6 = 1` (`BELT_PERMIT_RUN`)**[cite: 9].
5. En el siguiente ciclo del carrusel, el PLC 1 recibe esta confirmación (`VB667.6 = 1`) y autoriza al PLC 5 a arrancar la cinta nuevamente, optimizando la cadencia general de la celda mientras el brazo completa su depósito en la mesa exterior[cite: 2, 6, 9].