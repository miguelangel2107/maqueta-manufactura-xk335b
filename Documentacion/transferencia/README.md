# Ensayos Experimentales y Funciones de Transferencia (Fase 2 / Lab 4)

Este directorio concentra los registros temporales, curvas de reacción de planta ante entrada escalón e identificación de modelos dinámicos para los subsistemas de la maqueta industrial **XK-335B** (Asignatura **ETN-902: Control Clásico / Automático**).

---

## 📈 1. Metodología de Modelado FOPDT (First Order Plus Dead Time)

La aproximación paramétrica utilizada para lazo cerrado y sintonización de controladores PID corresponde al modelo de primer orden con retardo puro:

$$G(s) = \frac{Y(s)}{U(s)} = \frac{K \cdot e^{-\theta s}}{\tau s + 1}$$

Donde:
* **$K$ (Ganancia Estática):** Relación de amplificación entre la variación en régimen permanente $\Delta y(\infty)$ y el escalón aplicado $\Delta u$:
  $$K = \frac{\Delta y(\infty)}{\Delta u}$$
* **$\theta$ (Tiempo Muerto / Retardo de Transporte):** Intervalo de tiempo transcurrido desde la aplicación del escalón hasta la primera inflexión observable en la señal de salida.
* **$\tau$ (Constante de Tiempo):** Tiempo necesario para que la respuesta alcance el $63.2\%$ de su valor final tras superar el tiempo muerto:
  $$y(t_0 + \theta + \tau) = 0.632 \cdot y(\infty)$$

---

## 🔬 2. Inventario de Ensayos Registrados

| Archivo | Estación / Actuador | Variables Registradas | Parámetros Identificados |
| :--- | :--- | :--- | :--- |
| [`ensayo_escalon_estacion5_vfd.csv`](ensayo_escalon_estacion5_vfd.csv) | **Estación 5 (Selección)** · Variador POWTRAN PT9100A y Motor Asíncrono | `Tiempo_s`, `Entrada_AQW0_V`, `Velocidad_HSC0_RPM`, `Consigna_Freq_Hz` | $K = 290\text{ RPM/V}$, $\theta = 0.36\text{ s}$, $\tau = 0.92\text{ s}$ |

---

## 🚀 3. Visualización y Análisis Interactivo en la Plataforma Web
La plataforma web SPA dispone de un **Analizador Dinámico de Ensayos CSV** que permite:
1. Graficar en tiempo real las columnas seleccionadas (Eje X y Eje Y dual).
2. Calcular puntos críticos de la curva antes de descargar el dataset.
3. Contrastar la curva experimental contra la curva teórica identificada.
