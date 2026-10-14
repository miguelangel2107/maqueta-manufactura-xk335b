**Universidad Mayor de San Andrés**  
**Facultad de Ingeniería**  
**Ingeniería Electrónica**  
![NO\_CAPTION null][image1]  
**Informe de laboratorio N°1**  
**“Identificación de variables y sistemas en**  
**procesos”**

**Asignatura:** 		  
Sistemas de Control II \- ETN 902  
Aplicación de Técnicas de Control \- ETN 1034  
**Docente:**				  
Ing. Jorge Antonio Nava Amador  
**Auxiliares:**

- Aux. Limber Ajnota Cahuaya (ETN1034)  
- Aux. Fabian Plata Vargas (ETN902)			

**Integrantes Grupo Planta de manufactura:**	

- Univ. Herrera Tola Gabriel Sebastian  
- Univ. Huanca Mamani Alan Nestor  
- Univ. Mamani Tola José Aldin  
- Univ. Quispe Mamani Leonardo Darwin  
- Univ. Monzon Hidalgo Josue 


**Fecha de presentación:**	25/02/2026  
La Paz \- Bolivia

[**Introducción	3**](#introducción)

[Resumen de la planta de manufactura	3](#resumen-de-la-planta-de-manufactura)

[**Objetivos	3**](#objetivos)

[Objetivos Específicos	3](#objetivos-específicos)

[**Descripción General	4**](#descripción-general)

[Funcionamiento General	4](#funcionamiento-general)

[Elementos o Subsistemas que lo componen	4](#elementos-o-subsistemas-que-lo-componen)

[1\. Unidad de Alimentación (Feeding Unit)	4](#1.-unidad-de-alimentación-\(feeding-unit\))

[2\. Unidad de Procesamiento (Processing Unit)	5](#2.-unidad-de-procesamiento-\(processing-unit\))

[3\. Unidad de Ensamblaje (Assembly Unit)	5](#3.-unidad-de-ensamblaje-\(assembly-unit\))

[4\. Unidad de Transmisión (Transmission Unit)	6](#4.-unidad-de-transmisión-\(transmission-unit\))

[5\. Unidad de Clasificación (Sorting Unit)	6](#5.-unidad-de-clasificación-\(sorting-unit\))

[**Descripción de los instrumentos	7**](#descripción-de-los-instrumentos)

[Sensores	7](#sensores)

[Actuadores	9](#actuadores)

[**Diagrama de bloques	14**](#diagrama-de-bloques)

[Diagrama de bloques general	14](#diagrama-de-bloques-general)

[Unidad de alimentación	15](#unidad-de-alimentación)

[Sensores	15](#sensores-1)

[Accionadores y Actuadores	15](#accionadores-y-actuadores)

[Unidad de Transporte	16](#unidad-de-transporte)

[Sensores	16](#sensores-2)

[Accionadores y Actuadores	17](#accionadores-y-actuadores-1)

[Unidad de procesamiento	18](#unidad-de-procesamiento)

[Sensores	18](#sensores-3)

[Accionadores y Actuadores	19](#accionadores-y-actuadores-2)

[Unidad de ensamblaje	21](#unidad-de-ensamblaje)

[Sensores	21](#sensores-4)

[Actuadores	22](#actuadores-1)

[Unidad de selección	26](#unidad-de-selección)

[Los componentes de la unidad de selección son:	26](#los-componentes-de-la-unidad-de-selección-son:)

[Sensores	26](#sensores-5)

[Accionadores y Actuadores	26](#accionadores-y-actuadores-3)

[Conclusiones y recomendaciones	28](#conclusiones-y-recomendaciones)

# Introducción {#introducción}

## Resumen de la planta de manufactura {#resumen-de-la-planta-de-manufactura}

La Maqueta de Proceso de Manufactura es un sistema de control distribuido diseñado para emular un entorno de una línea de producción industrial moderna sobre una plataforma de rieles de aluminio. El sistema opera mediante la integración orgánica de tecnologías neumáticas, mecánicas y eléctricas, coordinadas por una red de comunicación RS485 que interconecta cinco PLCs independientes.

El flujo del proceso sigue una secuencia lógica de producción dividida en cinco estaciones funcionales:

* **Unidad de Alimentación (Estación 1):** Inicia el proceso suministrando los materiales base para el ensamblaje.  
* **Unidad de Ensamblaje (Estación 2):** Ejecuta la unión física de las piezas procesadas.  
* **Unidad de Procesamiento (Estación 3):** Realiza operaciones mecánicas específicas sobre los componentes recibidos.  
* **Unidad de Transporte (Estación 4):** Actúa como el nexo logístico, moviendo las piezas de trabajo entre las diversas etapas del proceso.  
* **Unidad de Selección (Estación 5):** Finaliza el ciclo clasificando y seleccionando las piezas terminadas según criterios preestablecidos.

Desde la perspectiva de sistemas, cada unidad utiliza sensores para la adquisición de datos (presencia, posición) y actuadores (motores paso a paso, cilindros neumáticos, conversores de frecuencia) para ejecutar las tareas, permitiendo el análisis de variables manipuladas y controladas en cada lazo local.

# Objetivos {#objetivos}

Desarrollar la capacidad de identificar, clasificar y analizar las variables fundamentales en sistemas de  
control, reconociendo los subsistemas que los componen.

## Objetivos Específicos {#objetivos-específicos}

* Reconocer físicamente los elementos que constituyen un lazo de control: sensores, actuadores y controladores en las plantas de laboratorio disponibles (Manufactura, Nivel de Agua, Brazos Articulados).  
* Identificar y diferenciar las variables del sistema: Variable Manipulada (M V ), Variable Controlada (P V ) y Variables de Perturbación (DV ).  
* Diagramar el proceso mediante bloques funcionales, estableciendo la relación de causalidad entre las entradas y salidas.  
* Determinar si los sistemas operan en lazo abierto o lazo cerrado y justificar su configuración.

# Descripción General {#descripción-general}

El equipo de entrenamiento de línea de producción automática es un sistema electromecánico montado sobre un riel de aleación de aluminio que simula un entorno industrial moderno.

## Funcionamiento General {#funcionamiento-general}

 El equipo funciona integrando múltiples tecnologías de la automatización industrial: actuación neumática, control de posición mediante motores servo, accionamiento por inversores (variadores de frecuencia) y tecnología de sensores para la detección de posiciones, colores y materiales.

Cada una de las unidades que lo componen puede funcionar como un sistema independiente o integrarse en una red de control distribuido. Para el funcionamiento conjunto, emplea una red de PLCs de la serie S7-200 de Siemens comunicados mediante puertos serie RS485. Además, toda la línea de producción se monitorea y controla a través de una Interfaz Hombre-Máquina (HMI) mediante una pantalla táctil, la cual permite al operador dar instrucciones (como inicio, parada o reinicio) y visualizar el estado en tiempo real del equipo.

## Elementos o Subsistemas que lo componen {#elementos-o-subsistemas-que-lo-componen}

 El entrenador está dividido en cinco unidades principales, cada una con una tarea específica dentro de la línea de producción:

### 1\. Unidad de Alimentación (Feeding Unit) {#1.-unidad-de-alimentación-(feeding-unit)}

* **Función:** Es la unidad inicial del sistema. Su tarea es almacenar las piezas de trabajo y, según los requerimientos, empujarlas hacia una plataforma de descarga para que el brazo mecánico de la unidad de transmisión las recoja.  
* **Componentes principales:** Tubo de almacenamiento (silo) para apilar las piezas, cilindro de empuje, cilindro superior e inferior (para separar y retener la pieza superior mientras se expulsa la inferior), bloque de válvulas, interruptores de proximidad magnéticos y sensores fotoeléctricos para detectar la falta o presencia de material.  
  ![][image2]

*Figure 1\. Vista frontal y lateral: Unidad de Alimentacion.*

### 2\. Unidad de Procesamiento (Processing Unit) {#2.-unidad-de-procesamiento-(processing-unit)}

* **Función:** Se encarga de simular el maquinado o estampado de la pieza. Mueve la pieza bajo un cilindro de perforación, realiza el proceso y la devuelve a la posición inicial a la espera de ser recogida.  
* **Componentes principales:** Plataforma móvil deslizante montada sobre guías lineales, dedos neumáticos (pinzas) para sujetar la pieza, cilindro telescópico, cilindro de estampado (prensa) y sensores fotoeléctricos para detectar la llegada del material.

![][image3]

*Figure 2\. Vista frontal y lateral: Unidad de Procesamiento.*

### 3\. Unidad de Ensamblaje (Assembly Unit) {#3.-unidad-de-ensamblaje-(assembly-unit)}

* **Función:** Realiza el proceso de montaje incrustando pequeñas piezas cilíndricas (blancas o negras) dentro de las piezas que provienen de la unidad de procesamiento.  
* **Componentes principales:** Tolva tubular para almacenar los cilindros pequeños, mecanismo de alimentación inferior, plataforma giratoria de transferencia (para mover la pieza pequeña), brazo mecánico de ensamblaje (con cilindros verticales y horizontales para recoger e incrustar la pieza), y sensores de fibra óptica.

![][image4]

*Figure 3\. Vista frontal y lateral: Unidad de Ensamblaje.*

### 4\. Unidad de Transmisión (Transmission Unit) {#4.-unidad-de-transmisión-(transmission-unit)}

* **Función:** Es responsable de transferir las piezas de trabajo de una estación a otra (desde la alimentación, pasando por el procesamiento y ensamblaje, hasta la clasificación). En la configuración de red, **suele actuar como la estación principal (maestra)** que coordina al resto del sistema.  
* **Componentes principales:** Un **brazo robótico de agarre con tres grados de libertad** (capaz de elevarse, extenderse, rotar y pinzar) y un ensamble de transmisión de movimiento lineal impulsado por un **motor servo** (o paso a paso) acoplado a una correa síncrona y un riel de guía lineal.

![][image5]

*Figure 4\. Vista Diagonal Superior: Unidad de Transporte.*

### 5\. Unidad de Clasificación (Sorting Unit) {#5.-unidad-de-clasificación-(sorting-unit)}

* **Función:** Es la etapa final de la línea. Transporta las piezas ya procesadas y ensambladas, identifica su material (metal o plástico) y su color, y las empuja hacia diferentes ranuras o toboganes de clasificación según sus propiedades.  
* **Componentes principales:** Cinta transportadora impulsada por un motor de reducción trifásico controlado por un **inversor (variador de frecuencia)**, un **codificador rotativo (encoder)** acoplado al eje para calcular la posición de la pieza en movimiento, cilindros neumáticos de empuje para expulsar las piezas a sus respectivos toboganes, y una serie de sensores inductivos y ópticos.

![][image6]

*Figure 5\. Vista Diagonal Superior: Unidad de Clasificación o Selección.*

# Descripción de los instrumentos {#descripción-de-los-instrumentos}

La unidad de entrenamiento dispone de diversos instrumentos y modelos de medición distribuidos en sus instalaciones. A continuación, se describen el principio de funcionamiento y los modelos específicos de estos instrumentos presentes en dicha unidad.

## Sensores {#sensores}

* **Interruptores de límite / Finales de carrera (Limit switches):**  
  * **Principio de funcionamiento:** Son interruptores de proximidad por contacto físico. Actúan como dispositivos mecánicos de seguridad o posicionamiento; cuando una pieza móvil entra en contacto físico con ellos, cierran o abren un circuito, enviando una señal de protección por sobrepaso de recorrido o indicando el punto de origen.  
  * **Modelo:**   
  * **Ubicación:** Se encuentran en la **Unidad de Transmisión**, instalados en los extremos del riel lineal como interruptores de límite izquierdo y derecho, y como interruptores de posición de origen.

![][image7]

*Figure 6\. Sensor fin de carrera.*

* **Interruptores magnéticos (Sensores de proximidad magnéticos):**  
  * **Principio de funcionamiento:** Emplean un interruptor de láminas (reed switch) interno. El pistón del cilindro contiene un anillo magnético permanente; al acercarse, el campo magnético magnetiza las láminas, atrayéndolas para cerrar el contacto y emitir una señal eléctrica.  
  * **Modelo:**  
  * **Ubicación:** Están en **todas las unidades** (Alimentación, Procesamiento, Ensamblaje, Transmisión y Clasificación), ya que se montan externamente sobre los distintos cilindros neumáticos para detectar la posición de los pistones.

![][image8]![][image9]

*Figure 8\. Sensor magnético y principio de funcionamiento.*

* **Sensores de proximidad inductivos:**  
  * **Principio de funcionamiento:** Utilizan el efecto de corrientes de Foucault. Una bobina genera un campo magnético alterno; cuando un objeto metálico se acerca, induce corrientes en el metal que alteran la amplitud de oscilación. El circuito convierte este cambio en una señal eléctrica para detectar metales.  
  * **Modelo:**  
  * **Ubicación:** **Unidad de Alimentación** (en la base del silo para identificar si la pieza almacenada es de metal) y en la **Unidad de Clasificación** (sobre la cinta transportadora).

![][image10]![][image11]

*Figure 10\. Sensor inductivo y circuito ejemplo.*

* **Sensores fotoeléctricos de proximidad (tipo difuso):**  
  * **Principio de funcionamiento:** Integran emisor y receptor óptico en el mismo lado. El emisor emite luz (visible o infrarroja) y, si hay un objeto enfrente, la luz se refleja de forma difusa hacia el receptor, cambiando el estado de salida.  
  * **Modelos:**   
  * **Ubicación:** **Unidad de Alimentación** (en el tubo de almacenamiento y la mesa de descarga),, **Unidad de Procesamiento** (en la plataforma móvil), **Unidad de Ensamblaje** (en las bandejas de transferencia) y **Unidad de Clasificación**.

![][image12]

*Figure 11\. Sensor fotoelectrico marca Omron.*

* **Sensores de fibra óptica:**  
  * **Principio de funcionamiento:** Conducen la señal óptica a través de cables de fibra hacia un amplificador. Son ideales para detectar objetos en entornos desfavorables o muy reducidos, contando con una perilla para ajustar alta sensibilidad lumínica,.  
  * **Modelo:** E3X-NA41  
  * **Ubicación:** **Unidad de Ensamblaje** (en la tolva de posicionamiento) y **Unidad de Clasificación** (junto al sensor inductivo para detectar propiedades no metálicas o colores).

![][image13]![][image14]

*Figure 13\. Sensor fotoeléctrico de fibra óptica marca Omron.*

* **Codificador rotativo (Encoder rotativo):**  
  * **Principio de funcionamiento:** Transforma el desplazamiento mecánico rotacional en una señal digital o tren de pulsos (Fases ortogonales A y B) que permite al PLC calcular distancias, posiciones o velocidades a través de contadores de alta velocidad.  
  * **Modelo:** Encoder incremental de 500 líneas de resolución, salida de colector abierto NPN y alimentación DC 12\~24V.  
  * **Ubicación:** **Unidad de Clasificación** (acoplado al eje de conducción de la cinta transportadora).

## Actuadores {#actuadores}

* **Cilindros lineales de doble efecto estándar:**  
  * **Principio de funcionamiento:** Usan aire comprimido que ingresa de forma alternada por dos puertos opuestos para empujar el pistón hacia adelante o retraerlo,. Se apoyan en válvulas estranguladoras para suavizar y controlar la velocidad.  
  * **Modelo:**   
  * **Ubicación:** **Unidad de Alimentación** (cilindros de empuje y retención superior), **Unidad de Ensamblaje** (cilindros de elevación y bloqueo) y **Unidad de Clasificación** (cilindros expulsores).

![][image15]

*Figure 14\. Cilindros lineales de doble efecto.*

* **Cilindros delgados:**  
  * **Principio de funcionamiento:** Actuadores con dimensiones axiales reducidas (compactos y cortos) diseñados para ahorrar espacio manteniendo fuerza para impactos o fijaciones en carreras cortas.  
  * **Ubicación:** **Unidad de Procesamiento** (como cilindro de prensa o estampado).

![][image16]

*Figure 15\. Cilindro delgado.* 

* **Cilindros de guía:**  
  * **Principio de funcionamiento:** Cilindros que incorporan barras paralelas de guía para proporcionar alta precisión de trayectoria, resistencia a la fuerza de torsión y estabilidad.  
  * **Ubicación:** **Unidad de Ensamblaje** (para el movimiento de traslación horizontal del brazo mecánico).

![][image17]

*Figure 16\. Cilindros guía de triple vástago.*

* **Pinzas neumáticas (Dedos neumáticos / Gripper):**  
  * **Principio de funcionamiento:** Utilizan aire para accionar un mecanismo (como un riel deslizante o pivote) que abre y cierra unas mordazas para agarrar y soltar piezas.  
  * **Ubicación:** **Unidad de Procesamiento** (en la plataforma móvil para retener la pieza a prensar), **Unidad de Ensamblaje** (actuador final del brazo) y **Unidad de Transmisión** (actuador final del robot de transporte).

![][image18]![Amazon.com: TBZFNZXF MHZ2 10D 16D 20D 25D 32D 40D MHZ2 10S MHZ2 10C Parallel  Air Gripper SMC Type Pneumatic Cylinder Double or Single Acting Gripper (Size:MHZ2-20D) : Industrial y Científico][image19]

*Figure 18\. Pinzas neumaticas: Tamaños y estados.*

 

* **Conjuntos de oscilación neumática (Cilindros rotativos):**  
  * **Principio de funcionamiento:** Transforman el movimiento lineal interno de un pistón acoplado a un mecanismo de piñón y cremallera en movimiento rotativo (pudiendo ajustarse a ángulos como 90° o 180°).  
  * **Ubicación:** **Unidad de Ensamblaje** (para rotar 180° las bandejas de transferencia), y **Unidad de Transmisión** (para girar el brazo recolector 90°).

![][image20]

*Figure 19\. Cilindros neumáticos rotativos grande y pequeño.*

* **Válvulas electromagnéticas (Electroválvulas):**  
  * **Principio de funcionamiento:** Controlan la dirección del flujo de aire usando una señal eléctrica en una bobina electroimán para empujar el carrete interno. Las hay de control eléctrico simple (retorno por resorte) y doble (con memoria de estado).  
  * **Modelo:** Válvulas direccionales de dos posiciones y cinco vías.  
  * **Ubicación:** Presentes en **todas las unidades**, normalmente montadas en bloques (manifolds) de terminales neumáticos.

![][image21]

*Figure 20\. Electroválvulas neumaticas.*

* **Motor asíncrono trifásico (Motor de reducción):**  
  * **Principio de funcionamiento:** Motor de corriente alterna impulsado por un inversor de frecuencia (VFD) que permite variar su velocidad ajustando la frecuencia de salida del voltaje,.  
  * **Modelo:** Controlado por Inversor MODELO (Capacidad  VALOR KW, Trifásico VOLTAJE V).  
  * **Ubicación:** **Unidad de Clasificación** (impulsa la cinta transportadora).

![][image22]

*Figure 21\. Motor asíncrono trifásico.*

* **Servomotor y Servoamplificador (Servosistema de CA):**  
  * **Principio de funcionamiento:** Motor síncrono de imán permanente controlado por un procesador digital en lazo cerrado; recibe pulsos del PLC y retroalimentación de un encoder de alta resolución para realizar movimientos y posicionamientos lineales exactos.  
  * **Modelo:**   
  * **Ubicación:** **Unidad de Transporte** (desplaza el ensamble del brazo a través del riel lineal).

![][image23]

*Figure 22\. Servodriver y motor trifásico marca Panasonic.*

* **Motor paso a paso (Stepper motor) y controlador:** *(Alternativa de equipo en la Unidad de Transmisión)*  
  * **Principio de funcionamiento:** Transforma señales de pulso en movimiento de pasos discretos (ej. 1.8 grados por paso). El controlador subdivide la señal (microstepping, ej. hasta 10,000 pasos/vuelta) logrando un desplazamiento suave mediante modulación PWM.  
  * **Modelo:**   
  * **Ubicación:** **Unidad de Transmisión** (como alternativa de desplazamiento lineal en lugar del servomotor).

# 

# Diagrama de bloques {#diagrama-de-bloques}

## Diagrama de bloques general {#diagrama-de-bloques-general}

![][image24]  
*Figure 23\. Diagrama de bloques general de la planta de manufactura.*  
El diagrama tiene como protagonista a la Unidad de Transporte, mientras que el resto de las unidades opera de forma independiente, la unidad de transporte requiere de la coordinacion/comunicacion con las otras unidades siendo entonces transversal a las demás. El punto de consigna en este diagrama es la solicitud de manufacturación de una pieza, el bloque circular a la izquierda del diagrama representa la comparación de la salida (Pieza Manufacturada) con la entrada o punto de consigna. Este bloque circular no es una unidad independiente y se colocó fuera de alguna de las unidades para fines representativos. En realidad vive dentro del plc maestro del sistema, el cuál es presuntamente la unidad de transporte.

## Unidad de alimentación {#unidad-de-alimentación}

Los componentes de la unidad de alimentación son:

| Sensores |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **N** | **Tipo** | **Modelo** | **Variable medida** | **Descripción** |
| 1 | Optico (IR) | E3Z-LS61 | presencia | Detecta la presencia de una pieza en la zona de recolección de piezas. |
| 2 | Optico (IR) | E3Z-LS61 | presencia | Detecta la presencia de una pieza en la parte baja del tubo de alimentación |
| 3 | Optico (IR) | E3Z-LS61 | presencia | Detecta la presencia de la siguiente pieza en el tubo de alimentación |
| 4 | Inductivo | LM18-3008NA | material | Detecta la presencia de material metálico en la parte baja del tubo de alimentación |
| 5 | Magnético | SMC D-C73 | posición de cilindro | Detecta si el cilindro superior se encuentra extendido |
| 6 | Magnético | SMC D-C73 | posición de cilindro | Detecta si el cilindro superior se encuentra retraído |
| 7 | Magnético | SMC D-C73 | posición de cilindro | Detecta si el cilindro inferior se encuentra extendido |
| 8 | Magnético | SMC D-C73 | posición de cilindro | Detecta si el cilindro inferior se encuentra retraído  |

*Table 1\. Entradas de la Unidad de Alimentación.*

| Accionadores y Actuadores |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **N** | **Tipo** | **Modelo** | **Variable de entrada** | **Descripción** |
| 9 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro superior |
| 10 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro inferior |
| 11 | Cilindro superior de doble accionamiento | NC | Aire a presión | Controla el paso de la siguiente pieza a ser entregada  |
| 12 | Cilindro inferior de doble accionamiento | NC | Aire a presión | Empuja la pieza a la zona de recolección |

*Table 2\. Salidas de la Unidad de Alimentación.*

![][image25]  
*Figure 24\. Diagrama de bloques: Unidad de Alimentación.*  
En este diagrama se toma la presencia de la pieza (salida) como variable de proceso y el estado lógico del sensor óptico que mide la salida como variable controlada. Aunque variable de proceso y variable controlada suelen usarse como sinónimos, la diferencia radica en que la variable controlada es la que se desea igualar al set point (por lo tanto deben de ser iguales en dimensión); en cambio la variable de proceso es aquella o aquellas condiciones del proceso que se miden (temperatura, presión, nivel, flujo, etc. o en este caso presencia).

## Unidad de Transporte {#unidad-de-transporte}

Los componentes de la unidad de transporte  son:

| Sensores |  |  |  |  |  |
| :---- | :---- | :---- | ----- | :---- | :---- |
| **N** | **Sensor** | **Modelo** | **Cantidad** | **Variable Medida** | **Descripción** |
| 1 | Finales de carrera | OmronV-156-1C25 | 2 | Contacto | Detectan las posiciones extremas de la base móvil del brazo neumático. |
| 2 | Sensor de proximidad inductivo | OmkqnTL-08NK | 1 | Presencia | Detecta llegada del brazo neumático. |
| 3 | Sensor magnético | SMC D-C73 | 7 | Posición de vástago | Detectan la posición de los vástagos de los cilindros neumáticos y el estado de la pinza. |
| 4 | Encoder incremental | Acoplado al servomotor MADDT1207003  | 1 | Posición y velocidad angular | Funciona acoplado al servomotor. |

*Table 3\. Entradas de la unidad de Transporte.*

| Accionadores y Actuadores |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **N** | **Elemento** | **Modelo** | **Tipo** | **Descripción** |
| 5 | Driver del servomotor | PanasonicMADDT1207003  | Continuo | Etapa de adaptación de señal entre el controlador y el servomotor. |
| 6 | Electroválvula neumática | AIRTAC4V120-06 | Discreto | Dirige el flujo de aire comprimido para accionar cilindros neumáticos. |
| 7 | Servomotor | PanasonicMHMD022P1U | Continuo | Para desplazar horizontalmente el brazo neumático. |
| 8 | Pinza neumática | SMCMHC2-20D | Discreto | Elemento de sujeción neumático. |
| 9 | Cilindro neumático doble | SMCMGPM16-75 | Discreto | Cilindro de doble vástago, posiciona delante a atrás la pinza neumática. |
| 10 | Cilindro neumático rotatorio | CHELICRTB1MHC220D0A2 | Discreto | Posiciona el conjunto de la pinza y el cilindro doble haciéndolo rotar. |
| 11 | Cilindro neumático corto (de elevación) | SMCCDQ2B50-20 | Discreto | Posiciona verticalmente la pinza en dos estados posibles. |

*Table 4\. Salidas de la Unidad de Transporte.*

Todos los lazos de control operan en configuración de lazo cerrado, en la cual cada actuador se encuentra conectado con sensores y dispositivos de medición que suministran señales de realimentación al PLC, permitiendo la supervisión continua y el ajuste automático del sistema.

![][image26]  
*Figure 25\. Diagrama de bloques: Unidad de Transporte.*

## Unidad de procesamiento   {#unidad-de-procesamiento}

Reconocimiento físico de los elementos del lazo de control

| Sensores |  |  |  |  |
| :---- | ----- | ----- | ----- | ----- |
| **N** | **Tipo** | **Modelo** | **Variable medida** | **Descripción** |
| 1 | Magnético | SMC D-C73 | Posición de cilindro | Detecta la extensión del cilindro neumático largo. |
| 2 | Magnético | SMC D-C73 | Posición de cilindro | Detecta la retracción del cilindro neumático largo. |
| 3 | Magnético | SMC D-C73 | Posición de cilindro | Detecta la extensión del cilindro neumático corto. |
| 4 | Magnético | SMC D-C73 | Posición de cilindro | Detecta la retracción del cilindro neumático corto. |
| 5 | Magnético | SMC D-Z73 | Posición de pinza | Detecta la posición de la pinza neumática. |
| 6 | Fotoeléctrico (IR) | E3Z-LS61 | Presencia | Detecta la presencia de la pieza en la zona de recolección. |

*Table 5\. Entradas Unidad de Procesamiento.*

| Accionadores y Actuadores |  |  |  |  |
| ----- | ----- | ----- | ----- | ----- |
| **N** | **Tipo** | **Modelo** | **Variable de entrada** | **Descripción** |
| 7 | Electroválvula neumática | NC | 0–24 V (Digital) | Controla el accionamiento del cilindro neumático largo. |
| 8 | Electroválvula neumática | NC | 0–24 V (Digital) | Controla el accionamiento del cilindro neumático corto. |
| 9 | Electroválvula neumática | NC | 0–24 V (Digital) | Controla el accionamiento de la pinza neumática. |
| 10 | Cilindro neumático largo | NC | Aire a presión | Realiza el desplazamiento principal del mecanismo de sellado. |
| 11 | Cilindro neumático corto | NC | Aire a presión | Realiza el desplazamiento secundario del mecanismo de sellado. |
| 12 | Pinza neumática | NC | Aire a presión | Sujeta y manipula la pieza durante el proceso de sellado. |

*Table 6\. Salidas Unidad de Procesamiento.*

![][image27]

*Figure 26\. Diagrama de bloques: Unidad de Procesamiento.*

¿Lazo abierto o lazo cerrado?

El sistema opera en lazo cerrado. La justificación es la siguiente: el sensor fotoeléctrico E3Z-LS61 ubicado en la zona de recolección mide continuamente la PV (presencia de pieza sellada) y envía esa información de regreso al PLC como señal de retroalimentación (CV). El PLC compara esta señal con el SP para determinar si el ciclo se completó correctamente antes de habilitar un nuevo ciclo.

Adicionalmente, los sensores magnéticos de posición de vástagos conforman un lazo de retroalimentación interna que el PLC utiliza durante la secuencia para verificar que cada etapa del movimiento se completó antes de ejecutar la siguiente. Esto es característico de un control en lazo cerrado con verificación de estado en cada paso de la secuencia.

## Unidad de ensamblaje  {#unidad-de-ensamblaje}

Los componente de la unidad de ensamblaje son los siguientes:

| Sensores |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **N** | **Sensor** | **Modelo** | **Variable Medida** | **Descripción** |
| 1 | Sensor infrarrojo (IR) | E3Z-LS61 | Presencia | Detecta la presencia de piezas en su repositorio de alimentación, en la parte superior |
| 2 | Sensor infrarrojo (IR) | E3Z-LS61 | Presencia | Detecta la presencia de piezas en su repositorio de alimentación, en la parte inferior |
| 3 | Sensor infrarrojo (IR) | E3Z-LS61 | Presencia | Detecta la presencia de piezas en el módulo de transferencia rotativo, debajo del tubo de alimentación |
| 4 | Sensor infrarrojo (IR) | E3Z-LS61 | Presencia | Detecta la presencia de piezas en el módulo de transferencia rotativo, debajo de la pinza neumática |
| 5 | Sensor óptico (Fibra óptica) | E3X-NA41 | Presencia | Detecta llegada de el recipiente en el contenedor para iniciar el ensamblaje |
| 6 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición del vástagos del cilindro neumático del tubo de alimentación, cilindro superior, posición: desplegado |
| 7 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición del vástagos del cilindro neumático del tubo de alimentación, cilindro superior, posición: replegado |
| 8 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición del vástagos del cilindro neumático del tubo de alimentación, cilindro inferior, posición: desplegado |
| 9 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición del vástagos del cilindro neumático del tubo de alimentación, cilindro inferior, posición: replegado |
| 10 | Sensor magnético | SMC D-C73 | Posición del cilindro | Detecta la posición del cilindro neumático rotativo, sentido horario |
| 11 | Sensor magnético | SMC D-C73 | Posición del cilindro | Detecta la posición del cilindro neumático rotativo, sentido antihorario |
| 12 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición del vástago del cilindro neumático horizontal de la pinza neumática, posición: desplegado |
| 13 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición del vástago del cilindro neumático horizontal de la pinza neumática, posición: replegado |
| 14 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición del vástago del cilindro neumático vertical de la pinza neumática, posición: desplegado |
| 15 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición del vástago del cilindro neumático vertical de la pinza neumática, posición: replegado |
| 16 | Sensor magnético | SMC D-C73 | Posición de vástago | Detecta la posición de la pinza neumática si se encuentra con abierta o cerrada |

*Table 7\. Entradas Unidad de Ensamblaje.*

| Actuadores |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **N** | **Actuador** | **Modelo** | **Variable de entrada** | **Descripción** |
| 1 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro superior del tubo de alimentación |
| 2 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro inferior del tubo de alimentación |
| 3 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro horizontal de la pinza neumática |
| 4 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro vertical de la pinza neumática |
| 5 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro rotativo |
| 6 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia la pinza neumática |
| 7 | Pinza neumática | SMCMHC2-20D | Aire a presión | Elemento de sujeción neumático |
| 8 | Cilindro rotatorio | CHELICRTB1MHC220D0A2 | Aire a presión | Rota el módulo de transferencia rotativo de 0° hasta 180° en sentido horario y antihorario |
| 9 | Cilindro superior del tubo de alimentación doble accionamiento | NC | Aire a presión | Controla el paso de la siguiente pieza a ser dispensada del tubo de alimentación |
| 10 | Cilindro inferior del tubo de alimentación doble accionamiento | NC | Aire a presión | Controla el paso de la siguiente pieza a ser dispensada del tubo de alimentación |
| 11 | Cilindro horizontal de la pinza neumatica doble accionamiento | NC | Aire a presión | Controla el movimiento horizontal de la pinza neumática desde el módulo de transferencia rotativo hasta la posición de la pieza |
| 12 | Cilindro vertical de la pinza neuma doble accionamiento | NC | Aire a presión | Controla el movimiento vertical de la pinza neumática para elevar la posición de la pinza neumática para un movimiento libre horizontal de la pinza neumática a su siguiente posición y de retorno también. |

*Table 8\. Salidas Unidad de Ensamblaje.*

Integrando los elementos observados durante el estudio de la unidad de ensamblaje, se presenta a continuación el diagrama de bloques que estructura el funcionamiento del sistema:  
![][image28]  
*Figure 27\. Diagrama de bloques: Unidad de Ensamblaje*  
A Continuación se desglosa el diagrama para especificar mejor los componentes de la unidad de ensamblaje en su subproceso:![][image29]  
*Figure 28\. Diagrama de bloques: Subproceso Unidad de Ensamblaje.*  
![][image30]![][image31]  
*Figure 30\. Diagrama de bloques: Subproceso Unidad de Ensamblaje.* 

## Unidad de selección {#unidad-de-selección}

## Los componentes de la unidad de selección son: {#los-componentes-de-la-unidad-de-selección-son:}

| Sensores |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **N** | **Tipo** | **Modelo** | **Variable Medida** | **Descripción** |
| 1 | Sensor magnético | SMC D-C73 | Posición de vástago | Detectan la posición del vástagos del cilindro neumático una vez extendido |
| 2 | Sensor magnético | SMC D-C73 | Posición de vástago | Detectan la posición del vástagos del cilindro neumático una vez extendido |
| 3 | Sensor magnético | SMC D-C73 | Posición de vástago | Detectan la posición del vástagos del cilindro neumático una vez extendido |
| 4 | Sensor fotoeléctrico | MHT-15 | Presencia de pieza | Detectan la posición de la pieza en el inicio de la cinta de transporte |
| 5 | Optico (IR) | E3Z-LS61 | Presencia | Detecta la presencia de una pieza para clasificar el tipo de material de la misma  |
| 6 | Inductivo | LM18-3008 NA | Presencia | Detecta la presencia de material metálico en la parte baja del tubo de alimentación |
| 7 | Encoder Incremental | ZSP 3806 | Distancia | Detecta de manera continua la posición de la pieza a lo largo de la cinta transportadora |

*Table 9\. Entradas Unidad de Selección.*

| Accionadores y Actuadores |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **N** | **Tipo** | **Modelo** | **Variable de Entrada** | **Descripción** |
| 9 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro |
| 10 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro |
| 11 | Electroválvula neumática 4/2 de doble accionamiento | AIRTAC4V120-06 | 0 \- 24 \[V\] (Digital) | Acciona el direccionamiento neumático hacia el cilindro |
| 12 | Cilindro Neumatico | NC | Flujo de aire en su interior(on/off)  | Controla la distribución de la pieza en al cinta transportadora |
| 13 | Cilindro Neumatico | NC | Flujo de aire en su interior(on/off)  | Controla la distribución de la pieza en al cinta transportadora |
| 14 | Cilindro Neumatico | NC | Flujo de aire en su interior(on/off)  | Controla la distribución de la pieza en al cinta transportadora |
| 15 | Motor | 80YS25GY38  | Tensión Trifásica | Controla el desplazamiento del envase y pieza a lo largo de la cinta  |
| 16 | VFC POWTRAN | PT9100A R75G1 | Tensión DC 0-10\[V\] | Recibe señal DC y envía la tensión trifásica al motor  |

*Table 10\. Salidas Unidad de Selección.*  
Tomando todos los elemento observados y estudiados de la unidad de selección se plantea el siguiente diagrama de bloques del sistema :

![][image32]  
*Figure 31\. Diagrama de bloques: Unidad de Selección.*

# Conclusiones y recomendaciones {#conclusiones-y-recomendaciones}

* Se logró desarrollar la capacidad de traducir sistemas industriales complejos, como la Planta de Manufactura, en diagramas de bloques funcionales. Esta abstracción permite entender el flujo de señales (analógicas y digitales) y la jerarquía de control sin necesidad de un modelado matemático profundo en esta etapa inicial.  
* Se reconocieron físicamente los elementos esenciales de los lazos de control en las diversas estaciones. Se destaca la integración de tecnologías neumáticas, mecánicas y eléctricas, donde el **PLC Siemens S7-200** actúa como el núcleo de control coordinado.  
* Se diferenciaron con éxito las variables del sistema. Por ejemplo, en la Unidad de Alimentación, se identificó la señal digital del PLC como la **Variable Manipulada (MV)** y la presencia de la pieza como la **Variable Controlada (PV)**. De igual forma, en la Unidad de Transporte, se distinguió el desplazamiento angular del servomotor frente a las posiciones espaciales del brazo.  
* Se determinó que el sistema opera predominantemente en **lazo cerrado**. La retroalimentación es proporcionada por una red de sensores ópticos, inductivos, magnéticos y encoders, que permiten al controlador verificar el estado real de la planta frente a la referencia deseada.  
* La arquitectura de la planta, interconectada mediante una red **RS485**, demuestra la eficiencia del control distribuido, donde cada una de las cinco estaciones cumple una función lógica secuencial (alimentación, procesamiento, ensamblaje, transporte y selección) de manera orgánica.  
* Debido a que gran parte de los actuadores son neumáticos (cilindros y pinzas), se recomienda asegurar una presión de aire constante en la unidad de mantenimiento para evitar retardos en la respuesta de las variables manipuladas

[image1]: imagenes/image1.png
[image2]: imagenes/image2.png
[image3]: imagenes/image3.png
[image4]: imagenes/image4.png
[image5]: imagenes/image5.png
[image6]: imagenes/image6.png
[image7]: imagenes/image7.png
[image8]: imagenes/image8.png
[image9]: imagenes/image9.png
[image10]: imagenes/image10.png
[image11]: imagenes/image11.png
[image12]: imagenes/image12.png
[image13]: imagenes/image13.png
[image14]: imagenes/image14.png
[image15]: imagenes/image15.png
[image16]: imagenes/image16.png
[image17]: imagenes/image17.png
[image18]: imagenes/image18.png
[image19]: imagenes/image19.png
[image20]: imagenes/image20.png
[image21]: imagenes/image21.png
[image22]: imagenes/image22.png
[image23]: imagenes/image23.png
[image24]: diagramas/General.png
[image25]: diagramas/Alimentacion.png
[image26]: diagramas/Transporte.png
[image27]: diagramas/Procesamiento.png
[image28]: diagramas/Ensamblaje1.png
[image29]: diagramas/Ensamblaje2.png
[image30]: diagramas/Ensamblaje3.png
[image31]: diagramas/Ensamblaje4.png
[image32]: diagramas/Seleccion.png