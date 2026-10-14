clear;      % Limpia variables, pero no funciones compiladas
clc;        % Limpia la consola

% Lectura de los datos desde los archivos CSV
Vout  = xlsread('ALL0000/A0000CH1.csv', 'A14:A4013');
Vin = xlsread('ALL0000/A0000CH2.csv', 'A14:A4013');
% RL = 99.1k
% Rs = 62k
% Rt = 6.72k
% Ct = 1uF
% Vout = Fin*2.09V*(RL/Rs)*Rt*Ct

