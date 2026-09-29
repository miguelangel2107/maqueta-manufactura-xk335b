# ⚡ Esquema Eléctrico: Estación 5 - Unidad de Selección (Sorting Unit)

Este subdirectorio contiene la documentación eléctrica detallada de la **Unidad de Selección**, estación crítica por su accionamiento trifásico mediante variador de frecuencia y transducción analógica.

---

## 📌 1. Especificaciones de la Estación
* **Controlador Principal:** Siemens SIMATIC S7-200 CPU 224XP CN (DC/DC/DC, 14 DI / 10 DO a transistor, 2 AI / 1 AQ analógicas integradas).
* **Alimentación Principal:** 220 VAC monofásico hacia CPU, fuente conmutada 24 VDC y etapa de entrada del VFD.
* **Variador de Frecuencia (VFD):** POWTRAN Serie PT9100A / PI9000 (Entrada monofásica 220 VAC, salida trifásica 3x220 VAC hacia motor asíncrono).
* **Motor de Cinta:** Motor asíncrono trifásico jaula de ardilla (0.18 kW, 220 VAC $\Delta$).
* **Instrumentación y Sensores:**
  - Sensor capacitivo Winston CM18-3008NA (discriminación de materiales dieléctricos/plásticos).
  - Sensor inductivo LM18-3008NA (detección de metales).
  - Sensor fotoeléctrico Omron E3Z-LS61 (detección de llegada de pieza a tolva).
  - Encoder rotativo incremental ZSP3806 (1000 PPR) acoplado al eje de la cinta.
* **Bus de Comunicación:** Puerto RS-485 esclavo (Dirección de nodo: 5).

---

## 🔌 2. Mapeo Eléctrico de Terminales

### Entradas Digitales (24 VDC a Transistor)
| Dirección PLC | Dispositivo / Sensor | Tipo de Señal | Función |
| :---: | :--- | :---: | :--- |
| `I0.0` | Fase A Encoder Incremental (ST-501) | Pulsos rápidos (HSC0) | Entrada de alta velocidad conectada al contador por hardware de la CPU. |
| `I0.1` | Fase B Encoder Incremental (ST-501) | Pulsos rápidos (HSC0) | Discriminación de sentido de avance de la cinta. |
| `I0.2` | Sensor Capacitivo (WT-501) | NPN 24 VDC | Winston CM18. Detección de materiales no metálicos (plástico/madera). |
| `I0.3` | Sensor Inductivo (ZT-501) | PNP 24 VDC | LM18. Detección de piezas metálicas (aluminio/acero). |
| `I0.4` | Sensor Óptico Zona Descarga 1 | NPN 24 VDC | Detección frente a empujador neumático 1. |
| `I0.5` | Sensor Óptico Zona Descarga 2 | NPN 24 VDC | Detección frente a empujador neumático 2. |
| `I0.6` | Sensor Óptico Fin de Cinta | NPN 24 VDC | Detección de pieza descartada al canal residual. |

### Salidas Analógicas y Digitales
| Dirección PLC | Dispositivo / Terminal VFD | Tipo de Señal | Función |
| :---: | :--- | :---: | :--- |
| `AQW0` | Terminal AI1 del VFD POWTRAN | Tensión Analógica (0–10 VDC) | Consigna proporcional de frecuencia de salida (0 a 50 Hz). |
| `Q0.0` | Terminal FWD del VFD POWTRAN | Digital 24 VDC | Marcha adelante (*Forward Run*). |
| `Q0.1` | Terminal REV del VFD POWTRAN | Digital 24 VDC | **Advertencia Kaizen:** Conexión de inversión de giro detectada en auditoría pero omitida en manuales antiguos. |
| `Q0.2` | Solenoide Empujador 1 (Metal) | Bobina 24 VDC | Desvío neumático de piezas metálicas hacia tolva 1. |
| `Q0.3` | Solenoide Empujador 2 (Plástico) | Bobina 24 VDC | Desvío neumático de piezas plásticas hacia tolva 2. |

---

## 📁 3. Archivos del Módulo
* `Plano_Electrico_Estacion_5_Seleccion_Rev2.0.pdf`: Esquema eléctrico completo con circuito de fuerza trifásico del VFD, filtrado de armónicos y bornes analógicos.
