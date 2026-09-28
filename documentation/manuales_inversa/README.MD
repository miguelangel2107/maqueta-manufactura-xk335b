# 📂 Documentación Técnica y Manuales de Ingeniería Inversa (Lab 1)

Este directorio centraliza la evidencia documental, diagnósticos de campo y fichas técnicas correspondientes a la **Fase 1: Auditoría Kaizen e Ingeniería Inversa** de la maqueta de manufactura flexible.

---

## 📄 Contenido del Directorio

1. **`Informe_Lab1_Identificacion_Variables.pdf`**  
   Informe técnico oficial del Laboratorio 1 presentado por la escuadra concurrente. Contiene el análisis fenomenológico, la clasificación de variables (PV, MV, DV), los diagramas de bloques funcionales y la demostración matemática de ruptura de lazo de control.

2. **`/datasheets/`**  
   Hojas de datos de los fabricantes correspondientes a los componentes de sensórica, actuadores y controladores Siemens SIMATIC S7-200 CN presentes en la planta.

3. **`/evidencias_campo/`**  
   Registro fotográfico de la auditoría estática cable por cable, documentando las discrepancias mecánicas y eléctricas frente a los manuales históricos heredados (montajes con silicona, desalineaciones de cilindros, borneras deterioradas y conexiones no documentadas del VFD).

---

## 🔍 Resumen del Inventario Relevado
* **5 Controladores PLC:** Siemens S7-200 (Modelos CPU 224 CN, CPU 224XP CN y CPU 226 CN).
* **Bus de Campo:** RS-485 bifilar apantallado en cascada (Daisy-Chain) con terminaciones de 220 Ω.
* **Actuador Principal de Cinta:** Motor asíncrono trifásico accionado por inversor de frecuencia POWTRAN PT9100A (entrada monofásica 220 VAC).
