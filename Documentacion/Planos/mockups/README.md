# 🖥️ Modelado de Interfaces de Usuario (Mockups UI/UX & Wireframes)

Este directorio custodia las especificaciones de diseño, prototipos de baja y media fidelidad (wireframes) y especificaciones de interfaz gráfica para el **Panel HMI Local** y el **Dashboard del ERP / SCADA Industrial**, desarrollados en el marco del Laboratorio 2 de la Fase 1 por el equipo de **Bases de Datos (ETN-1000)**.

---

## 📌 1. Propósito y Filosofía de Diseño
El diseño de interfaces para la maqueta XK-335B obedece al estándar de **HMI de Alto Desempeño (ISA-101: Human Machine Interfaces for Process Automation Systems)**:
1. **Reducción de Fatiga Visual:** Fondo en tonalidades oscuras o neutras industriales con uso estratégico de color únicamente para situaciones de alarma o cambio de estado.
2. **Jerarquía Visual Clara:** Diferenciación inmediata entre variables manipuladas (consignas modificables), variables de proceso (lecturas en vivo) y alarmas de seguridad.
3. **Correspondencia Semántica:** Cada indicador en pantalla porta exactamente el mismo **Tag ANSI/ISA-S5.1** especificado en los diagramas P&ID y en la base de datos relacional.

---

## 📐 2. Prototipo 1: Panel HMI Local (Pantalla de Operador de Mesa)

El siguiente esquema en bloques representa la pantalla táctil de 7" (Nextion / Siemens KTP700) instalada en la estación:

```text
+--------------------------------------------------------------------------------------------------+
|  [XK-335B] ESTACIÓN 5: UNIDAD DE SELECCIÓN                   MODO: [ AUTO / MANUAL ]  | 14:32:05 |
+--------------------------------------------------------------------------------------------------+
|  SINÓPTICO EN VIVO (CINTA TRANSPORTADORA)           |  CONTROL DE VELOCIDAD (VFD POWTRAN)        |
|                                                     |                                            |
|   [Tolva Entrada]                                   |   Consigna Frecuencia: [ 35.0 Hz ] [-] [+] |
|          │                                          |   Velocidad Lineal PV:  0.35 m/s           |
|          ▼                                          |   Corriente Motor:      0.82 A             |
|  ═════════════════════════════════════════════════  |   Sentido de Giro:     [ FWD ]  [ REV ]    |
|   (BTE)    [CM18]   [LM18]      [CYL-1]    [CYL-2]  |                                            |
|   Pres.    Plást.    Metal       Metal      Plást.  +--------------------------------------------+
|   ( ● )    ( ○ )     ( ● )       [PUSH]     [PUSH]  |  ESTADO DE ALARMAS LOCALES                 |
|                                                     |                                            |
|  Sensores:                                          |   [OK] Parada de Emergencia: NORMAL        |
|  • ZT-501 (Inductivo Metal): ACTIVO                 |   [!!] Desviador 1: RETRASO EN RETORNO     |
|  • WT-501 (Capacitivo):      INACTIVO               |   [OK] Comunicación RS-485: NODO 5 ONLINE  |
|  • ST-501 (Encoder HSC0):    1250 RPM               |                                            |
+-----------------------------------------------------+--------------------------------------------+
|  COMANDOS:   [ START CICLO ]   [ STOP CICLO ]   [ RESET ALARMAS ]   [ PARADA EMERGENCIA (FÍSICA) ]|
+--------------------------------------------------------------------------------------------------+
```

---

## 🌐 3. Prototipo 2: Dashboard Web Central (ERP / SCADA Centralizado)

Vista global de monitoreo remoto integrada con el backend PostgreSQL para supervisión de las 5 estaciones:

```text
+--------------------------------------------------------------------------------------------------+
|  UMSA - LABORATORIO DE CONTROL INDUSTRIAL  |  SCADA XK-335B  |  ESTADO BUS RS-485: ONLINE (5/5)   |
+--------------------------------------------------------------------------------------------------+
|  EST-01 (Transporte) | EST-02 (Alimentación)| EST-03 (Procesado) | EST-04 (Ensamble) | EST-05 (Selección) |
|  PLC: S7-226 (Master)| PLC: S7-224 (Esclavo)| PLC: S7-224 (Escl.)| PLC: S7-226 (Escl)| PLC: S7-224XP (Escl)|
|  Pos X: 450.2 mm     | Tolva: 8 Piezas      | Prensa: ARRIBA     | Ángulo: 0°        | Veloc: 0.35 m/s    |
|  Estado: TRASLADANDO | Estado: ESPERANDO    | Estado: REPOSO     | Pinza: ABIERTA    | Cinta: EN MARCHA   |
+--------------------------------------------------------------------------------------------------+
|  MÉTRICAS DE PRODUCCIÓN EN TIEMPO REAL              |  HISTORIAL DE TELEMETRÍA (ÚLTIMA HORA)     |
|                                                     |                                            |
|  • Piezas Metálicas Procesadas:     142 u.          |    Velocidad Cinta (m/s)                   |
|  • Piezas Plásticas Procesadas:      98 u.          |    0.5 ┤         ┌───────┐                 |
|  • Piezas Descartadas (Defectos):     4 u.          |    0.3 ┤─────────┘       └─────────        |
|  • Eficiencia Global (OEE):          94.2 %         |    0.1 ┤                                   |
|  • Tiempo Medio de Ciclo:            18.4 s         |        00m   15m   30m   45m   60m         |
+-----------------------------------------------------+--------------------------------------------+
|  CONSOLA DE EVENTOS Y REGISTRO DE AUDITORÍA (KAIZEN)                                             |
|  [14:28:10] CRITICAL: Alarma ALM-EST-03-DEADLOCK prevenida por enclavamiento en software.       |
|  [14:15:02] INFO: Operador 'mangel.lopez' inició sesión desde estación de supervisión.           |
|  [14:00:00] INFO: Calibración de cero en encoder ST-501 confirmada satisfactoriamente.           |
+--------------------------------------------------------------------------------------------------+
```

---

## 📂 4. Guía de Aportes para Estudiantes (ETN-1000)
- Los prototipos vectoriales interactivos diseñados en herramientas como Figma, Adobe XD o Penpot deben exportarse a imágenes PNG/SVG y alojarse en este directorio con la convención: `mockup_[hmi|scada]_[modulo].png`.
- Asegurar que todo elemento interactivo que requiera persistencia de datos (ej. botones de parada, consignas de velocidad, umbrales de alarma) tenga su correspondiente atributo en la tabla `variables_proceso` o `alarmas_definicion`.
