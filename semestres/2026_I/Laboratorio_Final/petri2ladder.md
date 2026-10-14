**Guía Técnica: Implementación de Redes de Petri en Lenguaje Ladder**

Para un programador de PLCs, las Redes de Petri de Control Interpretadas (CIPN) ofrecen un marco estructurado y matemático para diseñar sistemas de eventos discretos concurrentes. En esta topología, los **lugares (plazas)** representan las condiciones necesarias para ejecutar un proceso, las **transiciones** representan los eventos del programa, y las **marcas (fichas o testigos)** indican que la condición está activa o validada.

La conversión directa de una Red de Petri a código Ladder se realiza dividiendo el programa en **cinco módulos secuenciales**, los cuales se basan en la matriz de incidencia y la ecuación de estado de la red para evitar el efecto avalancha y asegurar el determinismo.

**Arquitectura del Programa Ladder (5 Módulos)**

**1. Módulo de Inicialización**
Este módulo se encarga de definir el marcado inicial de la red y se ejecuta exclusivamente durante el **primer ciclo de escaneo (scan cycle)**.
*   **Implementación:** Se utiliza una variable binaria interna con un contacto normalmente cerrado (NC) que energiza las bobinas asociadas a los lugares seguros (que inician con un solo token) utilizando bobinas "SET". Para lugares que requieren múltiples tokens iniciales, se utilizan bloques de adición (ADD). Una vez finalizado el primer ciclo, este contacto se abre, deshabilitando el módulo.

**2. Módulo de Eventos**
Gestiona las interacciones con el entorno físico detectando los flancos de subida (rising edge) o bajada (falling edge) de las señales de los sensores.
*   **Implementación:** Como algunos PLCs solo mantienen la señal lógica real durante un ciclo en las detecciones de nivel, se propone usar asociaciones de contactos normalmente abiertos (NO) y normalmente cerrados (NC) junto con bobinas SET y RESET para capturar adecuadamente la transición del evento en el ciclo actual.

**3. Módulo de Condiciones de Disparo (Firing Conditions)**
Contiene la lógica ("receptividades") que define cuándo una transición está habilitada (enabled) y puede dispararse (fire). Depende de la matriz de incidencia previa (lugares de entrada).
*   **Regla de Disparo:** Una transición es ejecutable si el número de marcas en sus lugares de entrada es mayor o igual al peso de los arcos que los conectan.
*   **Implementación:** Para lugares con capacidad de una marca, se usan simples contactos NO. Para lugares con más de una marca, se emplean instrucciones de comparación matemática (ej. $p_i \ge w$).
*   **Transiciones Temporizadas:** Si la transición tiene un retardo, se utiliza un bloque temporizador (Timer). La transición se habilita cuando el temporizador finaliza, y este último se resetea al perder su valor acumulado si se abre la lógica.
*   **Manejo de Conflictos:** Si dos transiciones compiten por una misma marca (conflicto efectivo), debes establecer una prioridad. Esto se programa garantizando que las condiciones (receptividades) sean mutuamente excluyentes o forzando un orden de evaluación en las líneas de código Ladder (rungs).

**4. Módulo de Dinámica de la Red**
Este es el motor de actualización del estado. Una vez que se dispara una transición, se debe recalcular el número de tokens en la red restando marcas de las plazas de origen y sumando en las de destino, según la matriz de incidencia de la red.
*   **Implementación:** El módulo tiene un escalón (rung) asociado a cada transición del sistema. Cuando ocurre el disparo, las bobinas asumen los cambios en el marcado. Se emplean funciones matemáticas (ADD, SUB) o bobinas SET y RESET según la cantidad de tokens a manipular en cada lugar afectado.

**5. Módulo de Acciones**
En este paso final, se asignan los estados lógicos internos de los lugares a las salidas físicas (bobinas de salida) del PLC.
*   **Acciones de Nivel (Level action):** Se asocia directamente un contacto NO del lugar a la bobina de la salida. La salida estará activa mientras el lugar contenga una marca.
*   **Acciones de Impulso (Impulse action):** Son acciones que solo deben ocurrir durante un único ciclo de escaneo del PLC. Para programarlas, se introduce una variable binaria interna de control. Cuando el lugar recibe el token, se activa una bobina SET de esta variable interna. En el siguiente ciclo de escaneo, un contacto NC de esta misma variable se abre, garantizando que la salida se deshabilite tras ese único ciclo.

**Consideraciones de Diseño para el Programador:**
*   Al emplear esta estructura en cascada, garantizas que **el "efecto avalancha" sea evitado de forma natural**. El efecto avalancha ocurre típicamente si el código evalúa transiciones sucesivas en el mismo ciclo, disparándolas juntas erróneamente.
*   El diseño asegura que el marcado de la red permanezca estático e invariable al menos durante un ciclo de lectura completo de las entradas.