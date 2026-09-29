# 🏭 Maqueta de Manufactura Flexible (XK-335B)
### Plataforma de Integración Interdisciplinar: Control Industrial, Instrumentación y Sistemas de Datos
**Universidad Mayor de San Andrés (UMSA) — Facultad de Ingeniería**  
**Carrera de Ingeniería Electrónica — Gestión II/2026**

[![Fase 1: Concluida](https://img.shields.io/badge/Fase%201-Auditor%C3%ADa%20Kaizen%20%26%20Planos-blue.svg)](#-3-alcance-y-andamiaje-de-la-fase-1-semanas-1-a-6)
[![Plataforma Web](https://img.shields.io/badge/Web%20Portal-Cloudflare%20Pages-orange.svg)](https://miguelangel2107.github.io/maqueta-manufactura-xk335b/)
[![Norma ISA-S5.1](https://img.shields.io/badge/Norma-ANSI%2FISA--S5.1--2009-green.svg)](Documentacion/Planos/Diagrama_P&ID/)
[![Norma IEC](https://img.shields.io/badge/Norma-IEC%2060617%20%2F%2081346-yellow.svg)](Documentacion/Planos/Diagrama_Electrico/)
[![Base de Datos](https://img.shields.io/badge/PostgreSQL-3FN%20Normalizada-blue.svg)](database/)

---

## 📌 1. Presentación Institucional y Académica

El presente repositorio constituye la memoria técnica viva y el centro de custodia documental para la **Planta de Manufactura Flexible XK-335B**, instalada en el Laboratorio de Control de la Facultad de Ingeniería (UMSA). 

Bajo la iniciativa de optimización pedagógica del Semestre II/2026, tres asignaturas troncales operan de forma sinérgica sobre esta plataforma física:
* **Sistemas de Control II (ETN-902 - 4 Hrs):** Caracterización dinámica, modelado fenomenológico, clasificación analítica de variables ($PV, MV, DV$), identificación por caja negra y diseño de lazos de regulación.
* **Aplicación de Técnicas de Control (ETN-1034 - 8 Hrs):** Cableado industrial, esquemas de potencia y mando (IEC), relevamiento de I/O, control de servomotores (PTO/HSC), variadores de frecuencia y programación física de controladores lógicos programables.
* **Bases de Datos (ETN-1000):** Arquitectura cliente-servidor de telemetría en 3 capas, modelado relacional en Tercera Forma Normal (3FN), diseño de mockups HMI/SCADA (ISA-101) y administración del flujo de desarrollo colaborativo con Git.

---

## 👥 2. Plantel Docente y Escuadra de Trabajo

### 2.1. Cuerpo Docente y Auditoría
* **Docente Titular y Auditor General:** Ing. Jorge Antonio Nava Amador
* **Auxiliares de Docencia:**
  * Aux. Limber Ajnota Cahuaya (*Aplicación de Técnicas de Control - ETN-1034*)
  * Aux. Fabian Plata Vargas (*Sistemas de Control II - ETN-902*)
  * Aux. Franz Choque (*Bases de Datos - ETN-1000*)

### 2.2. Escuadra de Ingeniería Concurrente (Asignada a la Planta XK-335B)

| Estudiante | Asignatura | Rol Técnico Especializado | Responsabilidad Principal |
| :--- | :---: | :--- | :--- |
| **Univ. López Rodríguez Miguel Ángel** | **ETN-1034** | **Líder de Hardware & Red RS-485** | Auditoría estática cable a cable, verificación del bus multipunto y parametrización de drivers. |
| **Univ. Wilson David Huanca Challco** | **ETN-1034** | **Inspección de Procesamiento & Seguridad** | Diagnóstico de prensas neumáticas, mordazas mecánicas y análisis de fallas en parada de emergencia. |
| **Univ. Siñani Canaza Juan Carlos** | **ETN-1034** | **Mapeo I/O de PLCs Siemens** | Asignación de operandos de memoria, entradas/salidas digitales/analógicas y cableado de borneras. |
| **Univ. Henrry Jherson Torrez Patty** | **ETN-902** | **Causalidad Dinámica & Modelado** | Clasificación de variables ($PV, MV, DV$), balance de masas/fuerzas y demostración analítica de ruptura de lazo. |
| **Univ. Gandarillas Conde Valeria Erika**| **ETN-1000** | **Modelado Relacional & 3FN** | Diseño conceptual E-R, normalización exhaustiva y optimización de esquemas para telemetría. |
| **Univ. Quisbert Bautista Paul Fernando** | **ETN-1000** | **Arquitectura de Telemetría (3 Capas)** | Mapeo de flujos de datos campo-servidor, análisis de latencias y diseño de diccionarios de datos. |
| **Univ. Cuevas Perez Mauricio** | **ETN-1000** | **Infraestructura de Datos & SQL** | Desarrollo de scripts DDL/DML para PostgreSQL/MySQL, índices de series temporales y triggers. |

---

## 🎯 3. Alcance y Andamiaje de la Fase 1 (Semanas 1 a 6)

La **Fase 1: Auditoría Kaizen e Ingeniería Inversa** sienta las bases de confiabilidad física, abstracción teórica y gobierno de código de la planta antes de cualquier intervención de control avanzado:

```text
+-------------------------------------------------------------------------------------------------------+
|                               CRONOGRAMA DE LA FASE 1 (SEMANAS 1 A 6)                                 |
+-------------------------------------------------------------------------------------------------------+
|  SEMANAS 1 - 2: LABORATORIO 1                                                                         |
|  Levantamiento Físico de Activos, Fenomenología y Arquitectura Cliente-Servidor                      |
|  • Auditoría estática cable a cable desmintiendo antecedentes obsoletos (VFD trifásico en selección). |
|  • Mapeo formal de direcciones I/O de las 5 CPUs Siemens S7-200.                                      |
|  • Demostración analítica de ruptura de lazo y pérdida de observabilidad (C = [0  0]).                |
|  • Inspección de latencias de comunicación del puerto serie RS-485 vs. PC de adquisición.             |
+-------------------------------------------------------------------------------------------------------+
|  SEMANAS 3 - 4: LABORATORIO 2                                                                         |
|  Normalización Internacional de Planos (ISA/IEC) y Modelado de Datos de Campo                         |
|  • Estandarización de diagramas P&ID bajo norma ANSI/ISA-S5.1-2009 (lazos, burbujas, tags).          |
|  • Elaboración de esquemas eléctricos de potencia y mando bajo norma IEC 60617 / IEC 81346.           |
|  • Diseño de Mockups UI/UX para panel HMI local de mesa y Dashboard SCADA/ERP centralizado (ISA-101).|
+-------------------------------------------------------------------------------------------------------+
|  SEMANAS 5 - 6: LABORATORIO 3                                                                         |
|  Gestión Colaborativa con Git/GitHub y Base de Datos Relacional Normalizada                           |
|  • Flujo de desarrollo profesional con ramas por subsistema (`feature/*`) y Pull Requests auditados.  |
|  • Implementación del esquema de base de datos relacional para PostgreSQL en Tercera Forma Normal (3FN)|
|  • Registro atómico de actividad en consola de los 7 miembros de la escuadra concurrente.             |
+-------------------------------------------------------------------------------------------------------+
```

---

## 🏛️ 4. Arquitectura del Repositorio

A continuación se detalla la estructura física de directorios del proyecto, modularizada para garantizar navegación limpia y trazabilidad absoluta:

```text
maqueta-manufactura-xk335b/
│
├── .nojekyll                                  # Previene omisiones de directorios en despliegues estáticos
├── .gitignore                                 # Exclusión de temporales Python, SO y logs locales
├── package.json                               # Configuración de scripts para CI/CD (npm run build)
├── README.md                                  # Manual maestro general de la Fase 1 (este documento)
├── _sidebar.md                                # Estructura de navegación para motores de documentación
├── index.html                                 # Plataforma Web SPA optimizada para Cloudflare Pages
│
├── docs/                                      # CATÁLOGOS AUTOMATIZADOS Y RECURSOS WEB
│   ├── logo_umsa.png                          # Escudo oficial de la Universidad Mayor de San Andrés
│   ├── catalogo_documentos.js                 # Catálogo indexado de documentos y planos (JS)
│   ├── catalogo_documentos.json               # Catálogo indexado para interoperabilidad REST (JSON)
│   ├── datasheets_config.json                 # Metadatos y asociación de estaciones para datasheets
│   ├── evidencias_data.js                     # Banco de evidencias fotográficas Kaizen (JS)
│   └── evidencias_data.json                   # Banco de evidencias fotográficas Kaizen (JSON)
│
├── scripts/                                   # SCRIPTS DE CONSTRUCCIÓN Y AUTOMATIZACIÓN
│   └── build-catalog.js                       # Generador dinámico de catálogos e indexador recursivo
│
├── database/                                  # PERSISTENCIA Y MODELADO DE DATOS (ETN-1000)
│   ├── README.md                              # Guía técnica: Arquitectura 3 capas, 1FN/2FN/3FN y diccionarios
│   └── scripts/                               # Scripts ejecutables SQL normalizados
│       ├── 01_schema_telemetria_3fn.sql       # DDL: Creación de tablas de telemetría, alarmas y logs
│       ├── 02_seed_data_xk335b.sql            # DML: Catálogo auditado de estaciones, instrumentos y tags
│       └── 03_indices_optimizacion.sql        # Índices B-Tree para series temporales y triggers automáticos
│
└── Documentacion/                             # ACERVO TÉCNICO Y DOCUMENTACIÓN INDUSTRIAL
    │
    ├── ingenieria-inversa/                    # AUDITORÍA DE CAMPO Y REPORTES OFICIALES (Lab 1)
    │   ├── README.md                          # Memoria Kaizen, inventario y demostración matemática de lazo
    │   ├── Informe_Laboratorio_1.pdf          # Informe oficial compilado de 40 páginas
    │   └── datasheets/                        # BIBLIOTECA DE FICHAS TÉCNICAS DE FABRICANTE
    │       ├── README.md                      # Catálogo clasificado por controlador, actuador y sensor
    │       ├── s7200_system_manual_es-ES.pdf  # Manual de sistema Siemens SIMATIC S7-200
    │       ├── Technical reference_AC Servo...# Referencia técnica Servodriver Panasonic MINAS A4
    │       ├── PI9000_English_Manual_V17.0.pdf# Manual Variador de Frecuencia POWTRAN PT9100A
    │       ├── sensor_e3z-ls.pdf              # Ficha técnica sensor fotoeléctrico Omron E3Z-LS
    │       └── ... (13 manuales oficiales)    # Cilindros SMC, válvulas Airtac, encoders y borneras RTB
    │
    ├── Planos/                                # PLANOS DE INGENIERÍA NORMALIZADOS (Lab 2)
    │   ├── README.md                          # Guía de estándares: Diferenciación entre P&ID e IEC
    │   │
    │   ├── Diagrama_Electrico/                # ESQUEMAS DE POTENCIA Y MANDO (Norma IEC 60617 / 81346)
    │   │   ├── README.md                      # Niveles de tensión (220VAC / 24VDC), código de colores y bornes
    │   │   ├── 1_Transporte/README.md         # Servodriver Panasonic, salidas PTO, parada de emergencia
    │   │   ├── 2_Alimentacion/README.md       # Electroválvula eyectora 24VDC, sensor óptico de tolva
    │   │   ├── 3_Ensamblaje/README.md         # Actuador rotativo oscilante y pinza angular MHC
    │   │   ├── 4_Procesamiento/README.md      # Prensa de estampado y mordaza de sujeción
    │   │   └── 5_Seleccion/README.md          # Circuito trifásico VFD POWTRAN, motor AC y encoder HSC0
    │   │
    │   ├── Diagrama_P&ID/                     # DIAGRAMAS DE INSTRUMENTACIÓN (Norma ANSI/ISA-S5.1-2009)
    │   │   ├── README.md                      # Reglas de codificación de tags, lazos, burbujas y líneas
    │   │   ├── 1_Transporte/README.md         # Lazos de posición horizontal (ZTC-101) y enclavamientos
    │   │   ├── 2_Alimentacion/README.md       # Lazos de dosificación neumática (ZIC-201) y nivel (BTE-201)
    │   │   ├── 3_Ensamblaje/README.md         # Lazos de giro angular 0-180° y manipulación de componentes
    │   │   ├── 4_Procesamiento/README.md      # Lazos de prensado (ZIC-301) y análisis de observabilidad
    │   │   └── 5_Seleccion/README.md          # Lazos de velocidad analógica (SIC-501) y discriminación
    │   │
    │   └── mockups/                           # PROTOTIPOS UI/UX HMI & SCADA (Norma ISA-101)
    │       └── README.md                      # Wireframes de panel táctil de mesa y Dashboard ERP web
    │
    └── evidencias/                            # BANCO DE PRUEBAS VISUALES Y AUDITORÍA KAIZEN
        ├── README.md                          # Matriz de diagnósticos de campo, causa raíz y severidad
        └── assets/                            # 16 fotografías y diagramas extraídos de la auditoría real
            ├── fig01_portada_maqueta_xk335b.png
            ├── fig02_sensores_capacitivos_motor_trifasico.png
            ├── fig04_carcasa_fracturada_plc_s7200.png
            ├── fig05_sensores_fijados_silicona_cinta.png
            ├── fig06_desalineacion_piston_pinza.png
            ├── fig07_conexion_no_documentada_vfd_giro.png
            ├── fig08_cable_sensor_aislamiento_danado.png
            └── ... (diagramas de bloques y cableados)
```

---

## 🏭 5. Descripción Técnica de las 5 Estaciones de Planta

La línea modular de manufactura flexible XK-335B procesa piezas cilíndricas secuencialmente mediante cinco unidades coordinadas en un bus serial **RS-485 Daisy-Chain**:

1. **Estación 1: Unidad de Transporte (Transmission Unit) — Nodo Maestro**  
   Controlada por una CPU **SIMATIC S7-226 CN (DC/DC/DC)**. Dispone de un servomotor y servodriver **Panasonic MINAS A4** acoplado a un husillo de bolas que traslada un carro con manipulador de 3 GDL (elevación neumática, avance horizontal y pinza angular).
2. **Estación 2: Unidad de Alimentación (Feeding Unit) — Nodo 2**  
   Controlada por una CPU **SIMATIC S7-224 CN**. Aloja piezas de trabajo en una tolva tubular vertical de gravedad, detectadas por un sensor fotoeléctrico **Omron E3Z-LS61**, y expulsadas a la posición de recogida mediante un cilindro compacto **SMC CQ2**.
3. **Estación 3: Unidad de Procesamiento (Processing Unit) — Nodo 3**  
   Controlada por una CPU **SIMATIC S7-224 CN**. Retiene mecánicamente la pieza mediante una mordaza lateral accionada por cilindro guiado **SMC MGPM** y simula punzonado/estampado mediante un cilindro neumático de prensa vertical monitoreado por reed switches **SMC D-C73**.
4. **Estación 4: Unidad de Ensamblaje (Assembly Unit) — Nodo 4**  
   Controlada por una CPU **SIMATIC S7-226 CN**. Dispone de un actuador neumático rotativo oscilante (0° a 180°) y pinza angular **SMC MHC2-16D** para tomar tapas o pasadores desde un almacén auxiliar e insertarlos en la base.
5. **Estación 5: Unidad de Selección (Sorting Unit) — Nodo 5**  
   Controlada por una CPU **SIMATIC S7-224XP CN**. Cuenta con una cinta transportadora accionada por motor asíncrono trifásico y variador de frecuencia **POWTRAN PT9100A** (consigna analógica de 0 a 10 VDC desde salida `AQW0` y retroalimentación de velocidad por encoder incremental de 1000 PPR en `HSC0`). Clasifica piezas metálicas (mediante sensor inductivo LM18) y plásticas (mediante sensor capacitivo Winston CM18) hacia tolvas independientes.

---

## 🛠️ 6. Resumen de la Auditoría Kaizen (Discrepancias Físicas Detectadas)

La inspección física cable a cable del Laboratorio 1 contrastó la planta real contra los esquemas legados, identificando discrepancias de alta criticidad:
* **Rectificación de Motor en Selección:** Se constató que el accionamiento es un motor asíncrono trifásico alimentado por VFD POWTRAN PT9100A (220 VAC mono a tri), descartando afirmaciones históricas erróneas sobre motores paso a paso.
* **Presencia de Sensores Capacitivos:** Se integró al inventario el sensor Winston CM18-3008NA para discriminación dieléctrica de plásticos.
* **Ruptura de Causalidad en Prensa:** Se formuló la pérdida de observabilidad ($C = [0\ 0]$) ante fallas en los sensores magnéticos SMC pegados con silicona, demostrando el riesgo de bloqueo infinito (*deadlock*).
* **Seguridad Crítica:** Se detectó el pulsador de parada de emergencia `QS-101` mecánicamente trabado en '1' lógico permanente, impidiendo la desenergización segura del manipulador.
* **Conexión de Marcha Inversa No Documentada:** Se descubrió un cable directo entre el PLC de selección y el borne `REV` del VFD que no figuraba en ningún esquema previo.

---

## 🌿 7. Metodología de Trabajo y Gestión Git (Lab 3)

El equipo aplica estándares profesionales de control de versiones y flujo colaborativo:
* **Estrategia de Ramificación (Branching por Subsistema):**
  - `main`: Rama de producción y versiones consolidadas oficiales.
  - `feature/transporte-maestro-rs485`: Desarrollos de la Estación 1.
  - `feature/alimentacion-s7200`: Desarrollos de la Estación 2.
  - `feature/procesamiento-pinza`: Desarrollos de la Estación 3.
  - `feature/ensamblaje-rotativo`: Desarrollos de la Estación 4.
  - `feature/seleccion-vfd-motor`: Desarrollos de la Estación 5.
  - `feature/database-model`: Modelado relacional y scripts SQL.
* **Revisiones de Código (Pull Requests):** La fusión hacia `main` exige aprobación previa con revisión de cumplimiento de normas ISA/IEC y verificación de integridad referencial SQL.
* **Commits Convencionales:** Registro de cambios con prefijos estandarizados (`docs(isa):`, `feat(sql):`, `fix(elec):`, `audit(kaizen):`).

---

## 🚀 8. Navegación Rápida por el Repositorio

* 🌐 **[Portal Web en Cloudflare Pages](index.html):** Visor interactivo de documentos, planos y galería de evidencias.
* 📄 **[Informe Técnico Lab 1 (PDF)](Documentacion/ingenieria-inversa/Informe_Laboratorio_1.pdf):** Documento oficial de auditoría fenomenológica.
* ⚡ **[Esquemas Eléctricos (IEC)](Documentacion/Planos/Diagrama_Electrico/):** Mapeo de bornes, tableros y distribución 220VAC/24VDC.
* 📊 **[Diagramas P&ID (ISA)](Documentacion/Planos/Diagrama_P&ID/):** Simbología funcional, lazos de control e instrumentación.
* 📑 **[Catálogo de Datasheets](Documentacion/ingenieria-inversa/datasheets/):** Manuales técnicos de Siemens, Panasonic, POWTRAN, SMC y Omron.
* 🗄️ **[Base de Datos y Scripts SQL](database/):** Esquema DDL en 3FN, datos semilla y triggers de telemetría.
* 📸 **[Galería de Evidencias Kaizen](Documentacion/evidencias/):** Fotografías de auditoría estática y diagnósticos de campo.
* 🖥️ **[Mockups HMI & SCADA](Documentacion/Planos/mockups/):** Prototipos visuales de paneles de operador bajo norma ISA-101.

---

## ⚙️ 9. Automatización y Construcción de Catálogos (Cloudflare Pages CI/CD)

El repositorio cuenta con un pipeline automatizado de descubrimiento y catalogación de recursos técnicos para garantizar que cualquier nuevo plano, informe, script SQL o ficha técnica se incorpore al portal web sin intervención manual.

### Comando de Construcción
```bash
# Ejecución vía NPM
npm run build

# O ejecución directa con Node.js
node scripts/build-catalog.js
```

### Flujo de Indexación Automática
1. **Escaneo Recursivo:** Recorre directorios de planos P&ID, esquemas eléctricos IEC, mockups ISA-101, informes de auditoría, scripts SQL y evidencias fotográficas.
2. **Detección Automática de Estación:** Deduce la celda de manufactura a partir de la jerarquía de carpetas (`1_Transporte/` $\to$ Estación 1, `2_Alimentacion/` $\to$ Estación 2, etc.) o palabras clave.
3. **Mapeo Flexible de Datasheets (`docs/datasheets_config.json`):** Permite configurar fichas técnicas compartidas o multilínea (`["1", "5"]`, `"all"`). Si se agrega un nuevo PDF a `datasheets/` sin previa configuración, el motor lo asigna automáticamente como `General / Sin asignar` con prioridad 65 y visibilidad en `Todas las Estaciones`, evitando que quede oculto.
4. **Manejo de Formatos CAD y Binarios:** Archivos `.dwg`, `.dxf` o `.zip` se marcan con `isDownloadOnly: true`, habilitando botones de descarga directa con el atributo `download` para evitar visualizadores rotos dentro de iframes.
5. **Configuración en Cloudflare Pages:**
   - **Build command:** `node scripts/build-catalog.js` (o `npm run build`)
   - **Build output directory:** `/` (raíz del repositorio)
   - **Root directory:** `/`