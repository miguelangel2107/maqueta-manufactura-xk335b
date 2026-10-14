**Universidad Mayor de San Andrés**  
**Facultad de Ingeniería**  
**Ingeniería Electrónica**  
![NO\_CAPTION null][image1]  
**Informe de laboratorio N°8**  
**“Control Óptimo”**

**Asignatura:** 		  
Aplicación de Técnicas de Control \- ETN 1034  
**Docente:**				  
Ing. Jorge Antonio Nava Amador  
**Auxiliares:**

- Aux. Limber Ajnota Cahuaya (ETN1034)

**Integrantes Grupo Planta de manufactura:**	

- Univ. Herrera Tola Gabriel Sebastian (ETN1034)  
- Univ. Mamani Tola José Aldin (ETN1034)


**Fecha de presentación:**	30/06/26

La Paz \- Bolivia

[**Resumen	3**](#resumen)

[**Objetivos	3**](#objetivos)

[Objetivo General	3](#objetivo-general)

[Objetivos Específicos	3](#objetivos-específicos)

[**Fundamento Teórico	3**](#fundamento-teórico)

[Representación en Espacio de Estados	4](#representación-en-espacio-de-estados)

[Discretización del Sistema (ZOH)	4](#discretización-del-sistema-\(zoh\))

[Análisis de Lyapunov de Estabilidad Interna	4](#análisis-de-lyapunov-de-estabilidad-interna)

[Controlabilidad y Observabilidad	4](#controlabilidad-y-observabilidad)

[El Observador de Luenberger y la Ley de Control	4](#el-observador-de-luenberger-y-la-ley-de-control)

[**Configuración de Hardware y Periféricos	5**](#configuración-de-hardware-y-periféricos)

[**Diseño y Simulación	5**](#diseño-y-simulación)

[Cálculo Analítico de Matrices Discretas	5](#cálculo-analítico-de-matrices-discretas)

[Ganancia del Controlador (K) y Precompensación (N)	5](#ganancia-del-controlador-\(k\)-y-precompensación-\(n\))

[Ganancia del Observador (L)	6](#ganancia-del-observador-\(l\))

[Archivo de Simulación en MATLAB	6](#archivo-de-simulación-en-matlab)

[**Metodología de Programación en el PLC	6**](#metodología-de-programación-en-el-plc)

[Diagrama de Flujo del Algoritmo	6](#diagrama-de-flujo-del-algoritmo)

[Descripción de la Programación en el PLC	6](#descripción-de-la-programación-en-el-plc)

[**Resultados Experimentales	7**](#resultados-experimentales)

[Procedimiento de Exportación y Gráficas de Memoria del PLC	7](#procedimiento-de-exportación-y-gráficas-de-memoria-del-plc)

[Análisis del Transitorio y Desempeño	8](#análisis-del-transitorio-y-desempeño)

[Tabla Comparativa de Resultados	8](#tabla-comparativa-de-resultados)

[**Conclusiones	8**](#conclusiones)

[**Referencias	9**](#referencias)

# Resumen {#resumen}

Este informe describe el diseño, simulación e implementación de una estrategia de Control Óptimo Discreto (LQR/DLQR) aplicada al sistema motor-cinta-encoder de la Unidad de Selección de la planta de manufactura flexible, usando el PLC Siemens S7-200 (CPU 224XP CN). El diseño se fundamenta en la metodología del Capítulo 9 del libro de Braslavsky, partiendo del mismo modelo en espacio de estados validado experimentalmente en el Laboratorio 4\.

A diferencia del controlador por asignación de polos (Ackermann) del laboratorio 7, donde los polos se eligen arbitrariamente, el regulador lineal cuadrático minimiza sistemáticamente la función de coste $$\\textstyle J \= \\sum (x^T Q x \+ u^T R u)$$, resolviendo la Ecuación Algebraica de Riccati Discreta (DARE). Con la sintonía $$Q \= C^{T}C$$, $$R \= 0.001$$ se obtuvo la ganancia óptima $$K \= \[31.44,\\; 7.23\]$$ con precompensación $$N \= 31.44$$, complementada con un observador de Luenberger heredado del anterior laboratorio y un filtro de Kalman estacionario para el estimador óptimo (LQG).

La validación experimental sobre la planta real, capturada mediante el datalogger embebido en la memoria V del PLC, confirmó que el controlador óptimo reduce el esfuerzo de actuación (pico de 31435 frente a la saturación completa de 32000 del Ackermann), aunque presenta un error en estado estacionario mayor (23 frente a 10 cuentas) debido a la ausencia de acción integral ante la zona muerta del variador Powtran. El pico de control experimental coincidió exactamente con el valor simulado, validando el modelo dinámico.

# Objetivos {#objetivos}

## Objetivo General {#objetivo-general}

Diseñar, simular e implementar un controlador óptimo cuadrático discreto (DLQR) sobre el sistema motor-cinta de la Unidad de Selección, minimizando una función de coste cuadrática que equilibre el desempeño transitorio y el esfuerzo de actuación, y validar experimentalmente su respuesta frente al controlador por asignación de polos del Laboratorio 7\.

## Objetivos Específicos {#objetivos-específicos}

* Formular la función de coste cuadrática $$\\textstyle J \= \\sum (x^T Q x \+ u^T R u)$$ en el dominio discreto y justificar la selección de las matrices de ponderación Q y R.  
* Resolver la Ecuación Algebraica de Riccati Discreta (DARE) para obtener la matriz S y calcular la ganancia óptima K mediante la condición de optimalidad de Bellman.  
* Comparar el controlador óptimo (LQR) frente a la asignación de polos (Ackermann), analizando el impacto en la señal de control y el tiempo de establecimiento.  
* Diseñar un filtro de Kalman discreto como estimador óptimo de estados, y combinarlo con el LQR para conformar un regulador LQG.  
* Validar experimentalmente el lazo de control sobre la planta real mediante el datalogger embebido en la memoria del PLC.

# Fundamento Teórico {#fundamento-teórico}

El control óptimo cuadrático constituye una evolución sobre el control moderno por realimentación de estados usado en el Laboratorio 7\. Mientras que la asignación de polos requiere que el diseñador elija arbitrariamente la ubicación de los polos en lazo cerrado, el enfoque LQR deriva la ley de control de la minimización de un índice de desempeño cuadrático, de modo que la ubicación de los polos resulta una consecuencia de la optimización y no un dato de entrada.

## Representación en Espacio de Estados {#representación-en-espacio-de-estados}

El sistema variador-motor-cinta se modela mediante el vector de estados $$x \= \[x\_1,\\; x\_2\]^{T}$$, donde $$x\_1$$ es la posición (cuentas de encoder) y $$x\_2$$ la velocidad (cuentas/segundo). El modelo continuo es:

$$\\dot{x}(t) \= A\\,x(t) \+ B\\,u(t), \\qquad y(t) \= C\\,x(t)$$  
$$A \= \\begin{bmatrix} 0 & 1   
0 & \-3.7638 \\end{bmatrix}, \\quad B \= \\begin{bmatrix} 0   
0.1642 \\end{bmatrix}, \\quad C \= \\begin{bmatrix} 1 & 0 \\end{bmatrix}$$

Este modelo es idéntico al identificado y validado experimentalmente en el Laboratorio 7\.

## Discretización del Sistema (ZOH) {#discretización-del-sistema-(zoh)}

Para su procesamiento en el PLC, las matrices continuas se discretizan mediante retenedor de orden cero (ZOH) con período de muestreo $$T\_s \= 0.01 \\text{ s}$$, el mismo controlado por el registro SMB34 de la CPU:

$$x\[k+1\] \= \\Phi\\,x\[k\] \+ \\Gamma\\,u\[k\], \\qquad y\[k\] \= C\\,x\[k\]$$

$$\\Phi \= \\begin{bmatrix} 1.000000 & 0.009814   
0.000000 & 0.963062 \\end{bmatrix}$$		$$\\Gamma \= \\begin{bmatrix} 8.108 \\times 10^{-6}   
1.611 \\times 10^{-3} \\end{bmatrix}$$

## Análisis de Lyapunov de Estabilidad Interna {#análisis-de-lyapunov-de-estabilidad-interna}

Los autovalores de $$\\Phi$$ son $$z \= 1.0$$ y $$z \= 0.9631$$. El polo en $$z \= 1$$ (equivalente a $$s \= 0$$ corresponde al integrador puro del sistema posición-velocidad, lo que indica que el sistema en lazo abierto es marginalmente estable. Aplicando el criterio de Lyapunov sobre la ecuación $$A^T P \+ P A \= \-Q$$ con $$Q \= I$$, la presencia del polo en el origen impide la existencia de una matriz $$P$$ definida positiva, confirmando analíticamente la marginalidad. En lazo cerrado con la ganancia óptima, los polos se desplazan estrictamente al interior del círculo unitario, y la ecuación de Lyapunov admite una solución $$P \> 0$$ única, garantizando estabilidad asintótica.

## Controlabilidad y Observabilidad {#controlabilidad-y-observabilidad}

La matriz de controlabilidad $$\\mathcal{C} \= \\begin{bmatrix} \\Gamma & \\Phi\\Gamma \\end{bmatrix}$$ tiene rango 2, por lo que el sistema es completamente controlable y sus polos pueden reubicarse libremente. La matriz de observabilidad $$\\mathcal{O} \= \\begin{bmatrix} C \\ C\\Phi \\end{bmatrix}$$ también tiene rango 2, confirmando que el sistema es completamente observable y que es posible estimar ambos estados internos midiendo únicamente la posición de salida. Ambas propiedades son prerrequisito para la existencia de soluciones únicas de la DARE del controlador y del filtro de Kalman.

## El Observador de Luenberger y la Ley de Control {#el-observador-de-luenberger-y-la-ley-de-control}

Dado que la planta sólo dispone del encoder incremental (sensor de posición), la velocidad debe estimarse mediante un observador. Se reutiliza el observador de Luenberger del Laboratorio 7, con ganancias $$L \= \[0.1919,\\; 0.6113\]^{T}$$, sin modificación. El estimador y la ley de control combinados son:

$$\\hat{x}\[k+1\] \= \\Phi\\,\\hat{x}\[k\] \+ \\Gamma\\,u\[k\] \+ L\\,(y\[k\] \- C\\,\\hat{x}\[k\])$$  
$$u\[k\] \= N\\,r\[k\] \- K\\,\\hat{x}\[k\]$$

La ganancia de realimentación $$K$$ se obtiene aquí por el método óptimo cuadrático (no por Ackermann), y $$N$$ es la precompensación que asegura seguimiento de referencia con error nulo en el modelo lineal ideal.

# Configuración de Hardware y Periféricos {#configuración-de-hardware-y-periféricos}

La integración física mantiene el conexionado del Laboratorio 7: el encoder incremental en las entradas rápidas I0.0/I0.1 leído por el contador HSC0 en modo cuadratura; el muestreo determinista de $$10\\,\\mathrm{ms}$$ vía SMB34 sobre la rutina de interrupción INT\_0; la seta de emergencia (NC) monitoreada en I1.4; y el variador Powtran PI9100A comandado por las salidas Q0.0 (marcha/paro), Q0.1 (sentido de giro) y la salida analógica AQW0 ($$0\\text{–}10\\,\\mathrm{V}$$, consigna de velocidad, escalada a $$\\pm 32000$$ unidades analógicas).

# Diseño y Simulación {#diseño-y-simulación}

## Cálculo Analítico de Matrices Discretas {#cálculo-analítico-de-matrices-discretas}

El diseño se codificó en el script de MATLAB dlqr8.m. Partiendo del modelo continuo, la función c2d con método 'zoh' y $$T\_s \= 0.01\\,\\mathrm{s}$$ produce las matrices discretas $$\\Phi$$ y $$\\Gamma$$ indicadas en la sección anterior. La verificación de controlabilidad y observabilidad ($$\\operatorname{rank} \= 2$$ en ambas) se realiza analíticamente al inicio del script. El programa estructura el diseño en siete partes: control LQ de horizonte finito (recursión de Riccati), control LQ de horizonte infinito (DARE), simulación comparativa, análisis del efecto de Q y R, filtro de Kalman, y combinación LQG.

## Ganancia del Controlador (K) y Precompensación (N) {#ganancia-del-controlador-(k)-y-precompensación-(n)}

El control óptimo cuadrático busca la ley de control que minimiza la función de coste de horizonte infinito, que pondera el error de estado frente al esfuerzo de actuación:

$$J \= \\sum\_{k=0}^{\\infty} \\left( x\[k\]^{T} Q\\, x\[k\] \+ u\[k\]^{T} R\\, u\[k\] \\right)$$

La minimización de J se obtiene resolviendo la Ecuación Algebraica de Riccati Discreta (DARE):

$$\\Phi^{T} S \\Phi \- S \- (\\Phi^{T} S \\Gamma)(R \+ \\Gamma^{T} S \\Gamma)^{-1}(\\Gamma^{T} S \\Phi) \+ Q \= 0$$

Con la sintonía Q \= CᵀC (que penaliza únicamente el error de posición) y R \= 0.001 (penalización reducida del esfuerzo, para priorizar velocidad de respuesta), la solución de la DARE es:

$$S \= \\begin{bmatrix} 95.9256 & 19.2580   
19.2580 & 4.4178 \\end{bmatrix}$$

El residuo de la DARE verificado en MATLAB es del orden de $$10^{-15}$$, confirmando la convergencia. La ganancia óptima se calcula a partir de la solución S mediante:

$$K \= (R \+ \\Gamma^{T} S \\Gamma)^{-1}\\, \\Gamma^{T} S \\Phi$$

Con la precompensación dada por la inversa de la ganancia estática en lazo cerrado:

$$N \= \\frac{1}{C\\,(I \- (\\Phi \- \\Gamma K))^{-1}\\,\\Gamma}$$

Los valores numéricos resultantes son:

$$K \= \\begin{bmatrix} 31.435009 & 7.232178 \\end{bmatrix}, \\qquad N \= 31.435009$$

Los polos en lazo cerrado resultantes de la optimización son $$z \= \[0.9851,\\; 0.9661\]$$, equivalentes a $$s \= \[-1.505,\\; \-3.450\]$$ en el plano continuo. Estos polos son consecuencia directa de la relación Q/R elegida, no de una especificación manual: esa es la diferencia fundamental con el método de Ackermann del Laboratorio 7\.

## Ganancia del Observador (L) {#ganancia-del-observador-(l)}

Para el lazo de estimación se mantiene el observador de Luenberger del Laboratorio 7 con $$L \= \[0.1919,\\; 0.6113\]^{T}$$. Adicionalmente, siguiendo la Sección 9.5 del libro, se diseñó un filtro de Kalman discreto como estimador óptimo bajo ruido estocástico. Modelando el ruido de proceso con $$G \= B$$, covarianza $$V \= 10^{5}$$ (perturbaciones mecánicas y zona muerta del variador) y el ruido de medición W \= 1 (resolución del encoder de ±1 cuenta), la ganancia estacionaria de Kalman obtenida con dlqe es:

$$L\_{\\infty} \= \\begin{bmatrix} 0.068526   
0.243223 \\end{bmatrix}$$

El filtro de Kalman equilibra automáticamente la velocidad de convergencia frente al rechazo del ruido del encoder; los polos del observador de Kalman se ubican en $$z \= 0.946 \\pm 0.045j \\quad (s \\approx \-5.43)$$.

## Archivo de Simulación en MATLAB {#archivo-de-simulación-en-matlab}

El script simula el lazo cerrado completo (planta \+ observador \+ controlador) con condiciones iniciales $$x(0) \= \[200,\\; 0\]^{T}$$ y referencia de 1000 cuentas. La comparativa entre el LQR óptimo y el Ackermann del Lab 7 se muestra a continuación.  
   
![][image2]  
*Figura 1\. Simulación MATLAB: respuesta de posición y esfuerzo de control del LQR vs Ackermann, zoom transitorio, y convergencia de la covarianza del filtro de Kalman.*

La simulación confirma que el LQR óptimo $$(R \= 0.001)$$ alcanza un tiempo de establecimiento de $$2.85\\,\\mathrm{s}$$ frente a $$1.51\\,\\mathrm{s}$$ del Ackermann, pero con una reducción del $$49.7\\%$$ en el índice ISE del esfuerzo de control ($$2.33 \\times 10^{8}$$ frente a $$4.63 \\times 10^{8}$$) y sin saturar completamente el actuador. (pico de 31435 frente a 32000).  
![][image3]

*Figura 2\. Comparación simulada de la respuesta de posición (izquierda) y la acción de control (derecha) para los tres controladores: asignación de polos (Ackermann, Lab 7), regulador óptimo LQR y regulador LQG (LQR \+ filtro de Kalman). Setpoint de 1000 cuentas, condición inicial $$x\_0 \= \[200,\\ 0\]^T$$.*

# Metodología de Programación en el PLC {#metodología-de-programación-en-el-plc}

## Diagrama de Flujo del Algoritmo {#diagrama-de-flujo-del-algoritmo}

La estructura secuencial ejecutada dentro de la interrupción temporizada de $$10\\,\\mathrm{ms}$$ (INT\_0) y el programa principal (MAIN) sigue el mismo esquema validado en el Laboratorio 7, adaptando únicamente las constantes de control a las nuevas ganancias óptimas. \[Pendiente: insertar diagrama de flujo del proyecto en Step 7, análogo al del laboratorio 7, con el bloque de ley de control actualizado a $$u \= N\\,r \- K\_{1}\\,\\hat{x}\_{1} \- K\_{2}\\,\\hat{x}\_{2}.$$

## Descripción de la Programación en el PLC {#descripción-de-la-programación-en-el-plc}

La programación se realiza en lenguaje AWL (Lista de Instrucciones), estructurada de forma determinista y modular, manteniendo la arquitectura del Laboratorio 7:

* **Bloque Principal (MAIN):** inicializa las constantes de control con las nuevas ganancias óptimas ($$K\_{1} \= 31.4350 \\rightarrow VD120$$, $$K\_{2} \= 7.2322 \\rightarrow VD124$$, $$N \= 31.4350 \\rightarrow VD132$$) y las matrices discretas; configura la interrupción temporizada de $$10\\,\\mathrm{ms}$$  (SMB34) y habilita el contador de alta velocidad.


![][image4]  
*Figura 3\. Bloque principal MAIN* 

* **Inicialización del Datalogger:** ante la marca de primer ciclo SM0.1, resetea las banderas del registrador y carga el puntero inicial VD400 con la dirección \&VB5000.


![][image5]  
*Figura 4\. Inicialización del Datalogger*

* **Rutina de Interrupción (INT\_0):** cada $$10\\,\\mathrm{ms}$$ verifica la seta de emergencia, lee la posición del HSC0, ejecuta el observador, calcula la ley de control óptima $$u \= N\\,r \- K\\,\\hat{x}$$, satura la salida a $$\\pm 32000$$ en AQW0, determina el sentido de giro y registra posición/setpoint/control en el datalogger embebido.


![][image6]  
 *Figura 5\. Rutina de interrupción*

# Resultados Experimentales {#resultados-experimentales}

Se cargó el código de control óptimo en el PLC Siemens S7-200 operando sobre la planta real de la Unidad de Selección. La respuesta transitoria se capturó mediante el datalogger embebido, que registra en la memoria V tres canales intercalados (setpoint, acción de control y posición real) a un intervalo de $$50\\,\\mathrm{ms}$$.

## Procedimiento de Exportación y Gráficas de Memoria del PLC {#procedimiento-de-exportación-y-gráficas-de-memoria-del-plc}

Tras cargar una referencia de 1000 cuentas y activar el registro manual mediante la bandera Log\_Trigger, el bloque de memoria VB5000–VB6599 se exportó a una hoja de cálculo (archivos optimo.csv y Realimentacion.csv). Los datos crudos se procesaron en Python/MATLAB para desentrelazar los tres canales y generar las curvas experimentales. La siguiente figura muestra las respuestas individuales de ambos controladores.  
![][image7]  
*Figura 6\. Respuesta experimental del controlador óptimo LQR: posición real frente al setpoint de 1000 cuentas y acción de control $$u\[k\]$$, con pico de 31435 unidades y decaimiento exponencial suave.* 

![][image8]

*Figura 7\. Respuesta experimental de la realimentación de estados (Ackermann): posición real y acción de control $$u\[k\]$$, que satura a 32000 unidades durante el transitorio.*

## Análisis del Transitorio y Desempeño {#análisis-del-transitorio-y-desempeño}

Las curvas experimentales revelan el compromiso característico del control óptimo. El controlador óptimo (LQR, $$K \= \[31.44,\\; 7.23\]$$) presenta un pico de control de 31435 unidades analógicas, coincidente exactamente con el valor predicho por la simulación, lo que valida de forma contundente el modelo dinámico de la planta.

Sin embargo, la posición final del óptimo se estabiliza en 977 cuentas (error de 23 cuentas, 2.3%), mientras que la realimentación de estados del Laboratorio 7 alcanza 990 cuentas (error de 10 cuentas, 1.0%). Esta diferencia se explica físicamente: al tener una ganancia K más suave, el controlador óptimo genera una acción de control menor cerca del setpoint, donde la zona muerta del variador Powtran y la fricción seca de la cinta se vuelven dominantes. Como ninguno de los dos controladores incorpora acción integral, ambos exhiben error en estado estacionario, pero el óptimo, al ahorrar esfuerzo, es más sensible a estas perturbaciones no modeladas. Esto justifica la incorporación de una variable de estado integral en desarrollos futuros.

## Tabla Comparativa de Resultados {#tabla-comparativa-de-resultados}

| Parámetro | Realimentación (Lab 7\) | Óptimo LQR (Lab 8\) | Simulación LQR |
| :---: | :---: | :---: | :---: |
| **Ganancia K** | \[97.74, 25.85\] | \[31.44, 7.23\] | \[31.44, 7.23\] |
| **Posición final (cuentas)** | 990 | 977 | 1000 |
| **Error estado estacionario** | 10 cnt (1.0%) | 23 cnt (2.3%) | 0 cnt (0%) |
| **|u| máximo** | 32000 (satura) | 31435 | 31435 |
| **Sobreimpulso** | 0.00% | 0.00% | 0.00% |

*Table 1\. Tabla comparativa de resultados experimentales y de simulación* 

La coincidencia exacta entre el pico de control experimental y simulado (31435) confirma la fidelidad del modelo. El mayor error estacionario del óptimo no es un defecto del diseño sino la manifestación esperada del compromiso velocidad/esfuerzo: el LQR distribuye el esfuerzo de manera más eficiente a costa de una menor capacidad de rechazo de perturbaciones constantes en ausencia de acción integral.

# Conclusiones {#conclusiones}

Se diseñó e implementó exitosamente un controlador óptimo cuadrático discreto (DLQR) para el sistema motor-cinta de la Unidad de Selección, siguiendo la metodología del Capítulo 9 de Braslavsky y reutilizando el modelo en espacio de estados validado en el Laboratorio 7\. La solución de la DARE convergió con un residuo de $$10^{-15}$$.

* La sintonía $$Q \= C^{T}C$$, $$R \= 0.001$$ produjo la ganancia óptima $$K \= \[31.44,\\; 7.23\]$$, cuyos polos en lazo cerrado ($$z \= 0.985,\\; 0.966$$) son consecuencia de la minimización del coste y no de una asignación arbitraria, ilustrando la diferencia conceptual fundamental entre el control óptimo y la asignación de polos.  
* La validación experimental confirmó la fidelidad del modelo: el pico de control medido en la planta real (31435 unidades) coincidió exactamente con el valor simulado, demostrando que el modelo dinámico discreto captura correctamente el comportamiento del sistema variador-motor-cinta.  
* El controlador óptimo redujo el esfuerzo de actuación frente al Ackermann del Laboratorio 7, evitando la saturación completa del variador, a costa de un mayor error en estado estacionario (23 vs 10 cuentas). Este resultado evidencia el compromiso velocidad/esfuerzo inherente al control óptimo y la sensibilidad del LQR a perturbaciones no modeladas en ausencia de acción integral.  
* El diseño del filtro de Kalman estacionario ($$L\_{\\infty} \= \[0.0685,\\; 0.2432\]$$) como estimador óptimo, combinado con el LQR para conformar un regulador LQG, completó el alcance del laboratorio, validando el principio de separación entre el diseño del controlador y del estimador.  
* Como mejora futura, la incorporación de una variable de estado integral al sistema aumentado permitiría anular el error en estado estacionario causado por la fricción y la zona muerta del variador, manteniendo las ventajas de eficiencia del control óptimo.

# Referencias {#referencias}

* Braslavsky, J. H. (2026). *Introducción al Control Automático 2* — Capítulo 9: Introducción al Control Óptimo. Universidad Nacional de Quilmes.  
* Ogata, K. (2010). *Modern Control Engineering* (5th ed.). Prentice Hall.  
* Franklin, G. F., Powell, J. D., & Workman, M. L. (1998). *Digital Control of Dynamic Systems* (3rd ed.). Addison-Wesley.  
* Siemens AG. (2004). *Manual del Sistema de Automatización S7-200*.  
* Powtran Technology. (2018). *PI9100 Series Frequency Inverter User Manual*.

[image1]: imagenes/image1.png
[image2]: imagenes/image2.png
[image3]: imagenes/image3.png
[image4]: imagenes/image4.png
[image5]: imagenes/image5.png
[image6]: imagenes/image6.png
[image7]: imagenes/image7.png
[image8]: imagenes/image8.png