%% LABORATORIO 7: DISEÑO DE REALIMENTACIÓN DE ESTADO CON OBSERVADOR
% Sistema: Variador-Motor-Encoder (Unidad de Selección)
% Asignación de Polos y Diseño de Observador de Luenberger de Orden Completo

clear; clc; close all;

%% 1. DEFINICIÓN DEL MODELO CONTINUO
Ts = 0.01; % Periodo de muestreo: 10ms (Configurado en el PLC)

% Matrices Continuas (Obtenidas en Lab 4)
A = [0.0000  1.0000; 
     0.0000 -3.7638];
B = [0.0000; 
     0.1642];
C = [1 0];
D = 0;

sys_c = ss(A, B, C, D);

%% 2. DISCRETIZACIÓN DE LA PLANTA (ZOH)
sys_d = c2d(sys_c, Ts, 'zoh');
Phi = sys_d.A;
Gamma = sys_d.B;

%% 3. ESPECIFICACIÓN DE POLOS
% Polos del controlador (rapidez de respuesta deseada)
p_ctrl_s = [-4.0, -4.1];
p_ctrl_z = exp(p_ctrl_s * Ts);

% Polos del observador (3 veces mas rapidos que el controlador)
p_obs_s = 3.0 * p_ctrl_s;
p_obs_z = exp(p_obs_s * Ts);

%% 4. DISEÑO DE GANANCIAS
% Ganancia del controlador K
K = place(Phi, Gamma, p_ctrl_z);

% Ganancia del observador L (Dualidad: polos de Phi - L*C)
L = place(Phi', C', p_obs_z)';

% Ganancia de pre-compensacion N
N = 1 / (C * inv(eye(2) - (Phi - Gamma*K)) * Gamma);

%% 5. IMPRESIÓN DE PARÁMETROS PARA EL PLC
fprintf('=========================================================\n');
fprintf('   PARAMETROS CALCULADOS PARA EL PLC\n');
fprintf('=========================================================\n');
fprintf('K1 (Posicion): %.4f\n', K(1));
fprintf('K2 (Velocidad): %.4f\n', K(2));
fprintf('N (Precompensacion): %.4f\n', N);
fprintf('L1 (Ganancia Obs 1): %.4f\n', L(1));
fprintf('L2 (Ganancia Obs 2): %.4f\n', L(2));
fprintf('Phi11: %.6f, Phi12: %.6f\n', Phi(1,1), Phi(1,2));
fprintf('Phi21: %.6f, Phi22: %.6f\n', Phi(2,1), Phi(2,2));
fprintf('Gamma1: %.6f, Gamma2: %.6f\n', Gamma(1), Gamma(2));
fprintf('=========================================================\n\n');

%% 6. SIMULACIÓN DEL LAZO CERRADO CON OBSERVADOR
% El sistema aumentado (Planta + Observador) tiene la dinamica:
% x[k+1] = Phi*x[k] - Gamma*K*x_est[k] + Gamma*N*r[k]
% x_est[k+1] = L*C*x[k] + (Phi - Gamma*K - L*C)*x_est[k] + Gamma*N*r[k]
%
% Definimos el estado aumentado: X_aug = [x; x_est]
Phi_aug = [Phi, -Gamma*K;
           L*C, Phi - Gamma*K - L*C];
Gamma_aug = [Gamma*N;
             Gamma*N];
C_aug = [C, zeros(size(C)); % Salida real (y = x1)
         zeros(size(C)), C]; % Salida estimada (y_est = x1_est)
D_aug = [0; 0];

sys_cl = ss(Phi_aug, Gamma_aug, C_aug, D_aug, Ts);

% Tiempo y Referencia
t = 0:Ts:3;
r = 1000 * ones(size(t)); % Referencia de 1000 cuentas

% Simulación con condiciones iniciales de la planta no nulas x(0) = [200; 0]
% y del observador nulas x_est(0) = [0; 0]
x0 = [200; 0; 0; 0];
[y_sim, t_sim] = lsim(sys_cl, r, t, x0);

%% 7. GRAFICACIÓN
figure('Name', 'Realimentacion de Estados con Observador');
subplot(2,1,1);
plot(t_sim, r, 'k:', 'LineWidth', 1.5); hold on;
plot(t_sim, y_sim(:,1), 'b-', 'LineWidth', 1.5);
plot(t_sim, y_sim(:,2), 'r--', 'LineWidth', 1.5);
title('Respuesta del Sistema y Estimacion de Posicion');
xlabel('Tiempo (s)'); ylabel('Posicion (Cuentas)');
legend('Referencia', 'Posicion Real (y)', 'Posicion Estimada (y_{est})', 'Location', 'best');
grid on;

% Error de estimacion
err_pos = y_sim(:,1) - y_sim(:,2);
subplot(2,1,2);
plot(t_sim, err_pos, 'g-', 'LineWidth', 1.5);
title('Error de Estimacion de Posicion (e_y = y - y_{est})');
xlabel('Tiempo (s)'); ylabel('Error (Cuentas)');
grid on;

% Guardar la grafica en formato PDF
saveas(gcf, 'ComparacionControladorObservador.pdf');
fprintf('Simulacion completada y grafica guardada como ComparacionControladorObservador.pdf\n');
