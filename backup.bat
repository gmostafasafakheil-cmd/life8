@echo off
echo بکاپ گرفتن از دیتابیس لایف استایل...

set BACKUP_DIR=%~dp0backups
set DATE=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set DATE=%DATE: =0%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

pg_dump -U postgres lifestyle_db > "%BACKUP_DIR%\backup_%DATE%.sql"

echo.
echo بکاپ ذخیره شد: %BACKUP_DIR%\backup_%DATE%.sql
echo.

:: حذف بکاپ‌های قدیمی‌تر از ۳۰ روز
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -30 /c "cmd /c del @path" 2>nul

pause
