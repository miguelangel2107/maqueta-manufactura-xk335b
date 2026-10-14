# 06_Mapeo_Brazo_4DOF.md
# UNIDAD 6: MANIPULADOR ROBÓTICO 4-DOF - CINEMÁTICA REAL POR PASO A PASO NEMA Y GARRA ELÉCTRICA (XL-335B)

**Controlador:** Siemens SIMATIC S7-200 CPU 224CN (Firmware Rel. CN)  
**Puerto de Comunicación:**
- **Puerto 0:** Esclavo en bus PPI daisy-chain a 19,200 bps (Dirección de estación: **6**).

---

## 1. Tabla de Entradas Digitales (DI)

### 1.1 Sensores de Referencia, Límites y Mandos Principales
| Dirección PLC | Tipo | Nemónico / Tag | Lógica Eléctrica | Descripción Funcional del Sensor / Mando |
|---|---|---|---|---|
| **I0.0** | DI | `Sens_Home_Z` | Inductivo PNP (NA) | Sensor inductivo origen Home Eje Z (rotación de la base en sentido horario) |
| **I0.1** | DI | `Sens_Home_X` | Inductivo PNP (NA) | Sensor inductivo origen Home Eje X (retroceso horizontal / brazo recogido) |
| **I0.2** | DI | `FC_Limite_X` | Inductivo PNP (NA) | Sensor de límite de carrera máxima opuesta del Eje X (extensión máxima) |
| **I0.3** | DI | `Sens_Home_Y` | Inductivo PNP (NA) | Sensor inductivo origen Home Eje Y (elevación vertical superior) |
| **I0.4** | DI | `FC_Limite_Y` | Inductivo PNP (NA) | Sensor de límite tope inferior del Eje Y (descenso máximo de seguridad) |
| **I0.5** | DI | `Selector (SA1)` | Conmutador 2P | Selector de modo: `1` = Modo Automático, `0` = Modo Manual / Diagnóstico |
| **I0.6** | DI | `Btn_Reset` | **NA (Contacto Abierto)** | Pulsador de reset y rearme de coordenadas. Reposo = `0`, Accionado = `1` |
| **I0.7** | DI | `Btn_Start_Grip` | **NA (Contacto Abierto)** | Pulsador de Start en Automático / Toggle pinza en Manual. Reposo = `0`, Accionado = `1` |

### 1.2 Pupitre de Jogging Manual
| Dirección PLC | Tipo | Nemónico / Tag | Lógica Eléctrica | Descripción Funcional en Modo Manual |
|---|---|---|---|---|
| **I1.0** | DI | `Jog_Stop_CCW_Z`| **NA (Contacto Abierto)** | Pulsador Stop en Auto / Jog Eje Z Antihorario en Manual |
| **I1.1** | DI | `Jog_CW_Z` | **NA (Contacto Abierto)** | Pulsador manual Jog Eje Z Horario (hacia Home) |
| **I1.2** | DI | `Jog_X_Fwd` | **NA (Contacto Abierto)** | Pulsador manual Jog Eje X Adelante (extensión horizontal) |
| **I1.3** | DI | `Jog_X_Rev` | **NA (Contacto Abierto)** | Pulsador manual Jog Eje X Atrás (hacia Home de retroceso) |
| **I1.4** | DI | `Jog_Y_Down` | **NA (Contacto Abierto)** | Pulsador manual Jog Eje Y Abajo (descenso vertical) |
| **I1.5** | DI | `Jog_Y_Up` | **NA (Contacto Abierto)** | Pulsador manual Jog Eje Y Arriba (hacia Home superior) |

---

## 2. Tabla de Salidas Digitales (DO)

| Dirección PLC | Tipo | Nemónico / Tag | Descripción Funcional del Actuador |
|---|---|---|---|
| **Q0.0** | DO (PTO 0) | `PTO0_Pulsos_Z` | Tren de impulsos de alta velocidad (PTO 0) para driver NEMA Eje Z (rotación base) |
| **Q0.1** | DO (PTO 1) | `PTO1_Pulsos_XY` | Tren de impulsos de alta velocidad (PTO 1) multiplexado para drivers NEMA Ejes X e Y |
| **Q0.2** | DO | `Dir_Eje_Z` | Sentido de giro Eje Z: `1` = Horario (hacia Home), `0` = Antihorario |
| **Q0.3** | DO | `Dir_Eje_X` | Sentido de avance Eje X: `1` = Hacia Home (atrás/recogido), `0` = Adelante |
| **Q0.4** | DO | `Dir_Eje_Y` | Sentido de elevación Eje Y: `1` = Subir hacia Home, `0` = Bajar |
| **Q0.5** | DO | `Rele_K1_X` | Salida de relé K1 para enrutar tren de pulsos PTO 1 al driver NEMA Eje X |
| **Q0.6** | DO | `Rele_K2_Y` | Salida de relé K2 para enrutar tren de pulsos PTO 1 al driver NEMA Eje Y |
| **Q0.7** | DO | `Solenoide_Garra`| Salida digital solenoide eléctrico de garra: `1` = Sujetar/Cerrar, `0` = Abrir |

---

## 3. Cinemática Real y Multiplexación Electromecánica PTO 1

1. **Actuación de Ejes Cinematográficos:**
   - Cada grado de libertad cinemático está accionado por motores paso a paso híbridos tipo NEMA con reductor mecánico y drivers bipolares paso a paso.
   - El efector final utiliza un **solenoide eléctrico actuador de pinza** gobernado en `Q0.7`.

2. **Multiplexación Electromecánica de PTO 1:**
   - La CPU 224CN dispone exclusivamente de dos generadores de pulsos PTO de alta velocidad integrados (`Q0.0` y `Q0.1`).
   - Para gobernar los 3 ejes articulados con 2 generadores PTO:
     - **Eje Z (Base giratoria):** Conectado de forma dedicada a **PTO 0** (`Q0.0`) y dirección `Q0.2`.
     - **Ejes X e Y (Brazo y Elevación):** Comparten dinámicamente el generador **PTO 1** (`Q0.1`) mediante los relés $K_1$ (`Q0.5`) y $K_2$ (`Q0.6`).
   - **Protocolo de Conmutación de Ejes X / Y:**
     - Para desplazar el **Eje X**: Activar relé $K_1$ (`Q0.5 = 1`), aguardar retardo de seguridad (50 ms) para extinción de rebotes mecánicos de contactos, establecer nivel directriz en `Q0.3` e iniciar perfil de pulsos en `Q0.1`.
     - Para desplazar el **Eje Y**: Activar relé $K_2$ (`Q0.6 = 1`), aguardar retardo de seguridad (50 ms), establecer nivel directriz en `Q0.4` e iniciar perfil de pulsos en `Q0.1`.
   - **Enclavamiento Hardware y Software:** Las salidas `Q0.5` y `Q0.6` cuentan con interbloqueo mutuo estricto; bajo ninguna condición pueden energizarse al unísono.

3. **Ciclo de Homing Obligatorio (Calibración Cero Máquina):**
   - Tras el encendido o rearme con `Btn_Reset` (`I0.6`), el autómata ejecuta la búsqueda ordenada de ceros mecánicos:
     1. Retroceso del Eje X hasta `Sens_Home_X` (`I0.1 = 1`).
     2. Rotación horaria de base Z hasta `Sens_Home_Z` (`I0.0 = 1`).
     3. Ascenso del Eje Y hasta `Sens_Home_Y` (`I0.3 = 1`), y apertura de garra.
   - Solo al completar el homing se valida la bandera de referencia lista (`M0.3`) permitiendo las rutinas automáticas PPI coordinadas con la celda XL-335B.
