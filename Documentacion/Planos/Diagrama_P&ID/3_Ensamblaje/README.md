# 📊 Diagrama P&ID: Estación 3 - Unidad de Ensamblaje (Assembly Unit)

Este subdirectorio contiene la memoria descriptiva de los lazos de instrumentación de la **Unidad de Ensamblaje** según norma ANSI/ISA-S5.1-2009.

---

## 📌 1. Descripción Funcional del Proceso
La estación de ensamblaje toma pasadores o tapas cilíndricas desde un cargador secundario mediante una pinza angular montada sobre un brazo rotativo oscilante (0° a 180°), insertándolos en la cavidad de la pieza base depositada previamente en la mesa de trabajo.

---

## 🏷️ 2. Tabla de Lazos de Instrumentación (Tags ISA)

| Tag ISA | Función del Instrumento | Variable de Control | Rango Operativo | Señal de Transmisión |
| :---: | :--- | :---: | :---: | :--- |
| **ZTE-401** | Transmisor Magnético Posición 0° | PV (Ángulo Inicial) | 0 o 1 | Discreta 24 VDC hacia `I0.0` (SMC D-Z80). |
| **ZTE-402** | Transmisor Magnético Posición 180° | PV (Ángulo Ensamble) | 0 o 1 | Discreta 24 VDC hacia `I0.1` (SMC D-Z80). |
| **ZTE-403** | Transmisor Presencia Base (Inductivo) | PV (Base en Posición) | 0 a 8 mm | Discreta 24 VDC hacia `I0.5` (LM18). |
| **ZYV-401** | Válvula Giro Rotativo Neumático | MV (Avance Angular) | 0° a 180° | Discreta 24 VDC hacia electroválvula 5/2. |
| **ZYV-402** | Válvula Accionamiento Pinza Angular | MV (Sujeción Pasador) | Presión 0.5 MPa | Discreta 24 VDC hacia pinza MHC2-16D. |

---

## 🔀 3. Análisis de Causalidad Dinámica
* **Secuencia de Control:** Sujeción en 0° $\to$ Giro 180° $\to$ Descenso $\to$ Apertura $\to$ Ascenso $\to$ Retorno 0°.
* **Enclavamiento Crítico:** El solenoide de apertura de la pinza `ZYV-402` no debe dispararse si la confirmación de base `ZTE-403` es nula.

---

## 📁 4. Archivos de Plano
* `PID_Estacion_3_Ensamblaje_Rev2.0.pdf`: Diagrama P&ID formal exportado en formato vectorial.
