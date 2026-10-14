# Unidad de Ensamblaje - XK335B | S7-200 CPU 224XP CN
# Documento 2: Mapeo de Hardware
# OB1 UNIDAD DE ENSAMBLAJE v2 - CIPN

---

## 1. Tabla de Entradas Digitales

| Direccion | Simbolo        | Descripcion                                               | Uso en CIPN          |
|-----------|----------------|-----------------------------------------------------------|----------------------|
| I0.0      | Sens_Tub_Inf   | Fotoelectrico tubo inferior - nivel bajo (stock)          | Condicion T0 (M2.1)  |
| I0.1      | Sens_Tub_Sup   | Fotoelectrico tubo superior - nivel alto                  | No mapeado en CIPN   |
| I0.2      | Sens_Sal_Tub   | Presencia pieza en salida del tubo dosificador            | No mapeado en CIPN   |
| I0.3      | Sens_Pieza_Rec | Presencia pieza lista para recoger                        | No mapeado en CIPN   |
| I0.4      | Sens_Fibra_Pza | Fibra Omron - pieza grande receptora presente en mesa     | Condicion T0 (M2.2)  |
| I0.5      | CilS_Ext       | Cilindro superior extendido (sujetador OK)                | Condicion T1 (M2.3)  |
| I0.6      | CilS_Ret       | Cilindro superior retraido                                | Evento M2.4          |
| I0.7      | CilI_Ext       | Cilindro inferior extendido                               | Condicion T3 (M2.5)  |
| I1.0      | CilI_Ret       | Cilindro inferior retraido (pieza liberada)               | Condicion T2 (M2.6)  |
| I1.1      | Giro_AH        | Giro antihorario completado (posicion recogida)           | Evento M2.7          |
| I1.2      | Giro_H         | Giro horario completado (posicion origen)                 | Condicion T4 (M3.0)  |
| I1.3      | Pinza_Cer      | Pinza cerrada                                             | Condicion T6 (M3.1)  |
| I1.4      | CilV_Abajo     | Cilindro vertical abajo                                   | Condicion T5,T9(M3.2)|
| I1.5      | CilV_Arriba    | Cilindro vertical arriba                                  | Evento M3.3          |
| I1.6      | CilH_Atras     | Cilindro horizontal atras (origen)                        | Condicion T12 (M3.4) |
| I1.7      | CilH_Adelante  | Cilindro horizontal adelante (sobre pieza)                | Condicion T8 (M3.5)  |
| I2.4      | Btn_Rojo       | Boton rojo - paro de ciclo (flanco de subida)             | Flag M6.0            |
| I2.5      | Btn_Verde      | Boton verde - marcha                                      | Condicion T0 (M2.0)  |
| I2.6      | Seta_Emerg     | Seta de emergencia (NC: 0 = emergencia activa)            | MOD0 seguridad       |
| I2.7      | Selector       | Selector de modo                                          | No mapeado en CIPN   |

---

## 2. Tabla de Salidas Digitales

| Direccion | Simbolo         | Descripcion                                        | Activo en Plazas        |
|-----------|-----------------|----------------------------------------------------|-------------------------|
| Q0.0      | V_CilI          | Valvula cilindro inferior liberador (logica inv.)  | P0,P1,P3..P12 (NO P2)  |
| Q0.1      | V_CilS          | Valvula cilindro superior sujetador                | P1, P2, P3              |
| Q0.2      | V_Giro_H        | Valvula giro mesa (accion: giro antihorario)       | P4, P5, P6, P7          |
| Q0.3      | V_Pinza         | Valvula pinza cerrar                               | P6, P7, P8, P9          |
| Q0.4      | V_CilV          | Valvula cilindro vertical bajar                    | P5, P6, P9, P10         |
| Q0.5      | V_CilH          | Valvula cilindro horizontal adelante               | P8, P9, P10, P11        |
| Q0.6      | Baliza_Roja     | Baliza roja: reposo sin stock                      | P0 Y ausencia de stock  |
| Q0.7      | Baliza_Amarilla | Baliza amarilla: parada activa                     | Cuando M6.0=1           |
| Q1.0      | Baliza_Verde    | Baliza verde: ciclo activo                         | Fuera de P0             |
| Q1.5      | Led_Amarillo    | LED amarillo (mismo que Baliza_Amarilla)           | Cuando M6.0=1           |
| Q1.6      | Led_Verde       | LED verde (mismo que Baliza_Verde)                 | Fuera de P0             |
| Q1.7      | Led_Rojo        | LED rojo (mismo que Baliza_Roja)                   | P0 Y ausencia de stock  |

Nota: Q1.1 a Q1.4 no son utilizadas en este programa.

---

## 3. Tabla de Plazas de la Red de Petri (Marcas M0.0 - M1.4)

| Bit   | Nombre           | Plaza | Descripcion del Estado                                   |
|-------|------------------|-------|----------------------------------------------------------|
| M0.0  | P0_Reposo        | P0    | Estado de reposo. Espera condiciones de inicio.          |
| M0.1  | P1_Dos_Sujetar   | P1    | Dosificador: cilindro superior activa, sujeta columna.   |
| M0.2  | P2_Dos_Caida     | P2    | Dosificador: cilindro inferior desactiva, pieza cae.     |
| M0.3  | P3_Dos_Restaurar | P3    | Dosificador: cilindro inferior restaura posicion.        |
| M0.4  | P4_Mesa_Giro     | P4    | Mesa giratoria: gira antihorario a posicion recogida.    |
| M0.5  | P5_Pick_Bajar    | P5    | Pick: brazo baja (cil vertical) sobre pieza secundaria.  |
| M0.6  | P6_Pick_Agarrar  | P6    | Pick: pinza cierra para agarrar la pieza.                |
| M0.7  | P7_Pick_Subir    | P7    | Pick: brazo sube con pieza agarrada.                     |
| M1.0  | P8_Place_Trans   | P8    | Place: brazo traslada horizontalmente sobre receptora.   |
| M1.1  | P9_Place_Bajar   | P9    | Place: brazo baja sobre pieza receptora.                 |
| M1.2  | P10_Place_Soltar | P10   | Place: pinza abre y suelta pieza secundaria.             |
| M1.3  | P11_Place_Subir  | P11   | Place: brazo sube tras depositar pieza.                  |
| M1.4  | P12_Reset_Arm    | P12   | Reset: brazo retorna atras, mesa vuelve a origen.        |

Marcado inicial: M0.0 = 1 (P0 activo), M0.1..M1.4 = 0.

---

## 4. Tabla de Transiciones (Marcas M4.0 - M5.4)

| Bit   | Nombre     | Trans | Condicion de Disparo                                       |
|-------|------------|-------|------------------------------------------------------------|
| M4.0  | T0_Inicio  | T0    | P0 AND Btn_Verde AND Sens_Tub_Inf AND Fibra_Pza AND !Paro  |
| M4.1  | T1_SujOK   | T1    | P1 AND CilS_Ext (sujetador extendido OK)                   |
| M4.2  | T2_LibOK   | T2    | P2 AND CilI_Ret (cilindro inferior retraido OK)            |
| M4.3  | T3_ResOK   | T3    | P3 AND CilI_Ext (cilindro inferior restaurado)             |
| M4.4  | T4_MesaRec | T4    | P4 AND Giro_H (mesa llego a posicion origen segun sensor)  |
| M4.5  | T5_ArmAbj  | T5    | P5 AND CilV_Abajo (brazo llego abajo)                      |
| M4.6  | T6_PinzaOK | T6    | P6 AND Pinza_Cer (pinza cerrada OK)                        |
| M4.7  | T7_ArmArr  | T7    | P7 (sin condicion adicional de sensor - solo P7 activo)    |
| M5.0  | T8_TransOK | T8    | P8 AND CilH_Adelante (brazo llego adelante)                |
| M5.1  | T9_BajOK   | T9    | P9 AND CilV_Abajo (brazo llego abajo en zona place)        |
| M5.2  | T10_SoltOK | T10   | P10 AND !Pinza_Cer (pinza abierta = pieza suelta)          |
| M5.3  | T11_SubOK  | T11   | P11 (sin condicion adicional - solo P11 activo)            |
| M5.4  | T12_RetOK  | T12   | P12 AND CilH_Atras AND Giro_H (brazo atras Y mesa origen)  |

---

## 5. Tabla de Eventos (Marcas M2.0 - M3.5)

| Bit   | Simbolo       | Descripcion                                       | Origen       |
|-------|---------------|---------------------------------------------------|--------------|
| M2.0  | Ev_Marcha     | Boton verde presionado (marcha)                   | I2.5         |
| M2.1  | Ev_Tub_Inf    | Sensor tubo inferior activo (stock bajo OK)       | I0.0         |
| M2.2  | Ev_Fibra      | Fibra Omron: pieza receptora presente             | I0.4         |
| M2.3  | Ev_CilS_Ext   | Cilindro superior extendido (sujetador OK)        | I0.5         |
| M2.4  | Ev_CilS_Ret   | Cilindro superior retraido                        | I0.6         |
| M2.5  | Ev_CilI_Ext   | Cilindro inferior extendido                       | I0.7         |
| M2.6  | Ev_CilI_Ret   | Cilindro inferior retraido (pieza liberada)       | I1.0         |
| M2.7  | Ev_Giro_AH    | Giro antihorario completado (posicion recogida)   | I1.1         |
| M3.0  | Ev_Giro_H     | Giro horario completado (posicion origen)         | I1.2         |
| M3.1  | Ev_Pinza_Cer  | Pinza cerrada                                     | I1.3         |
| M3.2  | Ev_CilV_Abajo | Cilindro vertical abajo                           | I1.4         |
| M3.3  | Ev_CilV_Arriba| Cilindro vertical arriba                          | I1.5         |
| M3.4  | Ev_CilH_Atras | Cilindro horizontal atras (posicion origen)       | I1.6         |
| M3.5  | Ev_CilH_Adel  | Cilindro horizontal adelante (sobre pieza)        | I1.7         |

---

## 6. Tabla de Flags del Sistema (Marcas M6.x)

| Bit   | Simbolo     | Descripcion                                                    |
|-------|-------------|----------------------------------------------------------------|
| M6.0  | Flag_Parada | Flag de parada de ciclo. Se activa por flanco de subida de     |
|       |             | I2.4 (Btn_Rojo). Bloquea T0 para que el ciclo no se reinicie. |
|       |             | Se resetea automaticamente cuando M0.0 esta activo (reposo).  |

---

Fin del Documento 2.
