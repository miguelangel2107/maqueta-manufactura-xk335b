# II-2026

Asignaturas: ETN-902 Sistemas de Control II, ETN-1034 Aplicación de Técnicas de Control y ETN-1000 Bases de Datos.

Docente: Ing. Jorge Antonio Nava Amador.
Auxiliares: Limber Ajnota, Fabián Plata, Franz Choque.

## Integrantes

- Miguel Ángel López Rodríguez
- Wilson Huanca
- Juan Carlos Siñani
- Henrry Torrez
- Valeria Gandarillas
- Paul Quisbert
- Mauricio Cuevas

## Trabajo del semestre

El semestre se organiza en tres fases, según las guías de laboratorio 1 a 8:

1. **Ingeniería inversa y auditoría Kaizen** (semanas 1 a 6). Revisión física de la planta cable por cable, comparación con los planos de semestres anteriores, registro de fallas y nuevos P&ID y planos eléctricos.
2. **Modelado dinámico, caja negra y backend** (semanas 7 a 13). Pruebas de escalón para obtener funciones de transferencia, redes de Petri de la secuencia de la planta y diseño de la base de datos.
3. **Implementación, redes industriales y ERP** (semanas 14 a 20). Control sobre la planta real, comunicación entre los PLC y supervisión desde el SCADA y el ERP.

En este semestre se sumó un brazo de 4 grados de libertad como sexta estación. Su PLC está en la misma red PPI y recoge al final de la cinta de selección las piezas que no van a ninguna rampa.

## Carpetas

| Carpeta               | Contenido |
|-----------------------|-----------|
| `guias/`              | Guías de laboratorio 1 a 8. |
| `ingenieria-inversa/` | Informe del laboratorio 1. |
| `diagnostico-kaizen/` | Fotos de las fallas encontradas en la planta. |
| `diagramas-bloques/`  | Diagramas de bloques de cada unidad. |
| `planos/`             | P&ID, planos eléctricos y mockups de las pantallas del HMI y del ERP. |
| `mapeo-hardware/`     | Entradas y salidas de cada PLC. |
| `programas-plc/`      | Programas de las seis estaciones en AWL y como proyectos Micro/WIN. |
| `scada-web/`          | SCADA de la celda en el navegador, conectado al PLC de Transporte por Modbus RTU. |
| `configuracion/`      | Configuración del variador PI9100, protocolo PPI, mapa de memoria y funcionamiento de la celda. |
| `transferencia/`      | Ensayo de escalón de la cinta de selección. |
| `redes-petri/`        | Redes de Petri de la secuencia de cada unidad. |
| `base-de-datos/`      | Esquema y scripts de la base de datos. |
| `redes-industriales/` | Comunicación entre los PLC, el variador y el SCADA. |
| `erp/`                | Sistema ERP de la planta. |
