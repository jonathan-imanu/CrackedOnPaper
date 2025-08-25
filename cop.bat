@echo off
setlocal enabledelayedexpansion

REM CrackedOnPaper Development Script for Windows

if "%1"=="" goto help

if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="logs" goto logs
if "%1"=="stop" goto stop
if "%1"=="build" goto build
if "%1"=="status" goto status
if "%1"=="help" goto help
if "%1"=="wf" goto wf
if "%1"=="wb" goto wb

echo Unknown command: %1
goto help

:dev
echo Starting development environment...
docker compose --project-name "crackedonpaper" down
docker compose --project-name "crackedonpaper" build --parallel backend frontend
docker compose --project-name "crackedonpaper" --profile development up -d

echo Please use wf & wb to start separate watch processes for backend and frontend...
goto end

:wf
docker compose --project-name "crackedonpaper" watch frontend
goto end

:wb
docker compose --project-name "crackedonpaper" watch backend
goto end

:prod
echo Starting production environment...
docker compose --project-name "crackedonpaper" down
docker compose --project-name "crackedonpaper" build --parallel backend frontend
docker compose --project-name "crackedonpaper" --profile production up -d
echo Production environment started with nginx reverse proxy
goto end

:logs
echo Viewing logs...
docker compose --project-name "crackedonpaper" logs -f
goto end

:stop
echo Stopping all services...
docker compose --project-name "crackedonpaper" down
echo Services stopped
goto end

:build
echo Building services...
docker compose --project-name "crackedonpaper" build --parallel backend frontend
echo Build complete
goto end

:status
echo Service status:
docker compose --project-name "crackedonpaper" ps
goto end

:help
echo CrackedOnPaper Development Script
echo.
echo Usage: cop.bat [command]
echo.
echo Commands:
echo   dev     - Start development environment with hot reloading
echo   prod    - Start production environment with nginx reverse proxy
echo   logs    - View logs from all services
echo   stop    - Stop all services
echo   build   - Build backend and frontend services
echo   status  - Show status of all services
echo   help    - Show this help message
echo.
echo Examples:
echo   cop.bat dev           # Start development environment
echo   cop.bat prod          # Start production environment
echo   cop.bat logs          # View logs
echo   cop.bat stop          # Stop services
echo.
goto end

:end
endlocal
