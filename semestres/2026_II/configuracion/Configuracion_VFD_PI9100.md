# GUÍA TÉCNICA DE CONFIGURACIÓN Y PARAMETRIZACIÓN DEL VARIADOR DE FRECUENCIA POWTRAN PI9100A
## Celda de Manufactura Flexible XL-335B (Estación 5 Selección)[cite: 2, 13]

**Aplicación:** Control de Velocidad, Rampas y Sentido de la Cinta Transportadora de Selección[cite: 13]  
**Controlador Maestro VFD:** Siemens SIMATIC S7-200 CPU 224XP-CN (Puerto 1 y Salida Analógica AQW0)[cite: 13]  
**Protocolo:** Modbus RTU RS-485 (19,200 bps, 8-N-1) + Canal Analógico 0-10 VDC[cite: 13]

---

## 1. ESPECIFICACIONES DE CONEXIONADO FÍSICO

```text
+------------------------------------+             +------------------------------------+
|  SIEMENS S7-200 CPU 224XP-CN       |             |  POWTRAN PI9100A (BORNERO CONTROL) |
+------------------------------------+             +------------------------------------+
| Puerto 1 (RS-485 Sub-D 9 Pines):   |             | Bornes de Comunicación:            |
| Pin 3 (RxD/TxD-P / Señal B) ------>|------------>| Borne 485+                         |
| Pin 8 (RxD/TxD-N / Señal A) ------>|------------>| Borne 485-                         |
| Pin 5 (GND / Malla Apantallada) -->|------------>| Borne GND                          |
|                                    |             |                                    |
| Canal Analógico Integrado:         |             | Entradas Analógicas:               |
| Borne AQW0 (Salida 0-10 VDC) ----->|------------>| Borne AI1 (Entrada Analógica 1)    |
| Borne M (Masa Analógica) ---------->|------------>| Borne GND                          |
|                                    |             |                                    |
| Salidas Digitales:                 |             | Terminales de Mando Digital:       |
| Borne Q0.0 (Marcha Motor) -------->|------------>| Borne DI1 (Forward Run)            |
| Borne Q0.1 (Sentido Motor) ------->|------------>| Borne DI2 (Reverse Run)            |
| Borne 1M (Común 24V) ------------->|------------>| Borne COM                          |
+------------------------------------+             +------------------------------------+
```

---

## 2. PROCEDIMIENTO DE CONFIGURACIÓN MANUAL OBLIGATORIA (POR TECLADO, ÚNICA VEZ)

Para que el variador responda al PLC 5 y evitar bloqueos por timeout o errores de paridad, el operador debe programar manualmente los siguientes parámetros desde el panel frontal del PI9100A antes de conectar el bus de comunicaciones[cite: 13]:

### Paso a Paso en el Teclado del Variador:
1. Conectar la alimentación trifásica `220 VAC` a los bornes `R`, `S`, `T`[cite: 13].
2. Presionar la tecla **`PRG/ESC`** para ingresar al menú de grupos de parámetros[cite: 13].
3. Navegar con las flechas **`▲`** / **`▼`** hasta el grupo **`F9`** (Comunicaciones) y presionar **`DATA/ENT`**[cite: 13].
4. Ajustar rigurosamente los parámetros de comunicación:
   - **`F9.00 = 6006`**  
     *El dígito de las unidades define la velocidad Modbus: `6` = **19,200 bps** (`5` sería 9600 bps). Las cifras superiores corresponden a la configuración interna por defecto `600x`.*[cite: 13]
   - **`F9.01 = 3`** (Formato de datos: **8-N-1**, 8 bits de datos, sin paridad, 1 bit de parada)[cite: 13].
   - **`F9.02 = 1`** (Dirección de Esclavo Modbus: **ID = 1**)[cite: 13].
   - **`F9.03 = 5`** (Tiempo de retardo de respuesta: **5 ms**)[cite: 13].
   - **`F9.04 = 0.0`** (Timeout de comunicación: **0.0 s** = deshabilitado para evitar disparo Err.16 en paradas intencionales)[cite: 13].
   - **`F9.05 = 1`** (Selección de protocolo: **1 = Modbus estándar RTU**; con `0` el variador devuelve 1 byte extra propietario)[cite: 13].
5. Configurar límites de frecuencia y protecciones mecánicas:
   - **`F0.19 = 50.00`** (Frecuencia máxima de salida: **50.00 Hz** - Límite estricto de seguridad de la celda)[cite: 13].
   - **`F0.20 = 50.00`** (Límite superior de frecuencia de funcionamiento: **50.00 Hz**)[cite: 13].
   - **`F0.13 = 1.0`** (Tiempo de aceleración 1: **1.0 s**)[cite: 13].
   - **`F0.14 = 1.0`** (Tiempo de deceleración 1: **1.0 s**)[cite: 13].
6. Presionar **`PRG/ESC`** repetidamente hasta regresar a la pantalla principal de monitoreo (`d-00`)[cite: 13].

---

## 3. CONMUTACIÓN ENTRE MODO MODBUS Y MODO ANALÓGICO

El sistema soporta dos modos de gobierno seleccionables según las necesidades de operación o contingencia[cite: 13]:

| Modo de Operación | Parámetro `F0.03` (Fuente de Frecuencia) | Parámetro `F0.11` (Canal de Comandos) | Descripción de Gobierno |
|---|:---:|:---:|---|
| **Modo 2 (defecto): Modbus Puro (RS-485), `VW308 = 2`** | **`9`** (Comunicación remota) | **`2`** (Comunicación) | Consigna por `0x1000` (44097): `6000` = 30.0 Hz. Marcha/paro por `0x2000` (48193): `1` Run FWD, `6` paro decelerado, `5` inercia. |
| **Modo 1: Analógico / Digital, `VW308 = 1`** | **`2`** (Entrada AI1 0-10V) | **`1`** (Bornes de control DI) | Consigna por `AQW0` (+19200 = 30.0 Hz). Marcha por `Q0.0` (DI1). Puerto 1 solo telemetría. |

> **Direcciones RAM (sin desgaste de EEPROM):** `F0.03` → `0x0003` (Modbus 40004); `F0.11` → **`0x000B` (Modbus 40012)**. La versión anterior del programa usaba `0x0011` (40018), que corresponde a `F0.17` (ajuste de portadora por temperatura, rango 0-1): el variador respondía con excepción y el canal de comandos nunca pasaba a comunicación. Regla del manual (§I-3): el número de parámetro es decimal y se codifica en hexadecimal (`F3.12 → F30C`).

### DIRECTIVA OBLIGATORIA: Telemetría Activa en Todo Momento
> [!IMPORTANT]
> Cuando el sistema opera en **Modo Analógico**, el PLC 5 **debe mantener activa ininterrumpidamente la lectura Modbus cíclica** en su Puerto 1[cite: 13]. Las variables de frecuencia real (`0x1001`), corriente de motor (`0x1004`) y tensión de bus DC (`0x1002`) continúan leyéndose y transmitiéndose hacia Transporte y el Web SCADA, garantizando supervisión continua independientemente del modo de mando[cite: 13].

---

## 4. MAPA DE REGISTROS MODBUS EN EL POWTRAN PI9100A

### 4.1 Registros de Control y Consigna (Escritura Función `0x06` / `0x10`)

| Dirección Hex | Dirección Decimal | Tipo | Rango / Valores | Función Detallada |
|:---:|:---:|:---:|:---:|---|
| **`0x1000`** | `4096` | INT16 | `-10000` a `+10000` | **Consigna de frecuencia porcentual:** <br>`10000` = 100.00% de `F0.19` (50.00 Hz) $\to$ **1000 dec = 50.0 Hz** en escala dividida entre 10[cite: 13]. |
| **`0x2000`** | `8192` | WORD | Comando de marcha | **Comando de operación:** <br>• `0001H` = Marcha hacia adelante (Forward Run)[cite: 13] <br>• `0002H` = Marcha hacia atrás (Reverse Run)[cite: 13] <br>• `0005H` = Parada libre / inercia (Coast to Stop)[cite: 13] <br>• `0006H` = Parada con deceleración controlada (1.0 s)[cite: 13] |

---

### 4.2 Escritura en RAM sin Desgaste de EEPROM (Rampas Dinámicas)

> [!CAUTION]
> El Powtran PI9100A graba los parámetros modificados directamente en su memoria EEPROM por defecto (~100,000 ciclos de vida útil)[cite: 13]. Si el PLC actualiza dinámicamente las rampas en cada ciclo, la EEPROM se agotará prematuramente[cite: 13].
>
> **Solución Técnica Oficial Powtran:**  
> Cambiar el nibble alto de la dirección de `F` a `0`. Esto direcciona directamente a la **memoria RAM volátil**, permitiendo escrituras ilimitadas a alta velocidad sin degradación de hardware[cite: 13]:

| Parámetro | Dirección EEPROM (F-Group) | **Dirección Volátil RAM (Cero Desgaste)** | Resolución | Función |
|:---:|:---:|:---:|:---:|---|
| **`F0.13`** (Tiempo Aceleración 1) | `0xF00D`[cite: 13] | **`0x000D`** (Decimal `13`)[cite: 13] | 0.1 s[cite: 13] | Rampa de aceleración en RAM (Ej: `10` = 1.0 s nominal)[cite: 4, 13] |
| **`F0.14`** (Tiempo Deceleración 1) | `0xF00E`[cite: 13] | **`0x000E`** (Decimal `14`)[cite: 13] | 0.1 s[cite: 13] | Rampa de deceleración en RAM (Ej: `10` = 1.0 s nominal)[cite: 4, 13] |

---

### 4.3 Registros de Monitoreo y Telemetría (Lectura Función `0x03`)

El PLC 5 interroga cíclicamente estos registros mediante `MBUS_MSG` en el Puerto 1 para alimentar el bus PPI y el Web SCADA[cite: 13]:

| Dirección Hex | Dirección Decimal | Registro Modbus | Variable PLC 5 | Escalado / Unidad | Descripción |
|:---:|:---:|:---:|:---:|:---:|---|
| **`0x1001`** | `4097` | `44098` | `VW400` | $0.01\text{ Hz}$ (Ej: `3000` = 30.00 Hz) | **Frecuencia real de salida**[cite: 13] |
| **`0x1002`** | `4098` | `44099` | `VW402` | $0.1\text{ V}$ (Ej: `3100` = 310.0 V) | **Tensión del bus de continua (Bus DC)**[cite: 13] |
| **`0x1003`** | `4099` | `44100` | `VW404` | $0.1\text{ V}$ (Ej: `2200` = 220.0 V) | Tensión de salida a bornes de motor[cite: 13] |
| **`0x1004`** | `4100` | `44101` | `VW406` | $0.01\text{ A}$ (Ej: `125` = 1.25 A) | **Corriente de salida consumida por motor**[cite: 13] |
| **`0x1007`** | `4103` | `44104` | `VW408` | $1\text{ RPM}$ (Ej: `1420` = 1420 RPM) | Velocidad de rotación estimada[cite: 13] |
| **`0x1008`** | `4104` | `44105` | `VW410` | Bitmask | Estado lógico de bornes de entrada DI[cite: 13] |

---

## 5. ESCALADO ANALÓGICO EN LA CPU 224XP-CN (`AQW0`)

Para el gobierno de velocidad en modo analógico[cite: 13]:
- Salida analógica `AQW0`: Conversor D/A de 12 bits escalado de `0` a `32,000` cuentas para `0` a `10.0 VDC`[cite: 13].
- Entrada `AI1` del Powtran: `0 VDC` = 0.00 Hz, `10.0 VDC` = 50.00 Hz (`F0.19`)[cite: 13].
- **Fórmula de Conversión:**
  $$\text{Valor AQW0} = \frac{\text{Frecuencia Deseada (Hz)}}{50.00\text{ Hz}} \times 32000$$[cite: 13]
- **Tabla de Valores Típicos:**
  - `10.0 Hz` $\to$ `AQW0 = +6,400`[cite: 13]
  - `20.0 Hz` $\to$ `AQW0 = +12,800`[cite: 13]
  - `30.0 Hz` (Velocidad de inspección nominal) $\to$ `AQW0 = +19,200`[cite: 13]
  - `40.0 Hz` $\to$ `AQW0 = +25,600`[cite: 13]
  - `50.0 Hz` (Velocidad máxima autorizada) $\to$ `AQW0 = +32,000`[cite: 13]