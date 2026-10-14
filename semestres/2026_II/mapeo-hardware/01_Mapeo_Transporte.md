# Unidad 1: Transporte

Carro de transporte y manipulador. Es el PLC maestro de la red.

- **CPU:** S7-200 CPU 226CN.
- **Puerto 0:** esclavo Modbus RTU (19 200 bps, 8-N-1, dirección 1) para el SCADA web. La librería Modbus esclavo de Micro/WIN solo funciona en el puerto 0.
- **Puerto 1:** maestro PPI (19 200 bps, 8-E-1) hacia los PLC 2 a 6. Se habilita en el primer ciclo con `MOVB 2, SMB130`; sin eso `NETR` y `NETW` devuelven error 5.

Las tablas corresponden al cableado que usa el programa `programas-plc/awl/01_Transporte_Master.awl`.

## 1. Entradas digitales

| Dirección | Tipo | Símbolo | Contacto | Función |
|---|---|---|---|---|
| I0.0 | DI (evento 0) | `Sens_Home` | NA, inductivo PNP 24 V | Referencia de posición (home), alineada con la cota de Alimentación (`VD204 = 0`). Su flanco de subida dispara la interrupción `INT_HOME_I00` durante el homing. No es un elemento de seguridad. |
| I0.1 | DI | `FC_Izquierda` | NA (24 V = choque) | Final de carrera izquierdo (lado Alimentación). Corta el PTO si el carro va a la izquierda (`Q0.2 = 0`). |
| I0.2 | DI | `FC_Derecha` | NA (24 V = choque) | Final de carrera derecho (lado Selección). Corta el PTO si el carro va a la derecha (`Q0.2 = 1`). |
| I0.3 | DI | `CilV_Abajo` | Reed (NA) | Cilindro vertical abajo (altura de toma y depósito). |
| I0.4 | DI | `CilV_Arriba` | Reed (NA) | Cilindro vertical arriba (altura de traslación). |
| I0.5 | DI | `Giro_Antihorario` | Reed (NA) | Actuador giratorio en posición antihoraria (hacia la cinta de Selección). |
| I0.6 | DI | `Giro_Horario` | Reed (NA) | Actuador giratorio en posición horaria (reposo y nidos de Alimentación, Ensamblaje y Procesamiento). |
| I0.7 | DI | `CilDV_Ext` | Reed (NA) | Cilindro horizontal de doble vástago extendido. |
| I1.0 | DI | `CilDV_Ret` | Reed (NA) | Cilindro horizontal de doble vástago retraído (posición de viaje). |
| I1.1 | DI | `Pinza_Cer` | Reed (NA) | Pinza cerrada. |
| I1.2 | DI | `Estado_Servo` | PNP 24 V | RDY/ALM del servodriver (1 = listo). Solo se muestra en `VW1046` bit 2; no bloquea el movimiento hasta comprobar su polaridad en la planta. |
| I2.0 | DI | `Sens_Cap_Carril1` | Capacitivo PNP (NA) | Fin de rampa 1 (tipo 1: metal + metal). Contador `VW1182`. |
| I2.1 | DI | `Sens_Cap_Carril2` | Capacitivo PNP (NA) | Fin de rampa 2 (tipo 2: blanco + plástico). Contador `VW1184`. |
| I2.2 | DI | `Sens_Cap_Carril3` | Capacitivo PNP (NA) | Fin de rampa 3 (tipo 3: blanco + metal). Contador `VW1186`. |
| I2.4 | DI | `Btn_Paro (SB2)` | NA | Manual: vuelve al paso 0 / homing en reposo. Automático: pausa. |
| I2.5 | DI | `Btn_Marcha (SB1)` | NA | Manual: avanza un paso o sale de un tope. Automático: marcha y rearme de alarmas. |
| I2.6 | DI | `Seta_Emerg (QS)` | NC | Reposo = `1`, accionada = `0`. También se envía como `CMD_ESTOP` a Selección y al brazo. |
| I2.7 | DI | `Selector (SA1)` | 2 posiciones | `1` = automático, `0` = manual / diagnóstico. |

I2.0, I2.1 e I2.2 están en este PLC porque la CPU de Selección no tiene entradas libres. El PLC 1 los cuenta y los publica en el SCADA (`VW1180`).

## 2. Salidas digitales

| Dirección | Tipo | Símbolo | Función |
|---|---|---|---|
| Q0.0 | DO (PTO 0) | `Servo_Pulsos` | Tren de pulsos al servodriver (8 kHz en viaje; 2 kHz y 1 kHz en homing). |
| Q0.2 | DO | `Servo_Dir` | Sentido: `1` = derecha (hacia Selección), `0` = izquierda (hacia Alimentación). Se escribe con `SI`/`RI` antes de cada `PLS 0`. |
| Q0.3 | DO | `CilV` | Electroválvula del cilindro vertical: `1` = arriba, `0` = abajo. Se programa como `Q0.3 = NOT M14.0`. |
| Q0.4 | DO | `Giro_AH` | Giro antihorario (hacia la cinta de Selección). |
| Q0.5 | DO | `Giro_H` | Giro horario (reposo y nidos). Siempre `= NOT Q0.4`. |
| Q0.6 | DO | `CilDV` | Doble vástago: `1` = extender hacia la estación. |
| Q0.7 | DO | `Pinza_Abre` | Abrir pinza (siempre `= NOT Q1.0`). |
| Q1.0 | DO | `Pinza_Cierra` | Cerrar pinza. |
| Q1.1 | DO | `HL3_Roja_Aux` | Segunda baliza roja, con la misma lógica que `Q1.7`. |
| Q1.5 | DO | `HL2_Amarilla` | Intermitente a 1 Hz: reposo, pausa, espera de SB1 o aviso de fuga. Nunca se enciende junto con la verde. |
| Q1.6 | DO | `HL1_Verde` | Ciclo en marcha. |
| Q1.7 | DO | `HL3_Roja` | Seta QS, final de carrera, atasco, homing fallido, cota fuera de rango, movimiento sin referencia o brazo sin respuesta. |

## 3. Movimiento y seguridad

### 3.1 Home y finales de carrera

| Elemento | Función | En el programa |
|---|---|---|
| `I0.0` inductivo | Referencia (cero) | `SBR_HOMING`: búsqueda rápida, retroceso de `VD240` y aproximación lenta a 1 kHz. El flanco de `I0.0` detiene el PTO por interrupción (evento 0) y pone `VD250 = 0`. |
| `I0.1` FC izquierdo | Seguridad | Corta el PTO hacia la izquierda, invalida la referencia (`M13.3 = 0`) y activa `M7.6`. Durante el homing provoca falla (`M7.2`). |
| `I0.2` FC derecho | Seguridad | Corta el PTO hacia la derecha, invalida la referencia y activa `M7.6`. |

Los finales de carrera no se usan como referencia. Hoy son NA, así que un cable cortado no se detecta; conviene cambiarlos a NC para que un corte se lea como choque.

### 3.2 Cotas del carro

Se guardan en memoria V y se pueden ajustar sin recompilar.

| Estación | Registro | Valor (pulsos) | Registro en el SCADA |
|---|---|---:|---|
| Alimentación | `VD204` | 0 (sobre `I0.0`) | `VD1110` (40056-57) |
| Procesamiento | `VD208` | 45 500 | `VD1114` (40058-59) |
| Ensamblaje | `VD212` | 87 500 | `VD1118` (40060-61) |
| Selección | `VD216` | 107 500 | `VD1122` (40062-63) |
| Límite máximo | `VD222` | 116 000 | — |
| Límite mínimo | `VD226` | −1 000 | — |
| Retroceso de homing | `VD240` | 3 000 | — |

- Los valores por defecto se cargan solo si la firma `VW220` es distinta de `16#C07F`. Un ajuste se mantiene mientras la memoria V se conserve; para eso `VB200..VB279` debe estar en el rango remanente del bloque de sistema o en el bloque de datos.
- `SBR_MOVE_PTO` rechaza cotas fuera de `[VD226, VD222]`, movimientos sin referencia (`M7.7`) y pulsos hacia un final de carrera que ya está accionado.
- Si desde el SCADA se escribe una cota fuera de límites, se rechaza y se restaura el valor anterior.

### 3.3 Orientación de la garra

- Reposo y nidos: giro horario (`Q0.5 = 1`), confirmado por `I0.6`.
- Selección: giro antihorario (`Q0.4 = 1`), confirmado por `I0.5`.

### 3.4 Condiciones para mover el carro

- El carro solo se mueve con el cilindro vertical arriba (`I0.4`) y el doble vástago retraído (`I1.0`). Cada maniobra automática termina en ese estado, con un tiempo máximo de 2 s por etapa.
- Con la seta QS o un atasco: se frena el PTO, el cilindro vertical sube y el doble vástago se retrae. Si el carro estaba en movimiento se pierde la referencia y el ciclo automático vuelve a hacer homing antes de continuar.

## 4. Diferencias con la documentación anterior

| Punto | Documento anterior | Cableado real |
|---|---|---|
| `I0.1` | FC derecho, NC | FC izquierdo, NA (24 V = choque) |
| `I0.2` | FC izquierdo, NC | FC derecho, NA (24 V = choque) |
| `Q0.3` | `1` = bajar | `1` = subir, `0` = bajar |
| `Q1.1` | No figuraba | Segunda baliza roja |
| Puerto 1 | Maestro PPI sin configurar | Necesita `SMB130 = 2` (en `SBR_INIT`) |
| Cota de Alimentación | Sin relación con el home | `VD204 = 0`, sobre el inductivo `I0.0` |
