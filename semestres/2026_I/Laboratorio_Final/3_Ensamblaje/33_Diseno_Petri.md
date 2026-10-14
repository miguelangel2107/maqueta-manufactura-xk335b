# Unidad de Ensamblaje - XK335B | S7-200 CPU 224XP CN
# Documento 3: Diseno de la Red de Petri (CIPN)
# OB1 UNIDAD DE ENSAMBLAJE v2 - CIPN

---

## 1. Tipo de Red y Estructura General

Se implementa una Red de Petri Interpretada Controlada (CIPN) de tipo secuencial con:

- 13 plazas: P0 (reposo) a P12 (reset del brazo).
- 13 transiciones: T0 a T12.
- 14 eventos (entradas de sensores mapeadas a bits M2.x - M3.x).
- 1 flag de control de ciclo: M6.0 (Flag_Parada).
- Modulo de seguridad por seta de emergencia (I2.6, NC).

La red es estrictamente secuencial (un solo token circula de P0 a P12 y regresa a P0).
No existen plazas concurrentes ni bifurcaciones.

---

## 2. Marcado Inicial

El marcado inicial del CIPN coloca el unico token en P0 (M0.0 = 1). Todas las demas
plazas estan vacias. Este marcado se establece en dos momentos:

a) Al primer scan del PLC (SM0.1 = 1): el MOD1 de inicializacion ejecuta:
   - S M0.0, 1  (activa P0)
   - R M0.1, 12 (limpia P1..P12)

b) Al activarse la seta de emergencia (I2.6 = 0): el MOD0 de seguridad ejecuta:
   - R M0.1, 14 (limpia P1..P12 y eventos adicionales)
   - S M0.0, 1  (fuerza token a P0)
   - R Q0.0, 6  (desactiva todas las salidas Q0.0..Q0.5)
   Ademas, el JMP 1 salta toda la logica de proceso hasta LBL 1.

---

## 3. Descripcion Detallada de Transiciones

### 3.1 Subsecuencia Dosificador (P0 -> P1 -> P2 -> P3)

Esta subsecuencia gestiona la entrega de una pieza secundaria desde el tubo al area de recogida.

**T0 (M4.0): Inicio de ciclo**
- Plaza origen: P0 (M0.0)
- Condicion:  Ev_Marcha (I2.5=1) AND Ev_Tub_Inf (I0.0=1) AND Ev_Fibra (I0.4=1) AND !Flag_Parada
- Accion: R M0.0, S M0.1 -> token pasa de P0 a P1
- Interpretacion: El operador presiona marcha, hay stock en el tubo (sensor nivel bajo activo)
  y hay pieza receptora en la mesa (fibra Omron). Ademas no hay paro activo.

**T1 (M4.1): Sujetador extendido OK**
- Plaza origen: P1 (M0.1)
- Condicion: Ev_CilS_Ext (I0.5=1) -> sujetador extendido
- Accion: R M0.1, S M0.2 -> token pasa de P1 a P2
- En P1 el cilindro superior (Q0.1) se activa para sujetar la columna de piezas.
  La transicion se dispara cuando el sensor confirma que el cilindro esta extendido.

**T2 (M4.2): Pieza liberada**
- Plaza origen: P2 (M0.2)
- Condicion: Ev_CilI_Ret (I1.0=1) -> cilindro inferior retraido (pieza cayo)
- Accion: R M0.2, S M0.3 -> token pasa de P2 a P3
- En P2 Q0.0 (V_CilI) se DESACTIVA (logica invertida), permitiendo que el cilindro
  inferior se retraiga y la pieza caiga. La transicion se confirma por I1.0.

**T3 (M4.3): Dosificador restaurado**
- Plaza origen: P3 (M0.3)
- Condicion: Ev_CilI_Ext (I0.7=1) -> cilindro inferior extendido nuevamente
- Accion: R M0.3, S M0.4 -> token pasa de P3 a P4
- En P3 Q0.0 vuelve a activarse (restaura cilindro inferior a posicion de retencion).
  La transicion se dispara cuando I0.7 confirma extension.

### 3.2 Subsecuencia Mesa (P4)

**T4 (M4.4): Mesa en posicion**
- Plaza origen: P4 (M0.4)
- Condicion: Ev_Giro_H (I1.2=1) -> sensor de giro horario activo
- Accion: R M0.4, S M0.5 -> token pasa de P4 a P5
- En P4 Q0.2 (V_Giro_H) se activa para girar la mesa en sentido antihorario hasta
  posicionar la pieza receptora frente al brazo. La condicion de disparo usa el sensor
  I1.2 (Giro_H). Nota: el nombre del evento (Ev_Giro_H) corresponde al sensor fisico
  I1.2; la nomenclatura de posicion "recogida" se asocia al destino mecanico aunque
  el sensor sea el de giro horario. Este comportamiento se verifica en el AWL Network 24.

### 3.3 Subsecuencia Pick (P5 -> P6 -> P7)

Esta subsecuencia gestiona la recogida de la pieza secundaria por el brazo.

**T5 (M4.5): Brazo abajo para pick**
- Plaza origen: P5 (M0.5)
- Condicion: Ev_CilV_Abajo (I1.4=1) -> cilindro vertical llego abajo
- Accion: R M0.5, S M0.6 -> token pasa de P5 a P6
- En P5 Q0.4 (V_CilV) activa el descenso del brazo.

**T6 (M4.6): Pinza cerrada (pieza agarrada)**
- Plaza origen: P6 (M0.6)
- Condicion: Ev_Pinza_Cer (I1.3=1) -> pinza cerrada
- Accion: R M0.6, S M0.7 -> token pasa de P6 a P7
- En P6 Q0.3 (V_Pinza) activa el cierre de la pinza. Q0.4 permanece activo (brazo abajo).

**T7 (M4.7): Subida completada (sin sensor adicional)**
- Plaza origen: P7 (M0.7)
- Condicion: solo que P7 este activo (M0.7 = 1, sin condicion de sensor)
- Accion: R M0.7, S M1.0 -> token pasa de P7 a P8
- En P7 Q0.4 se desactiva (brazo sube), Q0.3 permanece activo (pinza cerrada).
  La transicion es inmediata: P7 actua como estado de transicion sin espera de sensor.

### 3.4 Subsecuencia Place (P8 -> P9 -> P10 -> P11)

Esta subsecuencia gestiona el deposito de la pieza secundaria sobre la pieza receptora.

**T8 (M5.0): Brazo adelante para place**
- Plaza origen: P8 (M1.0)
- Condicion: Ev_CilH_Adel (I1.7=1) -> cilindro horizontal llego adelante
- Accion: R M1.0, S M1.1 -> token pasa de P8 a P9
- En P8 Q0.5 (V_CilH) activa el traslado horizontal del brazo hacia la pieza receptora.
  Q0.3 permanece activo (pinza cerrada con pieza).

**T9 (M5.1): Brazo abajo para place**
- Plaza origen: P9 (M1.1)
- Condicion: Ev_CilV_Abajo (I1.4=1) -> cilindro vertical llego abajo
- Accion: R M1.1, S M1.2 -> token pasa de P9 a P10
- En P9 Q0.4 activa el descenso del brazo. Q0.5 permanece activo.

**T10 (M5.2): Pieza soltada**
- Plaza origen: P10 (M1.2)
- Condicion: !Ev_Pinza_Cer (!I1.3) -> pinza abierta
- Accion: R M1.2, S M1.3 -> token pasa de P10 a P11
- En P10 Q0.3 se desactiva (pinza abre, suelta la pieza sobre la receptora).
  Q0.4 y Q0.5 permanecen activos.

**T11 (M5.3): Subida completada (sin sensor adicional)**
- Plaza origen: P11 (M1.3)
- Condicion: solo que P11 este activo (M1.3 = 1, sin condicion de sensor)
- Accion: R M1.3, S M1.4 -> token pasa de P11 a P12
- En P11 Q0.4 se desactiva (brazo sube). Q0.5 permanece activo (brazo adelante).

### 3.5 Subsecuencia Retorno (P12 -> P0)

**T12 (M5.4): Reset del brazo completado**
- Plaza origen: P12 (M1.4)
- Condicion: Ev_CilH_Atras (I1.6=1) AND Ev_Giro_H (I1.2=1)
             -> brazo atras Y mesa en posicion origen
- Accion: R M1.4, S M0.0 -> token regresa a P0 (fin de ciclo)
- En P12 Q0.5 se desactiva (brazo retorna atras). Q0.2 se desactiva (mesa vuelve a origen).
  La transicion requiere confirmacion de ambas posiciones antes de regresar a P0.

---

## 4. Tabla de Acciones de Salida por Plaza

La siguiente tabla resume que salidas (actuadores) estan activas en cada plaza:

| Salida | Logica          | Plazas Activas         | Descripcion               |
|--------|-----------------|------------------------|---------------------------|
| Q0.0   | LDN M0.2        | TODAS excepto P2       | V_CilI (logica invertida) |
| Q0.1   | M0.1+M0.2+M0.3  | P1, P2, P3             | V_CilS sujetador          |
| Q0.2   | M0.4+M0.5+M0.6+M0.7 | P4, P5, P6, P7    | V_Giro_H (giro AH)        |
| Q0.3   | M0.6+M0.7+M1.0+M1.1 | P6, P7, P8, P9    | V_Pinza cerrar            |
| Q0.4   | M0.5+M0.6+M1.1+M1.2 | P5, P6, P9, P10   | V_CilV bajar              |
| Q0.5   | M1.0+M1.1+M1.2+M1.3 | P8, P9, P10, P11  | V_CilH adelante           |

---

## 5. Logica Invertida de Q0.0 (V_CilI)

En el AWL, la salida Q0.0 se calcula como:

  LDN M0.2   // NOT de la marca de P2
  = Q0.0

Esto produce la siguiente tabla de verdad:

| Estado | M0.2 | Q0.0 | Efecto fisico                        |
|--------|------|------|--------------------------------------|
| P0..P1 | 0    | 1    | Cil inferior extendido (retiene)     |
| P2     | 1    | 0    | Cil inferior retraido (libera pieza) |
| P3..P12| 0    | 1    | Cil inferior extendido (retiene)     |

La logica es correcta para el dosificador: la pieza solo cae en P2 y en ningun otro estado.

---

## 6. Flag de Parada (M6.0)

El flag M6.0 (Flag_Parada) implementa un mecanismo de paro al final del ciclo:

- Se activa por flanco de subida de I2.4 (Btn_Rojo) mientras M0.0 = 0 (ciclo en curso).
  Implementado con instruccion de flanco en MOD2 del AWL.
- Bloquea T0: la condicion de T0 incluye !M6.0, por lo que aunque el ciclo termine
  (llegue a P0), no se iniciara el siguiente hasta que se libere el flag.
- El flag se resetea automaticamente cuando M0.0 = 1 (cuando el token regresa a P0).
  Implementado con: LD M0.0 / R M6.0 (autoreset en reposo).
- Cuando M6.0 = 1: Q0.7 (Baliza_Amarilla) y Q1.5 (Led_Amarillo) se activan como
  indicacion visual de parada programada.

---

## 7. Seguridad por Emergencia (I2.6 = 0)

La seta de emergencia (I2.6, NC) actua a nivel de MOD0 (primer modulo del OB1),
garantizando maxima prioridad:

Cuando I2.6 = 0 (emergencia activa):
1. R M0.1, 14: borra todas las marcas de plaza e intermedias desde M0.1.
2. S M0.0, 1: fuerza el token a P0 (estado seguro).
3. R Q0.0, 6: desactiva todas las salidas fisicas Q0.0..Q0.5 (cilindros, pinza, mesa).
4. JMP 1 / LBL 1: salta toda la logica de proceso (MOD2-MOD5) mientras la seta este activa.

Cuando I2.6 vuelve a 1 (emergencia liberada): la ejecucion normal se reanuda con P0 activo
y todos los actuadores en estado de reposo.

---

Fin del Documento 3.
