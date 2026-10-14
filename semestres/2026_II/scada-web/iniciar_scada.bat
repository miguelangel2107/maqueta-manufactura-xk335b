@echo off
rem ============================================================================
rem  SCADA Celda XL-335B - Arranque local
rem  Sirve la carpeta en http://localhost:8335 (contexto seguro para Web Serial y
rem  permiso del puerto recordado) y abre el navegador predeterminado.
rem  Si Python no esta instalado, abra index.html directamente con Chrome o Edge.
rem ============================================================================
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python no esta instalado: se abre index.html directamente.
  start "" "%~dp0index.html"
  exit /b
)
start "" http://localhost:8335/
echo SCADA en http://localhost:8335  (cierre esta ventana para detenerlo)
python -m http.server 8335 --bind 127.0.0.1
