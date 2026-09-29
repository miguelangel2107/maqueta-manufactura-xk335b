# 📊 Diagrama P&ID: Estación 5 - Unidad de Selección (Sorting Unit)

Este subdirectorio contiene la memoria descriptiva de los lazos de instrumentación de la **Unidad de Selección** según norma ANSI/ISA-S5.1-2009.

---

## 📌 1. Descripción Funcional del Proceso
La estación de selección transporta piezas a lo largo de una cinta accionada por un motor trifásico gobernado por variador de frecuencia (VFD). Mediante un arreglo de sensores inductivos, capacitivos y fotoeléctricos, clasifica las piezas según su material (metálico, plástico blanco o material no reflectivo) y las desvía mediante empujadores neumáticos hacia rampas de almacenamiento específicas.

---

## 🏷️ 2. Tabla de Lazos de Instrumentación (Tags ISA)

| Tag ISA | Función del Instrumento | Variable de Control | Rango Operativo | Señal de Transmisión |
| :---: | :--- | :---: | :---: | :--- |
| **ST-501** | Transmisor Óptico Velocidad (Encoder) | PV (Velocidad Cinta) | 0 a 1000 PPR | Tren de pulsos HSC0 hacia CPU 224XP CN. |
| **SC-501** | Variador de Frecuencia POWTRAN | MV (Consigna de Velocidad) | 0 a 50 Hz (0–10 V) | Tensión analógica continua desde salida `AQW0`. |
| **SIC-501** | Lazo de Control de Velocidad | Lazo Cerrado V/f | $0.1\text{ a }0.6\text{ m/s}$ | Lazo de realimentación por software en PLC. |
| **ZT-501** | Transmisor Inductivo Detector Metal | PV (Propiedad Metálica) | 0 a 8 mm (Booleano) | Discreta 24 VDC hacia `I0.3`. |
| **WT-501** | Transmisor Capacitivo Dieléctrico | PV (Propiedad Dieléctrica) | 0 a 15 mm | Discreta 24 VDC hacia `I0.2` (Winston CM18). |
| **BT-501** | Sensor Fotoeléctrico Presencia Tolva 1 | PV (Posición Descarga Metal) | 20 a 100 mm | Discreta 24 VDC hacia `I0.4`. |
| **BT-502** | Sensor Fotoeléctrico Presencia Tolva 2 | PV (Posición Descarga Plástico)| 20 a 100 mm | Discreta 24 VDC hacia `I0.5`. |
| **ZYV-501** | Válvula Solenoide Desviador Metálico | MV (Expulsión Tolva 1) | Presión 0.5 MPa | Discreta 24 VDC hacia electroválvula Airtac. |
| **ZYV-502** | Válvula Solenoide Desviador Plástico | MV (Expulsión Tolva 2) | Presión 0.5 MPa | Discreta 24 VDC hacia electroválvula Airtac. |

---

## 🔀 3. Análisis de Causalidad Dinámica y Modelado
* **Lazo Continuo de Velocidad:**
  $$G(s) = \frac{V(s)}{U(s)} \approx \frac{K}{\tau s + 1} e^{-\theta s}$$
  Donde la salida $V(s)$ es la velocidad lineal medida por el encoder `ST-501`, la entrada $U(s)$ es la tensión de consigna de $0\text{ a }10\text{ V}$ generada por `AQW0`, y el tiempo muerto $\theta$ contempla el retardo de respuesta del inversor POWTRAN.
* **Lógica Discreta de Clasificación:**
  - Si $\text{ZT-501} = 1 \implies$ Activar $\text{ZYV-501}$ al llegar a $\text{BT-501}$.
  - Si $\text{ZT-501} = 0 \land \text{WT-501} = 1 \implies$ Activar $\text{ZYV-502}$ al llegar a $\text{BT-502}$.
  - En cualquier otro caso $\implies$ La pieza continúa hasta el final de la cinta (Canal de descarte).

---

## 📁 4. Archivos de Plano
* `PID_Estacion_5_Seleccion_Rev2.0.pdf`: Diagrama P&ID formal con identificación del lazo analógico del VFD y los lazos discretos de eyección.
