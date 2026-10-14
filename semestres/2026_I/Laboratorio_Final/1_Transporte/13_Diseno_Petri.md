# Unidad de Transporte - XK335B
## Diseno del Modelo CIPN (Red de Petri Interpretada y Controlada)

**Sistema:** Manufactura Flexible XK335B
**Modulo:** Unidad de Transporte (UT)
**PLC:** Siemens S7-200 CPU 224XP CN

---

## 1. Introduccion al Modelo

El control de la Unidad de Transporte esta implementado como una Red de Petri Interpretada
y Controlada (CIPN). El modelo describe el comportamiento del sistema como un conjunto de
plazas (estados) y transiciones (eventos con condiciones).

En cada scan del OB1, el MOD3 evalua las condiciones de disparo de cada transicion.
El MOD4 ejecuta las dinamicas: quita la marca de la plaza de origen y coloca la marca
en la plaza destino. El MOD5 asigna las acciones fisicas (salidas Q) segun las plazas
activas en ese momento.

El modelo esta dividido en cuatro zonas funcionales:
1. Zona Homing
2. Zona Gestion de Solicitudes
3. Zona Ejecucion Pick
4. Zona Ejecucion Place

---

## 2. Marcado Inicial

Tras el primer scan (SM0.1) o tras una emergencia (I2.6=0), el sistema establece el
siguiente marcado inicial:

- **M5.0 = 1** (P_Hom_Espera): unica plaza activa al inicio
- Todas las demas plazas = 0
- Todas las marcas de contexto M7.x = 0
- Coordenadas inicializadas en VD204-VD216

Este marcado inicial obliga al operador a realizar el homing antes de poder ejecutar
cualquier tarea de transporte.

---

## 3. Zona Homing

### Descripcion

Esta zona modela el proceso de referenciado del servo motor. Consta de dos plazas
y dos transiciones. Es la unica zona activa al inicio del sistema.

### Plazas

- **P_Hom_Espera (M5.0):** El sistema esta encendido pero el servo no ha sido referenciado.
  El operador debe presionar el boton de marcha para iniciar el homing. En este estado no
  se puede ejecutar ningun ciclo de transporte. La lampara verde esta apagada.

- **P_Hom_Activo (M5.1):** El homing esta en ejecucion. La subrutina SBR0 (Q0_0_Home)
  fue lanzada con un flanco en esta plaza. El servo se desplaza en sentido reverso a
  velocidad de homing (25000 p/s) hasta detectar el sensor inductivo I0.0. La lampara
  amarilla Q1.5 esta encendida durante este estado.

### Transiciones

- **T_Homing_Start (M4.0):**
  - Plaza origen: M5.0
  - Plaza destino: M5.1
  - Condicion: M5.0 AND M6.0 (flanco marcha) AND M3.4 (servo listo, I1.2=1)
  - Efecto: resetea M5.0, activa M5.1, lanza SBR0 con flanco

- **T_Homing_Done (M4.1):**
  - Plaza origen: M5.1
  - Plaza destino: M0.0
  - Condicion: M5.1 AND M3.3 (sensor origen I0.0 detectado)
  - Efecto: resetea M5.1, activa M0.0 (brazo libre)
  - Nota: la libreria MAP_SERV gestiona la desaceleracion y el establecimiento de
    la posicion cero del encoder interno.

---

## 4. Zona Gestion de Solicitudes

### Descripcion

Esta zona modela el estado de reposo del sistema y la logica de aceptacion de
solicitudes con resolucion de conflictos por prioridad. El modelo implementa un
mecanismo de conflicto tipico de las CIPN: cuando multiples plazas de solicitud
estan activas, solo se dispara la de mayor prioridad.

### Plazas

- **P0_Brazo_Libre (M0.0):** Plaza de reposo principal. El brazo esta en posicion
  libre y el sistema espera una solicitud de transporte. La lampara roja Q1.7 indica
  este estado. Desde aqui parten las tres transiciones de aceptacion.

- **P1_Req_A_P (M0.1):** Solicitud de transporte Alimentacion -> Procesamiento activa.
  Se activa externamente (via red) o automaticamente por el modo standalone.

- **P2_Req_P_E (M0.2):** Solicitud de transporte Procesamiento -> Ensamblaje activa.

- **P3_Req_E_S (M0.3):** Solicitud de transporte Ensamblaje -> Seleccion activa.

### Conflicto Priorizado (Resolucion de Solicitudes Simultaneas)

Cuando P0_Brazo_Libre esta marcada y hay multiples solicitudes activas, el sistema
resuelve el conflicto mediante condiciones de inhibicion en cascada:

| Prioridad | Transicion  | Condicion de Habilitacion                              |
|-----------|-------------|--------------------------------------------------------|
| 1 (mayor) | T_Acept_ES  | M0.0 AND M0.3 AND !M6.1                               |
| 2         | T_Acept_PE  | M0.0 AND M0.2 AND !M0.3 AND !M6.1                     |
| 3 (menor) | T_Acept_AP  | M0.0 AND M0.1 AND !M0.2 AND !M0.3 AND !M6.1           |

La transicion de mayor prioridad incluye menos restricciones. La de menor prioridad
requiere que ninguna solicitud de mayor prioridad este activa. Esto garantiza que
en un ciclo de scan solo se dispara una transicion de aceptacion.

La condicion !M6.1 en todas las transiciones impide que se acepte una nueva solicitud
si el operador ha presionado el boton de paro (paro controlado al final del ciclo actual).

### Modo Standalone

Si el selector I2.7 esta activo y M0.0 esta marcado y no hay ninguna solicitud activa
(!M0.1 AND !M0.2 AND !M0.3), el MOD2B genera automaticamente una solicitud M0.1
(Alimentacion -> Procesamiento). Esto permite verificar el ciclo completo del brazo
sin necesitar la integracion con otras estaciones.

### Acciones al Aceptar Solicitud

Cuando se dispara cualquier transicion de aceptacion (T_Acept_AP/PE/ES):
1. Se resetea M0.0 (el sistema ya no esta libre)
2. Se activa M1.0 (inicio de viaje al origen)
3. Se activa la marca de contexto correspondiente (M7.0, M7.1 o M7.2)
4. Se carga la coordenada del origen en VD200 (Coord_Target):
   - T_Acept_AP: VD204 = 8000 pulsos (Alimentacion)
   - T_Acept_PE: VD208 = 50000 pulsos (Procesamiento)
   - T_Acept_ES: VD212 = 92000 pulsos (Ensamblaje)
5. El pulso EXECUTE (V220.4) se genera por flanco en M1.0 para lanzar MoveAbsolute

---

## 5. Zona Ejecucion Pick

### Descripcion

Esta zona modela la secuencia de recogida de la pieza en la estacion de origen.
Es una cadena lineal de plazas sin conflicto: cada transicion depende de la
confirmacion del actuador anterior.

### Plazas y Transiciones en Cadena

```
P10 -T_Origen_OK-> P11a -T_Rot_Ori_OK-> P11b -T_DV_Ext_Pick->
P11c -T_CilV_Baj_Pick-> P11d -T_Pinza_Cer-> P11e -T_CilV_Arr_Pick->
P11f -T_DV_Ret_Pick-> (activa M2.0 en zona place)
```

| Plaza | Marca | Accion Principal              | Condicion de Salida            |
|-------|-------|-------------------------------|--------------------------------|
| P10   | M1.0  | Servo viajando al origen      | M3.2 (Servo_Done = V220.1)     |
| P11a  | M1.1  | Girando garra H, pinza abierta| M2.6 (I0.6 giro derecha)       |
| P11b  | M1.2  | Extendiendo DV, pinza abierta | M2.7 (I0.7 DV extendido)       |
| P11c  | M1.3  | Descendiendo cilindro         | M2.3 (I0.3 cilindro abajo)     |
| P11d  | M1.4  | Cerrando pinza, DV extendido  | M3.1 (I1.1 pinza cerrada)      |
| P11e  | M1.5  | Elevando cilindro con pieza   | M2.4 (I0.4 cilindro arriba)    |
| P11f  | M1.6  | Retrayendo DV con pieza       | M3.0 (I1.0 DV retraido)        |

### Acciones de Salidas durante Pick

- Q0.3 (cilindro arriba) activo en: M1.0, M1.1 (viaje y giro - brazo elevado)
- Q0.3 activo tambien en: M1.5, M1.6 (pieza sujetada y elevada)
- Q0.6 (DV extender) activo en: M1.2, M1.3, M1.4 (extension hasta retraccion)
- Q1.0 (cerrar pinza) activo desde M1.4 en adelante
- Q0.7 (abrir pinza) activo en: M1.1, M1.2, M1.3 (garra abierta antes del agarre)
- Q0.5 (giro H) activo en M1.1 (todos los contextos orientan la garra a la derecha para pick)

---

## 6. Zona Ejecucion Place

### Descripcion

Esta zona modela el viaje al destino y el deposito de la pieza. La secuencia es
tambien lineal. La diferencia clave respecto a la zona pick es la orientacion de
la garra, que depende del contexto M7.x.

### Subzona Viaje al Destino

Al disparo de T_DV_Ret_Pick (desde M1.6):
- Se activa M2.0 (P13a_Rot_Des) directamente (el viaje al destino ocurre en paralelo
  a la rotacion de la garra, pero en la implementacion AWL la secuencia es:
  T_DV_Ret_Pick -> activa M2.0, y simultaneamente en MOD4 se carga VD200 con la
  coordenada destino segun el contexto M7.x activo)

La carga de coordenada destino en VD200:
- M7.0 (AP): VD208 = 50000 pulsos (Procesamiento)
- M7.1 (PE): VD212 = 92000 pulsos (Ensamblaje)
- M7.2 (ES): VD216 = 112000 pulsos (Seleccion)

El pulso EXECUTE (V220.4) se genera por flanco en M1.7 para lanzar MoveAbsolute al destino.

Nota estructural: en el AWL, T_DV_Ret_Pick activa M2.0 (inicio de giro al destino)
y T_Rot_Des_OK activa M1.7 (inicio del viaje). Esto significa que el giro ocurre
ANTES del viaje al destino (la garra rota mientras el brazo aun esta en la posicion
de origen, retraido y elevado).

### Plazas y Transiciones en Cadena (Place)

```
(inicio) M2.0 -T_Rot_Des_OK-> M1.7 -T_Destino_OK-> M2.1 -T_DV_Ext_Place->
M2.2 -T_CilV_Baj_Place-> M8.0 -T_Pinza_Ab-> M8.1 -T_CilV_Arr_Place->
M3.5 -T_DV_Ret_Place-> M3.6 -T_Tarea_Fin-> M0.0
```

| Plaza | Marca | Accion Principal                   | Condicion de Salida                          |
|-------|-------|------------------------------------|----------------------------------------------|
| P13a  | M2.0  | Girando garra al destino           | M3.2 (no!) / segun contexto (I0.6 o I0.5)   |
| P12   | M1.7  | Servo viajando al destino          | M3.2 (Servo_Done)                            |
| P13b  | M2.1  | Extendiendo DV, pieza en pinza     | M2.7 (I0.7 DV extendido)                    |
| P13c  | M2.2  | Descendiendo cilindro              | M2.3 (I0.3 cilindro abajo)                  |
| P13d  | M8.0  | Abriendo pinza para soltar pieza   | !M3.1 (no I1.1, pinza abierta)              |
| P13e  | M8.1  | Elevando cilindro vacio            | M2.4 (I0.4 cilindro arriba)                 |
| P13f  | M3.5  | Retrayendo DV                      | M3.0 (I1.0 DV retraido)                     |
| P14   | M3.6  | Plaza finalizacion                 | Ninguna (T_Tarea_Fin siempre habilitada)     |

### Logica de Orientacion en Place

La transicion T_Rot_Des_OK (M5.7) verifica la orientacion correcta:
- Si el contexto NO es ES (M7.2 = 0): espera confirmacion de giro H (I0.6 = M2.6)
- Si el contexto ES (M7.2 = 1): espera confirmacion de giro AH (I0.5 = M2.5)

Expresion AWL: M2.0 AND ((M2.6 AND !M7.2) OR (M2.5 AND M7.2))

Las salidas de rotacion durante place:
- Q0.5 (H) activo en M2.0 a M3.5 cuando M7.0 o M7.1
- Q0.4 (AH) activo en M2.0 a M3.5 cuando M7.2

### Finalizacion de Tarea (P14 -> P0)

T_Tarea_Fin (M6.7) se dispara cuando M3.6 esta activo, sin condicion adicional.
Sus efectos son:
1. Reset de M3.6
2. Activacion de M0.0 (sistema libre)
3. Reset del contexto M7.0-M7.2 (limpia las 3 marcas de contexto)
4. Reset de la solicitud correspondiente segun el contexto activo:
   - Si M7.0 activo: resetea M0.1 (solicitud AP completada)
   - Si M7.1 activo: resetea M0.2 (solicitud PE completada)
   - Si M7.2 activo: resetea M0.3 (solicitud ES completada)

---

## 7. Resumen del Contexto M7.x

El contexto de tarea es fundamental para la correcta ejecucion del ciclo. Se mantiene
activo durante todo el ciclo (desde la aceptacion hasta la finalizacion) y determina:

| Contexto | Marca | Origen (pick) | Destino (place) | Giro place |
|----------|-------|---------------|-----------------|------------|
| AP       | M7.0  | 8000p  (A)    | 50000p  (P)     | H (Q0.5)   |
| PE       | M7.1  | 50000p (P)    | 92000p  (E)     | H (Q0.5)   |
| ES       | M7.2  | 92000p (E)    | 112000p (S)     | AH (Q0.4)  |

Solo puede estar activo un contexto a la vez. Si hubiera un error de software que
activara dos contextos, la logica del AWL daria prioridad a la primera condicion
evaluada, pero esto no deberia ocurrir en operacion normal.

---

## 8. Acciones de Iluminacion del Panel (Lampara por Plaza)

| Salida | Accion                                              |
|--------|-----------------------------------------------------|
| Q1.7   | Activa solo cuando M0.0 (brazo libre)               |
| Q1.5   | Activa cuando M6.1 (paro) o M5.1 (homing activo)   |
| Q1.6   | Activa en cualquier plaza de trabajo M1.0 a M3.6   |

---

## 9. Estructura del OB1

El OB1 esta dividido en 5 modulos secuenciales:

| Modulo | Nombre         | Funcion                                                    |
|--------|----------------|------------------------------------------------------------|
| MOD0   | SEGURIDAD      | Evalua I2.6. Si emergencia: resetea todo, salta a LBL 0   |
| MOD1   | INICIALIZACION | En SM0.1: establece marcado inicial y coordenadas          |
| MOD2   | EVENTOS        | Copia entradas a marcas de evento M2.x-M3.x, flancos      |
| MOD3   | CONDICIONES    | Evalua y activa marcas de transicion M4.x-M6.7            |
| MOD4   | DINAMICA       | Ejecuta disparos: cambia marcas de plaza segun M4.x-M6.7  |
| MOD5   | ACCIONES       | Asigna salidas Q segun plazas activas. Llama SBR3 siempre |

La etiqueta LBL 0 al final del OB1 es el punto de llegada del salto de emergencia JMP 0.
