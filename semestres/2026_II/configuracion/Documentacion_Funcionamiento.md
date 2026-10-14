# Funcionamiento de la planta

Planta XK-335B con el brazo de 4 grados de libertad y el variador Powtran PI9100A.

## 1. Arquitectura

La planta es una línea modular que recibe una pieza base, le coloca un núcleo, la prensa y la clasifica. Al final de la cinta de Selección está el brazo de 4 grados de libertad.

El control está repartido en seis PLC Siemens S7-200 conectados en un bus RS-485 con protocolo PPI a 19 200 bps.

```text
======================= BUS PPI RS-485 (19 200 bps) =======================
   |            |            |            |            |            |
 Puerto 1     Puerto 0     Puerto 0     Puerto 0     Puerto 0     Puerto 0
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+
|  PLC 1   | |  PLC 2   | |  PLC 3   | |  PLC 4   | |  PLC 5   | |  PLC 6   |
|Transporte| |Alimentac.| |Ensamblaje| |Procesam. | |Selección | |Brazo 4DOF|
|CPU 226CN | |CPU 224CN | |CPU 226CN | |CPU 224CN | |CPU 224XP | |CPU 224CN |
| Dir. 1   | | Dir. 2   | | Dir. 3   | | Dir. 4   | | Dir. 5   | | Dir. 6   |
+----+-----+ +----------+ +----------+ +----------+ +----+--+---+ +----------+
     | Puerto 0                                          |  | Puerto 1
     | Modbus RTU esclavo                                |  | Modbus RTU maestro
     | 19 200 bps                           AQW0 (0-10V) |  | 19 200 bps
     v                                                   v  v
+------------+                                      +------------+
| SCADA web  |                                      |  Powtran   |
|            |                                      |  PI9100A   |
+------------+                                      +------------+
```

### Funcionamiento sin el SCADA

En automático la planta funciona sola. La coordinación entre estaciones, los enclavamientos y el aviso de eventos los resuelven los PLC con `NETR` / `NETW` por la red PPI, coordinados por el PLC 1. Si se desconecta la PC del SCADA, la producción sigue igual.

## 2. Mandos, balizas y seguridad

### 2.1 Mandos

- **SB1 (marcha / continuar tras pausa):** contacto NA. Sin pulsar = `0` (0 V), pulsado = `1` (24 V). El programa usa el flanco de subida (`EU`).
- **SB2 (pausa):** contacto NA. Sin pulsar = `0`, pulsado = `1`. La estación termina el movimiento que está haciendo y queda en pausa.
- **QS (seta de emergencia):** contacto NC. Liberada = `1` (24 V), accionada = `0`. Al accionarla se cortan de inmediato las salidas críticas y los trenes de pulsos.
  - **Rearme:** al liberar la seta (vuelve a `1`) la estación sigue detenida. Hay que pulsar SB1 para continuar, y el ciclo sigue desde el paso en que se detuvo.
- **SA1 (selector de modo):** `1` = automático, `0` = manual / diagnóstico y calibración.

### 2.2 Balizas

- **HL1 verde:** ciclo automático en marcha (fija).
- **HL2 amarilla:** pausa por SB2, espera de piezas en el silo o espera de rearme (fija o intermitente según el caso).
- **HL3 roja:** seta QS accionada, un cilindro tardó más de lo permitido (atasco) o falla de comunicación.

## 3. Secuencia de cada unidad

### 3.1 Unidad 1: Transporte (PLC 1, CPU 226CN)

El carro se mueve sobre una cremallera con un servomotor que recibe un tren de pulsos (PTO 0, `Q0.0`) y la dirección (`Q0.2`). El manipulador tiene un cilindro vertical (`Q0.3`), un actuador giratorio (`Q0.4` / `Q0.5`), un cilindro horizontal de doble vástago (`Q0.6`) y una pinza neumática (`Q0.7` / `Q1.0`).

#### Orientación de la garra

- **Horario (`Q0.5`):** en reposo y para trabajar en Alimentación, Ensamblaje y Procesamiento, la garra apunta a los nidos.
- **Antihorario (`Q0.4`):** para dejar la pieza en la cinta de Selección, el actuador gira y alinea la pieza con el eje de la cinta.

#### Recorrido del carro

De izquierda a derecha las estaciones están en este orden:

$$\text{Alimentación} \to \text{Procesamiento} \to \text{Ensamblaje} \to \text{Selección}$$

Como el núcleo se coloca antes del prensado, el carro no avanza siempre en un solo sentido:

1. **Recoger en Alimentación:** el carro está en la cota 0 (home, `I0.0`). Extiende el doble vástago, baja, cierra la pinza sobre la pieza base, sube y retrae.
2. **Dejar en Ensamblaje:** el carro pasa de largo frente a Procesamiento hasta Ensamblaje. Extiende el doble vástago, baja, abre la pinza, sube y retrae. Avisa por PPI al PLC 3 que dejó la pieza (`CMD_PIEZA_ENTREGADA`) y le permite al PLC 2 preparar la siguiente (`CMD_AUTORIZAR_DOSIF`).
3. **Según el tipo de pieza:**
   - **Tipos 1 a 4:** cuando el PLC 3 termina el ensamble (`STAT_DONE = 1`), el carro recoge la pieza en Ensamblaje, vuelve hacia atrás hasta Procesamiento y la deja en la mordaza de la prensa. Después del prensado la vuelve a recoger y la lleva a Selección.
   - **Tipo 5 (negra):** si en Ensamblaje se detecta plástico negro, el carro recoge la pieza y la lleva directo a Selección, sin dejarla en la prensa.
4. **Dejar en Selección:** el carro llega a Selección, gira la garra en sentido antihorario (`Q0.4`), extiende el doble vástago, baja, abre la pinza en la entrada de la cinta (`I0.3` del PLC 5) y vuelve a la orientación horaria.

#### Sensores de fin de rampa (`I2.0`, `I2.1`, `I2.2`)

La CPU 224XP de Selección no tiene entradas libres, así que los tres sensores capacitivos del final de las rampas están cableados a `I2.0`, `I2.1` e `I2.2` del PLC 1. El PLC 1 los usa para contar piezas y para confirmar en el SCADA que la pieza salió por la rampa, sin cargar la red PPI.

#### Cotas del carro (PLC 1, pulsos del PTO 0)

| Estación | Registro | Cota | Observación |
|---|:---:|---:|---|
| Alimentación | `VD204` | 0 | Coincide con el home `I0.0`. |
| Procesamiento | `VD208` | 45 500 | Mordaza de la prensa (se llega retrocediendo desde Ensamblaje). |
| Ensamblaje | `VD212` | 87 500 | Nido de ensamble. |
| Selección | `VD216` | 107 500 | Entrada de la cinta. |
| Límite máximo | `VD222` | 116 000 | Ninguna cota puede ser mayor. |
| Límite mínimo | `VD226` | −1 000 | Ninguna cota puede ser menor. |

Las cotas se cambian con el PLC en marcha (tabla de estado de Micro/WIN o desde el SCADA, `VD1110..VD1122`), sin recompilar. Solo vuelven a los valores por defecto si la firma `VW220` es distinta de `16#C07F`, es decir, si se perdió la memoria V.

#### Home y finales de carrera

| Elemento | Entrada | Tipo | Función |
|---|:---:|---|---|
| Inductivo de home | `I0.0` | Referencia | Define el cero (`VD250 = 0`). Es la cota de Alimentación. |
| Final de carrera izquierdo | `I0.1` (NA) | Seguridad | Corta los pulsos hacia la izquierda e invalida la referencia. |
| Final de carrera derecho | `I0.2` (NA) | Seguridad | Corta los pulsos hacia la derecha e invalida la referencia. |

**Homing (`SBR_HOMING`):**

1. Si `I0.0` ya está activo, el carro se aleja 3000 pulsos a la derecha (2 kHz).
2. Búsqueda rápida hacia la izquierda (8 kHz). El flanco de subida de `I0.0` dispara la interrupción del evento 0 (`INT_HOME_I00`), que detiene el PTO sin esperar al ciclo de programa.
3. Retroceso a la derecha de `VD240` pulsos (2 kHz).
4. Acercamiento lento a la izquierda (1 kHz). En el flanco de `I0.0`: `VD250 = 0` y referencia válida (`M13.3 = 1`).
5. Si se llega a `I0.1`, se acaba el recorrido o se acciona QS, el homing falla (`M7.2`, HL3 roja).

Sin referencia válida, `SBR_MOVE_PTO` no envía pulsos (`M7.7`). En manual, si hace falta, SB1 en reposo lanza el homing. En automático el ciclo hace el homing solo y continúa desde el paso en que se interrumpió.

### 3.2 Unidad 2: Alimentación (PLC 2, CPU 224CN)

Guarda las piezas base en una columna y las entrega de a una por gravedad.

1. **Sensores del silo:**
   - `I0.5` (arriba): hay 3 piezas o más. Si se apaga con la base todavía ocupada, HL2 avisa nivel bajo.
   - `I0.6` (abajo): hay pieza en la base del silo.
   - `I0.7` (inductivo): material de la pieza, metálica (`1`) o de plástico (`0`).
2. **Cuándo prepara una pieza:**
   - Solo después de recibir `CMD_AUTORIZAR_DOSIF`, que Transporte envía cuando ya dejó la pieza anterior en Ensamblaje.
   - Aunque reciba la orden, no mueve los cilindros si el sensor de la cuna (`I0.4`) está en `1`, para no amontonar piezas.
3. **Movimiento:**
   - El sujetador (`Q0.0`) se extiende y retiene la segunda pieza de la columna.
   - El empujador (`Q0.1`) se extiende y lleva la pieza de abajo a la cuna (`I0.4 = 1`).
   - Cuando el carro se lleva la pieza, el empujador se retrae (`I0.3 = 1`).
   - El sujetador se retrae (`I0.1 = 1`) y la columna baja un lugar.

### 3.3 Unidad 3: Ensamblaje (PLC 3, CPU 226CN)

Recibe la pieza base en su nido, revisa si es negra, saca un núcleo del silo y lo coloca en la pieza con un manipulador y un plato giratorio.

1. **Sensor Omron E3X-NA11 (`I0.4`):** es un sensor de fibra óptica reflectiva que apunta al nido:
   - Pieza metálica o de plástico blanco: refleja la luz → `I0.4 = 1`.
   - Pieza de plástico negro: la superficie mate no refleja → `I0.4 = 0`.

   El PLC 1 siempre envía `CMD_PIEZA_ENTREGADA` al terminar de dejar la pieza. Si llega esa orden y `I0.4 = 0`, el PLC 3 sabe que la pieza es negra: no coloca núcleo y le avisa al PLC 1 que terminó, para que la lleve directo a Selección.
2. **Silo de núcleos:**
   - Los dos cilindros del silo están a 3,5 cm uno del otro.
   - **Cilindro inferior (base, `Q0.0`):** tiene las mangueras invertidas para que quede extendido con la bobina sin energía. Así sostiene la columna todo el tiempo sin calentar la electroválvula. Para soltar un núcleo se energiza, se retrae un momento y vuelve a extenderse.
   - **Cilindro superior (retenedor, `Q0.1`):** conexión normal, retraído en reposo.
   - **Secuencia:** el superior se extiende y sujeta el segundo núcleo → el inferior se retrae y cae un núcleo al nido del plato que está bajo el silo → el inferior se extiende → el superior se retrae y la columna baja un lugar.
3. **Plato de dos nidos:**
   - El plato tiene un nido en cada extremo. Los sensores son fijos: `I0.2` ve el nido que queda bajo el silo e `I0.3` el que queda bajo la pinza. `I1.1` e `I1.2` son las dos posiciones; `Q0.2 = M7.6` (posición pedida).
   - La estación trata de tener núcleo en los dos nidos: si el nido del silo tiene núcleo y el de la pinza no, gira 180°; si el nido del silo está vacío, suelta un núcleo. Detalle en 6.13.
   - Si el plato no llega a la posición pedida en 2 s, se activa la alarma de atasco (foco rojo). Una alarma no le quita la energía al plato, porque no debe moverse con la pinza encima; solo la seta lo devuelve a `I1.1`.
4. **Manipulador:**
   - Secuencia: baja (`Q0.4`) → cierra la pinza (`Q0.3`, 0,5 s) → sube → avanza sobre el nido (`Q0.5`) → baja e inserta el núcleo (0,6 s) → abre la pinza abajo (0,4 s) → sube → retrocede.
   - La pinza solo tiene sensor de cerrada (`I1.3`), que con el núcleo dentro a veces no se activa. Por eso el cierre se confirma por tiempo e `I1.3` solo sirve para medir el Δt.
   - Al terminar, avisa a Transporte por PPI (`STAT_DONE = 1`).

### 3.4 Unidad 4: Procesamiento (PLC 4, CPU 224CN)

Prensa la pieza ensamblada con una prensa neumática.

1. **Recepción:** el carro de Transporte retrocede desde Ensamblaje y deja la pieza en la mordaza (`I0.0 = 1`). En automático el ciclo arranca solo con `CMD_PIEZA_ENTREGADA` (que Transporte envía cuando su pinza ya soltó la pieza, subió y se retiró) o con SB1 local si la pieza está presente. Además espera 0,8 s (`T40`) con la pieza asentada antes de cerrar la mordaza. Una versión anterior arrancaba apenas veía la pieza, y la mordaza y el carro se movían con la pinza de Transporte todavía sujetándola.
2. **Prensado doble:**
   - La mordaza se cierra (`Q0.0 = 1`, confirma `I0.1 = 1`).
   - El carro avanza bajo la prensa (`Q0.2 = 1`, confirma `I0.3 = 1`).
   - **Primer golpe:** la prensa baja (`Q0.3 = 1` hasta `I0.5 = 1`), se mantiene el tiempo guardado en memoria V (500 ms por defecto) y sube (`Q0.3 = 0` hasta `I0.4 = 1`).
   - **Segundo golpe:** baja otra vez, se mantiene y sube.
   - El carro vuelve al origen (`Q0.2 = 0` hasta `I0.2 = 1`).
   - La mordaza se abre (`Q0.0 = 0`) y la estación avisa al PLC 1 que puede llevarse la pieza a Selección.

### 3.5 Unidad 5: Selección (PLC 5, CPU 224XP-CN)

Clasifica las piezas según sus materiales con una cinta movida por el variador Powtran PI9100A y tres cilindros que las desvían a sus rampas.

1. **Entrada e identificación:**
   - El sensor `I0.3` detecta la pieza que deja Transporte. La cinta arranca con una rampa de 1 s hasta 30 Hz.
   - A 10 cm de la entrada (unos 400 pulsos del encoder) la pieza pasa sin detenerse frente a los dos sensores:
     - Inductivo lateral (`I0.5`): base metálica (`1`) o de plástico (`0`).
     - Fibra vertical (`I0.4`): núcleo que refleja (`1`) o núcleo oscuro o sin núcleo (`0`).
2. **Posición de la pieza con el HSC0:**
   - Un encoder acoplado al rodillo motriz entra al contador rápido `HSC0` (`I0.0`, `I0.1`).
   - La posición se controla con la interrupción del evento 12 (`CV = PV`), así la precisión no depende del tiempo de ciclo ni de la red PPI.
3. **Frenado y parada de 2 segundos:**
   - Cotas guardadas en memoria V:
     - `VW310`: inspección (2080 cuentas, centro de la zona donde el inductivo y la fibra ven la pieza, 1990-2170).
     - `VW312`: rampa 1 (2737 = 2837 de media − 100 de frenado).
     - `VW314`: rampa 2 (4322 = 4422 − 100).
     - `VW316`: rampa 3 (5945 = 6045 − 100).
     - `VW318`: fin de cinta, donde recoge el brazo (7769, medida en la segunda corrida). La reducción a 18 Hz está en `VW322..VW328` = cota final − 500.
   - Al llegar a la cota de su rampa, la cinta frena con rampa de 1 s y queda detenida 2 s.
   - **Asentamiento (paso 25):** el desviador espera `VW394` (0,7 s) desde la orden de paro, cuando la pieza ya quedó quieta frente al cilindro.
   - El desviador que corresponde (`Q0.4`, `Q0.5` o `Q0.6`) se extiende, empuja la pieza a la rampa y se retrae.
   - Pasados los 2 s y con el vástago retraído, la cinta vuelve a arrancar.
   - **Tipos 4 y 5:** la cinta no se detiene en las rampas; sigue hasta la cota de fin de cinta (`VW318`) y se detiene para que el brazo retire la pieza.
4. **Variador:**
   - Frecuencia máxima: 50 Hz (`F0.19`).
   - En los dos modos el PLC 5 sigue leyendo por Modbus (puerto 1) la frecuencia de salida, la corriente del motor y la tensión del bus DC, y las envía a la supervisión.

#### 3.5.1 Modos de control del variador

Se cambian escribiendo en RAM, sin gastar la EEPROM del variador.

| | Modo 1: analógico / digital | Modo 2: Modbus (por defecto) |
|---|---|---|
| Selección | `VW308 = 1` | `VW308 = 2` |
| `F0.03` fuente de frecuencia (RAM `0x0003`, Modbus 40004) | `2` = AI1 (0-10 V) | `9` = comunicación |
| `F0.11` fuente de comandos (RAM `0x000B`, Modbus 40012) | `1` = bornes DI | `2` = comunicación |
| Marcha | `Q0.0 = 1` (DI1) | `0x2000` (Modbus 48193) = `1` marcha adelante |
| Paro | `Q0.0 = 0` | `0x2000 = 6` (con rampa) o `5` (libre, emergencia) |
| 30 Hz (marcha normal) | `AQW0 = 19200` (`VW370`) | `0x1000` (44097) = `6000` (`VW366`) |
| 18 Hz (acercamiento) | `AQW0 = 11520` (`VW372`) | `0x1000 = 3600` (`VW368`) |
| Puerto 1 | Solo lectura de datos | Órdenes y lectura de datos |

- **Rampas en RAM:** `0x000D` (F0.13) = `VW362` (10 = 1,0 s), `0x000E` (F0.14) = `VW364` (5 = 0,5 s), con `F0.15 = 1` (base de 0,1 s).
- **Dirección de `F0.11`:** antes se escribía en 40018 (`0x0011` = `F0.17`, ajuste de la portadora, rango 0-1). El variador rechazaba la trama y la fuente de comandos nunca pasaba a comunicación. Según el manual de Powtran (§I-3, ejemplo `F3.12 → F30C`) la dirección correcta es `0xF00B` → RAM `0x000B` → 40012.
- **Orden de la cinta `VW350`:** se calcula en un solo lugar (`SBR_ACTUADORES`): `0` paro, `1` 30 Hz (automático pasos 10 y 15, manual paso 70), `2` 18 Hz (automático paso 20), `3` paro libre (QS local o emergencia remota). En el modo 1 se convierte en `Q0.0` / `AQW0` en el mismo ciclo; en el modo 2 la envía la secuencia Modbus.
- **Cambio de modo:** por la red (`VB102` del PLC 5 = 1 o 2, enviado desde `VW1016` del SCADA) o en la tabla de estado (`VW308`). Solo se acepta con la cinta parada; la secuencia Modbus vuelve a escribir `F0.03` / `F0.11` en RAM y reenvía el paro.

#### 3.5.2 Secuencia Modbus `VW340` (puerto 1)

| Paso | Trama | Siguiente |
|:---:|---|:---:|
| 0 | Espera a que `MBUS_CTRL_P1` esté inicializado | 100 |
| 10 / 20 / 30 / 40 | RAM `0x000D`, `0x000E`, `0x0003`, `0x000B` | 20 / 30 / 40 / 100 |
| 100 | Reposo. Prioridad: parámetros en RAM, luego órdenes (modo 2), luego lectura de datos | — |
| 110 → 112 | `0x1000 = 6000` → `0x2000 = 1` | 100 (orden confirmada: `VW352 = VW350`) |
| 120 → 112 | `0x1000 = 3600` → `0x2000 = 1` | 100 |
| 130 → 132 | `0x2000 = 6` → `0x1000 = 0` | 100 |
| 140 | `0x2000 = 5` | 100 |
| 200 | Lee `0x1001..0x1004` → `VW400..VW406` (cada 200 ms) | 100 |

- **Una sola llamada a `MBUS_MSG_P1`**, con los parámetros en `VB374..VD382`. `EN` (`M14.2`) se mantiene hasta `Done` (`M14.1`) y `First` (`M14.4`) dura un solo ciclo.
- **Errores:** el código queda en `VB344` (MSG) y `VB345` (CTRL). `T45` corta a los 3 s (error 99). Cada trama se intenta hasta 3 veces (`VB343`). Si fallan todas: alarma `M14.6` (HL3 intermitente, bit 5 de estado), el paso que falló queda en `VW358` y la secuencia vuelve al paso 100. Los parámetros de RAM que fallaron se reintentan cada 10 s con la cinta parada, y las órdenes se reenvían después de 1 s.
- **Memoria de la librería:** `VB4000..VB4299`, reservada solo para ella. Antes los bytes de error `VB4100` / `VB4101` caían dentro de esa zona.

#### 3.5.3 Prueba manual de la cinta (paso 70)

1. SB1 en el paso 60 → paso 70: `VW350 = 1`.
2. Confirmación de marcha (`M11.7`): inmediata en el modo 1; en el modo 2, cuando el variador aceptó `0x1000` y `0x2000 = 1` (`VW352 = 1`). Si no se confirma en 6 s (`T48`), alarma `M14.6` y vuelta a reposo.
3. Tiempo de prueba `T44 = VW388` (10 s) contado desde la confirmación: 1 s de rampa y 9 s de marcha a 30 Hz. `M12.1 = 1` si los datos del variador muestran más de 5 Hz reales.
4. Al terminar vuelve al paso 0 y para con rampa. SB2 cancela la prueba en cualquier momento.

### 3.6 Unidad 6: Brazo 4DOF (PLC 6, CPU 224CN)

Brazo tipo pantógrafo movido solo por motores paso a paso NEMA, con una garra de solenoide (`Q0.7`). No tiene actuadores neumáticos.

1. **Ejes y generadores de pulsos:**
   - **Eje Z (giro de la base):** PTO 0 (`Q0.0` pulsos, `Q0.2` dirección).
   - **Ejes X e Y:** comparten el PTO 1 (`Q0.1`) por medio de relés, con una espera para que se asienten los contactos:
     - Relé K1 (`Q0.5`): conecta el PTO 1 al driver del eje X, dirección en `Q0.3`.
     - Relé K2 (`Q0.6`): conecta el PTO 1 al driver del eje Y, dirección en `Q0.4`.
2. **Homing:** al encender o al pulsar reset (`I0.6`), el brazo siempre busca sus ceros (orden en 6.11):

   $$\text{X retrocede a } I0.1 \to \text{Z gira a } I0.0 \text{ (horario)} \to \text{Y sube a } I0.3 \to \text{se abre la garra}$$
3. **Retiro de piezas y `BELT_PERMIT_RUN`:**
   - Retira del final de la cinta (`VW318`) las piezas de tipo 4 y 5 y las deja en la misma mesa exterior.
   - El brazo baja y sujeta la pieza con el solenoide `Q0.7`. Apenas el eje Y sube 5000 pulsos y la pieza deja de tocar la cinta, el PLC 6 pone en la red `BELT_PERMIT_RUN = 1`.
   - Con esa señal, Selección y Transporte pueden volver a mover la cinta y seguir con la siguiente pieza, sin esperar a que el brazo termine de dejar la pieza en la mesa.
4. **Intercambio PPI Selección ↔ Transporte ↔ Brazo:**

```text
 PLC 5 SELECCIÓN              PLC 1 TRANSPORTE (MAESTRO)             PLC 6 BRAZO 4DOF
 ===============              ==========================             ================
 Pieza tipo 4/5 en VW318
 INT0: VW330 = 60
 V200.6 STAT_ROBOT_WAIT = 1 --NETR--> VB627.6 = 1
                                      ¿Brazo READY (VB667.0) y
                                      HOMED (VB667.7)?
                                      Sí: M20.0 = 1
                                      VB706.0 -> VB687.0 --NETW--> V100.0 (flanco) -> M1.0
                                                                   [Sec. 1 si no está en la toma]
                                                                   Cierra la garra Q0.7
                                      VB667.1 BUSY <-------NETR--- V200.1 STAT_BUSY = 1
                                      M20.1 = 1                    Eje Y sube 5000 p
                                      VB667.6 <------------NETR--- V200.6 BELT_PERMIT_RUN = 1
                                      M20.2 = 1
 V100.6 (flanco) -> M6.6 <--NETW----- VB705.6 -> VB647.6
 Paso 60 -> 0, cinta libre
 V200.6 = 0 ------------------NETR--> VB627.6 = 0
                                      Fin de la tarea (M20.0..2 = 0) Deja la pieza en la mesa
                                      VB667.2 (flanco) <---NETR--- V200.2 STAT_DONE = 1
                                      VW1188 / VW1190 + 1
```

   - **Cada orden llega una sola vez:** el PLC 1 copia cada pedido (`VB702..VB706`) a los datos del `NETW` al lanzar la transacción y lo borra cuando se confirma; si falla, lo vuelve a poner en la cola. Los esclavos actúan por flanco, así que reescribir el mismo dato no repite la orden.
   - **Reintentos:** la orden de recogida se reenvía si el brazo no la acepta en 5 s (`T134`); el permiso de la cinta se reenvía si Selección sigue esperando 3 s después (`T135`); si el brazo está ocupado 30 s sin dar permiso, se activa la alarma `M20.3` (HL3).
   - Las trayectorias del brazo (secuencias 1, 2, 3 y retorno) no cambiaron; solo se movieron sus palabras de paso a `VW320` / `VW322` para no pisar los datos de la red en `VB100..VB103`.

## 4. Tipos de pieza

| Tipo | Base | Núcleo | Sensores en la cinta | Recorrido | Destino (cuentas) | Quién la retira |
|:---:|:---:|:---:|:---:|:---|:---:|:---:|
| 1 | Metal | Metal | `I0.5=1`, `I0.4=1` | Alimentación → Ensamblaje → Procesamiento → Selección | Rampa 1 (2737) | Desviador 1 (`Q0.4`) |
| 2 | Plástico blanco | Plástico | `I0.5=0`, `I0.4=0` | Alimentación → Ensamblaje → Procesamiento → Selección | Rampa 2 (4322) | Desviador 2 (`Q0.5`) |
| 3 | Plástico blanco | Metal | `I0.5=0`, `I0.4=1` | Alimentación → Ensamblaje → Procesamiento → Selección | Rampa 3 (5945) | Desviador 3 (`Q0.6`) |
| 4 | Metal | Plástico | `I0.5=1`, `I0.4=0` | Alimentación → Ensamblaje → Procesamiento → Selección | Fin de cinta (7769) | Brazo 4DOF |
| 5 | Plástico negro | Sin núcleo | `I0.5=0`, `I0.4=0` (el tipo llega por PPI) | Alimentación → Ensamblaje (revisión) → directo a Selección | Fin de cinta (7000, provisional) | Brazo 4DOF |

## 5. Modo manual y diagnóstico

Con SA1 en `0` la estación deja de ejecutar la secuencia automática y permite:

- **Mover cada cilindro por separado** con el pulsador de la estación, para probar su carrera.
- **Medir tiempos (Δt):** los sensores magnéticos miden el tiempo entre la orden y la llegada del cilindro. Si tarda más de lo normal, por baja presión o una fuga, aparece un aviso.
- **Ajustar las cotas de la cinta:** `VW310`, `VW312`, `VW314`, `VW316` y `VW318` se pueden cambiar desde el SCADA para compensar el desgaste de la banda sin reprogramar el PLC.

## 6. Puesta en marcha y pruebas

### 6.1 Transporte en manual: una acción por cada SB1

| Paso | Acción | Aviso PPI al terminar | Condición para avanzar con SB1 |
|:---:|---|---|---|
| 0 | Reposo (sin referencia, SB1 o SB2 lanzan el homing) | — | El PLC 2 no está empujando. |
| 1 | Recoger en Alimentación | `CMD_RETIRO_CONFIRMADO` → PLC 2 | — |
| 2 | Viaje a Ensamblaje (`VD212`) | — | — |
| 3 | Dejar en el nido de Ensamblaje | `CMD_PIEZA_ENTREGADA` → PLC 3, `CMD_AUTORIZAR_DOSIF` → PLC 2 | El PLC 3 terminó (`STAT_DONE`) o no hay red. |
| 4 | Recoger la pieza ensamblada | `CMD_RETIRO_CONFIRMADO` → PLC 3 | La pieza tipo 5 (negra) salta al paso 8. |
| 5 | Retroceder a Procesamiento (`VD208`) | — | — |
| 6 | Dejar en la mordaza de la prensa | `CMD_PIEZA_ENTREGADA` → PLC 4 (prensado) | El PLC 4 terminó o no hay red. |
| 7 | Recoger la pieza prensada | `CMD_RETIRO_CONFIRMADO` → PLC 4 | — |
| 8 | Viaje a Selección (`VD216`), con retroceso si toca el FC derecho | — | Selección lista (`STAT_READY`) o sin red. |
| 9 | Dejar en la cinta (giro antihorario) | Tipo + `CMD_PIEZA_ENTREGADA` → PLC 5 | — |
| 10 | Volver a Alimentación haciendo homing (homing + `VD204`) | — | Vuelve al paso 0. |

Las estaciones 2 a 6 trabajan en su propio modo automático. Alimentación repone una base cada vez que su cuna queda libre (en marcha continua tras SB1 local, `CMD_START` o la primera autorización del PLC 1). Ensamblaje, Procesamiento, Selección y el brazo responden a los avisos de la tabla. La coordinación entre Selección y el brazo funciona también con Transporte en manual.

### 6.1b SB1 adelantado en manual

Si se pulsa SB1 en reposo o mientras el carro espera, la pulsación queda guardada (`M26.2`) y el paso se ejecuta apenas la estación de destino esté lista, sin volver a pulsar. SB2 la cancela.

- **Recoger en Alimentación:** hay pieza en la cuna (`STAT_DONE` del PLC 2).
- **Dejar en Ensamblaje, Procesamiento o Selección:** la estación está lista (`STAT_READY`; Selección solo lo está en automático).
- **Recoger en Ensamblaje o Procesamiento:** ciclo terminado (`STAT_DONE`).
- Si no hay red con esa estación (selector del PLC 1 en TERM o nodo caído), decide el operador y el paso se ejecuta directamente.

### 6.1c Selector RUN / TERM del PLC 1

| Posición | Puerto 0 | Puerto 1 | Uso |
|---|---|---|---|
| RUN (`SM0.7 = 1`) | Modbus esclavo (SCADA) | Maestro PPI (lecturas y escrituras a las estaciones) | Producción coordinada. |
| TERM (`SM0.7 = 0`) | Esclavo PPI | Esclavo PPI, sin secuencia de red | Con el programa en RUN desde Micro/WIN, la PC es el único maestro: puede programar, ver la tabla de estado del PLC 1 y acceder a los PLC 2 a 6. Transporte funciona en manual y las estaciones se toman como sin red. |

Con el selector en RUN, la PC solo puede trabajar junto al PLC 1 como maestro si el cable PC/PPI está configurado como red multimaestro (Ajustar interfaz PG/PC → PC/PPI → Propiedades → "Red multimaestro", dirección 0, dirección más alta 31, 19,2 kbit/s).

### 6.2 Final de carrera derecho al llegar a Selección

Si en el viaje hacia `VD216` se activa `I0.2`, se cortan los pulsos y el carro retrocede `VD288` pulsos (1500 por defecto) a 2 kHz hasta liberar el final de carrera. La llegada se da por buena y la pieza se deja en la cinta. La posición exacta se pierde y en el regreso (paso 10 en manual o en automático) se vuelve a hacer el homing sobre `I0.0`. Tocar el final de carrera en cualquier otro viaje sigue siendo una alarma (`M7.6`).

### 6.3 Ajuste de cotas desde la tabla de estado (Micro/WIN)

Con Transporte en manual, referenciado y en reposo o esperando SB1:

| Dirección | Formato | Uso |
|---|---|---|
| `VD250` | Con signo | Posición actual (lectura). |
| `VD280` | Con signo | Pulsos por cada toque de jog (100 por defecto). |
| `V284.0` | Bit | Escribir `1`: jog a la derecha de `VD280` pulsos (se borra solo). |
| `V284.1` | Bit | Escribir `1`: jog a la izquierda de `VD280` pulsos (se borra solo). |
| `VD204` / `VD208` / `VD212` / `VD216` | Con signo | Cotas de Alimentación, Procesamiento, Ensamblaje y Selección (escribir el valor de `VD250` una vez alineado). |
| `VD244` | Con signo | Corrección del home: mueve todas las cotas la misma distancia. |
| `VD288` | Con signo | Retroceso al tocar el FC derecho en Selección. |

Procedimiento: llevar el carro a la estación con SB1 (paso de viaje), alinear la garra con el nido usando `V284.0` / `V284.1` y copiar `VD250` en la cota de esa estación. Si todas las estaciones están corridas la misma distancia en el mismo sentido, basta con poner esa distancia en `VD244` (positiva si el carro se pasa hacia Selección).

### 6.4 Baliza general de la planta (PLC 3: `Q0.6` roja, `Q0.7` amarilla, `Q1.0` verde)

El PLC 1 resume el estado de toda la planta en `VB37` y se lo envía al PLC 3 (`VB102`) en cada vuelta de la red, junto con un contador de vida (`VB103`). En el SCADA está en el registro 40026 (`VW1050`).

| Baliza | Causa |
|---|---|
| Roja intermitente | Seta QS accionada en cualquier estación (PLC 1 `I2.6`, PLC 2/3/4 bit 6 de estado, PLC 5 `VB210` bit 7), o el PLC 3 lleva 5 s sin recibir datos del PLC 1 (roja y amarilla intermitentes). |
| Roja fija | Atasco, homing fallido, final de carrera, tiempo de maniobra excedido, el brazo no responde, falla del variador o un nodo PPI no responde. |
| Verde | Transporte en automático y en marcha, sin alarmas. |
| Amarilla intermitente | Pausa, aviso de fuga o silo vacío. |
| Amarilla fija | Planta detenida o Transporte en manual, sin alarmas. |

La seta del propio PLC 3 enciende la roja intermitente al instante, sin esperar a la red. Los focos `Q1.5`, `Q1.6` y `Q1.7` son los del tablero de Ensamblaje.

**Por qué está roja:** `VB292` en el PLC 1 (tabla de estado en binario; registro 40029 = `VW1056` en el SCADA).

| Bit | Causa |
|:---:|---|
| 0 | Alarma de Transporte (atasco, homing fallido, final de carrera, cota fuera de rango, maniobra). |
| 1 | El brazo no responde (`M20.3`). |
| 2 / 3 / 4 | Atasco en Alimentación / Ensamblaje / Procesamiento (se borra con SB2 de esa estación). |
| 5 | Atasco en Selección o falla de comunicación con el variador. |
| 6 | Un nodo PPI no responde: ver `VB710` (bit 2 = PLC 2 … bit 6 = PLC 6). |
| 7 | Seta QS accionada en alguna estación (roja intermitente). |

### 6.5 Sentido de giro de la cinta

`VW390` en el PLC 5: `1` = adelante, `2` = atrás (valor por defecto después de la prueba en la planta). En el modo 2 se envía como orden en `0x2000`. En el modo 1 la marcha sale por `Q0.0` (DI1) con `VW390 = 1` o por `Q0.1` (DI2) con `VW390 = 2`, y nunca se activan las dos.

### 6.6 Ensamblaje: diagnóstico y fugas

- Diagnóstico `VB337` (qué espera la estación) y `VB338` (plato y nidos): ver 6.14.
- **Tiempos de los cilindros (aviso de fuga `M4.0`, atasco `M4.1`):** bajada vertical `VW210`, avance horizontal `VW212`, giro del plato hacia `I1.2` `VW214`, retenedor `VW216`, apertura de la base `VW218`, cierre de la pinza `VW220` (solo se mide, no da atasco), subida vertical `VW222`, giro del plato hacia `I1.1` `VW224`.

### 6.7 Selección: medición de las cotas de la cinta

1. Selección en automático, en reposo y rearmada. Poner una pieza de prueba en la entrada.
2. Activar la medición: `V392.0 = 1` en la tabla de estado del PLC 5 (con el PLC 1 en TERM), o mantener SB2 pulsado mientras se pulsa SB1.
3. Al pulsar SB1 la cinta marcha a 18 Hz con el contador en cero. `VD412` muestra el contador (también `HC0`).
4. Los sensores se registran solos. Pulsar SB1 cuando el centro de la pieza pase frente a cada desviador (1.ª, 2.ª y 3.ª pulsación) y frente al punto donde recoge el brazo (4.ª). La 4.ª pulsación detiene la cinta; SB2 cancela. Límite de seguridad: ±15 000 cuentas.

| Dirección (con signo) | Dato |
|---|---|
| `VD416` | La pieza deja el sensor de entrada `I0.3`. |
| `VD420` / `VD424` | El inductivo `I0.5` empieza / deja de detectar. |
| `VD428` / `VD432` | La fibra `I0.4` empieza / deja de detectar. |
| `VD436` / `VD440` / `VD444` | Rampas 1 / 2 / 3 (pulsaciones de SB1). |
| `VD448` | Fin de cinta (4.ª pulsación). |
| `VD452` | Posición donde quedó detenida, 2 s después (incluye el frenado). |
| `VB456` | Pulsaciones registradas. |

Con estos valores se calculan `VW310` (inspección), `VW312..VW318` (cotas de parada) y `VW322..VW328` (cotas donde baja a 18 Hz).

### 6.8 Enlace Selección → brazo: diagnóstico

El brazo se considera listo con su selector en automático y en reposo. Si todavía no tiene referencia, la orden de recogida primero lanza su homing y después sigue con la secuencia 1 y la recogida. `VB286` en el PLC 1 (registro 40027 en el SCADA) muestra cada condición:

| Bit | Significado |
|:---:|---|
| 0 | Selección espera al brazo (pieza tipo 4/5 en el fin de cinta). |
| 1 | Brazo listo (PLC 6 en automático y en reposo). |
| 2 | Brazo con referencia. |
| 3 | Brazo ocupado. |
| 4 / 5 | Sin red con el PLC 5 / PLC 6. |
| 6 | Orden de recogida enviada. |
| 7 | Permiso de la cinta pasado a Selección. |

### 6.9 Arranque de la planta en automático

1. Todas las estaciones con SA1 en automático y la seta liberada. El brazo en automático (hace su homing solo al pasar a automático o con la primera orden).
2. Transporte con el selector del PLC en RUN (no TERM) y SA1 en automático. Un solo SB1 (o Marcha en el SCADA) arranca toda la planta. Ese SB1 envía a Alimentación, Ensamblaje, Procesamiento y Selección:
   - `CMD_ACK_RESET`: rearma las estaciones que esperan rearme (después de encender o de una seta) y borra sus alarmas. A una estación ya rearmada no le cambia el paso, así que se puede pulsar en cualquier momento.
   - `CMD_START`: Alimentación entra en marcha continua, Ensamblaje empieza a llenar sus dos nidos y Selección sale de una pausa remota.
3. Transporte hace el homing si no tiene referencia, recoge en Alimentación, pasa por Ensamblaje (y por Procesamiento, salvo la pieza negra) y deja la pieza en Selección, una y otra vez.
4. SB2 de Transporte pone la planta en pausa al terminar el movimiento en curso; SB1 la reanuda. El bit 3 del registro 40001 del SCADA la detiene al terminar la pieza en curso.
5. El SB1 de cada estación sigue sirviendo para rearmarla por separado.

**Silo de núcleos (Ensamblaje):** alcanza con que uno de los dos sensores del silo (`I0.0` / `I0.1`) vea núcleos (`M7.1`). Con el silo vacío la estación no suelta núcleos y el foco amarillo del tablero parpadea a 1 Hz si algún nido está vacío. Una pieza negra pasa igual; una blanca espera en el paso 10 hasta que se reponga el silo.

### 6.10 Ensamblaje: plato de dos nidos y sensores de núcleo

- El plato tiene un nido en cada extremo. Sensores fijos: `I0.2` = hay núcleo en el nido que está bajo el silo; `I0.3` = hay núcleo en el nido que está bajo la pinza. `I1.1` / `I1.2` = las dos posiciones del plato (comprobado en la planta).
- Ninguna posición es de reposo: el plato queda donde lo dejó el último giro. `M7.6` guarda la posición pedida (`Q0.2`) y `M7.7` indica que el plato está quieto en ella.
- Soltar núcleo (paso 20): solo avanza cuando `I0.2` ve caer el núcleo. Si 2 s después de abrir la base no hay núcleo → alarma `M7.4`.
- Girar (paso 40): al llegar, el núcleo tiene que aparecer bajo la pinza (`I0.3`) en 1 s; si no → alarma `M7.3`. Las alarmas detienen la estación (foco rojo) y se borran con SB2.
- **Pieza negra:** Transporte siempre avisa la entrega (`CMD_PIEZA_ENTREGADA`). Si la fibra `I0.4` no ve la pieza en 0,5 s, Ensamblaje la toma como negra (`STAT_DATA = 5`), no usa núcleos y pone `STAT_DONE`. `STAT_DATA` se mantiene hasta la siguiente pieza y el PLC 1 lo lee junto con `STAT_DONE`: guarda el tipo (`VB33 = 5`), lleva la pieza directo a la cinta sin pasar por la prensa y le pasa el tipo a Selección, que la manda al fin de cinta para el brazo.

### 6.11 Brazo: extensión en el fin de cinta y homing

- `VD330` = 20 000 pulsos de extensión del eje X hasta la zona de recogida (antes 14 000). `VD334` = 14 000 pulsos de retracción hacia la mesa y de nueva extensión al volver (antes 8000); la mesa queda en el mismo lugar que antes.
- **Orden del homing** (al encender, con reset o al pasar a automático): X retrocede a `I0.1` → Z gira a `I0.0` → Y sube a `I0.3` → se abre la garra. En este orden no se arrastran los cables.
- En automático el eje X se detiene si toca su límite de extensión (`I0.2`) o su home (`I0.1`) (`M1.1` = aviso).

### 6.12 Transporte en automático: qué está esperando

El foco verde del tablero de Transporte queda fijo mientras el carro se mueve y parpadea cuando espera a otra estación. `VB287` (tabla de estado del PLC 1; registro 40028 en el SCADA) indica qué espera:

| Bit | Espera |
|:---:|---|
| 0 | Pieza en la cuna de Alimentación (`STAT_DONE` del PLC 2 o su sensor `I0.4`). |
| 1 | Ensamblaje listo para recibir (`STAT_READY` del PLC 3). |
| 2 | Fin del ensamble (`STAT_DONE` del PLC 3). |
| 3 | Procesamiento listo para recibir. |
| 4 | Fin del prensado. |
| 5 | Selección lista (en automático y con la cinta libre). |
| 6 | Viaje o maniobra en curso. |
| 7 | Homing en curso. |

### 6.13 Ensamblaje: preparación de núcleos y ensamble al mismo tiempo

El PLC 3 tiene dos secuencias que corren a la vez, iguales en automático y en manual. En manual cada movimiento espera una pulsación de SB1; los pasos que solo confirman o evalúan avanzan solos.

**Preparación de núcleos (`VW332`, `SBR_PREPARA`).** En el paso 0 revisa los nidos:

| Situación | Acción |
|---|---|
| Núcleo bajo el silo (`I0.2`) y nido de la pinza vacío (`I0.3 = 0`) | Paso 40: girar 180° a la otra posición. |
| Nido del silo vacío y núcleos en el silo (`M7.1`) | Paso 20: el retenedor sujeta la columna y la base se abre (cae un núcleo). Paso 30: se cierra la base y se suelta el retenedor. |
| Los dos nidos con núcleo | Espera: estación lista con dos núcleos. |

- **Automático:** necesita marcha (`M6.0`: SB1 de Transporte, SB1 local o la primera pieza entregada). Corre junto con el ensamble. El plato solo gira con el manipulador arriba (`I1.5`), el silo en reposo y el ensamble fuera de los pasos 50 a 70 (pinza sobre el plato). Así, mientras la pinza lleva un núcleo a la pieza, el plato ya gira y prepara el siguiente.
- **Manual:** solo con el ensamble detenido (paso 0, paso 120 o paso 10 esperando núcleo).

**Ensamble (`VW330`, `SBR_ENSAMBLE`):**

| Paso | Acción |
|:---:|---|
| 0 | Nido libre (`STAT_READY`). Arranca con `CMD_PIEZA_ENTREGADA` de Transporte (automático y manual), o con SB1 (automático o manual) si se ve una pieza blanca. |
| 10 | Revisa la fibra `I0.4` durante 0,5 s. Si ve la pieza: blanca/metal (`STAT_DATA = 1`) → paso 50 cuando haya núcleo bajo la pinza. Si no la ve: negra (`STAT_DATA = 5`) → paso 120 sin núcleo. |
| 50 / 60 / 70 | Baja la pinza (`I1.4`) / la cierra 0,5 s / sube con el núcleo (`I1.5`). |
| 80 / 90 / 95 | Avanza sobre el nido (`I1.7`) / baja e inserta 0,6 s / abre la pinza abajo 0,4 s. |
| 100 / 110 | Sube (`I1.5`) / retrocede (`I1.6`). |
| 120 | Terminado (`STAT_DONE`). Vuelve a 0 cuando Transporte se lleva la pieza, con SB1, o si la pieza blanca desaparece del nido durante 2 s. |

- `STAT_BUSY` está activo en los pasos 10 a 110. Los avisos de pieza que llegan con el nido ocupado se descartan.
- Con una alarma, la pinza no suelta el núcleo, el cilindro vertical sube y el horizontal y el plato quedan donde están. SB2 vuelve las dos secuencias a 0.
- Los avisos de fuga (`M4.0`) se evalúan solo al momento de cada medición: SB2 los borra y no vuelven hasta otra medición lenta (igual en Alimentación, Procesamiento y Selección).

### 6.14 Ensamblaje: focos del tablero y diagnóstico

| Foco | Significado |
|---|---|
| Verde fijo | Automático en marcha / manual con un ciclo en curso. |
| Amarillo fijo | Automático sin marcha o en pausa (pulsar SB1 de Transporte o el local) / manual sin nada pendiente. |
| Amarillo 2 Hz | Manual: hay un movimiento listo, pulsar SB1 / espera de rearme después de la seta. |
| Amarillo 1 Hz | Pieza blanca esperando núcleo, silo vacío con un nido por llenar, o aviso de fuga. |
| Rojo fijo | Seta QS o alarma (atasco, el núcleo no cayó o no llegó bajo la pinza). SB2 la borra. |

`VB337` (binario) = qué espera la estación:

| Bit | Espera |
|:---:|---|
| 0 | Automático sin marcha o en pausa. |
| 1 | Nido libre esperando pieza. |
| 2 | Pieza blanca esperando núcleo bajo la pinza. |
| 3 | Que Transporte retire la pieza terminada. |
| 4 | Silo vacío. |
| 5 | Seguridad sin rearmar. |
| 6 | Alarma (SB2). |
| 7 | Manual: pulsar SB1. |

`VB338` (binario) = plato y nidos: bit 0 `I1.2`, bit 1 `I1.1`, bit 2 núcleo bajo el silo `I0.2`, bit 3 núcleo bajo la pinza `I0.3`, bit 4 salida `Q0.2`, bit 5 alarma `M7.3`, bit 6 alarma `M7.4`, bit 7 posición pedida `M7.6`. `VW332` = paso de la preparación, `VW330` = paso del ensamble.

## 7. SCADA web

Supervisión y mando de la planta desde Chrome o Edge. Se conecta por Web Serial al puerto 0 del PLC 1 (Modbus RTU, dirección 1, 19 200 bps, 8-N-1), con el selector del PLC 1 en RUN. Cómo iniciarlo y qué contiene cada ventana: `scada-web/README.md`. Registros: `Mapeo_Memoria_Global.md`.

- **Ventanas:**
  - Operación: planta (vista 2D en vivo), alarmas (con solución e historial) y producción.
  - Una ventana por unidad, con su dibujo 2D movido por los sensores reales, el paso actual, la lista de pasos y las E/S.
  - Ingeniería: diagnóstico, configuración y comunicación.
  - Cada ventana se puede abrir aparte, por ejemplo en otro monitor.
- **Mandos:**
  - Marcha, pausa, parar al final y reset.
  - SB1 y SB2 de Transporte desde el SCADA.
  - Jog para ajustar cotas.
  - Contadores a cero.
  - Modo del variador (1 analógico / 2 Modbus) y sentido de la cinta (adelante / atrás). Los dos se aplican con la cinta detenida.
- **Configuración:**
  - Cotas del carro, con el botón «Usar posición actual».
  - Pulsos de jog, retroceso en el FC derecho y retroceso del homing.
  - El PLC 1 revisa cada valor y rechaza los que están fuera de rango.
- **Datos de la red:**
  - Para el SCADA, el PLC 1 lee 8 bytes de los PLC 2, 3 y 4: estado, paso, `IB0`, dato, `IB1`, `QB0` y dos bytes propios de cada estación.
  - Del PLC 5 lee 13 bytes, incluido `QB0`.
  - Para que todo esto funcione, los PLC 1 a 5 deben tener cargada la versión actual de sus programas.
- **Modo demostración:** simula el ciclo completo para probar el SCADA sin el PLC.
