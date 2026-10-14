# 01_Mapeo_Transporte.md
# UNIDAD 1: CARRO DE TRANSPORTE Y MANIPULADOR PRINCIPAL (MAESTRO DE CELDA XL-335B)

**Controlador:** Siemens SIMATIC S7-200 CPU 226CN (Firmware Rel. CN)  
**Puertos de Comunicación:**
- **Puerto 0:** Esclavo Modbus RTU (19,200 bps, 8-N-1, Dirección 1) hacia Dashboard Web SCADA (Web Serial API). La librería Modbus Esclavo de Micro/WIN solo funciona en el Puerto 0.
- **Puerto 1:** Maestro de Red PPI (19,200 bps, 8-E-1) conectado en bus daisy-chain hacia PLCs 2, 3, 4, 5 y 6. Se habilita en el primer scan con `MOVB 2, SMB130` (sin esto `NETR`/`NETW` devuelven error 5).

> **Revisión de auditoría:** esta tabla refleja el cableado **realmente utilizado por el código probado** (`02_PLC_AWL/01_Transporte_Master.awl`). Las discrepancias corregidas respecto a la versión anterior del documento se listan en la sección 4.

---

## 1. Tabla de Entradas Digitales (DI)

| Dirección PLC | Tipo | Nemónico / Tag | Lógica Eléctrica | Descripción Funcional del Sensor / Mando |
|---|---|---|---|---|
| **I0.0** | DI (Evento 0) | `Sens_Home` | NA (Inductivo PNP 24V) | **Referencia de posición (Home).** Alineado con la cota de Alimentación (`VD204 = 0`). Su flanco ascendente dispara la interrupción `INT_HOME_I00` durante el homing. **No es un elemento de seguridad.** |
| **I0.1** | DI | `FC_Izquierda` | **NA (24 V = choque)** | Final de carrera físico **izquierdo** (límite negativo, lado Alimentación). Enclavamiento de seguridad: corta el PTO si se mueve a la izquierda (`Q0.2 = 0`). |
| **I0.2** | DI | `FC_Derecha` | **NA (24 V = choque)** | Final de carrera físico **derecho** (límite positivo, lado Selección). Enclavamiento de seguridad: corta el PTO si se mueve a la derecha (`Q0.2 = 1`). |
| **I0.3** | DI | `CilV_Abajo` | Reed magnético (NA) | Cilindro vertical abajo (cota de toma/depósito) |
| **I0.4** | DI | `CilV_Arriba` | Reed magnético (NA) | Cilindro vertical arriba (cota de traslación segura) |
| **I0.5** | DI | `Giro_Antihorario` | Reed magnético (NA) | Actuador rotatorio en posición antihoraria (apunta a la cinta de Selección) |
| **I0.6** | DI | `Giro_Horario` | Reed magnético (NA) | Actuador rotatorio en posición horaria (reposo / nidos de Alimentación, Ensamblaje y Procesamiento) |
| **I0.7** | DI | `CilDV_Ext` | Reed magnético (NA) | Cilindro horizontal de doble vástago extendido hacia la estación |
| **I1.0** | DI | `CilDV_Ret` | Reed magnético (NA) | Cilindro horizontal de doble vástago retraído (posición de viaje) |
| **I1.1** | DI | `Pinza_Cer` | Reed magnético (NA) | Pinza neumática cerrada |
| **I1.2** | DI | `Estado_Servo` | Digital PNP 24V | RDY/ALM del servodriver (1 = listo). **Solo señalización** (`VW1046` bit 2); no bloquea el movimiento hasta validar su polaridad en campo. |
| **I2.0** | DI | `Sens_Cap_Carril1` | Capacitivo PNP (NA) | Fin de carril 1 (Tipo 1: Metal + Metal). Contador `VW1182`. |
| **I2.1** | DI | `Sens_Cap_Carril2` | Capacitivo PNP (NA) | Fin de carril 2 (Tipo 2: Blanco + Plástico). Contador `VW1184`. |
| **I2.2** | DI | `Sens_Cap_Carril3` | Capacitivo PNP (NA) | Fin de carril 3 (Tipo 3: Blanco + Metal). Contador `VW1186`. |
| **I2.4** | DI | `Btn_Paro (SB2)` | **NA** | Manual: reset a Paso 0 / Homing en reposo. Automático: pausa. |
| **I2.5** | DI | `Btn_Marcha (SB1)` | **NA** | Manual: avance de paso / escape de tope. Automático: marcha y rearme de alarmas. |
| **I2.6** | DI | `Seta_Emerg (QS)` | **NC (Fail-safe)** | Reposo = `1`, Accionada = `0`. Además se reenvía como `CMD_ESTOP` a Selección y Brazo. |
| **I2.7** | DI | `Selector (SA1)` | Conmutador 2P | `1` = Automático, `0` = Manual / Diagnóstico |

> **Nota sobre I2.0, I2.1 e I2.2:** la CPU 224XP-CN de Selección (PLC 5) no dispone de entradas libres, por lo que los 3 capacitivos de fin de rampa están cableados al PLC 1, que los cuenta y los publica en el SCADA (`VW1180`).

---

## 2. Tabla de Salidas Digitales (DO)

| Dirección PLC | Tipo | Nemónico / Tag | Descripción Funcional del Actuador |
|---|---|---|---|
| **Q0.0** | DO (PTO 0) | `Servo_Pulsos` | Tren de pulsos PTO 0 hacia el servodriver (8 kHz en viaje; 2 kHz / 1 kHz en homing) |
| **Q0.2** | DO | `Servo_Dir` | Sentido: `1` = derecha (hacia Selección), `0` = izquierda (hacia Alimentación). Se escribe con `SI`/`RI` (inmediato) antes de cada `PLS 0`. |
| **Q0.3** | DO | `CilV` | Electroválvula vertical: **`1` = ARRIBA (elevar), `0` = abajo (descenso)**. Implementada como `Q0.3 = NOT M14.0`. |
| **Q0.4** | DO | `Giro_AH` | Giro antihorario (orientación hacia la cinta de Selección) |
| **Q0.5** | DO | `Giro_H` | Giro horario (reposo / nidos). Siempre `= NOT Q0.4` (enclavamiento mutuo por software). |
| **Q0.6** | DO | `CilDV` | Doble vástago horizontal: `1` = extender hacia la estación |
| **Q0.7** | DO | `Pinza_Abre` | Apertura de pinza (siempre `= NOT Q1.0`) |
| **Q1.0** | DO | `Pinza_Cierra` | Cierre de pinza |
| **Q1.1** | DO | `HL3_Roja_Aux` | **Baliza roja redundante** (misma lógica que `Q1.7`) |
| **Q1.5** | DO | `HL2_Amarilla` | Intermitente 1 Hz: reposo, pausa, espera de SB1 o alerta de fuga. Nunca encendida junto a la verde. |
| **Q1.6** | DO | `HL1_Verde` | Ciclo en movimiento |
| **Q1.7** | DO | `HL3_Roja` | Seta QS, final de carrera, atasco, homing fallido, cota fuera de rango, movimiento sin referencia o Brazo sin respuesta |

---

## 3. Dinámica Cinemática y Enclavamientos de Seguridad

### 3.1 Home inductivo vs. finales de carrera
| Elemento | Función | Uso en el código |
|---|---|---|
| `I0.0` inductivo | **Referencia** (cero absoluto) | `SBR_HOMING`: búsqueda rápida → retroceso `VD240` → aproximación lenta a 1 kHz; el flanco de `I0.0` detiene el PTO por interrupción (Evento 0) y fija `VD250 = 0`. |
| `I0.1` FC izquierdo | **Seguridad** | Corta el PTO hacia la izquierda, invalida la referencia (`M13.3 = 0`) y activa `M7.6`. Durante el homing provoca falla (`M7.2`). |
| `I0.2` FC derecho | **Seguridad** | Corta el PTO hacia la derecha, invalida la referencia y activa `M7.6`. |

Los finales de carrera **nunca** se usan para referenciar. Recomendación: migrarlos a contactos **NC** para que un cable cortado se detecte como choque (hoy son NA y la rotura del cable no se detecta).

### 3.2 Cotas absolutas (memoria V, ajustables sin recompilar)
| Estación | Registro | Valor | Espejo SCADA |
|---|---|---:|---|
| Alimentación (A) | `VD204` | **0** (sobre `I0.0`) | `VD1110` (40056-57) |
| Procesamiento (P) | `VD208` | 45,500 | `VD1114` (40058-59) |
| Ensamblaje (E) | `VD212` | 87,500 | `VD1118` (40060-61) |
| Selección (S) | `VD216` | 107,500 | `VD1122` (40062-63) |
| Límite software máx. | `VD222` | 116,000 | — |
| Límite software mín. | `VD226` | −1,000 | — |
| Retroceso homing | `VD240` | 3,000 | — |

- Los valores por defecto solo se cargan si la firma `VW220 ≠ 16#C07F`; un ajuste fino persiste mientras la memoria V se conserve (incluir `VB200..VB279` en el rango retentivo del Bloque de Sistema o en el bloque de datos).
- `SBR_MOVE_PTO` rechaza cualquier cota fuera de `[VD226, VD222]` o cualquier movimiento sin referencia (`M7.7`), y no lanza pulsos hacia un final de carrera ya accionado.
- Desde el SCADA, una cota escrita fuera de límites se rechaza y se restaura el valor vigente.

### 3.3 Orientación de la garra
- **Reposo y nidos (`Q0.5 = 1`):** giro horario confirmado por `I0.6`.
- **Selección (`Q0.4 = 1`):** giro antihorario confirmado por `I0.5`.

### 3.4 Condiciones de traslación
- El carro solo se mueve con el vertical arriba (`I0.4`) y el doble vástago retraído (`I1.0`); las maniobras automáticas terminan siempre en ese estado y lo supervisan con un timeout de 2.0 s por sub-etapa.
- Ante seta QS o atasco: freno inmediato del PTO, vertical arriba, doble vástago retraído. Si el PTO estaba en marcha, la referencia se invalida y el ciclo automático re-referencia antes de reanudar.

---

## 4. Discrepancias Corregidas (Auditoría Fase 1)

| Punto | Documento anterior | Realidad del código probado |
|---|---|---|
| `I0.1` | FC **derecho**, NC | FC **izquierdo**, **NA** (24 V = choque) |
| `I0.2` | FC **izquierdo**, NC | FC **derecho**, **NA** (24 V = choque) |
| `Q0.3` | `1` = descenso | `1` = **ascenso**, `0` = descenso |
| `Q1.1` | No documentada | Baliza roja redundante |
| Puerto 1 | PPI maestro sin configuración | Requiere `SMB130 = 2` (añadido en `SBR_INIT`) |
| Cota de Alimentación | Valor no ligado al Home | `VD204 = 0` sobre el inductivo `I0.0` |
