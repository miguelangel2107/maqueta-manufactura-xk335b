# Unidad de Ensamblaje - XK335B | S7-200 CPU 224XP CN
# Documento 1: Comprension del Proceso
# Sistema de Manufactura Flexible - OB1 UNIDAD DE ENSAMBLAJE v2 - CIPN

---

## 1. Funcion de la Unidad

La Unidad de Ensamblaje tiene como funcion integrar una pieza secundaria (pequena, proveniente
del dosificador de tubo) sobre una pieza principal receptora (pieza grande), que es transportada
por la mesa giratoria y recogida mediante un brazo pick&place neumatico. El ciclo completo
involucra las siguientes operaciones en secuencia:

1. Verificar stock de piezas secundarias y presencia de pieza receptora en mesa.
2. Dosificar una pieza secundaria del tubo hacia la zona de entrega.
3. Girar la mesa a posicion de recogida para acercar la pieza receptora al brazo.
4. El brazo desciende, agarra la pieza, sube, traslada horizontalmente, baja, suelta y retorna.
5. Al completar el ciclo, el sistema regresa al estado de reposo (P0) listo para el siguiente.

---

## 2. Descripcion Mecanica de los Subsistemas

### 2.1 Dosificador de Piezas Secundarias (Tubo + Cilindro Sujetador + Cilindro Liberador)

El dosificador consta de un tubo vertical que almacena piezas secundarias en columna.
En la base del tubo actuan dos cilindros neumaticos que trabajan en tandem para separar y
liberar una pieza a la vez:

- Cilindro Superior (Sujetador): retiene la columna de piezas menos la ultima.
  - Activado por Q0.1 (V_CilS). Activo en estados P1 y P2 (mientras dura la dosificacion).
  - Sensor de extendido: I0.5 (CilS_Ext). Sensor de retraido: I0.6 (CilS_Ret).

- Cilindro Inferior (Liberador): empuja o retiene la pieza inferior para soltarla.
  - Activado por Q0.0 (V_CilI).
  - LOGICA INVERTIDA: Q0.0 esta ACTIVO en casi todos los estados (P0, P1, P3..P12),
    manteniendo el cilindro inferior EXTENDIDO (posicion de retencion/reposo).
    SOLO se DESACTIVA en el estado P2 (P2_Dos_Caida), lo que permite que el cilindro
    inferior se RETRAIGA y libere la pieza secundaria hacia abajo.
  - Sensor de extendido: I0.7 (CilI_Ext). Sensor de retraido: I1.0 (CilI_Ret).

- Sensores de nivel del tubo:
  - I0.0 (Sens_Tub_Inf): fotoelectrico tubo inferior - indica nivel bajo (stock presente).
  - I0.1 (Sens_Tub_Sup): fotoelectrico tubo superior - indica nivel alto.
  - I0.2 (Sens_Sal_Tub): presencia de pieza en salida del tubo dosificador.

### 2.2 Mesa Giratoria

La mesa giratoria transporta la pieza receptora grande entre la posicion de origen/deposito
y la posicion de recogida (frente al brazo pick&place). El giro es biestable, accionado por
una valvula de doble efecto:

- Q0.2 (V_Giro_H): activa el giro antihorario (hacia posicion de recogida) en estados P4-P7.
  Nota: el simbolo del CSV es "V_Giro_H" pero la accion fisica es giro antihorario.

- Sensor giro antihorario (posicion recogida): I1.1 (Giro_AH) - M2.7=Ev_Giro_AH.
- Sensor giro horario (posicion origen): I1.2 (Giro_H) - M3.0=Ev_Giro_H.

- Sensor de pieza receptora en mesa: I0.3 (Sens_Pieza_Rec).
- Sensor fibra Omron (pieza grande receptora presente): I0.4 (Sens_Fibra_Pza).

### 2.3 Brazo Pick & Place (Cilindro Vertical + Cilindro Horizontal + Pinza)

El brazo pick&place es un manipulador neumatico de 2 ejes con pinza:

- Cilindro Vertical (V_CilV): mueve el brazo en el eje Z (arriba/abajo).
  - Q0.4 (V_CilV) activo = baja el brazo. Activo en P5, P6, P9, P10.
  - Sensor abajo: I1.4 (CilV_Abajo) - M3.2=Ev_CilV_Abajo.
  - Sensor arriba: I1.5 (CilV_Arriba) - M3.3=Ev_CilV_Arriba.

- Cilindro Horizontal (V_CilH): mueve el brazo en el eje X (atras/adelante).
  - Q0.5 (V_CilH) activo = mueve adelante (sobre la pieza). Activo en P8, P9, P10, P11.
  - Sensor atras (origen): I1.6 (CilH_Atras) - M3.4=Ev_CilH_Atras.
  - Sensor adelante (sobre pieza): I1.7 (CilH_Adelante) - M3.5=Ev_CilH_Adel.

- Pinza neumatica (V_Pinza): agarra o suelta la pieza secundaria.
  - Q0.3 (V_Pinza) activo = cierra la pinza. Activo en P6, P7, P8, P9.
  - Sensor pinza cerrada: I1.3 (Pinza_Cer) - M3.1=Ev_Pinza_Cer.
  - (La pinza abierta se detecta por ausencia de M3.1.)

---

## 3. Secuencia Logica de 13 Plazas (P0 a P12)

La logica de control se implementa como una Red de Petri Interpretada (CIPN) con 13 plazas y
13 transiciones. El marcado circula secuencialmente desde P0 hasta P12 y regresa a P0.

| Plaza  | Bit   | Nombre            | Descripcion                                              |
|--------|-------|-------------------|----------------------------------------------------------|
| P0     | M0.0  | P0_Reposo         | Estado inicial. Espera condiciones de inicio de ciclo.   |
| P1     | M0.1  | P1_Dos_Sujetar    | Cilindro superior activa (sujeta columna). Inicio dosis. |
| P2     | M0.2  | P2_Dos_Caida      | Cilindro inferior se desactiva: pieza cae (dosificacion).|
| P3     | M0.3  | P3_Dos_Restaurar  | Cilindro inferior se reactiva. Restauracion dosificador. |
| P4     | M0.4  | P4_Mesa_Giro      | Mesa gira antihorario hacia posicion de recogida.        |
| P5     | M0.5  | P5_Pick_Bajar     | Brazo desciende (cil vertical baja) sobre pieza.         |
| P6     | M0.6  | P6_Pick_Agarrar   | Pinza cierra para agarrar pieza secundaria.              |
| P7     | M0.7  | P7_Pick_Subir     | Brazo sube (cil vertical sube) con pieza agarrada.       |
| P8     | M1.0  | P8_Place_Trans    | Brazo traslada horizontalmente sobre pieza receptora.    |
| P9     | M1.1  | P9_Place_Bajar    | Brazo baja sobre pieza receptora para depositar pieza.   |
| P10    | M1.2  | P10_Place_Soltar  | Pinza abre y suelta pieza secundaria sobre receptora.    |
| P11    | M1.3  | P11_Place_Subir   | Brazo sube tras soltar pieza.                            |
| P12    | M1.4  | P12_Reset_Arm     | Brazo retorna atras y mesa vuelve a origen. Fin ciclo.   |

---

## 4. Sensores y Entradas (Addresses)

| Direccion | Simbolo          | Descripcion                                          |
|-----------|------------------|------------------------------------------------------|
| I0.0      | Sens_Tub_Inf     | Fotoelectrico tubo inferior (nivel bajo stock)       |
| I0.1      | Sens_Tub_Sup     | Fotoelectrico tubo superior (nivel alto)             |
| I0.2      | Sens_Sal_Tub     | Presencia pieza en salida del tubo dosificador       |
| I0.3      | Sens_Pieza_Rec   | Presencia pieza lista para recoger                   |
| I0.4      | Sens_Fibra_Pza   | Fibra Omron - pieza grande receptora presente        |
| I0.5      | CilS_Ext         | Cilindro superior extendido (sujetador activo)       |
| I0.6      | CilS_Ret         | Cilindro superior retraido                           |
| I0.7      | CilI_Ext         | Cilindro inferior extendido                          |
| I1.0      | CilI_Ret         | Cilindro inferior retraido (pieza liberada)          |
| I1.1      | Giro_AH          | Giro antihorario completado (posicion recogida)      |
| I1.2      | Giro_H           | Giro horario completado (posicion origen)            |
| I1.3      | Pinza_Cer        | Pinza cerrada                                        |
| I1.4      | CilV_Abajo       | Cilindro vertical abajo                              |
| I1.5      | CilV_Arriba      | Cilindro vertical arriba                             |
| I1.6      | CilH_Atras       | Cilindro horizontal atras (posicion origen)          |
| I1.7      | CilH_Adelante    | Cilindro horizontal adelante (sobre pieza)           |
| I2.4      | Btn_Rojo         | Boton rojo - paro de ciclo (flanco subida)           |
| I2.5      | Btn_Verde        | Boton verde - marcha                                 |
| I2.6      | Seta_Emerg       | Seta de emergencia (NC: 0 = emergencia activa)       |
| I2.7      | Selector         | Selector de modo                                     |

---

## 5. Actuadores y Salidas (Addresses)

| Direccion | Simbolo        | Descripcion                                              |
|-----------|----------------|----------------------------------------------------------|
| Q0.0      | V_CilI         | Valvula cilindro inferior (liberador). LOGICA INVERTIDA: |
|           |                | ACTIVO en todos los estados EXCEPTO P2. En P2 se         |
|           |                | desactiva para liberar la pieza secundaria.              |
| Q0.1      | V_CilS         | Valvula cilindro superior (sujetador). Activo en P1, P2. |
| Q0.2      | V_Giro_H       | Valvula giro mesa. Activa giro antihorario (P4-P7).      |
| Q0.3      | V_Pinza        | Valvula pinza (cerrar). Activa en P6, P7, P8, P9.       |
| Q0.4      | V_CilV         | Valvula cilindro vertical (bajar). Activa en P5,P6,P9,P10.|
| Q0.5      | V_CilH         | Valvula cilindro horizontal (adelante). Activa P8-P11.   |
| Q0.6      | Baliza_Roja    | Baliza roja: reposo sin stock (P0 activo y sin pieza).   |
| Q0.7      | Baliza_Amarilla| Baliza amarilla: parada activa (M6.0).                   |
| Q1.0      | Baliza_Verde   | Baliza verde: ciclo activo (P0 inactivo).                |
| Q1.5      | Led_Amarillo   | LED amarillo (idem Baliza_Amarilla).                     |
| Q1.6      | Led_Verde      | LED verde (idem Baliza_Verde).                           |
| Q1.7      | Led_Rojo       | LED rojo (idem Baliza_Roja).                             |

---

## 6. Mando y Senalizacion

- Boton verde (I2.5, Btn_Verde): arranque de ciclo. Condiciona T0.
- Boton rojo (I2.4, Btn_Rojo): paro al final del ciclo activo. Detectado por flanco de subida
  en M6.0. El flag M6.0 bloquea T0 para que el ciclo no se reinicie.
- Seta de emergencia (I2.6, Seta_Emerg, NC): cuando se activa (I2.6=0), el MOD0 de seguridad
  resetea todos los flags de plaza (M0.0..M1.4), todas las salidas (Q0.0..Q0.6), y fuerza P0.
  Ademas, un salto (JMP 1 / LBL 1) omite toda la logica de proceso mientras dure la emergencia.

---

## 7. Nota sobre Logica Invertida de Q0.0 (V_CilI)

El cilindro inferior del dosificador opera con logica invertida respecto al flujo normal
del CIPN. La implementacion en AWL es:

  LDN M0.2   // Carga el NOT de la plaza P2
  = Q0.0     // Activa V_CilI cuando NO estamos en P2

Esto significa que Q0.0 = 1 (cilindro extendido = reteniendo pieza) en reposo y durante
todo el ciclo, EXCEPTO cuando el sistema esta en P2_Dos_Caida, donde Q0.0 = 0 permite
que el cilindro se retraiga y la pieza secundaria caiga por gravedad hacia la zona de entrega.
Esta es una tecnica comun en dosificadores de tubo para garantizar que solo una pieza
sea liberada por ciclo.

---

Fin del Documento 1.
