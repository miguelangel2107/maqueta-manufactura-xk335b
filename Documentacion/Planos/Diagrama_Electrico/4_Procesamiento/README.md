# ⚡ Esquema Eléctrico: Estación 4 - Unidad de Procesamiento (Processing Unit)

Este subdirectorio contiene la documentación eléctrica detallada de la **Unidad de Procesamiento** de la maqueta XK-335B.

---

## 📌 1. Especificaciones de la Estación
* **Controlador Principal:** Siemens SIMATIC S7-200 CPU 224 CN (AC/DC/Relé, 14 DI / 10 DO a relé).
* **Alimentación Principal:** 220 VAC hacia CPU y fuente local de 24 VDC.
* **Actuadores Principales:**
  - Cilindro guiado con cojinetes deslizantes SMC Serie MGPM20-50Z para simulación de prensa de punzonado/estampado.
  - Mordaza neumática lateral de sujeción rígida de la pieza durante el maquinado.
* **Sensores:** Sensores magnéticos SMC D-C73 en ranuras de vástago.
* **Bus de Comunicación:** Puerto RS-485 esclavo (Dirección de nodo: 3).

---

## 🔌 2. Mapeo Eléctrico de Terminales

### Entradas Digitales (24 VDC)
| Dirección PLC | Dispositivo / Sensor | Tipo de Señal | Función |
| :---: | :--- | :---: | :--- |
| `I0.0` | Sensor Prensa Arriba (ZT-301) | Reed Switch NA | **Advertencia Kaizen:** Sensor fijado con silicona caliente; riesgo de descalibración y pérdida de señal. |
| `I0.1` | Sensor Prensa Abajo (ZT-302) | Reed Switch NA | Sensor fin de carrera de estampado completado. |
| `I0.2` | Sensor Mordaza Abierta | Reed Switch NA | Confirmación de zona despejada para carga/descarga. |
| `I0.3` | Sensor Mordaza Sujetando Pieza | Reed Switch NA | Confirmación de pieza enclavada antes de autorizar bajada de prensa. |
| `I0.4` | Sensor Óptico Presencia Pieza | NPN 24 VDC | Omron E3Z para confirmar pieza en mesa de trabajo. |

### Salidas Digitales (Salidas a Relé 24 VDC)
| Dirección PLC | Dispositivo / Actuador | Señal Eléctrica | Función |
| :---: | :--- | :---: | :--- |
| `Q0.0` | Solenoide Bajada Prensa (YV-301) | Bobina 24 VDC | Electroválvula 5/2 Airtac 4V210-08. Acciona el estampado. |
| `Q0.1` | Solenoide Cierre Mordaza (YV-302) | Bobina 24 VDC | **Advertencia Kaizen:** Desalineación mecánica con respecto al vástago de prensa. |
| `Q0.2` | Lámpara de Ciclo de Maquinado | LED 24 VDC | Indicador visual de operación activa. |

---

## 📁 3. Archivos del Módulo
* `Plano_Electrico_Estacion_4_Procesamiento_Rev2.0.pdf`: Esquema eléctrico de fuerza, lazos de protección e interbloqueos de la prensa.
