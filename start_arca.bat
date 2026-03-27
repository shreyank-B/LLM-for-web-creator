@echo off
title ARCA AI Website Generator
echo Starting ARCA Backend Proxy Server...
start "ARCA Proxy Server" cmd /c "node proxy.js & pause"

echo Opening ARCA UI in the default browser...
timeout /t 2 /nobreak >nul
start index.html

echo Done! You can safely close this window.
exit
