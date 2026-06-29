@echo off
title Lifestyle App
echo.
echo ========================================
echo    لایف استایل در حال اجرا...
echo ========================================
echo.

cd /d "%~dp0"

:: Start PostgreSQL if not running
net start postgresql-x64-16 2>nul

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start the app
echo بعد از اجرا، مرورگر را باز کنید:
echo.
echo    کامپیوتر:  http://localhost:3000
echo    گوشی:     http://آیپی-کامپیوتر:3000
echo.
echo برای پیدا کردن آیپی: ipconfig
echo ========================================
echo.

npm start
