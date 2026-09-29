# ⚡ Esquemas Eléctricos de Potencia y Mando (Norma IEC 60617 / IEC 81346)

Este directorio custodia la documentación esquemática del cableado eléctrico, circuitos de alimentación, protecciones magnetotérmicas, borneras de conexión y distribución de señales de entrada/salida (I/O) hacia los controladores **Siemens SIMATIC S7-200** de la maqueta XK-335B.

---

## 📌 1. Marco Normativo Aplicado

Los diagramas eléctricos deben desarrollarse y leerse bajo los siguientes estándares internacionales:
* **IEC 60617:** Símbolos gráficos para esquemas eléctricos (contactores, pulsadores, bobinas de electroválvulas, motores trifásicos, fuentes conmutadas).
* **IEC 81346:** Estructuración y designación de referencias para objetos técnicos (Designación por letras: `-K` relés, `-Q` interruptores de potencia, `-B` transductores/sensores, `-M` motores, `-F` fusibles/disyuntores).
* **IEC 60204-1:** Seguridad de las máquinas — Equipo eléctrico de las máquinas (circuitos de parada de emergencia y categorías de seguridad).

---

## 🎨 2. Código de Colores de Conductores y Niveles de Tensión

Para estandarizar el recableado y las acciones correctivas Kaizen de la planta, se define la siguiente convención obligatoria:

| Nivel de Tensión / Función | Color de Conductor | Sección Recomendada |
| :--- | :--- | :--- |
| **Fase AC (220 VAC - Potencia y VFD)** | Marrón o Negro | $1.5\text{ mm}^2$ |
| **Neutro AC (220 VAC)** | Azul Claro | $1.5\text{ mm}^2$ |
| **Tierra de Protección (PE)** | Verde / Amarillo | $1.5\text{ mm}^2$ / $2.5\text{ mm}^2$ |
| **Positivo DC (+24 VDC - Mando e I/O PLC)** | Rojo o Azul Oscuro | $0.5\text{ mm}^2$ – $0.75\text{ mm}^2$ |
| **Común / Negativo DC (0 VDC)** | Blanco o Azul con línea blanca | $0.5\text{ mm}^2$ – $0.75\text{ mm}^2$ |
| **Señales Analógicas (0–10 V / 4–20 mA)** | Par trenzado con malla apantallada (Shielded) | $0.35\text{ mm}^2$ (Malla a PE) |
| **Bus de Campo RS-485 (A+, B-)** | Par trenzado morado / apantallado industrial | Belden 9841 o equivalente |

---

## 📂 3. Índice de Estaciones y Planos Eléctricos

| Carpeta de Estación | Controlador Asignado | Alimentación y Cargas Principales | Guía de Conexión |
| :--- | :--- | :--- | :--- |
| [`1_Transporte/`](1_Transporte/README.md) | CPU 226 CN (DC/DC/DC) | Servodriver Panasonic MINAS A4 (220 VAC), alimentación 24 VDC y parada de emergencia QS-101. | [Ver especificaciones](1_Transporte/README.md) |
| [`2_Alimentacion/`](2_Alimentacion/README.md) | CPU 224 CN (Relé) | Electroválvula Airtac 5/2 (24 VDC), sensor fotoeléctrico Omron E3Z-LS61. | [Ver especificaciones](2_Alimentacion/README.md) |
| [`3_Ensamblaje/`](3_Ensamblaje/README.md) | CPU 226 CN (Relé) | Electroválvulas de pinza angular MHC y actuador rotativo neumático. | [Ver especificaciones](3_Ensamblaje/README.md) |
| [`4_Procesamiento/`](4_Procesamiento/README.md) | CPU 224 CN (Relé) | Cilindro de prensa SMC MGPM y mordaza guiada con sensores magnéticos D-C73. | [Ver especificaciones](4_Procesamiento/README.md) |
| [`5_Seleccion/`](5_Seleccion/README.md) | CPU 224XP CN (DC/DC/DC) | VFD POWTRAN PT9100A, motor trifásico 220 VAC, encoder incremental y sensores inductivo/capacitivo. | [Ver especificaciones](5_Seleccion/README.md) |

---

## 👥 4. Instrucciones de Entrega para Estudiantes (ETN-1034)
- Los planos eléctricos generados en AutoCAD Electrical deben exportarse a PDF y nombrarse: `Plano_Electrico_Estacion_[N]_[Nombre]_Rev2.0.pdf`.
- Deben incluirse las tablas de bornes (*Terminal Strip Diagrams*) indicando número de borne en regleta RTB, etiqueta de cable, señal y borne de destino en el PLC.
