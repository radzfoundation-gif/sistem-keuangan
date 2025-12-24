@echo off
title AUTOMATIC DEPLOYMENT KEUANGAN DHANANJAYA
color 0A

echo ===================================================
echo   OTOMATISASI DEPLOYMENT KE VERCEL
echo ===================================================
echo.

echo [1/4] Memeriksa Status Git...
if not exist .git (
    echo Inisialisasi Git Repository...
    git init
    git add .
    git commit -m "Initial Commit for Deployment"
) else (
    echo Git sudah aktif. Mengupdate perubahan...
    git add .
    git commit -m "Update sebelum deploy"
)

echo.
echo [2/4] Menyiapkan Vercel CLI...
echo Mohon tunggu sebentar...
call npm install -g vercel

echo.
echo [3/4] Login ke Vercel
echo ---------------------------------------------------
echo PENTING:
echo 1. Browser akan terbuka otomatis (atau link muncul).
echo 2. Login dengan akun Vercel Anda (GitHub/Email).
echo 3. Setelah login sukses, kembali ke layar hitam ini.
echo ---------------------------------------------------
timeout /t 5
call vercel login

echo.
echo [4/4] Mulai Deployment
echo ---------------------------------------------------
echo JAWAB PERTANYAAN BERIKUT (Tekan ENTER terus untuk Default):
echo 1. Set up and deploy? [Y] -> ENTER
echo 2. Which scope? [Enter] -> ENTER
echo 3. Link to existing project? [N] -> ENTER
echo 4. Project Name? [keuangan-otomatis] -> ENTER
echo 5. In which directory? [./] -> ENTER
echo.
echo TERAKHIR: Saat ditanya 'Want to modify settings?' [N] -> KETIK 'y' (YES)
echo LALU Masukkan Environment Variables sesuai panduan saya sebelumnya.
echo ---------------------------------------------------
pause
call vercel deploy --prod

echo.
echo ===================================================
echo   DEPLOYMENT SELESAI!
echo ===================================================
pause
