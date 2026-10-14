# Unidad de Alimentacion - Mapeo de Hardware
## Sistema de Manufactura Flexible XK335B | S7-200 CPU 224XP CN
### Documento: 2 de 5 | Version: 4.0

---

## 1. Entradas Digitales (Inputs)

Tabla completa de todas las entradas digitales del modulo de la Unidad de Alimentacion,
incluyendo las presentes en el archivo de simbolos (.csv) aunque no esten activas en la
logica del AWL actual.

| Direccion | Simbolo       | Tipo de sensor       | Descripcion funcional                                    | Usada en AWL |
|-----------|---------------|----------------------|----------------------------------------------------------|--------------|
| I0.0      | Cil_Peq_Ext   | Reed / magnetico     | Sensor fin de carrera: cil. pequeno extendido            | SI           |
| I0.1      | Cil_Peq_Ret   | Reed / magnetico     | Sensor fin de carrera: cil. pequeno retraido             | SI           |
| I0.2      | Cil_Lrg_Ext   | Reed / magnetico     | Sensor fin de carrera: cil. largo extendido              | SI           |
| I0.3      | Cil_Lrg_Ret   | Reed / magnetico     | Sensor fin de carrera: cil. largo retraido               | SI           |
| I0.4      | Pos_Pieza     | Fotoelectrico        | Sensor posicion de pieza (solo informativo en hardware)  | NO           |
| I0.5      | Presencia_Sup | Optico / reflexion   | Sensor presencia superior del tubo almacen               | NO           |
| I0.6      | Presencia_Inf | Optico / reflexion   | Sensor presencia inferior: pieza en base del tubo        | SI           |
| I0.7      | Sensor_Induc  | Inductivo            | Deteccion de material metalico en pieza                  | NO           |
| I1.0      | -             | -                    | No asignado en CSV                                       | NO           |
| I1.1      | -             | -                    | No asignado en CSV                                       | NO           |
| I1.2      | Btn_Marcha    | Pulsador NA          | Boton verde: inicio de ciclo                             | SI           |
| I1.3      | Btn_Paro      | Pulsador NC          | Boton rojo: paro (cableado, sin logica en AWL)           | NO           |
| I1.4      | Seta_Emerg    | Pulsador NC          | Seta de emergencia: 0 = emergencia activa                | SI           |
| I1.5      | Selector_Rot  | Selector rotativo    | Selector de modo (sin logica en AWL actual)              | NO           |

**Nota sobre I1.4:** Esta entrada es de logica negativa (NC). En condicion normal de
operacion I1.4 = 1. Si la seta es presionada o el cable se desconecta, I1.4 = 0 y el
sistema entra en estado de emergencia seguro.

---

## 2. Salidas Digitales (Outputs)

| Direccion | Simbolo      | Tipo de actuador     | Descripcion funcional                                    | Usada en AWL |
|-----------|--------------|----------------------|----------------------------------------------------------|--------------|
| Q0.0      | V_Cil_Peq    | Valvula solenoide 5/2| Manda extension del piston pequeno (sujetador)           | SI           |
| Q0.1      | V_Cil_Lrg    | Valvula solenoide 5/2| Manda extension del piston largo (empujador)             | SI           |
| Q0.2      | -            | -                    | No asignado en CSV                                       | NO           |
| Q0.3      | -            | -                    | No asignado en CSV                                       | NO           |
| Q0.4      | -            | -                    | No asignado en CSV                                       | NO           |
| Q0.5      | -            | -                    | No asignado en CSV                                       | NO           |
| Q0.6      | -            | -                    | No asignado en CSV                                       | NO           |
| Q0.7      | Lamp_Amarilla| Lampara piloto 24VDC | Lampara amarilla (cableada, sin uso en AWL actual)       | NO           |
| Q1.0      | Lamp_Verde   | Lampara piloto 24VDC | Lampara verde: sistema en operacion activa               | SI           |
| Q1.1      | Lamp_Roja    | Lampara piloto 24VDC | Lampara roja: espera pieza o emergencia                  | SI           |

---

## 3. Marcas de Estado - Plazas de la Red de Petri (M0.x)

Estas marcas representan el estado activo del sistema en cada momento (marcado de la red).
Solo una plaza puede estar activa en condiciones normales de operacion (exclusion mutua).

| Direccion | Simbolo     | Plaza | Descripcion del estado del sistema                              |
|-----------|-------------|-------|-----------------------------------------------------------------|
| M0.0      | P0_Reposo   | P0    | Sistema en reposo. Condicion inicial al arranque (SM0.1).       |
| M0.1      | P1_Sujecion | P1    | Cil. pequeno en proceso de extension (sujetando columna).       |
| M0.2      | P2_Empuje   | P2    | Cil. pequeno extendido Y cil. largo en proceso de extension.    |
| M0.3      | P3_Retorno_E| P3    | Cil. largo retraendose. Cil. pequeno aun extendido.             |
| M0.4      | P4_Retorno_S| P4    | Cil. pequeno retraendose. Cil. largo ya retraido.               |
| M0.5      | -           | -     | Reservada (incluida en reset R M0.1,7 del bloque de init).      |
| M0.6      | -           | -     | Reservada (incluida en reset R M0.1,7 del bloque de init).      |
| M0.7      | -           | -     | Reservada (incluida en reset R M0.1,7 del bloque de init).      |

**Nota sobre el reset inicial:** El bloque MOD1 (SM0.1 - primer scan) ejecuta:
- S M0.0, 1 : activa P0 (marcado inicial).
- R M0.1, 7 : resetea M0.1 hasta M0.7 para garantizar estado limpio.

---

## 4. Marcas de Transicion (M1.x)

Estas marcas representan las condiciones de disparo evaluadas de forma intermedia.
Cada marca M1.x corresponde a una transicion Tx de la Red de Petri.

| Direccion | Simbolo        | Trans. | Condicion logica completa               | Significado del disparo                    |
|-----------|----------------|--------|-----------------------------------------|--------------------------------------------|
| M1.0      | T0_Inicio      | T0     | M0.0 AND M2.0 AND M2.1                 | Reposo + Marcha + Pieza presente en base   |
| M1.1      | T1_Sujeto      | T1     | M0.1 AND M2.2                          | En sujecion + Cil. pequeno extendido OK    |
| M1.2      | T2_Entregado   | T2     | M0.2 AND M2.3                          | En empuje + Cil. largo extendido (pieza OK)|
| M1.3      | T3_Emp_Ret     | T3     | M0.3 AND M2.4                          | Retorno empujador + Cil. largo retraido OK |
| M1.4      | T4_Suj_Ret     | T4     | M0.4 AND M2.5                          | Retorno sujetador + Cil. pequeno retraido  |

---

## 5. Marcas de Eventos (M2.x)

Las marcas de evento son bits de trabajo calculados en el MOD2 del OB1. Combinan
entradas fisicas para formar condiciones semanticas utilizadas en el calculo de transiciones.

| Direccion | Simbolo      | Logica de calculo            | Descripcion del evento                                        |
|-----------|--------------|------------------------------|---------------------------------------------------------------|
| M2.0      | Ev_Marcha    | I1.2 AND I1.4                | Marcha valida: boton verde presionado Y seta de emergencia OK |
| M2.1      | Ev_Pieza     | I0.6                         | Pieza detectada en la base del tubo almacen                   |
| M2.2      | Ev_CilP_Ext  | I0.0                         | Evento: cil. pequeno completamente extendido                  |
| M2.3      | Ev_CilL_Ext  | I0.2                         | Evento: cil. largo completamente extendido (pieza entregada)  |
| M2.4      | Ev_CilL_Ret  | I0.3                         | Evento: cil. largo completamente retraido                     |
| M2.5      | Ev_CilP_Ret  | I0.1                         | Evento: cil. pequeno completamente retraido                   |

**Nota sobre Ev_Marcha (M2.0):** La combinacion I1.2 AND I1.4 garantiza que el evento de
marcha solo sea valido cuando la seta de emergencia este liberada (I1.4=1). Aunque la
seta tambien tiene manejo independiente en el MOD5, esta redundancia en MOD2 agrega
seguridad al calculo de T0.

---

## 6. Resumen de Modulos del OB1

| Modulo | Nombre         | Funcion                                                        |
|--------|----------------|----------------------------------------------------------------|
| MOD1   | Inicializacion | Ejecutado en SM0.1 (1er scan). Set P0, Reset P1-P7.           |
| MOD2   | Eventos        | Calculo de marcas M2.x a partir de entradas fisicas.           |
| MOD3   | Condiciones    | Calculo de condiciones de disparo M1.x (AND de plaza + evento).|
| MOD4   | Dinamica       | Ejecucion de transiciones: Reset plaza origen, Set plaza dest. |
| MOD5   | Acciones       | Asignacion de salidas fisicas segun plaza activa + emergencia. |
