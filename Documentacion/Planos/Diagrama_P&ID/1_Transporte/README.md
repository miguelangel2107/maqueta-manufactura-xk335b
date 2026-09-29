# 📊 Diagrama P&ID: Estación 1 - Unidad de Transporte (Master)

Este subdirectorio contiene la memoria descriptiva de los lazos de instrumentación de la **Unidad de Transporte** según norma ANSI/ISA-S5.1-2009.

---

## 📌 1. Descripción Funcional del Proceso
La estación de transporte traslada las piezas entre las estaciones de la línea de manufactura mediante un pórtico cartesiano accionado por servomotor en el eje horizontal y actuadores neumáticos en elevación y sujeción. Como nodo maestro, orquesta el inicio de ciclo de los esclavos a través del bus serial RS-485.

---

## 🏷️ 2. Tabla de Lazos de Instrumentación (Tags ISA)

| Tag ISA | Función del Instrumento | Variable de Control | Rango Operativo | Señal de Transmisión |
| :---: | :--- | :---: | :---: | :--- |
| **QS-101** | Pulsador Parada de Emergencia | Seguridad | 0 o 1 (Booleano) | Discreta 24 VDC hacia `I0.0` (Requiere recambio Kaizen). |
| **ZT-101** | Transmisor Inductivo Home (Eje X) | PV (Posición Cero) | 0 a 4 mm detección | Discreta 24 VDC hacia `I0.1`. |
| **ZT-102** | Transmisor Límite Carrera Eje X | PV (Límite Máximo) | 0 a 4 mm detección | Discreta 24 VDC hacia `I0.2`. |
| **ZTC-101** | Controlador Servodriver Panasonic | MV (Tren de Pulsos PTO) | 0 a 3000 RPM (20 kHz) | Frecuencia de pulsos hacia entrada PULS del driver. |
| **ZIC-102** | Válvula Solenoide Cilindro Elevación | MV (Presión Neumática) | 0.4 – 0.6 MPa | Discreta 24 VDC hacia electroválvula monoestable 5/2. |
| **ZIC-103** | Válvula Solenoide Pinza de Agarre | MV (Apertura/Cierre) | 0 o 1 | Discreta 24 VDC hacia electroválvula 5/2. |

---

## 🔀 3. Análisis de Causalidad Dinámica
* **Entrada Manipulada ($u_1(t)$):** Frecuencia de pulsos PTO generada por la CPU 226 CN para controlar la velocidad y rampa de aceleración del carro horizontal.
* **Variable de Salida ($y_1(t)$):** Posición lineal $x(t)$ del manipulador a lo largo del riel de 1050 mm.
* **Perturbaciones ($d_1(t)$):** Fricción variable a lo largo de las guías lineales por falta de lubricación y peso variable de la pieza transportada.

---

## 📁 4. Archivos de Plano
* `PID_Estacion_1_Transporte_Rev2.0.pdf`: Diagrama P&ID formal exportado en formato vectorial con cajetín normalizado.
