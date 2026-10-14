import minimalmodbus
import serial
import time

puerto = '/dev/ttyUSB0'
baudrates = [19200, 9600]
direcciones = [1, 2, 3, 4, 5]
configuraciones = [
    {'parity': serial.PARITY_EVEN, 'stopbits': 1, 'desc': '8E1'},
    {'parity': serial.PARITY_NONE, 'stopbits': 2, 'desc': '8N2'},
    {'parity': serial.PARITY_NONE, 'stopbits': 1, 'desc': '8N1'},
    {'parity': serial.PARITY_ODD, 'stopbits': 1, 'desc': '8O1'},
]

print("Iniciando escaneo de la red Modbus...")
print(f"Puerto: {puerto}")

encontrado = False

for baud in baudrates:
    print(f"\n--- Probando velocidad: {baud} baudios ---")
    for addr in direcciones:
        for config in configuraciones:
            # Creamos el instrumento
            instrumento = minimalmodbus.Instrument(puerto, addr)
            instrumento.serial.baudrate = baud
            instrumento.serial.bytesize = 8
            instrumento.serial.parity = config['parity']
            instrumento.serial.stopbits = config['stopbits']
            instrumento.serial.timeout = 0.4  # Timeout corto para escaneo rapido
            
            try:
                # Intentamos leer el registro 0
                valor = instrumento.read_register(0, functioncode=3)
                print(f"[EXITO] Direccion {addr} | Baud {baud} | {config['desc']} | Registro 0: {valor}")
                encontrado = True
            except minimalmodbus.NoResponseError:
                # No hubo respuesta (comun si no hay dispositivo con esa config)
                pass
            except minimalmodbus.InvalidResponseError as e:
                # Hubo respuesta pero no fue valida (ej: ruido o error de CRC/paridad)
                # Esto indica que ALGO respondio en esa direccion/config!
                print(f"[RESPUESTA INVALIDA] Direccion {addr} | Baud {baud} | {config['desc']} | Error: {e}")
                encontrado = True
            except Exception as e:
                # Otros errores (ej. puerto ocupado o error del sistema)
                print(f"[OTRO ERROR] Direccion {addr} | Baud {baud} | {config['desc']} | Error: {e}")
            
            # Pequeno retardo entre pruebas
            time.sleep(0.05)

if not encontrado:
    print("\nNo se detecto ningun dispositivo respondiendo en la red.")
    print("Sugerencias:")
    print("1. Verifica la conexion fisica de los cables A y B (prueba a invertirlos).")
    print("2. Asegurate de que el PLC este encendido y ejecutando el programa con la libreria Modbus Slave.")
    print("3. Comprueba el puerto correcto en /dev/ (actualmente /dev/ttyUSB0).")
