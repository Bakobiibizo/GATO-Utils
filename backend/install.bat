@echo off

REM Installing Python pip and venv
echo Installing python
call sudo apt-get install python3 python3-venv python3-pip
echo Done

REM Upgrading pip
echo Installing pip
call python -m pip install pip --upgrade
echo Done

REM Creating virtual environment
echo Creating virtual environment
call python -m venv .venv
echo Done

REM Activating the virtual environment
echo Activating the virtual environment
call %CD%\.venv\Scripts\activate.bat
echo Done

REM Install the required packages from requirements.txt
echo Installing required packages from requirements.txt
call pip install -r requirements.txt
echo Done

REM Runing app
echo Running app on http://localhost:5000
call python server\app.py
echo Done
