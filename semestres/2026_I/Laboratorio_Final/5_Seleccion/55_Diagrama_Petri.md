# Diagrama Red de Petri: Unidad de Selección (CIPN)
## Sistema de Manufactura Flexible XK335B | S7-200 CPU 224XP CN
### Estación 5 — Selección | Versión 4.0

---

## Leyenda
- **Círculos / Óvalos** = Plazas (estados estables, portadoras de marcas M)
- **Rectángulos** = Transiciones (eventos que cambian el estado)
- **Flechas sólidas** = Flujo de marcas
- **Flechas punteadas** = Condición de emergencia o lazo de control
- `[Mx.y]` = Marca de memoria interna asociada

---

## Diagrama Principal

```mermaid
flowchart TD

    %% =========================================================
    %% ARRANQUE
    %% =========================================================

    INIT(["SM0.1: Inicialización\nK1=97.26 K2=25.64 N=97.26\nSBR1: HSC_INIT\nATCH INT0 cada 10 ms"]):::init

    %% =========================================================
    %% ZONA 0: REPOSO
    %% =========================================================

    P0(["P0 - Reposo\n[M0.0]\nSetpoint = 0.0 cuentas\nCinta parada, espera inicio"]):::plaza_ctrl

    INIT -->|"S M0.0\nR M0.1..M0.5"| P0

    %% =========================================================
    %% ZONA 1: AVANCE HACIA ZONA DE SENSORES
    %% =========================================================

    P1(["P1 - Avanzar\n[M0.1]\nSetpoint = 710.0 cuentas\nCinta avanza hacia zona de sensores"]):::plaza_exec

    T0["T0 - Inicio Ciclo\n[M1.0]\nM0.0 AND I1.3 AND I1.4 AND I0.3\n(Marcha + Seta OK + Pieza en cinta)"]:::trans

    P0 --> T0
    T0 -->|"R M0.0\nS M0.1\nVD112 <- 710.0"| P1

    %% =========================================================
    %% ZONA 2: IDENTIFICACIÓN AL VUELO
    %% =========================================================

    P2(["P2 - Identificar al Vuelo\n[M0.2]\nLectura fotoeléctrica (I0.4) y capacitiva (I0.5)\nCargar VD300 según clasificación"]):::plaza_exec

    T1["T1 - Posición Sensores OK\n[M1.1]\nM0.1 AND DTR(HC0) >= 490.0\n(Encoder alcanzó zona de detección)"]:::trans

    P1 --> T1
    T1 -->|"R M0.1\nS M0.2"| P2

    %% =========================================================
    %% ZONA 3: VIAJE A LA RAMPA
    %% =========================================================

    P3(["P3 - Viaje a Rampa\n[M0.3]\nSetpoint = VD300 cuentas\nCinta lleva pieza a la rampa de destino"]):::plaza_exec

    T2["T2 - Clasificación Completa\n[M1.2]\nM0.2\n(Disparo automático: siguiente scan)"]:::trans

    P2 --> T2
    T2 -->|"R M0.2\nS M0.3\nVD112 <- VD300"| P3

    CLAS["Clasificación al vuelo (en P2):\nI0.5=1 AND I0.4=1 → VD300=710.0   (Metal)\nI0.4=1 XOR I0.5=1 → VD300=1150.0  (Mixto)\nI0.4=0 AND I0.5=0 → VD300=1520.0  (Plástico)"]

    P2 --- CLAS

    %% =========================================================
    %% ZONA 4: EXPULSIÓN
    %% =========================================================

    P4(["P4 - Expulsar\n[M0.4]\nExpulsor neumático activo\nQ0.4/Q0.5/Q0.6 según VD300"]):::plaza_exec

    T3["T3 - Pieza en Rampa\n[M1.3]\nM0.3 AND (DTR(HC0)+10.0) >= VD300\n(Encoder alcanzó coordenada de rampa)"]:::trans

    P3 --> T3
    T3 -->|"R M0.3\nS M0.4\nActivar Q segun VD300"| P4

    %% =========================================================
    %% ZONA 5: FINAL DE CICLO
    %% =========================================================

    P5(["P5 - Final de Ciclo\n[M0.5]\nSetpoint = 0.0\nReset encoder: SMD38=0 HSC 0"]):::plaza_exec

    T4["T4 - Expulsión Confirmada\n[M1.4]\nM0.4 AND (I0.7 OR I1.0 OR I1.1)\n(Sensor eyector retraído)"]:::trans
    T5["T5 - Ciclo Cerrado\n[M1.5]\nM0.5\n(Disparo automático: siguiente scan)"]:::trans

    P4 --> T4
    T4 -->|"R M0.4\nS M0.5\nVD112 <- 0.0"| P5
    P5 --> T5
    T5 -->|"R M0.5\nS M0.0\nReset HC0"| P0

    %% =========================================================
    %% MÓDULO DE CONTROL (lazo cerrado, Ts=10 ms)
    %% =========================================================

    INT0["INT0 — Control Realimentación de Estados (Ts=10 ms)\nSeguridad: LDN I1.4 → CRETI inmediato\nPos:  DTR(HC0) → VD100\nVel:  (VD100-VD104)×100 → VD108\nu  =  N×VD112 - K1×VD100 - K2×VD108\nDir.: Q0.1 según signo de u\nSat.: |u| ≤ 32 000 → AQW0\nMarcha Q0.0: si |u| > 100\nVD104 ← VD100"]

    P0 -.->|"cada 10 ms"| INT0
    P1 -.->|"cada 10 ms"| INT0
    P2 -.->|"cada 10 ms"| INT0
    P3 -.->|"cada 10 ms"| INT0
    P4 -.->|"cada 10 ms"| INT0
    P5 -.->|"cada 10 ms"| INT0

    %% =========================================================
    %% EMERGENCIA
    %% =========================================================

    EMERG(["EMERGENCIA\nI1.4 = 0\nSeta activa"]):::emerg

    P0 -.->|"NOT I1.4"| EMERG
    P1 -.->|"NOT I1.4"| EMERG
    P2 -.->|"NOT I1.4"| EMERG
    P3 -.->|"NOT I1.4"| EMERG
    P4 -.->|"NOT I1.4"| EMERG
    P5 -.->|"NOT I1.4"| EMERG
    EMERG -.->|"S M0.0\nR M0.1..M0.5\nVD112 <- 0.0\nR Q0.0\nR Q0.4..Q0.6\nINT0: CRETI inmediato"| P0

    %% =========================================================
    %% ESTILOS
    %% =========================================================

    classDef plaza_ctrl   fill:#1f2e24,stroke:#16a34a,stroke-width:3px,color:#c9d1d9
    classDef plaza_exec   fill:#2e2c1f,stroke:#ca8a04,stroke-width:2px,color:#c9d1d9
    classDef trans        fill:#161b22,stroke:#475569,stroke-width:1px,color:#c9d1d9
    classDef init         fill:#1e293b,stroke:#64748b,stroke-width:1px,color:#c9d1d9,stroke-dasharray:4
    classDef emerg        fill:#450a0a,stroke:#f87171,stroke-width:3px,color:#c9d1d9
```

---

## Mapa de Clasificación al Vuelo

```mermaid
flowchart LR
    subgraph SEN["Sensores (en P2)"]
        I05["I0.5\nCapacitivo\n(Metal + Plástico)"]
        I04["I0.4\nFotoeléctrico\n(Presencia general)"]
    end

    subgraph MAT["Material detectado"]
        M_met["Metal puro\nI0.5=1 AND I0.4=1"]
        M_mix["Mixto\nI0.4=1 XOR I0.5=1"]
        M_pla["Plástico\nI0.4=0 AND I0.5=0"]
    end

    subgraph DST["Coordenada → Rampa → Salida"]
        D1["VD300 = 710.0\nRampa 1 → Q0.4"]
        D2["VD300 = 1150.0\nRampa 2 → Q0.5"]
        D3["VD300 = 1520.0\nRampa 3 → Q0.6"]
    end

    I05 & I04 --> M_met & M_mix & M_pla
    M_met --> D1
    M_mix --> D2
    M_pla --> D3
```

---

## Tabla de Plazas (referencia rápida)

| Plaza | Marca | Nombre | Setpoint VD112 | Descripción |
|:---|:---|:---|:---|:---|
| **P0** | **M0.0** | **Reposo** | **0.0** | **Estado inicial / post-emergencia** |
| P1 | M0.1 | Avanzar | 710.0 | Cinta avanza hacia zona de sensores |
| P2 | M0.2 | Identificar | Sin cambio | Lee I0.4 e I0.5, carga VD300 según clasificación |
| P3 | M0.3 | Viaje | VD300 | Cinta lleva pieza hasta la coordenada de la rampa |
| P4 | M0.4 | Expulsar | Sin cambio | Activa Q0.4, Q0.5 o Q0.6 según VD300 |
| P5 | M0.5 | Final | 0.0 | Reset encoder: SMD38=0, HSC 0 |

---

## Tabla de Transiciones (referencia rápida)

| Transición | Marca | Condición (AWL) | Acción principal |
|:---|:---|:---|:---|
| T0 | M1.0 | M0.0 AND I1.3 AND I1.4 AND I0.3 | R M0.0, S M0.1, VD112←710.0 |
| T1 | M1.1 | M0.1 AND (DTR HC0 AR>= 490.0) | R M0.1, S M0.2 |
| T2 | M1.2 | M0.2 (automático, siguiente scan) | R M0.2, S M0.3, VD112←VD300 |
| T3 | M1.3 | M0.3 AND (DTR HC0 +R 10.0 AR>= VD300) | R M0.3, S M0.4, Activar eyector |
| T4 | M1.4 | M0.4 AND (I0.7 OR I1.0 OR I1.1) | R M0.4, S M0.5, VD112←0.0 |
| T5 | M1.5 | M0.5 (automático, siguiente scan) | R M0.5, S M0.0, Reset HC0 |

---

## Tabla de Coordenadas de Rampa

| Material | I0.5 | I0.4 | VD300 (cuentas) | Cilindro | Salida |
|:---|:---:|:---:|:---|:---|:---|
| Metal puro | 1 | 1 | 710.0 | Rampa 1 | Q0.4 |
| Mixto | 1 | 0 | 1150.0 | Rampa 2 | Q0.5 |
| Mixto | 0 | 1 | 1150.0 | Rampa 2 | Q0.5 |
| Plástico | 0 | 0 | 1520.0 | Rampa 3 | Q0.6 |

---

## Parámetros del Controlador de Estados

| Parámetro | Variable | Valor | Descripción |
|:---|:---|:---|:---|
| K1 | VD120 | 97.26 | Ganancia de realimentación de posición |
| K2 | VD124 | 25.64 | Ganancia de realimentación de velocidad |
| N | VD132 | 97.26 | Ganancia de pre-compensación de referencia |
| Ts | SMB34 | 10 ms | Período de muestreo (interrupción temporizada) |
| Sat. máx | — | 32 000 | Saturación de la acción de control (= 10 V) |
| Zona muerta | — | 100 | Umbral mínimo de acción para activar motor |

---

## Comportamiento de Emergencia

| Condición | Acción AWL | Efecto en el sistema |
|:---|:---|:---|
| I1.4 = 0 (seta pulsada) | INT0: CRETI inmediato | Lazo de control se detiene al instante |
| I1.4 = 0 en bloque EMERG | S M0.0, R M0.1..M0.5 | Resetea todas las plazas, activa P0 (Reposo) |
| VD112 en emergencia | VD112 ← 0.0 | Setpoint a cero: cinta se frena |
| Eyectores en emergencia | R Q0.4..Q0.6 | Todos los cilindros se retraen |
| Recuperación | Liberar seta (I1.4 → 1) | Sistema en P0, listo para nuevo ciclo |
