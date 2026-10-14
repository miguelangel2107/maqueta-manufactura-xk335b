# Diagrama Red de Petri: Unidad de Alimentación (CIPN)
## Sistema de Manufactura Flexible XK335B | S7-200 CPU 224XP CN
### Estación 2 — Alimentación | Versión 4.0

---

## Leyenda
- **Círculos / Óvalos** = Plazas (estados estables, portadoras de marcas M)
- **Rectángulos** = Transiciones (eventos que cambian el estado)
- **Flechas sólidas** = Flujo de marcas
- **Flechas punteadas** = Condición de emergencia
- `[Mx.y]` = Marca de memoria interna asociada

---

## Diagrama Principal

```mermaid
flowchart TD

    %% =========================================================
    %% ARRANQUE
    %% =========================================================

    INIT(["SM0.1\nPrimer Scan"]):::init

    %% =========================================================
    %% ZONA 0: REPOSO
    %% =========================================================

    P0(["P0 - Reposo\n[M0.0]\nBaliza roja si sin pieza\nQ1.1=1 si NOT M2.1"]):::plaza_ctrl

    INIT -->|"S M0.0\nR M0.1..7"| P0

    %% =========================================================
    %% ZONA 1: SECUENCIA DE DOSIFICACIÓN (4 pasos)
    %% =========================================================

    P1(["P1 - Sujeción\n[M0.1]\nCilindro pequeño extendiendo\nQ0.0=1 Q1.0=1"]):::plaza_exec
    P2(["P2 - Empuje\n[M0.2]\nCilindro largo empujando pieza\nQ0.0=1 Q0.1=1 Q1.0=1"]):::plaza_exec
    P3(["P3 - Retorno_E\n[M0.3]\nCilindro largo retrayendo\nQ0.0=1 Q1.0=1"]):::plaza_exec
    P4(["P4 - Retorno_S\n[M0.4]\nCilindro pequeño retrayendo\nQ1.0=1"]):::plaza_exec

    T0["T0 - Inicio Ciclo\n[M1.0]\nM0.0 AND M2.0 AND M2.1\n(Marcha + Pieza en base)"]:::trans
    T1["T1 - Sujeción OK\n[M1.1]\nM0.1 AND M2.2\n(Cil_Peq_Ext I0.0)"]:::trans
    T2["T2 - Empuje OK\n[M1.2]\nM0.2 AND M2.3\n(Cil_Lrg_Ext I0.2)"]:::trans
    T3["T3 - Retorno Largo\n[M1.3]\nM0.3 AND M2.4\n(Cil_Lrg_Ret I0.3)"]:::trans
    T4["T4 - Retorno Pequeño\n[M1.4]\nM0.4 AND M2.5\n(Cil_Peq_Ret I0.1)"]:::trans

    P0 --> T0
    T0 -->|"R M0.0\nS M0.1"| P1
    P1 --> T1
    T1 -->|"R M0.1\nS M0.2"| P2
    P2 --> T2
    T2 -->|"R M0.2\nS M0.3"| P3
    P3 --> T3
    T3 -->|"R M0.3\nS M0.4"| P4
    P4 --> T4
    T4 -->|"R M0.4\nS M0.0"| P0

    %% =========================================================
    %% EMERGENCIA
    %% =========================================================

    EMERG(["EMERGENCIA\nI1.4 = 0\nSeta activa"]):::emerg

    P1 -.->|"NOT I1.4"| EMERG
    P2 -.->|"NOT I1.4"| EMERG
    P3 -.->|"NOT I1.4"| EMERG
    P4 -.->|"NOT I1.4"| EMERG
    EMERG -.->|"R M0.1..7\nS M0.0\nQ0.0=0 Q0.1=0"| P0

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

## Mapa de Eventos (Entradas Físicas → Marcas Internas)

```mermaid
flowchart LR
    subgraph ENT["Entradas Físicas"]
        I12["I1.2\nBtn Marcha"]
        I14["I1.4\nSeta OK"]
        I06["I0.6\nSensor Pieza Base"]
        I00["I0.0\nCil_Peq Ext"]
        I02["I0.2\nCil_Lrg Ext"]
        I03["I0.3\nCil_Lrg Ret"]
        I01["I0.1\nCil_Peq Ret"]
    end

    subgraph MRK["Marcas de Evento"]
        M20["M2.0\nEv_Marcha"]
        M21["M2.1\nEv_Pieza"]
        M22["M2.2\nEv_CilP_Ext"]
        M23["M2.3\nEv_CilL_Ext"]
        M24["M2.4\nEv_CilL_Ret"]
        M25["M2.5\nEv_CilP_Ret"]
    end

    I12 & I14 --> M20
    I06 --> M21
    I00 --> M22
    I02 --> M23
    I03 --> M24
    I01 --> M25
```

---

## Tabla de Plazas (referencia rápida)

| Plaza | Marca | Nombre | Descripción | Salidas Q activas |
|:---|:---|:---|:---|:---|
| **P0** | **M0.0** | **Reposo** | **Estado inicial / post-emergencia** | **Q1.1 si NOT M2.1** |
| P1 | M0.1 | Sujeción | Cilindro pequeño extendiendo (sujeta columna) | Q0.0, Q1.0 |
| P2 | M0.2 | Empuje | Cilindro largo empuja pieza hacia salida | Q0.0, Q0.1, Q1.0 |
| P3 | M0.3 | Retorno_E | Cilindro largo retrayendo | Q0.0, Q1.0 |
| P4 | M0.4 | Retorno_S | Cilindro pequeño retrayendo | Q1.0 |

---

## Tabla de Transiciones (referencia rápida)

| Transición | Marca | Condición (AWL) | Acción principal |
|:---|:---|:---|:---|
| T0 | M1.0 | M0.0 AND M2.0 AND M2.1 | R M0.0, S M0.1 |
| T1 | M1.1 | M0.1 AND M2.2 | R M0.1, S M0.2 |
| T2 | M1.2 | M0.2 AND M2.3 | R M0.2, S M0.3 |
| T3 | M1.3 | M0.3 AND M2.4 | R M0.3, S M0.4 |
| T4 | M1.4 | M0.4 AND M2.5 | R M0.4, S M0.0 |

---

## Tabla de Eventos (referencia rápida)

| Evento | Marca | Entradas físicas | Descripción |
|:---|:---|:---|:---|
| Ev_Marcha | M2.0 | I1.2 AND I1.4 | Marcha válida: botón verde Y seta OK |
| Ev_Pieza | M2.1 | I0.6 | Pieza presente en base del tubo almacén |
| Ev_CilP_Ext | M2.2 | I0.0 | Cilindro pequeño: posición extendida confirmada |
| Ev_CilL_Ext | M2.3 | I0.2 | Cilindro largo: posición extendida confirmada |
| Ev_CilL_Ret | M2.4 | I0.3 | Cilindro largo: posición retraída confirmada |
| Ev_CilP_Ret | M2.5 | I0.1 | Cilindro pequeño: posición retraída confirmada |

---

## Comportamiento de Emergencia

| Condición | Acción AWL | Efecto en el sistema |
|:---|:---|:---|
| I1.4 = 0 (seta pulsada) | JMP inicio MOD — omite asignación de salidas | Q0.0=0, Q0.1=0 (cilindros se detienen) |
| I1.4 = 0 en bloque EMERG | R M0.1..7, S M0.0 | Resetea plazas P1–P4, activa P0 (Reposo) |
| Señal Q1.1 en emergencia | NOT I1.4 en condición | Baliza roja activa |
| Recuperación | Liberar seta (I1.4 → 1) | Sistema en P0, listo para nuevo ciclo |

---

## Marcado Inicial (Primer Scan)

Condición: SM0.1 = 1 (solo el primer ciclo de scan del PLC)

| Operación | Efecto |
|:---|:---|
| S M0.0, 1 | Activa P0 (marca inicial de la Red de Petri) |
| R M0.1, 7 | Garantiza que P1..P4 (y M0.5..M0.7) estén en 0 |

El sistema siempre arranca en estado **P0 (Reposo)** con todas las salidas inactivas.
