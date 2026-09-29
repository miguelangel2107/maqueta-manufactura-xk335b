# 🗄️ Persistencia de Datos y Arquitectura de Telemetría (ETN-1000)

Bienvenido al módulo de persistencia relacional y modelado de datos para la **Maqueta de Manufactura Flexible XK-335B**, desarrollado en el marco de la asignatura **Bases de Datos (ETN-1000)** en concurrencia con **Control II (ETN-902)** y **Aplicación de Técnicas de Control (ETN-1034)** para la **Fase 1 (Gestión II/2026)**.

---

## 📌 1. Propósito del Módulo
Este directorio custodia los modelos lógicos, especificaciones de diccionario de datos y scripts DDL/DML de base de datos relacional encargados de:
1. Almacenar la **telemetría histórica** de variables de proceso (PV, MV, DV) adquiridas desde los 5 PLCs Siemens SIMATIC S7-200.
2. Registrar eventos de **alarmas industriales, fallas de lazo y paradas de emergencia** para auditoría en tiempo real.
3. Centralizar el **control de acceso y logs de operadores** para garantizar la trazabilidad operacional de la planta.
4. Mantener total coherencia semántica con los planos de instrumentación **ANSI/ISA-S5.1-2009** y esquemas **IEC**.

---

## 📐 2. Normativa Técnica y Marco Arquitectónico

### 2.1. Arquitectura de Telemetría en 3 Capas
El flujo de datos de la planta se estructura bajo un modelo desacoplado:

```text
+-----------------------------------------------------------------------------------+
|                        CAPA 1: DISPOSITIVOS DE CAMPO                              |
|   5x PLCs Siemens S7-200 (CPU 224, 224XP, 226) + VFD POWTRAN + Servo Panasonic    |
|   Topología: Bus multipunto RS-485 (Daisy-Chain) a 9600/19200 bps                 |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ [Lectura periódica Modbus RTU / PPI]
+-----------------------------------------------------------------------------------+
|                     CAPA 2: MIDDLEWARE DE ADQUISICIÓN / GATEWAY                   |
|   Servicio industrial (Python / Node.js) sobre PC de Control / Gateway Industrial |
|   Conversión de tramas binarias, empaquetado JSON y validación de rangos seguros  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ [Pool de conexiones TCP / SSL]
+-----------------------------------------------------------------------------------+
|                     CAPA 3: MOTOR DE PERSISTENCIA RELACIONAL                      |
|   Base de datos PostgreSQL 14+ / MySQL 8.0 normalizada en 3FN                     |
|   Tablas de series temporales, catálogo de activos, alarmas activas y auditoría   |
+-----------------------------------------------------------------------------------+
```

### 2.2. Rigurosidad en Formas Normales (1FN, 2FN, 3FN)
Para cumplir con los criterios de evaluación de la Fase 1, el esquema relacional garantiza:
- **Primera Forma Normal (1FN):** Todos los atributos son atómicos (sin listas de sensores empaquetadas en cadenas). Cada tupla posee una llave primaria única e irrepetible.
- **Segunda Forma Normal (2FN):** Toda columna que no sea clave depende de manera funcional y completa de la llave primaria compuesta (se desacoplan las variables de la estación en entidades intermedias de instrumentos).
- **Tercera Forma Normal (3FN):** Inexistencia de dependencias transitivas. Los metadatos de los fabricantes, rangos de escala y unidades se asocian al instrumento y no a la lectura histórica de telemetría.

---

## 📂 3. Índice Descriptivo de Archivos

| Archivo / Directorio | Tipo | Descripción Técnica |
| :--- | :---: | :--- |
| [`scripts/01_schema_telemetria_3fn.sql`](scripts/01_schema_telemetria_3fn.sql) | DDL SQL | Script de creación de tablas (`estaciones`, `instrumentos`, `variables_proceso`, `telemetria_historica`, `alarmas_definicion`, `registro_eventos_alarma`, `operadores`, `logs_sistema`) con restricciones de integridad referencial. |
| [`scripts/02_seed_data_xk335b.sql`](scripts/02_seed_data_xk335b.sql) | DML SQL | Población inicial con las 5 estaciones, catálogo auditado de sensores y actuadores con sus respectivos Tags ISA-S5.1, diagnósticos Kaizen y usuarios operadores. |
| [`scripts/03_indices_optimizacion.sql`](scripts/03_indices_optimizacion.sql) | SQL Adv. | Índices B-Tree compuestos para optimizar consultas de series de tiempo y disparadores (*triggers*) para detección automática de violaciones de umbral. |

---

## 🛠️ 4. Guía para Colaboradores (ETN-1000)

1. **Instalación y Despliegue Local:**
   ```bash
   # Crear base de datos local en PostgreSQL
   psql -U postgres -c "CREATE DATABASE xk335b_telemetria;"
   
   # Ejecutar scripts en orden estricto de dependencias
   psql -U postgres -d xk335b_telemetria -f database/scripts/01_schema_telemetria_3fn.sql
   psql -U postgres -d xk335b_telemetria -f database/scripts/02_seed_data_xk335b.sql
   psql -U postgres -d xk335b_telemetria -f database/scripts/03_indices_optimizacion.sql
   ```

2. **Convenciones de Nomenclatura:**
   - Tablas y columnas en minúsculas con guiones bajos (`snake_case`).
   - Nombres de tablas en plural (`instrumentos`, `estaciones`, `operadores`).
   - Llaves foráneas con prefijo `id_` seguido del singular de la tabla referenciada (`id_estacion`, `id_instrumento`).
   - Los valores de los campos `tag_isa` deben coincidir exactamente con los símbolos de los diagramas P&ID del directorio `/Documentacion/Planos/Diagrama_P&ID/`.

3. **Flujo de Contribución Git:**
   - Todo cambio a esquemas debe generarse en la rama `feature/database-model`.
   - No modificar scripts ya consolidados; agregar scripts de migración numerados incrementalmente (ej. `04_migration_modbus_fields.sql`).
