**Universidad Mayor de San Andrés**  
**Facultad de Ingeniería**  
**Ingeniería Electrónica**  
![][image1]  
**Informe de laboratorio N°2**  
**“Simbología y representación en diagramas**  
**P\&ID y esquemas eléctricos”**

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


**Fecha de presentación:**	11/03/2026

La Paz \- Bolivia

[**Resumen	3**](#resumen)

[**Objetivos	3**](#objetivos)

[Objetivo General	3](#objetivo-general)

[Objetivos Específicos	3](#objetivos-específicos)

[**Fundamento Teórico	3**](#fundamento-teórico)

[Diagramas P\&ID (Piping and Instrumentation Diagram)	3](#diagramas-p&id-\(piping-and-instrumentation-diagram\))

[Diagramas Eléctricos en la Industria	4](#diagramas-eléctricos-en-la-industria)

[Normativa Internacional (ISA, IEC, IEEE)	4](#normativa-internacional-\(isa,-iec,-ieee\))

[Uso de Software Especializado (AutoCAD Electrical)	5](#uso-de-software-especializado-\(autocad-electrical\))

[**Desarrollo Experimental	6**](#desarrollo-experimental)

[Elaboración P\&ID	6](#elaboración-p&id)

[Unidad de Alimentación	6](#unidad-de-alimentación)

[Unidad de Procesamiento.	8](#unidad-de-procesamiento.)

[Unidad de Ensamblaje	8](#unidad-de-ensamblaje)

[Unidad de Transporte	9](#unidad-de-transporte)

[Unidad de Selección	9](#unidad-de-selección)

[Elaboración del Esquema Eléctrico	11](#elaboración-del-esquema-eléctrico)

[Unidad de Alimentación	11](#unidad-de-alimentación-1)

[Unidad de Procesamiento.	11](#unidad-de-procesamiento.-1)

[Unidad de Ensamblaje	12](#unidad-de-ensamblaje-1)

[Unidad de Transporte	13](#unidad-de-transporte-1)

[Unidad de Selección	14](#unidad-de-selección-1)

[**Conclusiones	14**](#conclusiones)

# Resumen {#resumen}

El presente informe documenta el desarrollo del Laboratorio 2, correspondiente a la elaboración de diagramas P\&ID y esquemas eléctricos de una planta de manufactura compuesta por cinco unidades: Alimentación, Procesamiento, Ensamblaje, Transporte y Selección. Aplicando la normativa ISA 5.1, IEC e IEEE mediante AutoCAD Electrical, se representaron las interconexiones entre sensores, actuadores neumáticos y el PLC Siemens S7-200. Los resultados muestran que una representación esquemática estandarizada es una herramienta esencial para la implementación y mantenimiento de sistemas de control industrial.

# Objetivos {#objetivos}

## Objetivo General {#objetivo-general}

Obtener representaciones esquemáticas de procesos reales mediante diagramas P\&ID identificando lazos de control y mediante diagramas eléctricos con la finalidad de optimizar la implementación y/o mantenimiento.

## Objetivos Específicos {#objetivos-específicos}

* Identificar y aplicar la simbología normalizada utilizada en diagramas P\&ID y esquemas eléctricos, de acuerdo con normas internacionales (ISA, IEC, IEEE), mediante el uso de software especializado de diseño.  
* Elaborar diagramas P\&ID de procesos reales o simulados utilizando software de dibujo técnico, incorporando equipos, líneas de proceso, instrumentos y lazos de control.  
* Diseñar esquemas eléctricos básicos empleando AutoCAD Electrical u otro software equivalente, representando correctamente dispositivos, conexiones y referencias cruzadas.  
* Interpretar diagramas P\&ID y esquemas eléctricos generados en software, identificando lazos de control, señales de instrumentación y componentes eléctricos asociados al proceso.  
* Utilizar herramientas del software tales como capas, bloques, librerías de símbolos y rotulación automática para mejorar la estandarización, claridad y documentación de los diagramas.  
* Analizar la relación entre los diagramas elaborados y los procesos de implementación y mantenimiento industrial, destacando la importancia de una correcta representación esquemática.

# Fundamento Teórico {#fundamento-teórico}

## Diagramas P\&ID (Piping and Instrumentation Diagram) {#diagramas-p&id-(piping-and-instrumentation-diagram)}

Un diagrama de tuberías e instrumentación (P\&ID) es una representación esquemática detallada de un proceso industrial. Su función principal es mostrar la interconexión de los equipos de proceso y la instrumentación utilizada para el control del mismo. Estos diagramas permiten identificar lazos de control, tipos de señales (neumáticas, eléctricas, digitales) y la ubicación física de los instrumentos en la planta.

![][image2]

![][image3]

## Diagramas Eléctricos en la Industria {#diagramas-eléctricos-en-la-industria}

Los diagramas eléctricos representan de forma gráfica la relación entre los componentes de un sistema eléctrico, tales como fuentes de alimentación, protecciones, conductores y cargas. En el contexto de la automatización, estos esquemas son vitales para representar las conexiones de los controladores lógicos programables (PLC), como el **Siemens S7-200**, con sus respectivos sensores y actuadores.

![][image4]

## Normativa Internacional (ISA, IEC, IEEE) {#normativa-internacional-(isa,-iec,-ieee)}

La estandarización es fundamental para que cualquier técnico o ingeniero pueda interpretar los planos sin ambigüedades.

* **Norma ISA 5.1:** Estándar de la *International Society of Automation* para la identificación y simbología de instrumentación.  
* **Normas IEC e IEEE:** Proporcionan las directrices para la representación de símbolos eléctricos y electrónicos a nivel global.

**![][image5]**

## Uso de Software Especializado (AutoCAD Electrical) {#uso-de-software-especializado-(autocad-electrical)}

El diseño técnico moderno se apoya en software especializado que permite el uso de capas, librerías de símbolos y rotulación automática. Herramientas como **AutoCAD Electrical** facilitan la creación de referencias cruzadas y la generación de listas de materiales, optimizando la precisión de los esquemas.

### Incidencia en el Mantenimiento y Diseño

La correcta elaboración de estos diagramas tiene un impacto directo en la eficiencia industrial:

* **Optimización del diseño:** Permite prever colisiones o errores de lógica antes de la implementación física.  
* **Mantenimiento:** Facilita el seguimiento de señales y la localización de fallas, reduciendo el tiempo de inactividad de la planta.  
* **Documentación:** Asegura que las modificaciones futuras o ampliaciones de la planta (como en las unidades de transporte o ensamblaje) estén debidamente registradas.

![][image6]

# Desarrollo Experimental {#desarrollo-experimental}

## Elaboración P\&ID {#elaboración-p&id}

A continuación se presentan los diagramas elaborados en la práctica de laboratorio, para todos los casos se tomaron como base el trabajo del semestre II/2023, haciendo ligeras o grandes modificaciones.

### Unidad de Alimentación {#unidad-de-alimentación}

![][image7]  
![][image8]

### Unidad de Procesamiento. {#unidad-de-procesamiento.}

### Unidad de Ensamblaje![][image9] {#unidad-de-ensamblaje}

### Unidad de Transporte {#unidad-de-transporte}

![][image10]

### Unidad de Selección {#unidad-de-selección}

![][image11]

![][image12]

## Elaboración del Esquema Eléctrico {#elaboración-del-esquema-eléctrico}

### Unidad de Alimentación {#unidad-de-alimentación-1}

![][image13]

El esquema eléctrico presentado detalla las conexiones de control para la estación de alimentación. Cabe destacar que este diagrama ha sido desarrollado tomando como referencia el diseño original realizado por el estudiante de semestres anteriores.

### Unidad de Procesamiento. {#unidad-de-procesamiento.-1}

### Unidad de Ensamblaje![][image14] {#unidad-de-ensamblaje-1}

### Unidad de Transporte {#unidad-de-transporte-1}

![][image15]

### Unidad de Selección![][image16] {#unidad-de-selección-1}

# Conclusiones {#conclusiones}

- **Estandarización Internacional:** Se aplicó con éxito la normativa **ISA 5.1** para la identificación de instrumentación y las normas **IEC/IEEE** para los esquemas eléctricos. Esto garantiza que los diagramas de las cinco unidades sean interpretables bajo estándares globales, eliminando ambigüedades técnicas.  
- **Integración del Control Lógico:** Mediante el diseño de los esquemas eléctricos, se documentó la interfaz de I/O del **PLC Siemens S7-200**, permitiendo una trazabilidad clara entre las señales de los sensores (entradas) y la activación de las electroválvulas y motores (salidas) en cada estación.  
- **Abstracción del Proceso Manufacturero:** La elaboración de los P\&ID permitió visualizar la planta no solo como un conjunto mecánico, sino como un sistema de lazos de control interconectados. Se identificó la importancia de las señales neumáticas y eléctricas en la coordinación de tareas complejas como el ensamblaje y la selección.  
- **Dominio de Software Especializado:** El uso de **AutoCAD Electrical** facilitó la gestión de capas y librerías de símbolos, optimizando la creación de referencias cruzadas y la rotulación automática. Esto eleva la calidad de la documentación técnica comparada con métodos de dibujo genéricos.  
- **Impacto en el Mantenimiento:** Se concluye que una representación esquemática precisa es la herramienta más crítica para el mantenimiento industrial; facilita la localización inmediata de fallas en sensores o actuadores, reduciendo drásticamente los tiempos de inactividad de la planta.

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