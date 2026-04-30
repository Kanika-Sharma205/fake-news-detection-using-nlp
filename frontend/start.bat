@echo off
REM FakeGuard AI — Frontend startup (Windows)

setlocal EnableDelayedExpansion
set "SCRIPT_DIR=%~dp0"
REM Remove trailing backslash
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM ── Check npm is available ─────────────────────────────────
where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: npm not found.
    echo Install Node.js ^(v18+^) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

cd /d "%SCRIPT_DIR%"

if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
)

echo.
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('npm --version')  do set NPM_VER=%%v
echo   FakeGuard AI -- Frontend
echo   Node : %NODE_VER%   npm : %NPM_VER%
echo   URL  : http://localhost:5173
echo.

npm run dev
