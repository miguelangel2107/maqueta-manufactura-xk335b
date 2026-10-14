# Unidad de Alimentacion - Comprension del Proceso
## Sistema de Manufactura Flexible XK335B | S7-200 CPU 224XP CN
### Documento: 1 de 5 | Version: 4.0

---

## 1. Funcion General

La Unidad de Alimentacion es la primera estacion del sistema de manufactura flexible XK335B.
Su funcion es tomar una pieza (columna) almacenada en un tubo vertical y entregarla a la
cinta transportadora o posicion de trabajo siguiente, de forma automatica y ciclica.

El proceso garantiza que solo se entregue una pieza por ciclo, y que el mecanismo quede en
reposo hasta que se cumplan las condiciones de inicio del siguiente ciclo.

---

## 2. Descripcion del Mecanismo

### 2.1 Tubo Almacen (Columna de piezas)

El tubo almacen es un deposito vertical que contiene las piezas apiladas por gravedad.
La pieza ubicada en la parte inferior del tubo es la que se procesa en cada ciclo.
Dos sensores de presencia monitorean el nivel de piezas en el tubo:

- **I0.6 - Presencia_Inf**: detecta si hay pieza en la base (posicion de trabajo). Este
  sensor es el evento clave Ev_Pieza y determina si el ciclo puede iniciar.
- **I0.5 - Presencia_Sup**: detecta si hay pieza en la parte superior del tubo. Presente
  en el hardware pero no influye en la logica de la Red de Petri actual; puede usarse para
  alarma de nivel bajo en versiones futuras.

### 2.2 Piston Pequeno (Sujetador de columna)

Es un cilindro neumatico de carrera corta cuya valvula de control es Q0.0 (V_Cil_Peq).
Su funcion es sujetar la columna de piezas (el tubo) para evitar que las piezas superiores
caigan mientras el piston largo extrae la pieza inferior. Actua como retenedor de la pila.

Sensores de posicion:
- **I0.0 - Cil_Peq_Ext**: confirma que el piston pequeno esta completamente extendido (sujetando).
- **I0.1 - Cil_Peq_Ret**: confirma que el piston pequeno esta completamente retraido (liberado).

### 2.3 Piston Largo (Empujador de pieza)

Es un cilindro neumatico de carrera larga cuya valvula de control es Q0.1 (V_Cil_Lrg).
Su funcion es empujar la pieza inferior del tubo hacia la siguiente posicion del sistema
(cinta transportadora u otra estacion).

Sensores de posicion:
- **I0.2 - Cil_Lrg_Ext**: confirma que el piston largo esta completamente extendido (pieza entregada).
- **I0.3 - Cil_Lrg_Ret**: confirma que el piston largo esta completamente retraido (listo para nuevo ciclo).

---

## 3. Secuencia Logica Real (Red de Petri CIPN)

El control sigue un modelo de Red de Petri Interpretada (CIPN) con 5 plazas y 5 transiciones.
La logica esta implementada en AWL (STL) dentro del OB1, organizada en 5 modulos.

### 3.1 Descripcion de cada Plaza (Estado del sistema)

| Plaza | Marca  | Nombre       | Descripcion del estado                                                    |
|-------|--------|--------------|---------------------------------------------------------------------------|
| P0    | M0.0   | Reposo       | Sistema en espera. Piston pequeno retraido. Piston largo retraido.        |
| P1    | M0.1   | Sujecion     | Piston pequeno en extension (sujetando columna). Piston largo en reposo.  |
| P2    | M0.2   | Empuje       | Piston pequeno extendido (sujetando). Piston largo en extension (empuja). |
| P3    | M0.3   | Retorno_E    | Piston pequeno aun extendido. Piston largo retraendose.                   |
| P4    | M0.4   | Retorno_S    | Piston pequeno retraendose. Piston largo retraido. Columna baja.          |

### 3.2 Descripcion de cada Transicion (Condicion de avance)

| Trans. | Marca  | Condicion de disparo                              | Significado                                          |
|--------|--------|---------------------------------------------------|------------------------------------------------------|
| T0     | M1.0   | M0.0 AND M2.0 AND M2.1                            | Reposo + Marcha activa + Pieza en base               |
| T1     | M1.1   | M0.1 AND M2.2                                     | Sujecion activa + Cil. pequeno extendido confirmado  |
| T2     | M1.2   | M0.2 AND M2.3                                     | Empuje activo + Cil. largo extendido confirmado      |
| T3     | M1.3   | M0.3 AND M2.4                                     | Retorno_E + Cil. largo retraido confirmado           |
| T4     | M1.4   | M0.4 AND M2.5                                     | Retorno_S + Cil. pequeno retraido confirmado         |

### 3.3 Ciclo completo paso a paso

**Paso 1 - P0 Reposo:**
El sistema espera en P0. La lampara roja (Q1.1) se enciende si no hay pieza en base
(M0.0 AND NOT M2.1) para indicar al operador que el tubo necesita reabastecimiento.
Cuando el operador pulsa el boton verde (I1.2) y la seta de emergencia esta OK (I1.4=1)
y hay pieza en la base (I0.6=1), se dispara T0 y el sistema avanza a P1.

**Paso 2 - P1 Sujecion:**
Q0.0 se activa: el piston pequeno se extiende y sujeta la columna de piezas.
La lampara verde (Q1.0) se enciende. El sistema espera hasta que I0.0=1 (cil. pequeno
completamente extendido). Cuando se cumple, se dispara T1 y avanza a P2.

**Paso 3 - P2 Empuje:**
Q0.0 y Q0.1 se activan: el piston pequeno sigue sujetando mientras el piston largo
empuja la pieza inferior hacia la siguiente estacion. El sistema espera hasta que
I0.2=1 (cil. largo completamente extendido = pieza entregada). Se dispara T2, avanza a P3.

**Paso 4 - P3 Retorno_E (Retorno del Empujador):**
Q0.0 activo, Q0.1 inactivo: la valvula del piston largo se desactiva y el cil. largo
retrae por accion del resorte o presion. El piston pequeno sigue sujetando para que las
piezas restantes no caigan. Espera I0.3=1 (cil. largo retraido). Se dispara T3, avanza a P4.

**Paso 5 - P4 Retorno_S (Retorno del Sujetador):**
Q0.0 y Q0.1 inactivos: la valvula del piston pequeno se desactiva. La columna de piezas
baja por gravedad y la siguiente pieza queda en posicion de base. Espera I0.1=1
(cil. pequeno retraido). Se dispara T4, el sistema vuelve a P0. Ciclo completado.

---

## 4. Sensores del Sistema (Entradas Digitales)

### 4.1 Sensores usados en la logica principal

| Direccion | Simbolo       | Tipo          | Funcion en la logica                                        |
|-----------|---------------|---------------|-------------------------------------------------------------|
| I0.0      | Cil_Peq_Ext   | Reed/magnetico| Confirma cil. pequeno extendido. Dispara T1.                |
| I0.1      | Cil_Peq_Ret   | Reed/magnetico| Confirma cil. pequeno retraido. Dispara T4 (regresa a P0).  |
| I0.2      | Cil_Lrg_Ext   | Reed/magnetico| Confirma cil. largo extendido (pieza entregada). Dispara T2.|
| I0.3      | Cil_Lrg_Ret   | Reed/magnetico| Confirma cil. largo retraido. Dispara T3.                   |
| I0.6      | Presencia_Inf | Optico/reflex.| Detecta pieza en base del tubo. Condicion de inicio (T0).   |
| I1.2      | Btn_Marcha    | Pulsador NC   | Boton verde de inicio de ciclo. Condicion de inicio (T0).   |
| I1.4      | Seta_Emerg    | NC (seguridad)| Seta de emergencia. 0 = emergencia activa, reset sistema.   |

### 4.2 Sensores presentes en hardware, no usados en logica de Red de Petri actual

| Direccion | Simbolo       | Tipo            | Descripcion                                                        |
|-----------|--------------|-----------------|--------------------------------------------------------------------|
| I0.4      | Pos_Pieza     | Fotoelectrico   | Sensor de posicion de pieza. Presente en hardware, no en AWL.      |
| I0.5      | Presencia_Sup | Optico/reflex.  | Sensor nivel superior del tubo. Hardware presente, no en AWL.      |
| I0.7      | Sensor_Induc  | Inductivo       | Detecta si el material de la pieza es metalico. No en logica AWL.  |
| I1.3      | Btn_Paro      | Pulsador        | Boton rojo de paro. Cableado presente pero no conectado en AWL.    |
| I1.5      | Selector_Rot  | Selector        | Selector rotativo. Presente en hardware, no usado en AWL actual.   |

---

## 5. Actuadores del Sistema (Salidas Digitales)

| Direccion | Simbolo      | Tipo           | Funcion                                                         | Activo en plazas  |
|-----------|--------------|----------------|-----------------------------------------------------------------|-------------------|
| Q0.0      | V_Cil_Peq    | Valvula 5/2    | Extiende el piston pequeno (sujetador de columna).              | P1, P2, P3        |
| Q0.1      | V_Cil_Lrg    | Valvula 5/2    | Extiende el piston largo (empujador de pieza).                  | P2                |
| Q0.7      | Lamp_Amarilla| Lampara piloto | Lampara amarilla. Cableada, no usada en AWL actual.             | (ninguna)         |
| Q1.0      | Lamp_Verde   | Lampara piloto | Indica sistema en operacion (ciclo activo).                     | P1, P2, P3, P4    |
| Q1.1      | Lamp_Roja    | Lampara piloto | Indica espera de pieza o emergencia activa.                     | P0(!pieza)/Emerg. |

---

## 6. Comportamiento de Emergencia

Si I1.4 = 0 (seta de emergencia presionada o cable desconectado, logica NC):
- El MOD5 salta al final de las acciones normales (JMP 0 a LBL 0).
- Se resetean todas las marcas de plazas M0.1 a M0.7.
- Se activa M0.0 (P0 Reposo).
- Las valvulas Q0.0 y Q0.1 se desactivan (pistones retroceden por accion neumatica).
- Q1.1 (Lamp_Roja) se enciende por la condicion de emergencia.
- El sistema queda en estado seguro hasta que la seta sea liberada.
