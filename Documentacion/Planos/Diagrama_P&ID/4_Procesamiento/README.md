# 📊 Diagrama P&ID: Estación 4 - Unidad de Procesamiento (Processing Unit)

Este subdirectorio contiene la memoria descriptiva de los lazos de instrumentación de la **Unidad de Procesamiento** según norma ANSI/ISA-S5.1-2009.

---

## 📌 1. Descripción Funcional del Proceso
La estación de procesamiento ejecuta la simulación de punzonado, maquinado o estampado sobre la pieza base. Cuenta con una mordaza neumática guiada lateral para retención de la pieza contra la bancada y un cilindro neumático vertical guiado con plato de prensa.

---

## 🏷️ 2. Tabla de Lazos de Instrumentación (Tags ISA)

| Tag ISA | Función del Instrumento | Variable de Control | Rango Operativo | Señal de Transmisión |
| :---: | :--- | :---: | :---: | :--- |
| **ZTE-301** | Transmisor Magnético Prensa Superior | PV (Vástago Retraído) | 0 o 1 | Discreta 24 VDC hacia `I0.0` (Fijado con silicona). |
| **ZTE-302** | Transmisor Magnético Prensa Inferior | PV (Vástago Extendido) | 0 o 1 | Discreta 24 VDC hacia `I0.1` (Falla analítica Lab 1). |
| **ZTE-303** | Transmisor Mordaza Abierta | PV (Área Despejada) | 0 o 1 | Discreta 24 VDC hacia `I0.2`. |
| **ZTE-304** | Transmisor Mordaza Enclavada | PV (Pieza Sujeta) | 0 o 1 | Discreta 24 VDC hacia `I0.3`. |
| **ZYV-301** | Válvula Solenoide Prensa Estampado | MV (Carrera Punzón) | Presión 0.6 MPa | Discreta 24 VDC hacia electroválvula Airtac 4V210-08. |
| **ZYV-302** | Válvula Solenoide Mordaza Lateral | MV (Fuerza Retención) | Presión 0.4 MPa | Discreta 24 VDC hacia electroválvula 5/2. |

---

## 🔀 3. Análisis de Causalidad y Ruptura de Lazo (ETN-902)
* **Condición Nominal:**
  - Sujeción por mordaza ($u_{\text{mordaza}} = 1 \implies \text{ZTE-304} = 1$).
  - Descenso de prensa ($u_{\text{prensa}} = 1 \implies \text{ZTE-302} = 1$).
  - Temporización de prensado $\tau = 2.0\text{ s}$.
  - Ascenso de prensa ($\text{ZTE-301} = 1 \implies u_{\text{mordaza}} = 0$).
* **Falla Crítica de Ruptura de Causalidad:** Si el sensor magnético `ZTE-302` se desprende físicamente por vibración, la rutina de PLC jamás detecta la culminación de la carrera, dejando al sistema en lazo abierto permanente ($C = [0\ 0]$).

---

## 📁 4. Archivos de Plano
* `PID_Estacion_4_Procesamiento_Rev2.0.pdf`: Diagrama P&ID formal exportado en formato vectorial.
