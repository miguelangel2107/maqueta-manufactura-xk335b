-- =============================================================================
-- PROYECTO: Maqueta de Manufactura Flexible XK-335B (Fase 1 - II/2026)
-- ASIGNATURA: Bases de Datos (ETN-1000) en concurrencia con ETN-902 y ETN-1034
-- UNIVERSIDAD: Universidad Mayor de San Andrés (UMSA) - Facultad de Ingeniería
-- SCRIPT: 01_schema_telemetria_3fn.sql
-- DESCRIPCIÓN: Definición DDL normalizada en Tercera Forma Normal (3FN)
--              para telemetría industrial, alarmas, instrumentos y auditoría Kaizen.
-- =============================================================================

-- Limpieza preventiva de esquema si se ejecuta en entorno de pruebas
DROP TABLE IF EXISTS logs_sistema CASCADE;
DROP TABLE IF EXISTS registro_eventos_alarma CASCADE;
DROP TABLE IF EXISTS alarmas_definicion CASCADE;
DROP TABLE IF EXISTS telemetria_historica CASCADE;
DROP TABLE IF EXISTS variables_proceso CASCADE;
DROP TABLE IF EXISTS instrumentos CASCADE;
DROP TABLE IF EXISTS operadores CASCADE;
DROP TABLE IF EXISTS estaciones CASCADE;

-- -----------------------------------------------------------------------------
-- 1. TABLA: estaciones
-- Entidad que modela las 5 estaciones físicas de la línea de manufactura XK-335B.
-- Cumple 1FN, 2FN y 3FN (todos los atributos dependen exclusivamente de id_estacion).
-- -----------------------------------------------------------------------------
CREATE TABLE estaciones (
    id_estacion SERIAL PRIMARY KEY,
    codigo_estacion VARCHAR(10) NOT NULL UNIQUE,       -- Ej: 'EST-01', 'EST-02'
    nombre_estacion VARCHAR(100) NOT NULL,             -- Ej: 'Unidad de Transporte'
    nodo_rs485 SMALLINT NOT NULL CHECK (nodo_rs485 >= 1 AND nodo_rs485 <= 31),
    es_maestro_bus BOOLEAN NOT NULL DEFAULT FALSE,
    plc_modelo VARCHAR(50) NOT NULL,                   -- Ej: 'SIMATIC S7-226 CN DC/DC/DC'
    plc_direccion_ip VARCHAR(45) NULL,                 -- IPv4 o IPv6 si aplica módulo CP-243
    voltaje_alimentacion VARCHAR(20) NOT NULL DEFAULT '24 VDC / 220 VAC',
    descripcion_funcional TEXT NOT NULL,
    estado_operativo VARCHAR(20) NOT NULL DEFAULT 'OPERATIVO' CHECK (estado_operativo IN ('OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO', 'AUDITORIA'))
);

COMMENT ON TABLE estaciones IS 'Catálogo maestro de las 5 estaciones de trabajo de la maqueta XK-335B.';
COMMENT ON COLUMN estaciones.nodo_rs485 IS 'Dirección de nodo físico asignada en el bus multipunto RS-485.';

-- -----------------------------------------------------------------------------
-- 2. TABLA: instrumentos
-- Modela cada sensor, transductor, actuador, variador o electroválvula instalada.
-- Cumple 3FN: llave foránea a estaciones, sin atributos transitivos.
-- -----------------------------------------------------------------------------
CREATE TABLE instrumentos (
    id_instrumento SERIAL PRIMARY KEY,
    id_estacion INT NOT NULL REFERENCES estaciones(id_estacion) ON DELETE RESTRICT,
    tag_isa VARCHAR(25) NOT NULL UNIQUE,              -- Nomenclatura ANSI/ISA-S5.1 (Ej: 'ZT-101', 'SI-501')
    nombre_tecnico VARCHAR(150) NOT NULL,
    tipo_instrumento VARCHAR(50) NOT NULL,            -- 'SENSOR_INDUCTIVO', 'VARIADOR_FRECUENCIA', 'CILINDRO_NEUMATICO'
    fabricante VARCHAR(80) NOT NULL,                  -- 'Siemens', 'Omron', 'SMC', 'POWTRAN', 'Panasonic'
    modelo_comercial VARCHAR(80) NOT NULL,            -- 'E3Z-LS61', 'PT9100A', 'MINAS A4', 'D-C73'
    tipo_senal VARCHAR(30) NOT NULL CHECK (tipo_senal IN ('DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'ANALOG_INPUT', 'ANALOG_OUTPUT', 'SERIAL_COMM')),
    direccion_io_plc VARCHAR(15) NOT NULL,            -- Dirección física en PLC (Ej: 'I0.0', 'Q0.2', 'AIW0', 'AQW0')
    rango_min NUMERIC(10,3) NULL,
    rango_max NUMERIC(10,3) NULL,
    unidad_ingenieria VARCHAR(25) NULL,               -- 'mm', 'RPM', 'Hz', 'V', 'bar', 'boolean'
    observacion_kaizen TEXT NULL                      -- Registra anomalías físicas (cinta, silicona, roturas)
);

COMMENT ON TABLE instrumentos IS 'Inventario auditado de instrumentación y actuadores según norma ANSI/ISA-S5.1.';

-- -----------------------------------------------------------------------------
-- 3. TABLA: variables_proceso
-- Clasificación analítica de señales para la teoría de control (ETN-902).
-- Variables Manipuladas (MV), Variables Controladas/Proceso (PV) y Perturbaciones (DV).
-- -----------------------------------------------------------------------------
CREATE TABLE variables_proceso (
    id_variable SERIAL PRIMARY KEY,
    id_instrumento INT NOT NULL REFERENCES instrumentos(id_instrumento) ON DELETE RESTRICT,
    clasificacion_control VARCHAR(5) NOT NULL CHECK (clasificacion_control IN ('PV', 'MV', 'DV')),
    codigo_variable VARCHAR(30) NOT NULL UNIQUE,      -- Ej: 'VAR_VEL_CINTA_PV', 'VAR_POS_EJE_X_PV'
    descripcion VARCHAR(200) NOT NULL,
    valor_nominal NUMERIC(12,4) NULL,
    valor_seguridad_min NUMERIC(12,4) NULL,
    valor_seguridad_max NUMERIC(12,4) NULL,
    tiempo_muerto_estimado_s NUMERIC(8,4) DEFAULT 0.0000
);

COMMENT ON TABLE variables_proceso IS 'Relación de causalidad y clasificación matemática (PV, MV, DV) para control.';

-- -----------------------------------------------------------------------------
-- 4. TABLA: telemetria_historica
-- Registro en serie temporal de los valores adquiridos de campo.
-- -----------------------------------------------------------------------------
CREATE TABLE telemetria_historica (
    id_telemetria BIGSERIAL PRIMARY KEY,
    id_variable INT NOT NULL REFERENCES variables_proceso(id_variable) ON DELETE RESTRICT,
    timestamp_utc TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_medido NUMERIC(12,4) NOT NULL,
    calidad_dato VARCHAR(15) NOT NULL DEFAULT 'GOOD' CHECK (calidad_dato IN ('GOOD', 'BAD', 'UNCERTAIN', 'SIMULATED')),
    latencia_ms INT NULL                              -- Latencia de transporte desde PLC por bus RS-485
);

COMMENT ON TABLE telemetria_historica IS 'Serie temporal de telemetría de campo adquirida por el middleware.';

-- -----------------------------------------------------------------------------
-- 5. TABLA: alarmas_definicion
-- Reglas de control para la activación de eventos críticos y protección física.
-- -----------------------------------------------------------------------------
CREATE TABLE alarmas_definicion (
    id_alarma SERIAL PRIMARY KEY,
    id_variable INT NOT NULL REFERENCES variables_proceso(id_variable) ON DELETE RESTRICT,
    codigo_alarma VARCHAR(30) NOT NULL UNIQUE,        -- Ej: 'ALM-EMERG-TRANS-01', 'ALM-COLIS-PROC-02'
    condicion_disparo VARCHAR(20) NOT NULL CHECK (condicion_disparo IN ('MAYOR_QUE', 'MENOR_QUE', 'IGUAL_A', 'DEADLOCK_TIMEOUT', 'DISCREPANCIA_SENSOR')),
    valor_umbral NUMERIC(12,4) NULL,
    nivel_severidad VARCHAR(20) NOT NULL CHECK (nivel_severidad IN ('INFO', 'WARNING', 'CRITICAL', 'EMERGENCY_STOP')),
    tiempo_persistencia_ms INT NOT NULL DEFAULT 0,
    mensaje_operador TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: registro_eventos_alarma
-- Historial transaccional de disparos de alarma, resolución y reconocimiento.
-- -----------------------------------------------------------------------------
CREATE TABLE registro_eventos_alarma (
    id_evento BIGSERIAL PRIMARY KEY,
    id_alarma INT NOT NULL REFERENCES alarmas_definicion(id_alarma) ON DELETE RESTRICT,
    timestamp_activacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    timestamp_desactivacion TIMESTAMPTZ NULL,
    valor_registrado NUMERIC(12,4) NOT NULL,
    estado_reconocimiento BOOLEAN NOT NULL DEFAULT FALSE,
    operador_reconocio VARCHAR(100) NULL,
    timestamp_reconocimiento TIMESTAMPTZ NULL,
    accion_correctiva_aplicada TEXT NULL
);

-- -----------------------------------------------------------------------------
-- 7. TABLA: operadores
-- Usuarios con permisos para operar, auditar o supervisar la planta.
-- -----------------------------------------------------------------------------
CREATE TABLE operadores (
    id_operador SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    rol_acceso VARCHAR(30) NOT NULL CHECK (rol_acceso IN ('OPERADOR_PLANTA', 'INGENIERO_CONTROL', 'AUDITOR_KAIZEN', 'ADMINISTRADOR')),
    correo_institucional VARCHAR(120) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- -----------------------------------------------------------------------------
-- 8. TABLA: logs_sistema
-- Pistas de auditoría (Audit Trail) para trazabilidad de comandos y accesos.
-- -----------------------------------------------------------------------------
CREATE TABLE logs_sistema (
    id_log BIGSERIAL PRIMARY KEY,
    id_operador INT NULL REFERENCES operadores(id_operador) ON DELETE SET NULL,
    timestamp_evento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modulo_origen VARCHAR(50) NOT NULL,               -- 'HMI_LOCAL', 'ERP_WEB', 'PLC_SYNC', 'KAIZEN_AUDIT'
    accion_realizada VARCHAR(100) NOT NULL,
    estacion_afectada INT NULL REFERENCES estaciones(id_estacion) ON DELETE SET NULL,
    ip_cliente VARCHAR(45) NULL,
    detalle_payload TEXT NULL
);

-- Fin de archivo 01_schema_telemetria_3fn.sql
