# Maqueta de Proceso de Manufactura Flexible (XK-335B)
### Proyecto Integrado de Control Industrial y Sistemas Computacionales
**Universidad Mayor de San Andrés (UMSA) — Facultad de Ingeniería**  
**Carrera de Ingeniería Electrónica — Gestión II/2026**

---

## 📌 1. Información General del Proyecto
Este repositorio alberga la documentación técnica, diagramas de instrumentación (ANSI/ISA-S5.1), esquemas de potencia y mando (IEC/IEEE), modelado de persistencia de datos (PostgreSQL) y código fuente de control para la **Planta de Manufactura Flexible**. El desarrollo se enmarca en la **Fase 1: Auditoría Kaizen e Ingeniería Inversa** del programa inter-asignaturas concurrente.

* **Docente Auditor:** Ing. Jorge Antonio Nava Amador
* **Auxiliares de Docencia:**
  * Aux. Limber Ajnota Cahuaya (ETN-1034)
  * Aux. Fabian Plata Vargas (ETN-902)
  * Aux. Franz Choque (ETN-1000)

---

## 👥 2. Integrantes del Equipo de Trabajo

| Estudiante | Asignatura | Rol Principal |
| :--- | :---: | :--- |
| **Univ. López Rodríguez Miguel Ángel** | **ETN-1034** | **Auditoría de Hardware y Red RS-485** |
| Univ. Wilson David Huanca Challco | ETN-1034 | Inspección de Procesamiento y Análisis de Ruptura de Lazo |
| Univ. Siñani Canaza Juan Carlos | ETN-1034 | Mapeo I/O de PLCs y Diagnóstico de Actuadores |
| Univ. Henrry Jherson Torrez Patty | ETN-902 | Clasificación de Variables (PV, MV, DV) y Causalidad Dinámica |
| Univ. Gandarillas Conde Valeria Erika | ETN-1000 | Modelado Entidad-Relación y Normalización (3FN) |
| Univ. Quisbert Bautista Paul Fernando | ETN-1000 | Arquitectura de Telemetría (3 Capas) y Diccionario de Datos |
| Univ. Cuevas Perez Mauricio | ETN-1000 | Análisis de Infraestructura Local y Gestión de Scripts SQL |

---

## 3. Mapa de Flujo Documental y Arquitectura del Repositorio

A continuación se presenta la trazabilidad metodológica y el flujo de interconexión técnica entre la documentación, el diseño CAD y el backend de base de datos:

```mermaid
flowchart TB
    classDef root fill:#0d47a1,stroke:#0d47a1,stroke-width:2px,color:#fff;
    classDef folder fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef doc fill:#ffffff,stroke:#37474f,stroke-width:1px,color:#263238;
    classDef script fill:#ede7f6,stroke:#512da8,stroke-width:1px,color:#311b92;

    Repo["Repositorio: maqueta-manufactura-xk335b"]:::root
    Documentation["📁 documentation/"]:::folder
    Database["📁 database/"]:::folder
    DocInv["📁 manuales_ingenieria_inversa/"]:::folder
    DocPlanos["📁 planos_isa/"]:::folder

    Lab1PDF["Informe_Laboratorio_1.pdf"]:::doc
    Datasheets["datasheets/: S7-200, VFD, Sensores"]:::doc
    ReadmeInv["README.md: Diagnóstico Kaizen"]:::doc

    PlanosCAD["Planos P&ID y Eléctricos (.DWG / .PDF)"]:::doc
    ReadmePlanos["README.md: Normas ISA 5.1 e IEC"]:::doc
    Mockups["mockups/: HMI y Dashboard ERP"]:::doc

    ReadmeDB["README.md: Arquitectura 3 Capas"]:::doc
    ScriptsSQL["scripts/: Modelo E-R, DDL y Triggers"]:::script

    Repo --> Documentation
    Repo --> Database
    Documentation --> DocInv
    Documentation --> DocPlanos
    DocInv --> Lab1PDF
    DocInv --> Datasheets
    DocInv --> ReadmeInv
    DocPlanos --> PlanosCAD
    DocPlanos --> ReadmePlanos
    DocPlanos --> Mockups
    Database --> ReadmeDB
    Database --> ScriptsSQL

    %% Relaciones de Ingeniería Interdisciplinar
    Lab1PDF ==>|1. Mapeo de Señales| PlanosCAD
    PlanosCAD ==>|2. Tags ISA 5.1| Mockups
    Mockups ==>|3. Variables de Persistencia| ScriptsSQL
    ScriptsSQL ==>|4. Telemetría de Campo| ReadmeDB

    linkStyle 12,13,14,15 stroke:#d84315,stroke-width:2px,color:#bf360c;
```
---

## 🏭 4. Descripción Técnica de la Planta (Manufactura Flexible)
La planta modular se compone de 5 estaciones de trabajo automatizadas mediante controladores lógicos programables **Siemens SIMATIC S7-200 CN** interconectados en un bus multipunto serial **RS-485** bajo topología en cascada (*Daisy-Chain*):

1. **Unidad de Alimentación (Feeding Unit):** Controlada por CPU 224 CN. Administra el dispensado por gravedad y eyección neumática de piezas base.
2. **Unidad de Procesamiento (Processing Unit):** Controlada por CPU 224 CN. Ejecuta la simulación de estampado y maquinado mediante cilindros neumáticos y mordaza de sujeción.
3. **Unidad de Ensamblaje (Assembly Unit):** Controlada por CPU 226 CN. Montaje de tapas y pasadores mediante actuador rotativo y pinza neumática.
4. **Unidad de Transporte (Transmission Unit):** Controlada por CPU 226 CN (DC/DC/DC). **Nodo Maestro del bus RS-485**; gestiona la cinemática del manipulador de 3 GDL acoplado a un servomotor Panasonic y transportador lineal.
5. **Unidad de Selección (Sorting Unit):** Controlada por CPU 224XP CN. Clasificación selectiva de materiales (metálicos y no metálicos) sobre cinta transportadora accionada por motor trifásico y VFD POWTRAN PT9100A (consigna analógica 0-10 V).

---

## 📂 5. Estructura del Repositorio
La organización de directorios cumple con la jerarquía estandarizada de ingeniería:

```text
├── database/
│   └── scripts/                  # Scripts DDL/DML, modelos CASE y esquemas E-R normalizados
├── documentation/
│   ├── manuales_ingenieria_inversa/ # Fichas técnicas de sensores, actuadores y reportes de campo
│   └── planos_isa/               # Planos P&ID (ANSI/ISA-S5.1) y esquemas eléctricos (IEC) en DWG/PDF
├── docs/                         # Entorno de visualización y despliegue web
└── README.md                     # Memoria descriptiva principal del proyecto
```

---

## 🛠️ 6. Resumen de Hallazgos y Auditoría Kaizen (Lab 1)
Durante la inspección cable por cable y análisis fenomenológico se identificaron las siguientes discrepancias críticas respecto a los antecedentes históricos:
* **Identificación de Actuador en Selección:** Se rectificó que el accionamiento principal es un motor AC trifásico alimentado por VFD POWTRAN PT9100A (entrada monofásica 220 VAC, salida trifásica), desmintiendo reportes históricos erróneos.
* **Sensores Omitidos:** Incorporación al inventario de los sensores capacitivos Winston CM18 en la unidad de selección.
* **Ruptura de Causalidad y Lazo Abierto:** Demostración analítica de pérdida de observabilidad ($C = [0\ 0]$) y riesgo de colisión o *deadlock* ante fallas en los sensores magnéticos (SMC D-C73) de la prensa de procesado.
* **Seguridad Crítica:** Detección de avería mecánica interna en la parada de emergencia (Tag QS) de la estación de transporte (bloqueada en '1' lógico).

---

## 7. Metodología de Trabajo y Gestión del Ciclo de Vida (Git / Kaizen)

En cumplimiento con los requerimientos pedagógicos y de control de versiones del Laboratorio Nº 3 (Fase 1: Auditoría Kaizen e Ingeniería Inversa), la escuadra opera bajo un flujo de desarrollo concurrente estructurado por asignaturas:

### 7.1. Estructura y Custodia Documental (ETN-902)
* **Trazabilidad de Planos e Informes:** Los diagramas P&ID bajo norma ANSI/ISA-S5.1 y esquemas eléctricos bajo norma IEC se versionan de forma incremental en el directorio `/documentation/planos_isa/`.
* **Historial de Modificaciones:** Cada ajuste físico o corrección sobre la instrumentación se registra mediante commits atómicos descriptivos en consola (`git commit -m "docs(isa): ..."`), respaldando la evolución hacia la Versión 2.0 de los planos de planta.

### 7.2. Ramificaciones Operativas y Revisión Técnica (ETN-1034)
* **Aislamiento por Estación (Branching):** Para evitar sobreescritura accidental, las modificaciones de hardware, mapeo I/O de los PLCs Siemens S7-200 y rutinas de automatización se desarrollan en ramas específicas por subsistema:
  * `feature/alimentacion-s7200`
  * `feature/procesamiento-pinza`
  * `feature/transporte-maestro-rs485`
  * `feature/seleccion-vfd-motor`
* **Flujo de Integración (Pull Requests & Code Review):** La incorporación de cambios a la rama principal (`main`) se ejecuta exclusivamente mediante *Pull Requests* auditados en la interfaz de GitHub, garantizando que todo cambio cumpla con las normas técnicas antes de su fusión (*merge*).

### 7.3. Persistencia y Diccionario de Datos (ETN-1000)
* **Modelado Relacional Normalizado:** Los scripts de base de datos DDL/DML para PostgreSQL y los esquemas en herramientas CASE se custodian en `/database/scripts/`, garantizando el cumplimiento de la Tercera Forma Normal (3FN).
* **Consistencia Semántica:** Se audita que las tablas de telemetría y alarmas empleen exactamente la misma nomenclatura de variables y *tags* (PV, MV, DV) definida en los planos P&ID.

### 7.4. Criterio de Calificación (Definition of Done)
* **Trazabilidad Total:** Registro obligatorio de actividad (*commits*) de la totalidad de los 7 integrantes del equipo interdisciplinar en el historial del repositorio (`git log --oneline --graph`).
* **Filtro de Seguridad:** No se autoriza el despliegue de código en hardware físico ni energización en caliente sin la auditoría previa de las simulaciones y la aprobación formal de la documentación técnica.