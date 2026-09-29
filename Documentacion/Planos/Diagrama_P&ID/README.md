# 📊 Diagramas de Tuberías e Instrumentación (ANSI/ISA-S5.1-2009)

Este directorio alberga la documentación esquemática funcional y los diagramas **P&ID (Piping and Instrumentation Diagrams)** de la Maqueta de Manufactura Flexible XK-335B, normalizados bajo el estándar internacional **ANSI/ISA-S5.1-2009: Instrumentation Symbols and Identification**.

---

## 📌 1. Marco Normativo y Reglas de Codificación ISA

La norma ANSI/ISA-S5.1 establece las bases para diagramar procesos industriales sin ambigüedad mediante una nomenclatura alfanumérica estandarizada (Tags de Instrumentos):

```text
                                  ┌───────────────────────────────┐
                                  │      TAG ISA: [XX]-[NNN]      │
                                  └──────────────┬────────────────┘
                                                 │
                  ┌──────────────────────────────┴──────────────────────────────┐
                  ▼                                                             ▼
  ┌───────────────────────────────────────────────┐     ┌───────────────────────────────────────────────┐
  │         LETRAS DE IDENTIFICACIÓN (XX)         │     │            NÚMERO DE LAZO (NNN)               │
  ├───────────────────────────────────────────────┤     ├───────────────────────────────────────────────┤
  │ • Primera Letra: Variable medida o iniciadora │     │ • Dígito de Centena: Número de la Estación    │
  │   - Z: Posición, Dimensión, Eje mecánico      │     │   - 1xx: Estación 1 (Transporte)              │
  │   - S: Velocidad, Frecuencia rotacional       │     │   - 2xx: Estación 2 (Alimentación)            │
  │   - P: Presión o Vacío                        │     │   - 3xx: Estación 3 (Procesamiento)           │
  │   - W: Peso, Fuerza, Constante dieléctrica    │     │   - 4xx: Estación 4 (Ensamblaje)              │
  │   - Q: Cantidad, Evento contador, Calidad     │     │   - 5xx: Estación 5 (Selección)               │
  │ • Letras Sucesivas: Función pasiva o salida   │     │ • Dígitos Decena/Unidad: Identificador secuencial│
  │   - T: Transmisor                             │     │   - Ejemplo: ZT-101 (Transmisor posición Est.1)│
  │   - C: Controlador                            │     │   - Ejemplo: SI-501 (Indicador velocidad Est.5)│
  │   - V: Válvula de control / Solenoide         │     │   - Ejemplo: QS-101 (Interruptor parada Est.1)│
  │   - S: Interruptor / Switch                   │     │                                               │
  │   - E: Elemento primario sensor               │     │                                               │
  └───────────────────────────────────────────────┘     └───────────────────────────────────────────────┘
```

---

## ✏️ 2. Simbología Gráfica de Burbujas y Líneas de Instrumentación

### Tipos de Burbujas (Identificación de Ubicación)
* **Círculo Simple:** Instrumento discreto montado en campo (ej. sensor inductivo en bancada de máquina).
* **Círculo dentro de un Cuadrado:** Función compartida o visualización en pantalla HMI / DCS / SCADA.
* **Círculo con Línea Horizontal Sólida:** Montado en el panel principal accesible al operador.
* **Cuadrado con Rombo Interior:** Función de software ejecutada en PLC (*Shared Programmable Logic Controller*).

### Líneas de Interconexión de Instrumentación
* `───────` : Tubería de proceso / transporte mecánico de piezas.
* `── ── ──` : Señal eléctrica de instrumentación (4–20 mA, 0–10 VDC o 24 VDC digital).
* `── // ──` : Señal neumática de aire comprimido (alimentación a cilindros a 0.6 MPa).
* `── ◦ ── ◦ ──` : Enlace de comunicación de datos o bus de software industrial (RS-485 / Modbus RTU).

---

## 📂 3. Índice de Estaciones y Diagramas P&ID

| Estación | Subsistema de Planta | Lazos Instrumentados Principales | Guía de Lazos |
| :--- | :--- | :--- | :--- |
| [`1_Transporte/`](1_Transporte/README.md) | Nodo Maestro / Manipulador 3 GDL | Lazo de posición cartesiana horizontal (ZTC-101), lazo de elevación neumática (ZIC-102), enclavamiento de emergencia (QSE-101). | [Ver Lazos](1_Transporte/README.md) |
| [`2_Alimentacion/`](2_Alimentacion/README.md) | Dispensado Vertical / Empujador | Lazo de detección de presencia en tolva (BTE-201), lazo de dosificación por carrera de cilindro (ZIC-201). | [Ver Lazos](2_Alimentacion/README.md) |
| [`3_Ensamblaje/`](3_Ensamblaje/README.md) | Actuador Rotativo / Pinza | Lazo de orientación angular 0°–180° (ZIC-401), lazo de prensado vertical (ZIC-402), confirmación de sujeción (ZTE-403). | [Ver Lazos](3_Ensamblaje/README.md) |
| [`4_Procesamiento/`](4_Procesamiento/README.md) | Prensa de Punzonado / Mordaza | Lazo de prensado de estampado (ZIC-301), lazo de fijación de pieza (ZIC-302), análisis de redundancia magnética. | [Ver Lazos](4_Procesamiento/README.md) |
| [`5_Seleccion/`](5_Seleccion/README.md) | Clasificación / Cinta / VFD | Lazo de velocidad en cascada (SIC-501 con consigna VFD y feedback encoder), lazo discriminador de material inductivo/capacitivo (QIC-501). | [Ver Lazos](5_Seleccion/README.md) |

---

## 👥 4. Requisitos de Entrega para Estudiantes (ETN-902)
- Los diagramas P&ID deben guardarse en formato vectorial: `PID_Estacion_[N]_[Nombre]_Rev2.0.pdf`.
- Cada lazo debe tener claramente identificadas las variables:
  - **PV (Process Variable):** Señal medida por el transmisor o sensor.
  - **MV (Manipulated Variable):** Acción calculada por el PLC enviada al actuador.
  - **DV (Disturbance Variable):** Perturbaciones no controladas (variaciones de rozamiento, peso del lote, variaciones de presión neumática).
