**Universidad Mayor de San Andrés**  
**Facultad de Ingeniería**  
**Ingeniería Electrónica**  
![NO\_CAPTION null][image1]  
**Informe de laboratorio N°4**  
**“Modelado matemático”**

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


**Fecha de presentación:**	25/5/2026

La Paz \- Bolivia

[**Resumen	3**](#resumen)

[**Objetivos	3**](#objetivos)

[Objetivo General	3](#objetivo-general)

[Objetivos Específicos	3](#objetivos-específicos)

[**Fundamento Teórico	3**](#fundamento-teórico)

[Modelado Clásico	3](#modelado-clásico)

[Función de Transferencia	4](#función-de-transferencia)

[Sistemas de Primer y Segundo Orden	4](#sistemas-de-primer-y-segundo-orden)

[Sistema de Segundo Orden con Integrador	5](#sistema-de-segundo-orden-con-integrador)

[Identificación de Sistemas	5](#identificación-de-sistemas)

[Modelado Moderno	6](#modelado-moderno)

[Formulación del Espacio de Estados	6](#formulación-del-espacio-de-estados)

[Formas Canónicas	7](#formas-canónicas)

[Espacio de Estados para Sistema con Integrador (Posición–Velocidad)	7](#espacio-de-estados-para-sistema-con-integrador-\(posición–velocidad\))

[Controlabilidad y Observabilidad	7](#controlabilidad-y-observabilidad)

[Encoders Incrementales para Retroalimentación de Posición	8](#encoders-incrementales-para-retroalimentación-de-posición)

[Principio de Funcionamiento	8](#principio-de-funcionamiento)

[Resolución y Conversión a Desplazamiento Lineal	9](#resolución-y-conversión-a-desplazamiento-lineal)

[Contadores de Alta Velocidad (HSC) en el PLC S7-200	9](#contadores-de-alta-velocidad-\(hsc\)-en-el-plc-s7-200)

[Interrupciones Temporizadas (SMB34) en el S7-200	9](#interrupciones-temporizadas-\(smb34\)-en-el-s7-200)

[**Implementación de Hardware y Modificaciones Técnicas	10**](#implementación-de-hardware-y-modificaciones-técnicas)

[Control Bidireccional	10](#control-bidireccional)

[Modificación de Parámetros del Variador de Frecuencia	10](#modificación-de-parámetros-del-variador-de-frecuencia)

[Cableado PLC-VFC	10](#cableado-plc-vfc)

[Diagrama de Cableado Bidireccional	11](#diagrama-de-cableado-bidireccional)

[**Metodología de Adquisición de Datos	11**](#metodología-de-adquisición-de-datos)

[Configuración del Contador de Alta Velocidad (HSC0)	12](#configuración-del-contador-de-alta-velocidad-\(hsc0\))

[Lógica de Control y Activación del Experimento	12](#lógica-de-control-y-activación-del-experimento)

[Estrategia de Muestreo y Almacenamiento por Punteros	12](#estrategia-de-muestreo-y-almacenamiento-por-punteros)

[Extracción de Datos y Dificultades Técnicas	12](#extracción-de-datos-y-dificultades-técnicas)

[**Modelado Matemático	12**](#modelado-matemático)

[Metodología de Procesamiento en MATLAB	13](#metodología-de-procesamiento-en-matlab)

[Identificación por Función de Transferencia	13](#identificación-por-función-de-transferencia)

[Representación en Espacio de Estados	13](#representación-en-espacio-de-estados)

[Análisis de Estabilidad y Dinámica	13](#análisis-de-estabilidad-y-dinámica)

[Controlabilidad y observabilidad	14](#controlabilidad-y-observabilidad-1)

[**Análisis de Resultados y Validación	14**](#análisis-de-resultados-y-validación)

[Análisis de la Representación en Espacio de Estados	14](#análisis-de-la-representación-en-espacio-de-estados)

[Factor de Escalamiento Físico	14](#factor-de-escalamiento-físico)

[Análisis de Simetría (Forward/Backward)	14](#análisis-de-simetría-\(forward/backward\))

[Correlación y Validación del Modelo	15](#correlación-y-validación-del-modelo)

[**Conclusiones y Recomendaciones	16**](#conclusiones-y-recomendaciones)

[Conclusiones	16](#conclusiones)

[Recomendaciones	16](#recomendaciones)

# Resumen {#resumen}

En el presente informe se detalla el proceso de modelado matemático de la Unidad de Selección de una planta de manufactura flexible, la cual opera mediante un sistema variador-motor-encoder. El objetivo central fue obtener representaciones dinámicas precisas en Función de Transferencia y Espacio de Estados bajo operación bidireccional.

La metodología de adquisición de datos se implementó en un PLC Siemens S7-200, utilizando contadores de alta velocidad (HSC0) e interrupciones temporizadas de 10 ms (SMB34) para garantizar un muestreo constante, superando las limitaciones de comunicación mediante una extracción manual de datos desde las tablas de estado del software Step 7 Micro/WIN.

El modelado se llevó a cabo en MATLAB mediante técnicas de identificación de "caja negra", ajustando un sistema de segundo orden con integrador. Se forzó una estructura matricial específica en el espacio de estados para asegurar que las variables conserven una interpretación física coherente como posición y velocidad. Los resultados obtenidos muestran una simetría dinámica notable entre ambos sentidos de giro, con porcentajes de ajuste (*Fit*) superiores al 98.9%. Finalmente, se validó la precisión de los modelos comparando la respuesta simulada frente a los datos experimentales, proporcionando una base caracterizada y confiable para el diseño de futuros controladores de precisión en el PLC.

## Objetivos {#objetivos}

### Objetivo General {#objetivo-general}

Obtener y validar el modelo matemático aproximado (Función de Transferencia y Espacio de Estados) de la unidad de selección (sistema variador-motor-encoder) mediante el análisis del comportamiento dinámico de las variables en un régimen de operación bidireccional, asegurando la caracterización precisa del sistema para su posterior control.

### Objetivos Específicos {#objetivos-específicos}

* Identificar las variables de entrada (señal analógica del PLC en unidades digitales) y salida (conteo de pulsos del encoder incremental) que gobiernan el comportamiento de la cinta transportadora.
* Implementar una estrategia de adquisición de datos en tiempo real utilizando las funciones de conteo rápido (HSC) e interrupciones temporizadas (SMB34) del PLC Siemens S7-200 para garantizar un muestreo determinista.
* Obtener experimentalmente los parámetros dinámicos del sistema, específicamente la ganancia de velocidad ($K_v$) y la constante de tiempo ($\tau$), para los sentidos de giro Forward y Backward.
* Representar el sistema dinámico mediante modelos de segundo orden con integrador, tanto en el dominio de la frecuencia (Función de Transferencia) como en el dominio del tiempo (Espacio de Estados).
* Validar los modelos matemáticos obtenidos comparando la respuesta simulada frente a los datos experimentales, determinando el grado de correlación y el porcentaje de ajuste (Fit).
* Analizar la simetría dinámica de la unidad de selección mediante la comparativa de los modelos obtenidos en ambos sentidos de operación.


# Fundamento Teórico {#fundamento-teórico}

## Modelado Clásico  {#modelado-clásico}

El modelado matemático de un sistema dinámico constituye el primer paso fundamental en cualquier proceso de diseño de control. Un modelo matemático es una descripción en términos de ecuaciones que captura el comportamiento dinámico esencial de un sistema físico, permitiendo predecir su respuesta ante diferentes entradas sin necesidad de operar directamente sobre el sistema real.

El enfoque clásico del modelado se basa en el análisis en el dominio de la frecuencia mediante la Transformada de Laplace, que convierte ecuaciones diferenciales del dominio del tiempo en ecuaciones algebraicas en el dominio complejo s. Esta transformación facilita enormemente el análisis y el diseño de controladores.

![][image4]

*Figure 1\.* 

## Función de Transferencia {#función-de-transferencia}

La Función de Transferencia (FT) de un sistema lineal e invariante en el tiempo (LTI) se define como el cociente entre la Transformada de Laplace de la señal de salida y la Transformada de Laplace de la señal de entrada, asumiendo condiciones iniciales nulas:

![][image5]

*Figure 2\.* 

## Sistemas de Primer y Segundo Orden {#sistemas-de-primer-y-segundo-orden}

La gran mayoría de los sistemas físicos puede aproximarse con modelos de primer o segundo orden. Un sistema de primer orden tiene la forma canónica:

![][image6]

*Figure 3\.* 

## Sistema de Segundo Orden con Integrador {#sistema-de-segundo-orden-con-integrador}

Para sistemas que involucran posición como una cinta transportadora donde la salida es el desplazamiento medido en pulsos de encoder  el modelo debe incorporar necesariamente un integrador. Esto se debe a que la posición es la integral de la velocidad.

La función de transferencia de segundo orden con integrador tiene la forma:

*G(s) \= K / \[s(τs \+ 1)\]  \=  K / (τs² \+ s)*

Este modelo presenta un polo en el origen (el integrador, s \= 0\) y un polo en s \= –1/τ correspondiente a la dinámica del motor-variador. La ganancia *K* representa la ganancia de velocidad en estado estacionario del sistema y τ es la constante de tiempo dinámica del actuador.

La presencia del integrador implica que ante una entrada escalón de velocidad, la posición crece indefinidamente en lazo abierto, lo que es físicamente coherente con el comportamiento de un motor que gira a velocidad constante. Para el control de posición, es indispensable cerrar el lazo con una acción proporcional que al menos cancele el integrador.

![][image7]

*Figure 4\.* 

## Identificación de Sistemas  {#identificación-de-sistemas}

Cuando no se dispone de las ecuaciones físicas del sistema (masas, fricciones, inductancias, etc.) o estas son demasiado complejas para ser modeladas analíticamente, se recurre a técnicas de identificación de sistemas, también denominadas modelado de 'caja negra'.

En este enfoque se aplican entradas conocidas al sistema, se miden las salidas correspondientes y, a partir de los datos entrada-salida, se estima el modelo que mejor describe el comportamiento observado. Las herramientas más utilizadas incluyen:

![][image8]

*Figure 5\.* 

Porcentaje de Ajuste (Fit%): MATLAB cuantifica la calidad del modelo identificado mediante la métrica de ajuste normalizado NRMSE (Normalized Root Mean Square Error):

![][image9]

*Figure 6\.* 

*![][image10]*

*Figure 7\.* 

Un valor de Fit cercano al 100% indica que el modelo reproduce con exactitud los datos experimentales. En la práctica, valores superiores al 90% son considerados aceptables para el diseño de controladores industriales.

## Modelado Moderno {#modelado-moderno}

La representación en Espacio de Estados constituye el pilar del control moderno. A diferencia de la función de transferencia, que solo relaciona entrada y salida, el espacio de estados permite caracterizar completamente el comportamiento interno del sistema mediante variables de estado, lo que habilita el diseño de controladores de alta complejidad como reguladores óptimos (LQR), observadores de estado (filtro de Kalman) y control por realimentación de estado completo.

![][image11]

*Figure 8\.* 

## Formulación del Espacio de Estados {#formulación-del-espacio-de-estados}

La representación general en espacio de estados de un sistema LTI es:![][image12]

*Figure 9\.* 

Donde x(t) ∈ ℝⁿ es el vector de variables de estado, u(t) ∈ ℝᵐ es el vector de entradas, y(t) ∈ ℝᵖ es el vector de salidas, A es la matriz de sistema (n×n), B es la matriz de entrada (n×m), C es la matriz de salida (p×n) y D es la matriz de transmisión directa (p×m).

## Formas Canónicas {#formas-canónicas}

Dado que las variables de estado no son únicas (cualquier transformación lineal no singular de un vector de estado válido produce otro vector válido), existen diversas formas canónicas que facilitan el análisis y el diseño:

![][image13]

*Figure 10\.* 

## Espacio de Estados para Sistema con Integrador (Posición–Velocidad) {#espacio-de-estados-para-sistema-con-integrador-(posición–velocidad)}

Para el sistema variador-motor-cinta transportadora, cuya función de transferencia es G(s) \= K/\[s(τs+1)\], las variables de estado con interpretación física directa son x₁ \= posición (pulsos de encoder) y x₂ \= velocidad (pulsos/s). La representación en espacio de estados queda:

![][image14]

*Figure 11\.* 

Esta estructura denominada forma compañera  asegura que x₁ representa directamente la posición acumulada de la cinta (conteo de pulsos del encoder) y x₂ representa la velocidad instantánea del motor.

## Controlabilidad y Observabilidad {#controlabilidad-y-observabilidad}

Controlabilidad: un sistema es completamente controlable si es posible llevar el estado del sistema desde cualquier estado inicial x(t₀) hasta cualquier estado final deseado en tiempo finito mediante una entrada de control adecuada. La condición necesaria y suficiente es que la matriz de controlabilidad tenga rango n:

![][image15]

*Figure 12\.* 

Observabilidad: un sistema es completamente observable si, a partir del conocimiento de la salida y(t) y la entrada u(t) durante un intervalo de tiempo finito, es posible determinar completamente el estado inicial x(t₀). La condición es:

![][image16]

*Figure 13\.* 

## Encoders Incrementales para Retroalimentación de Posición {#encoders-incrementales-para-retroalimentación-de-posición}

Un encoder incremental es un sensor electromecánico que convierte el desplazamiento angular de un eje rotatorio en una secuencia de pulsos eléctricos digitales. Es el dispositivo de retroalimentación de posición más utilizado en sistemas de servo-control y control de movimiento industriales.

![][image17]

*Figure 14\.* 

## Principio de Funcionamiento {#principio-de-funcionamiento}

El encoder incremental consiste en un disco óptico con ranuras equidistantes que interrumpen un haz de luz infrarrojo. Un fotodetector convierte las interrupciones en pulsos eléctricos. Los encoders de cuadratura generan dos señales desfasadas 90° (canales A y B), lo que permite determinar tanto la magnitud del desplazamiento como su sentido de giro:

![][image18]

*Figure 15\.* 

## Resolución y Conversión a Desplazamiento Lineal {#resolución-y-conversión-a-desplazamiento-lineal}

La resolución de un encoder se expresa en PPR (Pulsos Por Revolución). Un encoder de 1024 PPR genera 1024 pulsos por cada vuelta completa del eje. En modo de decodificación por cuadratura (×4), la resolución efectiva se cuadruplica a 4096 conteos/revolución, mejorando la precisión del control de posición.

![][image19]![][image20]

*Figure 17\.* 

## Contadores de Alta Velocidad (HSC) en el PLC S7-200 {#contadores-de-alta-velocidad-(hsc)-en-el-plc-s7-200}

Los pulsos generados por el encoder incremental a alta velocidad (cientos a miles de Hz) no pueden ser contados confiablemente mediante el ciclo de scan normal del PLC (10–100 ms). El PLC Siemens S7-200 incorpora módulos de conteo de alta velocidad (HSC, High Speed Counter) con hardware dedicado capaz de procesar señales de hasta 30 kHz de forma independiente al ciclo de scan.

El contador HSC0 opera en modo de cuadratura de fase (Modo 9), lo que le permite contar los pulsos de los canales A y B del encoder e incrementar o decrementar automáticamente el registro acumulador de 32 bits según el sentido de giro detectado. Esto provee una medición de posición absoluta relativa (desde el arranque) directamente en el registro HC0 del PLC, que constituye la variable de salida del sistema identificado.

## Interrupciones Temporizadas (SMB34) en el S7-200 {#interrupciones-temporizadas-(smb34)-en-el-s7-200}

El byte de memoria especial SMB34 del Siemens S7-200 controla la interrupción temporizada de tiempo 10 (INT\_10). Al cargar un valor en SMB34 y habilitar el evento de interrupción 10, el PLC ejecuta una rutina de servicio de interrupción (ISR) con la periodicidad configurada, independientemente del ciclo de scan principal.

Esta capacidad es esencial para la adquisición de datos determinista: garantiza que las muestras se toman exactamente cada T \= 10 ms, sin las variaciones (jitter) inherentes al ciclo de scan que invalidarían la identificación del modelo. La ISR captura el valor actual del contador HSC0 y lo almacena en un buffer de memoria V para su posterior procesamiento.

# Implementación de Hardware y Modificaciones Técnicas {#implementación-de-hardware-y-modificaciones-técnicas}

Para el desarrollo del presente laboratorio, se realizaron modificaciones significativas en la configuración del hardware de la Unidad de Selección. El objetivo principal fue permitir una caracterización completa del sistema en ambos sentidos de operación, superando las limitaciones de los laboratorios previos

## Control Bidireccional {#control-bidireccional}

La Unidad de Selección requiere un desplazamiento preciso de la cinta transportadora para el posicionamiento y clasificación de piezas. Se implementó una lógica de control bidireccional mediante el **Modo de 2 hilos tipo 2** en el variador de frecuencia. En esta configuración, se desacopla la orden de marcha de la orden de dirección: un terminal actúa como comando maestro de **Arranque/Paro (Run/Stop)** mientras que un segundo terminal define el **Sentido de Giro (FWD/REV)**.

## Modificación de Parámetros del Variador de Frecuencia {#modificación-de-parámetros-del-variador-de-frecuencia}

Para adaptar el variador **Powtran PI9100A** a los requerimientos de control externo y bidireccional, se ajustaron los siguientes parámetros:

* **Límites de Frecuencia:** Se configuró la frecuencia máxima de salida (**F0.19**) y el límite superior de frecuencia (**F0.21**) a **60.00 Hz**, ajustando también la frecuencia nominal del motor (**b0.04**) a dicho valor.  
* **Referencia de Velocidad:** Se estableció el parámetro **F0.03 en 3** para definir la entrada analógica **AI2** como fuente de frecuencia. Se verificó que el *jumper* físico en la placa de control estuviera en posición de voltaje (V).  
* **Modo de Comando y Lógica:**  
  * **F0.11 \= 1:** Control por bloque de terminales.  
  * **F1.10 \= 1:** Modo de 2 hilos tipo 2\.  
  * **F1.00 \= 1:** Terminal **DI1** asignado como Arranque/Paro.  
  * **F1.01 \= 2:** Terminal **DI2** asignado como Selector de Dirección.

## Cableado PLC-VFC {#cableado-plc-vfc}

El conexionado físico se realizó utilizando un **PLC Siemens S7-200 CPU 224XP CN**. Debido a que la unidad cuenta con **salidas digitales por relé**, se cableó un terminal común para energizar las bobinas de los relés internos y permitir el paso de señal hacia el variador.

* **Mando Digital:**  
  * La salida **Q0.0** se conectó al terminal **DI1** del variador para el control de marcha.  
  * La salida **Q0.1** se conectó al terminal **DI2** para definir el sentido de giro.  
  * Se utilizó el terminal común de las salidas del PLC para cerrar el lazo con el terminal **COM** del variador.  
* **Referencia Analógica:**  
  * La salida analógica **AQW0** (0-10V DC) se conectó al terminal **AI2** y su referencia al terminal **GND** del variador, enviando una consigna escalar de 0 a 32,000 unidades.  
* **Realimentación (HSC0):**  
  * Las fases del encoder se conectaron a las entradas **I0.0** e **I0.1**, configurando el **HSC0 en Modo 9 (1x)** para detección de cuadratura

## Diagrama de Cableado Bidireccional {#diagrama-de-cableado-bidireccional}

![][image21]  
*Figure 18\. Diagrama eléctrico actualizado. Unidad de Selección.*

En la Figura 19 se presenta el diagrama de conexiones detallado entre el PLC S7-200 y el Variador Powtran, destacando la interfaz analógica AI2 y la lógica de mando de dos hilos.

![][image22]  
*Figure 19\. Detalle resaltado de las modificaciones hechas*

# Metodología de Adquisición de Datos {#metodología-de-adquisición-de-datos}

La identificación precisa de un sistema dinámico requiere que los datos experimentales sean capturados a intervalos de tiempo constantes y conocidos. Para ello, se implementó una estrategia de adquisición robusta utilizando los recursos de interrupción y punteros del PLC S7-200.

## Configuración del Contador de Alta Velocidad (HSC0) {#configuración-del-contador-de-alta-velocidad-(hsc0)}

Dado que la Unidad de Selección opera mediante un encoder incremental, se configuró el contador **HSC0** para procesar los pulsos de forma asíncrona al programa principal:

* **Modo de Operación:** Modo 9 (Fases A/B en cuadratura).  
* **Factor de Escalamiento:** Configurado en **1x**.  
* **Entradas:** I0.0 (Fase A) e I0.1 (Fase B).

## Lógica de Control y Activación del Experimento {#lógica-de-control-y-activación-del-experimento}

Para facilitar la toma de datos bidireccional, se utilizó una lógica de mando basada en entradas digitales físicas:

* **Arranque y Registro (I1.3 \- Botón Verde):** Al accionar este pulsador, el PLC ejecuta tres acciones simultáneas: inicia la marcha del motor, establece la salida analógica **AQW0 en 16,000 unidades** (correspondiente a 5V o velocidad media) y habilita la subrutina de interrupción para el registro de datos.  
* **Selector de Dirección (I1.2 \- Botón Rojo):** Este pulsador actúa como selector de estado. Su posición determina si la orden enviada al variador es *Forward* o *Reverse*, permitiendo realizar ambas pruebas con el mismo bloque de programa.

## Estrategia de Muestreo y Almacenamiento por Punteros {#estrategia-de-muestreo-y-almacenamiento-por-punteros}

Para garantizar un periodo de muestreo constante de **10 ms**, se configuró el registro especial **SMB34**. En cada ciclo de interrupción, se ejecutó la siguiente lógica de almacenamiento:

1. **Uso de Punteros:** Se definió un puntero de memoria inicializado en la dirección **\&VD0**.  
2. **Registro:** El valor instantáneo del contador rápido (**HC0**) se transfirió a la dirección apuntada.  
3. **Incremento Secuencial:** Para evitar la sobreescritura, el puntero se incrementó en **4 unidades** (correspondiente al tamaño de un Double Word en el S7-200) tras cada captura, asegurando un registro contiguo de la evolución temporal del sistema.

## Extracción de Datos y Dificultades Técnicas {#extracción-de-datos-y-dificultades-técnicas}

Originalmente, se planificó la adquisición de datos en tiempo real mediante el software **Siemens PC Access** vinculado a una hoja de cálculo en Excel. Sin embargo, debido a errores de comunicación desconocidos en el servidor OPC, se optó por una solución práctica:

* **Tabla de Estados:** Se configuró una tabla de monitoreo en **Step 7 Micro/WIN** con un rango extendido desde **VD0 hasta VD500**.  
  * **Recuperación Manual:** Tras la ejecución de cada prueba, se realizó una lectura de la memoria interna del PLC y los datos se copiaron manualmente hacia una hoja de cálculo. Este método, aunque laborioso, garantizó la integridad de los datos de posición para el posterior análisis de modelado, evitando la pérdida de información por fallos de red.

# Modelado Matemático {#modelado-matemático}

El modelado del sistema variador-motor-encoder se abordó desde una perspectiva experimental de "caja negra", asumiendo una dinámica lineal alrededor del punto de operación (16,000 unidades PLC). Dado que la entrada es una consigna de velocidad y la salida es el conteo acumulado de pulsos (posición), el sistema se comporta inherentemente como un **integrador**.

## Metodología de Procesamiento en MATLAB {#metodología-de-procesamiento-en-matlab}

Para la obtención de los modelos, se desarrolló un script en MATLAB enfocado en la identificación paramétrica. El flujo de procesamiento consistió en los siguientes pasos:

1.  **Importación y Sincronización:** Los archivos CSV generados por el PLC fueron cargados utilizando la función `readmatrix`. Se definió un vector de tiempo preciso basado en el periodo de muestreo de $T_s = 0.01$ s (10 ms) identificado en la metodología de adquisición.
2.  **Preparación de Datos:** Se crearon objetos de datos de identificación (`iddata`), relacionando la respuesta del encoder con el escalón de entrada de 16,000 unidades.
3.  **Algoritmo de Estimación:** Se utilizó la función de estimación de sistemas de tiempo continuo para ajustar los parámetros $a$ y $b$ de la estructura propuesta. El algoritmo busca minimizar el error cuadrático medio entre la rampa experimental y la respuesta del modelo, forzando la existencia de un polo en el origen para representar fielmente el comportamiento integrador de la posición.
4.  **Cálculo de Bondad de Ajuste:** Se empleó la métrica de *Normalized Root Mean Square Error* (NRMSE) para determinar el porcentaje de ajuste (*Fit*), garantizando que el modelo represente la dinámica real con una fidelidad superior al 98%.
5. **Cálculo de Controlabilidad y Observabilidad:** El script evalúa si el sistema es controlable y observable mediante las funciones **ctrb()** y **obsv()** respectivamente.

## Identificación por Función de Transferencia {#identificación-por-función-de-transferencia}

Se propuso una estructura de segundo orden con integrador puro para capturar tanto la acumulación de posición como la inercia del sistema mecánico:

$$G(s) = \frac{b}{s^2 + as} = \frac{K_v}{s(\tau s + 1)}$$

Utilizando el procedimiento descrito, se obtuvieron las siguientes funciones de transferencia:

*   **Sentido Adelante (Forward):**
    $$G_{fwd}(s) = \frac{0.1642}{s^2 + 3.764s}$$
    
*   **Sentido Atrás (Backward):**
    $$G_{bwd}(s) = \frac{-0.1618}{s^2 + 3.716s}$$
    
## Representación en Espacio de Estados {#representación-en-espacio-de-estados}

Para el modelado moderno, se definieron las variables de estado como $x_1$ (Posición en cuentas) y $x_2$ (Velocidad en cuentas/s). Las matrices en la forma canónica de control son:

$$\dot{x} = \begin{bmatrix} 0 & 1 \\ 0 & -3.7638 \end{bmatrix} x + \begin{bmatrix} 0 \\ 0.1642 \end{bmatrix} u \quad (\text{Forward})$$

$$\dot{x} = \begin{bmatrix} 0 & 1 \\ 0 & -3.7159 \end{bmatrix} x + \begin{bmatrix} 0 \\ -0.1618 \end{bmatrix} u \quad (\text{Backward})$$

## Análisis de Estabilidad y Dinámica {#análisis-de-estabilidad-y-dinámica}

El análisis de los autovalores de la matriz $A$ muestra:
*   Un polo en el origen ($s_1 = 0$), característico de sistemas integradores.
*   Un polo estable ($s_2 \approx -3.7$), que define el transitorio de velocidad.
*   Una constante de tiempo promedio $\tau \approx 0.267$ s, indicando una respuesta ágil del variador ante cambios en la referencia.


## Controlabilidad y observabilidad {#controlabilidad-y-observabilidad-1}

El script de Matlab indica que; para ambos casos (adelante y atrás) el sistema es controlable y observable.

# Análisis de Resultados y Validación {#análisis-de-resultados-y-validación}

## Análisis de la Representación en Espacio de Estados {#análisis-de-la-representación-en-espacio-de-estados}

La estructura matricial obtenida para el sistema refleja fielmente la física del proceso. Al observar la matriz de estado $A$ y el vector de entrada $B$:

$$ \dot{x} = \begin{bmatrix} 0 & 1 \\ 0 & -a \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} + \begin{bmatrix} 0 \\ b \end{bmatrix} u $$

Se puede interpretar el significado físico de los estados basándose en los coeficientes nulos:
1.  **Estado $x_1$ (Posición):** La primera fila de la ecuación de estado indica que $\dot{x}_1 = x_2$. Esto establece una relación cinemática directa donde la derivada de la posición es la velocidad. El coeficiente $0$ en la posición indica que el sistema no tiene una "fuerza restauradora" (como un resorte), confirmando su naturaleza integradora.
2.  **Estado $x_2$ (Velocidad):** La segunda fila indica que $\dot{x}_2 = -a \cdot x_2 + b \cdot u$. Aquí, el coeficiente $-a$ representa el amortiguamiento o fricción que limita la velocidad, mientras que $b$ es la ganancia con la que la consigna de velocidad ($u$) genera aceleración. 

Es importante destacar que **el código de MATLAB fue ajustado deliberadamente para forzar estos coeficientes cero** en la matriz de estado. Esta restricción estructural en el proceso de identificación asegura que el vector de estado conserve una interpretación física coherente (posición y velocidad) y no sea simplemente una representación matemática abstracta, facilitando así el diseño posterior de controladores por realimentación.

## Factor de Escalamiento Físico {#factor-de-escalamiento-físico}

Para proporcionar una referencia física del sistema, se determinó experimentalmente que **607 cuentas** del encoder equivalen aproximadamente a **15.2 cm** de desplazamiento lineal en la cinta. A partir de esta relación, se obtiene el factor de escalamiento ($F_e$):

$$ F_e = \frac{15.2 \text{ cm}}{607 \text{ cuentas}} \approx 0.02504 \text{ cm/cuenta} $$

**Nota técnica:** Aunque este factor permite traducir el comportamiento del sistema a unidades métricas (útil para visualización en una interfaz **HMI**), se decidió **no incluirlo** en el modelado de la planta. Mantener la salida en "cuentas" permite que el controlador diseñado para el PLC trabaje con valores enteros nativos del contador de alta velocidad (HSC), evitando errores de redondeo y optimizando el procesamiento digital en el procesador Siemens S7-200.

## Análisis de Simetría (Forward/Backward) {#análisis-de-simetría-(forward/backward)}

| Parámetro | Sentido Adelante | Sentido Atrás | Variación (%) |
| :--- | :---: | :---: | :---: |
| **Constante de tiempo ($\tau$)** | 0.2657 s | 0.2691 s | 1.28% |
| **Ganancia de Velocidad ($K_v$)** | 0.0436 | -0.0435 | 0.23% |

*Table 1\. Comparación de parámetros Adelante y Atrás.*

La mínima variación en los parámetros confirma que el sistema es dinámicamente simétrico. La ligera diferencia en 𝜏 (1.28%) es despreciable para fines de control y se atribuye a la fricción mecánica residual del mecanismo de tracción.

## Correlación y Validación del Modelo {#correlación-y-validación-del-modelo}

La validez de la identificación se demuestra mediante el alto grado de ajuste (*Fit*) respecto a la respuesta real:

* **Ajuste Adelante:** **98.99%**  
* **Ajuste Atrás:** **98.92%**

A continuación se presentan las gráficas de validación generadas en MATLAB, donde se observa que la respuesta simulada (curva continua) se superpone casi perfectamente con los datos experimentales (puntos).  
![][image49]  
*Figure 25\. Validación del modelo en sentido Forward.*  
![][image50]  
*Figure 26\. Validación del modelo en sentido Backward.*

El error residual menor al 2% confirma que el modelo de segundo orden captura con precisión tanto el transitorio de aceleración como el régimen permanente de la cinta transportadora.

# Conclusiones y Recomendaciones {#conclusiones-y-recomendaciones}

## Conclusiones {#conclusiones}

* Se obtuvo con éxito el modelo matemático de la Unidad de Selección tanto en el dominio de la frecuencia (Función de Transferencia) como en el dominio del tiempo (Espacio de Estados). Los modelos de segundo orden con integrador resultaron ser altamente precisos, alcanzando un porcentaje de ajuste (*Fit*) superior al **98.9%** en ambos sentidos de operación.  
* La metodología de adquisición de datos mediante interrupciones temporizadas de 10 ms (**SMB34**) y contadores de alta velocidad (**HSC**) demostró ser fundamental para capturar la dinámica rápida del motor. Este enfoque determinista eliminó el sesgo provocado por el *scan time* variable del PLC, garantizando la integridad de las muestras para la identificación.  
* El análisis de simetría validó que el sistema motor-cinta transportadora se comporta de forma lineal y equilibrada. La mínima variación en la constante de tiempo ($\tau \approx 0.267$ s)) s) y en la ganancia de velocidad permite el uso de un controlador unificado para operaciones bidireccionales, simplificando la lógica de programación futura.  
* La representación en Espacio de Estados, con coeficientes forzados a cero en MATLAB, permitió una interpretación física clara de los estados (posición y velocidad). Esto confirma que el sistema es un integrador puro en posición, facilitando el diseño de controladores por realimentación de estados.  
* Se determinó un factor de escalamiento de **0.02504 cm/cuenta**. Aunque no se utilizó en el modelado para preservar la precisión nativa del PLC, su cálculo es valioso para la futura implementación de interfaces de supervisión (HMI).

## Recomendaciones {#recomendaciones}

* Para el diseño del controlador de posición, se recomienda considerar la constante de tiempo $\tau$ identificada. Un tiempo de muestreo de 10 ms es adecuado, pero el controlador debe ser capaz de compensar el retardo inercial de aproximadamente 265 ms para evitar sobreimpulsos que puedan desplazar las piezas sobre la cinta.
* Dada la naturaleza integradora del sistema, se sugiere el uso de una acción derivativa en un controlador PID, o bien, una realimentación de estados que incluya la velocidad estimada para mejorar el amortiguamiento durante las paradas de precisión.  
* Se recomienda implementar un filtro digital paso-bajo para el cálculo de la velocidad en el PLC si se utiliza el método de la derivada numérica, ya que el ruido de cuantización del encoder podría introducir vibraciones en la señal de control.  
* Para futuras prácticas, se aconseja resolver las limitaciones de comunicación de PC Access mediante una interfaz OPC-UA o protocolos más modernos, con el fin de automatizar la captura de datos y evitar el registro manual desde las tablas de estado de Step 7 Micro/WIN.

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
[image24]: imagenes/image24.png
[image25]: imagenes/image25.png
[image26]: imagenes/image26.png
[image27]: imagenes/image27.png
[image28]: imagenes/image28.png
[image29]: imagenes/image29.png
[image30]: imagenes/image30.png
[image31]: imagenes/image31.png
[image32]: imagenes/image32.png
[image33]: imagenes/image33.png
[image34]: imagenes/image34.png
[image35]: imagenes/image35.png
[image36]: imagenes/image36.png
[image37]: imagenes/image37.png
[image38]: imagenes/image38.png
[image39]: imagenes/image39.png
[image40]: imagenes/image40.png
[image41]: imagenes/image41.png
[image42]: imagenes/image42.png
[image43]: imagenes/image43.png
[image44]: imagenes/image44.png
[image45]: imagenes/image45.png
[image46]: imagenes/image46.png
[image47]: imagenes/image47.png
[image48]: imagenes/image48.png
[image49]: imagenes/image49.png
[image50]: imagenes/image50.png
[image51]: imagenes/image51.png
[image52]: imagenes/image52.png