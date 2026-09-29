# ⚡ Esquema Eléctrico: Estación 2 - Unidad de Alimentación (Feeding Unit)

Este subdirectorio contiene la documentación eléctrica detallada de la **Unidad de Alimentación** de la maqueta XK-335B.

---

## 📌 1. Especificaciones de la Estación
* **Controlador Principal:** Siemens SIMATIC S7-200 CPU 224 CN (AC/DC/Relé, 14 DI / 10 DO a relé).
* **Alimentación Principal:** 220 VAC hacia CPU y fuente local de 24 VDC.
* **Actuador Neumático:** Cilindro compacto de empuje SMC Serie CQ2 (carrera corta) para eyección horizontal de piezas almacenadas en la tolva tubular vertical.
* **Sensores:** Sensor fotoeléctrico Omron E3Z-LS61 (supresión de fondo para detección de presencia de material en tolva) y sensores magnéticos SMC D-C73.
* **Bus de Comunicación:** Puerto RS-485 esclavo (Dirección de nodo: 2).

---

## 🔌 2. Mapeo Eléctrico de Terminales

### Entradas Digitales (24 VDC)
| Dirección PLC | Dispositivo / Sensor | Tipo de Señal | Función |
| :---: | :--- | :---: | :--- |
| `I0.0` | Sensor Presencia de Pieza (BT-201) | NPN Colector Abierto | Omron E3Z-LS61. Detecta pieza disponible en el almacén vertical. |
| `I0.1` | Cilindro Eyector Retraído (ZT-201) | Reed Switch NA | Confirmación de cilindro empujador en reposo. |
| `I0.2` | Cilindro Eyector Extendido (ZT-202) | Reed Switch NA | Confirmación de pieza expulsada a la zona de recogida. |
| `I0.3` | Pulsador Marcha Local (SF-201) | Contacto NA | Inicio de ciclo en modo manual. |
| `I0.4` | Pulsador Parada Local (SS-201) | Contacto NC | Parada de ciclo en modo manual. |

### Salidas Digitales (Salidas a Relé 24 VDC / 220 VAC)
| Dirección PLC | Dispositivo / Actuador | Carga Eléctrica | Función |
| :---: | :--- | :---: | :--- |
| `Q0.0` | Solenoide Cilindro Eyector (YV-201) | Bobina 24 VDC (4.8 W) | Válvula monoestable Airtac 4V120-06. Activa el avance del empujador. |
| `Q0.1` | Indicador Luminoso Verde | Lámpara LED 24 VDC | Estado de estación en operación normal. |
| `Q0.2` | Indicador Luminoso Rojo (Alarma) | Lámpara LED 24 VDC | Alarma de tolva vacía o atasco en eyección. |

---

## 📁 3. Archivos del Módulo
* `Plano_Electrico_Estacion_2_Alimentacion_Rev2.0.pdf`: Esquema de conexiones y lazo de alimentación 24 VDC.
