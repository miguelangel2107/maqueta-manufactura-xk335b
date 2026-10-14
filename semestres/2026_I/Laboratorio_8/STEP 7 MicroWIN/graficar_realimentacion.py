import os
import matplotlib.pyplot as plt

def parse_raw(s):
    if not s or s == '0.0':
        return 0.0
    dots = s.count('.')
    if dots > 1:
        parts = s.split('.')
        return float(''.join(parts[:-1]) + '.' + parts[-1])
    else:
        return float(s)

def parse_sequence(raw_list):
    parsed_list = []
    prev_val = 0.0
    for s in raw_list:
        if not s or s == '0.0':
            val = 0.0
        else:
            dots = s.count('.')
            if dots > 1:
                # Value has multiple dots (thousands separators and decimal point)
                X = parse_raw(s)
                val_a = X
                val_b = X / 10.0
                if prev_val >= 100.0:
                    val = val_a if abs(val_a - prev_val) < abs(val_b - prev_val) else val_b
                else:
                    # Default for initial transient when prev_val is small/zero
                    val = val_a
            elif dots == 1:
                dot_idx = s.find('.')
                decimal_part = s[dot_idx+1:]
                X = float(s)
                # If dot is at index 3 and there are multiple decimal digits (e.g. '561.879', '640.23'),
                # it might be a shifted decimal separator. True floats (like '127.0') will have exactly
                # 1 decimal digit and won't be scaled.
                if dot_idx == 3 and len(decimal_part) > 1:
                    val_a = X
                    val_b = X * 10.0
                    if prev_val >= 100.0:
                        val = val_a if abs(val_a - prev_val) < abs(val_b - prev_val) else val_b
                    else:
                        val = val_b
                else:
                    val = X
            else:
                val = float(s)
                
        parsed_list.append(val)
        if val > 0.0:
            prev_val = val
            
    return parsed_list

def process_file(csv_path, output_png_path, title):
    if not os.path.exists(csv_path):
        print(f"Error: El archivo {csv_path} no existe.")
        return
        
    pos_dict = {}
    sp_dict = {}
    ca_dict = {}
    
    # Auto-detect separator (tab or semicolon)
    separator = '\t'
    with open(csv_path, 'r') as f:
        first_line = f.readline()
        if ';' in first_line:
            separator = ';'
            
    # Read CSV lines
    with open(csv_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(separator)
            if len(parts) < 3:
                continue
            
            addr, datatype, val_str = parts
            addr_val = int(addr[2:])
            addr_offset = (addr_val - 5000) // 4
            k = addr_offset // 3
            var_type = addr_offset % 3
            
            if var_type == 0:
                pos_dict[k] = val_str
            elif var_type == 1:
                sp_dict[k] = val_str
            elif var_type == 2:
                ca_dict[k] = val_str
                
    # Sort and align by sample index k
    pos_keys = sorted(pos_dict.keys())
    pos_raw_vals = [pos_dict[k] for k in pos_keys]
    
    sp_keys = sorted(sp_dict.keys())
    sp_raw_vals = [sp_dict[k] for k in sp_keys]
    
    ca_keys = sorted(ca_dict.keys())
    ca_raw_vals = [ca_dict[k] for k in ca_keys]
    
    # Parse sequences using the robust tracking algorithm
    pos_vals = parse_sequence(pos_raw_vals)
    ca_vals = parse_sequence(ca_raw_vals)
    sp_vals = [float(s) for s in sp_raw_vals]
    
    # Create the plot using high-quality aesthetics
    plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
    plt.rcParams['font.family'] = 'sans-serif'
    
    fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, figsize=(10, 8))
    
    # Top plot: Position and Setpoint
    ax1.plot(sp_keys, sp_vals, label='Setpoint (Referencia)', color='#f72585', linestyle='--', linewidth=2)
    ax1.plot(pos_keys, pos_vals, label='Posición (Salida)', color='#00b4d8', linewidth=2)
    ax1.set_ylabel('Cuentas', fontsize=12, fontweight='bold')
    ax1.set_title(title, fontsize=14, fontweight='bold', pad=15)
    ax1.legend(loc='lower right', fontsize=10)
    ax1.grid(True, linestyle='--', alpha=0.6)
    
    # Bottom plot: Control Action
    ax2.plot(ca_keys, ca_vals, label='Acción de Control', color='#7209b7', linewidth=2)
    ax2.set_xlabel('Número de Muestra (k)', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Acción de Control (adimensional)', fontsize=12, fontweight='bold')
    ax2.legend(loc='upper right', fontsize=10)
    ax2.grid(True, linestyle='--', alpha=0.6)
    
    plt.tight_layout()
    plt.savefig(output_png_path, dpi=300)
    plt.close()
    print(f'¡Gráfica guardada exitosamente como {output_png_path}!')

def main():
    # Process both datasets
    process_file('Realimentacion.csv', 'grafica_realimentacion.png', 
                 'Respuesta Temporal del Sistema de Control Realimentado (Realimentacion.csv)')
    process_file('optimo.csv', 'grafica_optimo.png', 
                 'Respuesta Temporal del Sistema de Control Realimentado (optimo.csv)')

if __name__ == '__main__':
    main()
