# Unidad de Transporte - XK335B
## Comprension del Proceso

**Sistema:** Manufactura Flexible XK335B
**Modulo:** Unidad de Transporte (UT)
**PLC:** Siemens S7-200 CPU 224XP CN
**Programa:** OB1 + SBR (libreria MAP_SERV Q0_0)

---

## 1. Descripcion Funcional General

La Unidad de Transporte es el modulo encargado de trasladar piezas entre las estaciones del sistema
de manufactura flexible. Ejecuta ciclos de pick-and-place utilizando un brazo robotico de 3 grados
de libertad controlado por:

- Un servo motor lineal (eje horizontal, via PTO en Q0.0)
- Un cilindro vertical neumatico (eje Z, via valvula Q0.3)
- Un actuador rotatorio neumatico (giro de garra, via Q0.4/Q0.5)
- Un doble vastago neumatico (extension/retraccion, via Q0.6)
- Una pinza neumatica (cierre/apertura, via Q1.0/Q0.7)

El sistema opera en dos modos:

**Modo Integrado:** Recibe solicitudes de otras estaciones via red. Las solicitudes se
representan en las marcas M0.1 (A->P), M0.2 (P->E), M0.3 (E->S).

**Modo Standalone:** Con el selector I2.7 activado y la unidad libre (M0.0 activo), se genera
automaticamente una solicitud de tipo Alimentacion->Procesamiento (M0.1). Esto permite probar
el ciclo completo sin integracion de red.

---

## 2. Descripcion Mecanica del Sistema

### 2.1 Eje Lineal Horizontal (Servo)

El servo motor mueve el carro del brazo a lo largo de un riel horizontal. El control de posicion
se realiza mediante trenes de pulsos PTO por Q0.0 y la senal de direccion por Q0.2.

La libreria MAP_SERV (Q0_0) gestiona el servo con los siguientes parametros:

- Velocidad de estado estable (SS): 30000 pulsos/segundo
- Velocidad maxima (Max): 50000 pulsos/segundo
- Rampa de aceleracion/deceleracion: 2.0 segundos
- Velocidad de homing: 50% de Max = 25000 pulsos/segundo
- Direccion de homing: reverso (Start_Dir = 0)
- Sensor de origen: I0.0 (inductivo)
- Final de carrera derecha (Fwd): I0.1
- Final de carrera izquierda (Rev): I0.2

La subrutina SBR3 (CTRL) debe ejecutarse en cada scan del OB1 para mantener el servo
operativo. La subrutina SBR5 (MoveAbsolute) ejecuta desplazamientos absolutos con un
pulso de un scan en la entrada EXECUTE (V220.4).

### 2.2 Coordenadas de Estaciones

Las coordenadas absolutas de cada estacion estan almacenadas en registros VD
y son cargadas en VD200 (Coord_Target) antes de cada movimiento:

| Estacion         | Registro | Coordenada (pulsos) |
|------------------|----------|---------------------|
| Alimentacion (A) | VD204    | 8000                |
| Procesamiento (P)| VD208    | 50000               |
| Ensamblaje (E)   | VD212    | 92000               |
| Seleccion (S)    | VD216    | 112000              |

El punto de origen (home) se encuentra en la posicion fisicamente mas a la derecha del
riel, detectada por el sensor inductivo I0.0 al realizar el movimiento de homing en sentido
reverso.

### 2.3 Eje Vertical (Cilindro V)

Cilindro neumatico de doble efecto controlado por la valvula Q0.3:
- Q0.3 activo: brazo en posicion ARRIBA (elevado, libre para desplazamiento)
- Q0.3 inactivo: brazo en posicion ABAJO (descenso para pick/place)

Sensores de posicion:
- I0.3 (CilV_Abajo): confirma posicion abajo (brazo retraido/descendido)
- I0.4 (CilV_Arriba): confirma posicion arriba (brazo elevado)

### 2.4 Actuador Rotatorio (Garro)

Giro de la garra alrededor del eje vertical del brazo, controlado por dos valvulas:
- Q0.5 (V_Giro_H): rotacion en sentido Horario (H)
- Q0.4 (V_Giro_AH): rotacion en sentido Antihorario (AH)

Sensores de posicion:
- I0.5 (Giro_Izquierda): garra en posicion girada a la izquierda (AH)
- I0.6 (Giro_Derecha): garra en posicion girada a la derecha (H)

La orientacion de la garra varia segun el destino de la tarea (ver seccion 4.3).

### 2.5 Doble Vastago (DV)

Cilindro de doble vastago que extiende o retrae el brazo horizontalmente en corto rango,
controlado por la valvula Q0.6:
- Q0.6 activo: DV extendido (I0.7 confirma)
- Q0.6 inactivo: DV retraido (I1.0 confirma)

Sensores:
- I0.7 (CilDV_Ext): DV completamente extendido
- I1.0 (CilDV_Ret): DV completamente retraido

### 2.6 Pinza Neumatica

Controlada por dos valvulas independientes (biestable):
- Q1.0 (V_Pinza_Cierra): activa el cierre de la pinza
- Q0.7 (V_Pinza_Abre): activa la apertura de la pinza

Sensor de posicion:
- I1.1 (Pinza_Cer): confirma que la pinza esta cerrada (pieza sujetada)

---

## 3. Secuencia Logica del Ciclo Pick-and-Place

La secuencia completa de un ciclo de transporte se divide en las siguientes fases,
modeladas como una Red de Petri (CIPN) con plazas M:

### 3.1 Fase de Homing (Referenciado)

Condicion de disparo: Boton de marcha I2.5 presionado con el servo listo (I1.2=1) y
el sistema en espera de homing (M5.0 activo).

1. M5.0 (P_Hom_Espera) -> disparo T_Homing_Start -> M5.1 (P_Hom_Activo)
   - Se ejecuta SBR0 con flanco en M5.1 para iniciar el homing en sentido reverso.
   - La lampara amarilla Q1.5 se enciende durante el homing.

2. M5.1 (P_Hom_Activo) -> disparo T_Homing_Done (I0.0 detectado = M3.3) -> M0.0 (P0_Brazo_Libre)
   - El servo llega al sensor de origen I0.0 y la libreria MAP_SERV confirma Home_Done (V219.0).
   - El sistema queda en estado libre, lampara roja Q1.7 encendida.

### 3.2 Fase de Aceptacion de Solicitudes

Con M0.0 activo (brazo libre), el sistema evalua solicitudes en orden de prioridad:

**Prioridad 1 - E->S (Ensamblaje a Seleccion):** M0.3 activo, dispara T_Acept_ES
- Activa M1.0, M7.2 (contexto ES), carga VD212 (92000p) en VD200

**Prioridad 2 - P->E (Procesamiento a Ensamblaje):** M0.2 activo sin M0.3, dispara T_Acept_PE
- Activa M1.0, M7.1 (contexto PE), carga VD208 (50000p) en VD200

**Prioridad 3 - A->P (Alimentacion a Procesamiento):** M0.1 activo sin M0.2 ni M0.3, dispara T_Acept_AP
- Activa M1.0, M7.0 (contexto AP), carga VD204 (8000p) en VD200

La condicion adicional !M6.1 en todas garantiza que no se acepten solicitudes si el
boton de paro fue presionado.

### 3.3 Fase Pick (Recogida de Pieza)

Desde M1.0 (P10_Viaje_Ori), el servo viaja a la coordenada de origen de la tarea:
- Para AP: 8000p (Alimentacion)
- Para PE: 50000p (Procesamiento)
- Para ES: 92000p (Ensamblaje)

La secuencia de pick es:

1. **P10 -> P11a:** Viaje al origen completo (M3.2 = Servo_Done). Se activa la rotacion
   hacia la posicion de recogida (Horaria para AP y PE; Horaria tambien para ES durante pick).
   El brazo se mantiene elevado (Q0.3 activo).

2. **P11a -> P11b:** Giro confirmado a la derecha (I0.6). Se extiende el DV (Q0.6).

3. **P11b -> P11c:** DV extendido (I0.7). Se desciende el cilindro vertical (Q0.3 desactivo).

4. **P11c -> P11d:** Cilindro abajo (I0.3). Se cierra la pinza (Q1.0).

5. **P11d -> P11e:** Pinza cerrada (I1.1). Se eleva el cilindro (Q0.3 activo).

6. **P11e -> P11f:** Cilindro arriba (I0.4). Se retrae el DV (Q0.6 desactivo).

7. **P11f -> P12 (via P13a):** DV retraido (I1.0). Se inicia giro hacia el destino y
   el servo viaja a la coordenada destino. Transicion T_DV_Ret_Pick.
   Se activa M2.0 (P13a_Rot_Des) directamente.

### 3.4 Fase Place (Deposito de Pieza)

La coordenada destino se carga en VD200 segun el contexto M7.x:
- M7.0 (AP): destino = VD208 (50000p, Procesamiento)
- M7.1 (PE): destino = VD212 (92000p, Ensamblaje)
- M7.2 (ES): destino = VD216 (112000p, Seleccion)

La orientacion de giro en el place depende del destino:
- Para AP y PE: rotacion H (Q0.5) durante la fase de place (M2.0 a M3.5)
- Para ES: rotacion AH (Q0.4) durante la fase de place (M2.0 a M3.5)

Desde M1.7 (P12_Viaje_Des), el servo viaja a la coordenada destino con pieza en mano.

1. **P12 -> P13b:** Viaje al destino completo (M3.2). Se activa la extension del DV.

2. **P13b -> P13c:** DV extendido (I0.7). Se desciende el cilindro.

3. **P13c -> P13d:** Cilindro abajo (I0.3). Se abre la pinza (Q0.7).

4. **P13d -> P13e:** Pinza abierta (!I1.1). Se eleva el cilindro.

5. **P13e -> P13f:** Cilindro arriba (I0.4). Se retrae el DV.

6. **P13f -> P14:** DV retraido (I1.0). Plaza de finalizacion.

7. **P14 -> P0:** Tarea completada (T_Tarea_Fin sin condicion adicional).
   Se limpia el contexto M7.x y la solicitud correspondiente.
   El brazo queda libre en M0.0.

---

## 4. Logica de Control Especial

### 4.1 Modulo de Seguridad (Prioridad Maxima)

El modulo MOD0 se ejecuta al inicio de cada scan del OB1 y tiene la mayor prioridad.
Si la seta de emergencia I2.6 se abre (NC -> 0):

- Se resetean todas las marcas de plaza de trabajo (M0.1-M0.7, M1.0-M1.5, M1.6-M2.2, M8.0, M8.1, M3.5-M3.6)
- Se activa M5.0 (regresa a espera de homing)
- Se resetean todas las salidas fisicas Q0.3 a Q1.0
- Un salto JMP 0 lleva la ejecucion a LBL 0 al final del OB1, saltando MOD1-MOD5

Esto garantiza la parada inmediata y controlada ante emergencia.

### 4.2 Inicializacion en Primer Scan (SM0.1)

En el primer scan tras energizar el PLC (SM0.1=1), el MOD1 ejecuta:
- Activacion de M5.0 (modo espera homing)
- Reset de todas las marcas de estado y solicitudes
- Carga de coordenadas de estacion en VD204, VD208, VD212, VD216

### 4.3 Logica de Orientacion de Garra

La orientacion de la garra (rotatorio) se controla segun el contexto de la tarea:

**Fase Pick (todos los contextos):**
- Q0.5 (H) activo en P11a (mientras el servo esta llegando o cuando M7.0 o M7.1)
- Q0.5 (H) tambien activo durante P11a en contexto M7.2 (ES)

**Fase Place (segun destino):**
- Contextos AP (M7.0) y PE (M7.1): Q0.5 (H) activo en P13a, P13b, P13c, P13d, P13e, P13f
- Contexto ES (M7.2): Q0.4 (AH) activo en P13a, P13b, P13c, P13d, P13e, P13f

La transicion T_Rot_Des_OK (M5.7) verifica la orientacion correcta segun el contexto:
- M7.0 o M7.1: confirmacion con I0.6 (giro derecha/H)
- M7.2: confirmacion con I0.5 (giro izquierda/AH)

### 4.4 Gestion de Movimiento del Servo

El pulso EXECUTE para MoveAbsolute se genera con un flanco de subida en (M1.0 OR M1.7).
Esto asegura que el servo inicia el movimiento en el primer scan en que la plaza correspondiente
se activa (inicio de viaje al origen en P10, inicio de viaje al destino en P12).

La subrutina SBR3 (CTRL) se llama cada scan para mantener activo el modulo de control.
La posicion actual del servo es leida continuamente en VD10 (Servo_C_Pos).

---

## 5. Panel de Operador

| Elemento   | Direccion | Funcion                                         |
|------------|-----------|-------------------------------------------------|
| Btn Marcha | I2.5      | Inicia homing o confirma marcha del ciclo       |
| Btn Paro   | I2.4      | Solicita paro controlado (impide nuevas tareas) |
| Seta Emerg | I2.6      | Parada de emergencia inmediata (NC)             |
| Selector   | I2.7      | Modo standalone: genera solicitud A->P          |
| Lamp Verde | Q1.6      | Sistema ejecutando tarea (M1.0 a M3.6 activo)  |
| Lamp Amari | Q1.5      | Homing en curso o paro solicitado               |
| Lamp Roja  | Q1.7      | Sistema libre, esperando solicitud (M0.0)       |

---

## 6. Lista Completa de Sensores

| Direccion | Simbolo        | Tipo         | Funcion                                      |
|-----------|----------------|--------------|----------------------------------------------|
| I0.0      | Sens_Origen    | Inductivo    | Detecta punto de origen para homing del servo|
| I0.1      | FC_Derecha     | Final carrera| Limite fisico derecho del eje lineal (Fwd)   |
| I0.2      | FC_Izquierda   | Final carrera| Limite fisico izquierdo del eje lineal (Rev) |
| I0.3      | CilV_Abajo     | Magnetico    | Cilindro vertical en posicion abajo          |
| I0.4      | CilV_Arriba    | Magnetico    | Cilindro vertical en posicion arriba         |
| I0.5      | Giro_Izquierda | Magnetico    | Rotatorio en posicion AH (izquierda)         |
| I0.6      | Giro_Derecha   | Magnetico    | Rotatorio en posicion H (derecha)            |
| I0.7      | CilDV_Ext      | Magnetico    | Doble vastago completamente extendido        |
| I1.0      | CilDV_Ret      | Magnetico    | Doble vastago completamente retraido         |
| I1.1      | Pinza_Cer      | Magnetico    | Pinza en posicion cerrada (pieza agarrada)   |
| I1.2      | Estado_Servo   | Digital      | Driver servo listo para operar (1=Ready)     |
| I2.4      | Btn_Paro       | Pulsador     | Boton rojo de paro en panel operador         |
| I2.5      | Btn_Marcha     | Pulsador     | Boton amarillo de marcha en panel operador   |
| I2.6      | Seta_Emerg     | NC           | Seta de emergencia normalmente cerrada       |
| I2.7      | Selector       | Selector     | Modo de operacion standalone                 |

---

## 7. Lista Completa de Actuadores

| Direccion | Simbolo       | Tipo       | Funcion                                          |
|-----------|---------------|------------|--------------------------------------------------|
| Q0.0      | Servo_Pulsos  | PTO        | Tren de pulsos para servo motor lineal           |
| Q0.2      | Servo_Dir     | Digital    | Senal de direccion del servo (0=Rev, 1=Fwd)      |
| Q0.3      | V_Cil_Vert    | Valvula    | Activo = cilindro vertical ARRIBA (eleva brazo)  |
| Q0.4      | V_Giro_AH     | Valvula    | Rotacion garra en sentido antihorario            |
| Q0.5      | V_Giro_H      | Valvula    | Rotacion garra en sentido horario                |
| Q0.6      | V_Cil_DV      | Valvula    | Activo = doble vastago EXTENDIDO                 |
| Q0.7      | V_Pinza_Abre  | Valvula    | Activo = abre la pinza                           |
| Q1.0      | V_Pinza_Cierra| Valvula    | Activo = cierra la pinza                         |
| Q1.5      | Lamp_Amarilla | Lampara    | Indicacion de homing en curso o paro             |
| Q1.6      | Lamp_Verde    | Lampara    | Sistema en ejecucion de tarea                    |
| Q1.7      | Lamp_Roja     | Lampara    | Sistema libre (M0.0 activo)                      |
