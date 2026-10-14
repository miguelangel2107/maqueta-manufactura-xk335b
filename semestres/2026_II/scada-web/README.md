# SCADA web de la celda XL-335B

Supervisión y mando de toda la celda desde el navegador. Se conecta al **PLC 1 (Transporte)** por Modbus RTU con la Web Serial API, sin servidor ni programas intermedios. El PLC 1 reúne los datos de las otras cinco estaciones por la red PPI, así que una sola conexión basta para ver toda la planta.

## 1. Requisitos

- **Google Chrome o Microsoft Edge** en un PC (Firefox y Safari no tienen Web Serial).
- Conversor **USB-RS485** al **Puerto 0 del PLC 1**:
  - pin 3 = B / +
  - pin 8 = A / −
  - pin 5 = GND
- **Selector físico del PLC 1 en RUN.** En TERM el Puerto 0 vuelve a PPI para programar y no responde a Modbus.
- Parámetros: dirección 1, 19200 bps, 8-N-1. Se pueden cambiar en *Configuración*.

## 2. Arranque

1. Doble clic en `iniciar_scada.bat`. Sirve la carpeta en `http://localhost:8335` y abre el navegador.
   - Si no hay Python, abra `index.html` directamente con Chrome o Edge.
2. Pulse **Conectar PLC** y elija el puerto del conversor (por ejemplo `COM3 – USB-SERIAL CH340`).
3. Desde `localhost` el navegador recuerda el permiso del puerto y se reconecta solo la próxima vez.

**Modo demostración:** el botón **Demo** carga un simulador del ciclo completo:
- los 5 tipos de pieza;
- la pieza negra con bypass;
- el Brazo;
- el variador.

Sirve para conocer el SCADA sin el PLC. En *Diagnóstico* hay botones para simular fallas.

## 3. Ventanas

| Grupo | Ventana | Contenido |
|---|---|---|
| Operación | **Planta** | Dibujo 2D de la celda en vivo: el carro se mueve con su posición real. Incluye la baliza, el mando de la celda (Marcha, Pausa, Parar al final, Reset), «¿Qué está pasando?», la producción y una tarjeta por unidad. |
| Operación | **Alarmas** | Alarmas y avisos activos, cada uno con su solución. Historial con exportación a CSV. |
| Operación | **Producción** | Contadores por carril y del Brazo, ritmo en piezas/hora, gráfico de las últimas 2 horas y matriz de los 5 tipos. Permite poner los contadores a cero. |
| Unidades | **Transporte** | Riel con las cotas, manipulador, paso y sub-etapa, SB1/SB2 virtuales, jog de calibración, tiempos Δt y E/S. |
| Unidades | **Alimentación** | Silo, sujetador, empujador, cuna con material, pasos y E/S. |
| Unidades | **Procesamiento** | Mordaza, carro, prensa de doble golpe, pasos y E/S. |
| Unidades | **Ensamblaje** | Plato de dos nidos, núcleos, Pick & Place, pieza y tipo. Muestra las dos secuencias (ensamble y preparación), qué espera la estación y las E/S. |
| Unidades | **Selección y variador** | Cinta, inspección, desviadores, carriles y fin de cinta. Indicador de frecuencia, corriente y bus DC. Cambio de **Modo 1 / Modo 2** y de **sentido Forward / Reverse**. |
| Unidades | **Brazo 4-DOF** | Fase de la secuencia, sensores y enlace Selección → Brazo. |
| Ingeniería | **Diagnóstico** | Red PPI por nodo, baliza y causa de la roja, tiempos neumáticos y bytes de estado bit a bit. |
| Ingeniería | **Configuración** | Cotas del carro (con «Usar posición actual»), parámetros de Transporte, variador, comunicación y tema claro/oscuro. |
| Ingeniería | **Comunicación** | Estadísticas del enlace, los 128 registros (decimal, hex y binario) y las últimas tramas. |

**Abrir aparte:** cada ventana tiene ese botón para llevarla a otro monitor.
- Las ventanas aparte reciben los datos de la ventana principal, que es la única que usa el puerto serie.
- Sus órdenes también pasan por la ventana principal.
- Si el navegador bloquea las ventanas emergentes, permítalas para este sitio.

## 4. Mandos y seguridad

- **Marcha** equivale al SB1 de Transporte en Automático. Rearma las estaciones que esperan rearme y les envía la orden de marcha. Con un solo clic arranca toda la celda.
- **SB1 / SB2 virtuales** (ventana Transporte) hacen exactamente lo mismo que los pulsadores físicos. La primera vez piden confirmación, porque la máquina se mueve.
- Toda escritura de cotas y parámetros pide confirmación. El PLC la valida y, si el valor está fuera de rango, lo rechaza y el campo vuelve al valor vigente.
- **El SCADA no sustituye a las setas de emergencia.** Cerrar el navegador o desconectar el cable no detiene la producción.

## 5. Archivos

| Archivo | Función |
|---|---|
| `index.html` | Página única |
| `css/scada.css` | Estilos y temas |
| `js/core.js` | Utilidades e iconos |
| `js/modbus.js` | Cliente Modbus RTU por Web Serial (cola de tramas y CRC) |
| `js/model.js` | Decodificación de la imagen del PLC 1, pasos, E/S y reglas de alarma |
| `js/sim.js` | Simulador del modo demostración |
| `js/draw.js` | Dibujos 2D (SVG) |
| `js/ui.js` | Componentes de interfaz |
| `js/pages.js` | Las ventanas |
| `js/app.js` | Navegación, conexión, sondeo, alarmas y producción |
| `_anterior/` | SCADA anterior, solo como referencia |

No usa librerías externas y funciona sin Internet.

## 6. Mapa de datos

El mapa completo de registros está en `04_Docs_y_Config/Mapeo_Memoria_Global.md`.

- El SCADA lee los registros 40001 a 40128 (`VB1000..VB1255`) en dos tramas de 64 registros.
- Trabaja con las mismas direcciones V que los programas AWL.

| Registros | Contenido |
|---|---|
| 40001 | Mandos (pulsos) |
| 40002..40010 | Parámetros y peticiones |
| 40011..40030 | Estados, alarmas y diagnósticos |
| 40031..40036 | Δt de Transporte |
| 40056..40065 | Cotas y posición |
| 40066..40074 | Variador |
| 40091..40096 | Sensores y contadores |
| 40101..40128 | Imagen extendida: E/S de Transporte y bytes de estado, paso, E/S y diagnóstico de cada estación |

**Requisito:** la imagen extendida necesita cargar los programas de los PLC 1, 2, 3, 4 y 5 de esta revisión.
