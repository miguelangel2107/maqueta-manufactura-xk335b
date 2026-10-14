# Unidad de Alimentacion - Diseno de la Red de Petri (CIPN)
## Sistema de Manufactura Flexible XK335B | S7-200 CPU 224XP CN
### Documento: 3 de 5 | Version: 4.0

---

## 1. Tipo de Modelo

El control de la Unidad de Alimentacion esta implementado como una **Red de Petri
Interpretada de Control (CIPN - Controlled Interpreted Petri Net)**.

Caracteristicas del modelo:
- **Tipo:** Red de Petri Interpretada (eventos de entrada, acciones de salida).
- **Clase:** Red de lugar/transicion (P/T net) con marcado binario.
- **Exclusion mutua:** Solo una plaza puede tener marca activa en condiciones normales.
- **Marcado inicial:** P0 (M0.0 = 1, M0.1..M0.7 = 0).
- **Implementacion:** AWL (STL) en S7-200, modulos secuenciales en OB1.

---

## 2. Elementos del Modelo

### 2.1 Plazas (estados del sistema)

El modelo tiene **5 plazas** representando los estados posibles del mecanismo:

| Plaza | Marca  | Nombre       |
|-------|--------|--------------|
| P0    | M0.0   | Reposo       |
| P1    | M0.1   | Sujecion     |
| P2    | M0.2   | Empuje       |
| P3    | M0.3   | Retorno_E    |
| P4    | M0.4   | Retorno_S    |

### 2.2 Transiciones (condiciones de avance)

El modelo tiene **5 transiciones**. Cada transicion tiene una condicion logica compuesta
por la plaza de origen (precondicion) y uno o mas eventos externos:

| Trans. | Marca  | Condicion completa              | Precond. | Evento(s) requeridos           |
|--------|--------|---------------------------------|----------|--------------------------------|
| T0     | M1.0   | M0.0 AND M2.0 AND M2.1          | P0       | Ev_Marcha AND Ev_Pieza         |
| T1     | M1.1   | M0.1 AND M2.2                   | P1       | Ev_CilP_Ext                   |
| T2     | M1.2   | M0.2 AND M2.3                   | P2       | Ev_CilL_Ext                   |
| T3     | M1.3   | M0.3 AND M2.4                   | P3       | Ev_CilL_Ret                   |
| T4     | M1.4   | M0.4 AND M2.5                   | P4       | Ev_CilP_Ret                   |

### 2.3 Eventos de entrada (M2.x)

El modelo tiene **6 eventos** definidos:

| Evento | Marca  | Logica            | Descripcion                                   |
|--------|--------|-------------------|-----------------------------------------------|
| Ev_Marcha  | M2.0 | I1.2 AND I1.4 | Marcha valida (boton verde + seta OK)         |
| Ev_Pieza   | M2.1 | I0.6          | Pieza presente en base del tubo               |
| Ev_CilP_Ext| M2.2 | I0.0          | Confirmacion: cil. pequeno extendido          |
| Ev_CilL_Ext| M2.3 | I0.2          | Confirmacion: cil. largo extendido            |
| Ev_CilL_Ret| M2.4 | I0.3          | Confirmacion: cil. largo retraido             |
| Ev_CilP_Ret| M2.5 | I0.1          | Confirmacion: cil. pequeno retraido           |

---

## 3. Descripcion Detallada de cada Transicion

### T0 - Inicio de ciclo (P0 -> P1)

**Condicion:** M0.0 AND M2.0 AND M2.1

El sistema esta en reposo (P0). Para que T0 se dispare deben cumplirse tres condiciones
simultaneas:
1. La plaza P0 tiene marca (M0.0 = 1).
2. El evento Ev_Marcha es verdadero: el operador ha presionado el boton verde (I1.2 = 1)
   Y la seta de emergencia esta liberada (I1.4 = 1).
3. El evento Ev_Pieza es verdadero: el sensor inferior del tubo detecta pieza (I0.6 = 1).

**Efecto:** R M0.0 (quita marca de P0), S M0.1 (pone marca en P1).

---

### T1 - Sujecion confirmada (P1 -> P2)

**Condicion:** M0.1 AND M2.2

El sistema esta en estado Sujecion (P1). Q0.0 esta activo y el piston pequeno se esta
extendiendo. T1 se dispara cuando:
1. La plaza P1 tiene marca (M0.1 = 1).
2. El sensor de extension del cil. pequeno confirma posicion final (I0.0 = 1, M2.2 = 1).

**Efecto:** R M0.1 (quita marca de P1), S M0.2 (pone marca en P2).

---

### T2 - Pieza entregada (P2 -> P3)

**Condicion:** M0.2 AND M2.3

El sistema esta en estado Empuje (P2). Q0.0 y Q0.1 estan activos. El piston largo esta
empujando la pieza hacia la siguiente estacion. T2 se dispara cuando:
1. La plaza P2 tiene marca (M0.2 = 1).
2. El sensor de extension del cil. largo confirma posicion final (I0.2 = 1, M2.3 = 1).
   Esto indica que la pieza ha sido completamente entregada.

**Efecto:** R M0.2 (quita marca de P2), S M0.3 (pone marca en P3).

---

### T3 - Empujador retraido (P3 -> P4)

**Condicion:** M0.3 AND M2.4

El sistema esta en estado Retorno_E (P3). Q0.0 activo, Q0.1 inactivo: el piston largo
retrae mientras el pequeno sigue sujetando. T3 se dispara cuando:
1. La plaza P3 tiene marca (M0.3 = 1).
2. El sensor de retraccion del cil. largo confirma posicion inicial (I0.3 = 1, M2.4 = 1).

**Efecto:** R M0.3 (quita marca de P3), S M0.4 (pone marca en P4).

---

### T4 - Ciclo completado (P4 -> P0)

**Condicion:** M0.4 AND M2.5

El sistema esta en estado Retorno_S (P4). Q0.0 y Q0.1 inactivos: el piston pequeno
retrae y la columna de piezas baja por gravedad. T4 se dispara cuando:
1. La plaza P4 tiene marca (M0.4 = 1).
2. El sensor de retraccion del cil. pequeno confirma posicion inicial (I0.1 = 1, M2.5 = 1).

**Efecto:** R M0.4 (quita marca de P4), S M0.0 (pone marca en P0). Ciclo completado.

---

## 4. Acciones de Salida por Plaza

Las salidas fisicas son asignadas en el MOD5 del OB1 segun el estado activo de las plazas.
La asignacion es de tipo **combinacional** (no memorizada): la salida es verdadera mientras
la plaza este activa.

**Condicion de proteccion:** Todo el MOD5 esta protegido por I1.4. Si I1.4 = 0, se ejecuta
un salto (JMP 0) que omite todas las asignaciones normales de salida y va directo al bloque
de emergencia (LBL 0).

| Salida     | Simbolo    | Condicion logica de activacion             | Descripcion                            |
|------------|------------|--------------------------------------------|----------------------------------------|
| Q0.0       | V_Cil_Peq  | M0.1 OR M0.2 OR M0.3                       | Activo en P1, P2 y P3                  |
| Q0.1       | V_Cil_Lrg  | M0.2                                       | Solo activo en P2                      |
| Q1.0       | Lamp_Verde  | M0.1 OR M0.2 OR M0.3 OR M0.4              | Activo en P1, P2, P3 y P4             |
| Q1.1       | Lamp_Roja   | (M0.0 AND NOT M2.1) OR NOT I1.4           | P0 sin pieza o emergencia              |

**Tabla de salidas por estado:**

| Estado | Q0.0 (Cil_Peq) | Q0.1 (Cil_Lrg) | Q1.0 (Verde) | Q1.1 (Roja)       |
|--------|----------------|----------------|--------------|-------------------|
| P0     | 0              | 0              | 0            | 1 (si no hay pieza)|
| P1     | 1              | 0              | 1            | 0                 |
| P2     | 1              | 1              | 1            | 0                 |
| P3     | 1              | 0              | 1            | 0                 |
| P4     | 0              | 0              | 1            | 0                 |
| EMERG. | 0              | 0              | 0            | 1                 |

---

## 5. Comportamiento de Emergencia

La emergencia es manejada al final del MOD5, en una red independiente con etiqueta LBL 0.

**Condicion de activacion:** NOT I1.4 (I1.4 = 0, seta presionada o cable cortado).

**Secuencia de emergencia:**
1. El JMP al inicio del MOD5 (LDN I1.4 -> JMP 0) omite todas las asignaciones de salidas normales.
   Esto provoca que Q0.0 y Q0.1 queden a 0, retraiendo los pistones.
2. En el bloque LBL 0 (red independiente), se ejecuta:
   - R M0.1, 7 : resetea todas las marcas de plaza desde M0.1 hasta M0.7.
   - S M0.0, 1 : activa P0 (estado seguro de reposo).
3. Q1.1 (Lamp_Roja) se activa por la condicion: NOT I1.4 en la logica de Q1.1.

**Recuperacion de emergencia:**
Cuando el operador libera la seta (I1.4 vuelve a 1), el sistema queda en P0 (Reposo).
El ciclo puede reiniciarse normalmente pulsando el boton verde, siempre que haya pieza
en la base del tubo.

**Nota de seguridad:** La instruccion JMP se ejecuta en el scan del PLC antes de que
las salidas sean actualizadas. Por lo tanto, la desactivacion de Q0.0 y Q0.1 ocurre
dentro del mismo scan en que se detecta la emergencia, minimizando la latencia de reaccion.

---

## 6. Inicializacion (Primer Scan - SM0.1)

La inicializacion del marcado de la Red de Petri se realiza en el MOD1 del OB1,
condicionado al bit SM0.1 (activo solo en el primer ciclo de scan del PLC).

Operaciones ejecutadas:
- **S M0.0, 1** : Establece la marca inicial en P0 (estado Reposo).
- **R M0.1, 7** : Limpia todas las plazas P1 a P7 y marcas de estado M0.5..M0.7.

Esto garantiza que al arrancar el PLC (o tras un reset de CPU), el sistema comienza
siempre en el estado definido P0, independientemente del estado previo de la memoria.
