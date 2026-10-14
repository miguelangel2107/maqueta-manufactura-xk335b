**Universidad Mayor de San Andrés**  
**Facultad de Ingeniería**  
**Ingeniería Electrónica**  
![][image1]  
**Informe de laboratorio N°3**  
**“Elementos en sistemas de control”**

**Asignatura:** 		  
Sistemas de Control II \- ETN 902  
Aplicación de Técnicas de Control \- ETN 1034  
**Docente:**				  
Ing. Jorge Antonio Nava Amador  
**Auxiliares:**

- Aux. Limber Ajnota Cahuaya (ETN1034)  
- Aux. Fabian Plata Vargas (ETN902)				

**Integrantes Grupo Planta de manufactura:**	

- Univ. Herrera Tola Gabriel Sebastian (ETN1034)  
- Univ. Huanca Mamani Alan Nestor (ETN1034)  
- Univ. Mamani Tola José Aldin (ETN1034)  
- Univ. Quispe Mamani Leonardo Darwin (ETN902)  
- Univ. Monzon Hidalgo Josue (ETN902) 


**Fecha de presentación:**	7/4/2026

La Paz \- Bolivia

[**Resumen	3**](#resumen)

[**Objetivos	3**](#objetivos)

[Objetivo General	3](#objetivo-general)

[Objetivos Específicos	3](#objetivos-específicos)

[**Fundamento Teórico	3**](#fundamento-teórico)

[Acondicionamiento de Señales Industriales	3](#acondicionamiento-de-señales-industriales)

[Comunicaciones Industriales: Modbus RTU y RS485	4](#comunicaciones-industriales:-modbus-rtu-y-rs485)

[Sistemas de Control Distribuido (DCS)	4](#sistemas-de-control-distribuido-\(dcs\))

[**Características de Hardware y Componentes (Tabla de Dispositivos)	4**](#características-de-hardware-y-componentes-\(tabla-de-dispositivos\))

[Clasificación de Dispositivos de Campo	5](#clasificación-de-dispositivos-de-campo)

[**Arquitectura del Sistema y Adaptación de Señales	5**](#arquitectura-del-sistema-y-adaptación-de-señales)

[Etapas de Potencia y Acondicionamiento	5](#etapas-de-potencia-y-acondicionamiento)

[Interacción Digital y Discreta	5](#interacción-digital-y-discreta)

[**Protocolos y Estándares de Comunicación	6**](#protocolos-y-estándares-de-comunicación)

[Configuración Maestro-Esclavo	6](#configuración-maestro-esclavo)

[Interfaz Física RS485	6](#interfaz-física-rs485)

[**Interfaz Hombre-Máquina (HMI) y Supervisión	6**](#interfaz-hombre-máquina-\(hmi\)-y-supervisión)

[Funciones principales de la HMI	7](#funciones-principales-de-la-hmi)

[**Verificación y Mediciones (Resultados Esperados)	7**](#verificación-y-mediciones-\(resultados-esperados\))

[Unidad de Alimentación	7](#unidad-de-alimentación)

[Entradas — Resultados de Medición de Tensión	7](#entradas-—-resultados-de-medición-de-tensión)

[Unidad de Procesamiento	8](#unidad-de-procesamiento)

[Entradas — Resultados de Medición de Tensión	8](#entradas-—-resultados-de-medición-de-tensión-1)

[Unidad de Ensamblaje	8](#unidad-de-ensamblaje)

[Entradas — Resultados de Medición de Tensión	8](#entradas-—-resultados-de-medición-de-tensión-2)

[Unidad de Selección	9](#unidad-de-selección)

[Entradas — Resultados de Medición de Tensión	9](#entradas-—-resultados-de-medición-de-tensión-3)

[Unidad de Transporte	10](#unidad-de-transporte)

[Entradas — Resultados de Medición de Tensión	10](#entradas-—-resultados-de-medición-de-tensión-4)

[**Conclusiones y Recomendaciones	11**](#conclusiones-y-recomendaciones)

# Resumen {#resumen}

Este laboratorio se centra en la identificación y caracterización técnica de los elementos que integran el sistema de control de la Planta de Manufactura y sus cinco estaciones funcionales. El estudio detalla la arquitectura de hardware, analizando la naturaleza eléctrica de las señales y los dispositivos intermediarios necesarios para el cierre del lazo de control. Se identificaron las etapas de acondicionamiento de potencia, destacando el uso del driver de servomotor **Panasonic MADDT1207** y el variador de frecuencia **Powtran PI9100A** para el manejo de la cinta transportadora y el desplazamiento del brazo.

Asimismo, se verificó que la interacción entre el controlador y los dispositivos de campo, como las electroválvulas **AirTac** y los sensores magnéticos, se rige por eventos discretos. Finalmente, se validó el estándar de comunicación industrial **Modbus RTU** sobre la interfaz física **RS485**, operando bajo un esquema maestro-esclavo donde la Unidad de Transporte actúa como nodo central para la sincronización de datos y la supervisión mediante una interfaz HMI.

# Objetivos {#objetivos}

## Objetivo General {#objetivo-general}

Reconocer y analizar los elementos integrantes de los sistemas de control, tales como adaptadores de señal, sensores, actuadores, elementos de procesamiento, interfaces HMI y protocolos de comunicación industrial dentro de un proceso controlado.

## Objetivos Específicos {#objetivos-específicos}

* Identificar y caracterizar las etapas de acondicionamiento de señal, incluyendo procesos de amplificación, filtrado y conversión A/D y D/A, presentes en los componentes de potencia y control de la planta.  
* Analizar la interacción técnica entre el elemento de procesamiento (PLC Siemens S7-200) y los dispositivos de campo, comprendiendo el comportamiento de los sensores y actuadores ante eventos discretos.  
* Comprender el funcionamiento operativo de las interfaces HMI (Human-Machine Interface) y evaluar su rol crítico en la supervisión, monitoreo de variables y ejecución de comandos en el proceso.  
* Verificar los estándares de comunicación física y los protocolos industriales (Modbus RTU sobre RS485) utilizados para la transmisión de datos en un entorno de control distribuido.

# Fundamento Teórico {#fundamento-teórico}

## Acondicionamiento de Señales Industriales {#acondicionamiento-de-señales-industriales}

El acondicionamiento de señal es el proceso de manipular una señal analógica de tal manera que cumpla con los requisitos de la siguiente etapa de procesamiento (generalmente un PLC o tarjeta DAQ). En entornos industriales, esto es vital para eliminar el ruido electromagnético y asegurar que los niveles de tensión sean compatibles.

* Amplificación y Conversión: Se utiliza para aumentar la resolución de señales débiles o transformar magnitudes de potencia. Un ejemplo claro en el laboratorio es el Driver Panasonic MADDT1207, que actúa como una etapa de acondicionamiento de potencia al convertir entradas de 220-400 VAC en una salida controlada de 90.3 VDC para el servomotor.  
* Filtrado: Proceso encargado de eliminar frecuencias no deseadas (ruido) que podrían falsear las lecturas de los sensores fotoeléctricos o inductivos.  
* Conversión A/D (Analógica a Digital): Permite que el PLC procese señales variables, como la velocidad regulada por el potenciómetro en el variador Powtran PI9100A, transformándolas en valores binarios legibles por el algoritmo de control.

  ## Comunicaciones Industriales: Modbus RTU y RS485 {#comunicaciones-industriales:-modbus-rtu-y-rs485}

Para que un sistema de control distribuido funcione, los elementos deben "hablar" el mismo idioma bajo un estándar físico robusto.

* Protocolo Modbus RTU: Es un protocolo basado en una arquitectura Maestro-Esclavo. En este esquema, el Maestro inicia las consultas y los Esclavos (como los PLCs de las estaciones de alimentación o ensamblaje) responden con los datos solicitados o ejecutan acciones.  
* Interfaz Física RS485: Es el estándar de transmisión que soporta a Modbus en la planta. Utiliza señales diferenciales, lo que le otorga una alta inmunidad al ruido eléctrico generado por los motores trifásicos y actuadores neumáticos de la planta.  
* Topología Daisy Chain: El cableado se realiza "en cadena" de un dispositivo a otro, simplificando la infraestructura de red en el laboratorio.

  ## Sistemas de Control Distribuido (DCS) {#sistemas-de-control-distribuido-(dcs)}

A diferencia de un control centralizado, un sistema distribuido reparte la inteligencia entre varios controladores autónomos, pero coordinados.

* Jerarquía Maestro-Esclavo: En el proceso de manufactura, el núcleo del sistema es la Unidad de Transporte. El PLC de esta unidad asume el rol de Maestro, ya que coordina la logística y el movimiento de piezas entre las demás estaciones, que actúan como Esclavos.  
* Interacción de Eventos Discretos: La mayoría de las interacciones en la planta no son continuas, sino basadas en estados (pieza detectada/no detectada). El DCS procesa estas señales digitales provenientes de finales de carrera y sensores magnéticos para activar las electroválvulas AirTac en el momento preciso de la secuencia de producción.

# Características de Hardware y Componentes (Tabla de Dispositivos) {#características-de-hardware-y-componentes-(tabla-de-dispositivos)}

En esta etapa del laboratorio se procedió a la identificación física y técnica de los componentes críticos que integran las cinco unidades de la planta. A continuación, se presenta el cuadro resumen con las especificaciones de los dispositivos de potencia y control seleccionados:

| Tipo de Dispositivo | Marca | Modelo | Descripción Funcional | Detalles Técnicos / Eléctricos |
| :---- | :---- | :---- | :---- | :---- |
| **Variador de Frecuencia** | POWTRAN | PI9100A | Control de la cinta transportadora en la unidad de selección. | Entrada monofásica, salida trifásica; velocidad regulable mediante potenciómetro. |
| **Driver Servomotor** | PANASONIC | MADDT1207 | Encargado del desplazamiento de precisión en la unidad de transporte. | Entrada: 220-400 VAC; Salida: 90.3 VDC. |
| **Electroválvulas** | AirTac | 4v1100-06 | Accionamiento neumático presente en múltiples instancias en todas las unidades. | Presión: 0.15-0.8 MPa; Tensión de solenoide: 21.6-26.4 V. |

## Clasificación de Dispositivos de Campo {#clasificación-de-dispositivos-de-campo}

De acuerdo con la inspección realizada, el sistema opera predominantemente bajo una interacción de eventos discretos. Los elementos se clasifican de la siguiente manera:

* **Actuadores:** El sistema utiliza mayoritariamente electroválvulas para el control neumático, además del driver de servomotor y variadores de frecuencia configurados estáticamente para los movimientos rotativos y de traslación.  
* **Sensores:** La adquisición de datos se realiza a través de sensores magnéticos de posición para los cilindros neumáticos, sensores de presencia fotoeléctricos, sensores inductivos para detección de material, finales de carrera y encoders integrados en los motores para la retroalimentación de posición.  
* **Interfaz de Supervisión:** Se identificó una unidad HMI conectada a la red industrial como un nodo esclavo bajo el protocolo Modbus.

# Arquitectura del Sistema y Adaptación de Señales {#arquitectura-del-sistema-y-adaptación-de-señales}

## Etapas de Potencia y Acondicionamiento {#etapas-de-potencia-y-acondicionamiento}

En la planta, la lógica de control del PLC (baja potencia) se desacopla del movimiento mecánico (alta potencia) mediante interfaces especializadas que actúan como acondicionadores de señal y potencia:

* **Driver Panasonic MADDT1207:** Actúa como el nexo para la **Unidad de Transporte**, transformando la alimentación de red (220-400 VAC) en una salida de 90.3 VDC controlada para el servomotor, permitiendo movimientos de precisión imposibles de lograr con una salida directa del PLC.  
* **Variador Powtran PI9100A:** En la **Unidad de Selección**, este dispositivo recibe órdenes lógicas y gestiona una salida trifásica para la cinta transportadora, permitiendo además la regulación analógica de la velocidad mediante un potenciómetro.

*![][image2]*

## Interacción Digital y Discreta {#interacción-digital-y-discreta}

El sistema de manufactura se caracteriza por ser predominantemente de eventos discretos. Esto significa que la interacción entre el controlador y el campo se basa en estados binarios (ON/OFF) para la toma de decisiones:

* **Sensores Fotoeléctricos, Inductivos y Magnéticos:** Se utilizan para detectar la presencia de piezas, el tipo de material o la posición de los vástagos de los cilindros, enviando señales digitales unívocas al controlador.  
* **Finales de Carrera:** Determinan los límites físicos de movimiento del brazo, asegurando que la lógica secuencial solo avance cuando se verifique físicamente el estado anterior.

# Protocolos y Estándares de Comunicación {#protocolos-y-estándares-de-comunicación}

## Configuración Maestro-Esclavo {#configuración-maestro-esclavo}

La planta opera bajo una red Modbus RTU donde la Unidad de Transporte ejerce como nodo Maestro. Este controlador es el encargado de interaccionar y sincronizar a las otras 4 unidades, las cuales operan como Esclavos, reportando su estado y esperando la señal de habilitación para ejecutar sus tareas locales.

## Interfaz Física RS485 {#interfaz-física-rs485}

Para la transmisión de datos se utiliza el estándar **RS485**, ![][image3]aprovechando su alta inmunidad al ruido industrial. La conexión física se observa mediante una topología **Daisy Chain** (guirnalda), conectando todos los PLCs en el mismo bus de datos, lo que simplifica el cableado y facilita la expansión de la red industrial.

# Interfaz Hombre-Máquina (HMI) y Supervisión {#interfaz-hombre-máquina-(hmi)-y-supervisión}

La planta de manufactura incorpora una Interfaz Hombre-Máquina (HMI) como elemento para la supervisión, control y monitoreo del proceso. Esta interfaz permite al operador interactuar con el sistema de forma visual e intuitiva, facilitando la ejecución de comandos y la observación del estado de las distintas estaciones.

La HMI se encuentra integrada dentro de la red de comunicación industrial bajo el protocolo Modbus RTU. A través de esta conexión, el sistema permite la visualización en tiempo real de variables de proceso, estados de sensores y actuadores, así como la ejecución de órdenes hacia el sistema controlado por el PLC.

![][image4]![][image5]

Vista anterior y posterior del HMI modelo TPC7062KX

![][image6]  
Pantalla principal del programa actualmente cargado en el HMI

## Funciones principales de la HMI {#funciones-principales-de-la-hmi}

* **Supervisión del proceso:** Permite visualizar el estado de cada estación de la planta (alimentación, transporte, selección, ensamblaje y almacenamiento), mostrando información relevante como presencia de piezas, estado de cilindros neumáticos y funcionamiento de motores.  
* **Interacción con el usuario:** El operador puede enviar comandos directamente al sistema, tales como inicio/parada del proceso, selección de modos de operación y control manual de ciertos actuadores para pruebas o mantenimiento.  
* **Monitoreo de variables:** Se visualizan variables del sistema, como posiciones y estados lógicos, lo que permite un seguimiento continuo del comportamiento del proceso.  
* **Diagnóstico y detección de fallas:** La interfaz permite identificar condiciones anómalas como errores de comunicación, fallos en sensores o actuadores.

# Verificación y Mediciones (Resultados Esperados) {#verificación-y-mediciones-(resultados-esperados)}

## Unidad de Alimentación  {#unidad-de-alimentación}

### Entradas — Resultados de Medición de Tensión {#entradas-—-resultados-de-medición-de-tensión}

| N° | Descripción | Dir. PLC | Acondicionamiento de señal | Valor Esperado | Valor Medido |
| :---: | ----- | :---: | :---: | :---: | :---: |
| 1 | Sensor indicador de cilindro pequeño extendido | I0.0 | Filtrado | 22–24 V DC | 22.2 V |
| 2 | Sensor indicador de cilindro pequeño retraído | I0.1 | Filtrado | 22–24 V DC | 22.15 V |
| 3 | Sensor indicador de cilindro largo extendido | I0.2 | Filtrado | 22–24 V DC | 22.18 V |
| 4 | Sensor indicador de cilindro largo retraído | I0.3 | Filtrado | 22–24 V DC | 22.15 V |
| 5 | Sensor fotoeléctrico (posición de la pieza) | I0.4 | Filtrado | 22–24 V DC | 23.17 V |
| 6 | Sensor de presencia superior | I0.5 | Filtrado | 22–24 V DC | 24.00 V |
| 7 | Sensor de presencia inferior | I0.6 | Filtrado | 22–24 V DC | 24.00 V |
| 8 | Sensor inductivo | I0.7 | Filtrado | 22–24 V DC | 24.02 V |
| 9 | Desconectado | I1.0 | — | — | — |
| 10 | Desconectado | I1.1 | — | — | — |
| 11 | Pulsador de marcha (verde) | I1.2 | Filtrado | 22–24 V DC | 24.04 V |
| 12 | Pulsador de paro (rojo) | I1.3 | Filtrado | 22–24 V DC | 23.97 V |
| 13 | Zeta de emergencia NC | I1.4 | Filtrado | 22–24 V DC | 24.04 V |
| 14 | Selector rotatorio | I1.5 | Filtrado | 22–24 V DC | 24.03 V |
| 15 | Desconectado | I1.6 | — | — | — |
| 16 | Desconectado | I1.7 | — | — | — |

## Unidad de Procesamiento  {#unidad-de-procesamiento}

### Entradas — Resultados de Medición de Tensión {#entradas-—-resultados-de-medición-de-tensión-1}

| N° | Descripción | Dir. PLC | Acondicionamiento de señal | Valor Esperado | Valor Medido |
| :---: | ----- | :---: | :---: | :---: | :---: |
| 1 | Sensor fotoeléctrico (presencia de pieza) | I0.0 | Filtrado | 22–24 V DC | 23.99 V |
| 2 | Sensor inductivo de la pinza | I0.1 | Filtrado | 22–24 V DC | 22.08 V |
| 3 | Sensor indicador de cilindro largo extendido | I0.2 | Filtrado | 22–24 V DC | 22.16 V |
| 4 | Sensor indicador de cilindro largo retraído | I0.3 | Filtrado | 22–24 V DC | 22.17 V |
| 5 | Cilindro delgado retraído (hacia arriba) | I0.4 | Filtrado | 22–24 V DC | 21.98 V |
| 6 | Cilindro delgado extendido (hacia abajo) | I0.5 | Filtrado | 22–24 V DC | 21.98 V |
| 7 | Desconectado | I0.6 | — | — | — |
| 8 | Desconectado | I0.7 | — | — | — |
| 9 | Desconectado | I1.0 | — | — | — |
| 10 | Desconectado | I1.1 | — | — | — |
| 11 | Pulsador de paro (rojo) | I1.2 | Filtrado | 22–24 V DC | 23.99 V |
| 12 | Pulsador de marcha (verde) | I1.3 | Filtrado | 22–24 V DC | 24.02 V |
| 13 | Zeta de emergencia | I1.4 | Filtrado | 22–24 V DC | 23.94 V |
| 14 | Selector rotatorio | I1.5 | Filtrado | 22–24 V DC | 24.02 V |
| 15 | Desconectado | I1.6 | — | — | — |
| 16 | Desconectado | I1.7 | — | — | — |

## Unidad de Ensamblaje  {#unidad-de-ensamblaje}

### Entradas — Resultados de Medición de Tensión {#entradas-—-resultados-de-medición-de-tensión-2}

| N° | Descripción | Dir. PLC | Acondicionamiento de señal | Valor Esperado | Valor Medido |
| :---: | ----- | :---: | :---: | :---: | :---: |
| 1 | Sensor fotoeléctrico del tubo inferior | I0.0 | Filtrado | 22–24 V DC | 24.09 V |
| 2 | Sensor fotoeléctrico del tubo superior | I0.1 | Filtrado | 22–24 V DC | 24.09 V |
| 3 | Sensor fotoeléctrico de presencia a la salida del tubo | I0.2 | Filtrado | 22–24 V DC | 24.10 V |
| 4 | Sensor fotoeléctrico de presencia para recoger la pieza | I0.3 | Filtrado | 22–24 V DC | 24.09 V |
| 5 | Sensor de fibra Omron | I0.4 | Filtrado | 22–24 V DC | 24.09 V |
| 6 | Sensor magnético del cilindro superior extendido | I0.5 | Filtrado | 22–24 V DC | 22.27 V |
| 7 | Sensor magnético del cilindro superior retraído | I0.6 | Filtrado | 22–24 V DC | 22.28 V |
| 8 | Sensor magnético del cilindro inferior extendido | I0.7 | Filtrado | 22–24 V DC | 22.21 V |
| 9 | Sensor magnético del cilindro inferior retraído | I1.0 | Filtrado | 22–24 V DC | 22.29 V |
| 10 | Sensor de giro anti-horario | I1.1 | Filtrado | 22–24 V DC | 22.30 V |
| 11 | Sensor de giro horario | I1.2 | Filtrado | 22–24 V DC | 22.31 V |
| 12 | Sensor de cierre de la pinza de agarre | I1.3 | Filtrado | 22–24 V DC | 22.45 V |
| 13 | Sensor magnético del cilindro vertical hacia abajo | I1.4 | Filtrado | 22–24 V DC | 22.22 V |
| 14 | Sensor magnético del cilindro vertical hacia arriba | I1.5 | Filtrado | 22–24 V DC | 22.46 V |
| 15 | Sensor magnético del cilindro horizontal hacia atrás | I1.6 | Filtrado | 22–24 V DC | 22.15 V |
| 16 | Sensor magnético del cilindro horizontal hacia adelante | I1.7 | Filtrado | 22–24 V DC | 22.23 V |
| 17 | Desconectado | I2.0 | — | — | — |
| 18 | Desconectado | I2.1 | — | — | — |
| 19 | Desconectado | I2.2 | — | — | — |
| 20 | Desconectado | I2.3 | — | — | — |
| 21 | Botón Rojo | I2.4 | Filtrado | 22–24 V DC | 24.14 V |
| 22 | Botón Verde | I2.5 | Filtrado | 22–24 V DC | 24.14 V |
| 23 | Botón seta de emergencia | I2.6 | Filtrado | 22–24 V DC | 24.19 V |
| 24 | Selector | I2.7 | Filtrado | 22–24 V DC | 24.18 V |

## Unidad de Selección  {#unidad-de-selección}

### Entradas — Resultados de Medición de Tensión {#entradas-—-resultados-de-medición-de-tensión-3}

| N° | Descripción | Dir. PLC | Acondicionamiento de señal | Valor Esperado | Valor Medido |
| :---: | ----- | :---: | :---: | :---: | :---: |
| 1 | Encoder A | I0.0 | Conversión A/D (pulsos alta frecuencia) | — | — |
| 2 | Encoder B | I0.1 | Conversión A/D (pulsos alta frecuencia) | — | — |
| 3 | Encoder C | I0.2 | Conversión A/D (pulsos alta frecuencia) | — | — |
| 4 | Sensor de objetos (detecta la pieza para empezar la selección) | I0.3 | Filtrado | 22–24 V DC | 23.16 V |
| 5 | Sensor de fibra Omron (clasificación de materiales) | I0.4 | Filtrado | 22–24 V DC | 24.04 V |
| 6 | Sensor magnético (clasificación de materiales) | I0.5 | Filtrado | 22–24 V DC | 23.33 V |
| 7 | Desconectado | I0.6 | — | — | — |
| 8 | Sensor de retorno cilindro 1 | I0.7 | Filtrado | 22–24 V DC | 22.37 V |
| 9 | Sensor de retorno cilindro 2 | I1.0 | Filtrado | 22–24 V DC | 22.29 V |
| 10 | Sensor de retorno cilindro 3 | I1.1 | Filtrado | 22–24 V DC | 22.42 V |
| 11 | Pulsador de paro (rojo) | I1.2 | Filtrado | 22–24 V DC | 24.77 V |
| 12 | Pulsador de marcha (verde) | I1.3 | Filtrado | 22–24 V DC | 24.66 V |
| 13 | Zeta de emergencia | I1.4 | Filtrado | 22–24 V DC | 24.77 V |
| 14 | Selector rotatorio | I1.5 | Filtrado | 22–24 V DC | 24.77 V |

## Unidad de Transporte  {#unidad-de-transporte}

### Entradas — Resultados de Medición de Tensión {#entradas-—-resultados-de-medición-de-tensión-4}

| N° | Descripción | Dir. PLC | Acondicionamiento de señal | Valor Esperado | Valor Medido |
| :---: | ----- | :---: | :---: | :---: | :---: |
| 1 | Sensor inductivo (detecta llegada del brazo neumático) | I0.0 | Filtrado | 22–24 V DC | 23.70 V |
| 2 | Final de carrera derecha | I0.1 | Filtrado | 22–24 V DC | 24.47 V |
| 3 | Final de carrera izquierda | I0.2 | Filtrado | 22–24 V DC | 24.48 V |
| 4 | Sensor magnético indicador de brazo retraído (abajo) | I0.3 | Filtrado | 22–24 V DC | 22.49 V |
| 5 | Sensor magnético indicador de brazo extendido (arriba) | I0.4 | Filtrado | 22–24 V DC | — |
| 6 | Sensor magnético indicador de cilindro rotatorio hacia la izquierda | I0.5 | Filtrado | 22–24 V DC | 22.66 V |
| 7 | Sensor magnético indicador de cilindro rotatorio hacia la derecha | I0.6 | Filtrado | 22–24 V DC | 22.67 V |
| 8 | Sensor magnético indicador de cilindro de doble vástago extendido | I0.7 | Filtrado | 22–24 V DC | 22.62 V |
| 9 | Sensor magnético indicador de cilindro de doble vástago retraído | I1.0 | Filtrado | 22–24 V DC | 22.59 V |
| 10 | Sensor magnético indicador de pinza cerrada | I1.1 | Filtrado | 22–24 V DC | 22.69 V |
| 11 | Estado del servo (DRIVER) | I1.2 | — | — | — |
| 12 | Desconectado | I1.3 | — | — | — |
| 13 | Desconectado | I1.4 | — | — | — |
| 14 | Desconectado | I1.5 | — | — | — |
| 15 | Desconectado | I1.6 | — | — | — |
| 16 | Desconectado | I1.7 | — | — | — |
| 17 | Desconectado | I2.0 | — | — | — |
| 18 | Desconectado | I2.1 | — | — | — |
| 19 | Desconectado | I2.2 | — | — | — |
| 20 | Desconectado | I2.3 | — | — | — |
| 21 | Pulsador de paro (rojo) | I2.4 | Filtrado | 22–24 V DC | 24.66 V |
| 22 | Pulsador de marcha (amarillo) | I2.5 | Filtrado | 22–24 V DC | 24.70 V |
| 23 | Zeta de emergencia | I2.6 | Filtrado | 22–24 V DC | 24.65 V |
| 24 | Selector rotatorio | I2.7 | Filtrado | 22–24 V DC | 24.70 V |

# Conclusiones y Recomendaciones {#conclusiones-y-recomendaciones}

* Se logró reconocer conceptualmente los diferentes elementos que componen la planta de manufactura con sus diferentes secciones, evidenciando la importancia de la correcta interacción entre sensores, actuadores, la interfaz HMI y protocolos de comunicación para el funcionamiento adecuado del proceso de manufactura.  
* Se identificaron y analizaron las etapas de acondicionamiento de señal, conversión A/D y D/A permiten adaptar las señales con magnitudes físicas para su procesamiento digital, garantizando precisión y confiabilidad en el sistema.  
* Se verificó la interacción entre el PLC Siemens S7-200 y los dispositivos de campo,tanto sensores como actuadores y demás PLCs los cuales se comunican entre sí, observando el comportamiento de sensores y actuadores, lo que permitió entender la lógica de control y la respuesta del sistema en tiempo real.  
* Se comprendió el rol fundamental de las interfaces HMI en la supervisión y control del proceso, destacando su importancia para la visualización de variables, la toma de decisiones y la intervención del operador en el sistema.  
* Se validó el uso de estándares de comunicación industrial, específicamente mediante el protocolo **Modbus RTU**, empleado por el PLC Siemens S7-200, comprobando su eficiencia en la transmisión de datos entre dispositivos PLCs dentro de la planta de manufactura . 

[image1]: imagenes/image1.png
[image2]: imagenes/image2.png
[image3]: imagenes/image3.png
[image4]: imagenes/image4.png
[image5]: imagenes/image5.png
[image6]: imagenes/image6.png