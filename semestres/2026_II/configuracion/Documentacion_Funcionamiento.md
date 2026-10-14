# MANUAL TÉCNICO DE FUNCIONAMIENTO Y OPERACIÓN DE LA CELDA
## Celda de Manufactura Flexible XL-335B + Brazo Robótico 4-DOF + VFD Powtran PI9100A[cite: 2]

---

## 1. INTRODUCCIÓN Y ARQUITECTURA GENERAL

La celda flexible de manufactura **XL-335B** es una línea mecatrónica modular de ensamble, procesamiento y clasificación automática, complementada en su estación de salida por un **Manipulador Robótico Articulado 4-DOF**[cite: 2].

La arquitectura de control está distribuida en **seis autómatas programables industriales Siemens SIMATIC S7-200** interconectados en un único bus multipunto RS-485 bajo protocolo **PPI a 19,200 baudios**[cite: 2].

```text
======================= BUS PPI RS-485 (19,200 bps) =======================
   |            |            |            |            |            |
 Port 1       Port 0       Port 0       Port 0       Port 0       Port 0
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+
|  PLC 1   | |  PLC 2   | |  PLC 3   | |  PLC 4   | |  PLC 5   | |  PLC 6   |
|Transporte| |Alimentac.| |Ensamblaje| |Procesam. | |Selección | |Brazo 4DOF|
|CPU 226CN | |CPU 224CN | |CPU 226CN | |CPU 224CN | |CPU 224XP | |CPU 224CN |
|ID PPI = 1| |ID PPI = 2| |ID PPI = 3| |ID PPI = 4| |ID PPI = 5| |ID PPI = 6|
+----+-----+ +----------+ +----------+ +----------+ +----+--+---+ +----------+
     | Port 0                                            |  | Port 1
     | Modbus RTU Esclavo                                |  | Modbus RTU Maestro
     | 19,200 bps                           AQW0 (0-10V) |  | 19,200 bps
     v                                                   v  v
+------------+                                      +------------+
| Web SCADA  |                                      |VFD Powtran |
|    SPA     |                                      |  PI9100A   |
+------------+                                      +------------+
```

### Principio de Autonomía Descentralizada y Tolerancia a Fallos
La celda opera en modo automático de forma **100% autónoma y descentralizada**[cite: 2]. La coordinación cinemática, los interbloqueos de seguridad y el intercambio de eventos se resuelven en tiempo de ciclo de PLC mediante las tablas `NETR`/`NETW` a través de la red PPI coordinadas por el PLC 1[cite: 2, 5]. La desconexión del ordenador de supervisión (Web SCADA) **nunca detiene ni altera la producción en curso**[cite: 2, 6].

---

## 2. FILOSOFÍA DE MANDOS, LÓGICA ELÉCTRICA Y SEGURIDAD

### 2.1 Especificación Eléctrica de Mandos
- **SB1 (Pulsador de Marcha / Continuar tras Pausa):** Contacto **Normalmente Abierto (NA)**.
  - En reposo (no presionado): Contacto abierto $\to$ Entrada lógica en PLC = `0` (0 VDC).
  - Accionado (presionado): Contacto cerrado $\to$ Entrada lógica en PLC = `1` (24 VDC).
  - La activación se evalúa mediante detección de flanco positivo (`EU`).
- **SB2 (Pulsador de Pausa Momentánea de Ciclo):** Contacto **Normalmente Abierto (NA)**.
  - En reposo (no presionado): Contacto abierto $\to$ Entrada lógica en PLC = `0` (0 VDC).
  - Accionado (presionado): Contacto cerrado $\to$ Entrada lógica en PLC = `1` (24 VDC).
  - Provoca que la estación concluya el movimiento físico en ejecución y pase a estado de pausa/espera.
- **QS (Seta de Parada de Emergencia):** Contacto **Normalmente Cerrado (NC)** bajo principio de seguridad positiva (*fail-safe*)[cite: 2].
  - En reposo / Desenclavada: Contacto cerrado $\to$ Entrada lógica en PLC = `1` (24 VDC)[cite: 2].
  - Accionada (golpe de emergencia): Contacto abierto $\to$ Entrada lógica en PLC = `0` (0 VDC). Desenergiza inmediatamente salidas críticas y trenes de impulsos PTO[cite: 2, 9].
  - **Protocolo de Rearme Seguro:** Al desenclavar la seta física QS (retorno a `1`), la celda permanece en estado congelado/pausado. **Es mandatorio presionar físicamente SB1 (Marcha)** para reanudar el ciclo de manufactura exactamente desde el paso activo previo a la parada.
- **SA1 (Selector Rotatorio de Modo):** Conmutador de 2 posiciones[cite: 7, 8].
  - Posición `1` = Modo Automático normal continuo[cite: 2, 6, 7, 8].
  - Posición `0` = Modo Manual / Diagnóstico y Calibración[cite: 2, 6, 7, 8].

### 2.2 Señalización por Balizas y Lámparas (HL1, HL2, HL3)
- **HL1 (Lámpara Verde):** Operación en ciclo automático normal (luz fija continua)[cite: 2, 6, 7, 8].
- **HL2 (Lámpara Amarilla):** Proceso en pausa por SB2, esperando reabastecimiento en silo, o celda en espera de rearme (luz continua o intermitente según el estado)[cite: 2, 6, 7, 8].
- **HL3 (Lámpara Roja):** Parada de emergencia activa (QS accionada), falla crítica por tiempo de carrera excedido (atasco mecánico) o desconexión de red[cite: 2, 6, 7, 8].

---

## 3. SECUENCIA OPERATIVA Y CINEMÁTICA DETALLADA POR UNIDAD

### 3.1 Unidad 1: Carro de Transporte y Manipulador Principal (PLC 1 - CPU 226CN)
El carro de transporte se desplaza longitudinalmente sobre una cremallera dentada impulsada por un servomotor gobernado por tren de impulsos de alta velocidad (PTO 0, `Q0.0`) y dirección (`Q0.2`)[cite: 2, 7]. El manipulador dispone de un cilindro elevador vertical (`Q0.3`), un actuador rotatorio (`Q0.4`/`Q0.5`), un cilindro horizontal de doble vástago (`Q0.6`) y una pinza neumática (`Q0.7`/`Q1.0`)[cite: 2, 7].

#### Orientación de la Garra y Cinemática Angular
- **Orientación Predeterminada (Giro Horario `Q0.5`):** Durante el reposo y en las operaciones sobre Alimentación, Ensamblaje y Procesamiento, la garra apunta hacia la derecha de la bancada (zona de nidos)[cite: 2, 7].
- **Orientación de Descarga en Selección (Giro Antihorario `Q0.4`):** Para depositar la pieza en la cinta transportadora de Selección, el actuador neumático debe girar en sentido antihorario, alineando la pieza con el eje central de avance de la banda[cite: 2, 7].

#### Trayectoria Cinemática y Flujo No Monotónico
La distribución física de izquierda a derecha en la celda es[cite: 2]:
$$\text{Alimentación} \to \text{Procesamiento} \to \text{Ensamblaje} \to \text{Selección}$$
El ciclo de manufactura exige ensamblar el núcleo antes de prensarlo[cite: 2]:
1. **Recogida en Alimentación:** Carro en cota 0 (origen inductivo `I0.0`)[cite: 2, 7]. Extiende doble vástago, desciende vertical, cierra pinza sobre pieza base, asciende y retrae[cite: 2].
2. **Entrega en Ensamblaje:** El carro avanza de largo cruzando frente a Procesamiento hasta alcanzar la cota de Ensamblaje[cite: 2]. Extiende doble vástago, desciende, abre pinza, asciende y retrae[cite: 2]. Notifica por PPI al PLC 3 la entrega de pieza (`CMD_PIEZA_ENTREGADA`) y autoriza al PLC 2 la siguiente dosificación (`CMD_AUTORIZAR_DOSIF`)[cite: 2].
3. **Discriminación de Ruta:**
   - **Piezas Normales (Tipos 1 a 4):** Tras recibir confirmación de ensamble finalizado (`STAT_DONE = 1` de PLC 3), el carro toma la pieza en Ensamblaje, **retrocede físicamente a la cota de Procesamiento**, desciende y entrega la pieza en la mordaza de la prensa[cite: 2]. Tras el prensado, vuelve a tomarla y avanza hacia Selección[cite: 2].
   - **Pieza Negra Especial (Tipo 5):** Al detectarse plástico negro en el nido de Ensamblaje, el carro recoge la pieza y ejecuta un **Bypass directo hacia Selección**, sobrevolando Procesamiento sin depositar la pieza en la prensa[cite: 2, 6].
4. **Descarga en Selección:** El carro arriba a Selección, conmuta el actuador rotatorio a sentido antihorario (`Q0.4`), extiende doble vástago, desciende, abre pinza en la entrada de la cinta (`I0.3` de PLC 5) y regresa a su orientación horaria de reposo[cite: 2, 7, 8].

#### Supervisión de Sensores de Fin de Carril (`I2.0`, `I2.1`, `I2.2`)
Debido a la saturación física de entradas en la CPU 224XP de Selección, los tres sensores capacitivos ubicados al final de los toboganes de clasificación están cableados directamente a las entradas `I2.0`, `I2.1` e `I2.2` del PLC 1[cite: 6, 7]. El PLC 1 los utiliza para contadores estadísticos de producción y confirmación de evacuación exitosa hacia el SCADA, eliminando requerimientos temporales críticos en el bus PPI[cite: 6, 7].

#### Tabla de Cotas Absolutas del Carro (PLC 1, pulsos PTO 0)

| Estación | Registro V | Cota | Observación |
|---|:---:|---:|---|
| Alimentación (A) | `VD204` | **0** | Coincide con el sensor inductivo de Home `I0.0` |
| Procesamiento (P) | `VD208` | 45,500 | Recepción en mordaza de prensa (maniobra de retroceso desde E) |
| Ensamblaje (E) | `VD212` | 87,500 | Nido de ensamble |
| Selección (S) | `VD216` | 107,500 | Entrada de la cinta |
| Límite software máximo | `VD222` | 116,000 | Ninguna cota puede superarlo |
| Límite software mínimo | `VD226` | −1,000 | Ninguna cota puede ser inferior |

Las cotas se ajustan en vivo (tabla de estado de Micro/WIN o SCADA `VD1110..VD1122`) sin recompilar. Solo se reponen por defecto si la firma `VW220 ≠ 16#C07F` (memoria V perdida).

#### Home Inductivo vs. Finales de Carrera de Seguridad

| Elemento | Entrada | Naturaleza | Función |
|---|:---:|---|---|
| Sensor inductivo de Home | `I0.0` | Referencia | Define el cero absoluto (`VD250 = 0`). Es la cota de Alimentación. |
| Final de carrera izquierdo | `I0.1` (NA) | Seguridad | Corta el tren de pulsos hacia la izquierda e invalida la referencia |
| Final de carrera derecho | `I0.2` (NA) | Seguridad | Corta el tren de pulsos hacia la derecha e invalida la referencia |

**Secuencia de homing (`SBR_HOMING`):**
1. Si `I0.0` ya está activo, el carro sale 3,000 pulsos a la derecha (2 kHz).
2. Búsqueda rápida a la izquierda (8 kHz). El flanco ascendente de `I0.0` dispara la interrupción hardware Evento 0 (`INT_HOME_I00`), que detiene el PTO sin esperar al scan.
3. Retroceso a la derecha `VD240` pulsos (2 kHz).
4. Aproximación lenta a la izquierda (1 kHz). Al capturar el flanco de `I0.0`: `VD250 = 0`, referencia válida (`M13.3 = 1`).
5. Si se alcanza `I0.1`, se agota el recorrido o se pulsa QS: homing fallido (`M7.2`, HL3 roja).

Sin referencia válida `SBR_MOVE_PTO` no emite pulsos (`M7.7`). En Manual, SB1 en reposo lanza el homing automáticamente si hace falta; en Automático el ciclo re-referencia solo y retoma el paso interrumpido.

---

### 3.2 Unidad 2: Estación de Alimentación (PLC 2 - CPU 224CN)
Almacena y suministra cilindros base mediante una columna de gravedad instrumentada[cite: 2].
1. **Supervisión de Nivel en Silo:**
   - `I0.5` (Sensor Superior): Confirma existencia de stock adecuado ($\ge 3$ piezas)[cite: 2, 6]. Si se apaga con la base llena, alerta nivel bajo en HL2[cite: 2].
   - `I0.6` (Sensor Inferior): Confirma presencia de pieza en la base del silo[cite: 2].
   - `I0.7` (Sensor Inductivo): Realiza la inspección física del material: Metálico (`1`) o Plástico (`0`)[cite: 2, 6].
2. **Ciclo de Dosificación Protegido y Triangulación:**
   - La estación no dosifica automáticamente al azar. Dosifica únicamente tras recibir la orden remota `CMD_AUTORIZAR_DOSIF` emitida por Transporte cuando la pieza previa ha sido entregada en el nido de Ensamblaje.
   - **Condición de Bloqueo Local:** Aunque reciba la orden de dosificación, el PLC 2 no cicla sus cilindros si el sensor de presencia en cuna de salida (`I0.4`) se encuentra en `1`, previniendo colisiones por acumulación física.
3. **Mecánica de Dosificación:**
   - El cilindro superior sujetador (`Q0.0`) extiende reteniendo la segunda pieza de la columna[cite: 2].
   - El cilindro inferior empujador (`Q0.1`) extiende empujando la pieza hacia la cuna de salida (`I0.4 = 1`)[cite: 2].
   - Tras la retirada de la pieza por el carro de transporte, el cilindro inferior retrae (`I0.3 = 1`)[cite: 2].
   - El cilindro superior retrae (`I0.1 = 1`), permitiendo que la columna descienda un paso por gravedad[cite: 2].

---

### 3.3 Unidad 3: Estación de Ensamblaje (PLC 3 - CPU 226CN)
Recibe la pieza base en su nido, verifica su reflectancia óptica, dosifica un núcleo desde su silo gravimétrico y lo ensambla a presión mediante un manipulador Pick & Place con plato oscilante[cite: 2].

1. **Recepción en Nido y Sensor Omron E3X-NA11 (`I0.4`):**
   - El sensor de fibra óptica reflectiva Omron E3X-NA11 apunta al nido receptor[cite: 2, 6]:
     - Cilindro metálico o de plástico blanco: Refleja la luz modulada $\to$ `I0.4 = 1`[cite: 2, 6].
     - **Cilindro de plástico negro:** Su superficie mate absorbe el haz luminoso $\to$ `I0.4 = 0`[cite: 2, 6].
   - **Gestión Anti-Bloqueo:** El PLC 1 envía obligatoriamente la bandera de red `CMD_PIEZA_ENTREGADA` tras finalizar el place. Si esta bandera se activa pero `I0.4 = 0`, el PLC 3 reconoce inmediatamente la presencia de una pieza negra, cancela la dosificación de núcleo y reporta fin de ciclo al PLC 1 para iniciar el Bypass directo hacia Selección[cite: 2, 6].
2. **Dosificación en Silo de Núcleos (Mangueras Invertidas y Protección Térmica):**
   - La distancia física entre cilindros dosificadores es de **3.5 cm**[cite: 2, 6].
   - **Cilindro Inferior (Base de apoyo `Q0.0`):** Conexión neumática invertida para estar **Normalmente Extendido en reposo** con bobina desenergizada. Soporta permanentemente el peso de la columna sin calentar la electroválvula. Para dosificar, se energiza para retraer brevemente y vuelve a extenderse.
   - **Cilindro Superior (Retenedor de cascada `Q0.1`):** Conexión estándar **Normalmente Retraído en reposo**.
   - **Secuencia:** Cilindro superior extiende (sujeta segundo núcleo) $\to$ Cilindro inferior retrae (cae 1 núcleo al nido del plato que está bajo el silo) $\to$ Cilindro inferior extiende (reestablece base) $\to$ Cilindro superior retrae (la columna baja un nivel por gravedad).
3. **Plato Rotatorio de Dos Nidos y Supervisión Anti-Traba:**
   - El plato tiene **un nido en cada extremo**. Los sensores son fijos: `I0.2` ve el nido que queda bajo el silo y `I0.3` el que queda bajo la pinza. `I1.1` / `I1.2` son las dos posiciones; `Q0.2 = M7.6` (posición ordenada).
   - La estación mantiene **ambos nidos con núcleo**: si el nido del silo tiene núcleo y el de la pinza no, gira 180°; si el nido del silo está vacío, dosifica. Detalle en la sección 6.13.
   - **Anti-traba:** 2.0 s sin llegar a la posición ordenada → alarma de atasco (foco rojo). El plato **no** se desenergiza por una alarma (no debe moverse con la pinza encima); solo la seta lo devuelve a `I1.1`.
4. **Manipulador Pick & Place de Núcleo:**
   - Secuencia: Bajar vertical (`Q0.4`) → Cerrar pinza (`Q0.3`, 0.5 s) → Subir → Extender horizontal hacia el nido (`Q0.5`) → Bajar e insertar a presión (0.6 s) → Abrir pinza abajo (0.4 s) → Subir → Retraer horizontal.
   - La pinza solo tiene sensor de **cerrada** (`I1.3`), que con el núcleo dentro puede no activarse: el cierre se confirma por tiempo y `I1.3` solo se usa para medir el Δt.
   - Notifica por bandera PPI a Transporte (`STAT_DONE = 1`) que el ensamble fue completado con éxito.

---

### 3.4 Unidad 4: Estación de Procesamiento (PLC 4 - CPU 224CN)
Realiza el conformado mecánico del producto ensamblado mediante una prensa neumática[cite: 2, 6].
1. **Recepción:** El carro de Transporte retrocede desde Ensamblaje y coloca la pieza ensamblada en la mordaza receptora (`I0.0 = 1`). En Automático el ciclo arranca **solo** con el aviso `CMD_PIEZA_ENTREGADA` (que Transporte envía cuando su pinza ya soltó, subió y se retiró) o con SB1 local con la pieza presente, y además espera **0.8 s** (`T40`) con la pieza asentada antes de cerrar la mordaza. Antes arrancaba al ver la pieza si la marcha estaba enclavada, y la mordaza y el carro se movían con la pinza de Transporte aún sujetándola.
2. **Ciclo de Estampado Doble Secuencial:**
   - La pinza de sujeción cierra (`Q0.0 = 1`, confirmado por `I0.1 = 1`)[cite: 2, 6].
   - El carro horizontal avanza hacia la bancada de prensado (`Q0.2 = 1`, confirmado por `I0.2 = 1`)[cite: 2, 6].
   - **Primer Estampado:** Cilindro de prensa desciende (`Q0.3 = 1` hasta `I0.5 = 1`), sostiene presión según tiempo calibrado en memoria V (nominal: 500 ms) y asciende (`Q0.3 = 0` hasta `I0.4 = 1`)[cite: 2, 4, 6].
   - **Segundo Estampado:** Inmediatamente desciende de nuevo (`Q0.3 = 1` hasta `I0.5 = 1`), sostiene presión y asciende a cota superior (`Q0.3 = 0` hasta `I0.4 = 1`)[cite: 2, 6].
   - El carro horizontal retrocede a la cota de recogida (`Q0.2 = 0` hasta `I0.3 = 1`)[cite: 2, 6].
   - La pinza abre (`Q0.0 = 0`), liberando la pieza y notificando al PLC 1 para su traslado a Selección[cite: 2, 6].

---

### 3.5 Unidad 5: Estación de Selección y Cinta con VFD (PLC 5 - CPU 224XP-CN)
Transporta y clasifica los productos según su combinación de materiales mediante una cinta motorizada gobernada por un variador Powtran PI9100A y tres cilindros desviadores a rampas[cite: 2, 6, 8].

1. **Alimentación de Banda e Inspección en Tránsito:**
   - El sensor de entrada `I0.3` detecta la entrega de pieza por Transporte[cite: 2, 8]. La cinta arranca con rampa de aceleración de **1.0 segundo** a 30.0 Hz[cite: 2].
   - A **10 cm de la entrada** (cota $\approx 400$ pulsos en encoder), la pieza cruza el puente de detección en movimiento continuo[cite: 2, 6, 8]:
     - Sensor inductivo lateral (`I0.5`): Determina base metálica (`1`) o plástica (`0`)[cite: 2, 6, 8].
     - Sensor óptico vertical (`I0.4`): Determina núcleo reflectivo (`1`) o ausente/oscuro (`0`)[cite: 2, 6, 8].
2. **Posicionamiento Autónomo por Interrupciones de Hardware HSC0:**
   - Rodillo motriz acoplado a un encoder incremental conectado a entradas rápidas del contador `HSC0` (`I0.0`, `I0.1`)[cite: 2, 8].
   - El posicionamiento se gobierna mediante el **Evento de Interrupción de Hardware 12 (`CV = PV`)**, garantizando exactitud milimétrica independiente del tiempo de scan del autómata y libre de retrasos de la red PPI.
3. **Dinámica de Frenado y Parada de 2 Segundos:**
   - Cotas calibradas en palabras de memoria V:
     - `VW310`: Cota Sensor Inspección (2080 cuentas: centro de la zona donde inductivo y fibra ven la pieza, 1990-2170).
     - `VW312`: Cota Carril 1 (2737 = media 2837 - 100 de frenada).
     - `VW314`: Cota Carril 2 (4322 = 4422 - 100).
     - `VW316`: Cota Carril 3 (5945 = 6045 - 100).
     - `VW318`: Cota Fin de Cinta hacia Brazo 4-DOF (7769, medida en la corrida 2). Reducción a 18 Hz en `VW322..VW328` = cota final - 500.
   - Al alcanzar la cota designada (Carriles 1, 2 o 3), la cinta desacelera con rampa de 1.0 s y **permanece detenida durante 2.0 segundos**.
   - **Asentamiento (Paso 25):** el desviador no actúa hasta `VW394` (0.7 s) después de la orden de paro, cuando la pieza ya quedó quieta frente al pistón.
   - El cilindro desviador correspondiente (`Q0.4`, `Q0.5` o `Q0.6`) extiende, empuja la pieza a la rampa y retrae[cite: 8].
   - Cumplidos los 2.0 segundos y confirmado el retroceso del vástago, la cinta reanuda la marcha.
   - **Excepción para Tipos 4 y 5:** La cinta no se detiene en los carriles intermedios; avanza de forma continua hasta alcanzar la cota de fin de cinta (`VW318`), donde se detiene para la extracción por el Brazo 4-DOF[cite: 2, 6, 9].
4. **Gobierno y Telemetría del Variador Powtran PI9100A:**
   - Frecuencia nominal máxima fijada en **50.0 Hz** (`F0.19`)[cite: 2, 6].
   - El PLC 5 mantiene activas las lecturas Modbus por su Puerto 1 en **ambos modos** para reportar en tiempo real la frecuencia de salida, corriente del motor y tensión del bus DC hacia el sistema de supervisión[cite: 2, 6].

#### 4.1 Modos de Control del VFD (conmutables en RAM, sin desgaste de EEPROM)

| | **MODO 1 — Analógico / Digital** | **MODO 2 — Modbus Puro (por defecto)** |
|---|---|---|
| Selector | `VW308 = 1` | `VW308 = 2` |
| `F0.03` Fuente de frecuencia (RAM `0x0003`, Modbus 40004) | `2` = AI1 (0-10 V) | `9` = Comunicación |
| `F0.11` Fuente de comandos (RAM `0x000B`, Modbus **40012**) | `1` = Bornes DI | `2` = Comunicación |
| Marcha | `Q0.0 = 1` (DI1) | `0x2000` (Modbus 48193) = `1` Run FWD |
| Paro | `Q0.0 = 0` | `0x2000 = 6` (deceleración) o `5` (inercia, emergencia) |
| 30.0 Hz (tránsito) | `AQW0 = +19200` (`VW370`) | `0x1000` (44097) = `6000` (`VW366`) |
| 18.0 Hz (aproximación) | `AQW0 = +11520` (`VW372`) | `0x1000 = 3600` (`VW368`) |
| Puerto 1 | Solo telemetría | Órdenes + telemetría |

- **Rampas en RAM:** `0x000D` (F0.13) = `VW362` (10 = 1.0 s), `0x000E` (F0.14) = `VW364` (5 = 0.5 s), con `F0.15 = 1` (base 0.1 s).
- **Corrección crítica:** `F0.11` se escribía en 40018 (`0x0011` = `F0.17`, ajuste de portadora, rango 0-1). El variador rechazaba la trama y nunca pasaba el canal de comandos a comunicación. Según el manual Powtran (§I-3, ejemplo `F3.12 → F30C`) la dirección correcta es `0xF00B` → RAM `0x000B` → **40012**.
- **Orden única de cinta `VW350`:** se calcula en un solo punto (`SBR_ACTUADORES`): `0` paro, `1` 30 Hz (Auto pasos 10/15, Manual paso 70), `2` 18 Hz (Auto paso 20), `3` inercia (QS local o estop remoto). En Modo 1 se traduce a `Q0.0`/`AQW0` en el mismo scan; en Modo 2 la despacha la máquina Modbus.
- **Conmutación:** por red (`VB102` del PLC 5 = 1 ó 2, enviado desde `VW1016` del SCADA) o en la tabla de estado (`VW308`). Solo se acepta con la cinta parada; la máquina Modbus reescribe `F0.03`/`F0.11` en RAM y fuerza el reenvío del paro.

#### 4.2 Máquina de Estados Modbus `VW340` (Puerto 1)

| Paso | Trama | Siguiente |
|:---:|---|:---:|
| 0 | Espera de `MBUS_CTRL_P1` inicializado | 100 |
| 10 / 20 / 30 / 40 | RAM `0x000D`, `0x000E`, `0x0003`, `0x000B` | 20 / 30 / 40 / 100 |
| 100 | Reposo: prioridad Config RAM > Orden (Modo 2) > Telemetría | — |
| 110 → 112 | `0x1000 = 6000` → `0x2000 = 1` | 100 (orden confirmada: `VW352 = VW350`) |
| 120 → 112 | `0x1000 = 3600` → `0x2000 = 1` | 100 |
| 130 → 132 | `0x2000 = 6` → `0x1000 = 0` | 100 |
| 140 | `0x2000 = 5` | 100 |
| 200 | Lectura `0x1001..0x1004` → `VW400..VW406` (cada 200 ms) | 100 |

- **Una sola instancia `MBUS_MSG_P1`** con parámetros en `VB374..VD382`; `EN` (`M14.2`) se mantiene hasta `Done` (`M14.1`) y `First` (`M14.4`) dura un único scan.
- **Errores:** código en `VB344` (MSG) / `VB345` (CTRL); watchdog `T45` de 3 s (error 99); hasta `VB343 = 3` intentos por trama. Agotados: alarma `M14.6` (HL3 intermitente, `STAT` bit 5), paso fallido en `VW358` y **salida limpia al Paso 100**: los parámetros RAM fallidos se reintentan cada 10 s con la cinta parada y las órdenes se re-despachan tras 1 s.
- **Memoria de la librería:** `VB4000..VB4299` reservada exclusivamente (antes los bytes de error `VB4100/VB4101` caían dentro de ella).

#### 4.3 Prueba Manual de Cinta (Paso 70)
1. SB1 en Paso 60 → Paso 70: `VW350 = 1`.
2. Confirmación de marcha (`M11.7`): inmediata en Modo 1; en Modo 2 cuando el variador aceptó `0x1000` y `0x2000 = 1` (`VW352 = 1`). Watchdog de despacho `T48` = 6.0 s → alarma `M14.6` y retorno a reposo.
3. Ventana de prueba `T44 = VW388` (10.0 s) contada **desde la confirmación**: 1.0 s de rampa + 9 s de movimiento visible a 30 Hz. `M12.1 = 1` si la telemetría confirma frecuencia real > 5 Hz.
4. Fin → Paso 0 → paro decelerado. SB2 aborta en cualquier momento.

---

### 3.6 Unidad 6: Manipulador Robótico 4-DOF (PLC 6 - CPU 224CN)
Mecanismo pantógrafo articulado con cinemática 100% electromecánica impulsada por motores paso a paso NEMA y pinza con solenoide electromagnético (`Q0.7`), sin actuadores neumáticos[cite: 9].

1. **Multiplexación de Ejes por Salidas PTO:**
   - **Eje Z (Rotación de Base):** Controlado por `PTO 0` (`Q0.0` pulsos, `Q0.2` dirección)[cite: 9].
   - **Ejes X e Y:** Controlados por `PTO 1` (`Q0.1`) multiplexada mediante relés con retardo de estabilización[cite: 9]:
     - Relé `K1` (`Q0.5`): Conecta PTO 1 al Driver del Eje X con dirección en `Q0.3`[cite: 9].
     - Relé `K2` (`Q0.6`): Conecta PTO 1 al Driver del Eje Y con dirección en `Q0.4`[cite: 9].
2. **Secuencia de Homing Estricta:**
   - Al energizar o tras pulsar Reset (`I0.6`), el brazo ejecuta obligatoriamente su ciclo de referenciado[cite: 9]:
     $$\text{Eje Y sube a } I0.3 \to \text{Eje X retrae a } I0.1 \to \text{Apertura de Pinza } Q0.7 \to \text{Eje Z busca inductivo } I0.0 \text{ (horario)}$$[cite: 9]
3. **Misión Operativa y Despeje Dinámico de Banda (`BELT_PERMIT_RUN`):**
   - Retira del extremo de la cinta (`VW318`) las piezas de Tipo 4 y Tipo 5, depositándolas en la misma mesa de descarga exterior[cite: 2, 6, 9].
   - **Despeje Inmediato de Cinta:** El brazo desciende y aprisiona la pieza con el solenoide `Q0.7`[cite: 9]. **Apenas el Eje Y asciende 5,000 pulsos elevando la pieza fuera del plano de la cinta**, el PLC 6 conmuta en red la bandera **`BELT_PERMIT_RUN = 1`**[cite: 9].
   - Esta confirmación autoriza a Selección y Transporte a reiniciar el avance de la cinta y procesar la siguiente pieza sin esperar a que el brazo concluya la descarga exterior[cite: 2, 6, 9].

4. **Flujo de Integración PPI Selección ↔ Transporte ↔ Brazo 4-DOF:**

```text
 PLC 5 SELECCION              PLC 1 TRANSPORTE (MAESTRO)             PLC 6 BRAZO 4-DOF
 ==============               ==========================             =================
 Pieza Tipo 4/5 en VW318
 INT0: VW330 = 60
 V200.6 STAT_ROBOT_WAIT = 1 --NETR--> VB627.6 = 1
                                      Brazo READY (VB667.0) y
                                      HOMED (VB667.7)?
                                      SI: M20.0 = 1
                                      VB706.0 -> VB687.0 --NETW--> V100.0 (flanco) -> M1.0
                                                                   [Sec.1 si no esta en toma]
                                                                   Bucle: cierra pinza Q0.7
                                      VB667.1 BUSY <-------NETR--- V200.1 STAT_BUSY = 1
                                      M20.1 = 1                    Eje Y sube 5000 p
                                      VB667.6 <------------NETR--- V200.6 BELT_PERMIT_RUN = 1
                                      M20.2 = 1
 V100.6 (flanco) -> M6.6 <--NETW----- VB705.6 -> VB647.6
 Paso 60 -> 0, cinta libre
 V200.6 = 0 ------------------NETR--> VB627.6 = 0
                                      Fin de mision (M20.0..2 = 0)  Descarga en mesa exterior
                                      VB667.2 (flanco) <---NETR--- V200.2 STAT_DONE = 1
                                      VW1188 / VW1190 + 1
```

   - **Entrega única de comandos:** el PLC 1 copia cada solicitud (`VB702..VB706`) al buffer `NETW` al lanzar la transacción y la borra al confirmarse; si falla, la reencola. Los esclavos actúan por **flanco**, por lo que una reescritura nunca duplica una orden.
   - **Robustez:** la orden de recogida se reenvía si el brazo no la acepta en 5 s (`T134`); el permiso de cinta se reenvía si Selección sigue esperando 3 s después (`T135`); brazo ocupado 30 s sin permiso → alarma `M20.3` (HL3).
   - Las trayectorias validadas del brazo (Secuencias 1, 2, 3 y retorno) **no se modificaron**; solo se reubicaron sus palabras de paso (`VW320`/`VW322`) para no solapar el buffer PPI `VB100..VB103`.

---

## 4. MATRIZ MAESTRA DE CLASIFICACIÓN (5 TIPOS DE PIEZAS)

| Tipo | Base | Núcleo | Condición Sensores en Cinta | Ruta Cinemática en la Celda | Destino y Cota | Dispositivo de Descarga |
|:---:|:---:|:---:|:---:|:---|:---:|:---:|
| **1** | Metal | Metal | `I0.5=1`, `I0.4=1` | Alim $\to$ Ensam $\to$ Retroceso Prensa $\to$ Selección | **Carril 1** (2737 c) | Desviador 1 (`Q0.4`)[cite: 2, 8] |
| **2** | Plástico Blanco | Plástico | `I0.5=0`, `I0.4=0` | Alim $\to$ Ensam $\to$ Retroceso Prensa $\to$ Selección | **Carril 2** (4322 c) | Desviador 2 (`Q0.5`)[cite: 2, 8] |
| **3** | Plástico Blanco | Metal | `I0.5=0`, `I0.4=1` | Alim $\to$ Ensam $\to$ Retroceso Prensa $\to$ Selección | **Carril 3** (5945 c) | Desviador 3 (`Q0.6`)[cite: 2, 8] |
| **4** | Metal | Plástico | `I0.5=1`, `I0.4=0` | Alim $\to$ Ensam $\to$ Retroceso Prensa $\to$ Selección | **Fin de Cinta** (7769 c) | **Brazo 4-DOF**[cite: 2, 6, 9] |
| **5** | **Plástico Negro** | *Ninguno (Bypass)* | `I0.5=0`, `I0.4=0` (Inhibido por PPI) | Alim $\to$ Ensam (Check) $\to$ **BYPASS DIRECTO** Selección | **Fin de Cinta** (7000 c, prov.) | **Brazo 4-DOF**[cite: 2, 6, 9] |

---

## 5. MODO MANTENIMIENTO, DIAGNÓSTICO PREDICTIVO Y CALIBRACIÓN

Al conmutar el selector `SA1` a posición `0` (Modo Manual/Diagnóstico), la planta deshabilita las secuencias automáticas y permite[cite: 2, 6, 7, 8]:
- **Ciclo Individual de Cilindros:** Accionamiento aislado de cada actuador neumático mediante el pulsador local de estación para pruebas de carrera[cite: 2, 6].
- **Medición de Tiempos de Tránsito ($\Delta t$):** Los sensores magnéticos miden el tiempo entre la orden eléctrica y la confirmación física[cite: 2, 6]. Si el tiempo excede la tolerancia por caídas de presión o fugas incipientes, se genera advertencia predictiva en el sistema[cite: 2, 6].
- **Calibración Dinámica de Cotas de Cinta:** Los valores `VW310`, `VW312`, `VW314`, `VW316` y `VW318` pueden modificarse en tiempo real desde el Web SCADA para absorber derivas mecánicas de la banda sin reprogramar el PLC.
---

## 6. PUESTA EN MARCHA EN BANCO (REVISIÓN DE PRUEBAS)

### 6.1 Transporte en Manual: una acción por pulsación de SB1

| Paso | Acción | Señal PPI enviada al terminar | Condición para avanzar con SB1 |
|:---:|---|---|---|
| 0 | Reposo (sin referencia: SB1 o SB2 lanzan el homing) | — | PLC 2 no está empujando |
| 1 | Recoger en Alimentación | `CMD_RETIRO_CONFIRMADO` → PLC 2 | — |
| 2 | Viaje a Ensamblaje (`VD212`) | — | — |
| 3 | Dejar en el nido de Ensamblaje | `CMD_PIEZA_ENTREGADA` → PLC 3, `CMD_AUTORIZAR_DOSIF` → PLC 2 | PLC 3 terminó (`STAT_DONE`) o sin red |
| 4 | **Recoger** la pieza ensamblada | `CMD_RETIRO_CONFIRMADO` → PLC 3 | Tipo 5 (negra) salta al paso 8 |
| 5 | Retroceso a Procesamiento (`VD208`) | — | — |
| 6 | **Dejar** en la mordaza de la prensa | `CMD_PIEZA_ENTREGADA` → PLC 4 (prensado) | PLC 4 terminó o sin red |
| 7 | **Recoger** la pieza prensada | `CMD_RETIRO_CONFIRMADO` → PLC 4 | — |
| 8 | Viaje a Selección (`VD216`) con rebote si toca el FC derecho | — | Selección lista (`STAT_READY`) o sin red |
| 9 | Dejar en la cinta (giro antihorario) | Tipo + `CMD_PIEZA_ENTREGADA` → PLC 5 | — |
| 10 | Retorno a Alimentación **con re-referencia** (homing + `VD204`) | — | Vuelve al paso 0 |

Las estaciones 2 a 6 trabajan en su propio modo Automático: Alimentación repone una base sola cada vez que su cuna queda libre (marcha continua tras SB1 local, `CMD_START` o la primera autorización del PLC 1), y Ensamblaje, Procesamiento, Selección y el Brazo responden a las señales de la tabla. La coordinación Selección ↔ Brazo funciona también con Transporte en Manual.

### 6.1b Pulsaciones de SB1 en Manual
Una pulsación de SB1 hecha en reposo o mientras el carro espera queda memorizada (`M26.2`): el paso se ejecuta en cuanto la estación destino está lista, sin volver a pulsar. SB2 la anula.
- **Recoger en Alimentación:** pieza en la cuna (PLC 2 `STAT_DONE`).
- **Dejar en Ensamblaje / Procesamiento / Selección:** estación lista (`STAT_READY`; Selección solo lo está en Automático).
- **Recoger en Ensamblaje / Procesamiento:** ciclo terminado (`STAT_DONE`).
- Sin red con esa estación (selector del PLC 1 en TERM o nodo caído) la decisión es del operario y el paso se ejecuta directamente.

### 6.1c Selector físico RUN / TERM del PLC 1 (programación y Tabla de Estado)
| Posición | Puerto 0 | Puerto 1 | Uso |
|---|---|---|---|
| **RUN** (`SM0.7 = 1`) | Modbus esclavo (SCADA) | Maestro PPI: carrusel NETR/NETW | Producción coordinada |
| **TERM** (`SM0.7 = 0`) | PPI esclavo | PPI esclavo, sin carrusel | Con el programa en RUN (desde Micro/WIN) el PC es el único maestro: programa, ve la Tabla de Estado del PLC 1 y escanea los PLC 2..6. Transporte funciona en Manual; las estaciones se consideran sin red. |

Con el selector en RUN el PC solo puede convivir con el PLC 1 como maestro si el cable PC/PPI está configurado como red multimaestro (Ajustar interfaz PG/PC → PC/PPI → Propiedades → "Red multimaestro", dirección 0, dirección más alta 31, 19.2 kbit/s).

### 6.2 Rebote en el final de carrera derecho al llegar a Selección
Si en el viaje hacia `VD216` se acciona `I0.2`, el PTO se corta, el carro retrocede `VD288` pulsos (1,500 por defecto) a 2 kHz hasta liberar el final de carrera y la llegada se da por buena: se deja la pieza en la cinta. La posición exacta queda invalidada y el retorno (Manual paso 10 / Automático paso 10) re-referencia sobre `I0.0`. Un choque con el FC en cualquier otro viaje sigue siendo alarma (`M7.6`).

### 6.3 Calibración de cotas desde la Tabla de Estado (Micro/WIN)
Con Transporte en Manual, referenciado y en reposo o esperando SB1:

| Dirección | Formato | Uso |
|---|---|---|
| `VD250` | Con signo | Posición absoluta actual (lectura) |
| `VD280` | Con signo | Pulsos por toque de jog (100 por defecto) |
| `V284.0` | Bit | Escribir `1`: jog a la derecha `VD280` pulsos (se borra solo) |
| `V284.1` | Bit | Escribir `1`: jog a la izquierda `VD280` pulsos (se borra solo) |
| `VD204` / `VD208` / `VD212` / `VD216` | Con signo | Cotas A / P / E / S (escribir el valor de `VD250` al alinear) |
| `VD244` | Con signo | Offset de Home: corrige un desfase uniforme de todas las cotas |
| `VD288` | Con signo | Retroceso del rebote en Selección |

Procedimiento: llevar el carro a la estación con SB1 (paso de viaje), alinear la garra con el nido mediante `V284.0` / `V284.1` y copiar `VD250` a la cota correspondiente. Si todas las estaciones están desfasadas la misma distancia en el mismo sentido, basta con `VD244 = desfase` (positivo si el carro se pasa hacia Selección).

### 6.4 Baliza Grande de Planta (PLC 3: `Q0.6` roja, `Q0.7` amarilla, `Q1.0` verde)
El PLC 1 resume el estado de toda la celda en `VB37` y lo envía al PLC 3 (`VB102`) en cada ciclo PPI junto con un contador de vida (`VB103`). Espejo en el SCADA: registro 40026 (`VW1050`).

| Estado de la baliza | Causa |
|---|---|
| **Roja intermitente** | Seta QS pulsada en cualquier estación (PLC 1 `I2.6`, PLC 2/3/4 `STAT` bit 6, PLC 5 `VB210` bit 7), o PLC 3 sin noticias del PLC 1 durante 5 s (roja y amarilla intermitentes) |
| **Roja fija** | Atasco, homing fallido, límite, timeout de maniobra o del Brazo, falla del VFD, o nodo PPI sin respuesta |
| **Verde** | Transporte en Automático y en marcha, sin alarmas |
| **Amarilla intermitente** | Pausa, alerta de fuga o silo vacío |
| **Amarilla fija** | Celda detenida o Transporte en Manual, sin alarmas |

La seta QS del propio PLC 3 enciende la roja intermitente de inmediato sin esperar a la red. Los focos `Q1.5/Q1.6/Q1.7` quedan para el tablero de Ensamblaje.

**¿Por qué está roja?** `VB292` en el PLC 1 (Tabla de Estado en binario; SCADA registro 40029 = `VW1056`):

| Bit | Causa |
|:---:|---|
| 0 | Alarma propia de Transporte (atasco, homing fallido, final de carrera, cota fuera de rango, maniobra) |
| 1 | Brazo sin respuesta (`M20.3`) |
| 2 / 3 / 4 | Atasco en Alimentación / Ensamblaje / Procesamiento (se borra con SB2 de esa estación) |
| 5 | Atasco en Selección o falla de comunicación con el VFD |
| 6 | Un nodo PPI no responde: ver `VB710` (bit 2 = PLC 2 … bit 6 = PLC 6) |
| 7 | Seta QS pulsada en alguna estación (roja intermitente) |

### 6.5 Sentido de giro de la cinta
`VW390` en el PLC 5: `1` = Forward, `2` = Reverse (valor por defecto tras la prueba de banco). En Modo 2 se envía como orden `0x2000`; en Modo 1 la marcha sale por `Q0.0` (DI1) con `VW390 = 1` o por `Q0.1` (DI2) con `VW390 = 2`, con enclavamiento para no activar ambas.

### 6.6 Ensamblaje: diagnóstico y fugas
- Diagnósticos `VB337` (qué espera la estación) y `VB338` (plato y nidos): ver la sección 6.14.
- **Δt neumáticos (alerta de fuga `M4.0`, atasco `M4.1`):** descenso vertical `VW210`, avance horizontal `VW212`, giro del plato hacia `I1.2` `VW214`, retenedor `VW216`, apertura de la base `VW218`, cierre de pinza `VW220` (solo medición, sin atasco), subida vertical `VW222`, giro del plato hacia `I1.1` `VW224`.

### 6.7 Selección: calibración de cotas de la cinta
1. Selección en Automático, en reposo y rearmada. Colocar la pieza de prueba en la entrada.
2. Armar la calibración: `V392.0 = 1` en la Tabla de Estado del PLC 5 (con el PLC 1 en TERM), **o** mantener SB2 pulsado mientras se pulsa SB1.
3. Al pulsar SB1 la cinta marcha a 18 Hz con el contador en cero. `VD412` muestra el contador en vivo (también `HC0`).
4. Los sensores se registran solos. Pulsar SB1 cuando el centro de la pieza pase frente a cada desviador (1ª, 2ª, 3ª pulsación) y frente al punto de toma del Brazo (4ª). La 4ª pulsación detiene la cinta; SB2 aborta. Límite de seguridad: ±15000 cuentas.

| Dirección (con signo) | Dato |
|---|---|
| `VD416` | La pieza deja el sensor de entrada `I0.3` |
| `VD420` / `VD424` | Inductivo `I0.5` empieza / deja de detectar |
| `VD428` / `VD432` | Fibra `I0.4` empieza / deja de detectar |
| `VD436` / `VD440` / `VD444` | Carril 1 / 2 / 3 (pulsaciones de SB1) |
| `VD448` | Fin de cinta (4ª pulsación) |
| `VD452` | Posición final detenida, 2 s después (incluye la frenada) |
| `VB456` | Pulsaciones registradas |

Con estos valores se recalculan `VW310` (inspección), `VW312..VW318` (cotas finales) y `VW322..VW328` (cotas de reducción a 18 Hz).

### 6.8 Enlace Selección → Brazo: diagnóstico
El Brazo se considera listo con su selector en **Automático** y en reposo; si aún no está referenciado, la orden de recogida lanza primero su homing y después encadena la Secuencia 1 y la recogida. `VB286` en el PLC 1 (y registro 40027 en el SCADA) muestra la cadena:

| Bit | Significado |
|:---:|---|
| 0 | Selección espera al Brazo (pieza Tipo 4/5 en fin de cinta) |
| 1 | Brazo listo (PLC 6 en Automático y en reposo) |
| 2 | Brazo referenciado |
| 3 | Brazo ocupado |
| 4 / 5 | Sin red con PLC 5 / PLC 6 |
| 6 | Orden de recogida enviada |
| 7 | Permiso de cinta relevado a Selección |

### 6.9 Arranque de la planta en Automático
1. **Todas las estaciones** con su selector SA1 en Automático y la seta liberada. **Brazo 4-DOF** en Automático (se referencia solo al entrar en Automático o al recibir la primera orden).
2. **Transporte** con el selector físico en **RUN** (no TERM) y SA1 en Automático: **un solo SB1** (o Marcha en el SCADA) arranca toda la celda. Ese SB1 envía a Alimentación, Ensamblaje, Procesamiento y Selección:
   - `CMD_ACK_RESET`: rearma las estaciones que esperan rearme (tras energizar o tras una seta) y borra sus alarmas. A una estación ya rearmada **no** le reinicia el paso, así que se puede pulsar en cualquier momento.
   - `CMD_START`: Alimentación entra en marcha continua, Ensamblaje empieza a preparar núcleos en sus dos nidos y Selección sale de una pausa remota.
3. Transporte hace el homing si no tiene referencia, recoge en Alimentación, pasa por Ensamblaje (y Procesamiento, salvo la pieza negra) y descarga en Selección, en bucle.
4. SB2 en Transporte = pausa al terminar el movimiento en curso; SB1 la reanuda. Bit 3 del registro 40001 del SCADA = parada al terminar la pieza en curso.
5. El SB1 local de cada estación sigue sirviendo para rearmarla individualmente.

**Silo de núcleos (Ensamblaje):** basta con que cualquiera de los dos sensores del silo (`I0.0` / `I0.1`) vea núcleos (`M7.1`). Con el silo vacío la estación no dosifica: el foco amarillo del tablero parpadea a 1 Hz si algún nido necesita núcleo. Una pieza negra pasa igualmente; una blanca espera en el Paso 10 hasta que se repone el silo.

### 6.10 Ensamblaje: plato de dos nidos y sensores de núcleo
- El plato tiene un nido en cada extremo. Sensores fijos: `I0.2` = hay núcleo en el nido que está **bajo el silo**; `I0.3` = hay núcleo en el nido que está **bajo la pinza**. `I1.1` / `I1.2` = las dos posiciones del plato (verificado en banco).
- Ninguna posición es "reposo": el plato se queda donde lo dejó el último giro. `M7.6` guarda la posición ordenada (`Q0.2`) y `M7.7` indica que el plato está quieto en ella.
- Dosificar (Paso 20): solo avanza cuando `I0.2` ve caer el núcleo. Sin núcleo 2 s después de abrir la base → alarma `M7.4`.
- Girar (Paso 40): al llegar, el núcleo debe aparecer bajo la pinza (`I0.3`) en 1 s; si no → alarma `M7.3`. Las alarmas detienen la estación (foco rojo) y se borran con SB2.
- **Pieza negra:** Transporte notifica siempre la entrega (`CMD_PIEZA_ENTREGADA`). Si la fibra `I0.4` no ve la pieza en 0.5 s, Ensamblaje la clasifica como negra (`STAT_DATA = 5`), no toca los núcleos y da `STAT_DONE`. `STAT_DATA` se conserva hasta la siguiente pieza y el PLC 1 lo lee junto con `STAT_DONE`: guarda el tipo (`VB33 = 5`), la lleva directa a la cinta sin pasar por la prensa y se lo pasa a Selección, que la manda al fin de cinta para el Brazo.

### 6.11 Brazo: extensión en fin de cinta y homing
- `VD330` = 20000 pulsos de extensión del Eje X hasta la zona de toma (antes 14000). `VD334` = 14000 pulsos de retracción hacia la mesa y de nueva extensión al volver (antes 8000): la mesa queda en el mismo punto que antes.
- **Orden de homing** (al energizar, con Reset o al entrar en Automático): Eje X retrae a `I0.1` → Eje Z gira a `I0.0` → Eje Y sube a `I0.3` → apertura de garra. Evita arrastrar los cables.
- En Automático el Eje X se detiene si toca su límite de extensión (`I0.2`) o su Home (`I0.1`) (`M1.1` = aviso).

### 6.12 Transporte en Automático: diagnóstico de espera
El foco verde del tablero de Transporte queda **fijo** mientras el carro se mueve y **parpadea** cuando espera a otra estación. `VB287` (Tabla de Estado del PLC 1; SCADA registro 40028) indica qué espera:

| Bit | Espera |
|:---:|---|
| 0 | Pieza en la cuna de Alimentación (`STAT_DONE` de PLC 2 o su sensor `I0.4`) |
| 1 | Ensamblaje listo para recibir (`STAT_READY` de PLC 3) |
| 2 | Fin de ensamble (`STAT_DONE` de PLC 3) |
| 3 | Procesamiento listo para recibir |
| 4 | Fin de prensado |
| 5 | Selección lista (en Automático y con la cinta libre) |
| 6 | Viaje o maniobra en curso |
| 7 | Homing en curso |

### 6.13 Ensamblaje: preparación de núcleos y ensamble en paralelo
El PLC 3 tiene dos secuencias que corren a la vez, **iguales en Automático y en Manual**. En Manual cada movimiento espera una pulsación de SB1; los pasos que solo confirman o evalúan avanzan solos.

**Preparación de núcleos (`VW332`, `SBR_PREPARA`).** En el Paso 0 evalúa los nidos:

| Situación | Acción |
|---|---|
| Núcleo bajo el silo (`I0.2`) y nido de la pinza vacío (`I0.3 = 0`) | **Paso 40:** girar 180° a la otra posición |
| Nido del silo vacío y hay núcleos en el silo (`M7.1`) | **Paso 20:** el retenedor sujeta la columna y la base se abre (cae 1 núcleo). **Paso 30:** cierra la base y suelta el retenedor |
| Ambos nidos con núcleo | Espera: estación lista con dos núcleos |

- **Automático:** necesita marcha (`M6.0`: SB1 de Transporte, SB1 local o la primera pieza entregada). Corre en paralelo con el ensamble. El giro solo se permite con el Pick & Place arriba (`I1.5`), el silo en reposo y el ensamble fuera de los Pasos 50..70 (pinza sobre el plato). Así, mientras la pinza lleva un núcleo a la pieza, el plato ya gira y dosifica el siguiente.
- **Manual:** solo con el ensamble detenido (Paso 0, Paso 120, o Paso 10 esperando núcleo).

**Ensamble (`VW330`, `SBR_ENSAMBLE`):**

| Paso | Acción |
|:---:|---|
| 0 | Nido libre (`STAT_READY`). Arranca con `CMD_PIEZA_ENTREGADA` de Transporte (Auto y Manual), con SB1 en Auto si se ve una pieza blanca, o con SB1 en Manual si se ve una pieza blanca |
| 10 | Evalúa la fibra `I0.4` durante 0.5 s. Si la ve: blanca/metal (`STAT_DATA = 1`) → Paso 50 cuando haya núcleo bajo la pinza. Si no la ve: **negra** (`STAT_DATA = 5`) → Paso 120 sin núcleo |
| 50 / 60 / 70 | Baja la pinza (`I1.4`) / la cierra 0.5 s / sube con el núcleo (`I1.5`) |
| 80 / 90 / 95 | Avanza sobre el nido (`I1.7`) / baja e inserta 0.6 s / abre la pinza abajo 0.4 s |
| 100 / 110 | Sube (`I1.5`) / retrocede (`I1.6`) |
| 120 | Terminado (`STAT_DONE`). Vuelve a 0 con el retiro de Transporte, con SB1, o si la pieza blanca desaparece del nido 2 s |

- `STAT_BUSY` en los Pasos 10..110. Los avisos de pieza que llegan con el nido ocupado se descartan.
- Ante una alarma: la pinza **no** suelta el núcleo, el vertical sube, el horizontal y el plato se quedan donde están. SB2 vuelve ambas secuencias a 0.
- Las alertas de fuga (`M4.0`) se evalúan solo en el instante de cada medición: SB2 las borra y no vuelven hasta una nueva medición lenta (también en Alimentación, Procesamiento y Selección).

### 6.14 Ensamblaje: focos del tablero y diagnóstico
| Foco | Significado |
|---|---|
| Verde fijo | Automático en marcha / Manual con un ciclo en curso |
| Amarillo fijo | Automático sin marcha o en pausa (pulsar SB1 de Transporte o el local) / Manual sin nada que hacer |
| Amarillo 2 Hz | Manual: hay un movimiento listo, pulsar SB1 / espera de rearme tras la seta |
| Amarillo 1 Hz | Pieza blanca esperando núcleo, silo vacío con un nido por llenar, o alerta de fuga |
| Rojo fijo | Seta QS o alarma (atasco, núcleo no cayó, núcleo no llegó bajo la pinza). SB2 la borra |

`VB337` (binario) = qué espera la estación:

| Bit | Espera |
|:---:|---|
| 0 | Automático sin marcha o en pausa |
| 1 | Nido libre esperando pieza |
| 2 | Pieza blanca esperando núcleo bajo la pinza |
| 3 | Que Transporte retire la pieza terminada |
| 4 | Silo vacío |
| 5 | Seguridad sin rearmar |
| 6 | Alarma (SB2) |
| 7 | Manual: pulsar SB1 |

`VB338` (binario) = plato y nidos: bit0 `I1.2`, bit1 `I1.1`, bit2 núcleo bajo el silo `I0.2`, bit3 núcleo bajo la pinza `I0.3`, bit4 salida `Q0.2`, bit5 alarma `M7.3`, bit6 alarma `M7.4`, bit7 posición ordenada `M7.6`. `VW332` = paso de la preparación, `VW330` = paso del ensamble.

---

## 7. SCADA WEB (03_SCADA_Web)

Supervisión y mando de la celda desde Chrome o Edge, conectado por **Web Serial** al Puerto 0 del PLC 1 (Modbus RTU, dirección 1, 19200 bps, 8-N-1). El selector físico del PLC 1 debe estar en **RUN**. Arranque, ventanas y archivos: `03_SCADA_Web/README.md`. Registros: `Mapeo_Memoria_Global.md` (mapa v2).

- **Ventanas:**
  - Operación: Planta (2D en vivo), Alarmas (con solución e historial) y Producción.
  - Una ventana por unidad, con su dibujo 2D animado por los sensores reales, el paso actual, la línea de pasos y las E/S.
  - Ingeniería: Diagnóstico, Configuración y Comunicación.
  - Cada ventana se puede abrir aparte, por ejemplo en otro monitor.
- **Mandos:**
  - Marcha, Pausa, Parar al final y Reset.
  - SB1 y SB2 virtuales de Transporte.
  - Jog de calibración.
  - Contadores a cero.
  - Modo del variador (1 Analógico / 2 Modbus) y sentido de la cinta (Forward / Reverse). Ambos se aplican con la cinta detenida.
- **Configuración:**
  - Cotas del carro, con el botón «Usar posición actual».
  - Pulsos de jog, rebote en el FC derecho y retroceso del homing.
  - El PLC 1 valida cada valor y rechaza los que están fuera de rango.
- **Datos que llegan por la red:**
  - Para el SCADA, el PLC 1 lee ahora **8 bytes** de los PLC 2, 3 y 4: estado, paso, `IB0`, dato, `IB1`, `QB0` y dos bytes propios de cada estación.
  - Del PLC 5 lee **13 bytes**, que incluyen `QB0`.
  - Hay que cargar los programas de esta revisión en los PLC 1 a 5.
- **Modo demostración:** simulador del ciclo completo para conocer el SCADA sin el PLC.
