# 📐 Planos de Ingeniería y Simbología Normalizada (Planos ISA / IEC)

Este directorio centraliza el acervo de planos de ingeniería de la **Maqueta de Manufactura Flexible XK-335B**, estructurados bajo rigurosa normativa internacional de dibujo técnico e instrumentación industrial para la **Fase 1 (Gestión II/2026)**.

---

## 📌 1. Propósito y Diferenciación Normativa

Para evitar confusiones entre el modelado funcional de control y la ingeniería de detalle electromecánica, los esquemas se dividen estrictamente en dos ramas complementarias:

```text
                                  ┌────────────────────────────────────────────────────────┐
                                  │   DOCUMENTACIÓN TÉCNICA DE PLANOS (XK-335B)             │
                                  └──────────────────────────┬─────────────────────────────┘
                                                             │
                              ┌──────────────────────────────┴──────────────────────────────┐
                              ▼                                                             ▼
  ┌───────────────────────────────────────────────────────┐     ┌───────────────────────────────────────────────────────┐
  │         DIAGRAMAS P&ID (ANSI/ISA-S5.1-2009)           │     │          ESQUEMAS ELÉCTRICOS (IEC 60617 / 81346)       │
  ├───────────────────────────────────────────────────────┤     ├───────────────────────────────────────────────────────┤
  │ • Propósito: Abstracción funcional e instrumentación. │     │ • Propósito: Conexión física, cableado y potencia.    │
  │ • Representa: Lazos de control, transmisores,         │     │ • Representa: Alimentación 220VAC / 24VDC, borneras,  │
  │   sensores, válvulas y variables (PV, MV, DV).        │     │   relés, contactores, drivers y bornes I/O del PLC.   │
  │ • Normativa: ANSI/ISA-S5.1-2009.                      │     │ • Normativa: IEC 60617 (Símbolos) / IEC 81346 (Tags).│
  │ • Ubicación: /Diagrama_P&ID/                          │     │ • Ubicación: /Diagrama_Electrico/                     │
  └───────────────────────────────────────────────────────┘     └───────────────────────────────────────────────────────┘
```

---

## 📂 2. Estructura del Directorio

```text
Planos/
├── README.md                      # Este manual maestro de normas de dibujo
├── Diagrama_Electrico/            # Esquemas eléctricos bajo norma IEC
│   ├── README.md                  # Especificaciones de potencia, mando y borneras
│   ├── 1_Transporte/              # Eje servo Panasonic, nodo maestro RS-485
│   ├── 2_Alimentacion/            # Cilindro eyector, electroválvula 5/2, sensores
│   ├── 3_Ensamblaje/              # Actuador rotativo, pinza angular
│   ├── 4_Procesamiento/           # Cilindro de prensa y mordaza guiada
│   └── 5_Seleccion/               # VFD POWTRAN, motor trifásico, encoder
├── Diagrama_P&ID/                 # Diagramas de instrumentación ANSI/ISA-S5.1
│   ├── README.md                  # Reglas de codificación de tags y burbujas ISA
│   ├── 1_Transporte/              # Lazos de cinemática cartesiana y seguridad
│   ├── 2_Alimentacion/            # Lazos de dosificación y presencia de pieza
│   ├── 3_Ensamblaje/              # Lazos de orientación y ensamblaje de piezas
│   ├── 4_Procesamiento/           # Lazos de prensado y confirmación de carrera
│   └── 5_Seleccion/               # Lazos de regulación de velocidad y clasificación
└── mockups/                       # Prototipos UI/UX de HMI y Dashboard ERP
    └── README.md                  # Wireframes y especificación de interfaz (ETN-1000)
```

---

## 🛠️ 3. Estándares de Entrega y Formatos Admitidos

1. **Formato Vectorial Fuente:**  
   Todo plano original debe diseñarse en **AutoCAD Electrical** o **EPLAN Electric P8** y versionarse preferentemente en formato `.dwg` o `.dxf`.
2. **Formato de Distribución Universal:**  
   Todo plano debe acompañarse obligatoriamente de su exportación en **PDF vectorial** de alta resolución (mínimo 300 DPI, tamaño hoja A3 o A4 industrial), para permitir su visualización directa en el portal web sin necesidad de licencias CAD privativas.
3. **Cajetín y Cuadro de Rotulación Normalizado:**  
   Todo plano debe incluir en la esquina inferior derecha el cajetín oficial con:
   - Institución: *Universidad Mayor de San Andrés - Facultad de Ingeniería - Electrónica*
   - Proyecto: *Maqueta de Manufactura Flexible XK-335B (Fase 1 - II/2026)*
   - Materias: *ETN-902 / ETN-1034 / ETN-1000*
   - Escuadra de Autores y Fecha de Revisión
   - Código de Plano: `XK335B-[ELEC|PID]-[EST1..EST5]-REV2.0.pdf`
