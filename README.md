# Planta de manufactura XK-335B

Planta de manufactura flexible del Laboratorio de Control de la Carrera de Ingeniería Electrónica, UMSA. Es una línea modular que toma una pieza base, le ensambla un núcleo, la prensa y la clasifica según el tipo de pieza.

Este repositorio reúne la documentación de la planta y el trabajo de cada semestre desde 2022: planos, programas de PLC, informes, diagramas, datasheets y presentaciones.

## Unidades

Cada unidad tiene su propio PLC Siemens S7-200. Desde II-2026 la planta tiene además un brazo de 4 grados de libertad al final de la cinta de selección.

| N.º | Unidad        | CPU          | Función |
|-----|---------------|--------------|---------|
| 1   | Transporte    | CPU 226 CN   | Carro movido por servomotor con un manipulador neumático; lleva la pieza de una unidad a otra. |
| 2   | Alimentación  | CPU 224 CN   | Silo y cilindros que entregan una pieza base a la vez. |
| 3   | Ensamblaje    | CPU 226 CN   | Coloca el núcleo dentro de la pieza base. |
| 4   | Procesamiento | CPU 224 CN   | Prensa la pieza ensamblada. |
| 5   | Selección     | CPU 224XP CN | Cinta con variador Powtran PI9100 y tres cilindros que desvían cada tipo de pieza a su rampa. |
| 6   | Brazo 4DOF    | CPU 224 CN   | Retira de la cinta las piezas que no van a ninguna rampa. |

De izquierda a derecha las unidades están en el orden Alimentación, Procesamiento, Ensamblaje y Selección. El carro recoge la pieza en Alimentación, la deja en Ensamblaje, la regresa a Procesamiento para el prensado y la lleva a Selección. Las piezas de plástico negro no pasan por la prensa.

## Comunicación

- Los seis PLC están en una red PPI sobre RS-485 a 19 200 bps. El PLC de Transporte coordina la red y reúne el estado de las demás unidades.
- El puerto 0 del PLC de Transporte funciona como esclavo Modbus RTU para el SCADA.
- El PLC de Selección controla el variador por la salida analógica `AQW0` (0-10 V) y lo supervisa por Modbus RTU desde su puerto 1.

## Contenido

| Carpeta                         | Contenido |
|---------------------------------|-----------|
| `global/datasheets`             | Hojas de datos de PLC, servo, variador, sensores y actuadores. |
| `global/manuales`               | Manual original de la planta. |
| `global/programas-originales`   | Programas de fábrica de las cinco unidades. |
| `global/modelos-3d`             | Modelos 3D de las unidades. |
| `global/software`               | STEP 7-Micro/WIN y librería Modbus. |
| `semestres/2022_II`             | Programas Ladder del diagnóstico inicial, P&ID en AutoCAD, bitácoras y videos. |
| `semestres/2023_I`              | GRAFCET en FluidSIM, diagramas de flujo, controladores PID, por realimentación de estados y LQG. |
| `semestres/2023_II`             | Modelos 3D en AutoCAD, caracterización de las unidades, diseño de controladores y mantenimiento. |
| `semestres/2025_II`             | P&ID por unidad, función de transferencia de la cinta, programas Micro/WIN con comunicación y HMI. |
| `semestres/2026_I`              | Laboratorios 1 a 8 y laboratorio final: diagramas, planos, redes de Petri, OpenPLC y SCADA. |
| `semestres/2026_II`             | Ingeniería inversa, diagnóstico Kaizen, planos, mapeo de E/S, programas AWL y SCADA web. |

Asignaturas: ETN-902 Sistemas de Control II, ETN-1034 Aplicación de Técnicas de Control y ETN-1000 Bases de Datos.
