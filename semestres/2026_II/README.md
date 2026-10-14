# II-2026

Asignaturas: ETN-902 Sistemas de Control II, ETN-1034 Aplicación de Técnicas de Control y ETN-1000 Bases de Datos.
Docente: Ing. Jorge Antonio Nava Amador. Auxiliares: Limber Ajnota, Fabián Plata, Franz Choque.

El semestre sigue las guías de laboratorio 1 a 8 (`guias/`), en tres fases:

1. Ingeniería inversa y auditoría Kaizen (semanas 1 a 6).
2. Modelado dinámico, caja negra y backend (semanas 7 a 13).
3. Implementación, redes industriales y ERP (semanas 14 a 20).

Estamos en el laboratorio 4.

## Carpetas

| Carpeta               | Contenido |
|-----------------------|-----------|
| `guias/`              | Guías de laboratorio 1 a 8. |
| `ingenieria-inversa/` | Informe del laboratorio 1. |
| `diagnostico-kaizen/` | Fotos de las fallas encontradas en la revisión de la planta. |
| `diagramas-bloques/`  | Diagramas de bloques de cada unidad. Faltan subir los `.drawio`. |
| `planos/`             | `pid/`, `electrico/` y `mockups/` de las pantallas del HMI y del ERP. |
| `mapeo-hardware/`     | Entradas y salidas de cada PLC, incluido el brazo. |
| `programas-plc/`      | `awl/`: programas actuales de las seis estaciones. Los proyectos Micro/WIN van en `microwin/`. |
| `scada-web/`          | SCADA de la celda en el navegador (Modbus RTU por Web Serial). Tiene modo demo. |
| `configuracion/`      | Configuración del variador PI9100, protocolo PPI, mapa de memoria y funcionamiento general. |
| `transferencia/`      | Ensayo de escalón de la cinta. El CSV es provisional hasta tener el original del variador. |
| `base-de-datos/`      | Scripts SQL y script Python de prueba. Se reemplazarán por los del grupo de ETN-1000. |

El brazo de 4 grados de libertad solo tiene su programa (`programas-plc/awl/06_Brazo_4DOF.awl`) y su mapeo de E/S; no se harán planos ni diagramas para él.

## Lo que falta subir

- Proyectos Micro/WIN (`.mwp`) de los programas AWL actuales → `programas-plc/microwin/`
- Diagramas de bloques en `.drawio` → `diagramas-bloques/`
- Modelos 3D en SolidWorks de cada unidad → `global/modelos-3d/solidworks/`
- Videos de funcionamiento → YouTube, con el enlace en `config/videos.json`
- Entregas de los laboratorios 4 en adelante. Si no encajan en ninguna carpeta, cree una con un nombre corto y sin tildes (por ejemplo `modelado/`, `redes-petri/`, `erp/`).
