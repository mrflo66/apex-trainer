@echo off
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js n'est pas installe. Telecharge-le sur https://nodejs.org puis relance ce fichier.
  pause
  exit /b
)
call npm install
call npm run dist
echo.
echo Termine ! Ton installateur est dans le dossier "dist".
pause
