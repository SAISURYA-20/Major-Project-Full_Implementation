@echo off
REM Suppress specific deprecation warnings while running npm start
setlocal enabledelayedexpansion
set NODE_OPTIONS=--no-deprecation
npm start
