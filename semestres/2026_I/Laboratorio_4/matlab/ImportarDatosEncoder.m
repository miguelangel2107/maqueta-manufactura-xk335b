clear all; clc;
%% =========================================================
% CONFIGURACIÓN DEL EXPERIMENTO (Cambiar según el archivo)
% =========================================================
sentido = 'ADELANTE'; % Opciones: 'ADELANTE' / 'ATRAS'
archivo = ['ENCODER2-', sentido, '.csv'];

%% 1. Preparación y Carga de Datos
fprintf('\n>>> Procesando datos de: %s\n', sentido);
tabla = readtable(archivo);
u = tabla.Entrada; 
y = tabla.Salida;
data = iddata(y, u, 0.01, 'Name', ['Datos_', sentido]);

%% 2. Estimación Estricta del Modelo Físico
% .x1=x2 (Posición) | .x2=-a*x2+bu (Velocidad)
A = [0 1; 0 -0.1]; B = [0; 0.001]; C = [1 0]; D = 0;
sys_init = idss(A, B, C, D, 'Ts', 0);
sys_init.SSParameterization = 'Structured';
sys_init.Structure.A.Free = [false, false; false, true];
sys_init.Structure.B.Free = [false; true];
sys_init.Structure.C.Free = false; sys_init.Structure.D.Free = false;

% Ejecución del motor de identificación
sys_final = ssest(data, sys_init, ssestOptions('Display','off'));

%% 3. Análisis de Ingeniería de la Planta
A_f = sys_final.A; B_f = sys_final.B;
a_val = -A_f(2,2); 
b_val = B_f(2);
polos = eig(A_f);
tau = 1/a_val; % Constante de tiempo del sistema
Mc = ctrb(A_f, B_f); % Matriz de Controlabilidad
Mo = obsv(A_f, sys_final.C); % Matriz de Observabilidad

%% 4. IMPRESIÓN DE RESULTADOS DIFERENCIADOS
fprintf('\n=========================================================');
fprintf('\n   INFORME TÉCNICO: UNIDAD DE SELECCIÓN (%s)', sentido);
fprintf('\n=========================================================\n');

fprintf('A. MATRICES DE ESTADO (ETN1034):\n');
fprintf('   x1 = Posición (Cuentas) | x2 = Velocidad (Cuentas/s)\n');
fprintf('   A_%s = [%.4f  %.4f; %.4f  %.4f]\n', sentido, A_f');
fprintf('   B_%s = [%.4f; %.4f]\n\n', sentido, B_f);

fprintf('B. ESTABILIDAD Y DINÁMICA:\n');
fprintf('   Polos: s1 = %.4f, s2 = %.4f\n', polos(1), polos(2));
fprintf('   Constante de tiempo (tau): %.4f segundos\n', tau);
fprintf('   Ganancia de velocidad (b/a): %.4f (cuentas/s por unidad de u)\n\n', b_val/a_val);

fprintf('C. PROPIEDADES ESTRUCTURALES:\n');
fprintf('   Rango Mc: %d (Controlable: %s)\n', rank(Mc), logical2str(rank(Mc)==2));
fprintf('   Rango Mo: %d (Observable: %s)\n\n', rank(Mo), logical2str(rank(Mo)==2));

fprintf('D. FUNCIÓN DE TRANSFERENCIA (ETN902):\n');
tf_sys = tf(sys_final);
display(tf_sys);

fprintf('E. VALIDACIÓN:\n');
fprintf('   Ajuste del modelo (Fit): %.2f%%\n', sys_final.Report.Fit.FitPercent);
fprintf('=========================================================\n');

% Gráfica de validación
figure('Name', ['Validación ', sentido]);
compare(data, sys_final);
title(['Comparación Datos Experimentales vs Modelo (%): ', sentido]);

function s = logical2str(l); if l, s='SÍ'; else, s='NO'; end; end