@echo off
title DEPLOYMENT VERCEL (TRY 2)
color 1F

echo ===================================================
echo   DEPLOYMENT VERCEL (VERSI 2 - LEBIH STABIL)
echo ===================================================
echo.

echo [1/3] Memeriksa instalasi Vercel...
call npm install -g vercel
if %ERRORLEVEL% NEQ 0 (
   echo Gagal install global, mencoba npx...
)

echo.
echo [2/3] Login ke Vercel (PENTING)
echo ---------------------------------------------------
echo 1. Browser akan terbuka.
echo 2. Login pakai akun Anda.
echo 3. JIKA SUDAH LOGIN DI BROWSER, TUTUP TAB DAN KEMBALI KE SINI.
echo ---------------------------------------------------
timeout /t 3
call npx vercel login

echo.
echo [3/3] Mendorong ke Server
echo ---------------------------------------------------
echo JAWAB PERTANYAAN SEPERTI INI:
echo 1. Set up and deploy? [Y] -> ENTER
echo 2. Which scope? [ENTER] -> ENTER
echo 3. Link to existing project? [N] -> ENTER
echo 4. Project Name? [ENTER] -> ENTER
echo 5. Directory? [ENTER] -> ENTER
echo.
echo ---------------------------------------------------
pause
call npx vercel --prod

echo.
echo ===================================================
echo   SELESAI. JIKA ADA ERROR, FOTO DAN KIRIM KE SAYA.
echo ===================================================
pause
