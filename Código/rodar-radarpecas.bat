@echo off
setlocal
title RadarPecas - teste local
REM =====================================================
REM  RadarPecas - sobe backend + frontend p/ teste local
REM  Backend : http://localhost:5150 (swagger /swagger)
REM  Frontend: http://localhost:5173
REM  Banco   : Postgres em localhost:5432 (ver .env.example)
REM =====================================================

set "ROOT=%~dp0"
set "BACKEND_PROJ=%ROOT%backend\RadarPecas.Api\RadarPecas.Api.csproj"
set "FRONTEND_DIR=%ROOT%frontend\radarpecas-web"
set "API_URL=http://localhost:5150"
set "WEB_URL=http://localhost:5173"

where dotnet >nul 2>nul
if errorlevel 1 (
  echo [ERRO] dotnet nao encontrado. Instale o .NET 8 SDK.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado. Instale o Node.js LTS.
  pause
  exit /b 1
)

if not exist "%BACKEND_PROJ%" (
  echo [ERRO] Projeto nao achado: %BACKEND_PROJ%
  pause
  exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
  echo [ERRO] Frontend nao achado: %FRONTEND_DIR%
  pause
  exit /b 1
)

REM Avisa se o Postgres nao estiver ouvindo (login/busca precisam do banco)
powershell -noprofile -command "$c=New-Object Net.Sockets.TcpClient; try { $r=$c.BeginConnect('127.0.0.1',5432); if ($r.AsyncWaitHandle.WaitOne(800)) { $c.EndConnect($r); exit 0 } } catch {} exit 1" >nul 2>nul
if errorlevel 1 (
  echo [AVISO] Postgres nao responde em localhost:5432.
  echo         A API sobe mesmo assim, mas login e busca nao vao funcionar.
  echo         Suba o banco ^(user radar_user, banco radarpecas_db^) e rode de novo.
  echo.
)

echo [1/2] Subindo backend em %API_URL% ...
start "RadarPecas - Backend" cmd /k dotnet run --project "%BACKEND_PROJ%" --launch-profile http --urls "%API_URL%"

echo [2/2] Subindo frontend em %WEB_URL% ...
if not exist "%FRONTEND_DIR%\node_modules" (
  echo       Instalando dependencias do frontend ^(so na primeira vez^)...
  pushd "%FRONTEND_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    pause
    exit /b 1
  )
  popd
)
start "RadarPecas - Frontend" /d "%FRONTEND_DIR%" cmd /k "set VITE_API_BASE_URL=%API_URL%/api&& npm run dev -- --port 5173 --strictPort"

echo.
echo Pronto! Aguarde os dois terminais terminarem de compilar e abra:
echo   App:     %WEB_URL%
echo   Swagger: %API_URL%/swagger
echo   Health:  %API_URL%/api/health
echo.
pause
