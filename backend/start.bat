@echo off
REM FakeGuard AI — Backend startup (Windows)

setlocal EnableDelayedExpansion
set "SCRIPT_DIR=%~dp0"
REM Remove trailing backslash
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for %%I in ("%SCRIPT_DIR%\..") do set "PROJECT_ROOT=%%~fI"

REM ── Locate virtual environment ─────────────────────────────
REM Priority: backend\venv → project\venv → %USERPROFILE%\ml_env
if exist "%SCRIPT_DIR%\venv\Scripts\activate.bat" (
    set "VENV=%SCRIPT_DIR%\venv"
) else if exist "%PROJECT_ROOT%\venv\Scripts\activate.bat" (
    set "VENV=%PROJECT_ROOT%\venv"
) else if exist "%USERPROFILE%\ml_env\Scripts\activate.bat" (
    set "VENV=%USERPROFILE%\ml_env"
) else (
    echo.
    echo ERROR: No virtual environment found.
    echo Create one with:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r backend\requirements.txt
    echo.
    pause
    exit /b 1
)

call "%VENV%\Scripts\activate.bat"

echo.
echo   FakeGuard AI -- Backend
echo   Virtual env : %VENV%
echo   URL         : http://localhost:8000
echo   API docs    : http://localhost:8000/docs
echo.
echo   NOTE: First startup loads a 112 MB knowledge graph (~30 s)
echo.

cd /d "%SCRIPT_DIR%"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
