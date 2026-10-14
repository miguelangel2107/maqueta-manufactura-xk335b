%% LABORATORIO 5: IMPLEMENTACIÓN DE CONTROLADORES
% Sistema: Variador-Motor-Encoder (Unidad de Selección)
% Diseño de Realimentación de Estados: Continuo-Discretizado vs Discreto

clear; clc; close all;

%% 1. DEFINICIÓN DEL MODELO (DATOS LAB 4)
Ts = 0.01; % Periodo de muestreo: 10ms (Configurado en PLC)

% Matrices Continuas (Sentido Adelante)
A = [0.0000  1.0000; 
     0.0000 -3.7638];
B = [0.0000; 
     0.1642];
C = [1 0];
D = 0;

sys_c = ss(A, B, C, D);

%% 2. DISCRETIZACIÓN DE LA PLANTA (ZOH)
% x[k+1] = Phi*x[k] + Gamma*u[k]
sys_d = c2d(sys_c, Ts, 'zoh');
Phi = sys_d.A;
Gamma = sys_d.B;

%% 3. REQUERIMIENTOS Y POLOS DESEADOS
% Se buscan polos en S = -4 (Amortiguamiento crítico, Ts_asentamiento ~ 1s)
p_s = [-4, -4.1]; % Polos en el plano S (ligeramente separados para 'place')

% Mapeo de polos al plano Z: z = exp(s*Ts)
p_z = exp(p_s * Ts);

%% 4. DISEÑO DE CONTROLADORES

% --- CONTROLADOR A: DISEÑO CONTINUO DISCRETIZADO ---
% Se diseña Kc en el dominio S y se aplica directamente al PLC
Kc = place(A, B, p_s);

% Cálculo de Na (Pre-compensación Continua)
% G_cl(0) = 1 => N = -1 / (C * inv(A - B*Kc) * B)
Na = -1 / (C * inv(A - B*Kc) * B);

% --- CONTROLADOR B: DISEÑO EN EL DOMINIO DISCRETO ---
% Se diseña Kd directamente usando las matrices Phi y Gamma
Kd = place(Phi, Gamma, p_z);

% Cálculo de Nd (Pre-compensación Discreta)
% G_cl(1) = 1 => N = 1 / (C * inv(eye(2) - (Phi - Gamma*Kd)) * Gamma)
Nd = 1 / (C * inv(eye(2) - (Phi - Gamma*Kd)) * Gamma);

%% 5. RESULTADOS PARA EL INFORME Y EL PLC
fprintf('=========================================================\n');
fprintf('   RESULTADOS DE DISEÑO - LABORATORIO 5\n');
fprintf('=========================================================\n\n');

fprintf('A. MATRICES DISCRETAS (Ts = 0.01s):\n');
disp('Phi (Matriz de Transición):'); disp(Phi);
disp('Gamma (Matriz de Entrada):'); disp(Gamma);

fprintf('\nB. CONTROLADOR CONTINUO DISCRETIZADO:\n');
fprintf('Ganancias Kc: [%.4f, %.4f]\n', Kc(1), Kc(2));
fprintf('Pre-compensación Na: %.4f\n', Na);

fprintf('\nC. CONTROLADOR DISEÑADO EN Z:\n');
fprintf('Ganancias Kd: [%.4f, %.4f]\n', Kd(1), Kd(2));
fprintf('Pre-compensación Nd: %.4f\n', Nd);

%% 6. SIMULACIÓN Y COMPARACIÓN
t = 0:Ts:3;
r = 1000 * ones(size(t)); % Referencia de 1000 cuentas

% Simulación Lazo Cerrado Discreto A (Kc)
sys_cl_a = ss(Phi - Gamma*Kc, Gamma*Na, C, D, Ts);
y_a = lsim(sys_cl_a, r, t);

% Simulación Lazo Cerrado Discreto B (Kd)
sys_cl_b = ss(Phi - Gamma*Kd, Gamma*Nd, C, D, Ts);
y_b = lsim(sys_cl_b, r, t);

% Graficación
figure;
plot(t, y_a, 'r--', 'LineWidth', 1.5); hold on;
plot(t, y_b, 'b-', 'LineWidth', 1.5);
line([0 3], [1000 1000], 'Color', 'k', 'LineStyle', ':');
title('Comparación de Controladores: Continuo Discretizado vs Discreto');
xlabel('Tiempo (s)'); ylabel('Posición (Cuentas)');
legend('Continuo Discretizado (Kc)', 'Diseñado en Z (Kd)', 'Referencia');
grid on;

fprintf('\nSimulación completada. Ver gráfica para comparar desempeño.\n');
