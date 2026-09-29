# ⚡ Esquema Eléctrico: Estación 3 - Unidad de Ensamblaje (Assembly Unit)

Este subdirectorio contiene la documentación eléctrica detallada de la **Unidad de Ensamblaje** de la maqueta XK-335B.

---

## 📌 1. Especificaciones de la Estación
* **Controlador Principal:** Siemens SIMATIC S7-200 CPU 226 CN (AC/DC/Relé, 24 DI / 16 DO a relé).
* **Alimentación Principal:** 220 VAC hacia CPU y fuente local de 24 VDC.
* **Actuadores Principales:**
  - Actuador neumático rotativo oscilante (0° a 180°) para transferencia angular de piezas de ensamble.
  - Pinza neumática angular SMC MHC2-16D para agarre de tapas y pasadores.
  - Cilindro vertical de inserción y prensado suave.
* **Sensores:** Sensores magnéticos de ranura SMC D-Z80 / D-C73 y sensor inductivo de detección de base.
* **Bus de Comunicación:** Puerto RS-485 esclavo (Dirección de nodo: 4).

---

## 🔌 2. Mapeo Eléctrico de Terminales

### Entradas Digitales (24 VDC)
| Dirección PLC | Dispositivo / Sensor | Tipo de Señal | Función |
| :---: | :--- | :---: | :--- |
| `I0.0` | Sensor Posición Angular 0° (ZT-401) | Reed Switch D-Z80 | **Advertencia Kaizen:** Conductor con aislación pelada rozando el chasis; requiere funda termocontraíble. |
| `I0.1` | Sensor Posición Angular 180° (ZT-402) | Reed Switch D-Z80 | Confirmación de actuador rotativo en posición de ensamblaje. |
| `I0.2` | Sensor Cilindro Vertical Arriba | Reed Switch D-C73 | Posición de reposo del cabezal de ensamble. |
| `I0.3` | Sensor Cilindro Vertical Abajo | Reed Switch D-C73 | Confirmación de inserción de pasador/tapa completada. |
| `I0.4` | Sensor Pinza Cerrada / Pieza Sujeta | Reed Switch D-C73 | Confirmación de agarre seguro de componente. |
| `I0.5` | Sensor Inductivo Presencia Base | Inductivo PNP 24V | Verifica presencia de base antes de soltar tapa. |

### Salidas Digitales (Salidas a Relé 24 VDC)
| Dirección PLC | Dispositivo / Actuador | Señal Eléctrica | Función |
| :---: | :--- | :---: | :--- |
| `Q0.0` | Solenoide Giro Rotativo a 180° (YV-401) | Bobina 24 VDC | Electroválvula 5/2 Airtac. |
| `Q0.1` | Solenoide Retorno Rotativo a 0° (YV-402) | Bobina 24 VDC | Retorno de brazo angular a posición inicial. |
| `Q0.2` | Solenoide Descenso Cabezal (YV-403) | Bobina 24 VDC | Descenso neumático para inserción de pieza. |
| `Q0.3` | Solenoide Cierre de Pinza (YV-404) | Bobina 24 VDC | Accionamiento de pinza angular SMC MHC2. |

---

## 📁 3. Archivos del Módulo
* `Plano_Electrico_Estacion_3_Ensamblaje_Rev2.0.pdf`: Diagrama esquemático de bornes y conexionado de electroválvulas.
