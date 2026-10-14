# 04_Mapeo_Procesamiento.md
# UNIDAD 4: ESTACIÓN DE PROCESAMIENTO Y PRENSADO (ESTAMPADO DOBLE)
## Celda de Manufactura Flexible XL-335B[cite: 2]

**Controlador:** Siemens SIMATIC S7-200 CPU 224CN (1 Puerto RS-485 integrado)[cite: 2, 16]  
**Canal de Comunicación:** Puerto 0 conectado como Esclavo PPI a 19,200 bps (Dirección de Estación: **4**)[cite: 2, 5, 16].

---

## 1. Tabla de Entradas Digitales (DI)

| Dirección PLC | Tipo | Nemónico / Tag | Lógica Eléctrica | Descripción Funcional del Sensor / Mando |
|---|---|---|---|---|
| **I0.0** | DI | `Sens_Pres_Mord` | Fotoeléctrico | Sensor de presencia de pieza entregada en la mordaza[cite: 16] |
| **I0.1** | DI | `Mordaza_Cerrada`| Reed magnético | Sensor confirmación mordaza de sujeción cerrada[cite: 16] |
| **I0.2** | DI | `Carro_Origen` | Reed magnético | Sensor carro posicionado en origen (zona de intercambio/recogida)[cite: 16] |
| **I0.3** | DI | `Carro_Prensa` | Reed magnético | Sensor carro desplazado bajo la prensa de estampado[cite: 16] |
| **I0.4** | DI | `Prensa_Arriba` | Reed magnético | Sensor cilindro prensador arriba (cota alta de seguridad)[cite: 16] |
| **I0.5** | DI | `Prensa_Abajo` | Reed magnético | Sensor cilindro prensador abajo (cota baja de contacto/estampado)[cite: 16] |
| **I1.2** | DI | `Btn_Paro (SB2)` | **NA (Contacto Abierto)** | Pulsador local de parada / pausa / reset manual[cite: 16] |
| **I1.3** | DI | `Btn_Marcha (SB1)`| **NA (Contacto Abierto)** | Pulsador local de marcha / avance paso a paso[cite: 16] |
| **I1.4** | DI | `Seta_Emerg (QS)` | **NC (Contacto Cerrado)** | Seta parada de emergencia (*fail-safe*). Reposo = `1`, Accionada = `0`[cite: 2, 16] |
| **I1.5** | DI | `Selector (SA1)` | Conmutador 2P | Selector de modo local: `1` = Modo Automático, `0` = Manual / Diagnóstico[cite: 2, 16] |

---

## 2. Tabla de Salidas Digitales (DO)

| Dirección PLC | Tipo | Nemónico / Tag | Descripción Funcional del Actuador |
|---|---|---|---|
| **Q0.0** | DO | `V_Mordaza` | Electroválvula mordaza: `1` = Cerrar sujeción, `0` = Abrir / liberar[cite: 16] |
| **Q0.2** | DO | `V_Carro_Avance` | Electroválvula carro: `1` = Avanzar bajo prensa, `0` = Retorno a origen[cite: 16] |
| **Q0.3** | DO | `V_Prensa_Baja` | Electroválvula cilindro de prensa: `1` = Descenso estampado, `0` = Ascenso[cite: 16] |
| **Q0.7** | DO | `Lamp_Amarilla` | Baliza HL2: Modo manual en espera, pausa o alerta preventiva[cite: 2, 16] |
| **Q1.0** | DO | `Lamp_Verde` | Baliza HL1: Ciclo de estampado automático en ejecución[cite: 2, 16] |
| **Q1.1** | DO | `Lamp_Roja` | Baliza HL3: Parada de emergencia activa (QS) o atasco mecánico[cite: 2, 16] |

---

## 3. Dinámica Operativa de la Unidad 4

1. **Condición de Reposo Inicial:**
   - Carro en cota de origen (`I0.2 = 1`)[cite: 16].
   - Prensa en cota superior de reposo (`I0.4 = 1`)[cite: 16].
   - Mordaza abierta (`I0.1 = 0`)[cite: 16].
2. **Ciclo de Estampado Doble Secuencial:**
   - Al recibir la orden de inicio con pieza en mordaza (`I0.0 = 1`)[cite: 16]:
     1. La mordaza cierra (`Q0.0 = 1`, confirmado por `I0.1 = 1`)[cite: 16].
     2. El carro avanza bajo la prensa (`Q0.2 = 1`, confirmado por `I0.3 = 1`)[cite: 16].
     3. **Golpe 1:** La prensa desciende (`Q0.3 = 1` hasta `I0.5 = 1`), sostiene presión durante 500 ms y asciende (`Q0.3 = 0` hasta `I0.4 = 1`)[cite: 2, 4, 16].
     4. **Golpe 2:** La prensa desciende nuevamente (`Q0.3 = 1` hasta `I0.5 = 1`), sostiene presión durante 500 ms y retorna a cota alta (`Q0.3 = 0` hasta `I0.4 = 1`)[cite: 2, 4, 16].
     5. El carro retorna a origen (`Q0.2 = 0`, confirmado por `I0.2 = 1`)[cite: 16].
     6. La mordaza abre (`Q0.0 = 0`, confirmado por `I0.1 = 0`)[cite: 16].
     7. La estación emite `STAT_DONE = 1` por PPI hacia Transporte (PLC 1) y espera la recogida de la pieza conformada[cite: 2, 5, 16].