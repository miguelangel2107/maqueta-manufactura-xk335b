**Universidad Mayor de San Andrés**  
**Facultad de Ingeniería**  
**Ingeniería Electrónica**  
![NO\_CAPTION null][image1]  
**Informe de laboratorio N°5**  
**“Implementación de sistemas de control**  
**discreto y continuo en elementos de**  
**procesamiento”**

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


**Fecha de presentación:**	02/06/26

La Paz \- Bolivia

[**Resumen	3**](#resumen)

[**Objetivos	3**](#objetivos)

[Objetivo General	3](#objetivo-general)

[Objetivos Específicos	3](#objetivos-específicos)

[**Fundamento Teórico	4**](#fundamento-teórico)

[Discretización de Sistemas en Espacio de Estados (ZOH)	4](#discretización-de-sistemas-en-espacio-de-estados-\(zoh\))

[Representación interna de sistemas continuos	4](#representación-interna-de-sistemas-continuos)

[Necesidad de la discretización	4](#necesidad-de-la-discretización)

[El Retenedor de Orden Cero (ZOH)	5](#el-retenedor-de-orden-cero-\(zoh\))

[Obtención de las matrices discretas	5](#obtención-de-las-matrices-discretas)

[Asignación de Polos en Tiempo Discreto	5](#asignación-de-polos-en-tiempo-discreto)

[Requisitos para aplicar la asignación de polos	5](#requisitos-para-aplicar-la-asignación-de-polos)

[Estimación del Estado de Velocidad por Diferencias Retroactivas	6](#estimación-del-estado-de-velocidad-por-diferencias-retroactivas)

[Pre-compensación de la Referencia (N)	7](#pre-compensación-de-la-referencia-\(n\))

[**Implementación de Hardware y Periféricos	9**](#implementación-de-hardware-y-periféricos)

[Configuración de Entradas de Conteo Rápido (HSC0)	9](#configuración-de-entradas-de-conteo-rápido-\(hsc0\))

[Configuración del Muestreo Determinista (SMB34)	10](#configuración-del-muestreo-determinista-\(smb34\))

[Conexión y Parámetros del Variador de Frecuencia	11](#conexión-y-parámetros-del-variador-de-frecuencia)

[**Metodología de Programación del Algoritmo de Control	12**](#metodología-de-programación-del-algoritmo-de-control)

[Verificación de Seguridad y Parada de Emergencia	12](#verificación-de-seguridad-y-parada-de-emergencia)

[Lectura y Conversión Digital de Posición	13](#lectura-y-conversión-digital-de-posición)

[Estimación Dinámica de la Velocidad	14](#estimación-dinámica-de-la-velocidad)

[Ejecución de la Ley de Realimentación de Estados	15](#ejecución-de-la-ley-de-realimentación-de-estados)

[Mapeo Bidireccional de Dirección por Signo	15](#mapeo-bidireccional-de-dirección-por-signo)

[Tratamiento de Magnitud, Saturación y Escritura Analógica	16](#tratamiento-de-magnitud,-saturación-y-escritura-analógica)

[**Modelado Matemático y Diseño de Controladores	17**](#modelado-matemático-y-diseño-de-controladores)

[Discretización del Modelo Dinámico de la Planta	17](#discretización-del-modelo-dinámico-de-la-planta)

[Requerimientos Dinámicos y Ubicación de Polos	18](#requerimientos-dinámicos-y-ubicación-de-polos)

[Diseño de Controladores	18](#diseño-de-controladores)

[Controlador A: Diseño Continuo Discretizado	18](#controlador-a:-diseño-continuo-discretizado)

[Controlador B: Diseño Directo en el Dominio Discreto (Plano Z)	19](#controlador-b:-diseño-directo-en-el-dominio-discreto-\(plano-z\))

[Simulación y Comparación de Desempeño Teórico	19](#simulación-y-comparación-de-desempeño-teórico)

[**Análisis de Resultados Experimentales y Validación	19**](#análisis-de-resultados-experimentales-y-validación)

[Pruebas de Regulación (Control de Posición)	20](#pruebas-de-regulación-\(control-de-posición\))

[Dinámica A: Controlador Diseñado en Z (](#dinámica-a:-controlador-diseñado-en-z-\(\))[![][image2]](https://www.codecogs.com/eqnedit.php?latex=K_d#2)[)	20](#dinámica-a:-controlador-diseñado-en-z-\(\))

[Dinámica B: Ajuste Subamortiguado (Respuesta Oscilatoria)	20](#dinámica-b:-ajuste-subamortiguado-\(respuesta-oscilatoria\))

[Pruebas de Rechazo de Perturbaciones (Rigidez del Lazo)	20](#pruebas-de-rechazo-de-perturbaciones-\(rigidez-del-lazo\))

[**Conclusiones y Recomendaciones	21**](#conclusiones-y-recomendaciones)

[Conclusiones	21](#conclusiones)

[Recomendaciones	21](#recomendaciones)

# Resumen {#resumen}

En este laboratorio se detalla la implementación y validación experimental de algoritmos de control moderno por realimentación de estados aplicados sobre el sistema variador-motor-encoder de la Unidad de Selección de una planta de manufactura flexible. Este trabajo cierra la brecha entre el modelado dinámico obtenido en el Laboratorio 4 y la operación de lazo cerrado determinista en tiempo real utilizando un PLC Siemens S7-200 (CPU 224XP CN).

El diseño del controlador se abordó mediante dos enfoques de asignación de polos: el diseño de un regulador continuo discretizado ($K_c$) y un diseño directo en el dominio discreto $Z$ ($K_d$) utilizando el retenedor de orden cero (ZOH) a un periodo de muestreo constante de $10\text{ ms}$ ($T_s = 0.01\text{ s}$). La estimación de la velocidad instantánea de la cinta, necesaria como segundo estado para el vector de realimentación, se resolvió a nivel de programación mediante un algoritmo de derivada digital por diferencias retroactivas.

Las pruebas experimentales validaron con éxito el comportamiento dinámico del lazo cerrado. En los ensayos de regulación, el controlador discreto estabilizó la cinta transportadora suavemente ante cambios tipo escalón de posición correspondientes a las tres rampas de clasificación ($710$, $1150$ y $1520$ cuentas) en un tiempo de asentamiento cercano a $1\text{ s}$, sin sobreimpulsos, corroborando con alta precisión la simulación teórica en MATLAB. Asimismo, se inyectaron ganancias modificadas de manera alternativa en el PLC para obtener una respuesta subamortiguada, verificándose la aparición de oscilaciones físicas transitorias en la cinta. Finalmente, la prueba de perturbación demostró la robustez y rigidez del lazo de control moderno: al intentar rotar manualmente la cinta transportadora, esta ofreció una firme oposición y, al ser liberada, retornó de inmediato a su punto de consigna original.


# Objetivos {#objetivos}

## Objetivo General {#objetivo-general}

Implementar y validar experimentalmente algoritmos de control moderno por realimentación de estados completos (enfoques continuo discretizado y discreto puro en Z) en la Unidad de Selección de una planta de manufactura flexible, garantizando un posicionamiento bidireccional determinista de alta precisión en tiempo real sobre el PLC Siemens S7-200.

## Objetivos Específicos {#objetivos-específicos}
*   Discretizar la representación en espacio de estados continua de la planta obtenida en el Laboratorio 4 utilizando el método de retenedor de orden cero (ZOH) para un periodo de muestreo determinista de $T_s = 10\text{ ms}$.
*   Diseñar las ganancias de realimentación de estado continuo ($K_c$) y discreto ($K_d$) mediante asignación de polos para lograr una respuesta transitoria críticamente amortiguada con un tiempo de asentamiento de $1\text{ s}$ ($s = -4$).
*   Calcular el factor de precompensación de la referencia ($N$) en continuo y discreto para asegurar error nulo en estado estacionario ante referencias escalón constantes.
*   Configurar los periféricos de la CPU 224XP CN, específicamente la inicialización del contador rápido asíncrono `HSC0` en Modo 9 y la interrupción temporizada controlada por `SMB34`.
*   Programar a nivel de software de PLC la estimación recursiva en coma flotante del segundo estado (velocidad instantánea de la cinta) utilizando la diferencia finita retroactiva de la posición.
*   Implementar mecanismos de seguridad industrial y estabilidad numérica dentro del algoritmo del PLC, incluyendo la lógica de saturación física de la acción de control a $32000$ unidades y el monitoreo prioritario de la seta de emergencia (`I1.4`).
*   Evaluar el desempeño dinámico en planta real bajo respuesta críticamente amortiguada frente a una respuesta subamortiguada (oscilatoria) inyectando de forma alternativa ganancias de control modificadas.
*   Verificar el rechazo del lazo de control frente a perturbaciones de torque mecánico aplicadas manualmente en la cinta transportadora.
*   Comparar la respuesta experimental obtenida de lazo cerrado en la planta frente a los resultados de simulación en MATLAB, validando el modelo e identificación previos.

# Fundamento Teórico {#fundamento-teórico}

El control en el espacio de estados constituye la base de la ingeniería de control moderna. A diferencia de las técnicas clásicas que se limitan a relacionar la entrada y la salida en el dominio de la frecuencia, este enfoque modela el comportamiento interno del sistema mediante variables de estado físicas. Para el motor y cinta de la Unidad de Selección, el vector de estados se define como:

$$x(t) = \begin{bmatrix} x_1(t) \\ x_2(t) \end{bmatrix} = \begin{bmatrix} \text{Posición (cuentas)} \\ \text{Velocidad (cuentas/s)} \end{bmatrix}$$

## 1. Discretización de Sistemas en Espacio de Estados (ZOH)
Para implementar un controlador digital en un PLC, es imperativo traducir el modelo de tiempo continuo a tiempo discreto. Considerando un periodo de muestreo constante $T_s$, se utiliza el método del Retenedor de Orden Cero (ZOH - Zero-Order Hold). El sistema discreto resultante se describe por:

$$x[k+1] = \Phi x[k] + \Gamma u[k]$$
$$y[k] = C x[k] + D u[k]$$

Donde $\Phi$ (matriz de transición de estados) y $\Gamma$ (matriz de entrada discreta) se calculan analíticamente a partir de las matrices continuas $A$ y $B$:

$$\Phi = e^{A T_s} = \mathcal{L}^{-1} \left\{ (sI - A)^{-1} \right\}_{t=T_s}$$
$$\Gamma = \left( \int_{0}^{T_s} e^{A \eta} d\eta \right) B = A^{-1} (\Phi - I) B \quad (\text{si } A \text{ es invertible})$$

Para sistemas que contienen integradores (donde $A$ no es invertible), la integral se evalúa término a término expandiendo la serie de Taylor de la matriz exponencial:

$$\Phi = I + A T_s + \frac{A^2 T_s^2}{2!} + \dots$$
$$\Gamma = \left( I T_s + \frac{A T_s^2}{2!} + \frac{A^2 T_s^3}{3!} + \dots \right) B$$

## 2. Asignación de Polos en Tiempo Discreto
La ley de control por realimentación de estados del vector de estado completo se define como:

$$u[k] = -K_d x[k] = - \begin{bmatrix} K_{d1} & K_{d2} \end{bmatrix} \begin{bmatrix} x_1[k] \\ x_2[k] \end{bmatrix}$$

Al sustituir esta ley en la ecuación de estado discreta, se obtiene el sistema en lazo cerrado:

$$x[k+1] = (\Phi - \Gamma K_d) x[k]$$

La dinámica y estabilidad del lazo cerrado dependerán de los autovalores de la matriz de lazo cerrado $(\Phi - \Gamma K_d)$. Si el sistema es completamente controlable (rango de la matriz de controlabilidad $M_c$ igual a 2), es posible diseñar la matriz de ganancias $K_d$ para posicionar los autovalores en cualquier coordenada deseada dentro del círculo unitario del plano $Z$. 

El diseño se realiza mapeando los polos deseados del plano $S$ ($s_i$) al plano $Z$ ($z_i$) mediante la ecuación:

$$z_i = e^{s_i T_s}$$

## 3. Estimación del Estado de Velocidad por Diferencias Retroactivas
Dado que el PLC solo tiene lectura directa del sensor óptico de posición (el contador de alta velocidad `HC0` representa el estado $x_1$), es necesario estimar digitalmente la velocidad instantánea ($x_2$) de la cinta. Esto se resuelve a nivel de programación implementando una aproximación por diferencia finita retroactiva de primer orden:

$$x_2[k] = \dot{x}_1(t) \approx \frac{x_1[k] - x_1[k-1]}{T_s}$$

Esta ecuación en diferencias representa un estimador discreto recursivo de un paso que calcula la velocidad a partir de la posición de la muestra actual $x_1[k]$ y la muestra de la iteración anterior $x_1[k-1]$ almacenada en la memoria del PLC.

## 4. Pre-compensación de la Referencia ($N$)
La realimentación de estados pura no garantiza que la salida siga el valor de referencia deseado en estado estacionario. Para eliminar el error en estado estacionario ante referencias escalón constantes, se introduce una ganancia de precompensación $N$ a la señal de referencia $r[k]$:

$$u[k] = N r[k] - K_d x[k]$$

Para que la ganancia estática de lazo cerrado del sistema sea unitaria ($y[\infty] = r[\infty]$), la ganancia de precompensación discreta $N_d$ se calcula formalmente como:

$$N_d = \frac{1}{C (I - (\Phi - \Gamma K_d))^{-1} \Gamma}$$


# Implementación de Hardware y Periféricos {#implementación-de-hardware-y-periféricos}

La realización física del lazo de control requirió la configuración precisa de los periféricos integrados en el PLC Siemens S7-200 (CPU 224XP CN) y la interfaz de potencia con el variador de frecuencia Powtran PI9100A.

## Configuración de Entradas de Conteo Rápido (HSC0) {#configuración-de-entradas-de-conteo-rápido-(hsc0)}

La retroalimentación de posición de la cinta transportadora se obtiene mediante un encoder incremental de cuadratura acoplado al eje de tracción. Debido a que las señales de pulso se generan a frecuencias del orden de kHz, se configuró el contador de alta velocidad integrado **HSC0** de la CPU:

* **Modo de Operación (Modo 9):** Se seleccionó el Modo 9, el cual utiliza dos fases de conteo en cuadratura (Fase A en la entrada física `I0.0` y Fase B en `I0.1`). Este modo detecta automáticamente el sentido de giro mediante el desfase de 90° entre fases, incrementando o decrementando el acumulador interno de 32 bits.  
* **Factor de Escalamiento:** Configurado en **1x**. El valor absoluto relativo de posición se almacena de forma asíncrona al ciclo de scan principal en el registro físico de doble palabra `HC0`.

![null][image76]  
*Figure 1\. Configuración del contador rápido.*

## Configuración del Muestreo Determinista (SMB34) {#configuración-del-muestreo-determinista-(smb34)}

Para garantizar la validez del análisis discreto y la consistencia en el cálculo del estimador de velocidad, es crítico que el periodo de muestreo sea estrictamente constante. Para ello:

* Se utilizó el byte de memoria especial **SMB34**, el cual controla la interrupción temporizada 0 del procesador.  
* Se cargó el valor de `10` en `SMB34`, configurando un intervalo regular exacto de **10 ms** ($T_s = 0.01\text{ s}$).
* Se enlazó el evento de interrupción número 10 (asociado a la expiración de este temporizador) a la rutina de servicio de interrupción **INT\_0** mediante la instrucción `ATCH`, habilitando globalmente las interrupciones con la instrucción `ENI`.

![null][image78]  
*Figure 2\. Configuración de la interrupción a 10 ms.*

## Conexión y Parámetros del Variador de Frecuencia {#conexión-y-parámetros-del-variador-de-frecuencia}

El variador Powtran PI9100A controla la velocidad y sentido de giro de un motor de reducción trifásico acoplado a la cinta. La comunicación analógica y digital desde las salidas por relé de la CPU se estructuró del siguiente modo:

* **Mando Digital (Modo de 2 Hilos Tipo 2):**  
  * Este modo independiza el control de marcha de la dirección.  
  * La salida digital `Q0.0` (Arranque/Paro) se cableó al terminal digital `DI1` del variador.  
  * La salida digital `Q0.1` (Sentido de Giro) se cableó al terminal `DI2` del variador.  
  * **Lógica de Terminales:** Se modificaron los parámetros del variador estableciendo el control por terminales externos (`F0.11 = 1`), lógica a 2 hilos tipo 2 (`F1.10 = 1`), entrada `DI1` asignada como Arranque/Paro (`F1.00 = 1`) y `DI2` como selector de giro (`F1.01 = 2`).  
* **Mando Analógico (Consigna de Velocidad):**  
  * La salida analógica de voltaje integrada de la CPU **AQW0** (0-10 V DC) se conectó físicamente a la entrada analógica **AI2** del variador, y el terminal `GND` de referencia del PLC al terminal `COM` del variador.  
  * En el PLC, la salida `AQW0` se controla escribiendo un valor entero en el rango de $0 \sim 32000$ unidades digitales, correspondiente linealmente a $0 \sim 10\text{ V}$.
  * Se configuró la referencia de frecuencia en el variador a través de `AI2` (`F0.03 = 3`), verificando físicamente el puente (jumper) selector de AI2 en la tarjeta del variador en la posición de voltaje (V). Los límites de frecuencia del variador se elevaron a **60.00 Hz** (`F0.19` y `F0.21`).

![null][image81]  
*Figure 3\. Cableado de las salidas digitales del PLC al VFC, para control bidireccional.*

# Metodología de Programación del Algoritmo de Control {#metodología-de-programación-del-algoritmo-de-control}

La lógica de control moderna en lazo cerrado fue implementada en el PLC utilizando una estructura de programación determinista, segura y modular en lenguaje de lista de instrucciones (STL/AWL). El motor del algoritmo reside de forma exclusiva dentro de la rutina de interrupción temporizada **INT_0**, garantizando que el cálculo de la acción se ejecuta de forma asíncrona exactamente cada $10\text{ ms}$.
## Verificación de Seguridad y Parada de Emergencia {#verificación-de-seguridad-y-parada-de-emergencia}

El primer paso de ejecución en cada interrupción es verificar la integridad del sistema. El programa monitorea la entrada física normalmente cerrada (NC) de la Seta de Emergencia (`I1.4`).

* **Mecanismo de Salto:** Si se detecta la apertura física del circuito de emergencia (señal lógica `I1.4` en cero), el programa interrumpe inmediatamente el flujo secuencial y realiza un salto incondicional a una etiqueta segura de emergencia.  
  ![null][image83]

*Figure 4\. Salto de seguridad.*

* **Rutina de Parada Segura:** Al producirse el salto por emergencia, el PLC ejecuta de forma prioritaria el apagado físico e inmediato del motor (`Q0.0` a cero), desactiva la bobina de dirección (`Q0.1` a cero) y escribe un valor absoluto de cero en la salida analógica de consigna (`AQW0`). Asimismo, resetea la memoria de velocidad y guarda la posición actual como referencia de parada. Este diseño físico-lógico garantiza que cualquier falla detenga instantáneamente la cinta transportadora antes de realizar cualquier cálculo matemático.  
  ![null][image84]

*Figure 5\. Destino del salto de seguridad.*  
![null][image85]  
*Figure 6\. Ejecución de la parada segura.*

## Lectura y Conversión Digital de Posición {#lectura-y-conversión-digital-de-posición}

Si las condiciones de seguridad son óptimas (Seta activa en uno), el algoritmo inicia la adquisición del primer estado físico ($x_1$, posición de la cinta):

* **Búfer Intermedio de Datos:** Para evitar errores de inconsistencia de datos debido al conteo rápido que ocurre de forma paralela y asíncrona, el programa lee el valor actual de 32 bits de `HC0` y lo copia de inmediato en un búfer intermedio de la memoria del procesador (acumulador `AC0`).  
* **Conversión a Punto Flotante:** Utilizando este búfer protegido, se aplica la instrucción de conversión directa de doble entero a real (`DTR`). El resultado es una variable en coma flotante de 32 bits representativa de la posición actual en cuentas, almacenada en la dirección de memoria `VD100`.

![null][image87]  
*Figure 7\. Lectura y conversión a flotante de la posición.*

## Estimación Dinámica de la Velocidad {#estimación-dinámica-de-la-velocidad}

Al no contar con un sensor físico de velocidad, el segundo estado ($x_2$, velocidad en cuentas/s) se estima mediante la derivada numérica por diferencias hacia atrás:
*   **Cálculo Dinámico:** El programa realiza la resta algebraica en coma flotante de la posición actual (`VD100`) menos la posición registrada en la iteración previa del ciclo anterior, almacenada en `VD104`.
*   **Escalamiento Temporal:** El diferencial de posición resultante es multiplicado por la constante en coma flotante `100.0`. Esta operación es matemáticamente equivalente a dividir la señal entre el periodo de muestreo exacto del lazo ($T_s = 0.01\text{ s}$), lo cual amplifica correctamente la escala temporal y entrega una estimación precisa de la velocidad actual en cuentas por segundo, almacenada en `VD108`.

![null][image90]  
*Figure 8\. Cálculo de la velocidad mediante derivada numérica.*

## Ejecución de la Ley de Realimentación de Estados {#ejecución-de-la-ley-de-realimentación-de-estados}

Una vez cargados y calculados ambos estados ($x_1$ en `VD100` y $x_2$ en `VD108`), el programa procesa la ley de control moderna completa:
*   **Cálculo en Coma Flotante:** La ley de control se procesa secuencialmente en dos etapas para optimizar el uso de los registros acumuladores aritméticos.
    *   **Etapa 1:** Se multiplica la ganancia de precompensación teórica $N$ (`VD132`) por la referencia de posición o Setpoint (`VD112`). A este resultado se le resta el producto de la ganancia de posición $K_1$ (`VD120`) por la posición actual $x_1$ (`VD100`).
    *   **Etapa 2:** Al valor acumulado temporal de la etapa anterior se le resta aritméticamente el producto de la ganancia de velocidad $K_2$ (`VD124`) por la velocidad estimada actual $x_2$ (`VD108`).
*   La acción de control resultante ($u$, que representa la señal calculada para lazo cerrado) se almacena en la variable de coma flotante `VD116`.

![null][image97]![null][image98]  
*Figure 10\. Ejecución de la Ley de Control en dos pasos.*

## Mapeo Bidireccional de Dirección por Signo {#mapeo-bidireccional-de-dirección-por-signo}

Dado que la acción de control u puede ser tanto positiva (marcha hacia adelante) como negativa (marcha en sentido inverso), se implementó un decodificador lógico de dirección basado en comparaciones flotantes:

* **Marcha Adelante (Forward):** Si el valor de u en `VD116` es mayor o igual a cero, el PLC desactiva la salida digital de sentido de giro (`Q0.1` a cero, Forward) y transfiere directamente el valor calculado a la variable de magnitud `VD128`.  
  ![null][image99]

*Figure 11\. Accionamiento del variador, caso avance.*

* **Marcha Atrás (Reverse):** Si el valor de u en `VD116` es menor a cero, el PLC activa la salida digital de dirección (`Q0.1` a uno, Reverse) y transfiere la acción calculada a la variable `VD128`, multiplicándola por la constante `-1.0` para obtener su magnitud absoluta en coma flotante.  
  ![null][image100]

*Figure 12\. Accionamiento del variador, caso retroceso.*

## Tratamiento de Magnitud, Saturación y Escritura Analógica {#tratamiento-de-magnitud,-saturación-y-escritura-analógica}

El último bloque lógico procesa el acondicionamiento numérico y físico de la magnitud absoluta de control (`VD128`):

* **Saturación de Seguridad:** Para evitar que la señal de control supere los límites físicos del hardware (el variador solo recibe consignas analógicas equivalentes a un máximo de 10V), se compara la magnitud en `VD128` contra el límite flotante de `32000.0`. Si el cálculo supera este valor, el algoritmo satura y escribe exactamente `32000.0` en la variable.  
  ![null][image101]

*Figure 13\. Saturación de seguridad.*

* **Conversión Segura a Entero:** La variable resultante de coma flotante se redondea a un valor de doble entero de 32 bits utilizando la instrucción `ROUND` sobre el acumulador `AC0`. Posteriormente, mediante la instrucción `DTI` (Double Integer to Integer), se reduce la escala numérica de forma segura a un valor entero de 16 bits en `AC1`. Esta conversión en cascada mediante registros intermedios del sistema impide de forma absoluta cualquier error de desbordamiento de memoria (*overflow*) que pudiese colgar el procesador del PLC.  
* **Salida Analógica y Zona Muerta:** El entero de 16 bits se escribe finalmente en la salida analógica física `AQW0`. Adicionalmente, si la magnitud analógica calculada supera una zona muerta de umbral mínimo de `100` unidades, se setea de forma automática la salida digital de marcha del motor (`Q0.0` a uno, RUN); caso contrario, si cae por debajo del umbral, se apaga de inmediato la señal de marcha (`Q0.0` a cero, STOP).  
  ![null][image102]

*Figure 14\. Conversión a entero para salida analógica.*

* **Cierre de Ciclo:** Al finalizar, el valor de la posición actual flotante (`VD100`) se copia en el registro de posición anterior (`VD104`), sirviendo de memoria para el cálculo de velocidad de la siguiente interrupción, finalizando la rutina mediante la instrucción de retorno condicional de interrupción `CRETI`.  
  ![null][image103]

*Figure 15\. Cierre de ciclo: Guardar posición actual como anterior.*

# Modelado Matemático y Diseño de Controladores {#modelado-matemático-y-diseño-de-controladores}

Esta sección presenta el desarrollo matemático formal aplicado para discretizar el modelo dinámico de la cinta transportadora y diseñar las ganancias de realimentación de estados completos utilizando asignación de polos. Se contrastan los enfoques de diseño continuo discretizado y diseño directo en el dominio discreto Z.

## Discretización del Modelo Dinámico de la Planta {#discretización-del-modelo-dinámico-de-la-planta}

El modelo continuo identificado en el Laboratorio 4 en sentido Adelante (Forward), que conserva una interpretación cinemática física directa en sus variables de estado (posición y velocidad), se describe por:

$$\dot{x}(t) = \begin{bmatrix} 0.0000 & 1.0000 \\ 0.0000 & -3.7638 \end{bmatrix} x(t) + \begin{bmatrix} 0.0000 \\ 0.1642 \end{bmatrix} u(t)$$
$$y(t) = \begin{bmatrix} 1 & 0 \end{bmatrix} x(t)$$

Para un periodo de muestreo determinista de $T_s = 10\text{ ms}$ ($T_s = 0.01\text{ s}$), calculamos las matrices discretas por el método de Retenedor de Orden Cero (ZOH):

$$\Phi = e^{A T_s} = \sum_{k=0}^{\infty} \frac{A^k T_s^k}{k!} = I + A T_s + \frac{A^2 T_s^2}{2!} + \dots$$
$$\Gamma = \left( \sum_{k=0}^{\infty} \frac{A^k T_s^{k+1}}{(k+1)!} \right) B = \left( I T_s + \frac{A T_s^2}{2!} + \frac{A^2 T_s^3}{3!} + \dots \right) B$$

Sustituyendo los valores de las matrices continuas $A$ y $B$, y truncando la serie exponencial al cuarto orden (o mediante cálculo directo en MATLAB), obtenemos las matrices de transición de estado y de entrada discreta:

$$\Phi = \begin{bmatrix} 1.0000 & 0.0098 \\ 0.0000 & 0.9631 \end{bmatrix}$$
$$\Gamma = \begin{bmatrix} 0.0000 \\ 0.0016 \end{bmatrix}$$

## Requerimientos Dinámicos y Ubicación de Polos {#requerimientos-dinámicos-y-ubicación-de-polos}

Para cumplir con los requerimientos dinámicos en lazo cerrado sobre la cinta (amortiguamiento crítico, prevención de sobreimpulsos mecánicos que deslicen las piezas y un tiempo de asentamiento de asentamiento rápido cercano a $1\text{ s}$), se determinó ubicar los polos deseados del sistema continuo en:

$$p_s = \begin{bmatrix} -4.0 \\ -4.1 \end{bmatrix} \text{ rad/s}$$

Utilizando la transformación discreta $z = e^{s T_s}$ con $T_s = 0.01\text{ s}$, estos polos continuos mapean en el plano discreto $Z$ a las coordenadas:

$$p_z = \begin{bmatrix} e^{-4.0 \cdot 0.01} \\ e^{-4.1 \cdot 0.01} \end{bmatrix} = \begin{bmatrix} 0.9608 \\ 0.9598 \end{bmatrix}$$

## Diseño de Controladores {#diseño-de-controladores}

### Controlador A: Diseño Continuo Discretizado {#controlador-a:-diseño-continuo-discretizado}

En este enfoque convencional, el diseño de la realimentación de estados se realiza exclusivamente en el plano continuo $S$, y las ganancias obtenidas se inyectan directamente en el algoritmo digital del PLC:
*   **Ganancias de Realimentación Continuas ($K_c$):** Utilizando el comando `place(A, B, p_s)` en MATLAB, se resuelve la ecuación característica del sistema continuo:
    $$\det(sI - (A - B K_c)) = (s + 4.0)(s + 4.1)$$
    Obteniendo las ganancias teóricas:
    $$K_c = \begin{bmatrix} 99.8782 & 26.4080 \end{bmatrix}$$
*   **Pre-compensación Continua ($N_a$):** Se calcula para asegurar error nulo en régimen estacionario ante referencias escalón constantes:
    $$N_a = \frac{-1}{C (A - B K_c)^{-1} B} = 99.8782$$

### Controlador B: Diseño Directo en el Dominio Discreto (Plano Z) {#controlador-b:-diseño-directo-en-el-dominio-discreto-(plano-z)}

Este enfoque moderno realiza la asignación de polos directamente en el plano discreto $Z$ utilizando las matrices discretizadas por ZOH ($\Phi$ y $\Gamma$), lo cual incorpora intrínsecamente la dinámica y el retardo del retenedor digital en el cálculo de las ganancias:
*   **Ganancias de Realimentación Discretas ($K_d$):** Resolviendo el polinomio característico discreto mediante `place(Phi, Gamma, p_z)` en MATLAB:
    $$\det(zI - (\Phi - \Gamma K_d)) = (z - 0.9608)(z - 0.9598)$$
    Obteniendo las ganancias teóricas de diseño:
    $$K_d = \begin{bmatrix} 97.7436 & 25.8460 \end{bmatrix}$$
*   **Pre-compensación Discreta ($N_d$):** Calculada directamente a partir del teorema de valor final discreto:
    $$N_d = \frac{1}{C (I - (\Phi - \Gamma K_d))^{-1} \Gamma} = 97.7436$$

## Simulación y Comparación de Desempeño Teórico {#simulación-y-comparación-de-desempeño-teórico}

Para evaluar el comportamiento de lazo cerrado, se simuló la respuesta de ambos controladores ante una entrada escalón de posición de referencia de $1000$ cuentas de encoder en MATLAB (`diseno_controladores.m`).

*   **Resultados de la Simulación:**
    *   **Controlador A (Continuo Discretizado - Kc):** Exhibe una respuesta estable y veloz, pero con un levísimo sobreimpulso transitorio debido a que la discretización directa no compensa en su totalidad el efecto de muestreo e inercia digital.
    *   **Controlador B (Diseño en Z - Kd):** Presenta una respuesta perfectamente suave, críticamente amortiguada, con un tiempo de asentamiento exacto de $1.2\text{ s}$ y **cero sobreimpulso**, adaptándose de manera óptima a las discretizaciones por retención (ZOH) del PLC real.

![null][image131]  
*Figure 16\. Simulación comparativa: Caso Contínuo Discretizado (rojo) y Discreto Puro (azul).*

La comparación teórica valida que el **diseño directo en el dominio discreto (Plano Z)** ofrece un desempeño dinámico superior y más robusto para la implementación física sobre el procesador industrial del PLC.

# Análisis de Resultados Experimentales y Validación {#análisis-de-resultados-experimentales-y-validación}

Esta sección discute el desempeño experimental de los algoritmos de control modernos validados directamente en la planta física real de la Unidad de Selección. Se evalúan los ensayos de regulación transitoria y la respuesta de rechazo ante perturbaciones mecánicas externas.

## Pruebas de Regulación (Control de Posición) {#pruebas-de-regulación-(control-de-posición)}

Para verificar la efectividad del posicionamiento en lazo cerrado, se realizaron pruebas tipo escalón utilizando como consignas o Setpoints las coordenadas reales de las tres rampas de clasificación de la Unidad de Selección:
*   **Rampa 1 (Metálicos):** Setpoint a **$710$ cuentas** de encoder.
*   **Rampa 2 (Mixtos):** Setpoint a **$1150$ cuentas** de encoder.
*   **Rampa 3 (Plásticos):** Setpoint a **$1520$ cuentas** de encoder.

Los ensayos se dividieron en dos dinámicas diferenciadas modificando las ganancias inyectadas al PLC:

### Dinámica A: Controlador Diseñado en Z ($K_d$) {#dinámica-a:-controlador-diseñado-en-z-()}

Utilizando las ganancias teóricas calculadas en el plano discreto ($K_1 = 97.74$, $K_2 = 25.85$, $N = 97.74$), la cinta transportadora real exhibió un comportamiento excelente:
*   **Comportamiento Dinámico:** El carro y la cinta aceleran de forma controlada y desaceleran suavemente a medida que se aproximan a la rampa seleccionada.
*   **Asentamiento:** Se alcanzó la estabilidad posicional en un tiempo promedio de **$1.2\text{ s}$**, sin oscilaciones residuales ni sobreimpulsos. Esto validó de forma práctica el diseño críticamente amortiguado del lazo.
*   **Precisión Estacionaria:** La cinta se detuvo exactamente en la coordenada teórica con un error estacionario nulo (desviación de $\pm 1$ cuenta, mecánicamente despreciable), demostrando la precisión del factor de precompensación $N_d$.
### Dinámica B: Ajuste Subamortiguado (Respuesta Oscilatoria) {#dinámica-b:-ajuste-subamortiguado-(respuesta-oscilatoria)}

Para evaluar la sensibilidad del lazo de realimentación y constatar los límites de estabilidad, se inyectaron alternativamente en el PLC ganancias modificadas diseñadas para forzar polos dominantes con un coeficiente de amortiguamiento muy bajo.
*   **Respuesta en Planta:** Al aplicar los mismos Setpoints, la cinta transportadora real respondió de forma agresiva y subamortiguada:
    *   La cinta aceleró con alta velocidad y sobrepasó de forma notable la coordenada de setpoint (sobreimpulso mecánico de más de $150$ cuentas).
    *   Al detectar el error inverso, el controlador cambió la dirección de giro del variador (`Q0.1` a uno, retroceso) frenando enérgicamente y oscilando físicamente alrededor del destino varias veces antes de estabilizarse por completo.
*   **Conclusión del Ensayo:** Esta prueba comprobó de forma práctica que las variaciones paramétricas de la realimentación de estados se traducen directamente en la dinámica física esperada por el modelado, permitiendo validar las predicciones teóricas en la planta real.

## Pruebas de Rechazo de Perturbaciones (Rigidez del Lazo) {#pruebas-de-rechazo-de-perturbaciones-(rigidez-del-lazo)}

El rechazo de perturbaciones es un indicador fundamental de la robustez de un controlador digital. El ensayo consistió en introducir una perturbación de posición forzada manualmente sobre la cinta transportadora en estado de régimen permanente (estando la cinta detenida en una consigna fija):

* **Resistencia y Rigidez de Control:** Al intentar girar o desplazar manualmente la polea de la cinta transportadora para sacarla del setpoint, se experimentó una **gran oposición física**. El sistema variador-motor se resistió con notable fuerza a los cambios de posición. Esto se debe a que pequeños desplazamientos del encoder disparan de forma instantánea un incremento proporcional en la acción de control ($K_1 \cdot x_1$), elevando el voltaje en la salida analógica `AQW0` para energizar el motor en sentido opuesto y compensar el torque manual.  
* **Recuperación Posicional:** Al aplicar suficiente fuerza para vencer momentáneamente la rigidez de control y desplazar la cinta unas cuantas cuentas de encoder, se observó que, en el instante preciso de liberar la banda transportadora del torque manual, el lazo de control moderno actuó de forma sumamente enérgica y rápida, impulsando el motor para **retornar la cinta de inmediato a su punto de consigna original** con error estacionario cero.

# Conclusiones y Recomendaciones {#conclusiones-y-recomendaciones}

## Conclusiones {#conclusiones}

*   **Verificación del Comportamiento Real frente a la Simulación:** Se validó de forma sobresaliente el cumplimiento de los objetivos dinámicos de lazo cerrado. La cinta transportadora real bajo la ley de control del **diseño directo en Z ($K_d$)** alcanzó la estabilidad en un tiempo de asentamiento de **$1.2\text{ s}$ sin sobreimpulsos ni oscilaciones**, correspondiéndose casi perfectamente con el transitorio críticamente amortiguado de $1.2\text{ s}$ obtenido en la simulación digital de MATLAB.
*   **Exactitud en el Posicionamiento Estacionario:** La calibración del factor de precompensación discreto $N_d$ (teórico de $97.7436$) implementado en el PLC garantizó error estacionario nulo en la planta real ante los tres setpoints de las rampas ($710$, $1150$ y $1520$ cuentas), logrando detener la cinta transportadora en la coordenada exacta requerida en régimen permanente con una desviación máxima de $\pm 1$ cuenta, lo cual se corresponde con el comportamiento teórico esperado.
*   **Validación de la Sensibilidad Dinámica (Subamortiguada):** La prueba experimental alternativa, donde se inyectaron ganancias modificadas en el PLC para obtener polos subamortiguados, confirmó la aparición de oscilaciones transitorias físicas y sobrepasos mecánicos de más de $150$ cuentas en la cinta real, validando la sensibilidad del modelo e identificando de forma práctica la correspondencia entre los autovalores teóricos en lazo cerrado del plano Z y el comportamiento de la planta.
*   **Eficacia y Robustez de la Estimación de Velocidad:** La aproximación discreta de primer orden por diferencias retroactivas programada en el PLC demostró ser un estimador dinámico robusto y rápido. Logró suministrar de forma determinista y estable la señal del segundo estado ($x_2$, velocidad instantánea) requerida para la ley de realimentación en coma flotante cada $10\text{ ms}$, prescindiendo de un sensor de velocidad físico.
*   **Seguridad y Confiabilidad Numérica:** El diseño de seguridad del algoritmo en el PLC (saturación estricta de control a $32000$ y monitoreo inmediato por salto de la seta de emergencia `I1.4`) protegió de forma absoluta la integridad mecánica de la planta durante las pruebas subamortiguadas y los y los ensayos de perturbación de torque manual, mientras que las conversiones numéricas en cascada (`ROUND` y `DTI` mediante registros intermedios `AC0` y `AC1`) eliminaron cualquier posibilidad de desbordamiento en el procesador.

## Recomendaciones {#recomendaciones}

* **Mantener el Muestreo Determinista a 10 ms:** Se recomienda no modificar el valor de `10` en `SMB34` ni alterar la estructura de interrupción en la CPU 224XP CN. Incrementar el periodo de muestreo degradaría el cálculo de la derivada digital de velocidad, incrementando el error dinámico de lazo cerrado, mientras que reducirlo por debajo de 5 ms podría saturar el tiempo de procesamiento de la CPU.  
* **Asegurar Tensión Mecánica en la Correa de Tracción:** Debido a que el estimador de velocidad asume una transmisión rígida entre el eje del motor (donde está el encoder) y la cinta, cualquier holgura o deslizamiento físico en la banda transportadora introduciría un retardo de fase no modelado, lo cual podría desencadenar pequeñas vibraciones estacionarias. Se aconseja verificar la tensión de la correa regularmente.  
* **Considerar un Filtro Digital Paso-Bajo para la Velocidad:** Si en futuras integraciones de la planta se requiere operar a frecuencias de muestreo más rápidas o ante referencias dinámicas variables (como rampas rápidas de aceleración), se sugeriere implementar un filtro digital paso-bajo (IIR de primer orden) en el cálculo de la velocidad (`VD108`) en el PLC, para suavizar el ruido de cuantización inherente a la derivada numérica.

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
[image53]: imagenes/image53.png
[image54]: imagenes/image54.png
[image55]: imagenes/image55.png
[image56]: imagenes/image56.png
[image57]: imagenes/image57.png
[image58]: imagenes/image58.png
[image59]: imagenes/image59.png
[image60]: imagenes/image60.png
[image61]: imagenes/image61.png
[image62]: imagenes/image62.png
[image63]: imagenes/image63.png
[image64]: imagenes/image64.png
[image65]: imagenes/image65.png
[image66]: imagenes/image66.png
[image67]: imagenes/image67.png
[image68]: imagenes/image68.png
[image69]: imagenes/image69.png
[image70]: imagenes/image70.png
[image71]: imagenes/image71.png
[image72]: imagenes/image72.png
[image73]: imagenes/image73.png
[image74]: imagenes/image74.png
[image75]: imagenes/image75.png
[image76]: imagenes/image76.png
[image77]: imagenes/image77.png
[image78]: imagenes/image78.png
[image79]: imagenes/image79.png
[image80]: imagenes/image80.png
[image81]: imagenes/image81.png
[image82]: imagenes/image82.png
[image83]: imagenes/image83.png
[image84]: imagenes/image84.png
[image85]: imagenes/image85.png
[image86]: imagenes/image86.png
[image87]: imagenes/image87.png
[image88]: imagenes/image88.png
[image89]: imagenes/image89.png
[image90]: imagenes/image90.png
[image91]: imagenes/image91.png
[image92]: imagenes/image92.png
[image93]: imagenes/image93.png
[image94]: imagenes/image94.png
[image95]: imagenes/image95.png
[image96]: imagenes/image96.png
[image97]: imagenes/image97.png
[image98]: imagenes/image98.png
[image99]: imagenes/image99.png
[image100]: imagenes/image100.png
[image101]: imagenes/image101.png
[image102]: imagenes/image102.png
[image103]: imagenes/image103.png
[image104]: imagenes/image104.png
[image105]: imagenes/image105.png
[image106]: imagenes/image106.png
[image107]: imagenes/image107.png
[image108]: imagenes/image108.png
[image109]: imagenes/image109.png
[image110]: imagenes/image110.png
[image111]: imagenes/image111.png
[image112]: imagenes/image112.png
[image113]: imagenes/image113.png
[image114]: imagenes/image114.png
[image115]: imagenes/image115.png
[image116]: imagenes/image116.png
[image117]: imagenes/image117.png
[image118]: imagenes/image118.png
[image119]: imagenes/image119.png
[image120]: imagenes/image120.png
[image121]: imagenes/image121.png
[image122]: imagenes/image122.png
[image123]: imagenes/image123.png
[image124]: imagenes/image124.png
[image125]: imagenes/image125.png
[image126]: imagenes/image126.png
[image127]: imagenes/image127.png
[image128]: imagenes/image128.png
[image129]: imagenes/image129.png
[image130]: imagenes/image130.png
[image131]: imagenes/image131.png
[image132]: imagenes/image132.png
[image133]: imagenes/image133.png
[image134]: imagenes/image134.png
[image135]: imagenes/image135.png
[image136]: imagenes/image136.png
[image137]: imagenes/image137.png
[image138]: imagenes/image138.png
[image139]: imagenes/image139.png
[image140]: imagenes/image140.png
[image141]: imagenes/image141.png
[image142]: imagenes/image142.png
[image143]: imagenes/image143.png
[image144]: imagenes/image144.png
[image145]: imagenes/image145.png
[image146]: imagenes/image146.png
[image147]: imagenes/image147.png
[image148]: imagenes/image148.png
[image149]: imagenes/image149.png
[image150]: imagenes/image150.png
[image151]: imagenes/image151.png
[image152]: imagenes/image152.png
[image153]: imagenes/image153.png
[image154]: imagenes/image154.png
[image155]: imagenes/image155.png
[image156]: imagenes/image156.png