# 📸 Galería de Evidencias Fotográficas y Diagnóstico Kaizen

Este directorio contiene el registro fotográfico y visual recopilado durante la **Auditoría Física y Estática Cable a Cable** realizada en el Laboratorio 1 de la Fase 1 (Gestión II/2026). Cada imagen documenta discrepancias mecánicas, fallas de seguridad eléctrica o diagramas analíticos de causalidad de la Maqueta de Manufactura Flexible XK-335B.

---

## 📌 1. Matriz Kaizen de Hallazgos y Registro Fotográfico

A continuación se detalla la correspondencia entre la evidencia física capturada y la acción correctiva recomendada bajo la metodología Kaizen:

| ID | Archivo de Imagen | Estación / Componente | Diagnóstico Físico / Condición Hallada | Severidad | Acción Correctiva Kaizen (Fase 1 / Fase 2) |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **FIG-01** | [`assets/fig01_portada_maqueta_xk335b.png`](assets/fig01_portada_maqueta_xk335b.png) | Planta Completa | Disposición general de las 5 estaciones de manufactura integrada. | N/A | Base de referencia para el gemelo digital y simulación cinemática. |
| **FIG-02** | [`assets/fig02_sensores_capacitivos_motor_trifasico.png`](assets/fig02_sensores_capacitivos_motor_trifasico.png) | Estación 5: Selección | Motor asíncrono trifásico y sensor capacitivo Winston CM18 omitidos en planos anteriores. | 🟡 Media | Actualización inmediata de planos P&ID y esquema eléctrico IEC. |
| **FIG-03** | [`assets/fig03_borneras_conexiones_cables_expuestos.png`](assets/fig03_borneras_conexiones_cables_expuestos.png) | Borneras de Control | Hilos de cobre expuestos fuera del borne; etiquetas de cables despegadas. | 🟠 Alta | Re-crimpar conductores con punteras huecas aisladas y rotular según IEC 81346. |
| **FIG-04** | [`assets/fig04_carcasa_fracturada_plc_s7200.png`](assets/fig04_carcasa_fracturada_plc_s7200.png) | Controladores PLC | Carcasa plástica fracturada en módulo I/O por exceso de par mecánico. | 🟡 Media | Reparación estructural con soporte polimérico y calibración de torque en bornes. |
| **FIG-05** | [`assets/fig05_sensores_fijados_silicona_cinta.png`](assets/fig05_sensores_fijados_silicona_cinta.png) | Estación 3: Procesamiento | Sensores magnéticos SMC D-C73 pegados con silicona termofusible y cinta adhesiva. | 🔴 Crítica | Fabricar soporte mecánico rígido roscado en ranura para evitar descalibración. |
| **FIG-06** | [`assets/fig06_desalineacion_piston_pinza.png`](assets/fig06_desalineacion_piston_pinza.png) | Estación 3: Procesamiento | Desalineación angular perceptible entre el eje del cilindro de prensa y la pinza. | 🟠 Alta | Alineación micrométrica de guías lineales y ajuste de pernos de bancada. |
| **FIG-07** | [`assets/fig07_conexion_no_documentada_vfd_giro.png`](assets/fig07_conexion_no_documentada_vfd_giro.png) | Estación 5: Selección | Cable de control añadido físicamente entre PLC y terminal REV del VFD sin registro. | 🟠 Alta | Incorporar en plano eléctrico IEC e integrar interbloqueo lógico en software PLC. |
| **FIG-08** | [`assets/fig08_cable_sensor_aislamiento_danado.png`](assets/fig08_cable_sensor_aislamiento_danado.png) | Estación 4: Ensamblaje | Conductor pelado con cobre vivo rozando la perfilería de aluminio estructural. | 🔴 Crítica | Enfundado termocontraíble inmediato y protección con pasacables de goma. |
| **FIG-09** | [`assets/fig09_diagrama_bloques_alimentacion.png`](assets/fig09_diagrama_bloques_alimentacion.png) | Estación 2: Alimentación | Diagrama funcional de causalidad ($u(t) \to y(t)$) elaborado por ETN-902. | N/A | Sustento para la formulación de funciones de transferencia discretas. |
| **FIG-10** | [`assets/fig10_diagrama_bloques_procesamiento.png`](assets/fig10_diagrama_bloques_procesamiento.png) | Estación 3: Procesamiento | Diagrama de bloques con variables manipuladas y confirmación fin de carrera. | N/A | Sustento analítico para la demostración de pérdida de observabilidad. |
| **FIG-11** | [`assets/fig11_diagrama_bloques_ensamblaje.jpg`](assets/fig11_diagrama_bloques_ensamblaje.jpg) | Estación 4: Ensamblaje | Diagrama de bloques de actuador rotativo y pinza angular. | N/A | Mapeo de tiempos de ciclo y retardos de presurización neumática. |
| **FIG-12** | [`assets/fig12_diagrama_bloques_seleccion.jpg`](assets/fig12_diagrama_bloques_seleccion.jpg) | Estación 5: Selección | Lazo de velocidad de cinta (consigna analógica VFD y feedback encoder). | N/A | Modelo dinámico para identificación caja negra de primer orden. |
| **FIG-13** | [`assets/fig13_diagrama_bloques_transporte.jpg`](assets/fig13_diagrama_bloques_transporte.jpg) | Estación 1: Transporte | Diagrama cinemático de control de posición del manipulador cartesiano. | N/A | Base para sintonización de lazos PTO/HSC y control LQR en Fase 3. |
| **FIG-14** | [`assets/fig14_plc_s7200_comunicacion_rs485.jpg`](assets/fig14_plc_s7200_comunicacion_rs485.jpg) | Red Industrial | Módulo PLC Siemens S7-200 con cable bifilar apantallado en puerto de comunicación. | N/A | Verificación física de resistencia terminadora de 220 $\Omega$ en extremos del bus. |
| **FIG-15** | [`assets/fig15_cableado_industrial_paneles.jpg`](assets/fig15_cableado_industrial_paneles.jpg) | Tableros de Control | Disposición de canaletas ranuradas, relés intermedios y fuentes de 24 VDC. | 🟡 Media | Guía de enrutamiento para evitar inducción electromagnética en señales de encoder. |
| **FIG-16** | [`assets/fig16_modulo_potencia_vfd_motor.jpg`](assets/fig16_modulo_potencia_vfd_motor.jpg) | Tablero de Potencia | Conexión del Variador POWTRAN PT9100A y circuito de salida trifásico. | 🟡 Media | Verificación de conexión a tierra de protección (PE) del chasis del variador. |

---

## 💻 2. Integración con la Plataforma Web
Estas imágenes son cargadas dinámicamente en el **Portal Web del Proyecto** (`index.html`) dentro de la sección de **Galería Dinámica de Evidencias**, ofreciendo visualización interactiva con efecto Lightbox, filtros por criticidad y descripción técnica en línea.
