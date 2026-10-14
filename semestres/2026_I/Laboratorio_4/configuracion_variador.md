Para configurar tu variador Powtran PI9100A según estos nuevos requerimientos (frecuencia máxima de 60Hz, control de velocidad por AI2 a 0-10V, y lógica de control donde DI1 arranca y DI2 elige la dirección), debes seguir estos pasos y ajustar los siguientes parámetros:

**1. Configurar la frecuencia máxima a 60Hz**
Por defecto, el variador limita la frecuencia a 50Hz. Debes modificar los límites de operación:
*   Cambia el parámetro **F0.19 a 60.00** (Frecuencia máxima de salida).
*   Cambia el parámetro **F0.21 a 60.00** (Límite superior de frecuencia).
*(Nota: Si la placa del motor indica que su frecuencia nominal es 60Hz, también deberías ajustar el parámetro de motor **b0.04 a 60.00** ).*

**2. Configurar el control de velocidad mediante AI2 (0-10V)**
*   Cambia el parámetro **F0.03 a 3** (Ajuste mediante entrada analógica AI2).
*   **Ajuste físico (Jumper):** Verifica en la tarjeta de control que el puente (jumper) selector correspondiente a la entrada AI2 esté posicionado para recibir voltaje (V) y no corriente. 
*   No necesitas cambiar la escala de la curva de voltaje, ya que los parámetros de fábrica ya establecen que 0.00V (parámetro **F1.16**) equivale al 0% de la frecuencia y 10.00V (parámetro **F1.18**) equivale al 100% de la frecuencia.
*   **Cableado:** Conecta el polo positivo de tu señal analógica al terminal **AI2** y el negativo al terminal **GND**.

**3. Configurar el control de Arranque y Sentido de Giro (Modo 2 hilos tipo 2)**
Para que un terminal actúe exclusivamente como "Arranque/Paro" y otro como "Dirección", utilizaremos nuevamente la lógica de funcionamiento a 2 hilos tipo 2.
*   Cambia el parámetro **F0.11 a 1** (Control por bloque de terminales) para que el variador reciba la orden de marcha desde los terminales físicos.
*   Cambia el parámetro **F1.10 a 1** (Modo de 2 hilos tipo 2).
*   Verifica que **F1.00 esté en 1** (Giro hacia adelante / FWD). En el modo tipo 2, el terminal asignado como FWD pasa a funcionar como tu orden maestra de **Arranque/Paro (Run/Stop)**. 
*   Verifica que **F1.01 esté en 2** (Giro inverso / REV). En este mismo modo, el terminal asignado como REV actúa como tu selector de **Sentido de Giro**.
*   **Cableado:** Conecta el interruptor de arranque entre el terminal **DI1** y **COM**. Conecta el interruptor de dirección entre **DI2** y **COM**.