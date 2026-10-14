# 00_Mapeo_General_I_O.md
# MAPEO GENERAL DE HARDWARE Y DISTRIBUCIÓN DE E/S (CELDA FLEXIBLE XL-335B + BRAZO 4-DOF)

## 1. Arquitectura de Controladores Siemens SIMATIC S7-200

La celda flexible de manufactura **XL-335B** consta de 6 autómatas programables industriales interconectados en un bus multipunto RS-485 a 19,200 bps mediante protocolo PPI (Point-to-Point Interface).

| Unidad | Nombre de Estación | Modelo de CPU | Puertos Físicos | Protocolo Puerto 0 | Protocolo Puerto 1 | Rango DI (IB) | Rango DO (QB) | Analógicas (AIW/AQW) |
|---|---|---|---|---|---|---|---|---|
| **PLC 1** | **Transporte (Maestro Celda)** | **CPU 226CN** | 2 Puertos | Modbus RTU Esclavo (19.2k, ID 1) -> SCADA Web | PPI Maestro (19.2k, Daisy-Chain) -> Nodos 2-6 | `IB0`, `IB1`, `IB2` | `QB0`, `QB1` | N/A |
| **PLC 2** | **Alimentación** | **CPU 224CN** | 1 Puerto | PPI Esclavo (19.2k, Dirección 2) | No disponible | `IB0`, `IB1` | `QB0`, `QB1` | N/A |
| **PLC 3** | **Ensamblaje** | **CPU 226CN** | 2 Puertos | PPI Esclavo (19.2k, Dirección 3) | Puerto libre / Diagnóstico | `IB0`, `IB1` | `QB0`, `QB1` | N/A |
| **PLC 4** | **Procesamiento** | **CPU 224CN** | 1 Puerto | PPI Esclavo (19.2k, Dirección 4) | No disponible | `IB0`, `IB1` | `QB0`, `QB1` | N/A |
| **PLC 5** | **Selección y VFD** | **CPU 224XP-CN** | 2 Puertos | PPI Esclavo (19.2k, Dirección 5) | Modbus RTU Maestro (19.2k, 8-N-1) -> Powtran VFD | `IB0`, `IB1` | `QB0`, `QB1` | `AIW0`, `AIW2`, `AQW0` |
| **PLC 6** | **Brazo Robótico 4-DOF** | **CPU 224CN** | 1 Puerto | PPI Esclavo (19.2k, Dirección 6) | No disponible | `IB0`, `IB1` | `QB0` | N/A |

---

## 2. Asignaciones Especiales de Hardware y Reglas Globales de Cableado

1. **Nomenclatura Homogénea:**
   - La celda y todos los subsistemas asociados se identifican bajo el código normativo unificado **XL-335B**.

2. **Sensores Capacitivos de Fin de Carril de Selección cableados a PLC 1:**
   - Debido a que la CPU 224XP-CN de la estación de Selección (PLC 5) cuenta únicamente con 14 entradas digitales integradas (`I0.0` a `I1.5`) y sus canales están ocupados por el encoder incremental (HSC0), los sensores de inspección en rampa y los finales de carrera de los 3 cilindros desviadores, los 3 sensores capacitivos de detección de pieza en rampa de desvío están cableados físicamente al autómata de Transporte (PLC 1):
     - `I2.0` (PLC 1): Sensor Capacitivo Rampa Carril 1 (Pieza Tipo 1: Base Metálica + Núcleo Metálico).
     - `I2.1` (PLC 1): Sensor Capacitivo Rampa Carril 2 (Pieza Tipo 2: Base Blanca Plástica + Núcleo Plástico).
     - `I2.2` (PLC 1): Sensor Capacitivo Rampa Carril 3 (Pieza Tipo 3: Base Blanca Plástica + Núcleo Metálico).
   - Estos estados son leídos directamente por el PLC 1 y sincronizados hacia el bus de red PPI y el Web SCADA.

3. **Lógica Eléctrica de Mandos en Todas las Estaciones:**
   - **SB1 (Marcha / Reset de Pausa):** Contacto **Normalmente Abierto (NA)**:
     - Reposo (sin accionar) = `0` (0 VDC).
     - Accionado (presionado) = `1` (24 VDC).
   - **SB2 (Pausa de Ciclo):** Contacto **Normalmente Abierto (NA)**:
     - Reposo (sin accionar) = `0` (0 VDC).
     - Accionado (presionado) = `1` (24 VDC).
   - **QS (Seta de Parada de Emergencia):** Contacto **Normalmente Cerrado (NC) Fail-Safe**:
     - Reposo (desenclavada / operativa) = `1` (24 VDC).
     - Accionada (disparo de emergencia) = `0` (0 VDC corte de circuito).
   - **SA1 (Selector de Modo):** Contacto conmutado de 2 posiciones:
     - Posición `1` = Modo Automático.
     - Posición `0` = Modo Manual / Diagnóstico.

4. **Señalización Luminosa Estandarizada (HL1, HL2, HL3):**
   - **HL1 (Lámpara Verde):** Operación en ciclo automático normal (luz fija durante producción activa).
   - **HL2 (Lámpara Amarilla):** Pausa de ciclo activa por SB2, celda en reposo a la espera de pieza o nivel bajo en silo (luz fija / intermitente según estado).
   - **HL3 (Lámpara Roja):** Alarma crítica de proceso, atasco mecánico neumático o seta de emergencia QS disparada (luz fija).

5. **Control de la Cinta Transportadora y Variador Powtran PI9100A (PLC 5):**
   - **Modo Digital / Analógico:** Arranque y sentido comandados por `Q0.0` (DI1) y `Q0.1` (DI2); consigna de frecuencia/velocidad gobernada analógicamente mediante `AQW0` (0-10 VDC, 0-32000 cuentas) hacia el borne `AI1` del Powtran.
   - **Supervisión Modbus RTU:** Puerto 1 de CPU 224XP-CN polling en segundo plano para telemetría de bus DC, corriente y frecuencia en tiempo real.

6. **Manipulador Robótico 4-DOF (PLC 6):**
   - Accionamiento de ejes cinemáticos mediante motores paso a paso NEMA industriales comandados por trenes de pulsos PTO de alta velocidad:
     - Eje Z (Rotación de base): Generador PTO 0 (`Q0.0`) y dirección `Q0.2`.
     - Ejes X e Y (Brazo horizontal y elevación vertical): Generador PTO 1 (`Q0.1`) multiplexado electromecánicamente mediante relés de conmutación K1 (`Q0.5`) y K2 (`Q0.6`) con enclavamiento mutuo. Direcciones independientes en `Q0.3` (Eje X) y `Q0.4` (Eje Y).
   - Accionamiento de efector final: Solenoide eléctrico de garra en `Q0.7`.
