@echo off
start "" python -m http.server 8008

timeout /t 1 > nul

start "" "http://localhost:8007/index.html"
