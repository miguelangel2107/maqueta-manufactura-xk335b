# ⚡ Esquema Eléctrico: Estación 1 - Unidad de Transporte (Master)

Este subdirectorio contiene la documentación eléctrica detallada de la **Unidad de Transporte**, nodo maestro de la maqueta XK-335B.

---

## 📌 1. Especificaciones de la Estación
* **Controlador Principal:** Siemens SIMATIC S7-200 CPU 226 CN (DC/DC/DC, 24 DI / 16 DO a transistor).
* **Alimentación Principal:** 220 VAC monofásico hacia fuente conmutada MeanWell 24 VDC / 5 A y servodriver Panasonic.
* **Actuador Principal:** Servomotor AC y Servodriver Panasonic MINAS A4 (MBDDT2210) acoplado a husillo de bolas recirculantes en eje horizontal (X).
* **Manipulador Neumático:** Brazo cartesiano de 3 GDL con cilindros de elevación (Z), extensión (Y) y pinza neumática.
* **Bus de Comunicación:** Puerto 0 y Puerto 1 (RS-485 multipunto). Nodo maestro número 1.

---

## 🔌 2. Mapeo Eléctrico de Terminales y Conexiones

### Entradas Digitales (24 VDC - Sink/Source)
| Dirección PLC | Dispositivo / Sensor | Tipo de Contacto | Función Eléctrica |
| :---: | :--- | :---: | :--- |
| `I0.0` | Pulsador Parada Emergencia (QS-101) | NC (Normal Cerrado) | **Advertencia Kaizen:** Bloqueado en 1 lógico; requiere recambio de bloque de contactos. |
| `I0.1` | Sensor Home Eje X (ZT-101) | PNP / NA | Final de carrera inductivo de referencia cero. |
| `I0.2` | Sensor Límite Eje X (ZT-102) | PNP / NA | Final de carrera inductivo de seguridad de sobre-carrera. |
| `I0.3` | Cilindro Elevación Arriba | Reed Switch | Confirmación magnética SMC D-C73. |
| `I0.4` | Cilindro Elevación Abajo | Reed Switch | Confirmación magnética SMC D-C73. |
| `I0.5` | Cilindro Extensión Retraído | Reed Switch | Confirmación magnética SMC D-C73. |
| `I0.6` | Cilindro Extensión Avanzado | Reed Switch | Confirmación magnética SMC D-C73. |
| `I0.7` | Pinza Neumática Abierta | Reed Switch | Confirmación de pinza abierta. |

### Salidas Digitales (Transistor 24 VDC - Salida PTO Rápida)
| Dirección PLC | Dispositivo / Actuador | Señal Eléctrica | Función |
| :---: | :--- | :---: | :--- |
| `Q0.0` | Servodriver Panasonic (PULS) | Tren de Pulsos PTO | Salida rápida a transistor de alta frecuencia (hasta 20 kHz). |
| `Q0.1` | Servodriver Panasonic (SIGN) | Nivel Lógico DC | Sentido de giro del servomotor (Horario / Antihorario). |
| `Q0.2` | Servodriver Panasonic (SRV-ON) | Digital 24 VDC | Habilitación de potencia del servo (*Servo Enable*). |
| `Q0.3` | Solenoide Vástago Elevación (YV-101) | Bobina 24 VDC (0.15 A) | Electroválvula monoestable 5/2 Airtac. |
| `Q0.4` | Solenoide Extensión Brazo (YV-102) | Bobina 24 VDC (0.15 A) | Electroválvula monoestable 5/2 Airtac. |
| `Q0.5` | Solenoide Pinza Sujeción (YV-103) | Bobina 24 VDC (0.15 A) | Apertura/cierre de pinza angular neumática. |

---

## 📁 3. Archivos del Módulo
* `Plano_Electrico_Estacion_1_Transporte_Rev2.0.pdf`: Esquema unifilar y multifilar completo (AutoCAD Electrical).
* `Borneras_Estacion_1_RTB.pdf`: Diagrama de regletas de bornes y conexionado de interconexión con el panel maestro.
