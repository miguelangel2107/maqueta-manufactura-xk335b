-- =============================================================================
-- PROYECTO: Maqueta de Manufactura Flexible XK-335B (Fase 1 - II/2026)
-- SCRIPT: 03_indices_optimizacion.sql
-- DESCRIPCIÓN: Índices B-Tree, particionamiento conceptual y disparadores (triggers)
--              para optimización de consultas de telemetría en tiempo real.
-- =============================================================================

-- 1. Índices B-Tree para optimización de consultas de series temporales
-- En telemetría industrial, la gran mayoría de consultas filtran por variable y rango temporal:
-- SELECT * FROM telemetria_historica WHERE id_variable = $1 AND timestamp_utc BETWEEN $2 AND $3;
CREATE INDEX IF NOT EXISTS idx_telemetria_var_timestamp 
ON telemetria_historica (id_variable, timestamp_utc DESC);

-- Índice para búsqueda de mediciones anómalas o con degradación de calidad
CREATE INDEX IF NOT EXISTS idx_telemetria_calidad 
ON telemetria_historica (calidad_dato) 
WHERE calidad_dato != 'GOOD';

-- Índice para búsqueda rápida de instrumentos por Tag ISA y por Estación
CREATE INDEX IF NOT EXISTS idx_instrumentos_estacion 
ON instrumentos (id_estacion);

CREATE INDEX IF NOT EXISTS idx_instrumentos_tag 
ON instrumentos (tag_isa);

-- Índice para acelerar la correlación entre alarmas activas no reconocidas
CREATE INDEX IF NOT EXISTS idx_alarmas_pendientes 
ON registro_eventos_alarma (id_alarma, estado_reconocimiento) 
WHERE estado_reconocimiento = FALSE;

-- 2. Función Trigger: Registro automático de disparo de alarmas ante telemetría fuera de umbral
CREATE OR REPLACE FUNCTION fn_evaluar_umbral_telemetria()
RETURNS TRIGGER AS $$
DECLARE
    rec_alarma RECORD;
BEGIN
    -- Evaluar reglas de alarma configuradas para la variable entrante
    FOR rec_alarma IN 
        SELECT id_alarma, condicion_disparo, valor_umbral, nivel_severidad, mensaje_operador
        FROM alarmas_definicion
        WHERE id_variable = NEW.id_variable
    LOOP
        IF (rec_alarma.condicion_disparo = 'MAYOR_QUE' AND NEW.valor_medido > rec_alarma.valor_umbral) OR
           (rec_alarma.condicion_disparo = 'MENOR_QUE' AND NEW.valor_medido < rec_alarma.valor_umbral) OR
           (rec_alarma.condicion_disparo = 'IGUAL_A' AND NEW.valor_medido = rec_alarma.valor_umbral) THEN
           
            -- Insertar registro de evento de alarma si no hay una activa reciente idéntica
            INSERT INTO registro_eventos_alarma (
                id_alarma, 
                timestamp_activacion, 
                valor_disparo, 
                estado_reconocimiento
            ) VALUES (
                rec_alarma.id_alarma, 
                NEW.timestamp_utc, 
                NEW.valor_medido, 
                FALSE
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para invocar la evaluación en cada inserción de telemetría
DROP TRIGGER IF EXISTS trg_evaluar_telemetria ON telemetria_historica;
CREATE TRIGGER trg_evaluar_telemetria
AFTER INSERT ON telemetria_historica
FOR EACH ROW
EXECUTE FUNCTION fn_evaluar_umbral_telemetria();

-- Fin de archivo 03_indices_optimizacion.sql
