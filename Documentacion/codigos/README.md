# Programas de PLC, Lógica de Control y Firmware (Fase 1 / Fase 2)

Este directorio concentra los proyectos fuente de autómata programable, listas de instrucciones en formato AWL (STL) para Siemens SIMATIC S7-200, proyectos binarios de Micro/WIN y scripts de middleware de comunicaciones para la maqueta **XK-335B**.

---

## 💻 1. Inventario de Programas Industriales

| Archivo | Estación | Controlador / Lenguaje | Función Principal |
| :--- | :--- | :--- | :--- |
| [`estacion1_transporte_maestro.awl`](estacion1_transporte_maestro.awl) | **Estación 1 (Transporte)** | Siemens S7-224XP CN · AWL / STL | Secuencia cartesiana X-Z, homing y maestro de sondeo en red RS-485. |
| [`estacion1_transporte.mwp`](estacion1_transporte.mwp) | **Estación 1 (Transporte)** | STEP 7-Micro/WIN v4.0 (.MWP) | Proyecto binario original con tabla de símbolos y subrutinas. |
| [`estacion5_seleccion_vfd.awl`](estacion5_seleccion_vfd.awl) | **Estación 5 (Selección)** | Siemens S7-224XP CN · AWL / STL | Salida analógica AQW0 hacia VFD POWTRAN, contador HSC0 y clasificación capacitiva. |
| [`estacion5_seleccion.mwp`](estacion5_seleccion.mwp) | **Estación 5 (Selección)** | STEP 7-Micro/WIN v4.0 (.MWP) | Proyecto fuente con bloques de interrupción y configuración de variador. |
| [`telemetria_modbus_rtu.py`](telemetria_modbus_rtu.py) | **Planta Completa (Red)** | Python 3 / Modbus-RTU | Driver de adquisición serial concurrente hacia base de datos PostgreSQL. |

---

## 🛠️ 2. Guía de Carga en STEP 7-Micro/WIN v4.0
1. Para abrir los proyectos `.mwp`, utilice **STEP 7-Micro/WIN v4.0 SP9** bajo Windows XP / 7 / 10 en modo compatibilidad.
2. Para importar código `.awl`, cree un proyecto nuevo, seleccione *Archivo > Importar...* y cargue el archivo correspondiente.
3. Configure la interfaz PG/PC en **PC/PPI Cable (PPI)** a 9.6 kbps o 19.2 kbps con dirección 0.
