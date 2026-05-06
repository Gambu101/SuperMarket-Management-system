@echo off
echo SuperMarket DB Setup - Windows
echo.

REM Check if MySQL is installed/running
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: MySQL not found in PATH. Install XAMPP/WAMP or MySQL Server.
  echo Download: https://dev.mysql.com/downloads/installer/
  pause
  exit /b 1
)

REM Create .env if missing
if not exist ".env" (
  echo Creating .env...
  echo SECRET_KEY=superSecretJWTKey1234567890ChangeMeProd ^> .env
  echo DB_HOST=localhost ^>^> .env
  echo DB_PORT=3306 ^>^> .env
  echo DB_USER=root ^>^> .env
  echo DB_PASSWORD= ^>^> .env
  echo DB_NAME=superinv ^>^> .env
  echo EMAIL_HOST=smtp.gmail.com ^>^> .env
  echo EMAIL_PORT=587 ^>^> .env
  echo EMAIL_USER=your@gmail.com ^>^> .env
  echo EMAIL_PASS=your_app_password ^>^> .env
)

REM Create database and run setup
echo Creating database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS superinv;"
mysql -u root -p superinv < setup.sql

echo.
echo Setup complete!
echo 1. Edit server/.env with your MySQL password if set
echo 2. node test-db.js to test connection
echo 3. npm start to run server
echo.
pause
