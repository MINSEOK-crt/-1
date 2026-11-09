@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node server.mjs 8765 --open
  pause
  exit /b
)
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.mjs 8765 --open
  pause
  exit /b
)
where py >nul 2>nul
if not errorlevel 1 (
  start "" "http://localhost:8765/"
  py -3 -m http.server 8765 --bind localhost --directory dist
  pause
  exit /b
)
where python >nul 2>nul
if not errorlevel 1 (
  start "" "http://localhost:8765/"
  python -m http.server 8765 --bind localhost --directory dist
  pause
  exit /b
)
echo Node.js 또는 Python이 필요합니다. README.md의 실행 안내를 확인하세요.
pause
