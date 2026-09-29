# 📊 Diagrama P&ID: Estación 2 - Unidad de Alimentación (Feeding Unit)

Este subdirectorio contiene la memoria descriptiva de los lazos de instrumentación de la **Unidad de Alimentación** según norma ANSI/ISA-S5.1-2009.

---

## 📌 1. Descripción Funcional del Proceso
La estación de alimentación dosifica piezas de trabajo desde un tubo almacén vertical por acción gravitacional hacia la plataforma de expulsión. Un cilindro neumático compacto empuja la pieza inferior hacia la zona de recogida del manipulador de transporte.

---

## 🏷️ 2. Tabla de Lazos de Instrumentación (Tags ISA)

| Tag ISA | Función del Instrumento | Variable de Control | Rango Operativo | Señal de Transmisión |
| :---: | :--- | :---: | :---: | :--- |
| **BTE-201** | Sensor Fotoeléctrico de Presencia | PV (Presencia de Pieza) | 20 a 200 mm | Discreta 24 VDC hacia `I0.0` (Omron E3Z-LS61). |
| **ZTE-201** | Transmisor Magnético Vástago Retraído | PV (Confirmación Reposo) | 0 o 1 | Discreta 24 VDC hacia `I0.1` (SMC D-C73). |
| **ZTE-202** | Transmisor Magnético Vástago Extendido| PV (Confirmación Expulsión)| 0 o 1 | Discreta 24 VDC hacia `I0.2` (SMC D-C73). |
| **ZYV-201** | Válvula Solenoide Cilindro Eyector | MV (Carrera Neumática) | 0.4 – 0.6 MPa | Discreta 24 VDC hacia electroválvula Airtac 4V120-06. |

---

## 🔀 3. Análisis de Causalidad Dinámica
* **Condición de Disparo:** $u_2(t) = 1$ únicamente si $\text{BTE-201} = 1$ (hay pieza disponible) y $\text{ZTE-201} = 1$ (empujador en reposo).
* **Variable Controlada ($y_2(t)$):** Estado de expulsión de la pieza ($y_2 \in \{0, 1\}$).
* **Perturbaciones ($d_2(t)$):** Atasco mecánico por rebabas en las piezas de plástico o fricción excesiva en el tubo de almacenamiento.

---

## 📁 4. Archivos de Plano
* `PID_Estacion_2_Alimentacion_Rev2.0.pdf`: Diagrama P&ID formal exportado en formato vectorial.
