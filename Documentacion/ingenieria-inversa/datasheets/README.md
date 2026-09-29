# 📑 Catálogo de Fichas Técnicas de Componentes (Datasheets)

Este directorio custodia la biblioteca de especificaciones técnicas, manuales de usuario y hojas de datos oficiales de los fabricantes de los componentes instalados en la **Maqueta de Manufactura Flexible XK-335B**. Estos documentos sustentan el dimensionamiento eléctrico, asignación de memorias I/O, parametrización de variadores y rutinas de temporización.

---

## 📋 1. Índice Descriptivo de Documentación Técnica

### 1.1. Controladores Lógicos Programables (PLCs) y Comunicación
* [`s7200_system_manual_es-ES.pdf`](s7200_system_manual_es-ES.pdf)  
  **Manual de Sistema SIMATIC S7-200 (Siemens AG - Español)**  
  * *Modelos en planta:* CPU 224 CN (Alimentación y Procesamiento), CPU 224XP CN (Selección) y CPU 226 CN (Transporte y Ensamblaje).  
  * *Uso principal:* Mapeo de áreas de memoria (`I`, `Q`, `V`, `M`, `SMB`), configuración de Contadores Rápidos (`HSC0` para encoder óptico), Generador de Tren de Pulsos (`PTO0` para servomotor Panasonic) y mapa de interrupciones de tiempo.
* [`Using_Modbus_Library_Step7_MW_4.0.pdf`](Using_Modbus_Library_Step7_MW_4.0.pdf)  
  **Guía de Implementación del Protocolo Modbus RTU en STEP 7-Micro/WIN**  
  * *Uso principal:* Configuración de rutinas `MBUS_CTRL`, `MBUS_MSG` y `MBUS_INIT` en la CPU 226 CN para gobernar el bus multipunto RS-485 en topología Daisy-Chain.
* [`YL_335_B_instruction_book_Mitsubishi_FX_3_U_8a2db1348a.pdf`](YL_335_B_instruction_book_Mitsubishi_FX_3_U_8a2db1348a.pdf)  
  **Manual de Instrucciones Mecánicas y Estructurales de la Maqueta YL-335B / XK-335B**  
  * *Uso principal:* Especificaciones de carreras mecánicas de cilindros, pares de apriete, tolerancias de montaje de la cinta transportadora y presión recomendada de línea de aire comprimido (0.4 – 0.6 MPa).

---

### 1.2. Accionamientos Eléctricos, Servos y Variadores de Frecuencia
* [`Technical reference_AC Servo Motor & Driver_MINAS A4-series.pdf`](Technical%20reference_AC%20Servo%20Motor%20%26%20Driver_MINAS%20A4-series.pdf)  
  **Referencia Técnica de Servomotores y Servodrivers Panasonic Serie MINAS A4**  
  * *Uso principal:* Especificaciones eléctricas del servodriver del eje de transporte, conexionado del conector CN X4 (señales `PULS` y `SIGN` a 24 VDC con resistencia limitadora externa o acoplamiento colector abierto).
* [`minas_a4_e.pdf`](minas_a4_e.pdf)  
  **Manual de Operación Rápida y Parámetros del Servodriver Panasonic MINAS A4**  
  * *Uso principal:* Ajuste de ganancias de control de posición proporcional e integral, configuración del número de pulsos por revolución del eje de transporte.
* [`map_serv_e.pdf`](map_serv_e.pdf)  
  **Guía de Selección y Aplicación de Control de Movimiento Panasonic**  
  * *Uso principal:* Curvas de torque versus velocidad, cálculo de inercia del manipulador cartesiano y tiempos de rampa de aceleración/desaceleración.
* [`PI9000_English_Manual_V17.0.pdf`](PI9000_English_Manual_V17.0.pdf)  
  **Manual de Usuario del Variador de Frecuencia POWTRAN Serie PT9100 / PI9000**  
  * *Uso principal:* Parametrización del inversor de frecuencia de la Estación 5 (Selección). Asignación de la entrada analógica `AI1` para consigna 0–10 VDC desde la CPU 224XP CN, terminales digitales `FWD`/`REV` para inversión de giro y curvas V/f para motor asíncrono trifásico 220 VAC.

---

### 1.3. Instrumentación y Sensores Industriales
* [`sensor_e3z-ls.pdf`](sensor_e3z-ls.pdf)  
  **Sensor Fotoeléctrico Compacto con Supresión de Fondo Omron Serie E3Z-LS**  
  * *Uso principal:* Detección de piezas en la tolva de alimentación y zona de clasificación. Tensión de alimentación 12–24 VDC, salida NPN a colector abierto y distancia de sensado ajustable de 20 a 200 mm inmune al color de la pieza.
* [`SERSOR_MAGNETICO_-Z80.pdf`](SERSOR_MAGNETICO_-Z80.pdf)  
  **Sensores Magnéticos de Posición Tipo Reed Switch (D-Z80 / D-C73)**  
  * *Uso principal:* Detección de final de carrera (cilindro extendido / vástago retraído) en cilindros neumáticos de procesado, alimentación y eyectores. Conexión a 2 hilos con LED indicador integrado.
* [`RTB-E.pdf`](RTB-E.pdf)  
  **Especificación de Bloques de Terminales y Borneras Industriales RTB**  
  * *Uso principal:* Capacidad de corriente, sección admisible de conductores y pares de apriete para la reestructuración del cableado en los paneles de control.

---

### 1.4. Actuadores Neumáticos
* [`CQ2_Z.pdf`](CQ2_Z.pdf)  
  **Cilindro Neumático Compacto de Doble Efecto SMC Serie CQ2-Z**  
  * *Uso principal:* Mecanismo de empuje y dosificación en la Estación de Alimentación. Carrera corta y montaje directo.
* [`MGPM-Z,_cilindro_guiado_estandar,_cojinete_deslizante.pdf`](MGPM-Z%2C_cilindro_guiado_estandar%2C_cojinete_deslizante.pdf)  
  **Cilindro Neumático Guiado SMC Serie MGPM-Z con Cojinetes Deslizantes**  
  * *Uso principal:* Accionamiento de la prensa de estampado y mordaza de fijación en la Estación de Procesamiento. Resistencia a cargas laterales y alta repetibilidad.
* [`MHC.pdf`](MHC.pdf)  
  **Pinza Neumática Angular SMC Serie MHC2**  
  * *Uso principal:* Manipulación y sujeción de componentes en la Estación de Ensamblaje y en el cabezal del manipulador de 3 GDL.
* [`medien_62289.pdf`](medien_62289.pdf)  
  **Documentación Técnica Complementaria de Actuadores y Electroválvulas Neumáticas**  
  * *Uso principal:* Datos de caudal, tiempos de conmutación de válvulas 5/2 vías biestables y monoestables, y consumo neumático.

---

## 👥 2. Instrucciones para Adición de Nuevas Hojas de Datos
1. Nombre del archivo normalizado sin espacios especiales: `Fabricante_Modelo_TipoDispositivo.pdf`.
2. Registrar la ficha en la tabla anterior especificando modelo, función en planta y estación asociada.
3. Si el archivo supera los 15 MB, optimizar su compresión vectorial antes del commit para evitar sobrecargar el repositorio Git.
