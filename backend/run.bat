@echo off

REM Activating the virtual environment
echo Activating the virtual environment
call %CD%\.venv\Scripts\activate.bat
echo Done

REM Runing app
echo Running app on http://localhost:5000
call python server\app.py
echo Done