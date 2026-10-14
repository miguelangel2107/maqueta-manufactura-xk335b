#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
UNIVERSIDAD MAYOR DE SAN ANDRÉS - FACULTAD DE INGENIERÍA
CARRERA DE INGENIERÍA ELECTRÓNICA
ASIGNATURA: ETN-1000 (INFORMÁTICA INDUSTRIAL Y REDES)
PROYECTO: MAQUETA DE MANUFACTURA FLEXIBLE XK-335B
GATEWAY DE TELEMETRÍA INDUSTRIAL: SONDEO MODBUS-RTU SOBRE BUS RS-485
=============================================================================
"""

import time
import json
import logging
from typing import Dict, Any

# Configuración de registro
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("XK335B_Telemetry")

# Mapa de estaciones esclavas en el bus RS-485
ESTACIONES_NODOS = {
    1: {"nombre": "Unidad de Transporte", "plc": "S7-224XP", "address": 1},
    2: {"nombre": "Unidad de Alimentación", "plc": "S7-200 CPU 224", "address": 2},
    3: {"nombre": "Unidad de Procesamiento", "plc": "S7-200 CPU 224", "address": 3},
    4: {"nombre": "Unidad de Ensamblaje", "plc": "S7-226 CN", "address": 4},
    5: {"nombre": "Unidad de Selección", "plc": "S7-224XP CN", "address": 5}
}

class TelemetryGateway:
    def __init__(self, port: str = "/dev/ttyUSB0", baudrate: int = 9600):
        self.port = port
        self.baudrate = baudrate
        self.running = False
        logger.info(f"Inicializando Gateway RS-485 en {port} a {baudrate} bps...")

    def leer_registros_estacion(self, nodo_id: int) -> Dict[str, Any]:
        """Simula lectura determinista de registros de retención (Holding Registers 40001+)."""
        info = ESTACIONES_NODOS.get(nodo_id, {})
        # Simulación de telemetría de campo
        return {
            "estacion_id": nodo_id,
            "nombre": info.get("nombre"),
            "plc": info.get("plc"),
            "timestamp": time.time(),
            "estado": "RUN",
            "temperatura_cpu_c": 38.5 + (nodo_id * 0.4),
            "presion_bar": 5.8 if nodo_id in [2, 3, 4] else 0.0,
            "piezas_procesadas": 128 + nodo_id * 14
        }

    def poll_cycle(self):
        """Ciclo completo de sondeo a las 5 estaciones."""
        batch = []
        for nodo_id in ESTACIONES_NODOS.keys():
            data = self.leer_registros_estacion(nodo_id)
            batch.append(data)
            time.sleep(0.02)  # Separación entre tramas de 20 ms
        return batch

if __name__ == "__main__":
    gw = TelemetryGateway(port="COM3" if time.time() else "/dev/ttyUSB0", baudrate=9600)
    logger.info("Iniciando sondeo de telemetría...")
    sample = gw.poll_cycle()
    print(json.dumps(sample, indent=2, ensure_ascii=False))
