# 05_Mapeo_Seleccion_VFD.md
# UNIDAD 5: ESTACIÓN DE SELECCIÓN, CLASIFICACIÓN Y CINTA TRANSPORTADORA CON VARIADOR (VFD XL-335B)

**Controlador:** Siemens SIMATIC S7-200 CPU 224XP-CN (2 Puertos RS-485 integrados + Canales Analógicos)  
**Puertos de Comunicación:**
- **Puerto 0:** Esclavo en bus PPI daisy-chain a 19,200 bps (Dirección de estación: **5**).
- **Puerto 1:** Maestro Modbus RTU (19,200 bps, 8-N-1) conectado a los bornes RS-485 del variador de frecuencia **Powtran PI9100A**.

---

## 1. Tabla de Entradas Digitales (DI)

| Dirección PLC | Tipo | Nemónico / Tag | Lógica Eléctrica | Descripción Funcional del Sensor / Mando |
|---|---|---|---|---|
| **I0.0** | DI (HSC0) | `Enc_Fase_A` | Tren pulsos alta vel. | Encoder incremental de cinta transportadora - Fase A |
| **I0.1** | DI (HSC0) | `Enc_Fase_B` | Tren pulsos alta vel. | Encoder incremental de cinta transportadora - Fase B |
| **I0.2** | DI (HSC0) | `Enc_Fase_Z` | Pulso de referencia | Encoder incremental de cinta transportadora - Fase Z (Índice de vuelta) |
| **I0.3** | DI | `Sens_Pres_Entrada`| Fotoeléctrico reflectivo | Sensor de presencia de pieza en la entrada de la cinta (transferencia desde Transporte) |
| **I0.4** | DI | `Fibra_Optica_Vert`| Fibra óptica difusa (NA)| **Sensor óptico vertical (a 10 cm):** Inspección reflectiva del material del núcleo |
| **I0.5** | DI | `Sens_Induc_Lat` | Inductivo tubular PNP (NA)| **Sensor inductivo lateral (a 10 cm):** Inspección de presencia de base metálica |
| **I0.7** | DI | `Cil_Desv1_Ext` | Reed magnético (NA) | Sensor magnético confirmación cilindro desviador Carril 1 extendido |
| **I1.0** | DI | `Cil_Desv2_Ext` | Reed magnético (NA) | Sensor magnético confirmación cilindro desviador Carril 2 extendido |
| **I1.1** | DI | `Cil_Desv3_Ext` | Reed magnético (NA) | Sensor magnético confirmación cilindro desviador Carril 3 extendido |
| **I1.2** | DI | `Btn_Paro (SB2)` | **NA (Contacto Abierto)** | Pulsador local de pausa de ciclo. Reposo = `0`, Accionado = `1` |
| **I1.3** | DI | `Btn_Marcha (SB1)` | **NA (Contacto Abierto)** | Pulsador local de marcha / reset de pausa. Reposo = `0`, Accionado = `1` |
| **I1.4** | DI | `Seta_Emerg (QS)` | **NC (Fail-safe)** | Seta parada de emergencia. Reposo = `1` (24V), Accionada = `0` (0V) |
| **I1.5** | DI | `Selector (SA1)` | Conmutador 2P | Selector de modo local: `1` = Modo Automático, `0` = Modo Manual / Diagnóstico |

> **IMPORTANTE: Derivación de Sensores de Fin de Carril de Rampa a PLC 1:**  
> Los 3 sensores capacitivos de fin de carril (`Sens_Cap_Carril1`, `Sens_Cap_Carril2`, `Sens_Cap_Carril3`) NO están cableados a este PLC por limitación física de canales en la CPU 224XP-CN. Están cableados físicamente a las entradas `I2.0`, `I2.1` e `I2.2` de la CPU 226CN de Transporte (PLC 1), la cual comparte sus estados con la celda mediante el bus PPI.

---

## 2. Tabla de Salidas Digitales (DO) y Analógicas (AO)

| Dirección PLC | Tipo | Nemónico / Tag | Descripción Funcional del Actuador |
|---|---|---|---|
| **Q0.0** | DO | `Marcha_VFD_DI1` | Señal digital de marcha hacia borne digital DI1 del Powtran PI9100A |
| **Q0.1** | DO | `Sentido_VFD_DI2` | Señal digital de sentido/dirección hacia borne digital DI2 del Powtran PI9100A |
| **Q0.4** | DO | `Desviador_Carril1`| Electroválvula monoestable cilindro desviador a Rampa 1 (Carril 1) |
| **Q0.5** | DO | `Desviador_Carril2`| Electroválvula monoestable cilindro desviador a Rampa 2 (Carril 2) |
| **Q0.6** | DO | `Desviador_Carril3`| Electroválvula monoestable cilindro desviador a Rampa 3 (Carril 3) |
| **Q0.7** | DO | `HL2_Amarilla` | Lámpara amarilla: Pausa de ciclo o espera en rampa |
| **Q1.0** | DO | `HL1_Verde` | Lámpara verde: Cinta y clasificación en ejecución normal |
| **Q1.1** | DO | `HL3_Roja` | Lámpara roja: Parada de emergencia activa (QS) o falla de variador/atasco |
| **AQW0** | AO | `Consigna_VFD_AI1`| Salida analógica de consigna (0-10 VDC, escala 0 a 32000 cuentas) hacia borne `AI1` del Powtran |

---

## 3. Dinámica Operativa y Gobierno del Variador Powtran PI9100A

1. **Inspección en Tránsito Continuo:**
   - Al depositar el carro de Transporte la pieza en la cinta (`I0.3 = 1`), la cinta inicia traslación con aceleración suave gobernada por `AQW0` y arranque por `Q0.0`.
   - A **10 cm del inicio**, la pieza cruza el puente de detección **al vuelo sin detenerse**:
     - `I0.5` (Inductivo lateral): Determina si la base es metálica (`1`) o plástica (`0`).
     - `I0.4` (Fibra óptica vertical): Determina si el núcleo es reflectivo (`1` = blanco/metal) o absorbente (`0` = negro).
2. **Criterio de Desvío por Carriles:**
   - **Carril 1 (`Q0.4`):** Pieza Tipo 1 (Base Metálica + Núcleo Metálico).
   - **Carril 2 (`Q0.5`):** Pieza Tipo 2 (Base Blanca Plástica + Núcleo Plástico).
   - **Carril 3 (`Q0.6`):** Pieza Tipo 3 (Base Blanca Plástica + Núcleo Metálico).
   - El accionamiento del desviador correspondiente se sincroniza con el conteo de pulsos del encoder en `HSC0`.
3. **Gobierno Dual del Variador:**
   - **Comando Físico y Analógico:** El control en tiempo real de marcha/parada se realiza por `Q0.0`/`Q0.1` y la velocidad se modula analógicamente por `AQW0` hacia la entrada `AI1` (0-10 VDC).
   - **Supervisión Modbus RTU en Segundo Plano:** El Puerto 1 de la CPU 224XP-CN mantiene polling periódico de registros para telemetría de bus DC, corriente consumida y frecuencia real entregada al motor trifásico.
