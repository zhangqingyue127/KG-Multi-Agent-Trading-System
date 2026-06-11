@echo off
REM Windows batch script to start both React and Flask servers

echo Starting Huluntunzao Application...
echo.

REM Start Flask API server in a new window
echo Starting Flask API server on port 5000...
start cmd /k "cd /d %CD% && python api_server.py"

REM Wait for Flask to start
timeout /t 3 /nobreak

REM Start React development server in a new window
echo Starting React development server on port 3000...
start cmd /k "cd /d %CD% && npm start"

echo.
echo Both servers are starting...
echo React: http://localhost:3000
echo Flask API: http://localhost:5000
echo.
pause
