# 🔍 Manuales e Ingeniería Inversa (Auditoría Kaizen - Lab 1)

Este directorio alberga la documentación de campo, el inventario físico y los diagnósticos técnicos correspondientes a la **Fase 1: Auditoría Kaizen e Ingeniería Inversa** de la Maqueta de Manufactura Flexible XK-335B (Gestión II/2026).

---

## 📌 1. Propósito del Módulo
Respaldar técnicamente la caracterización de los activos del sistema antes de cualquier intervención en caliente o carga de rutinas de control. El levantamiento se realizó mediante una inspección estática cable por cable, contrastando la realidad física de la planta con los antecedentes esquemáticos obsoletos o incompletos.

---

## 📊 2. Síntesis de Hallazgos Críticos y Auditoría Kaizen

Durante el levantamiento físico del Laboratorio 1 se detectaron las siguientes discrepancias y riesgos operativos:

| Subsistema / Estación | Componente Afectado | Diagnóstico Físico / Condición Real | Impacto Operativo / Riesgo de Control |
| :--- | :--- | :--- | :--- |
| **Estación 5 (Selección)** | Accionamiento Cinta | Motor asíncrono trifásico alimentado por VFD POWTRAN PT9100A (220 VAC mono -> tri). | Desmiente manuales históricos que indicaban motor DC paso a paso. Requiere control analógico 0-10V. |
| **Estación 5 (Selección)** | Control Sentido de Giro | Conexión cableada no documentada entre salida digital del PLC y terminal REV del VFD. | Posible inversión accidental de la marcha de la cinta sin control secuencial. |
| **Estación 5 (Selección)** | Discriminación de Material | Sensores capacitivos Winston CM18 instalados junto a inductivo LM18. | Habilita discriminación selectiva de plásticos/metálicos mediante constante dieléctrica. |
| **Estación 3 (Procesamiento)** | Sensores Magnéticos Prensa | Sensores SMC D-C73 fijados con cinta adhesiva y silicona caliente en el cuerpo del cilindro. | Descalibración por vibración y calor; pérdida de confirmación de fin de carrera. |
| **Estación 3 (Procesamiento)** | Mordaza y Vástago Prensa | Desalineación angular perceptible entre el pistón de prensado y la mordaza lateral. | Fatiga mecánica, atascamiento de piezas y desgaste asimétrico de guías. |
| **Estación 1 (Transporte)** | Parada de Emergencia (QS-101) | Pulsador tipo hongo trabado mecánicamente en '1' lógico permanente. | **Riesgo crítico de seguridad:** Imposibilidad de desenergizar el manipulador ante atrapamiento. |
| **Estación 4 (Ensamblaje)** | Cableado de Sensor | Conductor con aislamiento externo pelado en contacto con el perfil de aluminio. | Riesgo de cortocircuito a masa de 24 VDC y lecturas espurias en la CPU 226 CN. |
| **Línea General** | Módulos PLC S7-200 | Dos carcasas plásticas de bornes con fracturas mecánicas por apriete excesivo. | Falta de protección IP20 y exposición de pistas de circuito impreso. |

---

## 🧮 3. Demostración Matemática: Ruptura de Lazo y Pérdida de Observabilidad

Uno de los aportes teóricos centrales de **Control II (ETN-902)** en el Laboratorio 1 fue modelar el impacto del desprendimiento físico de los sensores magnéticos SMC D-C73 (fijados con silicona) en la prensa de estampado.

### Modelo en Espacio de Estados
Considerando la dinámica simplificada del vástago de prensado:
$$\dot{x}(t) = A x(t) + B u(t)$$
$$y(t) = C x(t)$$

Donde el vector de estado es $x(t) = \begin{bmatrix} z(t) \\ \dot{z}(t) \end{bmatrix}$ (posición vertical y velocidad del vástago), y la matriz de salida bajo condiciones normales es:
$$C_{\text{nominal}} = \begin{bmatrix} 1 & 0 \end{bmatrix}$$

### Condición de Ruptura de Causalidad
Al despegarse los sensores por vibración, la señal leída por las entradas del PLC `I0.0` y `I0.1` se anula de forma continua independientemente de la posición física real de la prensa:
$$C_{\text{falla}} = \begin{bmatrix} 0 & 0 \end{bmatrix}$$

Calculando la matriz de observabilidad de Kalman:
$$\mathcal{O} = \begin{bmatrix} C \\ CA \end{bmatrix} = \begin{bmatrix} 0 & 0 \\ 0 & 0 \end{bmatrix} \implies \text{rango}(\mathcal{O}) = 0 < 2$$

**Conclusión:** El sistema entra en condición de **no observabilidad estricta**. Al no recibir confirmación de final de carrera, la rutina secuencial del PLC entra en *deadlock* (bloqueo infinito) mientras el actuador neumático continúa presurizado a 0.6 MPa, provocando recalentamiento de electroválvulas y riesgo de impacto contra el manipulador de transporte.

---

## 📂 4. Contenido del Directorio

| Archivo / Carpeta | Descripción |
| :--- | :--- |
| [`Informe_Laboratorio_1.pdf`](Informe_Laboratorio_1.pdf) | Informe técnico oficial de 40 páginas presentado por la escuadra. Contiene la auditoría cable por cable, mapeo I/O completo y matriz Kaizen. |
| [`datasheets/`](datasheets/README.md) | Directorio que contiene las 13 fichas técnicas y manuales de fabricante de PLCs, servodrivers, VFD, sensores y actuadores. |
| [`../evidencias/`](../evidencias/README.md) | Banco fotográfico de auditoría con las evidencias físicas de cada anomalía detectada. |

---

## 👥 5. Guía de Aportes para Estudiantes
- Toda actualización a las fichas técnicas o adición de nuevos manuales debe ubicarse en `/datasheets/`.
- Nuevos diagnósticos o mediciones de campo deben añadirse a este archivo bajo la sección de auditoría Kaizen mediante pull requests en la rama `feature/auditoria-hardware`.
