@echo off
REM FakeGuard AI — Start backend + frontend together (Windows)

setlocal EnableDelayedExpansion
set "ROOT=%~dp0"
REM Remove trailing backslash
set "ROOT=%ROOT:~0,-1%"

echo.
echo   +--------------------------------------+
echo   ^|      FakeGuard AI -- Starting Up     ^|
echo   +--------------------------------------+
echo.

REM ── Locate virtual environment ────────────────────────────
if exist "%ROOT%\backend\venv\Scripts\activate.bat" (
    set "VENV=%ROOT%\backend\venv"
) else if exist "%ROOT%\venv\Scripts\activate.bat" (
    set "VENV=%ROOT%\venv"
) else if exist "%USERPROFILE%\ml_env\Scripts\activate.bat" (
    set "VENV=%USERPROFILE%\ml_env"
) else (
    echo   ERROR: No virtual environment found.
    echo   Create one with:
    echo     python -m venv venv
    echo     venv\Scripts\activate
    echo     pip install -r backend\requirements.txt
    echo.
    pause
    exit /b 1
)

REM ── Check npm ─────────────────────────────────────────────
where npm >nul 2>&1
if errorlevel 1 (
    echo   ERROR: npm not found.
    echo   Install Node.js ^(v18+^) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM ── Install frontend deps if needed ───────────────────────
if not exist "%ROOT%\frontend\node_modules\" (
    echo   Installing frontend dependencies...
    cd /d "%ROOT%\frontend"
    npm install --silent
)

echo   [1/2] Opening backend  window  --^>  http://localhost:8000
echo   [2/2] Opening frontend window  --^>  http://localhost:5173
echo.
echo   Two console windows will open, one per service.
echo   Close both windows to stop the project.
echo.

REM ── Open backend in a new console window ──────────────────
start "FakeGuard — Backend  (port 8000)" cmd /k ^
  "cd /d "%ROOT%\backend" ^
   && call "%VENV%\Scripts\activate.bat" ^
   && echo. ^
   && echo   Backend running at http://localhost:8000 ^
   && echo   NOTE: First start loads a 112 MB graph (~30 s) ^
   && echo. ^
   && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Small pause so backend binds first
timeout /t 2 /nobreak >nul

REM ── Open frontend in a new console window ─────────────────
start "FakeGuard — Frontend (port 5173)" cmd /k ^
  "cd /d "%ROOT%\frontend" ^
   && echo. ^
   && echo   Frontend running at http://localhost:5173 ^
   && echo. ^
   && npm run dev"

echo   Both windows launched. Press any key to close this launcher.
echo   (The backend and frontend will keep running in their own windows.)
echo.
pause >nul
