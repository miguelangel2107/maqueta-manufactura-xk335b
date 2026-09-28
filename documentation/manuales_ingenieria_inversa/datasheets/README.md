# 📑 Fichas Técnicas de Componentes (Datasheets)

Repositorio de especificaciones técnicas y manuales de fabricante de los equipos instalados en la planta de manufactura flexible. Estos documentos sirven de respaldo técnico para la caracterización eléctrica, rangos de tensión/corriente y tiempos de respuesta.

---

## 📋 Índice de Hojas de Datos

### 1. Controladores Lógicos Programables (PLCs)
* **`Siemens_SIMATIC_S7-200_System_Manual.pdf`**  
  * *Modelos:* CPU 224 CN, CPU 224XP CN, CPU 226 CN.  
  * *Puntos clave:* Mapeo de memoria I/Q/V, asignación de contadores rápidos (HSC), generación de tren de pulsos (PTO) y especificaciones eléctricas de entradas/salidas a transistor y relé.

### 2. Accionamientos y Motores
* **`VFD_POWTRAN_PT9100A_Manual.pdf`**  
  * Variador de frecuencia para el motor trifásico de la Unidad de Selección. Mapeo de terminales de mando digital (sentido de giro) y entrada analógica (consigna de velocidad 0–10 VDC conectada a la CPU 224XP).
* **`Panasonic_AC_Servo_Driver_MINAS_A4.pdf`**  
  * Driver y servomotor de la Unidad de Transporte para el eje horizontal y posicionamiento del manipulador.

### 3. Instrumentación y Sensores
* **`Omron_E3Z-LS61.pdf`:** Sensor fotoeléctrico de supresión de fondo (detección de presencia de piezas, 12–24 VDC, salida NPN).
* **`SMC_D-C73_Reed_Switch.pdf`:** Sensores magnéticos para ranura de cilindros neumáticos (confirmación de finales de carrera y vástago extendido/retraído).
* **`Winston_CM18_Capacitive_Sensor.pdf`:** Sensores de proximidad capacitivos (Unidad de Selección) para discriminación de materiales no metálicos por constante dieléctrica.
* **`LM18-3008NA_Inductive_Sensor.pdf`:** Sensores inductivos de proximidad para detección de metales.
* **`ZSP_3806_Incremental_Encoder.pdf`:** Transductor óptico rotativo para medición de velocidad y desplazamiento de la cinta transportadora.

### 4. Actuadores Neumáticos
* **`AIRTAC_4V120-06_Solenoid_Valve.pdf`:** Electroválvulas monoestables y biestables de 5/2 vías para el accionamiento de los cilindros de estampado, dosificación y pinzas mecánicas.
