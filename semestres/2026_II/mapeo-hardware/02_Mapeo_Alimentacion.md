# 02_Mapeo_Alimentacion.md
# UNIDAD 2: ESTACIÓN DE ALIMENTACIÓN Y DISCRIMINACIÓN DE BASE
## Celda de Manufactura Flexible XL-335B

**Controlador:** Siemens SIMATIC S7-200 CPU 224CN (1 Puerto RS-485 integrado)  
**Canal de Comunicación:** Puerto 0 conectado como Esclavo PPI a 19,200 bps (Dirección de Estación: **2**).

---

## 1. Tabla de Entradas Digitales (DI)

| Dirección PLC | Tipo | Nemónico / Tag | Lógica Eléctrica | Descripción Funcional del Sensor / Mando |
|---|---|---|---|---|
| **I0.0** | DI | `CilSuj_Ext` | Reed magnético | Sensor cilindro pequeño sujetador extendido (columna retenida) |
| **I0.1** | DI | `CilSuj_Ret` | Reed magnético | Sensor cilindro pequeño sujetador retraído (reposo / caída habilitada) |
| **I0.2** | DI | `CilEmp_Ext` | Reed magnético | Sensor cilindro largo empujador extendido (pieza expulsada) |
| **I0.3** | DI | `CilEmp_Ret` | Reed magnético | Sensor cilindro largo empujador retraído (posición de reposo) |
| **I0.4** | DI | `Sens_Pres_Cuna` | Óptico reflectivo | Sensor de presencia de pieza en la cuna de salida / recogida |
| **I0.5** | DI | `Sens_Silo_Alto` | Fotoeléctrico | Sensor superior de nivel en silo (existencias adecuadas $\ge 3$ piezas) |
| **I0.6** | DI | `Sens_Silo_Bajo` | Fotoeléctrico | Sensor inferior de presencia de pieza en la base de la columna |
| **I0.7** | DI | `Sens_Inductivo` | Inductivo tubular | Detección de material de pieza base (`1` = Metálico, `0` = Plástico) |
| **I1.2** | DI | `Btn_Paro (SB2)` | **NA (Contacto Abierto)** | Pulsador de parada / pausa / reset manual. Reposo = `0`, Accionado = `1` |
| **I1.3** | DI | `Btn_Marcha (SB1)`| **NA (Contacto Abierto)** | Pulsador de marcha / avance paso a paso. Reposo = `0`, Accionado = `1` |
| **I1.4** | DI | `Seta_Emerg (QS)` | **NC (Contacto Cerrado)** | Seta parada de emergencia (*fail-safe*). Reposo = `1`, Accionada = `0` |
| **I1.5** | DI | `Selector (SA1)` | Conmutador 2P | Selector de modo local: `1` = Modo Automático, `0` = Manual / Diagnóstico |

---

## 2. Tabla de Salidas Digitales (DO)

| Dirección PLC | Tipo | Nemónico / Tag | Descripción Funcional del Actuador |
|---|---|---|---|
| **Q0.0** | DO | `V_Cil_Sujetador` | Electroválvula monoestable: Cilindro superior sujetador (retiene columna) |
| **Q0.1** | DO | `V_Cil_Empujador` | Electroválvula monoestable: Cilindro inferior empujador (expulsa pieza a cuna) |
| **Q0.7** | DO | `Lamp_Amarilla (HL2)` | Baliza / Lámpara amarilla: Modo manual en espera, pausa o alerta preventiva |
| **Q1.0** | DO | `Lamp_Verde (HL1)` | Baliza / Lámpara verde: Ciclo de dosificación automático en ejecución |
| **Q1.1** | DO | `Lamp_Roja (HL3)` | Baliza / Lámpara roja: Parada de emergencia activa (QS), atasco o silo vacío |

---

## 3. Dinámica Operativa de la Unidad 2

1. **Condición de Reposo Inicial:**
   - Cilindro sujetador retraído (`I0.1 = 1`).
   - Cilindro empujador retraído (`I0.3 = 1`).
   - Presencia de piezas en silo confirmada por `I0.6 = 1`.
2. **Ciclo de Dosificación Protegido:**
   - El cilindro sujetador extiende (`Q0.0 = 1`, confirmado por `I0.0 = 1`) para inmovilizar la segunda pieza de la columna.
   - El cilindro empujador extiende (`Q0.1 = 1`, confirmado por `I0.2 = 1`), trasladando la pieza base hacia la cuna de salida (`I0.4 = 1`).
   - Al ser retirada la pieza por el Carro de Transporte (PLC 1), el empujador retrae (`Q0.1 = 0`, confirmado por `I0.3 = 1`).
   - El sujetador retrae (`Q0.0 = 0`, confirmado por `I0.1 = 1`), permitiendo el descenso gravitacional de la columna de almacenamiento.