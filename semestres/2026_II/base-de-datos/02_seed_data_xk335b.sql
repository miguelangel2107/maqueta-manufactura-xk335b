-- =============================================================================
-- PROYECTO: Maqueta de Manufactura Flexible XK-335B (Fase 1 - II/2026)
-- SCRIPT: 02_seed_data_xk335b.sql
-- DESCRIPCIÓN: Inserción de datos maestros de las 5 estaciones, catálogo de
--              instrumentación auditado en Lab 1, variables de control y alarmas.
-- =============================================================================

-- 1. Inserción de Estaciones de la Maqueta
INSERT INTO estaciones (id_estacion, codigo_estacion, nombre_estacion, nodo_rs485, es_maestro_bus, plc_modelo, descripcion_funcional, estado_operativo) VALUES
(1, 'EST-01', 'Unidad de Transporte (Transmission Unit)', 1, TRUE, 'SIMATIC S7-226 CN (DC/DC/DC)', 'Nodo Maestro del bus RS-485. Controla el servomotor Panasonic MINAS A4, cinemática del manipulador de 3 GDL y coordinación general de la planta.', 'AUDITORIA'),
(2, 'EST-02', 'Unidad de Alimentación (Feeding Unit)', 2, FALSE, 'SIMATIC S7-224 CN (AC/DC/Relé)', 'Administra el almacenamiento en tolva vertical, sensado de nivel de piezas y eyección neumática por cilindro SMC CQ2.', 'OPERATIVO'),
(3, 'EST-03', 'Unidad de Procesamiento (Processing Unit)', 3, FALSE, 'SIMATIC S7-224 CN (AC/DC/Relé)', 'Ejecuta simulación de prensado y estampado mediante cilindro guiado SMC MGPM y mordaza neumática con detección de carrera.', 'AUDITORIA'),
(4, 'EST-04', 'Unidad de Ensamblaje (Assembly Unit)', 4, FALSE, 'SIMATIC S7-226 CN (AC/DC/Relé)', 'Posicionamiento angular de piezas, suministro de tapas/pasadores y manipulación por pinza angular SMC MHC.', 'OPERATIVO'),
(5, 'EST-05', 'Unidad de Selección (Sorting Unit)', 5, FALSE, 'SIMATIC S7-224XP CN (DC/DC/DC)', 'Cinta transportadora accionada por motor trifásico y VFD POWTRAN PT9100A (0-10V). Discriminación de materiales metálicos y plásticos con empujadores neumáticos.', 'OPERATIVO');

SELECT setval('estaciones_id_estacion_seq', 5, true);

-- 2. Inserción de Instrumentos Auditados (ISA Tags & Diagnóstico Kaizen)
INSERT INTO instrumentos (id_instrumento, id_estacion, tag_isa, nombre_tecnico, tipo_instrumento, fabricante, modelo_comercial, tipo_senal, direccion_io_plc, rango_min, rango_max, unidad_ingenieria, observacion_kaizen) VALUES
-- Estación 1: Transporte
(1, 1, 'QS-101', 'Pulsador de Parada de Emergencia', 'INTERRUPTOR_SEGURIDAD', 'Schneider/Generic', 'XB2-BS542', 'DIGITAL_INPUT', 'I0.0', 0, 1, 'boolean', 'CRÍTICO: Bloqueado mecánicamente en 1 lógico permanente. Requiere recambio urgente.'),
(2, 1, 'ZT-101', 'Final de Carrera Eje X (Home)', 'SENSOR_INDUCTIVO', 'Omron', 'E2B-M12KS04', 'DIGITAL_INPUT', 'I0.1', 0, 1, 'boolean', 'Operativo.'),
(3, 1, 'ZT-102', 'Final de Carrera Eje X (Límite Max)', 'SENSOR_INDUCTIVO', 'Omron', 'E2B-M12KS04', 'DIGITAL_INPUT', 'I0.2', 0, 1, 'boolean', 'Operativo.'),
(4, 1, 'SC-101', 'Servodriver Panasonic MINAS A4', 'CONTROLADOR_MOVIMIENTO', 'Panasonic', 'MBDDT2210', 'DIGITAL_OUTPUT', 'Q0.0', 0, 3000, 'RPM', 'Tren de pulsos PTO generado por CPU 226 CN.'),

-- Estación 2: Alimentación
(5, 2, 'BT-201', 'Sensor Presencia de Pieza en Tolva', 'SENSOR_FOTOELECTRICO', 'Omron', 'E3Z-LS61', 'DIGITAL_INPUT', 'I0.0', 0, 1, 'boolean', 'Operativo con supresión de fondo a 200 mm.'),
(6, 2, 'ZT-201', 'Cilindro Eyector Retraído (Reed Switch)', 'REED_SWITCH', 'SMC', 'D-C73', 'DIGITAL_INPUT', 'I0.1', 0, 1, 'boolean', 'Operativo.'),
(7, 2, 'ZT-202', 'Cilindro Eyector Extendido (Reed Switch)', 'REED_SWITCH', 'SMC', 'D-C73', 'DIGITAL_INPUT', 'I0.2', 0, 1, 'boolean', 'Operativo.'),
(8, 2, 'YV-201', 'Electroválvula Cilindro Eyector', 'ELECTROVALVULA_5_2', 'Airtac', '4V120-06', 'DIGITAL_OUTPUT', 'Q0.0', 0, 1, 'boolean', 'Accionamiento monoestable 24 VDC.'),

-- Estación 3: Procesamiento
(9, 3, 'ZT-301', 'Sensor Prensa Arriba (Reed Switch)', 'REED_SWITCH', 'SMC', 'D-C73', 'DIGITAL_INPUT', 'I0.0', 0, 1, 'boolean', 'Fijación improvisada con silicona caliente y cinta. Pérdida periódica de señal.'),
(10, 3, 'ZT-302', 'Sensor Prensa Abajo (Reed Switch)', 'REED_SWITCH', 'SMC', 'D-C73', 'DIGITAL_INPUT', 'I0.1', 0, 1, 'boolean', 'Ruptura de lazo demostrada analíticamente si falla simultáneamente.'),
(11, 3, 'YV-301', 'Electroválvula Prensa de Estampado', 'ELECTROVALVULA_5_2', 'Airtac', '4V210-08', 'DIGITAL_OUTPUT', 'Q0.0', 0, 1, 'boolean', 'Presión regulada a 0.4 - 0.6 MPa.'),
(12, 3, 'ZT-303', 'Mordaza de Sujeción de Pieza', 'CILINDRO_GUIADO', 'SMC', 'MGPM20-50Z', 'DIGITAL_OUTPUT', 'Q0.1', 0, 1, 'boolean', 'Desalineación mecánica observada respecto al eje vertical de la prensa.'),

-- Estación 4: Ensamblaje
(13, 4, 'ZT-401', 'Posición Rotativa 0 Grados', 'REED_SWITCH', 'SMC', 'D-Z80', 'DIGITAL_INPUT', 'I0.0', 0, 1, 'boolean', 'Aislamiento de cable pelado contra el chasis. Riesgo de masa.'),
(14, 4, 'ZT-402', 'Posición Rotativa 180 Grados', 'REED_SWITCH', 'SMC', 'D-Z80', 'DIGITAL_INPUT', 'I0.1', 0, 1, 'boolean', 'Operativo.'),
(15, 4, 'YV-401', 'Pinza Neumática Angular', 'PINZA_ANGULAR', 'SMC', 'MHC2-16D', 'DIGITAL_OUTPUT', 'Q0.0', 0, 1, 'boolean', 'Operativo.'),

-- Estación 5: Selección
(16, 5, 'SC-501', 'Variador de Frecuencia VFD POWTRAN', 'VARIADOR_FRECUENCIA', 'POWTRAN', 'PT9100A', 'ANALOG_OUTPUT', 'AQW0', 0, 50, 'Hz', 'Consigna analógica 0-10 VDC desde salida analógica de CPU 224XP CN.'),
(17, 5, 'YC-501', 'Control Sentido Giro Cinta (VFD)', 'CONTROL_DIGITAL', 'POWTRAN', 'PT9100A Terminal FWD/REV', 'DIGITAL_OUTPUT', 'Q0.1', 0, 1, 'boolean', 'Conexión física no documentada encontrada en auditoría de campo.'),
(18, 5, 'WT-501', 'Sensor Capacitivo Discriminador Material', 'SENSOR_CAPACITIVO', 'Winston', 'CM18-3008NA', 'DIGITAL_INPUT', 'I0.2', 0, 1, 'boolean', 'Detecta plástico/madera no metálico por constante dieléctrica.'),
(19, 5, 'ZT-501', 'Sensor Inductivo Detector de Metales', 'SENSOR_INDUCTIVO', 'Generic/Omron', 'LM18-3008NA', 'DIGITAL_INPUT', 'I0.3', 0, 1, 'boolean', 'Detección de piezas metálicas con alcance 8 mm.'),
(20, 5, 'ST-501', 'Encoder Óptico Incremental Cinta', 'ENCODER_INCREMENTAL', 'Rep/Generic', 'ZSP3806-003G-1000BZ1', 'DIGITAL_INPUT', 'I0.0', 0, 1000, 'PPR', 'Conectado a Contador Rápido HSC0 de la CPU 224XP CN.');

SELECT setval('instrumentos_id_instrumento_seq', 20, true);

-- 3. Inserción de Variables de Proceso Clasificadas (ETN-902)
INSERT INTO variables_proceso (id_variable, id_instrumento, clasificacion_control, codigo_variable, descripcion, valor_nominal, valor_seguridad_min, valor_seguridad_max, tiempo_muerto_estimado_s) VALUES
(1, 4, 'MV', 'VAR_PTO_PULSOS_TRANS_MV', 'Frecuencia de tren de pulsos hacia Servodriver Panasonic', 1500.00, 0.00, 3000.00, 0.0200),
(2, 2, 'PV', 'VAR_POS_EJE_X_PV', 'Posición cartesiana horizontal del manipulador', 0.00, 0.00, 1050.00, 0.0100),
(3, 11, 'MV', 'VAR_ACT_PRENSA_PROC_MV', 'Comando de solenoide de bajada de prensa de estampado', 0.00, 0.00, 1.00, 0.0500),
(4, 9, 'PV', 'VAR_ESTADO_PRENSA_SUP_PV', 'Confirmación de sensor magnético de prensa en posición alta', 1.00, 0.00, 1.00, 0.0050),
(5, 10, 'PV', 'VAR_ESTADO_PRENSA_INF_PV', 'Confirmación de sensor magnético de prensa en posición baja', 0.00, 0.00, 1.00, 0.0050),
(6, 16, 'MV', 'VAR_VEL_CINTA_CONSIGNA_MV', 'Voltaje analógico de consigna de velocidad hacia VFD (0-10V)', 5.00, 0.00, 10.00, 0.1500),
(7, 20, 'PV', 'VAR_VEL_CINTA_MEDIDA_PV', 'Velocidad real de la cinta calculada a partir de pulsos HSC0', 25.00, 0.00, 60.00, 0.0500),
(8, 18, 'DV', 'VAR_PERTURB_TIPO_PIEZA_DV', 'Perturbación de proceso: variación estocástica del material alimentado', 0.00, 0.00, 1.00, 0.0000);

SELECT setval('variables_proceso_id_variable_seq', 8, true);

-- 4. Definición de Alarmas Críticas
INSERT INTO alarmas_definicion (id_alarma, id_variable, codigo_alarma, condicion_disparo, valor_umbral, nivel_severidad, tiempo_persistencia_ms, mensaje_operador) VALUES
(1, 4, 'ALM-EST-03-DEADLOCK', 'DISCREPANCIA_SENSOR', 0.0000, 'CRITICAL', 2000, 'Peligro de colisión: Desaparición simultánea de señales magnéticas en prensa de procesado.'),
(2, 7, 'ALM-EST-05-ATASCO', 'MENOR_QUE', 2.0000, 'WARNING', 3000, 'Alerta: Velocidad de cinta inferior al umbral nominal con consigna activa (posible atasco mecánico).');

SELECT setval('alarmas_definicion_id_alarma_seq', 2, true);

-- 5. Operadores del Equipo de Ingeniería Concurrente
INSERT INTO operadores (id_operador, username, nombre_completo, rol_acceso, correo_institucional) VALUES
(1, 'mangel.lopez', 'Univ. Miguel Ángel López Rodríguez', 'AUDITOR_KAIZEN', 'lopezrodriguezmangel@gmail.com'),
(2, 'wilsondavid.huanca', 'Univ. Wilson David Huanca Challco', 'INGENIERO_CONTROL', 'whuancac@fiumsa.edu.bo'),
(3, 'juancarlos.sinani', 'Univ. Juan Carlos Siñani Canaza', 'INGENIERO_CONTROL', 'jsinanic@fiumsa.edu.bo'),
(4, 'henrry.torrez', 'Univ. Henrry Jherson Torrez Patty', 'INGENIERO_CONTROL', 'htorrezp@fiumsa.edu.bo'),
(5, 'valeria.gandarillas', 'Univ. Valeria Erika Gandarillas Conde', 'ADMINISTRADOR', 'vgandarillasc@fiumsa.edu.bo'),
(6, 'paul.quisbert', 'Univ. Paul Fernando Quisbert Bautista', 'ADMINISTRADOR', 'pquisbertb@fiumsa.edu.bo'),
(7, 'mauricio.cuevas', 'Univ. Mauricio Cuevas Perez', 'ADMINISTRADOR', 'mcuevasp@fiumsa.edu.bo');

SELECT setval('operadores_id_operador_seq', 7, true);

-- Fin de archivo 02_seed_data_xk335b.sql
