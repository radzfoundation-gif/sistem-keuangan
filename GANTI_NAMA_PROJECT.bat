@echo off
title GANTI NAMA PROJECT VERCEL
color 0B

echo ===================================================
echo   GANTI NAMA PROJECT / URL
echo ===================================================
echo.
echo Menghapus konfigurasi lama (fokasu-beta)...
rmdir /s /q .vercel
echo Konfigurasi dihapus.

echo.
echo ===================================================
echo   PENTING - BACA DULU CARA ISINYA:
echo ===================================================
echo 1. Set up and deploy? [Y] -> ENTER
echo 2. Which scope? [ENTER] -> ENTER
echo 3. Link to existing project? [N] -> KETIK 'n' LALU ENTER (PENTING!)
echo 4. Project Name? -> KETIK: keuangan-dhananjaya Lalu ENTER
echo 5. Directory? [ENTER] -> ENTER
echo.
echo ===================================================
pause
call npx vercel --prod

echo.
echo SELESAI. URL BARU ANDA SEHARUSNYA: keuangan-dhananjaya.vercel.app
pause
