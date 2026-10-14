# 03_Mapeo_Ensamblaje.md
# UNIDAD 3: ESTACIÓN DE ENSAMBLAJE DE NÚCLEOS Y DISCRIMINACIÓN ÓPTICA
## Celda de Manufactura Flexible XL-335B[cite: 2]

**Controlador:** Siemens SIMATIC S7-200 CPU 226CN (2 Puertos RS-485 integrados)[cite: 2, 15]  
**Canal de Comunicación:** Puerto 0 conectado como Esclavo PPI a 19,200 bps (Dirección de Estación: **3**)[cite: 2, 5, 15].

---

## 1. Tabla de Entradas Digitales (DI)

| Dirección PLC | Tipo | Nemónico / Tag | Lógica Eléctrica | Descripción Funcional del Sensor / Mando |
|---|---|---|---|---|
| **I0.0** | DI | `Sens_Silo_Bajo` | Fotoeléctrico | Sensor nivel bajo en silo de núcleos[cite: 15] |
| **I0.1** | DI | `Sens_Silo_Alto` | Fotoeléctrico | Sensor nivel alto en silo de núcleos[cite: 15] |
| **I0.2** | DI | `Sens_Nido_Silo` | Fotoeléctrico | Núcleo en el nido del plato que está **bajo el silo** (sensor fijo; el plato tiene dos nidos) |
| **I0.3** | DI | `Sens_Nido_Pinza` | Fotoeléctrico | Núcleo en el nido del plato que está **bajo la pinza**, listo para tomar (sensor fijo) |
| **I0.4** | DI | `Sens_Fibra_Omron`| Fibra E3X-NA11 | Sensor reflectivo en cuna de ensamble (`1` = Blanco/Metal, `0` = Negro)[cite: 2, 6, 15] |
| **I0.5** | DI | `CilSup_Ext` | Reed magnético | Sensor cilindro superior retenedor extendido[cite: 15] |
| **I0.6** | DI | `CilSup_Ret` | Reed magnético | Sensor cilindro superior retenedor retraído (reposo)[cite: 15] |
| **I0.7** | DI | `CilInf_Ext` | Reed magnético | Sensor cilindro inferior liberador extendido (reposo de base)[cite: 15] |
| **I1.0** | DI | `CilInf_Ret` | Reed magnético | Sensor cilindro inferior liberador retraído (descarga)[cite: 15] |
| **I1.1** | DI | `Plato_Pos_A` | Reed magnético | Plato en la posición `Q0.2 = 0`. Verificado en banco 2026-10-12 |
| **I1.2** | DI | `Plato_Pos_B` | Reed magnético | Plato girado 180°, posición `Q0.2 = 1`. Verificado en banco 2026-10-12 |
| **I1.3** | DI | `Pinza_Cerrada` | Reed magnético | **Único** sensor de la pinza (cerrada). Con el núcleo dentro puede no activarse: el programa confirma el cierre por tiempo y solo lo usa para medir el Δt |
| **I1.4** | DI | `PickVert_Abajo` | Reed magnético | Manipulador Pick & Place vertical abajo[cite: 15] |
| **I1.5** | DI | `PickVert_Arriba` | Reed magnético | Manipulador Pick & Place vertical arriba (reposo)[cite: 15] |
| **I1.6** | DI | `PickHoriz_Atras` | Reed magnético | Manipulador Pick & Place horizontal atrás (sobre plato / reposo)[cite: 15] |
| **I1.7** | DI | `PickHoriz_Adel` | Reed magnético | Manipulador Pick & Place horizontal adelante (sobre cuna de ensamble)[cite: 15] |
| **I2.4** | DI | `Btn_Paro (SB2)` | **NA (Contacto Abierto)** | Pulsador local de parada / pausa / reset manual[cite: 15] |
| **I2.5** | DI | `Btn_Marcha (SB1)`| **NA (Contacto Abierto)** | Pulsador local de marcha / avance paso a paso[cite: 15] |
| **I2.6** | DI | `Seta_Emerg (QS)` | **NC (Contacto Cerrado)** | Seta parada de emergencia (*fail-safe*). Reposo = `1`, Accionada = `0`[cite: 2, 15] |
| **I2.7** | DI | `Selector (SA1)` | Conmutador 2P | Selector de modo local: `1` = Modo Automático, `0` = Manual / Diagnóstico[cite: 2, 6, 15] |

---

## 2. Tabla de Salidas Digitales (DO)

| Dirección PLC | Tipo | Nemónico / Tag | Descripción Funcional del Actuador |
|---|---|---|---|
| **Q0.0** | DO | `V_Cil_Inf_Base` | Cilindro inferior silo (Mangueras invertidas: `0` = Extendido base, `1` = Retraer)[cite: 2] |
| **Q0.1** | DO | `V_Cil_Sup_Reten`| Cilindro superior retenedor (`0` = Retraído reposo, `1` = Extender sujeción)[cite: 2] |
| **Q0.2** | DO | `V_Plato_Giro` | Plato de **dos nidos** (uno en cada extremo): `1` = posición `I1.2`, `0` = posición `I1.1`. Ninguna posición es reposo; no se corta con alarmas |
| **Q0.3** | DO | `V_Pinza_Pick` | Pinza sujeción de núcleo: `1` = Cerrar pinza, `0` = Abrir pinza[cite: 2, 15] |
| **Q0.4** | DO | `V_Vert_Pick` | Cilindro vertical Pick & Place: `1` = Bajar, `0` = Subir[cite: 2, 15] |
| **Q0.5** | DO | `V_Horiz_Pick` | Cilindro horizontal Pick & Place: `1` = Adelante a nido, `0` = Retraer a plato[cite: 2, 15] |
| **Q1.5** | DO | `Foco_Amarillo` | HL2: fijo = Auto sin marcha / Manual sin nada que hacer; 2 Hz = Manual, pulsar SB1; 1 Hz = espera de núcleo, silo vacío o fuga |
| **Q1.6** | DO | `Foco_Verde` | HL1: Automático en marcha / Manual con ciclo en curso |
| **Q1.7** | DO | `Foco_Rojo` | HL3: seta QS o alarma (atasco, núcleo no cayó, núcleo no llegó bajo la pinza) |
| **Q0.6** | DO | `Baliza_Planta_Roja` | **BALIZA GRANDE DE PLANTA**: fija = alarma en la celda; intermitente = seta QS en alguna estacion o PLC 1 sin comunicacion |
| **Q0.7** | DO | `Baliza_Planta_Amarilla` | **BALIZA GRANDE**: fija = celda detenida / Transporte en manual; intermitente = pausa, fuga o silo vacio |
| **Q1.0** | DO | `Baliza_Planta_Verde` | **BALIZA GRANDE**: celda produciendo en automatico sin alarmas |
